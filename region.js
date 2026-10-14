<<<<<<< HEAD
/* ─────────────────────────────────────────────────────────────
   region.js — obsługa stron województw
   ─────────────────────────────────────────────────────────────

   Wersja hybrydowa:
   - Jeśli karty są już w HTML (prerender) → nie rób nic
   - Jeśli grid jest pusty → pobierz JSON i wyrenderuj karty (fallback)

   Wymaga:
   - <body data-region="pomorskie" data-lang="pl">
   - załadowanego app.js (eksportuje window.photos)
   ───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const grid = document.querySelector('#hub-grid');
  if (!grid) return;

  // ───── Sprawdź, czy karty są już w HTML (prerender) ─────
  if (grid.querySelector('.trip')) {
    // Karty są statyczne — nic nie rób.
    return;
  }

  // ───── Fallback: grid pusty — renderuj po stronie klienta ─────
  const body = document.body;
  const slug = body.dataset.region;
  const lang = body.dataset.lang || 'pl';

  if (!slug) return;

  const REGION_ALIASES = {
    'pomorskie':             { pl: ['Pomorze'],                             en: ['Pomerania'] },
    'dolnoslaskie':          { pl: ['Dolny Śląsk'],                         en: ['Lower Silesia'] },
    'malopolskie':           { pl: ['Małopolska'],                          en: ['Lesser Poland'] },
    'podkarpackie':          { pl: ['Podkarpacie'],                         en: ['Subcarpathia'] },
    'podlaskie':             { pl: ['Podlasie'],                            en: ['Podlasie'] },
    'mazowieckie':           { pl: ['Mazowsze'],                            en: ['Masovia'] },
    'warminsko-mazurskie':   { pl: ['Warmia-Mazury'],                       en: ['Warmia-Masuria'] },
    'wielkopolskie':         { pl: ['Wielkopolska'],                        en: ['Greater Poland'] },
    'slaskie':               { pl: ['Śląsk', 'Śląskie'],                    en: ['Silesia'] },
    'zachodniopomorskie':    { pl: ['Zachodniopomorskie'],                  en: ['West Pomerania'] },
    'kujawsko-pomorskie':    { pl: ['Kujawy-Pomorze'],                      en: ['Kuyavia-Pomerania'] },
    'lubelskie':             { pl: ['Lubelszczyzna'],                       en: ['Lublin Region'] },
    'lodzkie':               { pl: ['Łódzkie'],                             en: ['Łódź Region'] },
    'opolskie':              { pl: ['Opolskie'],                            en: ['Opole Region'] },
    'swietokrzyskie':        { pl: ['Świętokrzyskie'],                      en: ['Holy Cross Region'] },
    'lubuskie':              { pl: ['Lubuskie'],                            en: ['Lubusz'] }
  };

  const aliases = (REGION_ALIASES[slug] || {})[lang] || [];
  const tripsFile = lang === 'en' ? 'trips-en.json' : 'trips-pl.json';
  const photos = window.photos || {};

  fetch(tripsFile)
    .then(r => r.json())
    .then(trips => {
      const filtered = trips.filter(t => aliases.includes(t.region));

      if (!filtered.length) {
        grid.innerHTML =
          '<p style="color:var(--muted);font-size:14px;grid-column:1/-1">' +
          (lang === 'en'
            ? 'No destinations in this region yet — coming soon.'
            : 'Brak kierunków w tym regionie — wkrótce.') +
          '</p>';
        return;
      }

      grid.innerHTML = filtered.map(t => {
        const img = photos[t.id] || 'hero-polska.webp';
        return (
          '<article class="trip">' +
          '<a href="article.html?id=' + encodeURIComponent(t.id) + '" class="trip-link">' +
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
      console.error('region.js error:', err);
      grid.innerHTML = '<p style="color:#bc4f32">Błąd ładowania.</p>';
    });
=======
/* ─────────────────────────────────────────────────────────────
   region.js — obsługa stron województw
   ─────────────────────────────────────────────────────────────

   Wersja hybrydowa:
   - Jeśli karty są już w HTML (prerender) → nie rób nic
   - Jeśli grid jest pusty → pobierz JSON i wyrenderuj karty (fallback)

   Wymaga:
   - <body data-region="pomorskie" data-lang="pl">
   - załadowanego app.js (eksportuje window.photos)
   ───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const grid = document.querySelector('#hub-grid');
  if (!grid) return;

  // ───── Sprawdź, czy karty są już w HTML (prerender) ─────
  if (grid.querySelector('.trip')) {
    // Karty są statyczne — nic nie rób.
    return;
  }

  // ───── Fallback: grid pusty — renderuj po stronie klienta ─────
  const body = document.body;
  const slug = body.dataset.region;
  const lang = body.dataset.lang || 'pl';

  if (!slug) return;

  const REGION_ALIASES = {
    'pomorskie':             { pl: ['Pomorze'],                             en: ['Pomerania'] },
    'dolnoslaskie':          { pl: ['Dolny Śląsk'],                         en: ['Lower Silesia'] },
    'malopolskie':           { pl: ['Małopolska'],                          en: ['Lesser Poland'] },
    'podkarpackie':          { pl: ['Podkarpacie'],                         en: ['Subcarpathia'] },
    'podlaskie':             { pl: ['Podlasie'],                            en: ['Podlasie'] },
    'mazowieckie':           { pl: ['Mazowsze'],                            en: ['Masovia'] },
    'warminsko-mazurskie':   { pl: ['Warmia-Mazury'],                       en: ['Warmia-Masuria'] },
    'wielkopolskie':         { pl: ['Wielkopolska'],                        en: ['Greater Poland'] },
    'slaskie':               { pl: ['Śląsk', 'Śląskie'],                    en: ['Silesia'] },
    'zachodniopomorskie':    { pl: ['Zachodniopomorskie'],                  en: ['West Pomerania'] },
    'kujawsko-pomorskie':    { pl: ['Kujawy-Pomorze'],                      en: ['Kuyavia-Pomerania'] },
    'lubelskie':             { pl: ['Lubelszczyzna'],                       en: ['Lublin Region'] },
    'lodzkie':               { pl: ['Łódzkie'],                             en: ['Łódź Region'] },
    'opolskie':              { pl: ['Opolskie'],                            en: ['Opole Region'] },
    'swietokrzyskie':        { pl: ['Świętokrzyskie'],                      en: ['Holy Cross Region'] },
    'lubuskie':              { pl: ['Lubuskie'],                            en: ['Lubusz'] }
  };

  const aliases = (REGION_ALIASES[slug] || {})[lang] || [];
  const tripsFile = lang === 'en' ? 'trips-en.json' : 'trips-pl.json';
  const photos = window.photos || {};

  fetch(tripsFile)
    .then(r => r.json())
    .then(trips => {
      const filtered = trips.filter(t => aliases.includes(t.region));

      if (!filtered.length) {
        grid.innerHTML =
          '<p style="color:var(--muted);font-size:14px;grid-column:1/-1">' +
          (lang === 'en'
            ? 'No destinations in this region yet — coming soon.'
            : 'Brak kierunków w tym regionie — wkrótce.') +
          '</p>';
        return;
      }

      grid.innerHTML = filtered.map(t => {
        const img = photos[t.id] || 'hero-polska.webp';
        return (
          '<article class="trip">' +
          '<a href="article.html?id=' + encodeURIComponent(t.id) + '" class="trip-link">' +
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
      console.error('region.js error:', err);
      grid.innerHTML = '<p style="color:#bc4f32">Błąd ładowania.</p>';
    });
>>>>>>> ccc4658c4a7d66f235c701a64926ebc8bd10c776
})();