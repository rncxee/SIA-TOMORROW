shell(
    'Farm Finance',
    'Record farm expenses and harvest sales to calculate your net profit or loss.',
    `
        <section class="finance-summary">
            <div class="finance-stat expense-stat">
                <div class="finance-stat-icon">💸</div>
                <div>
                    <small>Total Expenses</small>
                    <strong id="totalExpenses">₱0.00</strong>
                </div>
            </div>

            <div class="finance-stat income-stat">
                <div class="finance-stat-icon">💰</div>
                <div>
                    <small>Total Revenue</small>
                    <strong id="totalRevenue">₱0.00</strong>
                </div>
            </div>
        </section>

        <section class="finance-net-card">
            <span>Net Profit / Loss</span>
            <strong id="netProfit">₱0.00</strong>
        </section>

        <section class="card finance-form-card">
            <h2>Add Farm Transaction</h2>
            <p>Record an expense or harvest income.</p>

            <form id="financeForm" class="finance-form">
                <div class="finance-field full">
                    <label>Transaction Type</label>
                    <div class="finance-type-toggle">
                        <label class="finance-radio expense-choice active">
                            <input type="radio" name="transaction_type" value="Expense" checked>
                            <span>💸 Expense</span>
                        </label>

                        <label class="finance-radio income-choice">
                            <input type="radio" name="transaction_type" value="Income">
                            <span>💰 Income</span>
                        </label>
                    </div>
                </div>

                <div class="finance-field">
                    <label for="financePlot">Plot</label>
                    <select name="plot_id" id="financePlot" required>
                        <option value="">Loading plots...</option>
                    </select>
                </div>

                <div class="finance-field">
                    <label for="financeDate">Transaction Date</label>
                    <input type="date" name="transaction_date" id="financeDate" required>
                </div>

                <div class="finance-field full">
                    <label id="financeCategoryLabel">Expense Category</label>
                    <div id="financeCategories" class="finance-category-list"></div>
                    <input type="hidden" name="category" id="financeCategory" value="Seed">
                </div>

                <div class="finance-field full">
                    <label for="financeAmount">Amount (₱)</label>
                    <input
                        type="number"
                        name="amount"
                        id="financeAmount"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter amount"
                        required
                    >
                </div>

                <div class="finance-field full">
                    <label for="financeNotes">Notes</label>
                    <textarea
                        name="notes"
                        id="financeNotes"
                        placeholder="Add notes about this transaction..."
                    ></textarea>
                </div>

                <div class="finance-actions full">
                    <button type="submit">＋ Add Transaction</button>
                    <button type="button" class="finance-reset" id="resetFinance">↻ Reset Finance</button>
                </div>
            </form>
        </section>

        <section class="card finance-history-card">
            <h2>Transaction History</h2>
            <p>Your recorded farm expenses and income.</p>

            <div class="table-wrap">
                <table class="finance-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Plot</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="financeBody"></tbody>
                </table>
            </div>
        </section>
    `
);

const expenseCategories = [
    ['🌱', 'Seed'],
    ['🧪', 'Fertilizer'],
    ['🧴', 'Pesticide'],
    ['👷', 'Labor'],
    ['⛽', 'Fuel'],
    ['📦', 'Other']
];

const incomeCategories = [
    ['🌾', 'Harvest Sale'],
    ['💵', 'Other Income']
];

function money(value) {
    return '₱' + Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function currentType() {
    return document.querySelector('input[name="transaction_type"]:checked')?.value || 'Expense';
}

function renderCategories() {
    const type = currentType();
    const categories = type === 'Income' ? incomeCategories : expenseCategories;
    const categoryInput = document.getElementById('financeCategory');
    const label = document.getElementById('financeCategoryLabel');
    const holder = document.getElementById('financeCategories');

    label.textContent = type === 'Income' ? 'Income Category' : 'Expense Category';
    categoryInput.value = categories[0][1];

    holder.innerHTML = categories.map(([icon, name], index) => `
        <button
            type="button"
            class="finance-category ${index === 0 ? 'selected' : ''}"
            data-category="${esc(name)}"
        >
            <span>${icon}</span> ${esc(name)}
        </button>
    `).join('');

    holder.querySelectorAll('.finance-category').forEach(button => {
        button.addEventListener('click', () => {
            holder.querySelectorAll('.finance-category').forEach(x => x.classList.remove('selected'));
            button.classList.add('selected');
            categoryInput.value = button.dataset.category;
        });
    });

    document.querySelector('.expense-choice').classList.toggle('active', type === 'Expense');
    document.querySelector('.income-choice').classList.toggle('active', type === 'Income');
}

async function loadFinance() {
    try {
        const [plotsResponse, financeResponse] = await Promise.all([
            api('get_plots.php'),
            api('get_finance.php')
        ]);

        const plotSelect = document.getElementById('financePlot');
        plotSelect.innerHTML = plotsResponse.plots.length
            ? `<option value="">Select a plot</option>${plotOptions(plotsResponse.plots)}`
            : '<option value="">No rice plots available</option>';

        document.getElementById('totalExpenses').textContent = money(financeResponse.summary.expenses);
        document.getElementById('totalRevenue').textContent = money(financeResponse.summary.revenue);
        document.getElementById('netProfit').textContent = money(financeResponse.summary.net);
        document.getElementById('netProfit').classList.toggle('loss', Number(financeResponse.summary.net) < 0);

        const body = document.getElementById('financeBody');

        body.innerHTML = financeResponse.transactions.length
            ? financeResponse.transactions.map(x => `
                <tr>
                    <td>${esc(x.transaction_date)}</td>
                    <td>${esc(x.plot_name)}</td>
                    <td>
                        <span class="finance-type ${x.transaction_type.toLowerCase()}">
                            ${x.transaction_type === 'Income' ? '↑ Income' : '↓ Expense'}
                        </span>
                    </td>
                    <td>${esc(x.category)}</td>
                    <td class="finance-amount ${x.transaction_type.toLowerCase()}">
                        ${x.transaction_type === 'Income' ? '+' : '-'}${money(x.amount)}
                    </td>
                    <td>${esc(x.notes || '—')}</td>
                    <td>
                        <button class="small danger" onclick="deleteFinance(${x.id})">Delete</button>
                    </td>
                </tr>
            `).join('')
            : `
                <tr>
                    <td colspan="7" class="finance-empty">
                        No transactions recorded yet.
                    </td>
                </tr>
            `;

    } catch (e) {
        toast(e.message, true);
    }
}

document.querySelectorAll('input[name="transaction_type"]').forEach(input => {
    input.addEventListener('change', renderCategories);
});

document.getElementById('financeForm').addEventListener('submit', async e => {
    e.preventDefault();

    try {
        await post(
            'add_finance.php',
            Object.fromEntries(new FormData(e.target))
        );

        toast('Farm transaction added.');
        e.target.reset();
        document.querySelector('input[name="transaction_type"][value="Expense"]').checked = true;
        document.getElementById('financeCategory').value = 'Seed';
        renderCategories();
        loadFinance();
    } catch (x) {
        toast(x.message, true);
    }
});

document.getElementById('resetFinance').addEventListener('click', () => {
    const form = document.getElementById('financeForm');
    form.reset();
    document.querySelector('input[name="transaction_type"][value="Expense"]').checked = true;
    renderCategories();
    toast('Finance form reset.');
});

window.deleteFinance = async id => {
    if (!confirm('Delete this farm transaction?')) return;

    try {
        await post('delete_finance.php', { id });
        toast('Transaction deleted.');
        loadFinance();
    } catch (e) {
        toast(e.message, true);
    }
};

renderCategories();
loadFinance();
