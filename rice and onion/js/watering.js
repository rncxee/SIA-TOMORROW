/* ============================================================
   WATERING.JS
   ------------------------------------------------------------
   1. Load the plot dropdown (for the Add Task form)
   2. Load and render the tasks table
   3. Handle adding a task
   4. Handle the Done checkbox
   ============================================================ */

const FALLBACK_PLOTS_FOR_DROPDOWN = [
    { plot_id: 1, plot_name: "Plot A1", crop_type: "Onion" },
    { plot_id: 2, plot_name: "Plot A2", crop_type: "Rice" }
];

const FALLBACK_TASKS = [
    { task_id: 1, task_date: "2026-09-20", is_done: 0, plot_name: "Plot A1", crop_type: "Onion" },
    { task_id: 2, task_date: "2026-09-20", is_done: 0, plot_name: "Plot A2", crop_type: "Rice" }
];

document.addEventListener("DOMContentLoaded", () => {
    loadPlotDropdown();
    loadTasks();
    document.getElementById("add-task-form").addEventListener("submit", handleAddTask);
    // Default the date field to today, so the form is one less thing to fill in
    document.getElementById("task_date").value = new Date().toISOString().split("T")[0];
});

/* ---------- PLOT DROPDOWN ---------- */

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

/* ---------- TASK LIST ---------- */

async function loadTasks() {
    let tasks;
    try {
        const response = await fetch("php/tasks/get_tasks.php");
        if (!response.ok) throw new Error("Server error");
        tasks = (await response.json()).tasks;
    } catch (error) {
        console.log("Using sample data (database not reachable):", error.message);
        tasks = FALLBACK_TASKS;
    }
    renderTasks(tasks);
}

function renderTasks(tasks) {
    const tbody = document.getElementById("tasks-body");
    if (tasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-note">No watering tasks yet. Add one above.</td></tr>';
        return;
    }
    tbody.innerHTML = tasks.map(task => `
        <tr>
            <td><input type="checkbox" ${task.is_done == 1 ? "checked" : ""} onchange="toggleDone(${task.task_id}, this.checked)"></td>
            <td>${task.plot_name}</td>
            <td><span class="pill pill--${task.crop_type.toLowerCase()}">${task.crop_type}</span></td>
            <td>${task.task_date}</td>
        </tr>
    `).join("");
}

/* ---------- ADD TASK ---------- */

async function handleAddTask(event) {
    event.preventDefault();
    const messageEl = document.getElementById("add-task-message");
    const formData = new FormData(event.target);

    try {
        const response = await fetch("php/tasks/add_task.php", { method: "POST", body: formData });
        const result = await response.json();
        if (result.success) {
            messageEl.textContent = "Task added.";
            messageEl.className = "form-message success";
            loadTasks();
        } else {
            messageEl.textContent = result.message || "Something went wrong.";
            messageEl.className = "form-message error";
        }
    } catch (error) {
        messageEl.textContent = "Couldn't reach the database. (This needs XAMPP running — see README.)";
        messageEl.className = "form-message error";
    }
}

/* ---------- MARK DONE / NOT DONE ---------- */

async function toggleDone(taskId, isChecked) {
    const formData = new FormData();
    formData.append("task_id", taskId);
    formData.append("is_done", isChecked ? "1" : "0");

    try {
        await fetch("php/tasks/mark_done.php", { method: "POST", body: formData });
    } catch (error) {
        alert("Couldn't reach the database, so this change won't be saved. (Needs XAMPP running.)");
    }
}
