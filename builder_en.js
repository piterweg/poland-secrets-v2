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
`<p>The Tuchola Forest is one of the largest continuous woodland complexes in Central Europe and a UNESCO Biosphere Reserve where nature sets its own unhurried rules. Far from crowded seaside resorts, you find pine woods, glacial river valleys, and dozens of secluded lakes hidden in wilderness. The air carries a scent of pine resin and moss, soothing the senses and inviting deep breaths. At night, the canopy yields to dark skies free of city glare.</p>` +
`<p>Slow travel across the Tuchola Forest is about dialing back your pace to connect with nature. It means trading haste for quiet wandering along sandy tracks, morning swims in clear lobelia lakes, and listening to the rustle of ancient pines. Whether you choose kayak trips, cycling on Kaszubska Marszruta paths, or foraging for wild mushrooms, the forest offers rare freedom, space, and deep restorative calm.</p>` +
`<h2>What to see</h2>` +
`<p>Spanning Pomerania and Kuyavia, the Tuchola Forest covers river basins of the Brda and Wda, a national park, and several landscape reserves. To appreciate its character, divide your trip between waterways, nature reserves, and Borowiak heritage.</p>` +
`<h3>Waterways and wild rivers</h3>` +
`<ul>` +
`<li><strong>Kayaking the Brda River</strong> — among the finest canoeing routes in Poland. Flowing from Swornegacie through Rytel to Woziwoda, the river winds through dense pine woods with sandy shallows and picturesque meanders.</li>` +
`<li><strong>The Wda River Valley</strong> — known as the Black Water, flowing gently through Wda Landscape Park. Flanked by oaks and pines, its clear stream is ideal for calm paddling.</li>` +
`<li><strong>Fojutowo Aqueduct</strong> — a 19th-century hydro-engineering monument modeled on Roman aqueducts. The Great Brda Canal crosses directly over the Czerska Struga stream on an elevated brick bridge.</li>` +
`<li><strong>Lake Charzykowskie and Lake Karsińskie</strong> — the cradle of Polish inland sailing. Beyond Charzykowy marina, you will find quiet bays, reed beds, and wooden docks ideal at sunset.</li>` +
`</ul>` +
`<h3>Natural wonders and reserves</h3>` +
`<ul>` +
`<li><strong>Lobelia lakes</strong> — transparent oligotrophic waters such as Wielkie Gacno. Named after the rare lobelia plant, these lakes possess gentle clarity and soft mineral water.</li>` +
`<li><strong>Old Polish Yews in Wierzchlas</strong> — Poland’s oldest nature reserve, protecting Europe’s largest natural stand of yews. Majestic specimens have thrived here for centuries.</li>` +
`<li><strong>Jelenia Wyspa Nature Trail</strong> — a scenic walking path in Woziwoda Forest District, crossing peat bogs and following the Struga Siedmiu Jezior stream.</li>` +
`<li><strong>Kulawa River Valley</strong> — a protected wildlife sanctuary with an interpretive trail along a sparkling creek where beavers, otters, and water birds thrive.</li>` +
`</ul>` +
`<h3>Borowiak culture and heritage</h3>` +
`<ul>` +
`<li><strong>Swornegacie</strong> — an inviting village with the Kashubian Folk Craft House, displaying regional embroidery, pottery, and pine-root weaving.</li>` +
`<li><strong>Chojnice Regional Museum</strong> — located inside the medieval Człuchów Gate, showcasing traditional Borowiak tools, garments, and crafts.</li>` +
`<li><strong>Bread Village in Janówek</strong> — a heritage settlement where traditional sourdough bread is baked in historic wood-fired clay ovens.</li>` +
`<li><strong>Tuchola Forest Museum in Tuchola</strong> — exhibits detailing local forestry, tree beekeeping, and authentic timber farmhouse architecture.</li>` +
`</ul>` +
`<h2>When to go</h2>` +
`<ul>` +
`<li><strong>May and June</strong> — prime time for lush green woods, blooming bilberry bushes, and birdsong. Days are long and waterways remain uncrowded.</li>` +
`<li><strong>September and October</strong> — golden autumn and a foragers’ paradise. The forest yields porcini and chanterelles, accompanied by red deer rutting calls at dawn.</li>` +
`<li><strong>July and August</strong> — warm water and sunny days suited for swimming and kayaking. Start early in the morning to enjoy uninterrupted wilderness quiet.</li>` +
`<li><strong>Winter</strong> — a season of deep silence and snow-covered woods. Forest trails turn into serene routes for cross-country skiers in crisp air.</li>` +
`</ul>` +
`<h2>Getting there</h2>` +
`<ul>` +
`<li><strong>By car:</strong> easy access from Gdańsk via highway A1 and route DK22 (~1.5 hours), from Bydgoszcz via DK25 (~1 hour), or from Poznań (~2.5 hours).</li>` +
`<li><strong>By train:</strong> rail stations in Chojnice, Czersk, and Tuchola provide regional connections from Bydgoszcz, Gdańsk, and Piła.</li>` +
`<li><strong>By bike:</strong> the Kaszubska Marszruta cycling network provides over 200 km of paved trails connecting rail stations with the heart of the forest.</li>` +
`</ul>` +
`<p>A bike or kayak is the most rewarding way to explore. Many settlements lie far from main roads, making woodland tracks ideal for silent travel.</p>` +
`<h2>How much time you need</h2>` +
`<p>A weekend (2 days) offers a refreshing taste — spend one day paddling the Brda and the second cycling around lobelia lakes.</p>` +
`<p><strong>Three to four days</strong> provide the ideal timeframe for full renewal. Visit Fojutowo Aqueduct, paddle the Wda, see ancient yews, and relax by the water.</p>` +
`<p><strong>A full week</strong> lets you unplug completely. It allows for multi-day river journeys, exploring Kaszubska Marszruta, and discovering regional folklore.</p>` +
`<h2>What to eat and where to sleep</h2>` +
`<ul>` +
`<li><strong>Freshwater fish</strong> — vendace, whitefish, tench, and pike from local lakes, pan-fried in butter or marinated in spiced vinegar.</li>` +
`<li><strong>Borowiak szandar</strong> — a hearty potato bake prepared with grated potatoes, smoked bacon, marjoram, and onions, baked golden brown.</li>` +
`<li><strong>Heather and forest honey</strong> — artisanal honey harvested by apiaries placed across blooming woodland heathlands.</li>` +
`<li><strong>Mushroom soup</strong> — an aromatic broth made from dried porcini gathered in local pine woods, served with homemade noodles.</li>` +
`<li><strong>Forest berries</strong> — delicious bilberry buns (jagodzianki) and preserves made from freshly picked blueberries.</li>` +
`</ul>` +
`<p>Accommodation: forestry lodges and farmsteads in Swornegacie, Charzykowy, Rytel, and around Tuchola. Wooden cabins and lakeside campsites offer unmatched peace.</p>` +
`<h2>Practical tips</h2>` +
`<ul>` +
`<li><strong>Offline maps</strong> — cellular coverage is patchy under dense canopies. Download digital offline maps or bring a printed topographic map.</li>` +
`<li><strong>Tick protection</strong> — damp mosses and ferns are tick habitats. Wear light long trousers and apply effective repellent.</li>` +
`<li><strong>Reserve regulations</strong> — in the national park and nature reserves, stay on marked paths; wild camping and picking protected flora are banned.</li>` +
`<li><strong>Waterway safety</strong> — wear a life jacket when kayaking and pack gear in durable waterproof dry bags.</li>` +
`<li><strong>Trekking or gravel bikes</strong> — sandy forestry paths require wider tires; road bicycle tires struggle off pavement.</li>` +
`<li><strong>Leave No Trace</strong> — take all trash with you and keep noise down, respecting the quiet woodland habitat.</li>` +
`</ul>`,
  tip: "Rent a bicycle and set out along Kaszubska Marszruta trails early in the morning. Empty paths, the scent of sun-warmed pines, and morning mists create an unforgettable atmosphere.",
  gallery: ["drawa.webp"]
};

// 2. DOLINA BARYCZY EN
const barycz = {
  title: "Birdwatching Weekend",
  lead: "Milicz Ponds, meanders of a lazy river, and an open-air ornithological theater. Slow travel through the Barycz Valley — a centuries-old sanctuary of water, forests, and wildlife.",
  body: `<h2>Why the Barycz Valley, differently</h2>` +
`<p>The Barycz Valley is one of Poland’s prime ecological treasures and Europe’s largest fishpond complex, rooted in traditions established by medieval Cistercian monks. Situated along Lower Silesia and Greater Poland, it reveals a landscape where open water, riparian woodlands, and stately oak avenues blend into harmony. Far from urban rush, you find tranquil water mirrors, whispering reed beds, and bird populations protected by the Ramsar Convention. Days follow sunrises, sunsets, and feeding hours of winged residents.</p>` +
`<p>Slow travel in the Barycz Valley means exploring with binoculars in hand at an unhurried pace. Patience brings rich rewards: flocks of cranes landing in evening mist, a white-tailed eagle cruising overhead, and morning calls of wild geese. Gentle, flat terrain favors long cycling tours along former narrow-gauge railway corridors, while the Barycz River allows safe, unhurried paddling. This peaceful valley nurtures mindfulness and quiets busy minds.</p>` +
`<h2>What to see</h2>` +
`<p>Barycz Valley Landscape Park spans over 87,000 hectares of ponds, wet meadows, and quiet woods. The highlights center on the Milicz Ponds, the river corridor, and historic estate towns.</p>` +
`<h3>The Milicz Ponds and bird sanctuaries</h3>` +
`<ul>` +
`<li><strong>Ruda Żmigrodzka and Radziądz complex</strong> — extensive working fishponds framed by old woods. You will find nature paths, bird hides, and an observation tower overlooking feeding water birds.</li>` +
`<li><strong>Stawno complex and Grabownica Pond</strong> — the heart of the reserve with a viewing tower by Grabownica Pond. It is among Poland’s premier spots for observing waterfowl and waders.</li>` +
`<li><strong>Ruda Sułowska Center</strong> — a visitor hub providing guided electric vehicle birdwatching safaris along pond dykes, alongside a multimedia fishery heritage museum.</li>` +
`<li><strong>Stawy Milickie Nature Reserve</strong> — refuge for over 300 bird species, including cormorants, great egrets, bitterns, red kites, and nesting white-tailed eagles.</li>` +
`</ul>` +
`<h3>Cycling paths and kayaking routes</h3>` +
`<ul>` +
`<li><strong>Former Narrow-Gauge Railway Trail</strong> — a smooth paved cycling path running from Sułów through Milicz to Grabownica, entirely free from car traffic and great for families.</li>` +
`<li><strong>Barycz River kayaking</strong> — a gentle lowland paddling route from Odolanów to Milicz or Sułów. The river flows past reeds and alder woods with no technical obstacles.</li>` +
`<li><strong>The Carp Trail</strong> — a network of cycling routes connecting nature reserves, historic manor houses, technical monuments, and local fish restaurants.</li>` +
`<li><strong>Historic oak avenues</strong> — ancient pedunculate oaks lining pond dykes and country lanes, harboring rare beetles like the great capricorn beetle and hermit beetle.</li>` +
`<li><strong>Krośnice Park Railway</strong> — a heritage narrow-gauge steam railway in Krośnice running around ponds within an old palace park.</li>` +
`</ul>` +
`<h3>Cultural heritage and historic estates</h3>` +
`<ul>` +
`<li><strong>Milicz Palace and Park</strong> — a neoclassical residence of the Maltzan family set in Silesia’s first English landscape park with romantic ruins and ponds.</li>` +
`<li><strong>Church of Grace in Milicz</strong> — a historic timber-framed church from the 18th century, one of few surviving Protestant Churches of Grace in Silesia.</li>` +
`<li><strong>Żmigród Palace Complex</strong> — picturesque ruins of the Hatzfeldt palace and a preserved 14th-century residential tower set in a restored park.</li>` +
`<li><strong>Traditional carp aquaculture</strong> — sustainable pond management practiced for eight centuries, pairing fish farming with wildlife habitat care.</li>` +
`</ul>` +
`<h2>When to go</h2>` +
`<ul>` +
`<li><strong>September and October</strong> — the peak slow travel season. The valley hosts Carp Days, pond water drawdowns, and gatherings of tens of thousands of migrating geese and cranes.</li>` +
`<li><strong>April and May</strong> — spring bird arrival, breeding displays, and vivid greenery. Ideal weather for cycling without summer heat.</li>` +
`<li><strong>June and July</strong> — warm summer days tailored for paddling the Barycz River. Start out early in the morning to avoid midday heat on exposed dykes.</li>` +
`<li><strong>Winter</strong> — stark vistas of frozen ponds patrolled by eagles. Remarkable stillness and zero tourist crowds provide profound quiet.</li>` +
`</ul>` +
`<h2>Getting there</h2>` +
`<ul>` +
`<li><strong>By car:</strong> quick access from Wrocław via expressway S5 and road DK15 (~50 minutes), from Poznań via S5 (~1.5 hours), or from Kalisz (~1 hour).</li>` +
`<li><strong>By train:</strong> Lower Silesian Railway trains from Wrocław stop in Żmigród, Krośnice, and Milicz, with easy bicycle transport.</li>` +
`<li><strong>By bike:</strong> marked trails lead from northern Wrocław through scenic Trzebnica Hills into the valley.</li>` +
`</ul>` +
`<p>The valley is ideal for bicycling — flat terrain and paved tracks let you reach most bird reserves without driving.</p>` +
`<h2>How much time you need</h2>` +
`<p>A weekend (2 days) is perfect for a first visit — spend one day biking the old railway trail and the second visiting viewing towers.</p>` +
`<p><strong>Three to four days</strong> let you pair biking with river kayaking, tour palaces in Milicz and Żmigród, and taste local fish dishes.</p>` +
`<p><strong>A full week</strong> lets you explore every pond cluster, join dawn bird walks, and disconnect entirely from everyday stress.</p>` +
`<h2>What to eat and where to sleep</h2>` +
`<ul>` +
`<li><strong>Milicz carp</strong> — certified traditional carp with tender meat, served crispy fried, herb-baked, smoked, or Jewish-style.</li>` +
`<li><strong>Fried freshwater fish</strong> — local catfish, pikeperch, sturgeon, and silver carp served in family-run pondside taverns.</li>` +
`<li><strong>Barycz fish soup</strong> — an aromatic soup simmered from several fish species with fresh root vegetables.</li>` +
`<li><strong>Regional juices and honey</strong> — cold-pressed juices from local orchards, phacelia and woodland honeys, and pumpkin preserves.</li>` +
`<li><strong>Local bakery bread</strong> — traditional rye sourdough bread baked in craft ovens.</li>` +
`</ul>` +
`<p>Accommodation: agritourism farmsteads in Ruda Żmigrodzka, Stawno, and Sułów, angler guest houses in Ruda Sułowska, and hotels in Milicz and Żmigród.</p>` +
`<h2>Practical tips</h2>` +
`<ul>` +
`<li><strong>Binoculars are essential</strong> — without binoculars or a telephoto lens, birds resting on wide ponds remain hard to spot.</li>` +
`<li><strong>Earth-tone clothing</strong> — bright colors startle resting birds. Choose green, brown, grey, or beige clothing.</li>` +
`<li><strong>Respect private dykes</strong> — dykes marked with fishery signs are working production areas and bird nesting zones; do not enter closed sectors.</li>` +
`<li><strong>Sun and insect protection</strong> — open dykes offer no shade; bring a sun hat, sunscreen, and reliable mosquito repellent.</li>` +
`<li><strong>Silence at hides</strong> — viewing towers are nature observation points; move quietly and do not use speakers.</li>` +
`<li><strong>Advance bookings</strong> — book kayaks and rental bikes in advance on weekends during autumn carp harvest festivals.</li>` +
`</ul>`,
  tip: "Head to the observation tower by Grabownica Pond an hour before sunset. Watching thousands of geese and cranes descending to roost against the evening sky is one of the most moving wildlife spectacles in Europe.",
  gallery: ["barycz.webp", "barycz1.webp", "mazury.webp", "biebrza.webp"]
};

// 3. LASY JANOWSKIE EN
const janowskie = {
  title: "Serenity in Eastern Poland",
  lead: "Pure woodland ponds, wild refuges of the Biłgoraj horse, and endless trails through the Solska Wilderness. Slow travel in the Janów Forests — an oasis of quiet, forest mysteries, and vanishing crafts.",
  body: `<h2>Why the Janów Forests, differently</h2>` +
`<p>The Janów Forests form the western realm of the expansive Solska Wilderness, spanning the frontier of Lublin and Subcarpathia. This is an uncommon territory where nature preserves an authentic, untamed spirit. Instead of crowded boardwalks, you encounter pine and fir woods, inland dunes, peat bogs, and quiet ponds sheltered beneath canopy shade. Crisp woodland air scented with pine resin and peat, soft sandy trails, and pervasive quiet make this an ideal sanctuary from daily hurry.</p>` +
`<p>Slow travel across the Janów Forests unfolds through gentle discovery of woodland lore. It brings dawn walks along timber boardwalks above mist-veiled bogs at Imielty Ług, spotting semi-wild Biłgoraj horses in Szklarnia, and peaceful kayak trips on the winding Bukowa River. The region weaves raw nature with wartime partisan heritage and living traditional crafts — from wood-fired pottery to folk religious carving. Here time slows down, letting simple wonders take center stage.</p>` +
`<h2>What to see</h2>` +
`<p>The Janów Forests Landscape Park features diverse reserves, historic battle sites, and artisan hamlets. Divide your exploration between wild woodlands, memory trails, and regional folk culture.</p>` +
`<h3>Wild backwoods and nature reserves</h3>` +
`<ul>` +
`<li><strong>Biłgoraj Horse Refuge in Szklarnia</strong> — a semi-wild breeding reserve of primitive horses descended from wild tarpans. Watch these gentle herds across woodland meadows along an interpretive path.</li>` +
`<li><strong>Imielty Ług Nature Reserve</strong> — among Poland’s premier raised peat bog reserves. A wooden boardwalk and observation deck guide you through wetlands harboring cranes, elk, and sundew plants.</li>` +
`<li><strong>Bukowa River Valley</strong> — a clean, sandy-bottomed river meandering through pine forests. It provides an intimate kayaking trail and walking path along quiet forested banks.</li>` +
`<li><strong>Szklarnia and Janów Forests Reserve</strong> — boggy woodlands, inland sand dunes, and fir stands sheltering rare boreal plants and nesting birds of prey.</li>` +
`<li><strong>Kacze Błota Reserve</strong> — a secluded woodland bog with dark water pools, providing shelter for waterfowl and forest game.</li>` +
`</ul>` +
`<h3>History and remarkable architecture</h3>` +
`<ul>` +
`<li><strong>Porytowe Hill Battlefield</strong> — location of Poland’s largest World War II partisan battle (June 1944). A monument rises among pines beside the Branew River along historic forest trails.</li>` +
`<li><strong>Wooden Church in Momoty Górne</strong> — St. Adalbert’s wooden church, with an interior carved entirely by hand by long-serving parish priest Father Kazimierz Pińciurek.</li>` +
`<li><strong>Hamlets of Pawiowa and Ujście</strong> — secluded settlements preserving traditional wooden farmstead architecture, framed by forest clearings and quiet ponds.</li>` +
`<li><strong>Zoom Natury Recreation Park in Janów Lubelski</strong> — an ecological park beside Lake Janowskie, blended into pine woods, with sandy beaches and science labs.</li>` +
`</ul>` +
`<h3>Living traditions and heritage</h3>` +
`<ul>` +
`<li><strong>Łążek Garncarski Pottery Village</strong> — one of Poland’s last surviving traditional folk pottery centers. Visitors can watch wheel throwing and try clay crafting with local potters.</li>` +
`<li><strong>Traditional tree beekeeping</strong> — restored beehives hollowed into living tree trunks, reviving ancient wild beekeeping traditions and forest honey gathering.</li>` +
`<li><strong>Historic glassworks</strong> — traces of historic woodland glass manufactures in Szklarnia that harnessed local quartz sand and abundant timber fuel for centuries.</li>` +
`<li><strong>Regional Museum in Janów Lubelski</strong> — exhibits detailing forest settlement, traditional handicrafts, and regional uprising and partisan resistance history.</li>` +
`</ul>` +
`<h2>When to go</h2>` +
`<ul>` +
`<li><strong>May and June</strong> — finest season for hiking and cycling. Peat bogs bloom with white cotton grass, pines smell fresh, and temperatures remain mild.</li>` +
`<li><strong>September and October</strong> — prime season for mushroom foraging. The forest abounds in porcini and saffron milk caps, while autumn mists delight photographers.</li>` +
`<li><strong>July and August</strong> — warm weeks suited for swimming at Lake Janowskie, picking wild berries, and paddling the Bukowa River.</li>` +
`<li><strong>Winter</strong> — a fairy-tale setting of snow-covered silence. An excellent time for tracking wolves, deer, and elk, and for cross-country ski touring.</li>` +
`</ul>` +
`<h2>Getting there</h2>` +
`<ul>` +
`<li><strong>By car:</strong> fast highway access via expressway S19 (Via Carpatia) from Lublin (~50 minutes) or Rzeszów (~55 minutes); from Warsaw via S17 and S19 (~2.5 hours).</li>` +
`<li><strong>By train:</strong> rail stations in Kraśnik or Stalowa Wola offer intercity connections, with connecting regional buses into Janów Lubelski.</li>` +
`<li><strong>By bike:</strong> the Green Velo Eastern Cycling Trail crosses the area, linking highlights across eastern Poland.</li>` +
`</ul>` +
`<p>Leave your car at a forest trailhead; bicycles and walking shoes are the most rewarding transport inside the woods.</p>` +
`<h2>How much time you need</h2>` +
`<p>A weekend (2 days) covers the horse refuge in Szklarnia, boardwalk trails at Imielty Ług, and the carved church in Momoty Górne.</p>` +
`<p><strong>Three to four days</strong> provide relaxed depth. Add canoeing on the Bukowa River, pottery workshops in Łążek, and biking to Porytowe Hill.</p>` +
`<p><strong>A full week</strong> lets you immerse yourself in wilderness quiet, explore remote reserves, forage mushrooms, and rest deeply.</p>` +
`<h2>What to eat and where to sleep</h2>` +
`<ul>` +
`<li><strong>Janów gryczak</strong> — a traditional baked loaf made from buckwheat groats, curd cheese, potatoes, and cream, recognized as a heritage food.</li>` +
`<li><strong>Buckwheat and mint pierogi</strong> — regional dumplings with a refreshing mint aroma, served with crisp bacon or sour cream.</li>` +
`<li><strong>Fresh pond fish</strong> — pan-fried carp, tench in cream, and pike from fish farms along the Bukowa valley.</li>` +
`<li><strong>Forest and buckwheat honey</strong> — fragrant honeys from apiaries set across forest clearings and buckwheat fields.</li>` +
`<li><strong>Wild berries and cranberries</strong> — forest fruit preserves, homemade cranberry sauce for roasted meats, and sweet blueberry buns.</li>` +
`</ul>` +
`<p>Accommodation: quiet farmsteads in Momoty, Szklarnia, and Łążek Garncarski, lakeside guest houses by Lake Janowskie, and forest rental cottages.</p>` +
`<h2>Practical tips</h2>` +
`<ul>` +
`<li><strong>Offline maps</strong> — mobile reception fades inside the wilderness. Download offline maps or carry a detailed forestry map.</li>` +
`<li><strong>Insect protection</strong> — bogs host mosquitoes; wear protective clothing and carry proven repellent.</li>` +
`<li><strong>Respect the wild horses</strong> — watch the horses from a sensible distance; never feed them bread or processed foods.</li>` +
`<li><strong>Bike selection</strong> — sandy woodland tracks call for wider tires (gravel, touring, or mountain bikes).</li>` +
`<li><strong>Water and food</strong> — deep forest trails have no shops; carry adequate drinking water and trail snacks.</li>` +
`<li><strong>Nature conservation</strong> — stay strictly on boardwalks and marked routes to safeguard delicate peat ecosystems.</li>` +
`</ul>`,
  tip: "Walk out onto the wooden boardwalk at the Imielty Ług reserve at dawn. The morning vapors hovering over the peat bog and the haunting calls of distant cranes create a scene you will remember forever.",
  gallery: ["polesie.webp"]
};

console.log('Bory EN:', words([bory.lead, bory.body, bory.tip].join(' ')));
console.log('Barycz EN:', words([barycz.lead, barycz.body, barycz.tip].join(' ')));
console.log('Janowskie EN:', words([janowskie.lead, janowskie.body, janowskie.tip].join(' ')));

fs.writeFileSync('articles/bory-tucholskie-en.json', JSON.stringify(bory, null, 2) + '\n', 'utf8');
fs.writeFileSync('articles/barycz-en.json', JSON.stringify(barycz, null, 2) + '\n', 'utf8');
fs.writeFileSync('articles/lasy-janowskie-en.json', JSON.stringify(janowskie, null, 2) + '\n', 'utf8');

const pnBory = {
  ...bory,
  gallery: ["drawa.webp", "notecka.webp", "polesie.webp"]
};
fs.writeFileSync('articles/pn-bory-tucholskie-en.json', JSON.stringify(pnBory, null, 2) + '\n', 'utf8');

console.log('Successfully saved EN articles!');
