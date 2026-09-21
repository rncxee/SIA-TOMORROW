/* ============================================================
   HARVEST.JS
   ------------------------------------------------------------
   1. Load the plot dropdown
   2. Load and render harvest history
   3. Handle logging a new harvest
   ============================================================ */

const FALLBACK_PLOTS_FOR_DROPDOWN = [
    { plot_id: 1, plot_name: "Plot A1", crop_type: "Onion" },
    { plot_id: 2, plot_name: "Plot A2", crop_type: "Rice" },
];

const FALLBACK_HARVESTS = [
    { harvest_id: 1, harvest_date: "2026-09-14", quantity_kg: 45.0, notes: "First rice harvest of the season", plot_name: "Plot A2", crop_type: "Rice" },
    { harvest_id: 2, harvest_date: "2026-09-10", quantity_kg: 12.5, notes: "Onion bulbs, good size", plot_name: "Plot A1", crop_type: "Onion" }
];

document.addEventListener("DOMContentLoaded", () => {
    loadPlotDropdown();
    loadHarvests();
    document.getElementById("add-harvest-form").addEventListener("submit", handleAddHarvest);
    document.getElementById("harvest_date").value = new Date().toISOString().split("T")[0];
});

async function loadPlotDropdown() {
    let plots;
    try {
        const response = await fetch("php/plots/get_plots.php");
        if (!response.ok) throw new Error("Server error");
        plots = (await response.json()).plots;
    } catch (error) {
        plots = FALLBACK_PLOTS_FOR_DROPDOWN;
    }
    const select = document.getElementById("plot_id");
    select.innerHTML = plots.map(p => `<option value="${p.plot_id}">${p.plot_name} (${p.crop_type})</option>`).join("");
}

async function loadHarvests() {
    let harvests;
    try {
        const response = await fetch("php/harvest/get_harvests.php");
        if (!response.ok) throw new Error("Server error");
        harvests = (await response.json()).harvests;
    } catch (error) {
        console.log("Using sample data (database not reachable):", error.message);
        harvests = FALLBACK_HARVESTS;
    }
    renderHarvests(harvests);
}

function renderHarvests(harvests) {
    const tbody = document.getElementById("harvest-body");
    if (harvests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-note">No harvests logged yet.</td></tr>';
        return;
    }
    tbody.innerHTML = harvests.map(h => `
        <tr>
            <td>${h.harvest_date}</td>
            <td>${h.plot_name}</td>
            <td><span class="pill pill--${h.crop_type.toLowerCase()}">${h.crop_type}</span></td>
            <td>${h.quantity_kg} kg</td>
            <td>${h.notes || '<span class="empty-note">—</span>'}</td>
        </tr>
    `).join("");
}

async function handleAddHarvest(event) {
    event.preventDefault();
    const messageEl = document.getElementById("add-harvest-message");
    const formData = new FormData(event.target);

    try {
        const response = await fetch("php/harvest/add_harvest.php", { method: "POST", body: formData });
        const result = await response.json();
        if (result.success) {
            messageEl.textContent = "Harvest logged.";
            messageEl.className = "form-message success";
            event.target.reset();
            document.getElementById("harvest_date").value = new Date().toISOString().split("T")[0];
            loadHarvests();
        } else {
            messageEl.textContent = result.message || "Something went wrong.";
            messageEl.className = "form-message error";
        }
    } catch (error) {
        messageEl.textContent = "Couldn't reach the database. (This needs XAMPP running — see README.)";
        messageEl.className = "form-message error";
    }
}
