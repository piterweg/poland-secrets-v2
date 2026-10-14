<<<<<<< HEAD
const fs = require('fs');
const path = require('path');

// ───── 1. Wczytaj mapę photos z app.js ─────
function loadPhotos() {
  const appJs = fs.readFileSync('app.js', 'utf8');
  const match = appJs.match(/const photos\s*=\s*\{([\s\S]*?)\};/);
  if (!match) {
    console.error('❌ Nie znaleziono mapy photos w app.js');
    return {};
  }
  const photos = {};
  const re = /['"]?([\w-]+)['"]?\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(match[1])) !== null) {
    photos[m[1].replace(/['"]/g, '')] = m[2];
  }
  return photos;
}

const photos = loadPhotos();
console.log(`📊 Kluczy w mapie photos: ${Object.keys(photos).length}\n`);

// ───── 2. Wczytaj trips-pl.json, żeby wiedzieć, które id są w projekcie ─────
const tripsPl = JSON.parse(fs.readFileSync('trips-pl.json', 'utf8'));

// ───── 3. Sprawdź, które pliki istnieją w images/ ─────
const imagesDir = './images';
const existingFiles = new Set(
  fs.readdirSync(imagesDir).map(f => f.toLowerCase())
);

// ───── 4. Sprawdź każdy kierunek z trips-pl.json ─────
const missing = [];
const placeholder = [];
const ok = [];

for (const trip of tripsPl) {
  const img = photos[trip.id];
  if (!img) {
    missing.push({ id: trip.id, reason: 'brak w mapie photos' });
    continue;
  }
  if (!existingFiles.has(img.toLowerCase())) {
    missing.push({ id: trip.id, img, category: trip.category, title: trip.title });
  } else {
    ok.push({ id: trip.id, img });
  }
}

// ───── 5. Sprawdź, czy jakieś id używają placeholderów (innego id) ─────
// Placeholder = gdy plik istnieje, ale nazwa pliku nie zawiera id
const suspicious = [];
for (const trip of tripsPl) {
  const img = photos[trip.id];
  if (!img) continue;
  const base = img.replace('.webp', '').toLowerCase();
  const id = trip.id.toLowerCase();
  // Sprawdź, czy nazwa pliku zawiera id (np. malbork.webp zawiera "malbork")
  if (!base.includes(id) && !id.includes(base)) {
    // Wyjątki — celowe mapowania (np. sopot-plaza → sopot)
    const exceptions = ['sopot-plaza', 'jezioro-solinskie'];
    if (exceptions.includes(trip.id)) continue;
    // Sprawdź, czy to nie jest przypadek "id → id.webp"
    suspicious.push({ id: trip.id, img, category: trip.category, title: trip.title });
  }
}

// ───── 6. Wypisz wyniki ─────
console.log('═══════════════════════════════════════════════');
console.log('✅ OK — istnieją pliki:');
console.log(`   ${ok.length} kierunków`);
console.log('═══════════════════════════════════════════════\n');

if (missing.length > 0) {
  console.log('═══════════════════════════════════════════════');
  console.log(`❌ BRAKUJĄCE PLIKI: ${missing.length}`);
  console.log('   (karty pokazują puste tło, bo plik nie istnieje)');
  console.log('═══════════════════════════════════════════════');
  for (const m of missing) {
    if (m.reason) {
      console.log(`   ${m.id} — ${m.reason}`);
    } else {
      console.log(`   ${m.id.padEnd(30)} → ${m.img.padEnd(30)} [${m.category}]`);
    }
  }
  console.log();
}

if (suspicious.length > 0) {
  console.log('═══════════════════════════════════════════════');
  console.log(`⚠️  PODEJRZANE (placeholder?): ${suspicious.length}`);
  console.log('   (karta pokazuje inne zdjęcie niż wynikałoby z id)');
  console.log('═══════════════════════════════════════════════');
  for (const s of suspicious) {
    console.log(`   ${s.id.padEnd(30)} → ${s.img.padEnd(30)} [${s.category}]`);
  }
  console.log();
}

// ───── 7. Sprawdź index.html, jakie tła są w prerenderze ─────
console.log('═══════════════════════════════════════════════');
console.log('🔍 Analiza index.html (prerender):');
console.log('═══════════════════════════════════════════════');

if (fs.existsSync('index.html')) {
  const html = fs.readFileSync('index.html', 'utf8');
  const bgRegex = /background-image:url\('images\/([^']+)'\)/g;
  const usedInHtml = new Set();
  let m;
  while ((m = bgRegex.exec(html)) !== null) {
    usedInHtml.add(m[1]);
  }
  console.log(`   Zdjęć użytych w index.html: ${usedInHtml.size}`);

  // Sprawdź, czy któreś z użytych w HTML nie istnieje
  const missingInHtml = [...usedInHtml].filter(f => !existingFiles.has(f.toLowerCase()));
  if (missingInHtml.length > 0) {
    console.log(`\n   ❌ Brakujące w images/ (użyte w index.html):`);
    missingInHtml.forEach(f => console.log(`      images/${f}`));
  } else {
    console.log(`   ✅ Wszystkie zdjęcia w index.html istnieją`);
  }
} else {
  console.log('   ⚠️  Brak index.html');
}

console.log('\n═══════════════════════════════════════════════');
console.log('📋 Podsumowanie:');
console.log(`   Plików w mapie photos:      ${Object.keys(photos).length}`);
console.log(`   Kierunków w trips-pl.json:  ${tripsPl.length}`);
console.log(`   Brakujących plików:         ${missing.length}`);
console.log(`   Podejrzanych (placeholder): ${suspicious.length}`);
=======
const fs = require('fs');
const path = require('path');

// ───── 1. Wczytaj mapę photos z app.js ─────
function loadPhotos() {
  const appJs = fs.readFileSync('app.js', 'utf8');
  const match = appJs.match(/const photos\s*=\s*\{([\s\S]*?)\};/);
  if (!match) {
    console.error('❌ Nie znaleziono mapy photos w app.js');
    return {};
  }
  const photos = {};
  const re = /['"]?([\w-]+)['"]?\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(match[1])) !== null) {
    photos[m[1].replace(/['"]/g, '')] = m[2];
  }
  return photos;
}

const photos = loadPhotos();
console.log(`📊 Kluczy w mapie photos: ${Object.keys(photos).length}\n`);

// ───── 2. Wczytaj trips-pl.json, żeby wiedzieć, które id są w projekcie ─────
const tripsPl = JSON.parse(fs.readFileSync('trips-pl.json', 'utf8'));

// ───── 3. Sprawdź, które pliki istnieją w images/ ─────
const imagesDir = './images';
const existingFiles = new Set(
  fs.readdirSync(imagesDir).map(f => f.toLowerCase())
);

// ───── 4. Sprawdź każdy kierunek z trips-pl.json ─────
const missing = [];
const placeholder = [];
const ok = [];

for (const trip of tripsPl) {
  const img = photos[trip.id];
  if (!img) {
    missing.push({ id: trip.id, reason: 'brak w mapie photos' });
    continue;
  }
  if (!existingFiles.has(img.toLowerCase())) {
    missing.push({ id: trip.id, img, category: trip.category, title: trip.title });
  } else {
    ok.push({ id: trip.id, img });
  }
}

// ───── 5. Sprawdź, czy jakieś id używają placeholderów (innego id) ─────
// Placeholder = gdy plik istnieje, ale nazwa pliku nie zawiera id
const suspicious = [];
for (const trip of tripsPl) {
  const img = photos[trip.id];
  if (!img) continue;
  const base = img.replace('.webp', '').toLowerCase();
  const id = trip.id.toLowerCase();
  // Sprawdź, czy nazwa pliku zawiera id (np. malbork.webp zawiera "malbork")
  if (!base.includes(id) && !id.includes(base)) {
    // Wyjątki — celowe mapowania (np. sopot-plaza → sopot)
    const exceptions = ['sopot-plaza', 'jezioro-solinskie'];
    if (exceptions.includes(trip.id)) continue;
    // Sprawdź, czy to nie jest przypadek "id → id.webp"
    suspicious.push({ id: trip.id, img, category: trip.category, title: trip.title });
  }
}

// ───── 6. Wypisz wyniki ─────
console.log('═══════════════════════════════════════════════');
console.log('✅ OK — istnieją pliki:');
console.log(`   ${ok.length} kierunków`);
console.log('═══════════════════════════════════════════════\n');

if (missing.length > 0) {
  console.log('═══════════════════════════════════════════════');
  console.log(`❌ BRAKUJĄCE PLIKI: ${missing.length}`);
  console.log('   (karty pokazują puste tło, bo plik nie istnieje)');
  console.log('═══════════════════════════════════════════════');
  for (const m of missing) {
    if (m.reason) {
      console.log(`   ${m.id} — ${m.reason}`);
    } else {
      console.log(`   ${m.id.padEnd(30)} → ${m.img.padEnd(30)} [${m.category}]`);
    }
  }
  console.log();
}

if (suspicious.length > 0) {
  console.log('═══════════════════════════════════════════════');
  console.log(`⚠️  PODEJRZANE (placeholder?): ${suspicious.length}`);
  console.log('   (karta pokazuje inne zdjęcie niż wynikałoby z id)');
  console.log('═══════════════════════════════════════════════');
  for (const s of suspicious) {
    console.log(`   ${s.id.padEnd(30)} → ${s.img.padEnd(30)} [${s.category}]`);
  }
  console.log();
}

// ───── 7. Sprawdź index.html, jakie tła są w prerenderze ─────
console.log('═══════════════════════════════════════════════');
console.log('🔍 Analiza index.html (prerender):');
console.log('═══════════════════════════════════════════════');

if (fs.existsSync('index.html')) {
  const html = fs.readFileSync('index.html', 'utf8');
  const bgRegex = /background-image:url\('images\/([^']+)'\)/g;
  const usedInHtml = new Set();
  let m;
  while ((m = bgRegex.exec(html)) !== null) {
    usedInHtml.add(m[1]);
  }
  console.log(`   Zdjęć użytych w index.html: ${usedInHtml.size}`);

  // Sprawdź, czy któreś z użytych w HTML nie istnieje
  const missingInHtml = [...usedInHtml].filter(f => !existingFiles.has(f.toLowerCase()));
  if (missingInHtml.length > 0) {
    console.log(`\n   ❌ Brakujące w images/ (użyte w index.html):`);
    missingInHtml.forEach(f => console.log(`      images/${f}`));
  } else {
    console.log(`   ✅ Wszystkie zdjęcia w index.html istnieją`);
  }
} else {
  console.log('   ⚠️  Brak index.html');
}

console.log('\n═══════════════════════════════════════════════');
console.log('📋 Podsumowanie:');
console.log(`   Plików w mapie photos:      ${Object.keys(photos).length}`);
console.log(`   Kierunków w trips-pl.json:  ${tripsPl.length}`);
console.log(`   Brakujących plików:         ${missing.length}`);
console.log(`   Podejrzanych (placeholder): ${suspicious.length}`);
>>>>>>> ccc4658c4a7d66f235c701a64926ebc8bd10c776
console.log('═══════════════════════════════════════════════');