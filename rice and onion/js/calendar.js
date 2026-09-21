document.addEventListener("DOMContentLoaded", initCalendar);

let currentDate = new Date();
let selectedDateKey = null;

let calendarEvents = {};
let calendarTasks = {};

const STORAGE_KEY = "anitack_calendar_completed_tasks";

const FALLBACK_EVENTS = [
    {
        date: "2026-09-22",
        type: "watering",
        title: "Water Plot A1",
        details: "Onion — Plot A1",
        taskId: "sample-a1"
    },
    {
        date: "2026-09-22",
        type: "watering",
        title: "Water Plot A2",
        details: "Rice — Plot A2",
        taskId: "sample-a2"
    },
    {
        date: "2026-11-01",
        type: "expected",
        title: "Expected harvest — Plot A1",
        details: "Red Creole Onion"
    },
    {
        date: "2026-11-15",
        type: "expected",
        title: "Expected harvest — Plot A2",
        details: "IR64 Rice"
    },
    {
        date: "2026-09-14",
        type: "harvested",
        title: "Harvest — Plot A2",
        details: "Rice — 45 kg"
    },
    {
        date: "2026-09-10",
        type: "harvested",
        title: "Harvest — Plot A1",
        details: "Onion — 12.5 kg"
    }
];


async function initCalendar() {

    bindCalendarControls();

    await loadCalendarData();

    renderCalendar();

    selectDate(toDateKey(new Date()));
}


/* ============================================================
   CALENDAR CONTROLS
============================================================ */

function bindCalendarControls() {

    document
        .getElementById("prev-month")
        .addEventListener("click", () => {

            currentDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - 1,
                1
            );

            renderCalendar();
        });


    document
        .getElementById("next-month")
        .addEventListener("click", () => {

            currentDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                1
            );

            renderCalendar();
        });


    document
        .getElementById("today-btn")
        .addEventListener("click", () => {

            const today = new Date();

            currentDate = new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );

            const todayKey = toDateKey(today);

            selectedDateKey = todayKey;

            renderCalendar();

            selectDate(todayKey);
        });
}


/* ============================================================
   LOAD DATA
============================================================ */

async function loadCalendarData() {

    try {

        const [
            tasksResponse,
            harvestsResponse,
            plotsResponse
        ] = await Promise.all([

            fetch("php/get_tasks.php"),

            fetch("php/get_harvests.php"),

            fetch("php/plots/get_plots.php")
        ]);


        if (
            !tasksResponse.ok ||
            !harvestsResponse.ok ||
            !plotsResponse.ok
        ) {

            throw new Error(
                "One or more calendar data requests failed."
            );
        }


        const [
            tasksData,
            harvestsData,
            plotsData
        ] = await Promise.all([

            tasksResponse.json(),

            harvestsResponse.json(),

            plotsResponse.json()
        ]);


        const events = [];


        /* =========================
           WATERING TASKS
        ========================= */

        (tasksData.tasks || []).forEach((task, index) => {

            const taskId =
                task.id ??
                task.task_id ??
                `task-${task.task_date}-${index}`;


            const taskObject = {

                id: String(taskId),

                date: task.task_date,

                type: "watering",

                title: `Water ${task.plot_name}`,

                details:
                    `${task.crop_type} — ` +
                    `${task.is_done == 1 ? "Completed" : "Pending"}`,

                completed:
                    task.is_done == 1

            };


            events.push(taskObject);

        });


        /* =========================
           EXPECTED HARVESTS
        ========================= */

        (plotsData.plots || []).forEach(plot => {

            if (plot.expected_harvest) {

                events.push({

                    date: plot.expected_harvest,

                    type: "expected",

                    title:
                        `Expected harvest — ${plot.plot_name}`,

                    details:
                        `${plot.crop_type}` +
                        (
                            plot.variety_name
                                ? ` — ${plot.variety_name}`
                                : ""
                        )
                });

            }

        });


        /* =========================
           COMPLETED HARVESTS
        ========================= */

        (harvestsData.harvests || []).forEach(harvest => {

            events.push({

                date: harvest.harvest_date,

                type: "harvested",

                title:
                    `Harvest — ${harvest.plot_name}`,

                details:
                    `${harvest.crop_type} — ` +
                    `${harvest.quantity_kg} kg`

            });

        });


        calendarEvents = groupEvents(events);

        calendarTasks = groupTasks(events);

        showMessage("", "");

    }

    catch (error) {

        console.log(
            "Using sample calendar data:",
            error.message
        );


        calendarEvents =
            groupEvents(FALLBACK_EVENTS);


        calendarTasks =
            groupTasks(FALLBACK_EVENTS);


        showMessage(
            "Database unavailable. Showing sample calendar data.",
            "error"
        );

    }
}


/* ============================================================
   GROUP EVENTS
============================================================ */

function groupEvents(events) {

    return events.reduce((groups, event) => {

        if (!groups[event.date]) {
            groups[event.date] = [];
        }

        groups[event.date].push(event);

        return groups;

    }, {});
}


/* ============================================================
   GROUP TASKS
============================================================ */

function groupTasks(events) {

    const groups = {};

    events
        .filter(event => event.type === "watering")
        .forEach(event => {

            if (!groups[event.date]) {
                groups[event.date] = [];
            }

            groups[event.date].push(event);

        });

    return groups;
}


/* ============================================================
   RENDER CALENDAR
============================================================ */

function renderCalendar() {

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    document
        .getElementById("calendar-title")
        .textContent =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    month: "long",
                    year: "numeric"
                }
            ).format(currentDate);


    const grid =
        document.getElementById("calendar-grid");


    grid.innerHTML = "";


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const daysInPreviousMonth =
        new Date(
            year,
            month,
            0
        ).getDate();


    /* =========================
       PREVIOUS MONTH
    ========================= */

    for (
        let i = firstDay - 1;
        i >= 0;
        i--
    ) {

        const previousDay =
            daysInPreviousMonth - i;


        const previousDate =
            new Date(
                year,
                month - 1,
                previousDay
            );


        grid.appendChild(
            createDayCell(
                previousDay,
                true,
                previousDate
            )
        );

    }


    /* =========================
       CURRENT MONTH
    ========================= */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        grid.appendChild(
            createDayCell(
                day,
                false,
                date
            )
        );

    }


    /* =========================
       NEXT MONTH
    ========================= */

    const totalCells =
        firstDay + daysInMonth;


    const trailingCells =
        (7 - (totalCells % 7)) % 7;


    for (
        let day = 1;
        day <= trailingCells;
        day++
    ) {

        const nextDate =
            new Date(
                year,
                month + 1,
                day
            );


        grid.appendChild(
            createDayCell(
                day,
                true,
                nextDate
            )
        );

    }
}


/* ============================================================
   CREATE DAY CELL
============================================================ */

function createDayCell(
    day,
    isOutsideMonth,
    date
) {

    const cell =
        document.createElement("button");


    cell.type = "button";


    cell.className =
        "calendar-day";


    if (isOutsideMonth) {

        cell.classList.add(
            "outside-month"
        );

    }


    const key =
        toDateKey(date);


    cell.dataset.date = key;


    /* TODAY */

    if (
        key ===
        toDateKey(new Date())
    ) {

        cell.classList.add("today");

    }


    /* SELECTED */

    if (
        key ===
        selectedDateKey
    ) {

        cell.classList.add(
            "selected"
        );

    }


    /* DAY NUMBER */

    const number =
        document.createElement("div");


    number.className =
        "day-number";


    number.textContent =
        day;


    cell.appendChild(number);


    /* EVENTS */

    const events =
        calendarEvents[key] || [];


    const maxVisible =
        3;


    events
        .slice(0, maxVisible)
        .forEach(event => {

            const item =
                document.createElement("div");


            item.className =
                `calendar-event calendar-event--${event.type}`;


            item.textContent =
                event.title;


            cell.appendChild(item);

        });


    /* MORE */

    if (
        events.length >
        maxVisible
    ) {

        const more =
            document.createElement("div");


        more.className =
            "calendar-more";


        more.textContent =
            `+${events.length - maxVisible} more`;


        cell.appendChild(more);

    }


    /* CLICK */

    cell.addEventListener(
        "click",
        () => {

            selectDate(key);

        }
    );


    return cell;
}


/* ============================================================
   SELECT DATE
============================================================ */

function selectDate(dateKey) {

    selectedDateKey =
        dateKey;


    const date =
        parseDateKey(dateKey);


    if (!date) {
        return;
    }


    currentDate =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            1
        );


    renderCalendar();


    updateSelectedDate(dateKey);

}


/* ============================================================
   UPDATE SELECTED DATE
============================================================ */

function updateSelectedDate(dateKey) {

    const date =
        parseDateKey(dateKey);


    const label =
        document.getElementById(
            "selected-date-label"
        );


    if (!date) {

        label.textContent =
            "Selected date";

        return;

    }


    label.textContent =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );


    renderTaskChecklist(dateKey);

    renderOtherEvents(dateKey);
}


/* ============================================================
   TASK CHECKLIST
============================================================ */

function renderTaskChecklist(dateKey) {

    const container =
        document.getElementById(
            "selected-tasks"
        );


    const tasks =
        calendarTasks[dateKey] || [];


    if (tasks.length === 0) {

        container.innerHTML = `
            <div class="no-tasks">
                <div class="no-tasks__icon">🌱</div>
                <h3>No tasks for this day</h3>
                <p>
                    There are no watering tasks scheduled
                    for this date.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    const completedStorage =
        getCompletedTasks();


    tasks.forEach((task, index) => {

        const taskId =
            String(
                task.id ||
                `${dateKey}-task-${index}`
            );


        const storageKey =
            `${dateKey}-${taskId}`;


        const isCompleted =
            completedStorage[storageKey] === true ||
            task.completed === true;


        const item =
            document.createElement("label");


        item.className =
            "task-checklist__item";


        if (isCompleted) {

            item.classList.add(
                "completed"
            );

        }


        item.innerHTML = `

            <input
                type="checkbox"
                class="task-checkbox"
                ${isCompleted ? "checked" : ""}
                data-task-key="${escapeHtml(storageKey)}"
            >

            <span class="task-checkmark"></span>

            <span class="task-content">

                <strong>
                    ${escapeHtml(task.title)}
                </strong>

                <small>
                    ${escapeHtml(task.details)}
                </small>

            </span>

        `;


        const checkbox =
            item.querySelector(
                ".task-checkbox"
            );


        checkbox.addEventListener(
            "change",
            function () {

                setTaskCompleted(
                    storageKey,
                    this.checked
                );


                item.classList.toggle(
                    "completed",
                    this.checked
                );

            }
        );


        container.appendChild(item);

    });
}


/* ============================================================
   OTHER EVENTS
============================================================ */

function renderOtherEvents(dateKey) {

    const container =
        document.getElementById(
            "selected-events"
        );


    const events =
        calendarEvents[dateKey] || [];


    const otherEvents =
        events.filter(
            event =>
                event.type !== "watering"
        );


    if (otherEvents.length === 0) {

        container.innerHTML = "";

        return;
    }


    container.innerHTML = `

        <div class="events-section-title">
            Other Events
        </div>

    `;


    otherEvents.forEach(event => {

        const item =
            document.createElement("div");


        item.className =
            `calendar-detail calendar-detail--${event.type}`;


        item.innerHTML = `

            <span class="calendar-detail__badge">
                ${getEventLabel(event.type)}
            </span>

            <div>

                <strong>
                    ${escapeHtml(event.title)}
                </strong>

                <p>
                    ${escapeHtml(event.details)}
                </p>

            </div>

        `;


        container.appendChild(item);

    });
}


/* ============================================================
   CHECKLIST STORAGE
============================================================ */

function getCompletedTasks() {

    try {

        return JSON.parse(
            localStorage.getItem(
                STORAGE_KEY
            )
        ) || {};

    }

    catch (error) {

        return {};

    }
}


function setTaskCompleted(
    taskKey,
    completed
) {

    const tasks =
        getCompletedTasks();


    if (completed) {

        tasks[taskKey] = true;

    } else {

        delete tasks[taskKey];

    }


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}


/* ============================================================
   EVENT LABEL
============================================================ */

function getEventLabel(type) {

    if (type === "watering") {
        return "Watering";
    }

    if (type === "expected") {
        return "Expected Harvest";
    }

    if (type === "harvested") {
        return "Completed Harvest";
    }

    return "Event";
}


/* ============================================================
   DATE HELPERS
============================================================ */

function toDateKey(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


function parseDateKey(key) {

    if (!key) {
        return null;
    }


    const parts =
        key.split("-").map(Number);


    if (
        parts.length !== 3 ||
        parts.some(Number.isNaN)
    ) {

        return null;

    }


    return new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    );
}


/* ============================================================
   HTML ESCAPE
============================================================ */

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


/* ============================================================
   MESSAGE
============================================================ */

function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "calendar-message"
        );


    element.textContent =
        message;


    element.className =
        "form-message";


    if (type) {

        element.classList.add(
            type
        );

    }
}