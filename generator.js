/**
 * Generator weekendu — Polska bliżej
 * Prosty quiz dopasowujący kierunki na podstawie czasu i preferencji.
 */
(function () {
  'use strict';

  const CATEGORY_MAP = {
    gory: ['gory', 'parki-narodowe', 'natura', 'szlaki'],
    woda: ['woda'],
    miasta: ['miasta', 'miasteczka'],
    historia: ['zamki', 'unesco'],
    kuchnia: ['kuchnia'],
    wsie: ['wsie', 'podroze-tematyczne']
  };

  const DAYS_OPTIONS = [
    { id: '1', label: '1 dzień', min: 1, max: 1 },
    { id: '2-3', label: '2–3 dni', min: 2, max: 3 },
    { id: '4-7', label: '4–7 dni', min: 4, max: 7 }
  ];

  const PREF_OPTIONS = [
    { id: 'gory', label: 'Góry i szlaki', icon: '⛰' },
    { id: 'woda', label: 'Woda i jeziora', icon: '🌊' },
    { id: 'miasta', label: 'Miasta i miasteczka', icon: '🏘' },
    { id: 'historia', label: 'Zamki i historia', icon: '🏰' },
    { id: 'kuchnia', label: 'Kuchnia regionalna', icon: '🍽' },
    { id: 'wsie', label: 'Wsie i spokój', icon: '🌾' }
  ];

  let trips = [];
  let state = {
    step: 1,
    days: null,
    prefs: new Set()
  };

  function parseDays(str) {
    if (!str) return { min: 1, max: 7 };
    const s = str.toLowerCase();
    if (s.includes('1 dzień') || s.startsWith('1 ')) return { min: 1, max: 1 };
    if (s.includes('1–2') || s.includes('1-2')) return { min: 1, max: 2 };
    if (s.includes('2 dni') && !s.includes('–') && !s.includes('-')) return { min: 2, max: 2 };
    if (s.includes('2–3') || s.includes('2-3')) return { min: 2, max: 3 };
    if (s.includes('2–4') || s.includes('2-4')) return { min: 2, max: 4 };
    if (s.includes('3 dni') && !s.includes('–')) return { min: 3, max: 3 };
    if (s.includes('3–4') || s.includes('3-4')) return { min: 3, max: 4 };
    if (s.includes('3–5') || s.includes('3-5')) return { min: 3, max: 5 };
    if (s.includes('4–5') || s.includes('4-6') || s.includes('4–6')) return { min: 4, max: 6 };
    if (s.includes('5–7') || s.includes('5–8')) return { min: 5, max: 8 };
    if (s.includes('7')) return { min: 7, max: 14 };
    return { min: 1, max: 7 };
  }

  function daysOverlap(tripDays, selected) {
    const t = parseDays(tripDays);
    return t.min <= selected.max && t.max >= selected.min;
  }

  function scoreTrip(trip) {
    let score = 0;
    const selectedDays = DAYS_OPTIONS.find(d => d.id === state.days);
    if (selectedDays && daysOverlap(trip.days, selectedDays)) {
      score += 10;
      // prefer tighter match
      const t = parseDays(trip.days);
      if (t.min >= selectedDays.min && t.max <= selectedDays.max) score += 5;
    }

    if (state.prefs.size === 0) return score;

    for (const pref of state.prefs) {
      const cats = CATEGORY_MAP[pref] || [];
      if (cats.includes(trip.category)) {
        score += 8;
      }
    }
    return score;
  }

  function getResults(limit = 6) {
    const scored = trips
      .map(t => ({ trip: t, score: scoreTrip(t) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || Math.random() - 0.5);

    return scored.slice(0, limit).map(x => x.trip);
  }

  function renderStep1(container) {
    container.innerHTML = `
      <div class="gen-step" data-step="1">
        <p class="label">KROK 1 z 3</p>
        <h3>Ile masz czasu?</h3>
        <div class="gen-options">
          ${DAYS_OPTIONS.map(d => `
            <button type="button" class="gen-option ${state.days === d.id ? 'active' : ''}" data-days="${d.id}">
              ${d.label}
            </button>
          `).join('')}
        </div>
        <div class="gen-nav">
          <button type="button" class="gen-next" ${!state.days ? 'disabled' : ''}>Dalej →</button>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-days]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.days = btn.dataset.days;
        render();
      });
    });

    container.querySelector('.gen-next')?.addEventListener('click', () => {
      if (state.days) {
        state.step = 2;
        render();
      }
    });
  }

  function renderStep2(container) {
    container.innerHTML = `
      <div class="gen-step" data-step="2">
        <p class="label">KROK 2 z 3</p>
        <h3>Co Cię ciągnie?</h3>
        <p class="gen-hint">Możesz wybrać kilka</p>
        <div class="gen-options gen-options--grid">
          ${PREF_OPTIONS.map(p => `
            <button type="button" class="gen-option ${state.prefs.has(p.id) ? 'active' : ''}" data-pref="${p.id}">
              <span class="gen-icon">${p.icon}</span>
              ${p.label}
            </button>
          `).join('')}
        </div>
        <div class="gen-nav">
          <button type="button" class="gen-back">← Wstecz</button>
          <button type="button" class="gen-next">Pokaż propozycje →</button>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-pref]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.pref;
        if (state.prefs.has(id)) state.prefs.delete(id);
        else state.prefs.add(id);
        render();
      });
    });

    container.querySelector('.gen-back')?.addEventListener('click', () => {
      state.step = 1;
      render();
    });

    container.querySelector('.gen-next')?.addEventListener('click', () => {
      state.step = 3;
      render();
    });
  }

  function renderResults(container) {
    const results = getResults(6);
    const daysLabel = DAYS_OPTIONS.find(d => d.id === state.days)?.label || '';

    container.innerHTML = `
      <div class="gen-step gen-results" data-step="3">
        <p class="label">TWOJE PROPOZYCJE</p>
        <h3>${results.length ? 'Oto co dla Ciebie pasuje' : 'Hmm, spróbujmy inaczej'}</h3>
        <p class="gen-meta">${daysLabel}${state.prefs.size ? ' · wybrane preferencje' : ''}</p>

        ${results.length === 0 ? `
          <p class="gen-empty">Nie znaleźliśmy idealnego dopasowania. Spróbuj zmienić czas lub preferencje.</p>
        ` : `
          <div class="gen-results-grid" id="gen-results-grid"></div>
        `}

        <div class="gen-nav">
          <button type="button" class="gen-back">← Zmień odpowiedzi</button>
          <button type="button" class="gen-again">Losuj inne</button>
          <a href="#kierunki" class="gen-all">Zobacz wszystkie kierunki →</a>
        </div>
      </div>
    `;

    const grid = container.querySelector('#gen-results-grid');
    if (grid && results.length) {
      results.forEach(trip => {
        const card = document.createElement('article');
        card.className = 'trip';
        card.innerHTML = `
          <div class="trip-art ${trip.art || ''}" data-id="${trip.id}" role="img" aria-label="${trip.title}"
               style="background-image:url('images/${trip.id}.webp');background-size:cover;background-position:center">
            <span>${trip.place || ''}</span>
            <button class="save-trip" data-id="${trip.id}" aria-label="Zapisz ${trip.title}">♡</button>
          </div>
          <p class="meta">${(trip.region || '').toUpperCase()} <b>•</b> ${trip.days}</p>
          <h3>${trip.title}</h3>
          <p>${trip.text || ''}</p>
          <button class="read open-trip" data-id="${trip.id}">Odkryj trasę →</button>
        `;
        grid.appendChild(card);
      });

      // Re-bind existing app handlers if available
      if (typeof window.bindTripButtons === 'function') {
        window.bindTripButtons(grid);
      } else {
        // Fallback: trigger existing open-trip / save-trip via click simulation on document level
        grid.querySelectorAll('.open-trip, .save-trip').forEach(btn => {
          btn.addEventListener('click', (e) => {
            // Let the main app.js handle it if it uses event delegation
          });
        });
      }
    }

    container.querySelector('.gen-back')?.addEventListener('click', () => {
      state.step = 2;
      render();
    });

    container.querySelector('.gen-again')?.addEventListener('click', () => {
      // re-render with different random order among top matches
      render();
    });
  }

  function render() {
    const root = document.getElementById('weekend-generator');
    if (!root) return;

    if (state.step === 1) renderStep1(root);
    else if (state.step === 2) renderStep2(root);
    else renderResults(root);
  }

  async function init() {
    const root = document.getElementById('weekend-generator');
    if (!root) return;

    try {
      const lang = document.documentElement.lang === 'en' ? 'en' : 'pl';
      const file = lang === 'en' ? 'trips-en.json' : 'trips-pl.json';
      const res = await fetch(file);
      trips = await res.json();
      if (!Array.isArray(trips)) trips = [];
    } catch (e) {
      console.warn('Generator: nie udało się załadować trips', e);
      trips = [];
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
