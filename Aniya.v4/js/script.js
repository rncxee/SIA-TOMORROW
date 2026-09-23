const API = 'php/';
const page = document.body.dataset.page;

const nav = [
    ['index.html', '📊', 'Dashboard', 'dashboard'],
    ['plots.html', '🌱', 'Plots', 'plots'],
    ['watering.html', '💧', 'Watering Tasks', 'watering'],
    ['harvest.html', '🧺', 'Harvest Records', 'harvest'],
    ['seeds.html', '🫘', 'Seed Inventory', 'seeds'],
    ['calendar.html', '🗓️', 'Calendar', 'calendar']
];

function shell(title, subtitle, content) {
    document.getElementById('app').innerHTML = `
        <aside class="sidebar">
            <div class="brand">
                <span>🌱</span>
                <strong>Aniya</strong>
            </div>

            <nav>
                ${nav.map(n => `
                    <a
                        href="${n[0]}"
                        class="${page === n[3] ? 'active' : ''}"
                    >
                        <span>${n[1]}</span>
                        ${n[2]}
                    </a>
                `).join('')}
            </nav>

            <div class="side-note">
                Rice plot tracking for the community garden.
            </div>
        </aside>

        <main class="main">
            <header>
                <h1>${title}</h1>
                <p>${subtitle}</p>
            </header>

            ${content}
        </main>

        <div
            id="toast"
            class="toast"
        ></div>
    `;
}

function esc(v) {
    return String(v ?? '').replace(
        /[&<>'"]/g,
        c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[c])
    );
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function api(url, options = {}) {
    return fetch(API + url, options)
        .then(async r => {
            let x;

            try {
                x = await r.json();
            } catch (e) {
                throw new Error('Invalid server response');
            }

            if (!r.ok || x.success === false) {
                throw new Error(
                    x.message || 'Request failed'
                );
            }

            return x;
        });
}

function post(file, data) {
    return api(file, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

function toast(msg, error = false) {
    const t = document.getElementById('toast');

    if (!t) return;

    t.textContent = msg;

    t.className =
        'toast show ' +
        (error ? 'error' : '');

    setTimeout(
        () => t.className = 'toast',
        2800
    );
}

function cropBadge(c) {
    return `
        <span class="badge ${String(c).toLowerCase()}">
            ${esc(c)}
        </span>
    `;
}

function statusBadge(s) {
    return `
        <span class="badge ${String(s).toLowerCase()}">
            ${esc(s)}
        </span>
    `;
}

function plotOptions(plots) {
    return plots
        .map(p => `
            <option value="${p.id}">
                ${esc(p.name)} (${esc(p.crop_type)})
            </option>
        `)
        .join('');
}

function setDefaultDates() {
    document
        .querySelectorAll('input[type=date]')
        .forEach(x => {
            if (!x.value) {
                x.value = today();
            }
        });
}