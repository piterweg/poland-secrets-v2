/* ─────────────────────────────────────────────────────────────
   hub.js — obsługa stron hubów tematycznych
   ─────────────────────────────────────────────────────────────

   Wersja hybrydowa:
   - Jeśli karty są już w HTML (prerender) → nie rób nic
   - Jeśli grid jest pusty → pobierz JSON i wyrenderuj karty (fallback)

   Wymaga:
   - <body data-category="zamki" data-lang="pl">
   - załadowanego app.js (eksportuje window.photos)
   ───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const grid = document.querySelector('#hub-grid');
  if (!grid) return;

  // ───── Sprawdź, czy karty są już w HTML (prerender) ─────
  if (grid.querySelector('.trip')) {
    // Karty są statyczne — nic nie rób.
    // app.js i tak obsłuży dialogi i inne interakcje.
    return;
  }

  // ───── Fallback: grid pusty — renderuj po stronie klienta ─────
  const body = document.body;
  const category = body.dataset.category;
  const lang = body.dataset.lang || 'pl';

  if (!category) return;

  const tripsFile = lang === 'en' ? 'trips-en.json' : 'trips-pl.json';
  const photos = window.photos || {};

  fetch(tripsFile)
    .then(r => r.json())
    .then(trips => {
      const filtered = trips.filter(t => t.category === category);

      if (!filtered.length) {
        grid.innerHTML =
          '<p style="color:var(--muted);font-size:14px">' +
          (lang === 'en'
            ? 'No destinations in this category yet.'
            : 'Brak kierunków w tej kategorii.') +
          '</p>';
        return;
      }

      grid.innerHTML = filtered.map(t => {
        const img = photos[t.id] || 'hero-polska.webp';
        return (
          '<article class="trip">' +
          '<a href="kierunki/' + encodeURIComponent(t.id) + (lang === 'en' ? '-en' : '') + '.html" class="trip-link">' +
          '<div class="trip-art" style="background-image:url(\'images/' + img + '\');background-size:cover;background-position:center">' +
          '<span>' + t.place + '</span>' +
          '</div>' +
          '<p class="meta">' + t.region.toUpperCase() + ' <b>•</b> ' + t.days + '</p>' +
          '<h3>' + t.title + '</h3>' +
          '<p>' + t.text + '</p>' +
          '</a>' +
          '</article>'
        );
      }).join('');
    })
    .catch(err => {
      console.error('hub.js error:', err);
      grid.innerHTML = '<p style="color:#bc4f32">Błąd ładowania.</p>';
    });
})();