/* Inventory page: tab switching.
   The tabs themselves live in seeds.js and harvest.js (load order matters). */

const seedTab = document.getElementById('seedTab');
const harvestTab = document.getElementById('harvestTab');

function showTab(tab) {
    const isSeed = tab === 'seeds';

    seedTab.hidden = !isSeed;
    harvestTab.hidden = isSeed;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (isSeed) {
        loadSeeds();
    } else {
        loadHarvests();
    }
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
});

showTab('seeds');
