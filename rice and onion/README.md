# AniTrack — Setup Guide

(Formerly "TanimTayo" — renamed, same project.)

## Pages (all 5 built)
1. **Dashboard** (`index.html`) — onion/rice plot counts, today's watering
   tasks, recent harvest, seed inventory, plus a visual plot overview grid
2. **Plots** (`plots.html`) — add a plot, edit a plot's name/type/status
   inline, view and set what's currently planted in it
3. **Watering Tasks** (`watering.html`) — add a task for a plot + date,
   check it off when done
4. **Harvest Records** (`harvest.html`) — log a harvest, browse full history
5. **Seed Inventory** (`seeds.html`) — add a seed entry, update its quantity,
   see a "Low" flag once it drops to its threshold

## Folder structure
```
AniTrack/
├── index.html            → Dashboard
├── plots.html            → Plots
├── watering.html         → Watering Tasks
├── harvest.html          → Harvest Records
├── seeds.html            → Seed Inventory
├── css/style.css         → All styling (shared by every page)
├── js/
│   ├── dashboard.js
│   ├── plots.js
│   ├── watering.js
│   ├── harvest.js
│   └── seeds.js
├── php/
│   ├── config.php               → Database connection settings
│   ├── get_dashboard_data.php   → Powers the Dashboard
│   ├── plots/    get_plots.php, add_plot.php, update_plot.php, add_planting.php
│   ├── tasks/    get_tasks.php, add_task.php, mark_done.php
│   ├── harvest/  get_harvests.php, add_harvest.php
│   └── seeds/    get_seeds.php, add_seed.php, update_seed.php
├── database/anitrack.sql → Run this once to create the database
└── images/
```

## Option 1: Just view the design (no database needed)
Open any page directly (double-click `index.html`, `plots.html`, etc.).
Every page falls back to built-in sample data if it can't reach the
database, so nothing looks empty — but **adding, editing, or saving
anything won't actually stick** without the database running (Option 2).

## Option 2: Run it for real, with the database

1. **Copy the folder** into XAMPP's `htdocs`, e.g. `C:\xampp\htdocs\AniTrack`
2. **Start XAMPP**: turn on **Apache** and **MySQL**
3. **Create the database**:
   - Go to `http://localhost/phpmyadmin`
   - Click the **SQL** tab
   - Open `database/anitrack.sql`, copy everything, paste it in, click **Go**
   - If you still have the old `tanimtayo` database, you can drop it with
     `DROP DATABASE tanimtayo;` first — it's not needed anymore
4. **Open through Apache**: `http://localhost/AniTrack/index.html`

Now every Add/Edit/Save button actually writes to MySQL, and reloading
the page will show your changes.

## Database tables at a glance
- `plots` — plot_name, crop_type (Onion/Rice), status (Available/Occupied)
- `plot_plantings` — history of what's been planted in each plot
  (`is_current = TRUE` marks the active one)
- `watering_tasks` — one row per watering task, per plot, per date
- `harvest_records` — one row per harvest logged
- `seed_inventory` — seed name, crop type, quantity in grams, low-stock threshold

## How the CRUD pattern works (same on every page)
Each page follows the same 3-piece pattern — once you understand one,
you understand all of them:
1. A **GET** PHP file (e.g. `get_plots.php`) reads from MySQL and returns JSON
2. An **add** PHP file reads `$_POST` fields and runs an `INSERT`
3. The page's JS file calls the GET file on load to fill the table, and
   calls the add/update files via `fetch(...)` when a form is submitted

If you want to add a 6th page later, copying an existing page's HTML + JS
+ PHP trio is the fastest way to start.
