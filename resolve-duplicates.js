#!/usr/bin/env node
/**
 * resolve-duplicates.js
 *
 * Rozwiązuje duplikaty w trips-pl.json / trips-en.json:
 *   - usuwa wskazane ID (mapa DUPLICATES)
 *   - tworzy backup .bak przed modyfikacją
 *   - generuje redirects.json (mapa stary → nowy)
 *   - generuje redirects.htaccess (reguły do wklejenia)
 *   - opcjonalnie usuwa osierocone kierunki/<id>.html i <id>-en.html
 *
 * Uruchomienie:
 *   node resolve-duplicates.js --dry-run          # podgląd, nic nie zapisuje
 *   node resolve-duplicates.js                    # nanosi zmiany
 *   node resolve-duplicates.js --cleanup-html     # + usuwa osierocone HTML
 *
 * Uwaga: pliki articles/<old>.json ZOSTAJĄ na dysku (backup).
 */
const fs = require('fs');
const path = require('path');

/* ─────────────── MAPA DUPLIKATÓW ─────────────── */
// stary ID (do usunięcia)  →  nowy ID (zostaje)
const DUPLICATES = {
  // Kategoria 1 — oczywiste
  'sopot-plaza':        'sopot',
  'solina':             'jezioro-solinskie',
  'pn-karkonoski':      'karkonosze',
  'pn-bieszczadzki':    'bieszczady',
  'pn-pieninski':       'pieniny',
  'pn-gor-stolowych':   'stolowe',
  'pn-roztoczanski':    'roztocze',
  'pn-swietokrzyski':   'swietokrzyskie',
  'tatrzanski-park':    'tatry',

  // Kategoria 2 — park vs region (zostaje park)
  'bialowieza':         'pn-bialowieski',
  'biebrza':            'pn-biebrzanski',
  'babia':              'pn-babiogorski',
  'ojcow':              'pn-ojcowski',
  'kampinos':           'pn-kampinoski',
  'narew':              'pn-narwianski',
  'polesie':            'pn-poleski',
  'wolin':              'pn-wolinski',
  'ujscie-warty':       'pn-ujscie-warty',
  'wielkopolski':       'pn-wielkopolski',
  'wigierski-park':     'pn-wigierski',
  'drawa':              'pn-drawienski',
  'drawsko':            'pn-drawienski',
  'bory-tucholskie':    'pn-bory-tucholskie',
  'slowinski-park':     'pn-slowinski',

  // Kategoria 2 — wyjątek: region wygrywa
  'pn-gorczanski':      'gorce',
};

/* ─────────────── KONFIGURACJA ─────────────── */
const FILES = ['trips-pl.json', 'trips-en.json'];
const MANIFEST = 'destinations-manifest.json';
const HTML_DIR = 'kierunki';
const MARKER = '<!-- generated-by: generate-destinations.js -->';
const DRY = process.argv.includes('--dry-run');
const CLEANUP_HTML = process.argv.includes('--cleanup-html');

/* ─────────────── POMOCNICZE ─────────────── */
const log = (msg) => console.log(`${DRY ? '[dry] ' : ''}${msg}`);
const warn = (msg) => console.warn(`  ⚠  ${msg}`);

function backup(file) {
  const src = file;
  const dst = file + '.bak';
  if (!fs.existsSync(src)) return null;
  if (DRY) {
    log(`backup ${src} → ${dst}`);
    return dst;
  }
  fs.copyFileSync(src, dst);
  log(`✓ backup ${dst}`);
  return dst;
}

/* ─────────────── PRZETWARZANIE trips-*.json ─────────────── */
function processTripsFile(file) {
  if (!fs.existsSync(file)) {
    warn(`brak ${file} — pomijam`);
    return { removed: [], kept: 0, missing: Object.keys(DUPLICATES) };
  }

  backup(file);

  const original = JSON.parse(fs.readFileSync(file, 'utf8'));
  const idsInFile = new Set(original.map((x) => x.id));
  const removed = [];
  const missing = [];

  for (const oldId of Object.keys(DUPLICATES)) {
    if (idsInFile.has(oldId)) removed.push(oldId);
    else missing.push(oldId);
  }

  const filtered = original.filter((x) => !DUPLICATES[x.id]);

  if (!DRY) {
    fs.writeFileSync(file, JSON.stringify(filtered, null, 2) + '\n', 'utf8');
    log(`✓ zapisano ${file}: ${original.length} → ${filtered.length} wpisów, usunięto ${removed.length}`);
  } else {
    log(`${file}: ${original.length} → ${filtered.length} wpisów (usunięto ${removed.length})`);
    if (removed.length) console.log(`     usuwane: ${removed.join(', ')}`);
  }

  return { removed, kept: filtered.length, missing };
}

/* ─────────────── redirects.json ─────────────── */
function writeRedirectsJson(removedUnion) {
  const map = {};
  for (const oldId of removedUnion) {
    map[oldId] = DUPLICATES[oldId];
  }

  const out = {
    generated: new Date().toISOString().slice(0, 10),
    rules: Object.entries(map).map(([from, to]) => ({
      from: `${HTML_DIR}/${from}.html`,
      to: `${HTML_DIR}/${to}.html`,
    })),
  };

  if (!DRY) {
    fs.writeFileSync('redirects.json', JSON.stringify(out, null, 2) + '\n', 'utf8');
    log(`✓ zapisano redirects.json (${out.rules.length} reguł)`);
  } else {
    log(`zapiszę redirects.json (${out.rules.length} reguł)`);
  }
}

/* ─────────────── redirects.htaccess ─────────────── */
function writeHtaccess(removedUnion) {
  const rules = [];

  rules.push('# ═══════════════════════════════════════════════════════════');
  rules.push('# Duplikaty — przekierowania 301');
  rules.push('# Wygenerowane przez resolve-duplicates.js');
  rules.push('# Wklej do głównego .htaccess poniżej istniejącego RewriteEngine On');
  rules.push('# ═══════════════════════════════════════════════════════════');
  rules.push('');

  for (const oldId of removedUnion) {
    const newId = DUPLICATES[oldId];
    rules.push(`# ${oldId} → ${newId}`);
    rules.push(`RewriteRule ^${HTML_DIR}/${oldId}\\.html$ /${HTML_DIR}/${newId}.html [R=301,L]`);
    rules.push(`RewriteRule ^${HTML_DIR}/${oldId}-en\\.html$ /${HTML_DIR}/${newId}-en.html [R=301,L]`);
    rules.push('');
  }

  const content = rules.join('\n');

  if (!DRY) {
    fs.writeFileSync('redirects.htaccess', content, 'utf8');
    log(`✓ zapisano redirects.htaccess (${removedUnion.length * 2} reguł)`);
  } else {
    log(`zapiszę redirects.htaccess (${removedUnion.length * 2} reguł)`);
  }
}

/* ─────────────── cleanup HTML ─────────────── */
function cleanupHtml(removedUnion) {
  if (!fs.existsSync(HTML_DIR)) {
    warn(`brak katalogu ${HTML_DIR} — pomijam cleanup`);
    return;
  }

  let deleted = 0;
  let skipped = 0;

  for (const oldId of removedUnion) {
    for (const suffix of ['', '-en']) {
      const f = path.join(HTML_DIR, `${oldId}${suffix}.html`);
      if (!fs.existsSync(f)) continue;

      const content = fs.readFileSync(f, 'utf8');
      if (!content.includes(MARKER)) {
        warn(`${f} nie ma markera generatora — pomijam (usuń ręcznie)`);
        skipped++;
        continue;
      }

      if (DRY) {
        log(`usunę ${f}`);
      } else {
        fs.unlinkSync(f);
        log(`✓ usunięto ${f}`);
      }
      deleted++;
    }
  }

  log(`cleanup HTML: usunięto ${deleted}, pominięto ${skipped}`);
}

/* ─────────────── MANIFEST cleanup ─────────────── */
function cleanupManifest(removedUnion) {
  if (!fs.existsSync(MANIFEST)) {
    warn(`brak ${MANIFEST} — pomijam`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  let removed = 0;

  for (const oldId of removedUnion) {
    if (manifest.items && manifest.items[oldId]) {
      delete manifest.items[oldId];
      removed++;
    }
  }

  if (!DRY) {
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    log(`✓ zapisano ${MANIFEST}: usunięto ${removed} wpisów`);
  } else {
    log(`zapiszę ${MANIFEST}: usunę ${removed} wpisów`);
  }
}

/* ─────────────── GŁÓWNA LOGIKA ─────────────── */
console.log(`\n${'═'.repeat(60)}`);
console.log(DRY ? '  DRY-RUN — nic nie zostanie zapisane' : '  Rozwiązywanie duplikatów');
console.log(`${'═'.repeat(60)}\n`);

const removedUnion = new Set();

for (const file of FILES) {
  console.log(`\n── ${file} ──`);
  const { removed, missing } = processTripsFile(file);
  removed.forEach((id) => removedUnion.add(id));

  if (missing.length) {
    console.log(`     brak w pliku (pomijam): ${missing.join(', ')}`);
  }
}

// Redirecty i cleanup tylko jeśli są realne usunięcia
if (removedUnion.size > 0) {
  console.log(`\n── Redirecty i porządki ──`);
  writeRedirectsJson(removedUnion);
  writeHtaccess(removedUnion);
  cleanupManifest(removedUnion);

  if (CLEANUP_HTML) {
    console.log(`\n── Cleanup HTML ──`);
    cleanupHtml(removedUnion);
  } else {
    console.log(`\nℹ️  Pomijam usuwanie plików HTML. Uruchom z --cleanup-html, żeby usunąć kierunki/<old>.html.`);
  }
}

console.log(`\n${'═'.repeat(60)}`);
if (DRY) {
  console.log(`  DRY-RUN zakończony. Uruchom bez --dry-run, żeby zapisać.`);
} else {
  console.log(`  ✅ Gotowe.`);
  console.log(`  - trips-pl.json, trips-en.json  → zaktualizowane`);
  console.log(`  - redirects.json                → mapa stary → nowy`);
  console.log(`  - redirects.htaccess            → reguły do .htaccess`);
  console.log(`  - destinations-manifest.json    → oczyszczony z usuniętych ID`);
  if (!CLEANUP_HTML) {
    console.log(`\n  Następny krok:`);
    console.log(`    node resolve-duplicates.js --cleanup-html`);
  }
  console.log(`\n  Potem:`);
  console.log(`    node generate-destinations.js --noindex-below 400 --strict`);
  console.log(`    node inject-search.js`);
  console.log(`    node prerender.js`);
  console.log(`    node generate-sitemap.js`);
}
console.log(`${'═'.repeat(60)}\n`);