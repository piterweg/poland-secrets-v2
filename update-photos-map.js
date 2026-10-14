<<<<<<< HEAD
const fs = require('fs');

// ───── Mapowanie: id → nowy plik ─────
// (zmieniamy tylko te, które miały placeholdery)
const REPLACEMENTS = {
  'podhale': 'podhale.webp',
  'zakopane': 'zakopane.webp',
  'morskie-oko': 'morskie-oko.webp',
  'giewont': 'giewont.webp',
  'kasprowy-wierch': 'kasprowy-wierch.webp',
  'dolina-koscieliska': 'dolina-koscieliska.webp',
  'samotnia': 'samotnia.webp',
  'polonina-wetlinska': 'polonina-wetlinska.webp',
  'polonina-carynska': 'polonina-carynska.webp',
  'kolorowe-jeziorka': 'kolorowe-jeziorka.webp',
  'slowinski-park': 'slowinski-park.webp',
  'tatrzanski-park': 'tatrzanski-park.webp',
  'szczeliniec': 'szczeliniec.webp',
  'wigierski-park': 'wigierski-park.webp',
  'swietokrzyskie': 'swietokrzyskie.webp',
  'bory-tucholskie': 'bory-tucholskie.webp',
  'lasy-janowskie': 'lasy-janowskie.webp',
  'beskid-zywiecki': 'beskid-zywiecki.webp',
  'augustowska': 'augustowska.webp',
  // Bonus — Wieliczka i Bochnia też miały złe zdjęcia
  'wieliczka': 'wieliczka.webp',
  'bochnia': 'bochnia.webp'
};

let appJs = fs.readFileSync('app.js', 'utf8');
let changed = 0;
let notFound = [];

for (const [id, newFile] of Object.entries(REPLACEMENTS)) {
  // Wzorce: "id: 'stary.webp'" lub "'id': 'stary.webp'"
  // Dwa warianty: bez cudzysłowów (id bez myślnika) i z cudzysłowami (id z myślnikiem)
  const patterns = [
    new RegExp(`(${id})\\s*:\\s*'[^']+',`, 'g'),           // id: 'file.webp',
    new RegExp(`('${id}')\\s*:\\s*'[^']+',`, 'g')          // 'id': 'file.webp',
  ];

  let replaced = false;
  for (const pattern of patterns) {
    const before = appJs;
    appJs = appJs.replace(pattern, (match, key) => {
      replaced = true;
      // Zachowaj oryginalny format klucza (z lub bez cudzysłowów)
      return `${key}: '${newFile}',`;
    });
    if (appJs !== before) {
      changed++;
      console.log(`✅ ${id.padEnd(25)} → ${newFile}`);
      replaced = true;
      break;
    }
  }

  if (!replaced) {
    notFound.push(id);
  }
}

fs.writeFileSync('app.js', appJs, 'utf8');

console.log(`\n════════════════════════════`);
console.log(`🎉 Zaktualizowano ${changed} wpisów w app.js`);
if (notFound.length > 0) {
  console.log(`\n⚠️  Nie znaleziono (${notFound.length}):`);
  notFound.forEach(id => console.log(`   ${id}`));
}
=======
const fs = require('fs');

// ───── Mapowanie: id → nowy plik ─────
// (zmieniamy tylko te, które miały placeholdery)
const REPLACEMENTS = {
  'podhale': 'podhale.webp',
  'zakopane': 'zakopane.webp',
  'morskie-oko': 'morskie-oko.webp',
  'giewont': 'giewont.webp',
  'kasprowy-wierch': 'kasprowy-wierch.webp',
  'dolina-koscieliska': 'dolina-koscieliska.webp',
  'samotnia': 'samotnia.webp',
  'polonina-wetlinska': 'polonina-wetlinska.webp',
  'polonina-carynska': 'polonina-carynska.webp',
  'kolorowe-jeziorka': 'kolorowe-jeziorka.webp',
  'slowinski-park': 'slowinski-park.webp',
  'tatrzanski-park': 'tatrzanski-park.webp',
  'szczeliniec': 'szczeliniec.webp',
  'wigierski-park': 'wigierski-park.webp',
  'swietokrzyskie': 'swietokrzyskie.webp',
  'bory-tucholskie': 'bory-tucholskie.webp',
  'lasy-janowskie': 'lasy-janowskie.webp',
  'beskid-zywiecki': 'beskid-zywiecki.webp',
  'augustowska': 'augustowska.webp',
  // Bonus — Wieliczka i Bochnia też miały złe zdjęcia
  'wieliczka': 'wieliczka.webp',
  'bochnia': 'bochnia.webp'
};

let appJs = fs.readFileSync('app.js', 'utf8');
let changed = 0;
let notFound = [];

for (const [id, newFile] of Object.entries(REPLACEMENTS)) {
  // Wzorce: "id: 'stary.webp'" lub "'id': 'stary.webp'"
  // Dwa warianty: bez cudzysłowów (id bez myślnika) i z cudzysłowami (id z myślnikiem)
  const patterns = [
    new RegExp(`(${id})\\s*:\\s*'[^']+',`, 'g'),           // id: 'file.webp',
    new RegExp(`('${id}')\\s*:\\s*'[^']+',`, 'g')          // 'id': 'file.webp',
  ];

  let replaced = false;
  for (const pattern of patterns) {
    const before = appJs;
    appJs = appJs.replace(pattern, (match, key) => {
      replaced = true;
      // Zachowaj oryginalny format klucza (z lub bez cudzysłowów)
      return `${key}: '${newFile}',`;
    });
    if (appJs !== before) {
      changed++;
      console.log(`✅ ${id.padEnd(25)} → ${newFile}`);
      replaced = true;
      break;
    }
  }

  if (!replaced) {
    notFound.push(id);
  }
}

fs.writeFileSync('app.js', appJs, 'utf8');

console.log(`\n════════════════════════════`);
console.log(`🎉 Zaktualizowano ${changed} wpisów w app.js`);
if (notFound.length > 0) {
  console.log(`\n⚠️  Nie znaleziono (${notFound.length}):`);
  notFound.forEach(id => console.log(`   ${id}`));
}
>>>>>>> ccc4658c4a7d66f235c701a64926ebc8bd10c776
console.log('════════════════════════════');