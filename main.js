// Année automatique dans le footer
document.getElementById('year').textContent = new Date().getFullYear();

// Menu mobile
const toggle = document.getElementById('menuToggle');
const menu = document.getElementById('menu');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  menu.style.display = open ? 'none' : 'flex';
  menu.style.flexDirection = 'column';
  menu.style.gap = '12px';
  menu.style.padding = '12px 0';
});


// --- Sort "Références" cards by year (desc) ---
// Works for single years (e.g., "2019") and ranges (e.g., "2024 – 2026")
(function () {
  function sortCardsIn(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const cards = Array.from(section.querySelectorAll('.ref-card'));

    const getYearKey = (card) => {
      const y = card.querySelector('.ref-year');
      if (!y) return -Infinity;
      const matches = (y.textContent || '').match(/\d{4}/g);
      if (!matches) return -Infinity;
      // For ranges, use the largest year found so most recent comes first
      return Math.max(...matches.map(Number));
    };

    cards
      .map(card => ({ card, key: getYearKey(card) }))
      .sort((a, b) => b.key - a.key) // DESC
      .forEach(({ card }) => section.appendChild(card)); // re-append in order
  }

  // Past and ongoing sections
  sortCardsIn('passees');
  sortCardsIn('encours');
})();
