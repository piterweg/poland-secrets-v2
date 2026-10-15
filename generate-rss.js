const fs = require('fs');
const path = require('path');

const posts = JSON.parse(fs.readFileSync('blog-posts.json', 'utf8'));
const domain = 'https://polandsecrets.com';
const today = new Date().toISOString();

function esc(s) {
  return String(s).replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  }[c]));
}

// ───── RSS 2.0 — wersja PL ─────
function buildRss(lang) {
  const isEn = lang === 'en';
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const siteName = isEn ? 'Poland Closer' : 'Polska bliżej';
  const siteDesc = isEn
    ? 'Slow travel articles, guides, and inspiration for Poland.'
    : 'Artykuły o slow travel po Polsce — poradniki, inspiracje i historie regionalne.';
  const homeUrl = isEn ? `${domain}/blog-en.html` : `${domain}/blog.html`;
  const feedUrl = isEn ? `${domain}/feed-en.xml` : `${domain}/feed.xml`;
  const langCode = isEn ? 'en-US' : 'pl-PL';

  const items = sorted.map(p => {
    const d = isEn ? p.en : p.pl;
    const link = isEn ? `${domain}/blog/${p.slug}-en.html` : `${domain}/blog/${p.slug}.html`;
    const pubDate = new Date(p.date).toUTCString();
    return `    <item>
      <title>${esc(d.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${esc(d.lead)}</description>
      <category>${esc(p.category)}</category>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(siteName)} — Blog</title>
    <link>${homeUrl}</link>
    <description>${esc(siteDesc)}</description>
    <language>${langCode}</language>
    <lastBuildDate>${today}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

fs.writeFileSync('feed.xml', buildRss('pl'), 'utf8');
fs.writeFileSync('feed-en.xml', buildRss('en'), 'utf8');

console.log('✅ Wygenerowano RSS');
console.log(`   feed.xml     — ${posts.length} wpisów (PL)`);
console.log(`   feed-en.xml  — ${posts.length} wpisów (EN)`);