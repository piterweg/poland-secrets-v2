#!/usr/bin/env node
/**
 * generate-destinations.js
 *
 * Generuje STATYCZNE podstrony kierunków (zamiast article.html?id=… ładowanego JS-em):
 *   kierunki/<id>.html       – wersja PL
 *   kierunki/<id>-en.html    – wersja EN
 *   destinations-manifest.json – spis stron (czyta go generate-sitemap.js)
 *
 * Dane wejściowe (te same, które już masz w repo):
 *   trips-pl.json, trips-en.json, articles/<id>.json, articles/<id>-en.json,
 *   app.js (mapa `photos`), regions-data.json
 *
 * Użycie:
 *   node generate-destinations.js
 *   node generate-destinations.js --noindex-below 400   # strony krótsze niż 400 słów => noindex,follow
 *                                                       # i poza sitemapą (cienka treść)
 *   node generate-destinations.js --only baltyk,tatry   # tylko wybrane id (do podglądu)
 *   node generate-destinations.js --strict              # exit 1 przy błędach danych
 *
 * Kolejność budowania całej strony:
 *   node generate-destinations.js && node prerender.js && node generate-sitemap.js
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/* ─────────────── konfiguracja ─────────────── */

const DOMAIN = 'https://polandsecrets.com';
const SITE = 'Polska bliżej';
const OUT_DIR = 'kierunki';
const MANIFEST = 'destinations-manifest.json';
const MARKER = '<!-- generated-by: generate-destinations.js -->';
const IMAGES_DIR = 'images';
const FALLBACK_IMAGE = 'hero-polska.webp';

const args = process.argv.slice(2);
const flag = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : null;
};
const NOINDEX_BELOW = Number(flag('--noindex-below') || 0);
const ONLY = flag('--only') ? new Set(flag('--only').split(',').map((s) => s.trim())) : null;
const STRICT = args.includes('--strict');

const T = {
  pl: {
    htmlLang: 'pl',
    ogLocale: 'pl_PL',
    ogAlt: 'en_US',
    home: 'Start',
    indexFile: 'index.html',
    blogFile: 'blog.html',
    nav: ['Kierunki', 'Blog'],
    navLabel: 'Ścieżka nawigacji',
    plan: 'Plan wyjazdu',
    tip: 'Wskazówka',
    related: 'Zobacz też',
    galleryAlt: 'zdjęcie z podróży',
    privacy: ['Polityka prywatności', 'polityka-prywatnosci.html'],
    cookies: ['Cookies', 'cookies.html'],
    about: 'O projekcie',
    contact: 'Kontakt',
    menu: 'Menu',
    langTitle: { pl: 'Wersja polska', en: 'English version' },
    suffix: '',
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    ogAlt: 'pl_PL',
    home: 'Home',
    indexFile: 'index-en.html',
    blogFile: 'blog-en.html',
    nav: ['Destinations', 'Blog'],
    navLabel: 'Breadcrumb',
    plan: 'Trip plan',
    tip: 'Tip',
    related: 'See also',
    galleryAlt: 'travel photo',
    privacy: ['Privacy policy', 'polityka-prywatnosci-en.html'],
    cookies: ['Cookies', 'cookies-en.html'],
    about: 'About',
    contact: 'Contact',
    menu: 'Menu',
    langTitle: { pl: 'Wersja polska', en: 'English version' },
    suffix: '-en',
  },
};

// huby tematyczne (kategoria → plik huba) – zgodnie z prerender.js
const HUBS = {
  zamki: { file: 'zamki', pl: 'Zamki i pałace', en: 'Castles & palaces' },
  unesco: { file: 'unesco', pl: 'Obiekty UNESCO', en: 'UNESCO sites' },
  miasteczka: { file: 'miasteczka', pl: 'Małe miasta', en: 'Small towns' },
  szlaki: { file: 'szlaki', pl: 'Szlaki rowerowe', en: 'Cycling routes' },
  kuchnia: { file: 'kuchnia', pl: 'Kuchnia regionalna', en: 'Regional cuisine' },
  wsie: { file: 'wsie', pl: 'Wsie i regiony wiejskie', en: 'Villages & rural regions' },
  'podroze-tematyczne': { file: 'podroze-tematyczne', pl: 'Podróże tematyczne', en: 'Themed journeys' },
  'parki-narodowe': { file: 'parki-narodowe', pl: 'Parki narodowe', en: 'National parks' },
};

/* ─────────────── pomocnicze ─────────────── */

const esc = (s = '') =>
  String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const ENTITIES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>',
  '&quot;': '"', '&#39;': "'", '&apos;': "'", '&hellip;': '…',
  '&mdash;': '—', '&ndash;': '–', '&oacute;': 'ó', '&aacute;': 'á',
  '&eacute;': 'é', '&iacute;': 'í', '&ntilde;': 'ñ', '&uuml;': 'ü',
  '&oelig;': 'œ', '&sect;': '§', '&copy;': '©', '&reg;': '®',
};
const stripTags = (s = '') =>
  String(s)
    .replace(/<\/?(strong|em|b|i|a|span|u|mark)(\s[^>]*)?>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim();
const words = (s) => stripTags(s).split(/\s+/).filter(Boolean).length;
const jsonLd = (o) => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2).replace(/</g, '\\u003c')}\n</script>`;
const sha = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
const today = new Date().toISOString().slice(0, 10);

const problems = []; // błędy danych
const notes = []; // ostrzeżenia
const bad = (m) => problems.push(m);
const note = (m) => { if (!notes.includes(m)) notes.push(m); };

function readJson(file, { optional = false } = {}) {
  if (!fs.existsSync(file)) {
    if (!optional) bad(`brak pliku ${file}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    bad(`uszkodzony JSON: ${file} (${e.message})`);
    return null;
  }
}

function loadPhotos() {
  const js = fs.readFileSync('app.js', 'utf8');
  const m = js.match(/const photos\s*=\s*\{([\s\S]*?)\};/);
  const out = {};
  if (!m) {
    bad('nie znaleziono mapy `photos` w app.js (oczekiwano `const photos = {...};`)');
    return out;
  }
  const re = /['"]?([\w-]+)['"]?\s*:\s*['"]([^'"]+)['"]/g;
  let x;
  while ((x = re.exec(m[1])) !== null) out[x[1]] = x[2];
  if (Object.keys(out).length === 0) {
    bad('mapa `photos` w app.js jest pusta – wszystkie strony użyją hero-polska.webp');
  }
  return out;
}

const imageExists = (f) => !!f && fs.existsSync(path.join(IMAGES_DIR, f));

/* ─────────────── wczytanie danych ─────────────── */

const tripsPl = readJson('trips-pl.json') || [];
const tripsEn = readJson('trips-en.json') || [];
const regions = readJson('regions-data.json', { optional: true }) || [];
const photos = loadPhotos();
const enById = new Map(tripsEn.map((t) => [t.id, t]));

const prevManifest = readJson(MANIFEST, { optional: true }) || { items: {} };

// alias regionu → slug (z regions-data.json)
const aliasToSlug = { pl: new Map(), en: new Map() };
const regionName = { pl: {}, en: {} };
for (const r of regions) {
  regionName.pl[r.slug] = r.namePl;
  regionName.en[r.slug] = r.nameEn;
  for (const lang of ['pl', 'en']) for (const a of (r.aliases && r.aliases[lang]) || []) aliasToSlug[lang].set(a, r.slug);
}
function regionSlugOf(regionLabel, lang) {
  if (!regionLabel) return null;
  const map = aliasToSlug[lang];
  if (map.has(regionLabel)) return map.get(regionLabel);
  // „Małopolska i Podkarpacie”, „Lubuskie i Małopolska” → pierwszy człon
  for (const part of regionLabel.split(/\s+(?:i|and)\s+/i)) if (map.has(part.trim())) return map.get(part.trim());
  return null;
}

/* ─────────────── budowa danych strony ─────────────── */

function loadArticle(id, lang) {
  const f = path.join('articles', `${id}${T[lang].suffix}.json`);
  return readJson(f, { optional: true });
}

function buildModel(trip, lang) {
  const id = trip.id;
  const art = loadArticle(id, lang);
  const hasArticle = !!(art && art.body);
  if (!hasArticle) note(`${id} [${lang}]: brak articles/${id}${T[lang].suffix}.json – strona z samych danych karty (noindex)`);

  const lead = stripTags((art && art.lead) || trip.text || '');
  let description = lead;
  if (description.length > 160) description = description.slice(0, 157).replace(/\s+\S*$/, '') + '…';

  // zdjęcie główne: mapa photos (app.js) → pierwsze istniejące zdjęcie z galerii → hero-polska.webp
  let hero = photos[id];
  if (!imageExists(hero)) {
    const alt = ((art && art.gallery) || []).find(imageExists);
    note(`${id}: brak pliku images/${hero || '(brak wpisu w photos)'} – używam ${alt || FALLBACK_IMAGE}`);
    hero = alt || FALLBACK_IMAGE;
  }
  const gallery = ((art && art.gallery) || []).filter((g) => {
    const ok = imageExists(g);
    if (!ok) note(`${id} [${lang}]: galeria wskazuje brakujący plik images/${g}`);
    return ok;
  });

  const baseTitle = `${trip.place} — ${trip.title}`;
  const title = baseTitle.length + SITE.length + 3 <= 62 ? `${baseTitle} | ${SITE}` : baseTitle;

  const wc = words([lead, art && art.body, (trip.plan || []).join(' '), art && art.tip].filter(Boolean).join(' '));
  const regionSlug = regionSlugOf(trip.region, lang);

  return {
    id,
    lang,
    trip,
    art: hasArticle ? art : null,
    place: trip.place,
    h1: baseTitle,
    title,
    description,
    lead,
    hero,
    gallery,
    plan: trip.plan || [],
    tip: (art && art.tip) || '',
    body: hasArticle ? art.body : '',
    regionSlug,
    wc,
    indexable: hasArticle && wc >= NOINDEX_BELOW,
    path: `${OUT_DIR}/${id}${T[lang].suffix}.html`,
  };
}

/* ─────────────── szablon strony ─────────────── */

const abs = (p) => `${DOMAIN}/${p}`;
const imgAbs = (f) => `${DOMAIN}/images/${f}`;

function renderPage(m, ctx) {
  const L = T[m.lang];
  const other = m.lang === 'pl' ? 'en' : 'pl';
  const self = ctx.pages[m.lang].get(m.id);
  const twin = ctx.pages[other].get(m.id);
  const url = abs(self.path);

  // ścieżka okruszków: Start › Region (albo huba tematycznego) › miejsce
  let mid = null;
  if (m.regionSlug) {
    mid = { name: regionName[m.lang][m.regionSlug] || m.trip.region, href: `${m.regionSlug}${L.suffix}.html` };
  } else if (HUBS[m.trip.category]) {
    mid = { name: HUBS[m.trip.category][m.lang], href: `${HUBS[m.trip.category].file}${L.suffix}.html` };
  }
  const crumbs = [{ name: L.home, href: L.indexFile }, ...(mid ? [mid] : []), { name: m.place, href: null }];

  const ldCrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.href ? abs(c.href) : url,
    })),
  };
  const ldDest = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: m.place,
    description: m.description,
    image: imgAbs(m.hero),
    url,
    inLanguage: m.lang === 'pl' ? 'pl-PL' : 'en-US',
    ...(m.trip.category ? { touristType: m.trip.category } : {}),
    ...(m.trip.region
      ? { containedInPlace: { '@type': 'AdministrativeArea', name: m.trip.region } }
      : {}),
    isPartOf: { '@type': 'WebSite', name: SITE, url: `${DOMAIN}/` },
  };

  // „Zobacz też”: do 3 stron z tego samego regionu (najpierw ta sama kategoria), potem ta sama kategoria
  const pool = ctx.models[m.lang].filter((o) => o.id !== m.id);
  const sameRegion = m.regionSlug ? pool.filter((o) => o.regionSlug === m.regionSlug) : [];
  const sameCat = pool.filter((o) => o.trip.category === m.trip.category && !sameRegion.includes(o));
  const score = (o) => (o.trip.category === m.trip.category ? 1 : 0);
  const related = [...sameRegion.sort((a, b) => score(b) - score(a)), ...sameCat].slice(0, 3);

  const robots = m.indexable
    ? 'index, follow, max-image-preview:large'
    : 'noindex, follow';
  const hreflang = twin
    ? `<link rel="alternate" hreflang="pl" href="${abs(m.lang === 'pl' ? self.path : twin.path)}">
<link rel="alternate" hreflang="en" href="${abs(m.lang === 'en' ? self.path : twin.path)}">
<link rel="alternate" hreflang="x-default" href="${abs(m.lang === 'pl' ? self.path : twin.path)}">`
    : '';

  const langSwitch = (code) => {
    if (code === m.lang) {
      return `<span class="lang-switch active" aria-current="true" title="${esc(L.langTitle[code])}">${code.toUpperCase()}</span>`;
    }
    const target = ctx.pages[code].get(m.id);
    const fallback = code === 'pl' ? 'index.html' : 'index-en.html';
    const href = target ? target.path.replace(`${OUT_DIR}/`, '') : `../${fallback}`;
    return `<a href="${href}" class="lang-switch" hreflang="${code}" title="${esc(L.langTitle[code])}">${code.toUpperCase()}</a>`;
  };

  return `<!doctype html>
${MARKER}
<html lang="${L.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.description)}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#18332c">
<meta name="author" content="${SITE}">
<link rel="canonical" href="${url}">
${hreflang}
<link rel="icon" type="image/svg+xml" href="../favicon.svg">

<meta property="og:type" content="place">
<meta property="og:site_name" content="${SITE}">
<meta property="og:title" content="${esc(m.h1)}">
<meta property="og:description" content="${esc(m.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${imgAbs(m.hero)}">
<meta property="og:image:alt" content="${esc(m.place)}">
<meta property="og:locale" content="${L.ogLocale}">
${twin ? `<meta property="og:locale:alternate" content="${L.ogAlt}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(m.h1)}">
<meta name="twitter:description" content="${esc(m.description)}">
<meta name="twitter:image" content="${imgAbs(m.hero)}">

${jsonLd(ldDest)}
${jsonLd(ldCrumbs)}

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap" rel="stylesheet">
<link rel="preload" href="https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRggexSg.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtXK-F2qC0s.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="../article.css">
<link rel="stylesheet" href="../destination.css">
<link rel="stylesheet" href="../search.css">
<link rel="stylesheet" href="../style.css" media="print" onload="this.media='all'">
</head>
<body>
<header class="header">
  <a class="logo" href="../${L.indexFile}" aria-label="${SITE}"><img src="../images/logo.svg" alt="${SITE}" height="48"></a>
  <nav id="nav">
    <a href="../${L.indexFile}#kierunki">${esc(L.nav[0])}</a>
    <a href="../${L.blogFile}">${esc(L.nav[1])}</a>
    <div class="lang-group">${langSwitch('pl')}${langSwitch('en')}</div>
  </nav>
  <button class="menu" aria-controls="nav" aria-expanded="false">${L.menu}</button>
</header>

<main>
  <section class="article-hero">
    <img src="../images/${esc(m.hero)}" alt="${esc(m.place)}" class="article-image" width="1200" height="800" fetchpriority="high" decoding="async">
    <div class="article-header">
      <p class="label">${esc((m.trip.region || '').toUpperCase())}</p>
      <h1>${esc(m.h1)}</h1>
      <div class="article-meta"><span>${esc(m.trip.days || '')}</span></div>
    </div>
  </section>

  <div class="article-container">
    <nav class="dest-breadcrumbs" aria-label="${esc(L.navLabel)}">
      ${crumbs
        .map((c, i) =>
          c.href
            ? `<a href="../${c.href}">${esc(c.name)}</a>`
            : `<span aria-current="page">${esc(c.name)}</span>`
        )
        .join('<span aria-hidden="true">›</span>')}
    </nav>

    <article class="article-content">
${
  m.gallery.length
    ? `      <div class="article-gallery">
${m.gallery
  .map((g, i) => `        <img src="../images/${esc(g)}" class="gallery-img" alt="${esc(m.place)} — ${esc(L.galleryAlt)} ${i + 1}" loading="lazy">`)
  .join('\n')}
      </div>
`
    : ''
}      <div class="content-grid">
        <div class="main-text">
          <p class="lead">${esc(m.lead)}</p>
${
  m.body
    ? `          <div class="body-text">
${m.body}
          </div>
`
    : ''
}        </div>
        </div>
        <aside class="article-aside">
${
  m.plan.length
    ? `          <div class="aside-card">
            <h2>${esc(L.plan)}</h2>
            <ol>
${m.plan.map((p) => `              <li>${esc(p)}</li>`).join('\n')}
            </ol>
          </div>
`
    : ''
}${
    m.tip
      ? `          <div class="aside-card">
            <h2>${esc(L.tip)}</h2>
            <p>${esc(m.tip)}</p>
          </div>
`
      : ''
  }        </aside>
      </div>
    </article>
${
  related.length
    ? `
    <section class="dest-related">
      <h2>${esc(L.related)}</h2>
      <div class="dest-related-grid">
${related
  .map(
    (r) => `        <a class="dest-related-card" href="${r.id}${L.suffix}.html">
          <span class="label">${esc((r.trip.region || '').toUpperCase())}</span>
          <strong>${esc(r.place)}</strong>
          <span>${esc(r.trip.title)}</span>
        </a>`
  )
  .join('\n')}
      </div>
    </section>
`
    : ''
}  </div>
</main>

<footer>
  <a class="logo" href="../${L.indexFile}" aria-label="${SITE}"><img src="../images/logo-white.svg" alt="${SITE}" height="42"></a>
  <p>© ${new Date().getFullYear()} ${SITE}</p>
  <div><a href="../${L.indexFile}#o-nas">${esc(L.about)}</a><a href="../${L.privacy[1]}">${esc(L.privacy[0])}</a><a href="../${L.cookies[1]}">${esc(L.cookies[0])}</a><a href="mailto:hello@polandsecrets.com">${esc(L.contact)}</a></div>
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
<script src="../cookie-consent.js" defer></script>
<script src="../search.js" defer></script>
</body>
</html>
`;
}

/* ─────────────── główna pętla ─────────────── */

const ids = tripsPl.map((t) => t.id);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) bad(`zduplikowane id w trips-pl.json: ${[...new Set(dup)].join(', ')}`);

const selected = (t) => !ONLY || ONLY.has(t.id);

const models = { pl: [], en: [] };
for (const t of tripsPl) if (selected(t)) models.pl.push(buildModel(t, 'pl'));
for (const t of tripsEn) if (selected(t) && ids.includes(t.id)) models.en.push(buildModel(t, 'en'));
for (const t of tripsPl) if (selected(t) && !enById.has(t.id)) note(`${t.id}: brak wpisu w trips-en.json – nie powstanie wersja EN`);

const pages = { pl: new Map(models.pl.map((m) => [m.id, m])), en: new Map(models.en.map((m) => [m.id, m])) };
const ctx = { pages, models };

// artykuły-sieroty (np. literówka w nazwie pliku)
if (fs.existsSync('articles')) {
  const known = new Set(tripsPl.map((t) => t.id));
  for (const f of fs.readdirSync('articles')) {
    const m = f.match(/^(.+?)(-en)?\.json$/);
    if (!m) note(`articles/${f}: nietypowa nazwa pliku – ignorowany`);
    else if (!known.has(m[1])) note(`articles/${f}: brak kierunku "${m[1]}" w trips-pl.json (literówka w nazwie?)`);
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const written = new Set();
const items = ONLY ? JSON.parse(JSON.stringify(prevManifest.items || {})) : {};

for (const lang of ['pl', 'en']) {
  for (const m of models[lang]) {
    const html = renderPage(m, ctx);
    fs.writeFileSync(m.path, html);
    written.add(path.basename(m.path));

    const hash = sha(html.replace(/<footer>[\s\S]*<\/footer>/, '')); // rok w stopce nie zmienia lastmod
    const prev = (prevManifest.items[m.id] || {})[lang];
    items[m.id] = items[m.id] || {};
    items[m.id][lang] = {
      path: m.path,
      title: m.h1,
      image: m.hero,
      words: m.wc,
      indexable: m.indexable,
      hash,
      lastmod: prev && prev.hash === hash ? prev.lastmod : today,
    };
  }
}

// usuń wygenerowane wcześniej strony, których już nie ma w danych
if (!ONLY) {
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (written.has(f) || !f.endsWith('.html')) continue;
    const p = path.join(OUT_DIR, f);
    if (fs.readFileSync(p, 'utf8').includes(MARKER)) {
      fs.unlinkSync(p);
      note(`usunięto nieaktualną stronę ${p}`);
    }
  }
  for (const id of Object.keys(items)) if (!pages.pl.has(id) && !pages.en.has(id)) delete items[id];
}

fs.writeFileSync(MANIFEST, JSON.stringify({ domain: DOMAIN, items }, null, 2) + '\n');

/* ─────────────── raport ─────────────── */

const all = [...models.pl, ...models.en];
const thin = all.filter((m) => m.wc < 800);
const longTitle = all.filter((m) => m.title.length > 65);
const wcs = models.pl.map((m) => m.wc).sort((a, b) => a - b);
const noidx = all.filter((m) => !m.indexable);

console.log('\n══════════════════════════════════════');
console.log(`✅ Kierunki: PL ${models.pl.length}, EN ${models.en.length} → ${OUT_DIR}/`);
if (wcs.length) console.log(`   Długość (PL, słowa): min ${wcs[0]}, mediana ${wcs[Math.floor(wcs.length / 2)]}, max ${wcs[wcs.length - 1]}`);
console.log(`   Poniżej 800 słów:    ${thin.length} z ${all.length} stron (cienka treść)`);
console.log(`   noindex (próg ${NOINDEX_BELOW}):   ${noidx.length}${NOINDEX_BELOW ? '' : '  (użyj --noindex-below N, żeby wyłączyć cienkie strony z indeksu)'}`);
if (longTitle.length) console.log(`   Tytuły > 65 znaków:  ${longTitle.length}`);
const dupBy = (key) => {
  const g = new Map();
  for (const x of all) {
    const k = `${x.lang}|${x[key]}`;
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(x.id);
  }
  return [...g.values()].filter((a) => a.length > 1);
};
const dupT = dupBy('title');
const dupD = dupBy('description');
if (dupT.length || dupD.length)
  console.log(`   Duplikaty:           ${dupT.length} tytułów, ${dupD.length} opisów (te same teksty na różnych stronach – scal lub rozróżnij)`);
console.log('══════════════════════════════════════');
for (const g of [...dupT.map((a) => ['title', a]), ...dupD.map((a) => ['description', a])]) console.log(`   ≈ ${g[0]}: ${g[1].join(', ')}`);

if (notes.length) {
  const groups = {
    'Brakujące zdjęcia główne (images/)': notes.filter((n) => /brak pliku images\//.test(n)),
    'Galerie wskazujące brakujące pliki': notes.filter((n) => /galeria wskazuje/.test(n)),
    'Brak artykułu': notes.filter((n) => /brak articles\//.test(n)),
    'Pliki w articles/ bez kierunku lub o dziwnej nazwie': notes.filter((n) => /^articles\//.test(n)),
    'Brak wersji EN': notes.filter((n) => /trips-en/.test(n)),
    'Inne': [],
  };
  const grouped = new Set(Object.values(groups).flat());
  groups['Inne'] = notes.filter((n) => !grouped.has(n));
  console.warn(`\nOstrzeżenia (${notes.length}):`);
  for (const [name, list] of Object.entries(groups)) {
    if (!list.length) continue;
    console.warn(`\n  ${name}: ${list.length}`);
    for (const n of list.slice(0, 8)) console.warn('    ! ' + n);
    if (list.length > 8) console.warn(`    … i ${list.length - 8} więcej (--verbose pokaże wszystkie)`);
  }
  if (args.includes('--verbose')) for (const n of notes) console.warn('  ! ' + n);
}
if (problems.length) {
  console.error(`\nBłędy danych (${problems.length}):`);
  for (const p of problems) console.error('  ✗ ' + p);
  if (STRICT) process.exit(1);
}
