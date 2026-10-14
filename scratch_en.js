const fs = require('fs');

const ENTITIES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>',
  '&quot;': '"', '&#39;': "'", '&apos;': "'", '&hellip;': '…',
  '&mdash;': '—', '&ndash;': '–', '&oacute;': 'ó', '&aacute;': 'á',
  '&eacute;': 'é', '&iacute;': 'í', '&ntilde;': 'ñ', '&uuml;': 'ü',
  '&oelig;': 'œ', '&sect;': '§', '&copy;': '©', '&reg;': '®',
};
const stripTags = (s = '') =>
  String(s)
    .replace(/<\/?(strong|em|b|i|a|span|u|mark)(\s[^>]*)?>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim();

const words = (s) => stripTags(s).split(/\s+/).filter(Boolean).length;

// 1. BORY TUCHOLSKIE EN
const bory = {
  title: "Woodland Lakes & Winding Paths",
  lead: "Pure lobelia lakes, winding forest trails, and leisurely paddling along the Brda and Wda rivers. Slow travel through the Tuchola Forest — northern Poland’s vast green ocean.",
  body: `<h2>Why the Tuchola Forest, differently</h2>` +
`<p>The Tuchola Forest is one of the largest contiguous woodland complexes in Central Europe and an official UNESCO Biosphere Reserve, where nature still commands its own unhurried tempo. Far from crowded seaside resorts, you will find endless pine woods, glacial river valleys carved millennia ago, and dozens of secluded lakes hidden deep in the wilderness. The air carries a soothing fragrance of pine resin and forest moss, inviting you to breathe deeply and let go of stress. At night, the canopy yields to pristine dark skies untainted by urban light pollution.</p>` +
`<p>Slow travel across the Tuchola Forest is about intentionally dialing back your pace to reconnect with the natural world. Instead of rushing between commercial sights, take time to wander quiet sandy tracks, plunge into the crystalline depths of a pristine lobelia lake at daybreak, and listen to the gentle murmur of ancient treetops. Whether you spend your days paddling a kayak down scenic rivers, cycling the safe pathways of the Kaszubska Marszruta trail network, or foraging for wild mushrooms, this tranquil region delivers an elusive sense of freedom, space, and deep restorative silence.</p>` +
`<h2>What to see</h2>` +
`<p>Spanning the borderland of Pomerania and Kuyavia, the Tuchola Forest encompasses the scenic river basins of the Brda and Wda, a national park, and several landscape reserves. To appreciate its diverse character, split your time between peaceful waterways, rare natural reserves, and the living heritage of the local Borowiak people.</p>` +
`<h3>Waterways and wild rivers</h3>` +
`<ul>` +
`<li><strong>Kayaking the Brda River</strong> — widely considered one of the finest canoeing routes in Central Europe. Flowing gently from Swornegacie through Rytel to Woziwoda, the river winds through dense pine forests with sandy shoals and picturesque riverbanks.</li>` +
`<li><strong>The Wda River Valley</strong> — affectionately known as the Black Water, flowing at a leisurely pace through the Wda Landscape Park. Flanked by centuries-old oaks and towering pines, its clear waters are ideal for gentle, stress-free paddling.</li>` +
`<li><strong>Fojutowo Aqueduct</strong> — an exceptional 19th-century hydro-engineering monument modeled after Roman aqueducts. Here, the Great Brda Canal crosses directly over the Czerska Struga stream on an elevated brick bridge.</li>` +
`<li><strong>Lake Charzykowskie and Lake Karsińskie</strong> — the historic cradle of Polish inland yachting. Beyond the small marina in Charzykowy, you will discover tranquil reed-fringed bays, secluded wooden docks, and golden sunset vistas.</li>` +
`</ul>` +
`<h3>Natural wonders and reserves</h3>` +
`<ul>` +
`<li><strong>Lobelia lakes</strong> — remarkably transparent oligotrophic lakes such as Wielkie Gacno. Named after the rare aquatic lobelia plant, these pristine waters possess an extraordinary clarity and gentle mineral softness.</li>` +
`<li><strong>Old Polish Yews in Wierzchlas</strong> — the oldest nature reserve in Poland, safeguarding Europe’s largest natural concentration of native yew trees. Some majestic specimens have thrived here for over six centuries.</li>` +
`<li><strong>Jelenia Wyspa Nature Trail</strong> — a delightful educational walking trail in the Woziwoda Forest District, meandering across wooded peat bogs and along the scenic Struga Siedmiu Jezior stream.</li>` +
`<li><strong>Kulawa River Valley</strong> — a serene ecological haven with an interpretive pathway bordering a sparkling creek where beavers, otters, and kingfishers thrive in absolute peace.</li>` +
`</ul>` +
`<h3>Borowiak culture and heritage</h3>` +
`<ul>` +
`<li><strong>Swornegacie</strong> — an inviting lakeside village featuring the Kashubian Folk Craft House, where master artisans demonstrate regional embroidery, traditional pottery, and pine-root weaving.</li>` +
`<li><strong>Chojnice Regional Museum</strong> — housed inside the historic medieval Człuchów Gate, showcasing ethnographic collections of traditional Borowiak crafts, tools, and costumes.</li>` +
`<li><strong>Bread Village in Janówek</strong> — a charming heritage settlement tucked deep in the woods where traditional sourdough bread is baked in historic wood-fired clay ovens.</li>` +
`<li><strong>Tuchola Forest Museum in Tuchola</strong> — engaging exhibitions illustrating centuries of local forestry, traditional tree-beekeeping, and authentic timber farmhouse architecture.</li>` +
`</ul>` +
`<h2>When to go</h2>` +
`<ul>` +
`<li><strong>May and June</strong> — an enchanting period marked by lush green canopies, blooming bilberry bushes, and vibrant birdsong. Days are long and river routes remain uncrowded.</li>` +
`<li><strong>September and October</strong> — golden autumn and a paradise for mushroom foragers. The pine woods abound with porcini and chanterelles, accompanied by the resonant calls of red deer at dawn.</li>` +
`<li><strong>July and August</strong> — warm waters and sunny days ideal for swimming and family kayaking adventures. Set out early in the morning to relish uninterrupted wilderness solitude.</li>` +
`<li><strong>Winter</strong> — a season of stillness and snow-blanketed vistas. Forest trails transform into serene tracks for cross-country skiers, enveloped in crisp and invigorating winter air.</li>` +
`</ul>` +
`<h2>Getting there</h2>` +
`<ul>` +
`<li><strong>By car:</strong> convenient access from Gdańsk and the Tri-City via the A1 highway and DK22 (~1.5 hours), from Bydgoszcz via the DK25 road (~1 hour), or from Poznań (~2.5 hours).</li>` +
`<li><strong>By train:</strong> railway hubs in Chojnice, Czersk, and Tuchola provide convenient regional connections from Bydgoszcz, Gdańsk, and Piła.</li>` +
`<li><strong>By bike:</strong> the Kaszubska Marszruta cycling network provides over 200 kilometers of paved and crushed-stone trails linking rail stations with the heart of the woods.</li>` +
`</ul>` +
`<p>Once here, a bicycle or kayak is the most rewarding way to travel. Many forest settlements are well secluded from busy roads, making woodland tracks an idyllic corridor for silent exploration.</p>` +
`<h2>How much time you need</h2>` +
`<p>A weekend (2 days) offers a refreshing taste of the forest — spend your first day paddling the Brda River and your second cycling around scenic lobelia lakes.</p>` +
`<p><strong>Three to four days</strong> provide the ideal timeframe for a full restorative break. You can visit the Fojutowo Aqueduct, paddle down the Wda River, admire ancient yews in Wierzchlas, and relax lakeside.</p>` +
`<p><strong>A full week</strong> lets you unplug completely from everyday haste. It allows for multi-day river journeys, exploring the entire Kaszubska Marszruta network, and immersing yourself in woodland folklore.</p>` +
`<h2>What to eat and where to sleep</h2>` +
`<ul>` +
`<li><strong>Freshwater fish</strong> — vendace, whitefish, tench, and pike harvested from pure forest lakes, served fried crisp in butter or marinated in spiced vinegar.</li>` +
`<li><strong>Borowiak szandar</strong> — a hearty regional potato bake prepared with grated potatoes, smoked bacon, sweet marjoram, and caramelized onions, baked golden brown.</li>` +
`<li><strong>Heather and forest honey</strong> — artisanal honey harvested by migratory apiaries stationed across bloom-filled woodland heathlands.</li>` +
`<li><strong>Wild mushroom soup</strong> — a rich, aromatic broth crafted from dried porcini mushrooms gathered in local pine stands, served with handmade pasta.</li>` +
`<li><strong>Forest berries</strong> — delicious homemade bilberry buns (jagodzianki) and preserves made from freshly picked wild woodland blueberries.</li>` +
`</ul>` +
`<p>Accommodation: forestry lodges and warm agritourism farmsteads in Swornychgacie, Charzykowy, Rytel, and around Tuchola. Atmospheric wooden cabins and peaceful lakeside campsites offer unmatched tranquility.</p>` +
`<h2>Practical tips</h2>` +
`<ul>` +
`<li><strong>Offline navigation</strong> — cellular coverage can be patchy under dense woodland canopies. Download digital offline maps in advance or carry a printed topographic map.</li>` +
`<li><strong>Tick protection</strong> — damp forest mosses and fern glades are natural tick habitats. Wear light long trousers and apply effective insect repellent before hiking.</li>` +
`<li><strong>Reserve regulations</strong> — within the national park and nature reserves, stay strictly on marked paths; wild camping and picking protected flora are prohibited.</li>` +
`<li><strong>Waterway safety</strong> — always wear a certified buoyancy vest when kayaking and pack electronics and clothing in durable dry bags.</li>` +
`<li><strong>Gravel or trekking bikes</strong> — loose sandy soil on unpaved forestry paths requires wider tires; narrow road bicycle tires are unsuited for woodland routes.</li>` +
`<li><strong>Leave No Trace</strong> — take all litter with you and respect quiet hours, remembering that you are an appreciative guest in a fragile woodland ecosystem.</li>` +
`</ul>`,
  tip: "Rent a bicycle and set out along the Kaszubska Marszruta trails early in the morning. The empty paths, scent of sun-warmed pines, and morning mists drifting over the lakes create an unforgettable atmosphere.",
  gallery: ["drawa.webp"]
};

console.log('Bory EN words:', words([bory.lead, bory.body, bory.tip].join(' ')));
