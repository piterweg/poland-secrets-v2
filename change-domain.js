const fs = require('fs');
const path = require('path');

// ⚠️ KONFIGURACJA
const OLD_DOMAIN = 'polandsecrets.com';
const NEW_DOMAIN = 'polandsecrets.com';

// Rozszerzenia plików, w których zamieniamy domenę
const EXTENSIONS = ['.html', '.js', '.json', '.xml', '.txt', '.css'];

// Katalogi pomijane
const SKIP_DIRS = ['node_modules', '.git', '.venv', '__pycache__', 'images', 'backup', '.vscode'];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      if (SKIP_DIRS.includes(entry)) continue;
      walk(full, files);
    } else {
      const ext = path.extname(entry).toLowerCase();
      if (EXTENSIONS.includes(ext)) files.push(full);
    }
  }
  return files;
}

// ───── Uruchomienie ─────
console.log(`\n🔍 Szukam starej domeny: ${OLD_DOMAIN}`);
console.log(`📝 Zamieniam na:        ${NEW_DOMAIN}\n`);

const files = walk('.');

// Regex: dopasuj stary domain (z opcjonalnym http/https i www)
const re = new RegExp(`(https?:\\/\\/)?(www\\.)?${OLD_DOMAIN.replace('.', '\\.')}`, 'g');

let changed = 0;
let totalReplacements = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(re);

  if (!matches) continue;

  const count = matches.length;
  const updated = content.replace(re, (match, protocol) => {
    const proto = protocol || '';
    return `${proto}${NEW_DOMAIN}`;
  });

  fs.writeFileSync(file, updated, 'utf8');
  console.log(`✅ ${file} — ${count} zamian`);
  changed++;
  totalReplacements += count;
}

console.log(`\n═══════════════════════════════`);
console.log(`📊 Wynik:`);
console.log(`   Plików zmienionych:  ${changed}`);
console.log(`   Zamian łącznie:      ${totalReplacements}`);
console.log(`═══════════════════════════════\n`);

if (changed === 0) {
  console.log('ℹ️  Nie znaleziono starej domeny — może już zamieniona?');
}

// ───── Weryfikacja ─────
console.log('\n🔎 Weryfikacja — pozostałe wystąpienia starej domeny:');
let remaining = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(re);
  if (matches) {
    console.log(`   ⚠️  ${file} — ${matches.length} wystąpień`);
    remaining++;
  }
}

if (remaining === 0) {
  console.log('   ✅ Brak pozostałości — wszystko zamienione.');
} else {
  console.log(`\n⚠️  Pozostało ${remaining} plików. Uruchom skrypt ponownie albo sprawdź ręcznie.`);
}