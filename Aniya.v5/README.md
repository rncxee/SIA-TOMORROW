# Aniya — Agricultural Navigation and Yield Activity Tracker

Aniya is a PHP/MySQL web application for tracking rice plots, plantings, watering tasks, harvest records, seed inventory, and calendar dates.

## Folder structure

```text
Aniya/
├── js/
│   ├── calendar.js
│   ├── dashboard.js
│   ├── finance.js
│   ├── harvest.js
│   ├── plots.js
│   ├── script.js
│   ├── seeds.js
│   └── watering.js
├── php/
│   ├── add_finance.php
│   ├── add_harvest.php
│   ├── add_planting.php
│   ├── add_plot.php
│   ├── add_seed.php
│   ├── add_task.php
│   ├── config.php
│   ├── delete_finance.php
│   ├── delete_harvest.php
│   ├── delete_plot.php
│   ├── delete_seed.php
│   ├── delete_task.php
│   ├── get_calendar.php
│   ├── get_dashboard_data.php
│   ├── get_finance.php
│   ├── get_harvests.php
│   ├── get_plots.php
│   ├── get_seeds.php
│   ├── get_tasks.php
│   ├── mark_done.php
│   └── update_plot.php
├── aniyatrack.sql
├── calendar.html
├── finance.html
├── harvest.html
├── index.html
├── plots.html
├── seeds.html
├── style.css
└── watering.html
```

## XAMPP setup

1. Copy the `Aniya` folder to `C:\xampp\htdocs\`.
2. Start **Apache** and **MySQL** in XAMPP.
3. Open `http://localhost/phpmyadmin/`.
4. Import `aniyatrack.sql`. It creates the `aniya_db` database and sample records.
5. Open `http://localhost/Aniya/`.

If your MySQL root account has a password, edit `php/config.php` and change `$pass`.

## Working features

- Dashboard statistics and live database summaries.
- Add, edit, and delete plots.
- Add current planting information and expected harvest date.
- Add, complete/reopen, and delete watering tasks.
- Add and delete harvest records.
- Add, update, and delete seed inventory records with low-stock status.
- Monthly calendar showing watering tasks, expected harvests, and completed harvests.
- Farm Finance: record expenses and income per rice plot, view total expenses, total revenue, net profit/loss, and transaction history.
- Responsive layout styled to match the supplied Aniya/AniTrack screenshots.
- Rice-only system: all plot, planting, watering, harvest, and seed records are restricted to rice.
