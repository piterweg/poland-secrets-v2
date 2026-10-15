#!/usr/bin/env node
/**
 * inject-search.js — dodaje odwołania do search.css + search.js
 * do wszystkich plików HTML w repo (root + /kierunki/).
 *
 * Uruchomienie:
 *   node inject-search.js
 *   node inject-search.js --dry-run
 */
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const SKIP = new Set(['node_modules', '.git', 'backup-old']);

function collectHtml(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) collectHtml(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

function depthPrefix(file) {
  const rel = path.relative('.', file);
  const depth = rel.split(path.sep).length - 1; // -1, bo plik nie liczy się
  return depth === 0 ? '' : '../'.repeat(depth);
}

let changed = 0, skipped = 0, total = 0;

for (const file of collectHtml('.')) {
  total++;
  const prefix = depthPrefix(file);
  const cssTag = `<link rel="stylesheet" href="${prefix}search.css">`;
  const jsTag = `<script src="${prefix}search.js" defer></script>`;
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  if (html.includes('search.css')) {
    skipped++;
    continue;
  }

  // Wstaw przed </head>
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${cssTag}\n${jsTag}\n</head>`);
  } else {
    console.warn(`⚠ ${file}: brak </head>, pomijam`);
    skipped++;
    continue;
  }

  if (html !== original) {
    if (!DRY) fs.writeFileSync(file, html, 'utf8');
    console.log(`${DRY ? '[dry] ' : '✓ '}${path.relative('.', file)}`);
    changed++;
  }
}

console.log(`\n${DRY ? 'DRY-RUN' : 'Gotowe'}: zmieniono ${changed}, pominięto ${skipped}, razem ${total}`);