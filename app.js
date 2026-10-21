const config = {
  pl: {
    texts: {
      saveTrip: "Zapisz inspirację",
      saved: "Zapisano",
      emptySaved: "Nie masz jeszcze zapisanych miejsc. Kliknij ♡ przy wybranym kierunku, który chcesz zachować.",
      exploreRoute: "Odkryj trasę →",
      loading: "Ładowanie treści...",
      tipLabel: "Wskazówka:",
      itinerary: "Plan wyprawy",
      saveLabel: "Zapisz inspirację",
      savedLabel: "✓ Zapisano",
      newsletterMsg: "Dziękujemy! Wkrótce wyślemy pierwszą inspirację."
    },
    packing: {
      gory: ['Buty trekkingowe', 'Kurtka przeciwdeszczowa', 'Mapa i kompas', 'Latarka czołówka', 'Apteczka', 'Termos z herbatą', 'Powerbank', 'Warstwy ubrań (na cebulkę)'],
      morze: ['Krem z filtrem UV', 'Ręcznik plażowy', 'Klapki', 'Okulary przeciwsłoneczne', 'Strój kąpielowy', 'Czytnik e-booków', 'Woda mineralna', 'Sandały'],
      miasto: ['Wygodne buty do chodzenia', 'Mały plecak', 'Powerbank', 'Ubrania "smart casual"', 'Parasol', 'Aparat fotograficzny', 'Karta miejska', 'Notatnik i długopis']
    },
    tripsFile: 'trips-pl.json'
  },
  en: {
    texts: {
      saveTrip: "Save inspiration",
      saved: "Saved",
      emptySaved: "You have no saved places yet. Click ♡ next to any destination you want to keep.",
      exploreRoute: "Explore route →",
      loading: "Loading content...",
      tipLabel: "Tip:",
      itinerary: "Trip Itinerary",
      saveLabel: "Save inspiration",
      savedLabel: "✓ Saved",
      newsletterMsg: "Thank you! We will send your first inspiration soon."
    },
    packing: {
      gory: ['Hiking boots', 'Rain jacket', 'Map & compass', 'Headlamp', 'First aid kit', 'Thermos with tea', 'Power bank', 'Layered clothing'],
      morze: ['Sunscreen', 'Beach towel', 'Flip-flops', 'Sunglasses', 'Swimwear', 'E-reader', 'Mineral water', 'Sandals'],
      miasto: ['Comfortable walking shoes', 'Small backpack', 'Power bank', 'Smart casual clothes', 'Umbrella', 'Camera', 'City card', 'Notebook & pen']
    },
    tripsFile: 'trips-en.json'
  }
};

const seasonalThemes = {
  spring: { orange: '#8ebf42', blue: '#a8d3d4', yellow: '#fef9c3' },
  summer: { orange: '#ee7652', blue: '#4fa9b5', yellow: '#f4c84c' },
  autumn: { orange: '#bc4f32', blue: '#638e95', yellow: '#e6a568' },
  winter: { orange: '#5d8aa8', blue: '#c2d6db', yellow: '#fdfdfd' }
};

const seasonalFeatured = {
  pl: {
    winter: { id: 'tatry', label: 'Kierunek Zimy', title: 'Tatry w białym puchu', lead: 'Kryształowe powietrze, szum sosen pod śniegiem i spokój, który odnajdziesz tylko w wysokich górach.', image: 'tatry.webp' },
    spring: { id: 'biebrza', label: 'Kierunek Wiosny', title: 'W rytmie budzącej się natury', lead: 'Kluczowe momenty wiosny: powrót ptaków, pierwsze kwiaty na torfowiskach i świeżość porannej mgły.', image: 'biebrza.webp' },
    summer: { id: 'baltyk', label: 'Kierunek Lata', title: 'Bałtyk w pełnym słońcu', lead: 'Złote plaże, szum fal i długie wieczory z widokiem na horyzont. Idealny czas na nadmorski reset.', image: 'baltyk.webp' },
    autumn: { id: 'bieszczady', label: 'Kierunek Jesieni', title: 'Złoto i czerwień połonin', lead: 'Najpiękniejszy czas w Bieszczadach: rudość traw, czyste niebo i cisza, która pozwala naprawdę odpocząć.', image: 'bieszczady.webp' }
  },
  en: {
    winter: { id: 'tatry', label: 'Winter Destination', title: 'Tatra Mountains in white', lead: 'Crystal air, the sound of pines under the snow, and a peace that can only be found in the high mountains.', image: 'tatry.webp' },
    spring: { id: 'biebrza', label: 'Spring Destination', title: 'In the rhythm of awakening nature', lead: 'Key moments of spring: the return of birds, first flowers on the peatlands, and the freshness of morning mist.', image: 'biebrza.webp' },
    summer: { id: 'baltyk', label: 'Summer Destination', title: 'Baltic in full sun', lead: 'Golden beaches, the sound of waves, and long evenings with a view of the horizon. Ideal time for a seaside reset.', image: 'baltyk.webp' },
    autumn: { id: 'bieszczady', label: 'Autumn Destination', title: 'Gold and red of the highlands', lead: 'The most beautiful time in Bieszczady: reddish grasses, clear skies, and a silence that allows true relaxation.', image: 'bieszczady.webp' }
  }
};

const currentLang = window.location.pathname.includes('-en') ? 'en' : 'pl';

let saved = JSON.parse(localStorage.getItem('pb-saved') || '[]');

const photos = {
  // === Kierunki istniejące — podstawowe ===
  baltyk: 'baltyk.webp', mazury: 'mazury1.webp', bieszczady: 'bieszczady.webp', tatry: 'tatry.webp', wroclaw: 'wroclaw.webp', biebrza: 'biebrza.webp', 'beskid-niski': 'beskid-niski.webp', gorce: 'gorce.webp', pieniny: 'pieniny.webp', karkonosze: 'karkonosze.webp', stolowe: 'stolowe.webp', babia: 'babia.webp', kaszuby: 'kaszuby1.webp', hel: 'hel1.webp', drawsko: 'drawsko.webp', suwalszczyzna: 'suwalszczyzna1.webp', 'szczecin-zalew': 'szczecin-zalew.webp', narew: 'narew.webp', roztocze: 'roztocze.webp', krakow: 'krakow.webp', gdansk: 'gdansk.webp', torun: 'torun.webp', lublin: 'lublin.webp', poznan: 'poznan.webp', lodz: 'lodz.webp', zamosc: 'zamosc.webp', bialowieza: 'bialowieza.webp', kampinos: 'kampinos1.webp', ojcow: 'ojcow.webp', drawa: 'drawa.webp', polesie: 'polesie.webp', barycz: 'barycz1.webp', notecka: 'notecka.webp', podhale: 'podhale.webp', sopot: 'sopot.webp', 'sopot-plaza': 'sopot.webp', kudowa: 'kudowa.webp', olsztyn: 'olsztyn.webp', sandomierz: 'sandomierz.webp', zakopane: 'zakopane.webp', 'morskie-oko': 'morskie-oko.webp', giewont: 'giewont.webp', 'kasprowy-wierch': 'kasprowy-wierch.webp', 'dolina-koscieliska': 'dolina-koscieliska.webp', sniezka: 'sniezka.webp', samotnia: 'samotnia.webp', 'polonina-wetlinska': 'polonina-wetlinska.webp', 'polonina-carynska': 'polonina-carynska.webp', 'jezioro-solinskie': 'solina.webp', solina: 'solina.webp', 'kolorowe-jeziorka': 'kolorowe-jeziorka.webp', 'slowinski-park': 'slowinski-park.webp', 'tatrzanski-park': 'tatrzanski-park.webp', szczeliniec: 'szczeliniec.webp', 'wigierski-park': 'wigierski-park.webp', 'swietokrzyskie': 'swietokrzyskie.webp', 'bory-tucholskie': 'bory-tucholskie.webp', 'lasy-janowskie': 'lasy-janowskie.webp', 'puszcza-notecka': 'notecka.webp', leba: 'leba.webp', ustka: 'ustka.webp', 'beskid-zywiecki': 'beskid-zywiecki.webp', augustowska: 'augustowska.webp', 'tatry-zachodnie': 'tatry-zachodnie.webp', 'splyw-dunajcem': 'splyw-dunajcem.webp', 'biebrza-rzeka': 'biebrza-rzeka.webp', 'biebrza-losie': 'biebrza-losie.webp', 'bialowieza-alt': 'bialowieza1.webp', 'gorce-alt': 'gorce2.webp', 'kaszuby-alt': 'kaszuby2.webp', 'kampinos-alt': 'kampinos.webp', mierzeja: 'mierzeja.webp', 'mierzeja1': 'mierzeja1.webp', 'karkonosze-swierki': 'karkonosze-swierki.webp', 'karkonosze-zima': 'karkonosze-zima.webp', 'karkonosze-zima-2': 'karkonosze-zima-2.webp', 'tatry1': 'tatry1.webp', 'tatry-zachodnie-1': 'tatry-zachodnie.webp', 'baltyk1': 'baltyk1.webp', 'mazury1': 'mazury1.webp', 'suwalszczyzna1': 'suwalszczyzna1.webp', 'kaszuby1': 'kaszuby1.webp', 'kaszuby2': 'kaszuby2.webp', 'kampinos1': 'kampinos1.webp', 'barycz1': 'barycz1.webp', 'beskid-niski1': 'beskid-niski.webp', 'bieszczady1': 'bieszczady1.webp', 'hel1': 'hel1.webp', 'gorce2': 'gorce2.webp', 'bialowieza1': 'bialowieza1.webp',

  // === Zamki ===
  malbork: 'malbork.webp',
  wawel: 'wawel.webp',
  ksiaz: 'ksiaz.webp',
  moszna: 'moszna.webp',
  niedzica: 'niedzica.webp',
  ogrodzieniec: 'ogrodzieniec.webp',
  lancut: 'lancut.webp',
  pszczyna: 'pszczyna.webp',

  // === UNESCO ===
  wieliczka: 'wieliczka.webp',
  bochnia: 'bochnia.webp',
  auschwitz: 'auschwitz.webp',
  'kalwaria-zebrzydowska': 'kalwaria-zebrzydowska.webp',
  'tarnowskie-gory': 'tarnowskie-gory.webp',
  krzemionki: 'krzemionki.webp',

  // === Miasteczka ===
  'kazimierz-dolny': 'kazimierz-dolny.webp',
  chelmno: 'chelmno.webp',
  klodzko: 'klodzko.webp',
  paczkow: 'paczkow.webp',
  cieszyn: 'cieszyn.webp',
  przemysl: 'przemysl.webp',
  sanok: 'sanok.webp',
  'krynica-zdroj': 'krynica-zdroj.webp',
  szczawnica: 'szczawnica.webp',
  suprasl: 'suprasl.webp',

  // === Szlaki ===
  'green-velo': 'green-velo.webp',
  'velo-dunajec': 'velo-dunajec.webp',
  'velo-baltica': 'velo-baltica.webp',
  'wielka-petla-wielkopolski': 'wielka-petla-wielkopolski.webp',
  'dolina-bugu': 'dolina-bugu.webp',
  'kanal-augustowski': 'kanal-augustowski.webp',

  // === Kuchnia ===
  'kuchnia-podlasie': 'kuchnia-podlasie.webp',
  'kuchnia-kaszuby': 'kuchnia-kaszuby.webp',
  'kuchnia-podhale': 'kuchnia-podhale.webp',
  'kuchnia-slask': 'kuchnia-slask.webp',
  'kuchnia-roztocze': 'kuchnia-roztocze.webp',
  'kuchnia-kurpie': 'kuchnia-kurpie.webp',
  'kuchnia-wielkopolska': 'kuchnia-wielkopolska.webp',
  'kuchnia-warmia': 'kuchnia-warmia.webp',
  'kuchnia-kociewie': 'kuchnia-kociewie.webp',
  'kuchnia-lemkowska': 'kuchnia-lemkowska.webp',

  // === Wsie ===
  'wsie-podlasie': 'wsie-podlasie.webp',
  'wsie-lemkowszczyzna': 'wsie-lemkowszczyzna.webp',
  'wsie-kurpie': 'wsie-kurpie.webp',
  'wsie-kociewie': 'wsie-kociewie.webp',
  'wsie-warmia': 'wsie-warmia.webp',
  'wsie-kaszuby': 'wsie-kaszuby.webp',
  'wsie-beskid-niski': 'wsie-beskid-niski.webp',
  'wsie-roztocze': 'wsie-roztocze.webp',
  'wsie-mazowsze': 'wsie-mazowsze.webp',
  'wsie-dolny-slask': 'wsie-dolny-slask.webp',

  // === Podróże tematyczne ===
  'szlak-kulinarny': 'szlak-kulinarny.webp',
  'szlak-rzemieslniczy': 'szlak-rzemieslniczy.webp',
  'szlak-architektury-drewnianej': 'szlak-architektury-drewnianej.webp',
  'szlak-industrialny': 'szlak-industrialny.webp',
  'szlak-cerkwi': 'szlak-cerkwi.webp',
  'szlak-winnic': 'szlak-winnic.webp',
  'szlak-bursztynowy': 'szlak-bursztynowy.webp',
  'szlak-piastowski': 'szlak-piastowski.webp',
  'szlak-uzdrowisk': 'szlak-uzdrowisk.webp',
  'szlak-fortyfikacji': 'szlak-fortyfikacji.webp',

  // === Parki narodowe ===
  'pn-babiogorski': 'pn-babiogorski.webp',
  'pn-bialowieski': 'pn-bialowieski.webp',
  'pn-biebrzanski': 'pn-biebrzanski.webp',
  'pn-bieszczadzki': 'pn-bieszczadzki.webp',
  'pn-bory-tucholskie': 'pn-bory-tucholskie.webp',
  'pn-drawienski': 'pn-drawienski.webp',
  'pn-gorczanski': 'pn-gorczanski.webp',
  'pn-gor-stolowych': 'pn-gor-stolowych.webp',
  'pn-kampinoski': 'pn-kampinoski.webp',
  'pn-karkonoski': 'pn-karkonoski.webp',
  'pn-magurski': 'pn-magurski.webp',
  'pn-narwianski': 'pn-narwianski.webp',
  'pn-ojcowski': 'pn-ojcowski.webp',
  'pn-pieninski': 'pn-pieninski.webp',
  'pn-poleski': 'pn-poleski.webp',
  'pn-roztoczanski': 'pn-roztoczanski.webp',
  'pn-slowinski': 'pn-slowinski.webp',
  'pn-swietokrzyski': 'pn-swietokrzyski.webp',
  'pn-tatrzanski': 'pn-tatrzanski.webp',
  'pn-ujscie-warty': 'pn-ujscie-warty.webp',
  'pn-wielkopolski': 'pn-wielkopolski.webp',
  'pn-wigierski': 'pn-wigierski.webp',
  'pn-wolinski': 'pn-wolinski.webp'
};

window.photos = photos;

// ─── Lazy load background images ───────────────────────────────────────────
const bgObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const src = el.dataset.bg;
    if (src) {
      el.style.backgroundImage = "url('" + src + "')";
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      delete el.dataset.bg;
    }
    bgObserver.unobserve(el);
  });
}, { rootMargin: '300px 0px' });

function observeTripArts(root) {
  const scope = root || document;
  scope.querySelectorAll('.trip-art[data-bg]').forEach(el => bgObserver.observe(el));
}

/** Zamienia inline background-image z prerenderu na data-bg + lazy */
function convertPrerenderedBgs() {
  document.querySelectorAll('.trip-art[style*="background-image"]').forEach(el => {
    const match = el.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
    if (match && match[1]) {
      el.dataset.bg = match[1];
      el.style.backgroundImage = '';
      el.style.backgroundSize = '';
      el.style.backgroundPosition = '';
    }
  });
  observeTripArts();
}

async function init() {
  try {
    const grid = document.querySelector('#trip-grid');
    const dialog = document.querySelector('#trip-dialog');
    const savedPanel = document.querySelector('#saved-panel');
    const savedButton = document.querySelector('#saved-button');
    const closeSaved = document.querySelector('#close-saved');
    const newsletter = document.querySelector('#newsletter');
    const newsletterMsg = document.querySelector('#newsletter-message');
    const menu = document.querySelector('.menu');
    const nav = document.querySelector('#nav');

    const response = await fetch(config[currentLang].tripsFile);
    const trips = await response.json();

    const render = (filter) => {
      if (!grid) return;
      const f = filter || 'all';
      grid.innerHTML = trips
        .filter(t => f === 'all' || t.category === f)
        .map(t => {
          const img = photos[t.id] || 'hero-polska.webp';
          const bgPath = 'images/' + img;
          return (
            '<article class="trip">' +
              '<div class="trip-art ' + t.art + '" data-id="' + t.id + '" data-bg="' + bgPath + '" role="img" aria-label="' + t.title + '">' +
                '<span>' + t.place + '</span>' +
                '<button class="save-trip" data-id="' + t.id + '" aria-label="' + t.title + '">' +
                  (saved.includes(t.id) ? '♥' : '♡') +
                '</button>' +
              '</div>' +
              '<p class="meta">' + t.region.toUpperCase() + ' <b>•</b> ' + t.days + '</p>' +
              '<h3>' + t.title + '</h3>' +
              '<p>' + t.text + '</p>' +
              '<button class="read open-trip" data-id="' + t.id + '">' +
                (t.exploreRoute || config[currentLang].texts.exploreRoute) +
              '</button>' +
            '</article>'
          );
        })
        .join('');
      observeTripArts(grid);
    };

    const updateSaved = () => {
      localStorage.setItem('pb-saved', JSON.stringify(saved));
      const countEl = document.querySelector('#saved-count');
      if (countEl) countEl.textContent = saved.length;
      const listEl = document.querySelector('#saved-list');
      if (listEl) {
        listEl.innerHTML = saved.length
          ? saved.map(id => {
              const trip = trips.find(x => x.id === id);
              return trip
                ? '<button class="saved-item open-trip" data-id="' + id + '"><span>' + trip.place + '</span>' + trip.title + ' <b>→</b></button>'
                : '';
            }).join('')
          : '<p class="empty">' + config[currentLang].texts.emptySaved + '</p>';
      }
    };

    document.querySelectorAll('.filters button').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('.filters button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        render(b.dataset.filter);
      };
    });

    document.querySelectorAll('[data-filter-link]').forEach(a => {
      a.onclick = () => {
        const btn = document.querySelector('.filters [data-filter="' + a.dataset.filterLink + '"]');
        if (btn) btn.click();
      };
    });

    document.addEventListener('click', async e => {
      const trigger = e.target.closest('.open-trip');
      if (trigger && dialog) {
        const trip = trips.find(x => x.id === trigger.dataset.id);
        if (!trip) return;
        const content = document.querySelector('#trip-content');
        content.innerHTML = '<p class="loading">' + config[currentLang].texts.loading + '</p>';
        dialog.showModal();
        try {
          const suffix = currentLang === 'en' ? '-en' : '';
          const res = await fetch('articles/' + trip.id + suffix + '.json');
          if (!res.ok) throw new Error();
          const art = await res.json();
          const img = photos[trip.id] || 'hero-polska.webp';
          content.innerHTML =
            '<div class="dialog-header">' +
              '<div class="dialog-img" style="background-image:url(\'images/' + img + '\');background-size:cover;background-position:center"></div>' +
              '<div class="dialog-title-group">' +
                '<p class="label">' + trip.place.toUpperCase() + ' • ' + trip.days + '</p>' +
                '<h2>' + art.title + '</h2>' +
              '</div>' +
            '</div>' +
            '<p class="dialog-lead">' + art.lead + '</p>' +
            '<div class="article-body">' + art.body + '</div>' +
            '<div class="article-tip"><strong>💡 ' + config[currentLang].texts.tipLabel + '</strong> ' + art.tip + '</div>' +
            '<h3 style="margin-top:24px">' + config[currentLang].texts.itinerary + '</h3>' +
            '<ol>' + trip.plan.map(x => '<li>' + x + '</li>').join('') + '</ol>' +
            '<button class="dialog-save save-trip" data-id="' + trip.id + '">' +
              (saved.includes(trip.id) ? '✓ ' + config[currentLang].texts.saved : '♡ ' + config[currentLang].texts.saveTrip) +
            '</button>';
        } catch (err) {
          const img = photos[trip.id] || 'hero-polska.webp';
          content.innerHTML =
            '<div class="dialog-header">' +
              '<div class="dialog-img" style="background-image:url(\'images/' + img + '\');background-size:cover;background-position:center"></div>' +
              '<div class="dialog-title-group">' +
                '<p class="label">' + trip.place.toUpperCase() + ' • ' + trip.days + '</p>' +
                '<h2>' + trip.title + '</h2>' +
              '</div>' +
            '</div>' +
            '<p class="dialog-lead">' + trip.text + '</p>' +
            '<h3>' + config[currentLang].texts.itinerary + '</h3>' +
            '<ol>' + trip.plan.map(x => '<li>' + x + '</li>').join('') + '</ol>' +
            '<button class="dialog-save save-trip" data-id="' + trip.id + '">' +
              (saved.includes(trip.id) ? '✓ ' + config[currentLang].texts.saved : '♡ ' + config[currentLang].texts.saveTrip) +
            '</button>';
        }
      }

      if (e.target.closest('.save-trip')) {
        const id = e.target.closest('.save-trip').dataset.id;
        saved = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
        updateSaved();
        const activeFilter = document.querySelector('.filters .active')?.dataset.filter || 'all';
        if (grid) render(activeFilter);
        const dialogSaveBtn = document.querySelector('.dialog-save');
        if (dialogSaveBtn && dialogSaveBtn.dataset.id === id) {
          dialogSaveBtn.textContent = saved.includes(id)
            ? '✓ ' + config[currentLang].texts.saved
            : '♡ ' + config[currentLang].texts.saveTrip;
        }
      }
    });

    const closeBtn = dialog?.querySelector('.close');
    if (closeBtn) closeBtn.onclick = () => dialog.close();
    if (dialog) dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

    if (savedButton && savedPanel) savedButton.onclick = () => savedPanel.classList.add('open');
    if (closeSaved && savedPanel) closeSaved.onclick = () => savedPanel.classList.remove('open');

    document.addEventListener('click', e => {
      if (e.target.closest('.saved-item') && savedPanel) savedPanel.classList.remove('open');
    });

    if (newsletter) newsletter.onsubmit = e => {
      e.preventDefault();
      newsletter.reset();
      if (newsletterMsg) newsletterMsg.textContent = config[currentLang].texts.newsletterMsg;
    };

    if (menu && nav) {
      menu.onclick = () => {
        const open = menu.getAttribute('aria-expanded') === 'true';
        menu.setAttribute('aria-expanded', String(!open));
        nav.classList.toggle('nav-open', !open);
      };
      nav.querySelectorAll('a').forEach(link => {
        link.onclick = () => {
          menu.setAttribute('aria-expanded', 'false');
          nav.classList.remove('nav-open');
        };
      });
    }

    const updateFeaturedTrip = () => {
      const month = new Date().getMonth();
      let season;
      if (month >= 11 || month <= 1) season = seasonalFeatured[currentLang].winter;
      else if (month >= 2 && month <= 4) season = seasonalFeatured[currentLang].spring;
      else if (month >= 5 && month <= 7) season = seasonalFeatured[currentLang].summer;
      else season = seasonalFeatured[currentLang].autumn;

      const featureSec = document.querySelector('.feature');
      if (!featureSec) return;
      const labelEl = featureSec.querySelector('.label');
      const titleEl = featureSec.querySelector('h2');
      const leadEl = featureSec.querySelector('p:not(.label)');
      const btnEl = featureSec.querySelector('.open-trip');
      const imgDiv = featureSec.querySelector('.feature-image');
      if (labelEl) labelEl.textContent = season.label;
      if (titleEl) titleEl.innerHTML = season.title;
      if (leadEl) leadEl.textContent = season.lead;
      if (btnEl) btnEl.dataset.id = season.id;
      if (imgDiv) {
        imgDiv.style.backgroundImage = "url('images/" + season.image + "')";
        imgDiv.style.backgroundSize = 'cover';
        imgDiv.style.backgroundPosition = 'center';
      }
    };

    const applySeasonalTheme = () => {
      const month = new Date().getMonth();
      let theme;
      if (month >= 11 || month <= 1) theme = seasonalThemes.winter;
      else if (month >= 2 && month <= 4) theme = seasonalThemes.spring;
      else if (month >= 5 && month <= 7) theme = seasonalThemes.summer;
      else theme = seasonalThemes.autumn;
      const root = document.documentElement;
      Object.entries(theme).forEach(([prop, value]) => root.style.setProperty('--' + prop, value));
    };

    const initPackingList = () => {
      try {
        const lists = config[currentLang].packing;
        const controls = document.querySelectorAll('.packing-controls button');
        const itemsUl = document.getElementById('packing-items');
        const packedCountEl = document.getElementById('packed-count');
        const totalCountEl = document.getElementById('total-count');
        if (!itemsUl) return;
        let currentType = 'gory';
        const storageKey = (type) => 'pb-pack-' + type;

        const loadChecked = (type) => {
          try { return JSON.parse(localStorage.getItem(storageKey(type)) || '[]'); }
          catch (e) { return []; }
        };
        const saveChecked = (type) => {
          const ids = Array.from(itemsUl.querySelectorAll('input:checked')).map(i => i.dataset.item);
          localStorage.setItem(storageKey(type), JSON.stringify(ids));
        };

        const renderList = (type) => {
          const items = lists[type];
          if (!items) return;
          if (totalCountEl) totalCountEl.textContent = items.length;
          const checked = loadChecked(type);
          itemsUl.innerHTML = items.map((item, i) => {
            const id = 'pack-' + type + '-' + i;
            const isOn = checked.indexOf(item) !== -1;
            return '<li class="packing-item"><label for="' + id + '">' +
              '<input type="checkbox" id="' + id + '" data-item="' + item.replace(/"/g, '&quot;') + '"' +
              (isOn ? ' checked' : '') + '><span>' + item + '</span></label></li>';
          }).join('');
          updateProgress();
        };
        const updateProgress = () => {
          const checked = itemsUl.querySelectorAll('input:checked').length;
          if (packedCountEl) packedCountEl.textContent = checked;
        };
        controls.forEach(btn => {
          btn.onclick = () => {
            controls.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.dataset.type;
            renderList(currentType);
          };
        });
        itemsUl.addEventListener('change', (e) => {
          if (e.target.type === 'checkbox') {
            updateProgress();
            saveChecked(currentType);
          }
        });
        renderList(currentType);
      } catch (err) {
        console.error('Packing list error:', err);
      }
    };

    const updateHeartStates = () => {
      document.querySelectorAll('.save-trip').forEach(btn => {
        const id = btn.dataset.id;
        btn.textContent = saved.includes(id) ? '♥' : '♡';
      });
    };

    // NIE renderuj ponownie — karty są już w HTML (prerender)
    // if (grid) render();
    updateSaved();
    updateHeartStates();
    updateFeaturedTrip();
    applySeasonalTheme();
    initPackingList();
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));

    // Lazy-load obrazków z prerenderowanego HTML
    convertPrerenderedBgs();

  } catch (e) {
    console.error('Initialization error:', e);
  }
}

init();
