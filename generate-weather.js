#!/usr/bin/env node
/**
 * Generator strony pogodowej + danych do rankingu.
 *
 *   weather-points.json  – punkty prognozy (unikalne lokalizacje)
 *   pogoda.html          – „Gdzie w ten weekend słońce”
 *   pogoda-en.html       – wersja EN
 *
 * Prognozę pobiera przeglądarka (Open-Meteo, bez klucza API) — patrz weather.js.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const YEAR = new Date().getFullYear();

const tripsPl = JSON.parse(fs.readFileSync(path.join(ROOT, 'trips-pl.json'), 'utf8'));
const tripsEn = JSON.parse(fs.readFileSync(path.join(ROOT, 'trips-en.json'), 'utf8'));
const coords = JSON.parse(fs.readFileSync(path.join(ROOT, 'weather-coords.json'), 'utf8'));

function esc(s) {
  return String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── Punkty do rankingu (PL + EN) ──
// Ten sam punkt (np. Roztocze, kuchnia-roztocze, wsie-roztocze) liczymy raz —
// inaczej ranking pokazywałby tę samą miejscowość trzy razy.
const enById = new Map(tripsEn.map(t => [t.id, t]));
const seenPoints = new Set();
const points = [];
for (const t of tripsPl) {
  const c = coords[t.id];
  if (!c || c.multi) continue;
  const key = c.lat.toFixed(3) + ',' + c.lon.toFixed(3);
  if (seenPoints.has(key)) continue;
  seenPoints.add(key);
  const en = enById.get(t.id) || t;
  points.push({
    id: t.id,
    name: t.place,
    nameEn: en.place,
    region: t.region,
    regionEn: en.region,
    lat: c.lat,
    lon: c.lon,
    point: c.label,
    url: `kierunki/${t.id}.html`,
    urlEn: `kierunki/${t.id}-en.html`
  });
}

fs.writeFileSync(
  path.join(ROOT, 'weather-points.json'),
  JSON.stringify(points.map(p => ({
    id: p.id,
    name: p.name,
    nameEn: p.nameEn,
    region: p.region,
    regionEn: p.regionEn,
    lat: p.lat,
    lon: p.lon,
    url: p.url,
    urlEn: p.urlEn
  })), null, 2) + '\n',
  'utf8'
);

// ── Teksty ──
const L = {
  pl: {
    lang: 'pl',
    file: 'pogoda.html',
    title: 'Pogoda na trasie — gdzie w ten weekend słońce | Polska bliżej',
    desc: `Prognoza pogody dla ${points.length} miejsc w Polsce i ranking najlepszej pogody na najbliższy weekend. Dane Open-Meteo.`,
    eyebrow: 'POGODA NA TRASIE',
    h1a: 'Gdzie w ten weekend',
    h1b: 'będzie słońce.',
    lead: 'Ranking kierunków według prognozy na najbliższą sobotę i niedzielę. Temperatura, szansa na deszcz i wiatr — z jednego źródła, dla konkretnego miejsca, a nie „dla Polski”.',
    rankTitle: 'Najlepsza pogoda na weekend',
    rankNote: 'Ocena łączy temperaturę w dzień, prawdopodobieństwo opadów i wiatr. Kolejność zmienia się przy każdym odświeżeniu prognozy.',
    statPlaces: 'miejsc',
    statDays: 'dni weekendu',
    howTitle: 'Jak liczymy ocenę',
    howText: 'Punkt startowy 100. Odejmujemy za prawdopodobieństwo opadów, temperaturę w dzień poniżej 15°C lub powyżej 28°C, wiatr powyżej 20 km/h oraz kod pogody (deszcz, burza, mgła). Wynik to średnia z soboty i niedzieli, przycięta do 0–100.',
    sourceTitle: 'Skąd dane',
    sourceText: 'Prognoza pochodzi z Open-Meteo i jest pobierana w Twojej przeglądarce — nie zapisujemy jej na serwerze. Cache w przeglądarce: 30 minut.',
    loading: 'Ładowanie prognozy…',
    ctaTitle: 'Zaplanuj cały rok',
    ctaText: 'Kalendarz 52 weekendów podpowiada kierunek na każdy tydzień — a tutaj sprawdzisz, czy pogoda sprzyja.',
    ctaCalendar: 'Kalendarz weekendów →',
    ctaAll: 'Wszystkie kierunki →',
    nav: { dest: 'Kierunki', blog: 'Blog', weekends: 'Weekendy', weather: 'Pogoda', map: 'Mapa' },
    footer: { about: 'O projekcie', contact: 'Kontakt' },
    home: 'index.html'
  },
  en: {
    lang: 'en',
    file: 'pogoda-en.html',
    title: 'Weather in Poland — where the sun will be this weekend | Poland Closer',
    desc: `Weather forecast for ${points.length} places in Poland and a ranking of the best weekend weather. Data from Open-Meteo.`,
    eyebrow: 'WEATHER ON THE ROAD',
    h1a: 'Where the sun',
    h1b: 'will be this weekend.',
    lead: 'Destinations ranked by the forecast for the coming Saturday and Sunday. Temperature, chance of rain and wind — from one source, for a specific place, not “for Poland”.',
    rankTitle: 'Best weather this weekend',
    rankNote: 'The score combines daytime temperature, rain probability and wind. The order changes every time the forecast refreshes.',
    statPlaces: 'places',
    statDays: 'weekend days',
    howTitle: 'How we score',
    howText: 'Start at 100. We subtract for rain probability, daytime temperatures below 15°C or above 28°C, wind above 20 km/h, and the weather code (rain, storm, fog). The result is the average of Saturday and Sunday, clamped to 0–100.',
    sourceTitle: 'Where the data comes from',
    sourceText: 'The forecast comes from Open-Meteo and is fetched in your browser — nothing is stored on our server. Browser cache: 30 minutes.',
    loading: 'Loading forecast…',
    ctaTitle: 'Plan the whole year',
    ctaText: 'The 52-weekend calendar suggests a destination for every week — check here whether the weather plays along.',
    ctaCalendar: 'Weekend calendar →',
    ctaAll: 'All destinations →',
    nav: { dest: 'Destinations', blog: 'Blog', weekends: 'Weekends', weather: 'Weather', map: 'Map' },
    footer: { about: 'About', contact: 'Contact' },
    home: 'index-en.html'
  }
};

function render(lang) {
  const isPl = lang.lang === 'pl';
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: lang.title,
        description: lang.desc,
        url: `https://polandsecrets.com/${lang.file}`,
        inLanguage: isPl ? 'pl-PL' : 'en',
        isPartOf: { '@type': 'WebSite', name: 'Polska bliżej', url: 'https://polandsecrets.com/' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: isPl ? 'Start' : 'Home', item: 'https://polandsecrets.com/' },
          { '@type': 'ListItem', position: 2, name: isPl ? 'Pogoda na trasie' : 'Weather', item: `https://polandsecrets.com/${lang.file}` }
        ]
      },
      {
        '@type': 'ItemList',
        name: lang.rankTitle,
        numberOfItems: points.length,
        itemListElement: points.slice(0, 20).map((x, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: isPl ? x.name : x.nameEn,
          url: `https://polandsecrets.com/${isPl ? x.url : x.urlEn}`
        }))
      }
    ]
  };

  return `<!doctype html>
<!-- generated-by: generate-weather.js -->
<html lang="${lang.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(lang.title)}</title>
<meta name="description" content="${esc(lang.desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#18332c">
<link rel="canonical" href="https://polandsecrets.com/${lang.file}">
<link rel="alternate" hreflang="pl" href="https://polandsecrets.com/pogoda.html">
<link rel="alternate" hreflang="en" href="https://polandsecrets.com/pogoda-en.html">
<link rel="alternate" hreflang="x-default" href="https://polandsecrets.com/pogoda.html">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Polska bliżej">
<meta property="og:title" content="${esc(lang.h1a + ' ' + lang.h1b)}">
<meta property="og:description" content="${esc(lang.desc)}">
<meta property="og:url" content="https://polandsecrets.com/${lang.file}">
<meta property="og:image" content="https://polandsecrets.com/images/hero-polska.webp">
<meta property="og:locale" content="${isPl ? 'pl_PL' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">

<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="weekend.css">
<link rel="stylesheet" href="weather.css">
<link rel="stylesheet" href="search.css">
</head>
<body class="wk-page">
<header class="header">
  <a class="logo" href="${lang.home}" aria-label="Polska bliżej"><img src="images/logo.svg" alt="Polska bliżej" height="48"></a>
  <nav id="nav">
    <a href="${isPl ? 'index.html#kierunki' : 'index-en.html#kierunki'}">${lang.nav.dest}</a>
    <a href="${isPl ? 'blog.html' : 'blog-en.html'}">${lang.nav.blog}</a>
    <a href="${isPl ? 'weekendy.html' : 'weekendy-en.html'}">${lang.nav.weekends}</a>
    <a href="${lang.file}" aria-current="page">${lang.nav.weather}</a>
    <a href="${isPl ? 'mapa.html' : 'mapa-en.html'}">${lang.nav.map}</a>
    <div class="lang-group"><a href="pogoda.html" class="lang-switch${isPl ? ' active' : ''}" hreflang="pl" title="Wersja polska">PL</a><a href="pogoda-en.html" class="lang-switch${isPl ? '' : ' active'}" hreflang="en" title="English version">EN</a></div>
  </nav>
  <button class="menu" aria-controls="nav" aria-expanded="false">Menu</button>
</header>

<main>
  <section class="wk-hero">
    <div class="wk-hero-inner">
      <p class="label">${lang.eyebrow}</p>
      <h1>${lang.h1a}<br><em>${lang.h1b}</em></h1>
      <p class="wk-lead">${lang.lead}</p>
      <div class="wk-stats">
        <span><b>${points.length}</b> ${lang.statPlaces}</span>
        <span><b>2</b> ${lang.statDays}</span>
        <span><b>30</b> min cache</span>
      </div>
    </div>
  </section>

  <section class="wk-now">
    <header class="wk-month-head" style="margin-bottom:24px">
      <h2>${lang.rankTitle}</h2>
      <p>${lang.rankNote}</p>
    </header>
    <div class="wrank-list" data-weather-ranking data-lang="${lang.lang}" data-limit="12">
      <p class="wrank-loading">${lang.loading}</p>
    </div>
  </section>

  <section class="wk-month" style="padding-bottom:0">
    <div class="wk-month-head"><h2>${lang.howTitle}</h2></div>
    <p class="weather-multi-note" style="max-width:640px;margin-top:16px">${lang.howText}</p>
    <div class="wk-month-head" style="margin-top:40px"><h2>${lang.sourceTitle}</h2></div>
    <p class="weather-multi-note" style="max-width:640px;margin-top:16px">${lang.sourceText}</p>
  </section>

  <section class="wk-cta">
    <h2>${lang.ctaTitle}</h2>
    <p>${lang.ctaText}</p>
    <div class="wk-cta-actions">
      <a class="outline" href="${isPl ? 'weekendy.html' : 'weekendy-en.html'}">${lang.ctaCalendar}</a>
      <a class="outline" href="${isPl ? 'index.html#kierunki' : 'index-en.html#kierunki'}">${lang.ctaAll}</a>
    </div>
  </section>
</main>

<footer>
  <a class="logo" href="${lang.home}" aria-label="Polska bliżej"><img src="images/logo-white.svg" alt="Polska bliżej" height="42"></a>
  <p>© ${YEAR} Polska bliżej</p>
  <div><a href="${isPl ? 'index.html#o-nas' : 'index-en.html#o-nas'}">${lang.footer.about}</a><a href="mailto:hello@polandsecrets.com">${lang.footer.contact}</a></div>
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
<script src="weather.js" defer></script>
</body>
</html>
`;
}

fs.writeFileSync(path.join(ROOT, 'pogoda.html'), render(L.pl), 'utf8');
fs.writeFileSync(path.join(ROOT, 'pogoda-en.html'), render(L.en), 'utf8');

console.log('✅ pogoda.html + pogoda-en.html');
console.log(`   Unikalnych punktów prognozy: ${points.length}`);
console.log('   weather-points.json zapisany');
