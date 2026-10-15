const fs = require('fs');
const path = require('path');

const posts = JSON.parse(fs.readFileSync('blog-posts.json', 'utf8'));
const domain = 'https://polandsecrets.com';

// ───── Konfiguracja kategorii ─────
const CATEGORIES = {
  plany: {
    image: 'hero-polska.webp',
    pl: {
      label: 'PLANY WEEKENDOWE',
      h1: 'Weekend, który<br><em>naprawdę odpocznie.</em>',
      lead: 'Gotowe plany weekendowe na wyjazdy po Polsce. Od Bieszczad po Mazury, od Krakowa po Trójmiasto — znajdź pomysł na swój następny wyjazd.',
      metaTitle: 'Plany weekendowe — slow travel po Polsce | Polska bliżej',
      metaDesc: 'Gotowe plany weekendowe na wyjazdy po Polsce — trasy, atrakcje, wskazówki i inspiracje.'
    },
    en: {
      label: 'WEEKEND PLANS',
      h1: 'A weekend that<br><em>truly rests.</em>',
      lead: 'Ready-made weekend plans for trips around Poland. From the Bieszczady to Masuria, from Kraków to the Tricity — find an idea for your next trip.',
      metaTitle: 'Weekend Plans — Slow Travel in Poland | Poland Closer',
      metaDesc: 'Ready-made weekend plans for trips around Poland — routes, attractions, tips, and inspiration.'
    }
  },
  kuchnia: {
    image: 'kuchnia-podhale.webp',
    pl: {
      label: 'KUCHNIA REGIONALNA',
      h1: 'Smaki, które<br><em>opowiadają historię.</em>',
      lead: 'Kuchnia regionalna Polski — od podlaskich kibinów po kaszubskie śledzie, od podhalańskich oscypków po śląskie rolady. Przewodnik po smakach regionów.',
      metaTitle: 'Kuchnia regionalna Polski — przewodnik slow travel | Polska bliżej',
      metaDesc: 'Kuchnia regionalna Polski — smaki, tradycje, lokalne specjały wszystkich regionów.'
    },
    en: {
      label: 'REGIONAL CUISINE',
      h1: 'Flavors that<br><em>tell a story.</em>',
      lead: 'Polish regional cuisine — from Podlasie kibiny to Kashubian herring, from Podhale oscypek to Silesian roulade. A guide to the flavors of the regions.',
      metaTitle: 'Polish Regional Cuisine — Slow Travel Guide | Poland Closer',
      metaDesc: 'Polish regional cuisine — flavors, traditions, local specialties from all regions.'
    }
  },
  poradniki: {
    image: 'green-velo.webp',
    pl: {
      label: 'PORADNIKI',
      h1: 'Podróżuj<br><em>mądrzej.</em>',
      lead: 'Praktyczne poradniki o podróżowaniu po Polsce — jak planować, kiedy jechać, co zabrać, jak zwiedzać w rytmie slow. Konkretne wskazówki dla każdego.',
      metaTitle: 'Poradniki slow travel — jak podróżować po Polsce | Polska bliżej',
      metaDesc: 'Praktyczne poradniki slow travel po Polsce — planowanie, sezony, transport, slow weekend.'
    },
    en: {
      label: 'GUIDES',
      h1: 'Travel<br><em>smarter.</em>',
      lead: 'Practical guides on traveling around Poland — how to plan, when to go, what to bring, how to visit at a slow pace. Concrete tips for everyone.',
      metaTitle: 'Slow Travel Guides — How to Travel in Poland | Poland Closer',
      metaDesc: 'Practical slow travel guides for Poland — planning, seasons, transport, slow weekends.'
    }
  },
  inspiracje: {
    image: 'bieszczady.webp',
    pl: {
      label: 'INSPIRACJE',
      h1: 'Zainspiruj się<br><em>na wyjazd.</em>',
      lead: 'Inspiracje na podróże po Polsce — miejsca, których nie znałeś, sezonowe pomysły, historie z podróży. Coś dla tych, którzy jeszcze nie wiedzą, dokąd jechać.',
      metaTitle: 'Inspiracje podróżnicze — slow travel po Polsce | Polska bliżej',
      metaDesc: 'Inspiracje na podróże po Polsce — miejsca, sezony, historie, pomysły na wyjazd.'
    },
    en: {
      label: 'INSPIRATION',
      h1: 'Get inspired<br><em>to travel.</em>',
      lead: 'Inspiration for travels across Poland — places you did not know, seasonal ideas, stories from journeys. Something for those who do not yet know where to go.',
      metaTitle: 'Travel Inspiration — Slow Travel in Poland | Poland Closer',
      metaDesc: 'Inspiration for travels across Poland — places, seasons, stories, trip ideas.'
    }
  },
  manifest: {
    image: 'hero-polska.webp',
    pl: {
      label: 'MANIFEST',
      h1: 'Podróżuj<br><em>inaczej.</em>',
      lead: 'Slow travel to nie trend — to sposób myślenia o podróżach. Manifest naszej filozofii podróżowania: mniej pośpiechu, więcej uwagi, więcej obecności.',
      metaTitle: 'Slow travel — manifest podróżowania po Polsce | Polska bliżej',
      metaDesc: 'Filozofia slow travel — dlaczego warto podróżować mniej, ale uważniej.'
    },
    en: {
      label: 'MANIFESTO',
      h1: 'Travel<br><em>differently.</em>',
      lead: 'Slow travel is not a trend — it is a way of thinking about travel. The manifesto of our travel philosophy: less haste, more attention, more presence.',
      metaTitle: 'Slow Travel — A Travel Manifesto for Poland | Poland Closer',
      metaDesc: 'The philosophy of slow travel — why it is worth traveling less but more attentively.'
    }
  }
};

// ───── Helpers ─────
function esc(s) {
  return String(s).replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]));
}

function formatDatePL(d) {
  const m = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
  const [y,mo,day] = d.split('-');
  return `${parseInt(day)} ${m[parseInt(mo)-1]} ${y}`;
}

function formatDateEN(d) {
  const m = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const [y,mo,day] = d.split('-');
  return `${m[parseInt(mo)-1]} ${parseInt(day)}, ${y}`;
}

// ───── Generowanie strony kategorii ─────
function buildCategoryPage(catSlug, cat, lang) {
  const isEn = lang === 'en';
  const data = isEn ? cat.en : cat.pl;
  const postsInCat = posts
    .filter(p => p.category === catSlug)
    .sort((a, b) => b.date.localeCompare(a.date));

  const plFile = `${catSlug}.html`;
  const enFile = `${catSlug}-en.html`;
  const urlPl = `${domain}/blog/kategoria/${plFile}`;
  const urlEn = `${domain}/blog/kategoria/${enFile}`;
  const canonical = isEn ? urlEn : urlPl;
  const siteName = isEn ? 'Poland Closer' : 'Polska bliżej';
  const homeLink = isEn ? '../../index-en.html' : '../../index.html';
  const blogLink = isEn ? '../blog-en.html' : '../blog.html';

  const cards = postsInCat.map(p => {
    const pd = isEn ? p.en : p.pl;
    const file = isEn ? `${p.slug}-en.html` : `${p.slug}.html`;
    const date = isEn ? formatDateEN(p.date) : formatDatePL(p.date);
    return `      <article class="blog-card" data-category="${p.category}">
        <a href="../${file}" class="blog-card-link">
          <div class="blog-card-image" style="background-image:url('../../images/${p.image}')"></div>
          <p class="label">${date}</p>
          <h3>${pd.title}</h3>
          <p>${pd.lead}</p>
          <span class="blog-read">${isEn ? 'Read article' : 'Czytaj artykuł'} →</span>
        </a>
      </article>`;
  }).join('\n');

  // Linki do pozostałych kategorii
  const otherCats = Object.keys(CATEGORIES).filter(k => k !== catSlug).map(k => {
    const cd = isEn ? CATEGORIES[k].en : CATEGORIES[k].pl;
    const file = isEn ? `${k}-en.html` : `${k}.html`;
    return `      <a href="${file}">
        <span class="label">${cd.label}</span>
        <h3>${cd.h1.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()}</h3>
        <p>${cd.lead.slice(0, 90)}...</p>
      </a>`;
  }).join('\n');

  return `<!doctype html>
<html lang="${isEn ? 'en' : 'pl'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="description" content="${esc(data.metaDesc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#18332c">
<meta name="author" content="${siteName}">
<title>${esc(data.metaTitle)}</title>
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="pl" href="${urlPl}">
<link rel="alternate" hreflang="en" href="${urlEn}">
<link rel="alternate" hreflang="x-default" href="${urlPl}">
<link rel="icon" type="image/svg+xml" href="../../favicon.svg">

<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${siteName}">
<meta property="og:title" content="${esc(data.metaTitle)}">
<meta property="og:description" content="${esc(data.metaDesc)}">
<meta property="og:image" content="${domain}/images/${cat.image}">
<meta property="og:locale" content="${isEn ? 'en_US' : 'pl_PL'}">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "${esc(data.metaTitle)}",
  "description": "${esc(data.metaDesc)}",
  "url": "${canonical}",
  "inLanguage": "${isEn ? 'en-US' : 'pl-PL'}",
  "isPartOf": { "@type": "Blog", "url": "${isEn ? domain + '/blog-en.html' : domain + '/blog.html'}" }
}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../style.css">
<link rel="stylesheet" href="../../hub.css">
<link rel="stylesheet" href="../../blog.css">
<link rel="stylesheet" href="../../search.css">
</head>
<body>

<header class="header">
  <a class="logo" href="${homeLink}" aria-label="${siteName}"><img src="../../images/logo.svg" alt="${siteName}" height="48"></a>
  <nav id="nav">
    <a href="${homeLink}">${isEn ? 'Home' : 'Start'}</a>
    <a href="${blogLink}">Blog</a>
    <a href="${homeLink}#kierunki">${isEn ? 'Destinations' : 'Kierunki'}</a>
    <div class="lang-group">${isEn
      ? `<a href="${plFile}" class="lang-switch" hreflang="pl" title="Wersja polska">PL</a><span class="lang-switch active" aria-current="true" title="English version">EN</span>`
      : `<span class="lang-switch active" aria-current="true" title="Wersja polska">PL</span><a href="${enFile}" class="lang-switch" hreflang="en" title="English version">EN</a>`}</div>
  </nav>
</header>

<main>
  <section class="hub-hero">
    <a class="hub-back" href="${blogLink}">← Blog</a>
    <p class="label">${data.label}</p>
    <h1>${data.h1}</h1>
    <p>${data.lead}</p>
  </section>

  <section class="hub-list">
    <div class="section-head">
      <div>
        <p class="label">${isEn ? 'ALL ARTICLES IN THIS CATEGORY' : 'WSZYSTKIE ARTYKUŁY W KATEGORII'}</p>
        <h2>${isEn ? postsInCat.length + ' articles' : postsInCat.length + ' artykułów'}</h2>
      </div>
    </div>

    <div class="blog-grid">
${cards}
    </div>
  </section>

  <section class="hub-others">
    <h2>${isEn ? 'Other categories' : 'Inne kategorie'}</h2>
    <div class="hub-others-grid">
${otherCats}
    </div>
  </section>
</main>

<footer>
  <a class="logo" href="${homeLink}" aria-label="${siteName}"><img src="../../images/logo-white.svg" alt="${siteName}" height="42"></a>
  <p>© 2026 ${siteName}</p>
  <div>
    <a href="${homeLink}#o-nas">${isEn ? 'About' : 'O projekcie'}</a>
    <a href="mailto:hello@polandsecrets.com">${isEn ? 'Contact' : 'Kontakt'}</a>
  </div>
</footer>

<script src="../../cookie-consent.js" defer></script>
<script src="../../search.js" defer></script>
</body>
</html>
`;
}

// ───── Generowanie ─────
const outDir = path.join('blog', 'kategoria');
if (!fs.existsSync('blog')) fs.mkdirSync('blog');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let count = 0;
for (const [slug, cat] of Object.entries(CATEGORIES)) {
  fs.writeFileSync(path.join(outDir, `${slug}.html`), buildCategoryPage(slug, cat, 'pl'), 'utf8');
  fs.writeFileSync(path.join(outDir, `${slug}-en.html`), buildCategoryPage(slug, cat, 'en'), 'utf8');
  count += 2;
}

console.log('✅ Wygenerowano strony kategorii');
console.log(`   Kategorii: ${Object.keys(CATEGORIES).length}`);
console.log(`   Plików: ${count}`);
console.log('   Ścieżki:');
for (const slug of Object.keys(CATEGORIES)) {
  console.log(`     blog/kategoria/${slug}.html + ${slug}-en.html`);
}