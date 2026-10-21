/* ==========================================================================
   layout.js — sidebar, logout and "current user" for every logged-in page
   Needs core.js. The sidebar markup lives in partials/sidebar.html.
   ========================================================================== */

async function loadSidebar() {
    const slot = document.getElementById('sidebar');
    if (!slot) return;

    try {
        const res = await fetch(urlFor('partials/sidebar.html'));
        if (!res.ok) throw new Error('Sidebar not found');
        slot.innerHTML = await res.text();
    } catch (e) {
        toast('Could not load the menu.', true);
        return;
    }

    slot.querySelectorAll('nav a[data-path]').forEach(link => {
        link.href = urlFor(link.dataset.path);
        link.classList.toggle('active', link.dataset.page === page);
    });

    const name = localStorage.getItem('aniya_user');
    const userBox = document.getElementById('sidebarUser');
    if (name && userBox) {
        userBox.textContent = '👤 ' + name;
        userBox.hidden = false;
    }
}

// Logout (the button is inside the sidebar, which is added after load)
document.addEventListener('click', async e => {
    if (!e.target.closest('#logoutBtn')) return;
    e.preventDefault();

    try {
        await post('Auth/logout.php', {});
    } catch (err) { /* already logged out */ }

    localStorage.removeItem('aniya_user');
    window.location.href = urlFor('Auth/login.html');
});

loadSidebar();
