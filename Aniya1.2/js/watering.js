shell(
    'Watering Tasks',
    "Schedule watering tasks per plot and check them off as they're done.",
    `
        <section class="card">
            <h2>Add a Watering Task</h2>

            <form id="taskForm" class="form-row">
                <label>
                    Plot
                    <select
                        name="plot_id"
                        id="taskPlot"
                        required
                    ></select>
                </label>

                <label>
                    Date
                    <input
                        type="date"
                        name="task_date"
                        required
                    >
                </label>

                <button>＋ Add Task</button>
            </form>
        </section>

        <section class="card">
            <h2>All Watering Tasks</h2>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Done</th>
                            <th>Plot</th>
                            <th>Crop</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody id="taskBody"></tbody>
                </table>
            </div>
        </section>
    `
);

async function load() {
    try {
        const [p, t] = await Promise.all([
            api('get_plots.php'),
            api('get_tasks.php')
        ]);

        document.getElementById('taskPlot').innerHTML =
            plotOptions(p.plots);

        document.getElementById('taskBody').innerHTML =
            t.tasks.map(x => `
                <tr class="${x.done ? 'muted' : ''}">
                    <td>
                        <input
                            type="checkbox"
                            ${x.done ? 'checked' : ''}
                            onchange="toggleTask(${x.id},this.checked)"
                        >
                    </td>

                    <td>
                        ${esc(x.plot_name)}
                    </td>

                    <td>
                        ${cropBadge(x.crop_type)}
                    </td>

                    <td>
                        ${esc(x.task_date)}
                    </td>

                    <td>
                        <button
                            class="small danger"
                            onclick="delTask(${x.id})"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            `).join('');

        setDefaultDates();

    } catch (e) {
        toast(e.message, true);
    }
}

document
    .getElementById('taskForm')
    .addEventListener('submit', async e => {
        e.preventDefault();

        try {
            await post(
                'add_task.php',
                Object.fromEntries(new FormData(e.target))
            );

            toast('Watering task added.');
            load();

        } catch (x) {
            toast(x.message, true);
        }
    });

window.toggleTask = async (id, done) => {
    try {
        await post('mark_done.php', {
            id,
            done
        });

        toast(
            done
                ? 'Task marked done.'
                : 'Task reopened.'
        );

        load();

    } catch (e) {
        toast(e.message, true);
    }
};

window.delTask = async id => {
    if (!confirm('Delete this watering task?')) return;

    try {
        await post('delete_task.php', { id });

        toast('Task deleted.');
        load();

    } catch (e) {
        toast(e.message, true);
    }
};

load();