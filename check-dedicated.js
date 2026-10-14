<<<<<<< HEAD
const fs = require('fs');

const MISSING_IDS = [
  'podhale', 'zakopane', 'morskie-oko', 'giewont', 'kasprowy-wierch',
  'dolina-koscieliska', 'samotnia', 'polonina-wetlinska', 'polonina-carynska',
  'kolorowe-jeziorka', 'slowinski-park', 'tatrzanski-park', 'szczeliniec',
  'wigierski-park', 'swietokrzyskie', 'bory-tucholskie', 'lasy-janowskie',
  'beskid-zywiecki', 'augustowska'
];

const imagesDir = './images';
const existingFiles = new Set(fs.readdirSync(imagesDir).map(f => f.toLowerCase()));

console.log('\n🔍 Sprawdzam, czy masz dedykowane zdjęcia dla 19 kierunków:\n');
console.log('ID                        | Dedykowany plik           | Status');
console.log('─'.repeat(70));

let hasDedicated = 0;
let noDedicated = 0;

for (const id of MISSING_IDS) {
  // Możliwe nazwy: id.webp, id-1.webp, id1.webp
  const possible = [`${id}.webp`, `${id}1.webp`, `${id}-1.webp`];
  const found = possible.find(p => existingFiles.has(p.toLowerCase()));

  if (found) {
    console.log(`${id.padEnd(25)} | ${found.padEnd(25)} | ✅ MASZ`);
    hasDedicated++;
  } else {
    console.log(`${id.padEnd(25)} | ${possible[0].padEnd(25)} | ❌ BRAK`);
    noDedicated++;
  }
}

console.log('─'.repeat(70));
console.log(`\n✅ Masz dedykowane: ${hasDedicated}`);
console.log(`❌ Brakuje:          ${noDedicated}`);
console.log('\n📋 Wgraj brakujące do images/ z tymi nazwami:');
console.log('');

for (const id of MISSING_IDS) {
  const possible = [`${id}.webp`, `${id}1.webp`, `${id}-1.webp`];
  if (!possible.some(p => existingFiles.has(p.toLowerCase()))) {
    console.log(`   ${id}.webp`);
  }
=======
const fs = require('fs');

const MISSING_IDS = [
  'podhale', 'zakopane', 'morskie-oko', 'giewont', 'kasprowy-wierch',
  'dolina-koscieliska', 'samotnia', 'polonina-wetlinska', 'polonina-carynska',
  'kolorowe-jeziorka', 'slowinski-park', 'tatrzanski-park', 'szczeliniec',
  'wigierski-park', 'swietokrzyskie', 'bory-tucholskie', 'lasy-janowskie',
  'beskid-zywiecki', 'augustowska'
];

const imagesDir = './images';
const existingFiles = new Set(fs.readdirSync(imagesDir).map(f => f.toLowerCase()));

console.log('\n🔍 Sprawdzam, czy masz dedykowane zdjęcia dla 19 kierunków:\n');
console.log('ID                        | Dedykowany plik           | Status');
console.log('─'.repeat(70));

let hasDedicated = 0;
let noDedicated = 0;

for (const id of MISSING_IDS) {
  // Możliwe nazwy: id.webp, id-1.webp, id1.webp
  const possible = [`${id}.webp`, `${id}1.webp`, `${id}-1.webp`];
  const found = possible.find(p => existingFiles.has(p.toLowerCase()));

  if (found) {
    console.log(`${id.padEnd(25)} | ${found.padEnd(25)} | ✅ MASZ`);
    hasDedicated++;
  } else {
    console.log(`${id.padEnd(25)} | ${possible[0].padEnd(25)} | ❌ BRAK`);
    noDedicated++;
  }
}

console.log('─'.repeat(70));
console.log(`\n✅ Masz dedykowane: ${hasDedicated}`);
console.log(`❌ Brakuje:          ${noDedicated}`);
console.log('\n📋 Wgraj brakujące do images/ z tymi nazwami:');
console.log('');

for (const id of MISSING_IDS) {
  const possible = [`${id}.webp`, `${id}1.webp`, `${id}-1.webp`];
  if (!possible.some(p => existingFiles.has(p.toLowerCase()))) {
    console.log(`   ${id}.webp`);
  }
>>>>>>> ccc4658c4a7d66f235c701a64926ebc8bd10c776
}