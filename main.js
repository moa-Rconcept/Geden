// Année automatique dans le footer
$('#year').text(new Date().getFullYear());

// Menu mobile (toggle + classe active)
const $toggle = $('#menuToggle');
const $menu = $('#menu');

$toggle.on('click', function () {
  const $btn = $(this);
  const isOpen = $btn.attr('aria-expanded') === 'true';

  // aria
  $btn.attr('aria-expanded', String(!isOpen));
  $menu.toggleClass('active', !isOpen);

  // affichage
  if (isOpen) {
    $menu.hide();
  } else {
    $menu
      .css({
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px 0'
      })
      .show();
  }
});

// --- Sort "Références" cards by year (desc) ---
// Works for single years (e.g., "2019") and ranges (e.g., "2024 – 2026")
(function () {
  function sortCardsIn(sectionId) {
    const $section = $('#' + sectionId);
    if (!$section.length) return;

    const $cards = $section.find('.ref-card');

    const getYearKey = (cardEl) => {
      const text = $(cardEl).find('.ref-year').first().text() || '';
      const matches = text.match(/\d{4}/g);
      if (!matches) return -Infinity;
      // For ranges, use the largest year found so most recent comes first
      return Math.max.apply(null, matches.map(Number));
    };

    const sorted = $cards
      .get()
      .map((el) => ({ el, key: getYearKey(el) }))
      .sort((a, b) => b.key - a.key) // DESC
      .map((o) => o.el);

    $section.append(sorted); // re-append in order
  }

  // Past and ongoing sections
  sortCardsIn('passees');
  sortCardsIn('encours');
})();
