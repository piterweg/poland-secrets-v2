const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (entry === 'node_modules' || entry === '.git' || entry === 'blog' && dir === '.') {
      if (entry === 'blog') {
        // blog też przetwarzamy, ale inaczej
      }
    }
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
  const dir = path.dirname(file);
  const depth = dir === '.' ? 0 : dir.split(path.sep).length;
  const prefix = depth === 0 ? '' : '../'.repeat(depth);

  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // Header — logo ciemne
  html = html.replace(
    /<header[^>]*>[\s\S]*?<a\s+class="logo"[^>]*>[\s\S]*?<\/a>/,
    (match) => {
      return match.replace(
        /<a\s+class="logo"[^>]*>[\s\S]*?<\/a>/,
        `<a class="logo" href="${prefix}index.html" aria-label="Polska bliżej"><img src="${prefix}images/logo.svg" alt="Polska bliżej" height="48"></a>`
      );
    }
  );

  // Footer — logo białe
  html = html.replace(
    /<footer[^>]*>[\s\S]*?<a\s+class="logo"[^>]*>[\s\S]*?<\/a>/,
    (match) => {
      return match.replace(
        /<a\s+class="logo"[^>]*>[\s\S]*?<\/a>/,
        `<a class="logo" href="${prefix}index.html" aria-label="Polska bliżej"><img src="${prefix}images/logo-white.svg" alt="Polska bliżej" height="42"></a>`
      );
    }
  );

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    updated++;
    console.log('✅ ' + file);
  }
}

console.log(`\n🎉 Zaktualizowano ${updated} plików.`);