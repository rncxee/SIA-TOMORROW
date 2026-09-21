/* ============================================================
   SEEDS.JS
   ------------------------------------------------------------
   1. Load and render the seed inventory table
   2. Handle adding a new seed entry
   3. Handle updating a seed's quantity inline
   ============================================================ */

let seedsData = [];

const FALLBACK_SEEDS = [
    { seed_id: 1, seed_name: "Red Creole Onion Seeds", crop_type: "Onion", quantity_grams: 350, low_stock_threshold: 100 },
    { seed_id: 2, seed_name: "Yellow Granex Onion Seeds", crop_type: "Onion", quantity_grams: 80, low_stock_threshold: 100 },
    { seed_id: 3, seed_name: "IR64 Rice Seeds", crop_type: "Rice", quantity_grams: 500, low_stock_threshold: 150 },
    { seed_id: 4, seed_name: "NSIC Rc222 Rice Seeds", crop_type: "Rice", quantity_grams: 120, low_stock_threshold: 150 }
];

document.addEventListener("DOMContentLoaded", () => {
    loadSeeds();
    document.getElementById("add-seed-form").addEventListener("submit", handleAddSeed);
});

async function loadSeeds() {
    try {
        const response = await fetch("php/seeds/get_seeds.php");
        if (!response.ok) throw new Error("Server error");
        seedsData = (await response.json()).seeds;
    } catch (error) {
        console.log("Using sample data (database not reachable):", error.message);
        seedsData = FALLBACK_SEEDS;
    }
    renderSeeds();
}

function renderSeeds() {
    const tbody = document.getElementById("seeds-body");
    if (seedsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-note">No seed inventory yet. Add one above.</td></tr>';
        return;
    }
    tbody.innerHTML = seedsData.map((seed, index) => {
        const low = parseFloat(seed.quantity_grams) <= parseFloat(seed.low_stock_threshold);
        return `
            <tr>
                <td>${seed.seed_name}</td>
                <td><span class="pill pill--${seed.crop_type.toLowerCase()}">${seed.crop_type}</span></td>
                <td><input type="number" step="0.01" min="0" value="${seed.quantity_grams}" id="qty-${index}" style="width:90px;"></td>
                <td>${seed.low_stock_threshold}</td>
                <td>${low ? '<span class="pill pill--amber">Low</span>' : '<span class="pill pill--green">OK</span>'}</td>
                <td><button class="btn-small" onclick="saveQuantity(${index})">💾 Save</button></td>
            </tr>
        `;
    }).join("");
}

async function handleAddSeed(event) {
    event.preventDefault();
    const messageEl = document.getElementById("add-seed-message");
    const formData = new FormData(event.target);

    try {
        const response = await fetch("php/seeds/add_seed.php", { method: "POST", body: formData });
        const result = await response.json();
        if (result.success) {
            messageEl.textContent = "Seed added.";
            messageEl.className = "form-message success";
            event.target.reset();
            loadSeeds();
        } else {
            messageEl.textContent = result.message || "Something went wrong.";
            messageEl.className = "form-message error";
        }
    } catch (error) {
        messageEl.textContent = "Couldn't reach the database. (This needs XAMPP running — see README.)";
        messageEl.className = "form-message error";
    }
}

async function saveQuantity(index) {
    const seed = seedsData[index];
    const newQty = document.getElementById(`qty-${index}`).value;

    const formData = new FormData();
    formData.append("seed_id", seed.seed_id);
    formData.append("quantity_grams", newQty);

    try {
        const response = await fetch("php/seeds/update_seed.php", { method: "POST", body: formData });
        const result = await response.json();
        if (result.success) {
            loadSeeds();
        } else {
            alert(result.message || "Couldn't save the new quantity.");
        }
    } catch (error) {
        alert("Couldn't reach the database. (This needs XAMPP running — see README.)");
    }
}
