const fs = require('fs');
const path = require('path');

const SKIP_DIRS = ['node_modules', '.git', '.venv', '__pycache__', '.vscode', '.claude'];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      if (SKIP_DIRS.includes(entry)) continue;
      walk(full, files);
    } else if (entry.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const files = walk('.');
let cleaned = 0;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // ───── Usuń WSZYSTKIE bloki PRERENDER (START + END i wszystko pomiędzy) ─────
  // Krok 1: usuń kompletne bloki START...END
  html = html.replace(/<!--\s*PRERENDER:START\s*-->[\s\S]*?<!--\s*PRERENDER:END\s*-->/g, '');

  // Krok 2: usuń samotne PRERENDER:END (te, które zostały po błędnym wielokrotnym uruchomieniu)
  html = html.replace(/<!--\s*PRERENDER:END\s*-->/g, '');

  // Krok 3: usuń samotne PRERENDER:START (na wszelki wypadek)
  html = html.replace(/<!--\s*PRERENDER:START\s*-->/g, '');

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    cleaned++;
    console.log('✅ ' + file);
  }
}

console.log(`\n🎉 Wyczyszczono ${cleaned} plików.`);
console.log('   Teraz uruchom: node prerender.js');