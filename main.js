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

// --- Team modal ---
(function () {
  const $modal = $('#teamModal');
  const $panel = $modal.find('.modal__panel');

  function openModal({ name, role, photoSrc, photoAlt, html }) {
    $modal.find('.modal__title').text(name);
    $modal.find('.modal__role').text(role);

    $modal.find('.modal__photo')
      .attr('src', photoSrc)
      .attr('alt', photoAlt || name);

    $modal.find('.modal__content').html(html);

    $modal.addClass('is-open').attr('aria-hidden', 'false');
    $('body').css('overflow', 'hidden');
  }

  function closeModal() {
    $modal.removeClass('is-open').attr('aria-hidden', 'true');
    $('body').css('overflow', '');
  }

  // Ouvrir
  $(document).on('click', '.team-more', function () {
    const $card = $(this).closest('.team-card');

    const name = $card.find('.team-name').first().text().trim();
    const role = $card.find('.role').first().text().trim();
    const $img = $card.find('img').first();

    const photoSrc = $img.attr('src');
    const photoAlt = $img.attr('alt');

    const html = $card.find('.team-full').first().html() || '';

    openModal({ name, role, photoSrc, photoAlt, html });
  });

  // Fermer (bouton + backdrop)
  $modal.on('click', '.modal__close, .modal__backdrop', function () {
    closeModal();
  });

  // Fermer au clic en dehors du panel (sécurité)
  $modal.on('click', function (e) {
    if (!$(e.target).closest($panel).length) closeModal();
  });

  // Fermer avec ESC
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape' && $modal.hasClass('is-open')) closeModal();
  });
})();
