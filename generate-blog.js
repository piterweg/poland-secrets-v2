const fs = require('fs');
const path = require('path');

const posts = JSON.parse(fs.readFileSync('blog-posts.json', 'utf8'));
const domain = 'https://polandsecrets.com';

if (!fs.existsSync('blog')) fs.mkdirSync('blog');

function esc(str) {
  return String(str).replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  }[c]));
}

function escAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDatePL(dateStr) {
  const months = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function formatDateEN(dateStr) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const [y, m, d] = dateStr.split('-');
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
}

function countWords(text) {
  return String(text).replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
}

// ───── Powiązane artykuły ─────
function buildRelated(currentSlug, currentCategory, lang) {
  const isEn = lang === 'en';
  let related = posts.filter(p => p.slug !== currentSlug && p.category === currentCategory);

  // Jeśli za mało w tej samej kategorii — dorzuć najnowsze inne
  if (related.length < 3) {
    const extra = posts.filter(p => p.slug !== currentSlug && p.category !== currentCategory);
    related = [...related, ...extra];
  }
  related = related.slice(0, 3);

  return `
  <section class="post-related">
    <h2>${isEn ? 'Read also' : 'Zobacz też'}</h2>
    <div class="post-related-grid">
${related.map(p => {
  const d = isEn ? p.en : p.pl;
  const file = isEn ? `${p.slug}-en.html` : `${p.slug}.html`;
  return `      <a href="${file}" class="post-related-card">
        <div class="post-related-image" style="background-image:url('../images/${p.image}')"></div>
        <p class="label">${p.category.toUpperCase()}</p>
        <h3>${d.title}</h3>
      </a>`;
}).join('\n')}
    </div>
  </section>`;
}

// ───── Newsletter CTA ─────
function buildNewsletter(lang) {
  const isEn = lang === 'en';
  return `
  <section class="post-newsletter">
    <p class="label">${isEn ? 'ONE EMAIL A MONTH' : 'JEDNA WIADOMOŚĆ W MIESIĄCU'}</p>
    <h2>${isEn ? 'A good reason<br><em>to hit the road.</em>' : 'Dobry pretekst,<br><em>żeby ruszyć w drogę.</em>'}</h2>
    <p>${isEn ? 'New routes and seasonal inspiration, zero spam.' : 'Nowe trasy i sezonowe inspiracje, bez spamu.'}</p>
    <form onsubmit="event.preventDefault();this.reset();this.nextElementSibling.textContent='${isEn ? 'Thank you!' : 'Dziękujemy!'}'">
      <input type="email" placeholder="${isEn ? 'Your email address' : 'Twój adres e-mail'}" required>
      <button type="submit">${isEn ? 'Subscribe →' : 'Zapisuję się →'}</button>
    </form>
    <p class="post-newsletter-msg" aria-live="polite"></p>
  </section>`;
}

// ───── Table of Contents ─────
function buildToc(bodyHtml, lang) {
  const isEn = lang === 'en';
  const headings = [];
  const re = /<h2[^>]*>(.*?)<\/h2>/gi;
  let m;
  while ((m = re.exec(bodyHtml)) !== null) {
    const text = m[1].replace(/<[^>]*>/g, '').trim();
    const id = text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // usuń diakrytyki
      .replace(/ł/g, 'l')  // dodatkowa obsługa polskiego ł
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    headings.push({ text, id });
  }

  if (headings.length < 3) return { toc: '', bodyWithIds: bodyHtml };

  const toc = `
  <nav class="post-toc" aria-label="${isEn ? 'Table of contents' : 'Spis treści'}">
    <p class="label">${isEn ? 'IN THIS ARTICLE' : 'W TYM ARTYKULE'}</p>
    <ol>
${headings.map(h => `      <li><a href="#${h.id}">${h.text}</a></li>`).join('\n')}
    </ol>
  </nav>`;

  // Dodaj id do każdego h2 w body
  let bodyWithIds = bodyHtml;
  for (const h of headings) {
    const re2 = new RegExp(`<h2([^>]*)>${h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h2>`, 'g');
    bodyWithIds = bodyWithIds.replace(re2, `<h2$1 id="${h.id}">${h.text}</h2>`);
  }

  return { toc, bodyWithIds };
}

// ───── Breadcrumbs ─────
function buildBreadcrumbs(post, lang) {
  const isEn = lang === 'en';
  const catLabels = {
    pl: { manifest: 'Manifest', plany: 'Plany', poradniki: 'Poradniki', kuchnia: 'Kuchnia', inspiracje: 'Inspiracje' },
    en: { manifest: 'Manifesto', plany: 'Plans', poradniki: 'Guides', kuchnia: 'Food', inspiracje: 'Inspiration' }
  };
  const labels = isEn ? catLabels.en : catLabels.pl;
  const catLabel = labels[post.category] || post.category;
  const data = isEn ? post.en : post.pl;
  const catFile = isEn ? `${post.category}-en.html` : `${post.category}.html`;
  const blogFile = isEn ? '../blog-en.html' : '../blog.html';

  const html = `
  <nav class="post-breadcrumbs" aria-label="${isEn ? 'Breadcrumb' : 'Ścieżka nawigacji'}">
    <a href="../index${isEn ? '-en' : ''}.html">${isEn ? 'Home' : 'Start'}</a>
    <span>›</span>
    <a href="${blogFile}">Blog</a>
    <span>›</span>
    <a href="kategoria/${catFile}">${catLabel}</a>
    <span>›</span>
    <span class="current">${data.title}</span>
  </nav>`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": isEn ? 'Home' : 'Start', "item": `https://polandsecrets.com/index${isEn ? '-en' : ''}.html` },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `https://polandsecrets.com/blog${isEn ? '-en' : ''}.html` },
      { "@type": "ListItem", "position": 3, "name": catLabel, "item": `https://polandsecrets.com/blog/kategoria/${catFile}` },
      { "@type": "ListItem", "position": 4, "name": data.title }
    ]
  };

  return { html, schema };
}

// ───── Pojedynczy wpis ─────
function buildPost(post, lang) {
  const isEn = lang === 'en';
  const data = isEn ? post.en : post.pl;
  const slug = post.slug;
  const filePl = `${slug}.html`;
  const fileEn = `${slug}-en.html`;
  const urlPl = `${domain}/blog/${filePl}`;
  const urlEn = `${domain}/blog/${fileEn}`;
  const canonical = isEn ? urlEn : urlPl;
  const siteName = isEn ? 'Poland Closer' : 'Polska bliżej';
  const homeLink = isEn ? '../index-en.html' : '../index.html';
  const blogLink = isEn ? '../blog-en.html' : '../blog.html';
  const date = isEn ? formatDateEN(post.date) : formatDatePL(post.date);
  const readMin = Math.max(1, Math.ceil((countWords(data.body) + countWords(data.lead)) / 200));

  // TOC + breadcrumbs
  const { toc, bodyWithIds } = buildToc(data.body, lang);
  const { html: breadcrumbs, schema: breadcrumbSchema } = buildBreadcrumbs(post, lang);

  return `<!doctype html>
<html lang="${isEn ? 'en' : 'pl'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="description" content="${escAttr(data.lead)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#18332c">
<meta name="author" content="${siteName}">
<title>${escAttr(data.title)} — ${siteName}</title>
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="pl" href="${urlPl}">
<link rel="alternate" hreflang="en" href="${urlEn}">
<link rel="alternate" hreflang="x-default" href="${urlPl}">
<link rel="icon" type="image/svg+xml" href="../favicon.svg">
<link rel="alternate" type="application/rss+xml" title="Blog RSS" href="feed.xml">

<meta property="og:type" content="article">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${siteName}">
<meta property="og:title" content="${escAttr(data.title)}">
<meta property="og:description" content="${escAttr(data.lead)}">
<meta property="og:image" content="${domain}/images/${post.image}">
<meta property="og:locale" content="${isEn ? 'en_US' : 'pl_PL'}">
<meta property="article:published_time" content="${post.date}">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "${escAttr(data.title)}",
  "description": "${escAttr(data.lead)}",
  "image": "${domain}/images/${post.image}",
  "datePublished": "${post.date}T08:00:00+02:00",
  "dateModified": "${post.date}T08:00:00+02:00",
  "author": {
    "@type": "Organization",
    "name": "${siteName}",
    "url": "${isEn ? domain + '/index-en.html' : domain + '/'}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "${siteName}",
    "url": "${domain}/",
    "logo": {
      "@type": "ImageObject",
      "url": "${domain}/images/logo.svg"
    }
  },
  "mainEntityOfPage": "${canonical}",
  "inLanguage": "${isEn ? 'en-US' : 'pl-PL'}"
}
</script>
<script type="application/ld+json">
${JSON.stringify(breadcrumbSchema)}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap"></noscript>
<link rel="stylesheet" href="../style.css?v=2.1">
<link rel="stylesheet" href="../hub.css">
<link rel="stylesheet" href="../blog.css">
<link rel="stylesheet" href="../search.css" media="print" onload="this.media='all'">
</head>
<body>

<header class="header">
  <a class="logo" href="${homeLink}" aria-label="${siteName}"><img src="../images/logo.svg" alt="${siteName}" height="48"></a>
  <nav id="nav">
    <a href="${homeLink}">${isEn ? 'Home' : 'Start'}</a>
    <a href="${blogLink}">Blog</a>
    <a href="../${isEn ? 'weekendy-en.html' : 'weekendy.html'}">${isEn ? 'Weekends' : 'Weekendy'}</a>
    <a href="../${isEn ? 'mapa-en.html' : 'mapa.html'}">${isEn ? 'Map' : 'Mapa'}</a>
    <a href="${homeLink}#kierunki">${isEn ? 'Destinations' : 'Kierunki'}</a>
    <div class="lang-group">${isEn
      ? `<a href="${filePl}" class="lang-switch" hreflang="pl" title="Wersja polska">PL</a><span class="lang-switch active" aria-current="true" title="English version">EN</span>`
      : `<span class="lang-switch active" aria-current="true" title="Wersja polska">PL</span><a href="${fileEn}" class="lang-switch" hreflang="en" title="English version">EN</a>`}</div>
  </nav>
</header>

<main>
  <article class="post">
    <header class="post-header">
      <a class="hub-back" href="${blogLink}">← Blog</a>
      ${breadcrumbs}
      <p class="label">${isEn ? 'ARTICLE' : 'ARTYKUŁ'} • ${date}</p>
      <h1>${data.title}</h1>
      <p class="post-lead">${data.lead}</p>
      <div class="post-meta">
        <span>${post.author}</span>
        <span>•</span>
        <span>${post.category}</span>
        <span>•</span>
        <span>${readMin} ${isEn ? 'min read' : 'min czytania'}</span>
      </div>
    </header>

    <figure class="post-image">
      <img src="../images/${post.image}" alt="${escAttr(data.title)}" width="1200" height="800" fetchpriority="high" decoding="async">
    </figure>

    ${toc}

    <div class="post-body">
${bodyWithIds}
    </div>

${buildNewsletter(lang)}

${buildRelated(post.slug, post.category, lang)}

    <div class="post-footer">
      <a class="hub-back" href="${blogLink}">← ${isEn ? 'Back to blog' : 'Wróć do bloga'}</a>
    </div>
  </article>
</main>

<footer>
  <a class="logo" href="${homeLink}" aria-label="${siteName}"><img src="../images/logo-white.svg" alt="${siteName}" height="42"></a>
  <p>© 2026 ${siteName}</p>
  <div>
    <a href="${homeLink}#o-nas">${isEn ? 'About' : 'O projekcie'}</a>
    <a href="mailto:hello@polandsecrets.com">${isEn ? 'Contact' : 'Kontakt'}</a>
  </div>
</footer>

<script src="../cookie-consent.js" defer></script>
<script src="../search.js" defer></script>
</body>
</html>
`;
}

// ───── Lista wpisów z kategoriami jako linkami ─────
function buildBlogIndex(lang) {
  const isEn = lang === 'en';
  const siteName = isEn ? 'Poland Closer' : 'Polska bliżej';
  const homeLink = isEn ? 'index-en.html' : 'index.html';
  const blogIndexLink = isEn ? 'blog-en.html' : 'blog.html';
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  const categories = [...new Set(sorted.map(p => p.category))];
  const catLabels = {
    pl: { all: 'Wszystkie', manifest: 'Manifest', plany: 'Plany', poradniki: 'Poradniki', kuchnia: 'Kuchnia', inspiracje: 'Inspiracje' },
    en: { all: 'All', manifest: 'Manifesto', plany: 'Plans', poradniki: 'Guides', kuchnia: 'Food', inspiracje: 'Inspiration' }
  };
  const labels = isEn ? catLabels.en : catLabels.pl;

  const cards = sorted.map(p => {
    const data = isEn ? p.en : p.pl;
    const file = isEn ? `${p.slug}-en.html` : `${p.slug}.html`;
    const date = isEn ? formatDateEN(p.date) : formatDatePL(p.date);
    const readMin = Math.max(1, Math.ceil((countWords(data.body) + countWords(data.lead)) / 200));
    return `      <article class="blog-card" data-category="${p.category}">
        <a href="blog/${file}" class="blog-card-link">
          <div class="blog-card-image" style="background-image:url('images/${p.image}')"></div>
          <p class="label">${date} • ${readMin} min</p>
          <h3>${data.title}</h3>
          <p>${data.lead}</p>
          <span class="blog-read">${isEn ? 'Read article' : 'Czytaj artykuł'} →</span>
        </a>
      </article>`;
  }).join('\n');

  // Kategorie jako linki (nie przyciski)
  const categoryLinks = [
    `    <a href="${blogIndexLink}" class="active">${labels.all}</a>`,
    ...categories.map(cat => {
      const file = isEn ? `${cat}-en.html` : `${cat}.html`;
      return `    <a href="blog/kategoria/${file}">${labels[cat] || cat}</a>`;
    })
  ].join('\n');

  const title = isEn
    ? 'Blog — Slow Travel in Poland | Poland Closer'
    : 'Blog — Slow travel po Polsce | Polska bliżej';
  const desc = isEn
    ? 'Articles about slow travel in Poland — guides, tips, inspiration, and regional stories.'
    : 'Artykuły o slow travel po Polsce — poradniki, inspiracje i historie regionalne.';
  const canonical = isEn ? `${domain}/blog-en.html` : `${domain}/blog.html`;
  const altPl = `${domain}/blog.html`;
  const altEn = `${domain}/blog-en.html`;

  return `<!doctype html>
<html lang="${isEn ? 'en' : 'pl'}">
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
<link rel="alternate" type="application/rss+xml" title="Blog RSS" href="feed.xml">

<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${siteName}">
<meta property="og:title" content="${escAttr(title)}">
<meta property="og:description" content="${escAttr(desc)}">
<meta property="og:image" content="${domain}/images/hero-polska.webp">
<meta property="og:locale" content="${isEn ? 'en_US' : 'pl_PL'}">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "${escAttr(title)}",
  "description": "${escAttr(desc)}",
  "url": "${canonical}",
  "inLanguage": "${isEn ? 'en-US' : 'pl-PL'}"
}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap"></noscript>
<link rel="stylesheet" href="style.css?v=2.1">
<link rel="stylesheet" href="hub.css">
<link rel="stylesheet" href="blog.css">
<link rel="stylesheet" href="../search.css" media="print" onload="this.media='all'">
</head>
<body>

<header class="header">
  <a class="logo" href="${homeLink}" aria-label="${siteName}"><img src="images/logo.svg" alt="${siteName}" height="48"></a>
  <nav id="nav">
    <a href="${homeLink}">${isEn ? 'Home' : 'Start'}</a>
    <a href="${homeLink}#kierunki">${isEn ? 'Destinations' : 'Kierunki'}</a>
    <a href="${isEn ? 'weekendy-en.html' : 'weekendy.html'}">${isEn ? 'Weekends' : 'Weekendy'}</a>
    <a href="${isEn ? 'mapa-en.html' : 'mapa.html'}">${isEn ? 'Map' : 'Mapa'}</a>
    <a href="${homeLink}#o-nas">${isEn ? 'About' : 'O projekcie'}</a>
  </nav>
</header>

<main>
  <section class="hub-hero">
    <a class="hub-back" href="${homeLink}#kierunki">← ${isEn ? 'All destinations' : 'Wszystkie kierunki'}</a>
    <p class="label">BLOG</p>
    <h1>${isEn ? 'Slow travel<br><em>stories &amp; guides.</em>' : 'Historie i poradniki<br><em>slow travel.</em>'}</h1>
    <p>${isEn ? 'Practical guides, inspiration, and regional stories from travels across Poland.' : 'Praktyczne poradniki, inspiracje i historie regionalne z podróży po Polsce.'}</p>
  </section>

  <section class="hub-list">
    <div class="section-head">
      <div>
        <p class="label">${isEn ? 'ALL ARTICLES' : 'WSZYSTKIE ARTYKUŁY'}</p>
        <h2>${isEn ? 'Latest posts' : 'Najnowsze wpisy'}</h2>
      </div>
    </div>

    <div class="blog-categories">
${categoryLinks}
    </div>

    <div class="blog-grid">
${cards}
    </div>
  </section>

  <section class="hub-others">
    <h2>${isEn ? 'See also' : 'Zobacz też'}</h2>
    <div class="hub-others-grid">
      <a href="${homeLink}#kierunki">
        <span class="label">${isEn ? 'DESTINATIONS' : 'KIERUNKI'}</span>
        <h3>${isEn ? 'All destinations' : 'Wszystkie kierunki'}</h3>
        <p>${isEn ? '145 places across Poland.' : '145 miejsc w całej Polsce.'}</p>
      </a>
      <a href="${isEn ? 'regiony-en.html' : 'regiony.html'}">
        <span class="label">${isEn ? 'REGIONS' : 'REGIONY'}</span>
        <h3>${isEn ? '16 voivodeships' : '16 województw'}</h3>
        <p>${isEn ? 'Poland region by region.' : 'Polska region po regionie.'}</p>
      </a>
      <a href="${isEn ? 'podroze-tematyczne-en.html' : 'podroze-tematyczne.html'}">
        <span class="label">${isEn ? 'THEMED' : 'TRASY'}</span>
        <h3>${isEn ? 'Themed journeys' : 'Podróże tematyczne'}</h3>
        <p>${isEn ? 'Culinary, craft, industrial trails.' : 'Szlaki kulinarne, rzemieślnicze, industrialne.'}</p>
      </a>
      <a href="${isEn ? 'parki-narodowe-en.html' : 'parki-narodowe.html'}">
        <span class="label">${isEn ? 'PARKS' : 'PARKI'}</span>
        <h3>${isEn ? '23 national parks' : '23 parki narodowe'}</h3>
        <p>${isEn ? 'Białowieża, Biebrza, Tatras.' : 'Białowieża, Biebrza, Tatry.'}</p>
      </a>
    </div>
  </section>
</main>

<footer>
  <a class="logo" href="${homeLink}" aria-label="${siteName}"><img src="images/logo-white.svg" alt="${siteName}" height="42"></a>
  <p>© 2026 ${siteName}</p>
  <div>
    <a href="${homeLink}#o-nas">${isEn ? 'About' : 'O projekcie'}</a>
    <a href="mailto:hello@polandsecrets.com">${isEn ? 'Contact' : 'Kontakt'}</a>
  </div>
</footer>

<script src="cookie-consent.js" defer></script>
<script src="search.js" defer></script>
</body>
</html>
`;
}

// ───── Generowanie ─────
let count = 0;
for (const post of posts) {
  fs.writeFileSync(path.join('blog', `${post.slug}.html`), buildPost(post, 'pl'), 'utf8');
  fs.writeFileSync(path.join('blog', `${post.slug}-en.html`), buildPost(post, 'en'), 'utf8');
  count += 2;
}

fs.writeFileSync('blog.html', buildBlogIndex('pl'), 'utf8');
fs.writeFileSync('blog-en.html', buildBlogIndex('en'), 'utf8');
count += 2;

console.log('✅ Wygenerowano blog');
console.log(`   Wpisów: ${posts.length}`);
console.log(`   Plików HTML: ${count}`);
console.log(`   - blog.html + blog-en.html (listy z kategoriami jako linki)`);
console.log(`   - blog/{slug}.html + blog/{slug}-en.html (${posts.length * 2} plików)`);
console.log(`   - Kategorie prowadzą do blog/kategoria/{slug}.html`);
