const fs = require('fs');
const path = require('path');

const HEADER_NEW = `<a class="logo" href="/index.html" aria-label="Polska bliżej">
    <img src="/images/logo.svg" alt="Polska bliżej" height="48">
  </a>`;

const FOOTER_NEW = `<a class="logo" href="/index.html" aria-label="Polska bliżej">
    <img src="/images/logo-white.svg" alt="Polska bliżej" height="42">
  </a>`;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'backup-html', 'backup-before-cleanup', 
         'backup-before-cleanup-20261010', 'dist', '__pycache__', 'images'].includes(entry.name)) continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

let total = 0;

for (const file of walk('.')) {
  let html = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Header
  html = html.replace(
    /(<header\b[^>]*>[\s\S]*?)(<a\s+class="logo"[^>]*>[\s\S]*?<\/a>)([\s\S]*?<\/header>)/i,
    (match, before, logo, after) => {
      changed = true;
      return before + HEADER_NEW + after;
    }
  );

  // Footer
  html = html.replace(
    /(<footer\b[^>]*>[\s\S]*?)(<a\s+class="logo"[^>]*>[\s\S]*?<\/a>)([\s\S]*?<\/footer>)/i,
    (match, before, logo, after) => {
      changed = true;
      return before + FOOTER_NEW + after;
    }
  );

  if (changed) {
    fs.writeFileSync(file, html, 'utf8');
    console.log('✔', file);
    total++;
  }
}

console.log(`\nGotowe. Zmieniono ${total} plików.`);