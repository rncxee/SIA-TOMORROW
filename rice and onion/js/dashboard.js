/* ============================================================
   SCRIPT.JS — Dashboard page logic
   ------------------------------------------------------------
   1. Tries to load real data from php/get_dashboard_data.php
   2. Falls back to sample data if that fails (e.g. you're just
      viewing the file directly, with no XAMPP server running)
   3. Renders stat cards, the plot grid, today's tasks, recent
      harvests, and seed inventory
   ============================================================ */

document.addEventListener("DOMContentLoaded", loadDashboard);

const FALLBACK_DATA = {
    stats: { onion_plots: 3, rice_plots: 3, tasks_due_today: 2, recent_harvests: 2 },
    plots: [
        { plot_name: "Plot A1", crop_type: "Onion", status: "Occupied", variety_name: "Red Creole Onion" },
        { plot_name: "Plot A2", crop_type: "Rice",  status: "Occupied", variety_name: "IR64 Rice" },
    ],
    tasks: [
        { plot_name: "Plot A1", crop_type: "Onion", is_done: 0 },
        { plot_name: "Plot A2", crop_type: "Rice", is_done: 0 },
    ],
    harvests: [
        { plot_name: "Plot A2", crop_type: "Rice", harvest_date: "2026-09-14", quantity_kg: 45.0 },
        { plot_name: "Plot A1", crop_type: "Onion", harvest_date: "2026-09-10", quantity_kg: 12.5 }
    ],
    seeds: [
        { seed_name: "Red Creole Onion Seeds", crop_type: "Onion", quantity_grams: 350, low_stock_threshold: 100 },
        { seed_name: "Yellow Granex Onion Seeds", crop_type: "Onion", quantity_grams: 80, low_stock_threshold: 100 },
        { seed_name: "IR64 Rice Seeds", crop_type: "Rice", quantity_grams: 500, low_stock_threshold: 150 },
        { seed_name: "NSIC Rc222 Rice Seeds", crop_type: "Rice", quantity_grams: 120, low_stock_threshold: 150 }
    ]
};

async function loadDashboard() {
    try {
        const response = await fetch("php/get_dashboard_data.php");
        if (!response.ok) throw new Error("Server responded with an error");
        const data = await response.json();
        renderAll(data);
    } catch (error) {
        console.log("Using sample data (database not reachable):", error.message);
        renderAll(FALLBACK_DATA);
    }
}

function renderAll(data) {
    renderStats(data.stats);
    renderPlotGrid(data.plots);
    renderTasks(data.tasks);
    renderHarvests(data.harvests);
    renderSeeds(data.seeds);
}

function renderStats(stats) {
    document.getElementById("stat-onion").textContent = stats.onion_plots;
    document.getElementById("stat-rice").textContent = stats.rice_plots;
    document.getElementById("stat-tasks").textContent = stats.tasks_due_today;
    document.getElementById("stat-harvests").textContent = stats.recent_harvests;
}

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

function renderTasks(tasks) {
    const list = document.getElementById("task-list");
    if (tasks.length === 0) {
        list.innerHTML = '<li><p class="empty-note">No watering tasks due today.</p></li>';
        return;
    }
    list.innerHTML = tasks.map(task => {
        const nameClass = task.is_done == 1 ? "task-list__name done" : "task-list__name";
        return `
            <li>
                <span class="${nameClass}">Water ${task.plot_name} (${task.crop_type})</span>
                ${task.is_done == 1 ? '<span class="pill pill--green">Done</span>' : '<span class="pill pill--amber">Pending</span>'}
            </li>
        `;
    }).join("");
}

function renderHarvests(harvests) {
    const list = document.getElementById("harvest-list");
    if (harvests.length === 0) {
        list.innerHTML = '<li><p class="empty-note">No harvests logged yet.</p></li>';
        return;
    }
    list.innerHTML = harvests.map(h => `
        <li>
            <span>${h.plot_name} (${h.crop_type}) — ${h.harvest_date}</span>
            <strong>${h.quantity_kg} kg</strong>
        </li>
    `).join("");
}

function renderSeeds(seeds) {
    const container = document.getElementById("seed-list");
    if (seeds.length === 0) {
        container.innerHTML = '<p class="empty-note">No seed inventory recorded yet.</p>';
        return;
    }
    container.innerHTML = seeds.map(seed => {
        const low = parseFloat(seed.quantity_grams) <= parseFloat(seed.low_stock_threshold);
        return `
            <div class="seed-row">
                <span>${seed.seed_name}</span>
                <span class="seed-row__qty">
                    ${seed.quantity_grams}g
                    ${low ? '<span class="pill pill--amber">Low</span>' : ''}
                </span>
            </div>
        `;
    }).join("");
}
