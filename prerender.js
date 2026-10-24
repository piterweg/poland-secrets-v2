const fs = require('fs');
const path = require('path');

// ───── Wczytaj mapę photos z app.js ─────
function loadPhotos() {
  const appJs = fs.readFileSync('app.js', 'utf8');
  const match = appJs.match(/const photos\s*=\s*\{([\s\S]*?)\};/);
  if (!match) return {};
  const photos = {};
  const re = /['"]?([\w-]+)['"]?\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(match[1])) !== null) {
    photos[m[1].replace(/['"]/g, '')] = m[2];
  }
  return photos;
}

const photos = loadPhotos();

// ───── Escape HTML ─────
function esc(s) {
  return String(s).replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;'
  }[c]));
}

// ───── Karta kierunku (identyczna z app.js render) ─────
// Karta jest prawdziwym linkiem <a href> do strony kierunku — nie przyciskiem
// otwierającym modal. Dzięki temu crawler widzi ~124 linki wewnętrzne,
// a użytkownik może otworzyć kierunek w nowej karcie / skopiować adres.
function tripHref(t, lang) {
  const suffix = lang === 'pl' ? '' : '-en';
  return `kierunki/${t.id}${suffix}.html`;
}

function buildTripCard(t, lang) {
  const img = photos[t.id] || 'hero-polska.webp';
  const texts = {
    pl: 'Odkryj trasę →',
    en: 'Explore route →',
    es: 'Explorar ruta →'
  };
  return `<article class="trip"><div class="trip-art ${t.art}" data-id="${t.id}" data-bg="images/${img}" role="img" aria-label="${esc(t.title)}" style="background-image:url('images/${img}') !important;background-size:cover;background-position:center"><span>${esc(t.place)}</span><button class="save-trip" data-id="${t.id}" aria-label="${esc(t.title)}">♡</button></div><a class="trip-link" href="${tripHref(t, lang)}"><p class="meta">${t.region.toUpperCase()} <b>•</b> ${t.days}</p><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p><span class="read">${texts[lang] || texts.pl}</span></a></article>`;
}

// ───── Karta do huba (z linkiem do strony kierunku) ─────
function buildHubCard(t, lang) {
  const img = photos[t.id] || 'hero-polska.webp';
  return `<article class="trip"><a href="${tripHref(t, lang)}" class="trip-link"><div class="trip-art" style="background-image:url('images/${img}');background-size:cover;background-position:center"><span>${esc(t.place)}</span></div><p class="meta">${t.region.toUpperCase()} <b>•</b> ${t.days}</p><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></a></article>`;
}

// ═══════════════════════════════════════════════════════════
// KLUCZOWA FUNKCJA — wstrzykuje karty do diva o danym id
// Używa liczenia zagnieżdżeń <div>, a nie prostego regexa,
// żeby poprawnie znaleźć zamykający </div> (a nie wewnętrzny).
// ═══════════════════════════════════════════════════════════
function injectCards(html, targetId, cardsHtml) {
  // 1. Usuń wszystkie istniejące markery PRERENDER (START, END i wszystko pomiędzy)
  html = html.replace(/<!--\s*PRERENDER:START\s*-->[\s\S]*?<!--\s*PRERENDER:END\s*-->/g, '');
  html = html.replace(/<!--\s*PRERENDER:END\s*-->/g, '');
  html = html.replace(/<!--\s*PRERENDER:START\s*-->/g, '');

  // 2. Znajdź otwierający tag <div ... id="targetId" ...>
  const openRegex = new RegExp(`<div[^>]*\\sid="${targetId}"[^>]*>`, 'i');
  const openMatch = html.match(openRegex);
  if (!openMatch) {
    console.warn(`⚠️  Nie znaleziono <div id="${targetId}">`);
    return null;
  }

  const openTag = openMatch[0];
  const openIdx = openMatch.index;
  const afterOpen = openIdx + openTag.length;

  // 3. Znajdź ZAMYKAJĄCY </div> dla tego konkretnego diva
  //    Metoda: liczymy zagnieżdżenia — każdy <div> zwiększa depth,
  //    każdy </div> zmniejsza. Kiedy depth = 0, znaleźliśmy koniec.
  let depth = 1;
  let i = afterOpen;
  let closeIdx = -1;

  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf('<div', i);
    const nextClose = html.indexOf('</div>', i);

    if (nextClose === -1) break; // nie ma już </div>

    if (nextOpen !== -1 && nextOpen < nextClose) {
      // Znaleziono <div> przed </div> → zagnieżdżenie
      depth++;
      i = nextOpen + 4;
    } else {
      // Znaleziono </div> → zamknięcie jakiegoś diva
      depth--;
      if (depth === 0) {
        closeIdx = nextClose;
        break;
      }
      i = nextClose + 6;
    }
  }

  if (closeIdx === -1) {
    console.warn(`⚠️  Nie znaleziono zamykającego </div> dla "${targetId}"`);
    return null;
  }

  // 4. Wstaw nową zawartość między otwierającym a zamykającym tagiem
  const before = html.slice(0, afterOpen);
  const after = html.slice(closeIdx);
  const newContent = `\n<!-- PRERENDER:START -->\n${cardsHtml}\n<!-- PRERENDER:END -->\n`;

  return before + newContent + after;
}

// ───── Zaktualizuj plik ─────
function updateFile(file, targetId, cardsHtml) {
  if (!fs.existsSync(file)) {
    console.warn(`⚠️  Brak pliku: ${file}`);
    return false;
  }
  const html = fs.readFileSync(file, 'utf8');
  const updated = injectCards(html, targetId, cardsHtml);
  if (updated === null) return false;
  fs.writeFileSync(file, updated, 'utf8');
  console.log(`✅ ${file}`);
  return true;
}

// ═══════════════════════════════════════════════════════════
// 1. INDEX (PL, EN, ES)
// ═══════════════════════════════════════════════════════════
console.log('\n── Strona główna ──');
const tripsPl = JSON.parse(fs.readFileSync('trips-pl.json', 'utf8'));
const tripsEn = JSON.parse(fs.readFileSync('trips-en.json', 'utf8'));

const cardsPl = tripsPl.map(t => buildTripCard(t, 'pl')).join('\n');
const cardsEn = tripsEn.map(t => buildTripCard(t, 'en')).join('\n');

updateFile('index.html', 'trip-grid', cardsPl);
updateFile('index-en.html', 'trip-grid', cardsEn);
updateFile('index-es.html', 'trip-grid', cardsEn);

// ═══════════════════════════════════════════════════════════
// 2. HUBY TEMATYCZNE
// ═══════════════════════════════════════════════════════════
console.log('\n── Huby tematyczne ──');

const HUBS = [
  { filePl: 'zamki.html',                fileEn: 'zamki-en.html',                category: 'zamki' },
  { filePl: 'unesco.html',               fileEn: 'unesco-en.html',               category: 'unesco' },
  { filePl: 'miasteczka.html',           fileEn: 'miasteczka-en.html',           category: 'miasteczka' },
  { filePl: 'szlaki.html',               fileEn: 'szlaki-en.html',               category: 'szlaki' },
  { filePl: 'kuchnia.html',              fileEn: 'kuchnia-en.html',              category: 'kuchnia' },
  { filePl: 'wsie.html',                 fileEn: 'wsie-en.html',                 category: 'wsie' },
  { filePl: 'podroze-tematyczne.html',   fileEn: 'podroze-tematyczne-en.html',   category: 'podroze-tematyczne' },
  { filePl: 'parki-narodowe.html',       fileEn: 'parki-narodowe-en.html',       category: 'parki-narodowe' }
];

for (const hub of HUBS) {
  const itemsPl = tripsPl.filter(t => t.category === hub.category);
  const itemsEn = tripsEn.filter(t => t.category === hub.category);

  if (itemsPl.length > 0) {
    const cards = itemsPl.map(t => buildHubCard(t, 'pl')).join('\n');
    updateFile(hub.filePl, 'hub-grid', cards);
  } else {
    console.warn(`⚠️  Brak kierunków PL dla kategorii "${hub.category}"`);
  }

  if (itemsEn.length > 0) {
    const cards = itemsEn.map(t => buildHubCard(t, 'en')).join('\n');
    updateFile(hub.fileEn, 'hub-grid', cards);
  }
}

// ═══════════════════════════════════════════════════════════
// 3. STRONY REGIONÓW
// ═══════════════════════════════════════════════════════════
console.log('\n── Strony regionów ──');

const REGION_ALIASES = {
  'pomorskie':             { pl: ['Pomorze'],                       en: ['Pomerania'] },
  'dolnoslaskie':          { pl: ['Dolny Śląsk'],                   en: ['Lower Silesia'] },
  'malopolskie':           { pl: ['Małopolska'],                    en: ['Lesser Poland'] },
  'podkarpackie':          { pl: ['Podkarpacie'],                   en: ['Subcarpathia'] },
  'podlaskie':             { pl: ['Podlasie'],                      en: ['Podlasie'] },
  'mazowieckie':           { pl: ['Mazowsze'],                      en: ['Masovia'] },
  'warminsko-mazurskie':   { pl: ['Warmia-Mazury'],                 en: ['Warmia-Masuria'] },
  'wielkopolskie':         { pl: ['Wielkopolska'],                  en: ['Greater Poland'] },
  'slaskie':               { pl: ['Śląsk', 'Śląskie'],              en: ['Silesia'] },
  'zachodniopomorskie':    { pl: ['Zachodniopomorskie'],            en: ['West Pomerania'] },
  'kujawsko-pomorskie':    { pl: ['Kujawy-Pomorze'],                en: ['Kuyavia-Pomerania'] },
  'lubelskie':             { pl: ['Lubelszczyzna'],                 en: ['Lublin Region'] },
  'lodzkie':               { pl: ['Łódzkie'],                       en: ['Łódź Region'] },
  'opolskie':              { pl: ['Opolskie'],                      en: ['Opole Region'] },
  'swietokrzyskie':        { pl: ['Świętokrzyskie'],                en: ['Holy Cross Region'] },
  'lubuskie':              { pl: ['Lubuskie'],                      en: ['Lubusz'] }
};

for (const [slug, aliases] of Object.entries(REGION_ALIASES)) {
  const itemsPl = tripsPl.filter(t => aliases.pl.includes(t.region));
  const itemsEn = tripsEn.filter(t => aliases.en.includes(t.region));

  if (itemsPl.length > 0) {
    const cards = itemsPl.map(t => buildHubCard(t, 'pl')).join('\n');
    updateFile(`${slug}.html`, 'hub-grid', cards);
  }

  if (itemsEn.length > 0) {
    const cards = itemsEn.map(t => buildHubCard(t, 'en')).join('\n');
    updateFile(`${slug}-en.html`, 'hub-grid', cards);
  }
}

// ═══════════════════════════════════════════════════════════
// PODSUMOWANIE
// ═══════════════════════════════════════════════════════════
console.log('\n══════════════════════════');
console.log('✅ Prerender zakończony');
console.log(`   Kierunków PL: ${tripsPl.length}`);
console.log(`   Kierunków EN: ${tripsEn.length}`);
console.log(`   Hubów:        ${HUBS.length}`);
console.log(`   Regionów:     ${Object.keys(REGION_ALIASES).length}`);
console.log('══════════════════════════');