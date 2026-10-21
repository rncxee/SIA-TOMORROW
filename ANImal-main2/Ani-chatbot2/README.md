# Aniya — Agricultural Navigation and Yield Activity Tracker

Aniya is a PHP/MySQL web app for tracking rice plots, plantings, watering tasks,
harvest records, seed inventory, farm finances and calendar dates. It includes a
small chat assistant ("Ask Ani") on every page.

## Project structure

```text
Ani-chatbot/
├── index.html              redirects to the Dashboard
├── config.php              session, database connection, JSON helpers
├── config.local.example.php  copy to config.local.php for passwords / API key
├── aniyatrack.sql          database schema + sample data
│
├── assets/                 code shared by every page
│   ├── css/
│   │   ├── base.css        reset, colours, page defaults
│   │   ├── layout.css      sidebar, main area, page header
│   │   └── components.css  cards, forms, buttons, tables, badges, toast
│   └── js/
│       ├── core.js         api(), post(), toast(), templates, date helpers
│       └── layout.js       loads the sidebar, handles logout
├── partials/
│   └── sidebar.html        the sidebar markup (shared by all pages)
│
├── Auth/                   login.html, register.html, auth.js, auth.css + PHP
├── Dashboard/              index.html, dashboard.js, dashboard.css + PHP
├── Plots/                  plots.html, plots.js, plots.css + PHP
├── Tasks/                  watering.html, watering.js, watering.css + PHP
├── Inventory/              inventory.html, inventory.js (tabs),
│                           seeds.js, harvest.js, inventory.css + PHP
├── Finance/                finance.html, finance.js, finance.css + PHP
├── Calendar/               calendar.html, calendar.js, calendar.css + PHP
└── Chat/                   chat-widget.html, chat.js, chat.css, chat.php
```

### How a page is built

Every module follows the same pattern, so it is easy to find things:

| Concern            | Where it lives                                         |
| ------------------ | ------------------------------------------------------ |
| Markup (HTML)      | the page's `.html` file — no HTML is written in JS     |
| Repeated rows/cards| `<template id="tpl-…">` blocks at the bottom of the page |
| Styling            | shared CSS in `assets/css/` + one `<module>.css`       |
| Behaviour          | `<module>.js` (fetches data, clones templates, fills them) |
| Data               | the PHP endpoints in the same folder                   |

To change how a table row looks, edit its `<template>` in the `.html` file.
To change what data goes into it, edit the `.js` file.

## XAMPP setup

1. Copy the `Ani-chatbot` folder to `C:\xampp\htdocs\`.
2. Start **Apache** and **MySQL** in XAMPP.
3. Open `http://localhost/phpmyadmin/`.
4. For a new installation, import `aniyatrack.sql`. It creates the `aniyatrack` database with sample records, including task types such as Water, Fertilize, Weed, and Inspect. **Importing this full setup SQL again resets farm data.**
5. For an existing installation, select the `aniyatrack` database and run `task_type_migration.sql` once in phpMyAdmin's SQL tab. The migration checks whether `watering_tasks.task_type` already exists, so it can also be safely rerun. Existing tasks default to `Water`.
5. Open `http://localhost/Ani-chatbot/`.

> The pages load shared files with `fetch()`, so open them through
> `http://localhost/...` — double-clicking an `.html` file (`file://`) will not work.

If your MySQL root account has a password, copy `config.local.example.php` to
`config.local.php` and set `$pass` there.

### Chatbot (optional)

Without an API key the chat answers from your database with simple built-in replies.
For AI answers, put your Claude API key in `config.local.php`:

```php
define('ANTHROPIC_API_KEY', 'sk-ant-...');
```

`config.local.php` is listed in `.gitignore`, so the key never ends up in the repository.

## Login

Open `http://localhost/Ani-chatbot/Auth/register.html` to create an account, then log in.
All pages and PHP endpoints require a logged-in session.

## Features

- Dashboard statistics and live database summaries.
- Add, edit and delete plots; record the current planting and expected harvest date.
- Add, complete/reopen and delete watering tasks.
- Seed inventory with low-stock status, and harvest records (one Inventory page, two tabs).
- Farm Finance: expenses and income per plot, totals and net profit/loss.
- Monthly calendar of watering tasks, expected harvests and completed harvests.
- "Ask Ani" chat assistant on every page.
- Rice-only system: all plot, planting, watering, harvest and seed records are restricted to rice.
