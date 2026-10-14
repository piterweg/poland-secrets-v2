<<<<<<< HEAD
const fs = require('fs');

// Mapa: slug → nowa nazwa pliku (bez "images/")
const IMAGE_MAP = {
  'slow-travel-co-to-znaczy': 'blog-slow-travel.webp',
  'weekend-w-bieszczadach': 'blog-weekend-bieszczady.webp',
  'baltyk-bez-tlumow': 'blog-baltyk-bez-tlumow.webp',
  'polska-kuchnia-regionalna': 'blog-kuchnia-regionalna.webp',
  'polska-bez-samochodu': 'blog-polska-bez-samochodu.webp',
  'polska-jesienia': 'blog-polska-jesienia.webp',
  'zima-w-tatrach': 'blog-zima-w-tatrach.webp',
  'podlasie-weekend': 'blog-podlasie-weekend.webp',
  'co-zjesc-w-krakowie': 'blog-krakow-weekend.webp',
  'mazury-bez-zagli': 'blog-mazury-bez-zagli.webp',
  'slaskim-szlakiem-zamkow': 'blog-slaskim-szlakiem-zamkow.webp',
  'jak-planowac-weekend': 'blog-jak-planowac-weekend.webp',
  'polska-wiosna': 'blog-polska-wiosna.webp',
  'rowerem-po-polsce': 'blog-rowerem-po-polsce.webp',
  'kuchnia-podlaska': 'blog-kuchnia-podlaska.webp',
  'kuchnia-podhala': 'blog-kuchnia-podhala.webp',
  'kuchnia-slaska': 'blog-kuchnia-slaska.webp',
  'kuchnia-kaszubska': 'blog-kuchnia-kaszubska.webp',
  'kuchnia-lubelska': 'blog-kuchnia-lubelska.webp',
  'kuchnia-wielkopolska': 'blog-kuchnia-wielkopolska.webp',
  'kuchnia-warminska': 'blog-kuchnia-warminska.webp',
  'kuchnia-malopolska': 'blog-kuchnia-malopolska.webp',
  'kuchnia-pomorska': 'blog-kuchnia-pomorska.webp',
  'kuchnia-dolnoslaska': 'blog-kuchnia-dolnoslaska.webp',
  'kuchnia-podkarpacka': 'blog-kuchnia-podkarpacka.webp',
  'kuchnia-mazowiecka': 'blog-kuchnia-mazowiecka.webp',
  'kuchnia-kujawska': 'blog-kuchnia-kujawska.webp',
  'kuchnia-zachodniopomorska': 'blog-kuchnia-zachodniopomorska.webp',
  'weekend-w-karkonoszach': 'blog-karkonosze-weekend.webp',
  'weekend-na-mazurach': 'blog-mazury-weekend.webp',
  'weekend-w-krakowie': 'blog-krakow-weekend.webp',
  'weekend-w-trojmiescie': 'blog-trojmasto-weekend.webp',
  'weekend-w-roztoczu': 'blog-roztocze-weekend.webp',
  'weekend-w-zakopanem': 'blog-zakopane-weekend.webp'
};

const posts = JSON.parse(fs.readFileSync('blog-posts.json', 'utf8'));
let changed = 0;
let missing = [];

for (const post of posts) {
  const newImage = IMAGE_MAP[post.slug];

  if (!newImage) {
    missing.push(post.slug);
    continue;
  }

  if (post.image !== newImage) {
    console.log(`✅ ${post.slug}: ${post.image} → ${newImage}`);
    post.image = newImage;
    changed++;
  }
}

fs.writeFileSync('blog-posts.json', JSON.stringify(posts, null, 2), 'utf8');

console.log(`\n🎉 Zmieniono ${changed} wpisów.`);

if (missing.length > 0) {
  console.log(`\n⚠️  Wpisy bez mapowania (${missing.length}):`);
  missing.forEach(s => console.log(`   - ${s}`));
=======
const fs = require('fs');

// Mapa: slug → nowa nazwa pliku (bez "images/")
const IMAGE_MAP = {
  'slow-travel-co-to-znaczy': 'blog-slow-travel.webp',
  'weekend-w-bieszczadach': 'blog-weekend-bieszczady.webp',
  'baltyk-bez-tlumow': 'blog-baltyk-bez-tlumow.webp',
  'polska-kuchnia-regionalna': 'blog-kuchnia-regionalna.webp',
  'polska-bez-samochodu': 'blog-polska-bez-samochodu.webp',
  'polska-jesienia': 'blog-polska-jesienia.webp',
  'zima-w-tatrach': 'blog-zima-w-tatrach.webp',
  'podlasie-weekend': 'blog-podlasie-weekend.webp',
  'co-zjesc-w-krakowie': 'blog-krakow-weekend.webp',
  'mazury-bez-zagli': 'blog-mazury-bez-zagli.webp',
  'slaskim-szlakiem-zamkow': 'blog-slaskim-szlakiem-zamkow.webp',
  'jak-planowac-weekend': 'blog-jak-planowac-weekend.webp',
  'polska-wiosna': 'blog-polska-wiosna.webp',
  'rowerem-po-polsce': 'blog-rowerem-po-polsce.webp',
  'kuchnia-podlaska': 'blog-kuchnia-podlaska.webp',
  'kuchnia-podhala': 'blog-kuchnia-podhala.webp',
  'kuchnia-slaska': 'blog-kuchnia-slaska.webp',
  'kuchnia-kaszubska': 'blog-kuchnia-kaszubska.webp',
  'kuchnia-lubelska': 'blog-kuchnia-lubelska.webp',
  'kuchnia-wielkopolska': 'blog-kuchnia-wielkopolska.webp',
  'kuchnia-warminska': 'blog-kuchnia-warminska.webp',
  'kuchnia-malopolska': 'blog-kuchnia-malopolska.webp',
  'kuchnia-pomorska': 'blog-kuchnia-pomorska.webp',
  'kuchnia-dolnoslaska': 'blog-kuchnia-dolnoslaska.webp',
  'kuchnia-podkarpacka': 'blog-kuchnia-podkarpacka.webp',
  'kuchnia-mazowiecka': 'blog-kuchnia-mazowiecka.webp',
  'kuchnia-kujawska': 'blog-kuchnia-kujawska.webp',
  'kuchnia-zachodniopomorska': 'blog-kuchnia-zachodniopomorska.webp',
  'weekend-w-karkonoszach': 'blog-karkonosze-weekend.webp',
  'weekend-na-mazurach': 'blog-mazury-weekend.webp',
  'weekend-w-krakowie': 'blog-krakow-weekend.webp',
  'weekend-w-trojmiescie': 'blog-trojmasto-weekend.webp',
  'weekend-w-roztoczu': 'blog-roztocze-weekend.webp',
  'weekend-w-zakopanem': 'blog-zakopane-weekend.webp'
};

const posts = JSON.parse(fs.readFileSync('blog-posts.json', 'utf8'));
let changed = 0;
let missing = [];

for (const post of posts) {
  const newImage = IMAGE_MAP[post.slug];

  if (!newImage) {
    missing.push(post.slug);
    continue;
  }

  if (post.image !== newImage) {
    console.log(`✅ ${post.slug}: ${post.image} → ${newImage}`);
    post.image = newImage;
    changed++;
  }
}

fs.writeFileSync('blog-posts.json', JSON.stringify(posts, null, 2), 'utf8');

console.log(`\n🎉 Zmieniono ${changed} wpisów.`);

if (missing.length > 0) {
  console.log(`\n⚠️  Wpisy bez mapowania (${missing.length}):`);
  missing.forEach(s => console.log(`   - ${s}`));
>>>>>>> ccc4658c4a7d66f235c701a64926ebc8bd10c776
}