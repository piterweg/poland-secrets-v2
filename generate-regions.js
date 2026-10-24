const fs = require('fs');
const path = require('path');

const regions = JSON.parse(fs.readFileSync('regions-data.json', 'utf8'));
const outDir = '.';

function esc(str) {
  return String(str).replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  }[c]));
}

function escAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function introHtml(sections) {
  return sections.map(s =>
    `<h2>${s.h2}</h2>\n` + s.paragraphs.map(p => `<p>${p}</p>`).join('\n')
  ).join('\n\n');
}

function othersHtml(currentSlug, lang) {
  const others = regions.filter(r => r.slug !== currentSlug);
  return others.map(r => {
    const name = lang === 'en' ? r.nameEn : r.namePl;
    const file = lang === 'en' ? `${r.slug}-en.html` : `${r.slug}.html`;
    const hero = lang === 'en' ? r.heroEn : r.heroPl;
    const lead = hero.lead.length > 90 ? hero.lead.slice(0, 87) + '...' : hero.lead;
    return `      <a href="${file}">
        <span class="label">${(lang === 'en' ? 'REGION' : 'REGION')}</span>
        <h3>${name}</h3>
        <p>${escAttr(lead)}</p>
      </a>`;
  }).join('\n');
}

function build(lang, region) {
  const isEn = lang === 'en';
  const hero = isEn ? region.heroEn : region.heroPl;
  const intro = isEn ? region.introEn : region.introPl;
  const name = isEn ? region.nameEn : region.namePl;
  const htmlLang = isEn ? 'en' : 'pl';
  const otherLang = isEn ? 'pl' : 'en';

  const plFile = `${region.slug}.html`;
  const enFile = `${region.slug}-en.html`;
  const canonical = isEn ? `https://polandsecrets.com/${enFile}` : `https://polandsecrets.com/${plFile}`;
  const altPl = `https://polandsecrets.com/${plFile}`;
  const altEn = `https://polandsecrets.com/${enFile}`;

  const title = isEn
    ? `${name} — Slow Travel Guide | Poland Closer`
    : `${name} — przewodnik slow travel | Polska bliżej`;

  const desc = isEn
    ? `${hero.lead} Discover ${name} at a slow pace — destinations, routes, and inspirations.`
    : `${hero.lead} Odkryj region ${name} w rytmie slow travel — kierunki, trasy i inspiracje.`;

  const siteName = isEn ? 'Poland Closer' : 'Polska bliżej';
  const homeLink = isEn ? 'index-en.html' : 'index.html';

  const others = othersHtml(region.slug, lang);

  return `<!doctype html>
<html lang="${htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="description" content="${escAttr(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#18332c">
<meta name="author" content="${siteName}">
<title>${escAttr(title)}</title>
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="pl" href="${altPl}">
<link rel="alternate" hreflang="en" href="${altEn}">
<link rel="alternate" hreflang="x-default" href="${altPl}">
<link rel="icon" type="image/svg+xml" href="favicon.svg">

<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${siteName}">
<meta property="og:title" content="${escAttr(title)}">
<meta property="og:description" content="${escAttr(hero.lead)}">
<meta property="og:image" content="https://polandsecrets.com/images/hero-polska.webp">
<meta property="og:locale" content="${isEn ? 'en_US' : 'pl_PL'}">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "${escAttr(name)}",
  "description": "${escAttr(hero.lead)}",
  "url": "${canonical}",
  "inLanguage": "${isEn ? 'en-US' : 'pl-PL'}",
  "isPartOf": { "@type": "WebSite", "url": "https://polandsecrets.com/" }
}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap"></noscript>
<link rel="stylesheet" href="style.css?v=2.1">
<link rel="stylesheet" href="hub.css">
</head>
<body data-region="${region.slug}" data-lang="${lang}">

<header class="header">
  <a class="logo" href="${homeLink}"><span>PB</span> ${siteName}</a>
  <nav id="nav">
    <a href="${homeLink}">${isEn ? 'Home' : 'Start'}</a>
    <a href="${homeLink}#kierunki">${isEn ? 'Destinations' : 'Kierunki'}</a>
    <a href="${isEn ? 'weekendy-en.html' : 'weekendy.html'}">${isEn ? 'Weekends' : 'Weekendy'}</a>
    <a href="${homeLink}#o-nas">${isEn ? 'About' : 'O projekcie'}</a>
  </nav>
</header>

<main>
  <section class="hub-hero">
    <a class="hub-back" href="${homeLink}#kierunki">← ${isEn ? 'All destinations' : 'Wszystkie kierunki'}</a>
    <p class="label">${hero.label}</p>
    <h1>${hero.h1}</h1>
    <p>${hero.lead}</p>
  </section>

  <section class="hub-intro">
${introHtml(intro)}
  </section>

  <section class="hub-list">
    <div class="section-head">
      <div>
        <p class="label">${isEn ? 'DESTINATIONS IN THIS REGION' : 'KIERUNKI W REGIONIE'}</p>
        <h2>${isEn ? 'Where to go?' : 'Dokąd pojechać?'}</h2>
      </div>
    </div>
    <div class="hub-grid" id="hub-grid"></div>
  </section>

  <section class="hub-others">
    <h2>${isEn ? 'Other regions' : 'Inne regiony'}</h2>
    <div class="hub-others-grid">
${others}
    </div>
  </section>
</main>

<footer>
  <a class="logo" href="${homeLink}"><span>PB</span> ${siteName}</a>
  <p>© 2026 ${siteName}</p>
  <div>
    <a href="${homeLink}#o-nas">${isEn ? 'About' : 'O projekcie'}</a>
    <a href="mailto:hello@polandsecrets.com">${isEn ? 'Contact' : 'Kontakt'}</a>
  </div>
</footer>

<script src="app.js"></script>
<script src="region.js"></script>
</body>
</html>
`;
}

let count = 0;
for (const region of regions) {
  fs.writeFileSync(path.join(outDir, `${region.slug}.html`), build('pl', region), 'utf8');
  fs.writeFileSync(path.join(outDir, `${region.slug}-en.html`), build('en', region), 'utf8');
  count += 2;
}
console.log(`✅ Wygenerowano ${count} plików (${regions.length} regionów × 2 języki).`);
console.log(`   Pliki PL: ${regions.map(r => r.slug + '.html').join(', ')}`);
console.log(`   Pliki EN: ${regions.map(r => r.slug + '-en.html').join(', ')}`);