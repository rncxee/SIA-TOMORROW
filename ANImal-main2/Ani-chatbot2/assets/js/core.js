/* ==========================================================================
   core.js — shared helpers used by every page
   Load this script first on every page.
   ========================================================================== */

// Project root = two folders above this file (assets/js/ -> project root)
const ROOT = new URL('../../', document.currentScript.src).href;

// <body data-page="..."> tells us which page we are on
const page = document.body.dataset.page;

/* ---------- URLs & API ---------- */

function urlFor(path) {
    const [p, q] = path.split('?');
    const enc = p.split('/').map(encodeURIComponent).join('/');
    return ROOT + enc + (q ? '?' + q : '');
}

async function api(url, options = {}) {
    const r = await fetch(urlFor(url), options);
    let x;

    try {
        x = await r.json();
    } catch (e) {
        throw new Error('Invalid server response');
    }

    if (r.status === 401) {
        window.location.href = urlFor('Auth/login.html');
        throw new Error('Please log in.');
    }

    if (!r.ok || x.success === false) {
        throw new Error(x.message || 'Request failed');
    }

    return x;
}

function post(file, data) {
    return api(file, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

/* ---------- Toast ---------- */

let toastTimer;

function toast(msg, error = false) {
    const t = document.getElementById('toast');
    if (!t) return;

    t.textContent = msg;
    t.className = 'toast show' + (error ? ' error' : '');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = 'toast'; }, 2800);
}

/* ---------- Dates ---------- */

// Local date as YYYY-MM-DD.
// (toISOString() is UTC, which gives *yesterday* in the Philippines before 8 AM.)
function today() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function setDefaultDates() {
    document.querySelectorAll('input[type=date]').forEach(x => {
        if (!x.value) x.value = today();
    });
}

/* ---------- Templates (HTML lives in the .html files, not in JS) ---------- */

// Clone the first element inside <template id="...">.
function cloneTemplate(id) {
    return document.getElementById(id).content.firstElementChild.cloneNode(true);
}

// Set text on every [data-field="key"] inside el (and on el itself).
// Uses textContent, so values are always safe to display.
function fill(el, values) {
    for (const [key, value] of Object.entries(values)) {
        const text = value ?? '';
        const targets = [...el.querySelectorAll(`[data-field="${key}"]`)];
        if (el.matches(`[data-field="${key}"]`)) targets.push(el);
        targets.forEach(n => { n.textContent = text; });
    }
    return el;
}

// Fill a [data-badge="key"] element with text and a CSS class (e.g. "occupied").
function setBadge(el, key, text, cls = text) {
    const badge = el.querySelector(`[data-badge="${key}"]`);
    if (!badge) return;
    badge.textContent = text;
    badge.classList.add(String(cls).toLowerCase());
}

// Replace the children of a container with the given nodes.
function render(container, nodes) {
    container.replaceChildren(...nodes);
}

// Fill a <select> with plots.
function fillPlotSelect(select, plots, placeholder = null) {
    const options = plots.map(p => new Option(`${p.name} (${p.crop_type})`, p.id));
    if (placeholder !== null) options.unshift(new Option(placeholder, ''));
    select.replaceChildren(...options);
}

/* ---------- Formatting ---------- */

function number(value) {
    return Number(value).toLocaleString();
}

/* ---------- Shared UI builders ---------- */

// A plot summary card. Needs <template id="tpl-plot-card"> on the page
// (used by the Dashboard and Plots pages).
function plotCard(p) {
    const el = cloneTemplate('tpl-plot-card');
    fill(el, {
        name: p.name,
        crop: p.crop_name || 'No current planting'
    });
    setBadge(el, 'crop', p.crop_type);
    setBadge(el, 'status', p.status);
    return el;
}
