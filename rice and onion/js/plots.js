/* ============================================================
   PLOTS.JS
   ------------------------------------------------------------
   1. Load and render the plots table
   2. Handle the "Add Plot" form
   3. Handle inline Save (edit) per row
   4. Handle the expandable "Plants" row (view + add planting)
   ============================================================ */

let plotsData = []; // keeps the latest loaded plots so buttons can look up by id

const FALLBACK_PLOTS = [
    { plot_id: 1, plot_name: "Plot A1", crop_type: "Onion", status: "Occupied", variety_name: "Red Creole Onion", date_planted: "2026-08-01", expected_harvest: "2026-11-01" },
    { plot_id: 2, plot_name: "Plot A2", crop_type: "Rice",  status: "Occupied", variety_name: "IR64 Rice", date_planted: "2026-07-15", expected_harvest: "2026-11-15" },
];

document.addEventListener("DOMContentLoaded", () => {
    loadPlots();
    document.getElementById("add-plot-form").addEventListener("submit", handleAddPlot);
});

/* ---------- LOAD + RENDER ---------- */


/* plot overview */
function renderPlotGrid(plots) {
    const container = document.getElementById("plot-grid");
    if (plots.length === 0) {
        container.innerHTML = '<p class="empty-note">No plots yet. Add one on the Plots page.</p>';
        return;
    }
    container.innerHTML = plots.map(plot => {
        const statusClass = plot.status.toLowerCase(); // "occupied" or "available"
        const cropClass = plot.crop_type.toLowerCase(); // "onion" or "rice"
        return `
            <div class="plot-tile plot-tile--${statusClass}">
                <div class="plot-tile__name">${plot.plot_name}</div>
                <div class="plot-tile__crop">${plot.variety_name ? plot.variety_name : "No planting recorded"}</div>
                <span class="pill pill--${cropClass}">${plot.crop_type}</span>
                <span class="pill pill--${statusClass === "occupied" ? "green" : "amber"}">${plot.status}</span>
            </div>
        `;
    }).join("");
}

async function loadPlots() {
    try {
        const response = await fetch("php/plots/get_plots.php");
        if (!response.ok) throw new Error("Server error");
        const data = await response.json();
        plotsData = data.plots;
    } catch (error) {
        console.log("Using sample data (database not reachable):", error.message);
        plotsData = FALLBACK_PLOTS;
    }
    renderPlotsTable();
    renderPlotGrid(plotsData);
}

function renderPlotsTable() {
    const tbody = document.getElementById("plots-body");

    if (plotsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-note">No plots yet. Add one above.</td></tr>';
        return;
    }

    tbody.innerHTML = plotsData.map((plot, index) => `
        <tr>
            <td><input type="text" value="${plot.plot_name}" id="name-${index}"></td>
            <td>
                <select id="crop-${index}">
                    <option value="Onion" ${plot.crop_type === "Onion" ? "selected" : ""}>Onion</option>
                    <option value="Rice" ${plot.crop_type === "Rice" ? "selected" : ""}>Rice</option>
                </select>
            </td>
            <td>
                <select id="status-${index}">
                    <option value="Available" ${plot.status === "Available" ? "selected" : ""}>Available</option>
                    <option value="Occupied" ${plot.status === "Occupied" ? "selected" : ""}>Occupied</option>
                </select>
            </td>
            <td>${plot.variety_name ? plot.variety_name : '<span class="empty-note">None</span>'}</td>
            <td style="white-space:nowrap;">
                <button class="btn-small" onclick="savePlot(${index})">💾 Save</button>
                <button class="btn-small" onclick="togglePlantingRow(${index})">🌱 Plants</button>
            </td>
        </tr>
        <tr class="planting-subrow" id="planting-row-${index}" style="display:none;">
            <td colspan="5">
                <div id="planting-details-${index}"></div>
                <form class="form-row" onsubmit="return handleAddPlanting(event, ${index})">
                    <div class="form-field">
                        <label>Variety Name</label>
                        <input type="text" id="variety-${index}" placeholder="e.g. Red Creole Onion" required>
                    </div>
                    <div class="form-field">
                        <label>Date Planted</label>
                        <input type="date" id="planted-${index}">
                    </div>
                    <div class="form-field">
                        <label>Expected Harvest</label>
                        <input type="date" id="harvest-${index}">
                    </div>
                    <button type="submit" class="btn btn-primary">🌱 Set Current Planting</button>
                </form>
            </td>
        </tr>
    `).join("");
}

/* ---------- ADD PLOT ---------- */

async function handleAddPlot(event) {
    event.preventDefault();
    const messageEl = document.getElementById("add-plot-message");
    const formData = new FormData(event.target);

    try {
        const response = await fetch("php/plots/add_plot.php", { method: "POST", body: formData });
        const result = await response.json();

        if (result.success) {
            messageEl.textContent = "Plot added.";
            messageEl.className = "form-message success";
            event.target.reset();
            loadPlots(); // refresh the table
        } else {
            messageEl.textContent = result.message || "Something went wrong.";
            messageEl.className = "form-message error";
        }
    } catch (error) {
        messageEl.textContent = "Couldn't reach the database. (This form needs XAMPP running — see README.)";
        messageEl.className = "form-message error";
    }
}

/* ---------- SAVE (EDIT) PLOT ---------- */

async function savePlot(index) {
    const plot = plotsData[index];
    const formData = new FormData();
    formData.append("plot_id", plot.plot_id);
    formData.append("plot_name", document.getElementById(`name-${index}`).value);
    formData.append("crop_type", document.getElementById(`crop-${index}`).value);
    formData.append("status", document.getElementById(`status-${index}`).value);

    try {
        const response = await fetch("php/plots/update_plot.php", { method: "POST", body: formData });
        const result = await response.json();
        if (result.success) {
            loadPlots();
        } else {
            alert(result.message || "Couldn't save changes.");
        }
    } catch (error) {
        alert("Couldn't reach the database. (This needs XAMPP running — see README.)");
    }
}

/* ---------- VIEW / ADD PLANTING ---------- */

function togglePlantingRow(index) {
    const row = document.getElementById(`planting-row-${index}`);
    const isHidden = row.style.display === "none";
    row.style.display = isHidden ? "table-row" : "none";

    if (isHidden) {
        const plot = plotsData[index];
        const details = document.getElementById(`planting-details-${index}`);
        details.innerHTML = plot.variety_name
            ? `<p><strong>Currently planted:</strong> ${plot.variety_name} — planted ${plot.date_planted || "?"}, expected harvest ${plot.expected_harvest || "?"}</p>`
            : `<p class="empty-note">Nothing currently planted in this plot.</p>`;
    }
}

async function handleAddPlanting(event, index) {
    event.preventDefault();
    const plot = plotsData[index];

    const formData = new FormData();
    formData.append("plot_id", plot.plot_id);
    formData.append("variety_name", document.getElementById(`variety-${index}`).value);
    formData.append("date_planted", document.getElementById(`planted-${index}`).value);
    formData.append("expected_harvest", document.getElementById(`harvest-${index}`).value);

    try {
        const response = await fetch("php/plots/add_planting.php", { method: "POST", body: formData });
        const result = await response.json();
        if (result.success) {
            loadPlots();
        } else {
            alert(result.message || "Couldn't save the planting.");
        }
    } catch (error) {
        alert("Couldn't reach the database. (This needs XAMPP running — see README.)");
    }

    return false;
}
