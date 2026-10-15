const fs = require('fs');
const path = require('path');

// ⚠️ WPISZ TU SWÓJ NOWY Measurement ID
const NEW_ID = 'G-2P2RTBRDJ5';  // ← zamień
const OLD_ID = 'G-FE83G0TEHF';

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      if (['node_modules', '.git', '.venv', '__pycache__', 'images'].includes(entry)) continue;
      walk(full, files);
    } else if (entry.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const files = walk('.');
let updated = 0;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // Zamień wszystkie wystąpienia starego ID
  html = html.split(OLD_ID).join(NEW_ID);

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    updated++;
    console.log('✅ ' + file);
  }
}

console.log(`\n🎉 Zaktualizowano ${updated} plików.`);
console.log(`   Stary ID: ${OLD_ID}`);
console.log(`   Nowy ID:  ${NEW_ID}`);