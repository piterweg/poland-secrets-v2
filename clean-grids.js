<<<<<<< HEAD
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

  // ───── 1. Napraw hub-grid (dla hubów i regionów) ─────
  // Znajdź <div id="hub-grid"> ... i usuń wszystko aż do </section>
  html = html.replace(
    /(<div[^>]*\sid="hub-grid"[^>]*>)[\s\S]*?(<\/section>)/,
    '$1</div>\n  $2'
  );

  // ───── 2. Napraw trip-grid (dla index.html) ─────
  // Znajdź <div id="trip-grid"> ... i usuń wszystko aż do </section>
  html = html.replace(
    /(<div[^>]*\sid="trip-grid"[^>]*>)[\s\S]*?(<\/section>)/,
    '$1</div>\n  $2'
  );

  // ───── 3. Usuń osierocone komentarze PRERENDER (na wszelki wypadek) ─────
  html = html.replace(/<!--\s*PRERENDER:START\s*-->/g, '');
  html = html.replace(/<!--\s*PRERENDER:END\s*-->/g, '');

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    cleaned++;
    console.log('✅ ' + file);
  }
}

console.log(`\n🎉 Wyczyszczono ${cleaned} plików.`);
=======
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

  // ───── 1. Napraw hub-grid (dla hubów i regionów) ─────
  // Znajdź <div id="hub-grid"> ... i usuń wszystko aż do </section>
  html = html.replace(
    /(<div[^>]*\sid="hub-grid"[^>]*>)[\s\S]*?(<\/section>)/,
    '$1</div>\n  $2'
  );

  // ───── 2. Napraw trip-grid (dla index.html) ─────
  // Znajdź <div id="trip-grid"> ... i usuń wszystko aż do </section>
  html = html.replace(
    /(<div[^>]*\sid="trip-grid"[^>]*>)[\s\S]*?(<\/section>)/,
    '$1</div>\n  $2'
  );

  // ───── 3. Usuń osierocone komentarze PRERENDER (na wszelki wypadek) ─────
  html = html.replace(/<!--\s*PRERENDER:START\s*-->/g, '');
  html = html.replace(/<!--\s*PRERENDER:END\s*-->/g, '');

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    cleaned++;
    console.log('✅ ' + file);
  }
}

console.log(`\n🎉 Wyczyszczono ${cleaned} plików.`);
>>>>>>> ccc4658c4a7d66f235c701a64926ebc8bd10c776
console.log('   Teraz uruchom: node prerender.js');