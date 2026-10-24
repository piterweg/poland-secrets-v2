const fs = require('fs');

const domain = 'https://polandsecrets.com';

// ───── Wczytywanie danych ─────
const trips = JSON.parse(fs.readFileSync('trips-pl.json', 'utf8'));
const tripsEn = JSON.parse(fs.readFileSync('trips-en.json', 'utf8'));
const tripsEnById = new Map(tripsEn.map(t => [t.id, t]));

// Data modyfikacji pliku — uczciwy lastmod zamiast "dziś" przy każdym buildzie
function fileDate(p) {
  try {
    return fs.statSync(p).mtime.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

// Mapa photos z app.js
function loadPhotos() {
  const appJs = fs.readFileSync('app.js', 'utf8');
  const match = appJs.match(/const photos\s*=\s*\{([\s\S]*?)\};/);
  if (!match) return {};
  const photos = {};
  const re = /(['"]?[\w-]+['"]?)\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(match[1])) !== null) {
    photos[m[1].replace(/['"]/g, '')] = m[2];
  }
  return photos;
}
const photos = loadPhotos();

// Definicje hubów (7 kategorii × 2 języki)
const hubs = [
  { pl: 'zamki.html',                en: 'zamki-en.html',                label: 'Zamki i pałace' },
  { pl: 'unesco.html',               en: 'unesco-en.html',               label: 'Obiekty UNESCO' },
  { pl: 'miasteczka.html',           en: 'miasteczka-en.html',           label: 'Małe miasta' },
  { pl: 'szlaki.html',               en: 'szlaki-en.html',               label: 'Szlaki rowerowe' },
  { pl: 'kuchnia.html',              en: 'kuchnia-en.html',              label: 'Kuchnia regionalna' },
  { pl: 'wsie.html',                 en: 'wsie-en.html',                 label: 'Wsie i regiony wiejskie' },
  { pl: 'podroze-tematyczne.html',   en: 'podroze-tematyczne-en.html',   label: 'Podróże tematyczne' },
  { pl: 'parki-narodowe.html',       en: 'parki-narodowe-en.html',       label: 'Parki narodowe' }
];

// Definicje regionów (16 województw × 2 języki)
let regionSlugs = [
  'pomorskie', 'dolnoslaskie', 'malopolskie', 'podkarpackie',
  'podlaskie', 'mazowieckie', 'warminsko-mazurskie', 'wielkopolskie',
  'slaskie', 'zachodniopomorskie', 'kujawsko-pomorskie', 'lubelskie',
  'lodzkie', 'opolskie', 'swietokrzyskie', 'lubuskie'
];
try {
  const regionsData = JSON.parse(fs.readFileSync('regions-data.json', 'utf8'));
  regionSlugs = regionsData.map(r => r.slug);
} catch (e) {
  console.log('ℹ️  Brak regions-data.json — używam domyślnej listy 16 województw.');
}

// Wpisy bloga
let blogPosts = [];
try {
  blogPosts = JSON.parse(fs.readFileSync('blog-posts.json', 'utf8'));
} catch (e) {
  console.log('ℹ️  Brak blog-posts.json — pomijam sekcję bloga.');
}

// ───── Helpers ─────
function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  }[c]));
}

const today = new Date().toISOString().split('T')[0];

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

// ───── 1. Strona główna PL ─────
xml += '  <url>\n';
xml += `    <loc>${domain}/</loc>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${domain}/"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="en" href="${domain}/index-en.html"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="es" href="${domain}/index-es.html"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}/"/>\n`;
xml += `    <lastmod>${today}</lastmod>\n`;
xml += '    <changefreq>weekly</changefreq>\n';
xml += '    <priority>1.0</priority>\n';
xml += '    <image:image>\n';
xml += `      <image:loc>${domain}/images/hero-polska.webp</image:loc>\n`;
xml += '      <image:title>Polska bliżej — Kameralne podróże po Polsce</image:title>\n';
xml += '    </image:image>\n';
xml += '  </url>\n';

// ───── 2. Strona główna EN ─────
xml += '  <url>\n';
xml += `    <loc>${domain}/index-en.html</loc>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${domain}/"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="en" href="${domain}/index-en.html"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="es" href="${domain}/index-es.html"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}/"/>\n`;
xml += `    <lastmod>${today}</lastmod>\n`;
xml += '    <changefreq>weekly</changefreq>\n';
xml += '    <priority>0.9</priority>\n';
xml += '  </url>\n';

// ───── 3. Strona główna ES ─────
xml += '  <url>\n';
xml += `    <loc>${domain}/index-es.html</loc>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${domain}/"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="en" href="${domain}/index-en.html"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="es" href="${domain}/index-es.html"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}/"/>\n`;
xml += `    <lastmod>${today}</lastmod>\n`;
xml += '    <changefreq>weekly</changefreq>\n';
xml += '    <priority>0.9</priority>\n';
xml += '  </url>\n';

// ───── 4. Huby tematyczne (PL + EN z hreflang) ─────
for (const hub of hubs) {
  const urlPl = `${domain}/${hub.pl}`;
  const urlEn = `${domain}/${hub.en}`;

  // Wersja PL
  xml += '  <url>\n';
  xml += `    <loc>${urlPl}</loc>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${urlPl}"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="en" href="${urlEn}"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlPl}"/>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>weekly</changefreq>\n';
  xml += '    <priority>0.9</priority>\n';
  xml += '  </url>\n';

  // Wersja EN
  xml += '  <url>\n';
  xml += `    <loc>${urlEn}</loc>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${urlPl}"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="en" href="${urlEn}"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlPl}"/>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>weekly</changefreq>\n';
  xml += '    <priority>0.8</priority>\n';
  xml += '  </url>\n';
}

// ───── 4b. Strona /regiony.html (hub wszystkich województw) ─────
xml += '  <url>\n';
xml += `    <loc>${domain}/regiony.html</loc>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${domain}/regiony.html"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="en" href="${domain}/regiony-en.html"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}/regiony.html"/>\n`;
xml += `    <lastmod>${today}</lastmod>\n`;
xml += '    <changefreq>weekly</changefreq>\n';
xml += '    <priority>0.9</priority>\n';
xml += '  </url>\n';

xml += '  <url>\n';
xml += `    <loc>${domain}/regiony-en.html</loc>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${domain}/regiony.html"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="en" href="${domain}/regiony-en.html"/>\n`;
xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}/regiony.html"/>\n`;
xml += `    <lastmod>${today}</lastmod>\n`;
xml += '    <changefreq>weekly</changefreq>\n';
xml += '    <priority>0.8</priority>\n';
xml += '  </url>\n';



// ───── 5. Strony regionów (PL + EN z hreflang) ─────
for (const slug of regionSlugs) {
  const filePl = `${slug}.html`;
  const fileEn = `${slug}-en.html`;
  const urlPl = `${domain}/${filePl}`;
  const urlEn = `${domain}/${fileEn}`;

  // Wersja PL
  xml += '  <url>\n';
  xml += `    <loc>${urlPl}</loc>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${urlPl}"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="en" href="${urlEn}"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlPl}"/>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>monthly</changefreq>\n';
  xml += '    <priority>0.8</priority>\n';
  xml += '  </url>\n';

  // Wersja EN
  xml += '  <url>\n';
  xml += `    <loc>${urlEn}</loc>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${urlPl}"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="en" href="${urlEn}"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlPl}"/>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>monthly</changefreq>\n';
  xml += '    <priority>0.7</priority>\n';
  xml += '  </url>\n';
}

// ───── 6. Blog — hub i wpisy ─────
if (blogPosts.length > 0) {
  // Hub bloga PL
  xml += '  <url>\n';
  xml += `    <loc>${domain}/blog.html</loc>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${domain}/blog.html"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="en" href="${domain}/blog-en.html"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}/blog.html"/>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>weekly</changefreq>\n';
  xml += '    <priority>0.9</priority>\n';
  xml += '  </url>\n';

  // Hub bloga EN
  xml += '  <url>\n';
  xml += `    <loc>${domain}/blog-en.html</loc>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${domain}/blog.html"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="en" href="${domain}/blog-en.html"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}/blog.html"/>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>weekly</changefreq>\n';
  xml += '    <priority>0.8</priority>\n';
  xml += '  </url>\n';

  // Wpisy bloga (PL + EN z hreflang)
  for (const post of blogPosts) {
    const urlPl = `${domain}/blog/${post.slug}.html`;
    const urlEn = `${domain}/blog/${post.slug}-en.html`;

    // Wersja PL
    xml += '  <url>\n';
    xml += `    <loc>${urlPl}</loc>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${urlPl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${urlEn}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlPl}"/>\n`;
    xml += `    <lastmod>${post.date}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '    <image:image>\n';
    xml += `      <image:loc>${domain}/images/${post.image}</image:loc>\n`;
    xml += `      <image:title>${escapeXml(post.pl.title)}</image:title>\n`;
    xml += '    </image:image>\n';
    xml += '  </url>\n';

    // Wersja EN
    xml += '  <url>\n';
    xml += `    <loc>${urlEn}</loc>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${urlPl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${urlEn}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlPl}"/>\n`;
    xml += `    <lastmod>${post.date}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    xml += '    <image:image>\n';
    xml += `      <image:loc>${domain}/images/${post.image}</image:loc>\n`;
    xml += `      <image:title>${escapeXml(post.en.title)}</image:title>\n`;
    xml += '    </image:image>\n';
    xml += '  </url>\n';
  }
}

// ───── 7. Strony kierunków /kierunki/*.html (PL + EN z hreflang) ─────
// Wcześniej sitemap zgłaszał /article.html?id=… — jeden szablon z identycznym
// canonicalem dla ~124 stron. Teraz zgłaszamy realne, unikalne strony kierunków.
const seen = new Set();
let destCount = 0;
for (const t of trips) {
  if (seen.has(t.id)) {
    console.warn('⚠ Pominięto duplikat id:', t.id);
    continue;
  }
  seen.add(t.id);

  const img = photos[t.id] || 'hero-polska.webp';
  const urlPl = `${domain}/kierunki/${t.id}.html`;
  const urlEn = `${domain}/kierunki/${t.id}-en.html`;
  const lastmod = fileDate(`kierunki/${t.id}.html`);
  const tEn = tripsEnById.get(t.id);

  // Wersja PL
  xml += '  <url>\n';
  xml += `    <loc>${urlPl}</loc>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${urlPl}"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="en" href="${urlEn}"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlPl}"/>\n`;
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += '    <changefreq>monthly</changefreq>\n';
  xml += '    <priority>0.8</priority>\n';
  xml += '    <image:image>\n';
  xml += `      <image:loc>${domain}/images/${img}</image:loc>\n`;
  xml += `      <image:title>${escapeXml(t.title)}</image:title>\n`;
  xml += '    </image:image>\n';
  xml += '  </url>\n';

  // Wersja EN
  xml += '  <url>\n';
  xml += `    <loc>${urlEn}</loc>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${urlPl}"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="en" href="${urlEn}"/>\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlPl}"/>\n`;
  xml += `    <lastmod>${fileDate(`kierunki/${t.id}-en.html`)}</lastmod>\n`;
  xml += '    <changefreq>monthly</changefreq>\n';
  xml += '    <priority>0.7</priority>\n';
  xml += '    <image:image>\n';
  xml += `      <image:loc>${domain}/images/${img}</image:loc>\n`;
  xml += `      <image:title>${escapeXml(tEn ? tEn.title : t.title)}</image:title>\n`;
  xml += '    </image:image>\n';
  xml += '  </url>\n';

  destCount++;
}


xml += '</urlset>\n';

fs.writeFileSync('sitemap.xml', xml, 'utf8');

// ───── Podsumowanie ─────
const hubCount = hubs.length * 2;              // 7 hubów × 2 języki = 14
const regionHubCount = 2;                      // regiony.html + regiony-en.html
const regionCount = regionSlugs.length * 2;    // 16 regionów × 2 języki = 32
const blogHubCount = blogPosts.length > 0 ? 2 : 0;
const blogPostCount = blogPosts.length * 2;
const destTotal = destCount * 2;                // kierunki × 2 języki
const grandTotal = 3 + hubCount + regionHubCount + regionCount + blogHubCount + blogPostCount + destTotal;

console.log('✅ sitemap.xml — wygenerowany');
console.log(`   Strony główne:          3`);
console.log(`   Huby tematyczne:        ${hubCount} (${hubs.length} kategorii × 2 języki)`);
console.log(`   Hub regionów:           ${regionHubCount} (regiony.html + regiony-en.html)`);
console.log(`   Regiony:                ${regionCount} (${regionSlugs.length} województw × 2 języki)`);
console.log(`   Hub bloga:              ${blogHubCount} (blog.html + blog-en.html)`);
console.log(`   Wpisy bloga:            ${blogPostCount} (${blogPosts.length} × 2 języki)`);
console.log(`   Strony kierunków:       ${destTotal} (${destCount} × 2 języki, /kierunki/*.html)`);
console.log(`   ─────────────────────────`);
console.log(`   RAZEM:                  ${grandTotal} URL-i`);
if (trips.length !== destCount) {
  console.log(`   Pominięto duplikatów:   ${trips.length - destCount}`);
}