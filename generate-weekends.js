#!/usr/bin/env node
/**
 * Generator kalendarza weekendów.
 *
 * Dla każdego weekendu roku wybiera kierunek z trips-pl.json / trips-en.json,
 * kierując się polem `bestSeason` (sezon), równowagą kategorii i regionów oraz
 * tym, żeby żaden kierunek nie powtarzał się zbyt często.
 *
 * Wynik: weekendy.html + weekendy-en.html
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const YEAR = new Date().getFullYear();
const TODAY = new Date();

// ─────────────────────────────────────────────────────────────
// Dane
// ─────────────────────────────────────────────────────────────
const tripsPl = JSON.parse(fs.readFileSync(path.join(ROOT, 'trips-pl.json'), 'utf8'));
const tripsEn = JSON.parse(fs.readFileSync(path.join(ROOT, 'trips-en.json'), 'utf8'));

// Mapa zdjęć z app.js (ten sam mechanizm co w pozostałych generatorach)
function loadPhotos() {
  const appJs = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const match = appJs.match(/const photos\s*=\s*\{([\s\S]*?)\};/);
  if (!match) return {};
  const photos = {};
  const re = /['"]?([\w-]+)['"]?\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(match[1])) !== null) photos[m[1].replace(/['"]/g, '')] = m[2];
  return photos;
}
const photos = loadPhotos();

// Style kalendarza wbudowujemy w HTML — strona ma wtedy komplet stylów nawet
// wtedy, gdy weekend.css nie zostanie wgrany na hosting (albo gdy podgląd
// otwiera sam plik HTML bez zasobów obok).
let WEEKEND_CSS = '';
try {
  WEEKEND_CSS = fs.readFileSync(path.join(ROOT, 'weekend.css'), 'utf8').trim();
  if (/<\/style/i.test(WEEKEND_CSS)) throw new Error('weekend.css zawiera niedozwolone "</style"');
} catch (e) {
  console.warn('⚠️  Nie udało się wczytać weekend.css:', e.message);
}

// Kalendarz dotyczy weekendu, więc odsiewamy wielodniowe trasy (5+ dni)
// oraz miejsca, które nie powinny być „propozycją na weekend”.
const EXCLUDED_IDS = new Set(['auschwitz']);
function firstDayCount(days) {
  const m = String(days || '').match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}
const TRIPS_PL = tripsPl.filter(t => !EXCLUDED_IDS.has(t.id) && firstDayCount(t.days) < 4);
const TRIPS_EN = tripsEn.filter(t => !EXCLUDED_IDS.has(t.id) && firstDayCount(t.days) < 4);

// Zimą lepiej sprawdzają się miasta, zamki i kuchnia niż lasy i szlaki.
const WINTER_FRIENDLY = new Set(['miasta', 'miasteczka', 'zamki', 'unesco', 'kuchnia']);
const WINTER_UNFRIENDLY = new Set(['parki-narodowe', 'natura', 'wsie', 'woda', 'szlaki', 'podroze-tematyczne']);

// ─────────────────────────────────────────────────────────────
// Sezony: "maj–wrzesień", "maj–czerwiec, wrzesień", "cały rok"
// ─────────────────────────────────────────────────────────────
const MONTH_WORDS = {
  'styczeń': 0, 'stycznia': 0, 'luty': 1, 'lutego': 1, 'marzec': 2, 'marca': 2,
  'kwiecień': 3, 'kwietnia': 3, 'maj': 4, 'maja': 4, 'czerwiec': 5, 'czerwca': 5,
  'lipiec': 6, 'lipca': 6, 'sierpień': 7, 'sierpnia': 7, 'wrzesień': 8, 'września': 8,
  'październik': 9, 'października': 9, 'listopad': 10, 'listopada': 10,
  'grudzień': 11, 'grudnia': 11
};

function parseSeason(raw) {
  const months = new Set();
  const text = String(raw || '').toLowerCase().trim();
  if (!text || text.includes('cały rok') || text.includes('caly rok')) {
    for (let i = 0; i < 12; i++) months.add(i);
    return months;
  }
  for (const part of text.split(',')) {
    const p = part.trim();
    if (!p) continue;
    const [a, b] = p.split('–').map(x => x.trim());
    if (b === undefined) {
      if (MONTH_WORDS[a] !== undefined) months.add(MONTH_WORDS[a]);
      continue;
    }
    const from = MONTH_WORDS[a];
    const to = MONTH_WORDS[b];
    if (from === undefined || to === undefined) continue;
    let i = from;
    for (let n = 0; n < 12; n++) {
      months.add(i);
      if (i === to) break;
      i = (i + 1) % 12;
    }
  }
  return months;
}

// Czy miesiąc jest w sezonie / obok sezonu (1 miesiąc od brzegu)
function seasonFit(season, month) {
  if (season.has(month)) return 10;
  if (season.has((month + 11) % 12) || season.has((month + 1) % 12)) return 3;
  return 0;
}

const decorated = trips => trips.map(t => ({
  ...t,
  season: parseSeason(t.bestSeason)
}));

// ─────────────────────────────────────────────────────────────
// Weekendy roku (sobota + niedziela, ISO tydzień soboty)
// ─────────────────────────────────────────────────────────────
function isoWeek(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function buildWeekends(year) {
  // Poniedziałek tygodnia 1 = 4 stycznia minus offset
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

  const weekends = [];
  for (let w = 1; w <= 52; w++) {
    const monday = new Date(week1Monday);
    monday.setUTCDate(week1Monday.getUTCDate() + (w - 1) * 7);
    const saturday = new Date(monday);
    saturday.setUTCDate(monday.getUTCDate() + 5);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    weekends.push({ week: w, saturday, sunday });
  }
  return weekends;
}

// ─────────────────────────────────────────────────────────────
// Dobór kierunków — deterministyczny, z równowagą kategorii i regionów
// ─────────────────────────────────────────────────────────────
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 997;
  return h;
}

function assign(weekends, trips) {
  const usage = new Map();
  const catCount = new Map();
  const regionCount = new Map();
  let prev = null;
  let prev2 = null;
  const picks = [];

  for (const wk of weekends) {
    const month = wk.saturday.getUTCMonth();

    const candidates = trips.map(t => {
      const used = usage.get(t.id) || 0;
      const fit = seasonFit(t.season, month);
      let score = fit;
      if (month === 11 || month <= 1) {
        if (WINTER_FRIENDLY.has(t.category)) score += 4;
        if (WINTER_UNFRIENDLY.has(t.category)) score -= 5;
      }
      score -= 14 * used; // drugie użycie tylko w ostateczności
      score -= 2 * Math.max(0, (catCount.get(t.category) || 0) - 3);
      score -= 3 * Math.max(0, (regionCount.get(t.region) || 0) - 1);
      if (prev) {
        if (t.category === prev.category) score -= 2;
        if (t.region === prev.region) score -= 2.5;
      }
      if (prev2 && t.region === prev2.region) score -= 1.5;
      score += (hash(t.id) % 11) / 10; // stabilny tie-break
      return { t, score, fit, used };
    }).sort((a, b) => b.score - a.score || a.t.id.localeCompare(b.t.id));

    const pick = candidates[0];
    usage.set(pick.t.id, (usage.get(pick.t.id) || 0) + 1);
    catCount.set(pick.t.category, (catCount.get(pick.t.category) || 0) + 1);
    regionCount.set(pick.t.region, (regionCount.get(pick.t.region) || 0) + 1);
    prev2 = prev;
    prev = pick.t;

    picks.push({ ...wk, month, trip: pick.t, fit: pick.fit, repeat: pick.used > 0 });
  }
  return picks;
}

// ─────────────────────────────────────────────────────────────
// Teksty
// ─────────────────────────────────────────────────────────────
const PL = {
  htmlLang: 'pl',
  months: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
  monthsGenitive: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
  monthsShort: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
  monthNotes: [
    'Zima w pełni: termy, uzdrowiska i puste szlaki w Beskidach.',
    'Najkrótszy miesiąc i najniższe ceny — plus foki nad Bałtykiem.',
    'Przedwiośnie: miasta bez tłumów i pierwsze spacery nad wodą.',
    'Wszystko kwitnie, a sezon jeszcze się nie zaczął.',
    'Najlepszy miesiąc w roku: długie dni, zielone szlaki, mało ludzi.',
    'Długie wieczory i woda, która zaczyna nadawać się do kąpieli.',
    'Szczyt sezonu — dlatego wybieramy miejsca, do których tłum nie dociera.',
    'Ciepło, ale tłoczno: kierunki zamiast kurortów.',
    'Złota polska jesień — statystycznie najlepszy miesiąc na wyjazd.',
    'Kolory, mgły i pustki na szlakach.',
    'Sztormy nad Bałtykiem, termy i miasta w jesiennym rytmie.',
    'Jarmarki, światło i góry w śniegu.'
  ],
  categories: {
    woda: 'nad wodę', gory: 'góry', miasta: 'miasto', natura: 'natura', zamki: 'zamki',
    unesco: 'UNESCO', miasteczka: 'miasteczka', szlaki: 'szlaki', kuchnia: 'kuchnia',
    wsie: 'wsie', 'podroze-tematyczne': 'trasa tematyczna', 'parki-narodowe': 'park narodowy'
  },
  fitIn: ['Środek sezonu — dokładnie teraz.', 'Pełnia sezonu — najlepszy moment.', 'Sezon w rozkwicie.'],
  fitStart: ['Sezon właśnie się zaczyna.', 'Pierwszy dobry weekend w sezonie.'],
  fitEnd: ['Ostatni dzwonek — sezon kończy się w tym miesiącu.', 'Końcówka sezonu, jeszcze warto.'],
  fitNear: ['Sezon tuż za rogiem.', 'Za chwilę sezon — teraz jest spokojniej.'],
  fitOff: ['Poza sezonem — mniej ludzi i niższe ceny.', 'Poza sezonem, ale to działa na plus.'],
  fitAllyear: ['Otwarte przez cały rok — teraz jest spokojniej.', 'Dostępne o każdej porze roku.'],
  fitLong: ['Najlepszy czas poza sezonem letnim.', 'Poza wakacjami — mniej ludzi i niższe ceny.'],
  seasonLabel: 'sezon:',
  labels: {
    eyebrow: 'KALENDARZ WEEKENDÓW ' + YEAR,
    h1a: '52 weekendy.',
    h1b: 'Każdy zaplanowany.',
    lead: 'Od styczniowych term po wrześniowe połoniny — każdy weekend roku ma kierunek dopasowany do sezonu. Koniec z pytaniem „dokąd tym razem?”.',
    now: 'NAJBLIŻSZY WEEKEND',
    nowCta: 'Zobacz plan wyjazdu',
    monthsNav: 'Przejdź do miesiąca',
    week: 'tydz.',
    past: 'miniony',
    nowTag: 'to ten weekend',
    ctaTitle: 'A jeśli chcesz wybrać sam?',
    ctaText: 'Zobacz wszystkie 124 kierunki albo wylosuj plan w generatorze weekendu.',
    ctaAll: 'Wszystkie kierunki',
    ctaGen: 'Generator weekendu',
    ctaWeather: 'Pogoda na weekend',
    title: `Kalendarz 52 weekendów ${YEAR} — dokąd jechać w każdy weekend | Polska bliżej`,
    desc: `Kalendarz weekendów ${YEAR}: 52 kierunki w Polsce dopasowane do sezonu. Sprawdź, dokąd jechać w ten weekend i zaplanuj cały rok.`,
    h1: 'Kalendarz 52 weekendów'
  }
};

const EN = {
  htmlLang: 'en',
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthsGenitive: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  monthNotes: [
    'Deep winter: thermal baths, spas and empty trails in the Beskids.',
    'The shortest month and the lowest prices — plus seals on the Baltic.',
    'Early spring: cities without crowds and the first waterside walks.',
    'Everything blooms and the season has not started yet.',
    'The best month of the year: long days, green trails, few people.',
    'Long evenings and water that finally invites a swim.',
    'Peak season — so we pick places the crowds never reach.',
    'Warm but busy: destinations instead of resorts.',
    'Golden Polish autumn — statistically the best month to travel.',
    'Colours, mist and empty trails.',
    'Storms on the Baltic, thermal baths and cities in an autumn rhythm.',
    'Christmas markets, lights and snow in the mountains.'
  ],
  categories: {
    woda: 'by the water', gory: 'mountains', miasta: 'city', natura: 'nature', zamki: 'castles',
    unesco: 'UNESCO', miasteczka: 'small towns', szlaki: 'trails', kuchnia: 'food',
    wsie: 'villages', 'podroze-tematyczne': 'themed route', 'parki-narodowe': 'national park'
  },
  fitIn: ['Right in the middle of the season.', 'Peak season — the best timing.', 'The season at its best.'],
  fitStart: ['The season is just starting.', 'The first good weekend of the season.'],
  fitEnd: ['Last call — the season ends this month.', 'End of the season, still worth it.'],
  fitNear: ['The season is just around the corner.', 'Almost season — quieter for now.'],
  fitOff: ['Off-season — fewer people and lower prices.', 'Off-season, which works in your favour.'],
  fitAllyear: ['Open all year round — quieter right now.', 'Available in every season.'],
  fitLong: ['Best outside the summer season.', 'Off the summer holidays — fewer people, lower prices.'],
  seasonLabel: 'season:',
  labels: {
    eyebrow: 'WEEKEND CALENDAR ' + YEAR,
    h1a: '52 weekends.',
    h1b: 'All planned.',
    lead: 'From January spas to September mountain meadows — every weekend of the year has a destination matched to the season. No more “where to this time?”.',
    now: 'NEXT WEEKEND',
    nowCta: 'See the trip plan',
    monthsNav: 'Jump to a month',
    week: 'week',
    past: 'past',
    nowTag: 'this weekend',
    ctaTitle: 'Rather choose yourself?',
    ctaText: 'Browse all 124 destinations or let the weekend generator pick for you.',
    ctaAll: 'All destinations',
    ctaGen: 'Weekend generator',
    ctaWeather: 'Weekend weather',
    title: `52-Weekend Calendar ${YEAR} — Where to Go Every Weekend in Poland | Poland Closer`,
    desc: `A ${YEAR} weekend calendar: 52 destinations in Poland matched to the season. See where to go this weekend and plan the whole year.`,
    h1: '52-weekend calendar'
  }
};

// Indeks sezonu w obrębie zakresu — do tekstu "start / środek / koniec"
function fitKind(season, month) {
  if (season.size >= 11) return 'allyear';
  if (!season.has(month)) return seasonFit(season, month) === 3 ? 'near' : 'off';
  if (season.size >= 8) return 'long';
  const prev = (month + 11) % 12;
  const next = (month + 1) % 12;
  if (!season.has(prev)) return 'start';
  if (!season.has(next)) return 'end';
  return 'in';
}

function fitText(lang, season, month, index) {
  const kind = fitKind(season, month);
  const pool =
    kind === 'in' ? lang.fitIn :
    kind === 'start' ? lang.fitStart :
    kind === 'end' ? lang.fitEnd :
    kind === 'near' ? lang.fitNear :
    kind === 'long' ? lang.fitLong :
    kind === 'allyear' ? lang.fitAllyear : lang.fitOff;
  return pool[index % pool.length];
}

// ─────────────────────────────────────────────────────────────
// Formatowanie dat
// ─────────────────────────────────────────────────────────────
function dateLabel(wk, lang) {
  const s = wk.saturday, e = wk.sunday;
  const sd = s.getUTCDate(), ed = e.getUTCDate();
  if (lang.htmlLang === 'pl') {
    const sm = lang.monthsGenitive[s.getUTCMonth()];
    const em = lang.monthsGenitive[e.getUTCMonth()];
    return s.getUTCMonth() === e.getUTCMonth()
      ? `${sd}–${ed} ${sm}`
      : `${sd} ${sm} – ${ed} ${em}`;
  }
  const sm = lang.months[s.getUTCMonth()];
  const em = lang.months[e.getUTCMonth()];
  return s.getUTCMonth() === e.getUTCMonth()
    ? `${sm} ${sd}–${ed}`
    : `${sm} ${sd} – ${em} ${ed}`;
}

function escapeHtml(s) {
  return String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
}

function isSameWeekend(wk, date) {
  const t = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const s = wk.saturday.getTime();
  const e = wk.sunday.getTime() + 86399000;
  return t >= s && t <= e;
}

// ─────────────────────────────────────────────────────────────
// HTML
// ─────────────────────────────────────────────────────────────
function render(lang, picks, file, altFile) {
  const L = lang.labels;
  const months = [];
  for (let i = 0; i < 12; i++) months.push(picks.filter(p => p.month === i));

  const nowIdx = picks.findIndex(p => isSameWeekend(p, TODAY));
  const nextIdx = nowIdx >= 0 ? nowIdx : picks.findIndex(p => p.saturday > TODAY);
  const featured = picks[nextIdx >= 0 ? nextIdx : 0];

  const tripUrl = t => `kierunki/${t.id}${lang.htmlLang === 'pl' ? '' : '-en'}.html`;
  const tripImg = t => `images/${photos[t.id] || 'hero-polska.webp'}`;

  const monthNav = months.map((list, i) =>
    list.length ? `<a href="#m-${i + 1}">${lang.months[i]}</a>` : ''
  ).join('');

  const monthSections = months.map((list, i) => {
    if (!list.length) return '';
    const rows = list.map((p, idx) => {
      const isNow = isSameWeekend(p, TODAY);
      const isPast = p.saturday < TODAY && !isNow;
      const cls = ['wk-item', isNow ? 'is-now' : '', isPast ? 'is-past' : ''].filter(Boolean).join(' ');
      const tag = isNow ? `<span class="wk-tag">${L.nowTag}</span>` : '';
      const satMonth = p.saturday.getUTCMonth();
      const sunMonth = p.sunday.getUTCMonth();
      const monthShort = satMonth === sunMonth
        ? lang.monthsShort[satMonth]
        : `${lang.monthsShort[satMonth]}/${lang.monthsShort[sunMonth]}`;
      return `<li class="${cls}">
        <div class="wk-date">
          <strong>${p.saturday.getUTCDate()}–${p.sunday.getUTCDate()}</strong>
          <span>${monthShort}</span>
          <em>${L.week} ${p.week}</em>
        </div>
        <div class="wk-body">
          <a class="wk-title" href="${tripUrl(p.trip)}">${escapeHtml(p.trip.title)}</a>
          <p class="wk-meta">${escapeHtml(p.trip.region.toUpperCase())} · ${escapeHtml(p.trip.days)} · ${lang.categories[p.trip.category] || p.trip.category}${tag}</p>
          <p class="wk-reason">${fitText(lang, p.trip.season, p.month, idx)} <span class="wk-season">${lang.seasonLabel} ${escapeHtml(p.trip.bestSeason)}</span></p>
        </div>
        <a class="wk-thumb" href="${tripUrl(p.trip)}" aria-hidden="true" tabindex="-1"><img src="${tripImg(p.trip)}" alt="" loading="lazy" width="160" height="120"></a>
      </li>`;
    }).join('\n');

    return `<section class="wk-month" id="m-${i + 1}">
      <header class="wk-month-head">
        <h2>${lang.months[i]}</h2>
        <p>${lang.monthNotes[i]}</p>
      </header>
      <ol class="wk-list">
${rows}
      </ol>
    </section>`;
  }).join('\n');

  const itemList = picks.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: p.trip.title,
    url: `https://polandsecrets.com/${tripUrl(p.trip)}`
  }));

  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: L.title,
        description: L.desc,
        url: `https://polandsecrets.com/${file}`,
        inLanguage: lang.htmlLang === 'pl' ? 'pl-PL' : 'en',
        isPartOf: { '@type': 'WebSite', name: 'Polska bliżej', url: 'https://polandsecrets.com/' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lang.htmlLang === 'pl' ? 'Start' : 'Home', item: 'https://polandsecrets.com/' },
          { '@type': 'ListItem', position: 2, name: L.h1, item: `https://polandsecrets.com/${file}` }
        ]
      },
      { '@type': 'ItemList', name: L.title, numberOfItems: picks.length, itemListElement: itemList }
    ]
  }, null, 2);

  const html = `<!doctype html>
<!-- generated-by: generate-weekends.js -->
<html lang="${lang.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapeHtml(L.title)}</title>
<meta name="description" content="${escapeHtml(L.desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#18332c">
<meta name="author" content="Polska bliżej">
<link rel="canonical" href="https://polandsecrets.com/${file}">
<link rel="alternate" hreflang="pl" href="https://polandsecrets.com/weekendy.html">
<link rel="alternate" hreflang="en" href="https://polandsecrets.com/weekendy-en.html">
<link rel="alternate" hreflang="x-default" href="https://polandsecrets.com/weekendy.html">
<link rel="icon" type="image/svg+xml" href="favicon.svg">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Polska bliżej">
<meta property="og:title" content="${escapeHtml(L.h1a + ' ' + L.h1b)}">
<meta property="og:description" content="${escapeHtml(L.desc)}">
<meta property="og:url" content="https://polandsecrets.com/${file}">
<meta property="og:image" content="https://polandsecrets.com/${tripImg(featured.trip)}">
<meta property="og:locale" content="${lang.htmlLang === 'pl' ? 'pl_PL' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(L.h1a + ' ' + L.h1b)}">
<meta name="twitter:description" content="${escapeHtml(L.desc)}">
<meta name="twitter:image" content="https://polandsecrets.com/${tripImg(featured.trip)}">

<script type="application/ld+json">
${jsonld}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<style>
/* ── weekend.css — wbudowane przez generate-weekends.js ── */
${WEEKEND_CSS}
</style>
<link rel="stylesheet" href="search.css">
</head>
<body class="wk-page">
<header class="header">
  <a class="logo" href="index.html" aria-label="Polska bliżej"><img src="images/logo.svg" alt="Polska bliżej" height="48"></a>
  <nav id="nav">
    <a href="index.html#kierunki">${lang.htmlLang === 'pl' ? 'Kierunki' : 'Destinations'}</a>
    <a href="blog.html">Blog</a>
    <a href="${file}" aria-current="page">${lang.htmlLang === 'pl' ? 'Weekendy' : 'Weekends'}</a>
    <a href="mapa.html">${lang.htmlLang === 'pl' ? 'Mapa' : 'Map'}</a>
    <div class="lang-group"><a href="weekendy.html" class="lang-switch${lang.htmlLang === 'pl' ? ' active' : ''}" hreflang="pl" title="Wersja polska">PL</a><a href="weekendy-en.html" class="lang-switch${lang.htmlLang === 'en' ? ' active' : ''}" hreflang="en" title="English version">EN</a></div>
  </nav>
  <button class="menu" aria-controls="nav" aria-expanded="false">Menu</button>
</header>

<main>
  <section class="wk-hero">
    <div class="wk-hero-inner">
      <p class="label">${L.eyebrow}</p>
      <h1>${L.h1a}<br><em>${L.h1b}</em></h1>
      <p class="wk-lead">${L.lead}</p>
      <div class="wk-stats">
        <span><b>52</b> ${lang.htmlLang === 'pl' ? 'weekendy' : 'weekends'}</span>
        <span><b>${new Set(picks.map(p => p.trip.id)).size}</b> ${lang.htmlLang === 'pl' ? 'kierunki' : 'destinations'}</span>
        <span><b>12</b> ${lang.htmlLang === 'pl' ? 'miesięcy' : 'months'}</span>
      </div>
    </div>
  </section>

  <section class="wk-now">
    <p class="label">${L.now}</p>
    <a class="wk-now-card" href="${tripUrl(featured.trip)}">
      <img src="${tripImg(featured.trip)}" alt="${escapeHtml(featured.trip.title)}" width="900" height="600" fetchpriority="high" decoding="async">
      <div class="wk-now-body">
        <p class="wk-now-date">${dateLabel(featured, lang)} · ${L.week} ${featured.week}</p>
        <h2>${escapeHtml(featured.trip.place)} — ${escapeHtml(featured.trip.title)}</h2>
        <p class="wk-meta">${escapeHtml(featured.trip.region.toUpperCase())} · ${escapeHtml(featured.trip.days)} · ${lang.categories[featured.trip.category] || featured.trip.category}</p>
        <p class="wk-reason">${fitText(lang, featured.trip.season, featured.month, 0)}</p>
        <span class="primary">${L.nowCta} →</span>
      </div>
    </a>
  </section>

  <nav class="wk-months" aria-label="${L.monthsNav}">
    ${monthNav}
  </nav>

${monthSections}

  <section class="wk-cta">
    <h2>${L.ctaTitle}</h2>
    <p>${L.ctaText}</p>
    <div class="wk-cta-actions">
      <a class="outline" href="index.html#kierunki">${L.ctaAll} →</a>
      <a class="outline" href="index.html#generator">${L.ctaGen} →</a>
      <a class="outline" href="${lang.htmlLang === 'pl' ? 'pogoda.html' : 'pogoda-en.html'}">${L.ctaWeather} →</a>
    </div>
  </section>
</main>

<footer>
  <a class="logo" href="index.html" aria-label="Polska bliżej"><img src="images/logo-white.svg" alt="Polska bliżej" height="42"></a>
  <p>© ${YEAR} Polska bliżej</p>
  <div><a href="index.html#o-nas">${lang.htmlLang === 'pl' ? 'O projekcie' : 'About'}</a><a href="index.html#kierunki">${lang.htmlLang === 'pl' ? 'Kierunki' : 'Destinations'}</a><a href="mailto:hello@polandsecrets.com">${lang.htmlLang === 'pl' ? 'Kontakt' : 'Contact'}</a></div>
</footer>

<script>
(function () {
  var menu = document.querySelector('.menu'), nav = document.getElementById('nav');
  if (!menu || !nav) return;
  var reset = function () {
    menu.setAttribute('aria-expanded', 'false');
    ['display','position','top','left','right','padding','background','flexDirection'].forEach(function (p) { nav.style[p] = ''; });
  };
  menu.onclick = function () {
    var open = menu.getAttribute('aria-expanded') === 'true';
    if (open) return reset();
    menu.setAttribute('aria-expanded', 'true');
    nav.style.display = 'flex'; nav.style.position = 'absolute'; nav.style.top = '78px';
    nav.style.left = '0'; nav.style.right = '0'; nav.style.padding = '20px';
    nav.style.background = 'var(--cream)'; nav.style.flexDirection = 'column';
  };
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', reset); });
})();
</script>
<script src="cookie-consent.js" defer></script>
<script src="search.js" defer></script>
</body>
</html>
`;

  fs.writeFileSync(path.join(ROOT, file), html, 'utf8');
  return { file, featured, nowIdx };
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
const weekends = buildWeekends(YEAR);
const picksPl = assign(weekends, decorated(TRIPS_PL));
const picksEn = assign(weekends, decorated(TRIPS_EN));

const rPl = render(PL, picksPl, 'weekendy.html', 'weekendy-en.html');
const rEn = render(EN, picksEn, 'weekendy-en.html', 'weekendy.html');

// ── Raport kontrolny ──
const byMonth = new Map();
for (const p of picksPl) byMonth.set(p.month, (byMonth.get(p.month) || 0) + 1);
const fitStats = { 10: 0, 3: 0, 0: 0 };
picksPl.forEach(p => fitStats[p.fit]++);
const repeats = picksPl.filter(p => p.repeat).map(p => p.trip.id);

console.log('✅ weekendy.html + weekendy-en.html');
console.log(`   Rok: ${YEAR} | weekendów: ${picksPl.length}`);
console.log(`   Unikalnych kierunków: ${new Set(picksPl.map(p => p.trip.id)).size}`);
console.log(`   Dopasowanie sezonu — w sezonie: ${fitStats[10]}, obok sezonu: ${fitStats[3]}, poza: ${fitStats[0]}`);
console.log(`   Powtórzone kierunki: ${repeats.length ? repeats.join(', ') : 'brak'}`);
console.log('   Weekendy w miesiącach:', [...byMonth.entries()].map(([m, n]) => `${PL.months[m]}:${n}`).join(' '));
const focus = picksPl[rPl.nowIdx >= 0 ? rPl.nowIdx : 0];
console.log(`   Najbliższy weekend: ${dateLabel(focus, PL)} — ${focus.trip.title} (${focus.trip.place})`);
