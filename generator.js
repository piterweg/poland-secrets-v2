/**
 * Generator weekendu — Polska bliżej
 * Quiz dopasowujący kierunki: czas + preferencje + towarzystwo.
 * Wspiera PL i EN.
 */
(function () {
  'use strict';

  const I18N = {
    pl: {
      stepOf: (n, total) => 'KROK ' + n + ' z ' + total,
      step1Title: 'Ile masz czasu?',
      step2Title: 'Co Cię ciągnie?',
      step2Hint: 'Możesz wybrać kilka — lub pominąć',
      step3Title: 'Z kim jedziesz?',
      step3Hint: 'Opcjonalne — wpływa na dopasowanie',
      next: 'Dalej →',
      showResults: 'Pokaż propozycje →',
      back: '← Wstecz',
      changeAnswers: '← Zmień odpowiedzi',
      again: 'Losuj inne',
      allDestinations: 'Zobacz wszystkie kierunki →',
      resultsLabel: 'TWOJE PROPOZYCJE',
      resultsTitle: 'Oto co dla Ciebie pasuje',
      resultsEmptyTitle: 'Hmm, spróbujmy inaczej',
      resultsEmpty: 'Nie znaleźliśmy idealnego dopasowania. Spróbuj zmienić czas lub preferencje.',
      prefsLabel: 'wybrane preferencje',
      loading: 'Ładowanie…',
      explore: 'Odkryj trasę →',
      save: 'Zapisz',
      days: [
        { id: '1', label: '1 dzień', min: 1, max: 1 },
        { id: '2-3', label: '2–3 dni', min: 2, max: 3 },
        { id: '4-7', label: '4–7 dni', min: 4, max: 7 }
      ],
      prefs: [
        { id: 'gory', label: 'Góry i szlaki', icon: '⛰' },
        { id: 'woda', label: 'Woda i jeziora', icon: '🌊' },
        { id: 'miasta', label: 'Miasta i miasteczka', icon: '🏘' },
        { id: 'historia', label: 'Zamki i historia', icon: '🏰' },
        { id: 'kuchnia', label: 'Kuchnia regionalna', icon: '🍽' },
        { id: 'wsie', label: 'Wsie i spokój', icon: '🌾' }
      ],
      companions: [
        { id: 'solo', label: 'Sam / sama', icon: '🧍' },
        { id: 'couple', label: 'We dwoje', icon: '💑' },
        { id: 'family', label: 'Z dziećmi', icon: '👨‍👩‍👧' },
        { id: 'dog', label: 'Z psem', icon: '🐕' }
      ]
    },
    en: {
      stepOf: (n, total) => 'STEP ' + n + ' of ' + total,
      step1Title: 'How much time do you have?',
      step2Title: 'What draws you in?',
      step2Hint: 'You can pick more than one — or skip',
      step3Title: 'Who are you travelling with?',
      step3Hint: 'Optional — shapes the match',
      next: 'Next →',
      showResults: 'Show suggestions →',
      back: '← Back',
      changeAnswers: '← Change answers',
      again: 'Shuffle again',
      allDestinations: 'See all destinations →',
      resultsLabel: 'YOUR MATCHES',
      resultsTitle: 'Here\'s what fits you',
      resultsEmptyTitle: 'Hmm, let\'s try differently',
      resultsEmpty: 'No perfect match found. Try changing the time or preferences.',
      prefsLabel: 'selected preferences',
      loading: 'Loading…',
      explore: 'Explore route →',
      save: 'Save',
      days: [
        { id: '1', label: '1 day', min: 1, max: 1 },
        { id: '2-3', label: '2–3 days', min: 2, max: 3 },
        { id: '4-7', label: '4–7 days', min: 4, max: 7 }
      ],
      prefs: [
        { id: 'gory', label: 'Mountains & trails', icon: '⛰' },
        { id: 'woda', label: 'Water & lakes', icon: '🌊' },
        { id: 'miasta', label: 'Cities & towns', icon: '🏘' },
        { id: 'historia', label: 'Castles & history', icon: '🏰' },
        { id: 'kuchnia', label: 'Regional cuisine', icon: '🍽' },
        { id: 'wsie', label: 'Villages & calm', icon: '🌾' }
      ],
      companions: [
        { id: 'solo', label: 'Solo', icon: '🧍' },
        { id: 'couple', label: 'As a couple', icon: '💑' },
        { id: 'family', label: 'With kids', icon: '👨‍👩‍👧' },
        { id: 'dog', label: 'With a dog', icon: '🐕' }
      ]
    }
  };

  const CATEGORY_MAP = {
    gory: ['gory', 'parki-narodowe', 'natura', 'szlaki'],
    woda: ['woda'],
    miasta: ['miasta', 'miasteczka'],
    historia: ['zamki', 'unesco'],
    kuchnia: ['kuchnia'],
    wsie: ['wsie', 'podroze-tematyczne']
  };

  const COMPANION_BIAS = {
    solo: { gory: 2, natura: 2, szlaki: 2, miasteczka: 1 },
    couple: { miasta: 1, miasteczka: 2, zamki: 1, kuchnia: 2, woda: 1 },
    family: { woda: 2, 'parki-narodowe': 2, natura: 1, miasteczka: 1, unesco: 1 },
    dog: { natura: 3, gory: 2, wsie: 2, szlaki: 2, woda: 1 }
  };

  let trips = [];
  let lang = 'pl';
  let t = I18N.pl;
  let reshuffleKey = 0;

  let state = {
    step: 1,
    days: null,
    prefs: new Set(),
    companion: null
  };

  function detectLang() {
    const htmlLang = (document.documentElement.lang || 'pl').toLowerCase();
    if (htmlLang.startsWith('en')) return 'en';
    return 'pl';
  }

  /** Extract min/max day range from free-form strings like "2–3 dni", "5–7 days", "1 dzień". */
  function parseDays(str) {
    if (!str) return { min: 1, max: 7 };
    const s = String(str).toLowerCase().replace(/–/g, '-');
    const nums = s.match(/\d+/g);
    if (!nums || !nums.length) return { min: 1, max: 7 };
    const a = parseInt(nums[0], 10);
    const b = nums.length > 1 ? parseInt(nums[1], 10) : a;
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }

  function daysOverlap(tripDays, selected) {
    const range = parseDays(tripDays);
    return range.min <= selected.max && range.max >= selected.min;
  }

  function getSavedIds() {
    try {
      return JSON.parse(localStorage.getItem('pb-saved') || '[]');
    } catch (e) {
      return [];
    }
  }

  function scoreTrip(trip) {
    let score = 0;
    const selectedDays = t.days.find(function (d) { return d.id === state.days; });

    // Time is a hard requirement for ranking — must overlap
    if (!selectedDays || !daysOverlap(trip.days, selectedDays)) {
      return 0;
    }

    score += 10;
    const range = parseDays(trip.days);
    // Perfect fit inside selected window
    if (range.min >= selectedDays.min && range.max <= selectedDays.max) {
      score += 6;
    } else if (range.min === selectedDays.min || range.max === selectedDays.max) {
      score += 2;
    }

    if (state.prefs.size > 0) {
      var prefHits = 0;
      state.prefs.forEach(function (pref) {
        const cats = CATEGORY_MAP[pref] || [];
        if (cats.indexOf(trip.category) !== -1) {
          prefHits += 1;
          score += 10;
        }
      });
      // Bonus for multi-pref hits
      if (prefHits > 1) score += 3;
    } else {
      // No prefs → mild base so days-only still ranks
      score += 1;
    }

    if (state.companion && COMPANION_BIAS[state.companion]) {
      const bias = COMPANION_BIAS[state.companion];
      if (bias[trip.category]) score += bias[trip.category];
    }

    return score;
  }

  function getResults(limit) {
    limit = limit || 6;
    const scored = trips
      .map(function (trip) { return { trip: trip, score: scoreTrip(trip) }; })
      .filter(function (x) { return x.score > 0; })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        // Stable-ish rotation for "Losuj inne"
        const ha = (a.trip.id.charCodeAt(0) * 31 + reshuffleKey * 17 + a.trip.id.length) % 97;
        const hb = (b.trip.id.charCodeAt(0) * 31 + reshuffleKey * 17 + b.trip.id.length) % 97;
        return ha - hb;
      });

    const poolSize = Math.min(scored.length, Math.max(limit * 2, limit + 3));
    const pool = scored.slice(0, poolSize);
    if (pool.length <= limit) {
      return pool.map(function (x) { return x.trip; });
    }
    const rot = reshuffleKey % Math.max(1, pool.length - limit + 1);
    const rotated = pool.slice(rot).concat(pool.slice(0, rot));
    return rotated.slice(0, limit).map(function (x) { return x.trip; });
  }

  function photoFor(id) {
    if (window.photos && window.photos[id]) return window.photos[id];
    return id + '.webp';
  }

  function renderStep1(container) {
    container.innerHTML =
      '<div class="gen-step" data-step="1">' +
      '<p class="label">' + t.stepOf(1, 3) + '</p>' +
      '<h3>' + t.step1Title + '</h3>' +
      '<div class="gen-options" role="group" aria-label="' + t.step1Title + '">' +
      t.days.map(function (d) {
        var active = state.days === d.id;
        return '<button type="button" class="gen-option' + (active ? ' active' : '') +
          '" data-days="' + d.id + '" aria-pressed="' + active + '">' + d.label + '</button>';
      }).join('') +
      '</div>' +
      '<div class="gen-nav">' +
      '<button type="button" class="gen-next"' + (!state.days ? ' disabled' : '') + '>' + t.next + '</button>' +
      '</div></div>';

    container.querySelectorAll('[data-days]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.days = btn.dataset.days;
        render();
      });
    });
    var nextBtn = container.querySelector('.gen-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (state.days) { state.step = 2; render(); }
      });
    }
  }

  function renderStep2(container) {
    container.innerHTML =
      '<div class="gen-step" data-step="2">' +
      '<p class="label">' + t.stepOf(2, 3) + '</p>' +
      '<h3>' + t.step2Title + '</h3>' +
      '<p class="gen-hint">' + t.step2Hint + '</p>' +
      '<div class="gen-options gen-options--grid" role="group" aria-label="' + t.step2Title + '">' +
      t.prefs.map(function (p) {
        var active = state.prefs.has(p.id);
        return '<button type="button" class="gen-option' + (active ? ' active' : '') +
          '" data-pref="' + p.id + '" aria-pressed="' + active + '">' +
          '<span class="gen-icon" aria-hidden="true">' + p.icon + '</span> ' + p.label + '</button>';
      }).join('') +
      '</div>' +
      '<div class="gen-nav">' +
      '<button type="button" class="gen-back">' + t.back + '</button>' +
      '<button type="button" class="gen-next">' + t.next + '</button>' +
      '</div></div>';

    container.querySelectorAll('[data-pref]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.pref;
        if (state.prefs.has(id)) state.prefs.delete(id);
        else state.prefs.add(id);
        render();
      });
    });
    var backBtn = container.querySelector('.gen-back');
    if (backBtn) backBtn.addEventListener('click', function () { state.step = 1; render(); });
    var nextBtn = container.querySelector('.gen-next');
    if (nextBtn) nextBtn.addEventListener('click', function () { state.step = 3; render(); });
  }

  function renderStep3(container) {
    container.innerHTML =
      '<div class="gen-step" data-step="3">' +
      '<p class="label">' + t.stepOf(3, 3) + '</p>' +
      '<h3>' + t.step3Title + '</h3>' +
      '<p class="gen-hint">' + t.step3Hint + '</p>' +
      '<div class="gen-options gen-options--grid" role="group" aria-label="' + t.step3Title + '">' +
      t.companions.map(function (c) {
        var active = state.companion === c.id;
        return '<button type="button" class="gen-option' + (active ? ' active' : '') +
          '" data-companion="' + c.id + '" aria-pressed="' + active + '">' +
          '<span class="gen-icon" aria-hidden="true">' + c.icon + '</span> ' + c.label + '</button>';
      }).join('') +
      '</div>' +
      '<div class="gen-nav">' +
      '<button type="button" class="gen-back">' + t.back + '</button>' +
      '<button type="button" class="gen-next">' + t.showResults + '</button>' +
      '</div></div>';

    container.querySelectorAll('[data-companion]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.companion;
        state.companion = state.companion === id ? null : id;
        render();
      });
    });
    var backBtn = container.querySelector('.gen-back');
    if (backBtn) backBtn.addEventListener('click', function () { state.step = 2; render(); });
    var nextBtn = container.querySelector('.gen-next');
    if (nextBtn) nextBtn.addEventListener('click', function () { state.step = 4; render(); });
  }

  function renderResults(container) {
    var results = getResults(6);
    var daysOpt = t.days.find(function (d) { return d.id === state.days; });
    var daysLabel = daysOpt ? daysOpt.label : '';
    var metaParts = [daysLabel];
    if (state.prefs.size) metaParts.push(state.prefs.size + ' · ' + t.prefsLabel);
    if (state.companion) {
      var c = t.companions.find(function (x) { return x.id === state.companion; });
      if (c) metaParts.push(c.label);
    }

    var savedIds = getSavedIds();

    var body =
      '<div class="gen-step gen-results" data-step="4">' +
      '<p class="label">' + t.resultsLabel + '</p>' +
      '<h3>' + (results.length ? t.resultsTitle : t.resultsEmptyTitle) + '</h3>' +
      '<p class="gen-meta">' + metaParts.filter(Boolean).join(' · ') + '</p>';

    if (!results.length) {
      body += '<p class="gen-empty">' + t.resultsEmpty + '</p>';
    } else {
      body += '<div class="gen-results-grid" id="gen-results-grid"></div>';
    }

    body +=
      '<div class="gen-nav">' +
      '<button type="button" class="gen-back">' + t.changeAnswers + '</button>' +
      '<button type="button" class="gen-again">' + t.again + '</button>' +
      '<a href="#kierunki" class="gen-all">' + t.allDestinations + '</a>' +
      '</div></div>';

    container.innerHTML = body;

    var grid = container.querySelector('#gen-results-grid');
    if (grid && results.length) {
      results.forEach(function (trip) {
        var card = document.createElement('article');
        card.className = 'trip';
        var img = photoFor(trip.id);
        var isSaved = savedIds.indexOf(trip.id) !== -1;
        card.innerHTML =
          '<div class="trip-art ' + (trip.art || '') + '" data-id="' + trip.id +
          '" role="img" aria-label="' + trip.title +
          '" data-bg="images/' + img + '">' +
          '<span>' + (trip.place || '') + '</span>' +
          '<button class="save-trip" data-id="' + trip.id +
          '" aria-label="' + t.save + ' ' + trip.title + '">' + (isSaved ? '♥' : '♡') + '</button></div>' +
          '<p class="meta">' + (trip.region || '').toUpperCase() + ' <b>•</b> ' + trip.days + '</p>' +
          (window.PBBadges ? window.PBBadges.buildHtml(trip) : '') +
          '<h3>' + trip.title + '</h3>' +
          '<p>' + (trip.text || '') + '</p>' +
          '<button class="read open-trip" data-id="' + trip.id + '">' + t.explore + '</button>';
        grid.appendChild(card);
      });
      if (typeof observeTripArts === 'function') {
        observeTripArts(grid);
      } else {
        grid.querySelectorAll('.trip-art[data-bg]').forEach(function (el) {
          el.style.backgroundImage = "url('" + el.dataset.bg + "')";
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
          delete el.dataset.bg;
        });
      }
    }

    var backBtn = container.querySelector('.gen-back');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        state.step = 3;
        render();
      });
    }
    var againBtn = container.querySelector('.gen-again');
    if (againBtn) {
      againBtn.addEventListener('click', function () {
        reshuffleKey += 1;
        render();
      });
    }

    // Scroll results into view (smooth)
    try {
      var section = document.getElementById('generator');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) { /* ignore */ }
  }

  function render() {
    var root = document.getElementById('weekend-generator');
    if (!root) return;

    root.classList.add('gen-fade');
    // Small delay for fade-out feel, then paint
    window.requestAnimationFrame(function () {
      if (state.step === 1) renderStep1(root);
      else if (state.step === 2) renderStep2(root);
      else if (state.step === 3) renderStep3(root);
      else renderResults(root);
      root.classList.remove('gen-fade');
    });
  }

  async function init() {
    var root = document.getElementById('weekend-generator');
    if (!root) return;

    lang = detectLang();
    t = I18N[lang] || I18N.pl;

    root.innerHTML = '<p class="label">' + t.loading + '</p>';

    try {
      var file = lang === 'en' ? 'trips-en.json' : 'trips-pl.json';
      var res = await fetch(file);
      trips = await res.json();
      if (!Array.isArray(trips)) trips = [];
    } catch (e) {
      console.warn('Generator: failed to load trips', e);
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
