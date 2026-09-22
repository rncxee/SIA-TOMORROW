shell(
    'Seed Inventory',
    'Track seed stock by type and get a heads-up when something runs low.',
    `
        <section class="card">
            <h2>Add a Seed Entry</h2>

            <form id="seedForm" class="form-row">
                <label>
                    Seed Name
                    <input
                        name="seed_name"
                        placeholder="e.g. Red Creole Onion Seeds"
                        required
                    >
                </label>

                <label>
                    Crop Type
                    <select name="crop_type">
                        <option>Onion</option>
                        <option>Rice</option>
                    </select>
                </label>

                <label>
                    Quantity (g)
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="quantity_g"
                        placeholder="e.g. 300"
                        required
                    >
                </label>

                <label>
                    Low-Stock Threshold (g)
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="threshold_g"
                        placeholder="e.g. 100"
                        required
                    >
                </label>

                <button>＋ Add Seed</button>
            </form>
        </section>

        <section class="card">
            <h2>Current Inventory</h2>

            <p>
                Update the quantity after distributing or restocking,
                then click Save.
            </p>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Seed Name</th>
                            <th>Crop Type</th>
                            <th>Quantity (g)</th>
                            <th>Threshold (g)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody id="seedBody"></tbody>
                </table>
            </div>
        </section>
    `
);

async function load() {
    try {
        const d = await api('get_seeds.php');

        document.getElementById('seedBody').innerHTML =
            d.seeds.map(s => `
                <tr>
                    <td>${esc(s.seed_name)}</td>

                    <td>
                        ${cropBadge(s.crop_type)}
                    </td>

                    <td>
                        <input
                            class="cell-input qty"
                            value="${s.quantity_g}"
                            data-id="${s.id}"
                        >
                    </td>

                    <td>
                        ${Number(s.threshold_g).toLocaleString()}
                    </td>

                    <td>
                        <span class="badge ${s.low_stock ? 'low' : 'done'}">
                            ${s.low_stock ? 'Low' : 'OK'}
                        </span>
                    </td>

                    <td>
                        <button
                            class="small"
                            onclick="saveSeed(${s.id},this)"
                        >
                            💾 Save
                        </button>

                        <button
                            class="small danger"
                            onclick="delSeed(${s.id})"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            `).join('');

    } catch (e) {
        toast(e.message, true);
    }
}

document
    .getElementById('seedForm')
    .addEventListener('submit', async e => {
        e.preventDefault();

        try {
            await post(
                'add_seed.php',
                Object.fromEntries(new FormData(e.target))
            );

            toast('Seed added.');
            e.target.reset();
            load();

        } catch (x) {
            toast(x.message, true);
        }
    });

window.saveSeed = async (id, b) => {
    const input = b
        .closest('tr')
        .querySelector('.qty');

    try {
        await post('update_seed.php', {
            id,
            quantity_g: input.value,
            threshold_g: b
                .closest('tr')
                .children[3]
                .textContent
                .replace(/,/g, '')
        });

        toast('Seed inventory updated.');
        load();

    } catch (e) {
        toast(e.message, true);
    }
};

window.delSeed = async id => {
    if (!confirm('Delete this seed entry?')) return;

    try {
        await post('delete_seed.php', { id });

        toast('Seed deleted.');
        load();

    } catch (e) {
        toast(e.message, true);
    }
};

load();