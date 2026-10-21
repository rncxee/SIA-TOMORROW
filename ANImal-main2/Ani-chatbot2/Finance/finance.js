/* Farm Finance page (needs core.js + layout.js; markup is in finance.html) */

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

const financeForm = document.getElementById('financeForm');
const categoryInput = document.getElementById('financeCategory');
const categoryHolder = document.getElementById('financeCategories');
const financeBody = document.getElementById('financeBody');

function money(value) {
    return '₱' + Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function currentType() {
    return financeForm.querySelector('input[name="transaction_type"]:checked')?.value || 'Expense';
}

/* ---------- Category chips ---------- */

function selectCategory(name) {
    categoryInput.value = name;
    categoryHolder.querySelectorAll('.finance-category').forEach(chip => {
        chip.classList.toggle('selected', chip.dataset.category === name);
    });
}

function renderCategories() {
    const type = currentType();
    const categories = type === 'Income' ? incomeCategories : expenseCategories;

    document.getElementById('financeCategoryLabel').textContent =
        type === 'Income' ? 'Income Category' : 'Expense Category';

    render(categoryHolder, categories.map(([icon, name]) => {
        const chip = fill(cloneTemplate('tpl-category-chip'), { icon, name });
        chip.dataset.category = name;
        return chip;
    }));

    selectCategory(categories[0][1]);

    financeForm.querySelector('.expense-choice').classList.toggle('active', type === 'Expense');
    financeForm.querySelector('.income-choice').classList.toggle('active', type === 'Income');
}

categoryHolder.addEventListener('click', e => {
    const chip = e.target.closest('.finance-category');
    if (chip) selectCategory(chip.dataset.category);
});

financeForm.querySelectorAll('input[name="transaction_type"]').forEach(input => {
    input.addEventListener('change', renderCategories);
});

/* ---------- Summary + history ---------- */

function financeRow(x) {
    const kind = x.transaction_type.toLowerCase();       // "income" | "expense"
    const sign = kind === 'income' ? '+' : '-';

    const row = fill(cloneTemplate('tpl-finance-row'), {
        date: x.transaction_date,
        plot: x.plot_name,
        type: kind === 'income' ? '↑ Income' : '↓ Expense',
        category: x.category,
        amount: sign + money(x.amount),
        notes: x.notes || '—'
    });

    row.dataset.id = x.id;
    row.querySelector('.finance-type').classList.add(kind);
    row.querySelector('.finance-amount').classList.add(kind);
    return row;
}

async function loadFinance() {
    try {
        const [plotsResponse, financeResponse] = await Promise.all([
            api('Plots/get_plots.php'),
            api('Finance/get_finance.php')
        ]);

        fillPlotSelect(
            document.getElementById('financePlot'),
            plotsResponse.plots,
            plotsResponse.plots.length ? 'Select a plot' : 'No rice plots available'
        );

        const { summary, transactions } = financeResponse;

        document.getElementById('totalExpenses').textContent = money(summary.expenses);
        document.getElementById('totalRevenue').textContent = money(summary.revenue);

        const net = document.getElementById('netProfit');
        net.textContent = money(summary.net);
        net.classList.toggle('loss', Number(summary.net) < 0);

        render(
            financeBody,
            transactions.length
                ? transactions.map(financeRow)
                : [cloneTemplate('tpl-finance-empty')]
        );

        setDefaultDates();
    } catch (e) {
        toast(e.message, true);
    }
}

/* ---------- Form ---------- */

function resetFinanceForm() {
    financeForm.reset();
    financeForm.querySelector('input[name="transaction_type"][value="Expense"]').checked = true;
    renderCategories();
    setDefaultDates();
}

financeForm.addEventListener('submit', async e => {
    e.preventDefault();

    try {
        await post('Finance/add_finance.php', Object.fromEntries(new FormData(financeForm)));
        toast('Farm transaction added.');
        resetFinanceForm();
        loadFinance();
    } catch (x) {
        toast(x.message, true);
    }
});

document.getElementById('resetFinance').addEventListener('click', () => {
    resetFinanceForm();
    toast('Form cleared.');
});

/* ---------- Delete ---------- */

financeBody.addEventListener('click', async e => {
    const button = e.target.closest('button[data-action="delete"]');
    if (!button) return;

    if (!confirm('Delete this farm transaction?')) return;

    try {
        await post('Finance/delete_finance.php', { id: button.closest('tr').dataset.id });
        toast('Transaction deleted.');
        loadFinance();
    } catch (err) {
        toast(err.message, true);
    }
});

renderCategories();
loadFinance();
