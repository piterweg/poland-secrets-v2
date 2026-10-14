const fs = require('fs');
const path = require('path');

const imagesDir = './images';
if (!fs.existsSync(imagesDir)) {
  console.error('❌ Brak folderu images/');
  process.exit(1);
}

const existing = new Set(
  fs.readdirSync(imagesDir).map(f => f.toLowerCase())
);

const required = new Set(['hero-polska.webp']);

// Z app.js — mapa photos
const appJs = fs.readFileSync('app.js', 'utf8');
const match = appJs.match(/const photos\s*=\s*\{([\s\S]*?)\};/);
if (match) {
  const re = /['"]?([\w-]+)['"]?\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(match[1])) !== null) {
    required.add(m[2]);
  }
}

// Z articles/*.json — pole gallery
const articlesDir = './articles';
if (fs.existsSync(articlesDir)) {
  for (const file of fs.readdirSync(articlesDir).filter(f => f.endsWith('.json'))) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(articlesDir, file), 'utf8'));
      if (Array.isArray(data.gallery)) {
        data.gallery.forEach(g => required.add(g));
      }
    } catch (e) {
      console.warn('⚠ Błąd w pliku', file, '-', e.message);
    }
  }
}

const missing = [...required].filter(f => !existing.has(f.toLowerCase()));

console.log('─── Sprawdzenie zdjęć ───');
console.log('Wymagane:', required.size);
console.log('Znalezione:', required.size - missing.length);
console.log('Brakujące:', missing.length);

if (missing.length) {
  console.log('\n❌ BRAKUJĄCE PLIKI (wgraj do images/):');
  missing.sort().forEach(f => console.log('   ' + f));
  process.exit(1);
} else {
  console.log('\n✅ Wszystkie zdjęcia są na miejscu.');
}