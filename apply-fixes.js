#!/usr/bin/env node
/**
 * apply-fixes.js — jednorazowy skrypt nanoszący 6 poprawek do generate-destinations.js
 *
 * Uruchomienie:
 *   node apply-fixes.js            # nanosi zmiany (z backupem .bak)
 *   node apply-fixes.js --dry-run  # tylko sprawdza, nic nie zapisuje
 *
 * Bezpieczeństwo:
 *   - Przed zapisem tworzy generate-destinations.js.bak
 *   - Każda poprawka sprawdza, czy "stary" fragment istnieje
 *   - Jeśli "nowy" fragment już jest — pomija (idempotentne)
 */
const fs = require('fs');
const path = require('path');

const TARGET = path.resolve('generate-destinations.js');
const BACKUP = TARGET + '.bak';
const DRY = process.argv.includes('--dry-run');

if (!fs.existsSync(TARGET)) {
  console.error(`✗ Nie znalazłem ${TARGET}`);
  console.error('  Uruchom skrypt w katalogu repo (tam gdzie leży generate-destinations.js).');
  process.exit(1);
}

const fixes = [
  {
    name: 'stripTags + dekodowanie encji HTML',
    old: `const stripTags = (s = '') =>
  String(s)
    .replace(/<\\/?(strong|em|b|i|a|span|u|mark)(\\s[^>]*)?>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\\s+/g, ' ')
    .trim();`,
    new: `// Encje HTML dekodujemy PRZED liczeniem słów i budową meta description.
// Bez tego „&lt;” / „&#8217;” liczyły się jako osobne „słowa”,
// a description bywał ucięty w środku encji (np. „…&nbs…”).
const ENTITIES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>',
  '&quot;': '"', '&#39;': "'", '&apos;': "'", '&hellip;': '…',
  '&mdash;': '—', '&ndash;': '–', '&oacute;': 'ó', '&aacute;': 'á',
  '&eacute;': 'é', '&iacute;': 'í', '&ntilde;': 'ñ', '&uuml;': 'ü',
  '&oelig;': 'œ', '&sect;': '§', '&copy;': '©', '&reg;': '®',
};
const stripTags = (s = '') =>
  String(s)
    .replace(/<\\/?(strong|em|b|i|a|span|u|mark)(\\s[^>]*)?>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? ' ')
    .replace(/\\s+/g, ' ')
    .trim();`,
  },
  {
    name: 'loadPhotos — walidacja mapy `photos`',
    old: `function loadPhotos() {
  const js = fs.readFileSync('app.js', 'utf8');
  const m = js.match(/const photos\\s*=\\s*\\{([\\s\\S]*?)\\};/);
  const out = {};
  if (!m) return out;
  const re = /['"]?([\\w-]+)['"]?\\s*:\\s*['"]([^'"]+)['"]/g;
  let x;
  while ((x = re.exec(m[1])) !== null) out[x[1]] = x[2];
  return out;
}`,
    new: `function loadPhotos() {
  const js = fs.readFileSync('app.js', 'utf8');
  const m = js.match(/const photos\\s*=\\s*\\{([\\s\\S]*?)\\};/);
  const out = {};
  if (!m) {
    bad('nie znaleziono mapy \`photos\` w app.js (oczekiwano \`const photos = {...};\`) – sprawdź, czy app.js nie został zminifikowany/zmieniony');
    return out;
  }
  const re = /['"]?([\\w-]+)['"]?\\s*:\\s*['"]([^'"]+)['"]/g;
  let x;
  while ((x = re.exec(m[1])) !== null) out[x[1]] = x[2];
  if (Object.keys(out).length === 0) {
    bad('mapa \`photos\` w app.js jest pusta – wszystkie strony użyją hero-polska.webp');
  }
  return out;
}`,
  },
  {
    name: 'langSwitch — aktywny język jako <span>',
    old: `  const langSwitch = (code) => {
    const target = code === m.lang ? self : ctx.pages[code].get(m.id);
    const fallback = code === 'pl' ? 'index.html' : 'index-en.html';
    const href = target ? target.path.replace(\`\${OUT_DIR}/\`, '') : \`../\${fallback}\`;
    return \`<a href="\${href}" class="lang-switch\${code === m.lang ? ' active' : ''}" title="\${esc(L.langTitle[code])}">\${code.toUpperCase()}</a>\`;
  };`,
    new: `  const langSwitch = (code) => {
    if (code === m.lang) {
      return \`<span class="lang-switch active" aria-current="true" title="\${esc(L.langTitle[code])}">\${code.toUpperCase()}</span>\`;
    }
    const target = ctx.pages[code].get(m.id);
    const fallback = code === 'pl' ? 'index.html' : 'index-en.html';
    const href = target ? target.path.replace(\`\${OUT_DIR}/\`, '') : \`../\${fallback}\`;
    return \`<a href="\${href}" class="lang-switch" hreflang="\${code}" title="\${esc(L.langTitle[code])}">\${code.toUpperCase()}</a>\`;
  };`,
  },
  {
    name: 'og:type article → place',
    old: `<meta property="og:type" content="article">`,
    new: `<meta property="og:type" content="place">`,
  },
  {
    name: 'pusty <div class="body-text"> pomijany',
    old: `        <div class="main-text">
          <p class="lead">\${esc(m.lead)}</p>
          <div class="body-text">
\${m.body}
          </div>
        </div>`,
    new: `        <div class="main-text">
          <p class="lead">\${esc(m.lead)}</p>
\${
  m.body
    ? \`          <div class="body-text">
\${m.body}
          </div>
\`
    : ''
}        </div>`,
  },
  {
    name: 'deep-copy manifestu przy --only',
    old: `const items = { ...(ONLY ? prevManifest.items : {}) };`,
    new: `const items = ONLY ? JSON.parse(JSON.stringify(prevManifest.items || {})) : {};`,
  },
];

let src = fs.readFileSync(TARGET, 'utf8');
const original = src;

console.log(`\n${DRY ? '🔍 DRY-RUN — nic nie zostanie zapisane' : '✏️  Nanoszę poprawki do'} ${path.basename(TARGET)}\n`);

let applied = 0, skipped = 0, missing = 0;

for (const fix of fixes) {
  if (src.includes(fix.new) && !src.includes(fix.old)) {
    console.log(`  ⏭  ${fix.name} — już naniesione (pomijam)`);
    skipped++;
    continue;
  }
  if (!src.includes(fix.old)) {
    console.log(`  ✗  ${fix.name} — NIE ZNALEZIONO fragmentu źródłowego`);
    console.log(`     (szukano bloku zaczynającego się od: ${fix.old.split('\n')[0].slice(0, 60)}…)`);
    missing++;
    continue;
  }
  const count = src.split(fix.old).length - 1;
  if (count > 1) {
    console.log(`  ⚠  ${fix.name} — fragment występuje ${count}× w pliku, pomijam (popraw ręcznie)`);
    missing++;
    continue;
  }
  src = src.replace(fix.old, fix.new);
  console.log(`  ✓  ${fix.name}`);
  applied++;
}

console.log(`\nPodsumowanie: naniesiono ${applied}, pominięto ${skipped}, problemów ${missing}`);

if (missing > 0) {
  console.error('\n⚠️  Nie wszystkie poprawki zostały naniesione. Sprawdź komunikaty powyżej.');
  console.error('   Plik NIE został zapisany — popraw ręcznie brakujące fragmenty.');
  process.exit(2);
}

if (src === original) {
  console.log('\nℹ️  Plik bez zmian (wszystko już było naniesione).');
  process.exit(0);
}

if (DRY) {
  console.log('\n✅ DRY-RUN zakończony. Uruchom bez --dry-run, żeby zapisać.');
  process.exit(0);
}

fs.writeFileSync(BACKUP, original, 'utf8');
fs.writeFileSync(TARGET, src, 'utf8');
console.log(`\n✅ Zapisano ${path.basename(TARGET)}`);
console.log(`   Backup:  ${path.basename(BACKUP)}`);
console.log('\nSprawdź składnię:  node --check generate-destinations.js');