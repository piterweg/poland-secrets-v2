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
const t = config[currentLang].texts;

let saved = JSON.parse(localStorage.getItem('pb-saved') || '[]');
const grid = document.querySelector('#trip-grid');

const photos = {
  baltyk: 'baltyk.webp', mazury: 'mazury1.webp', bieszczady: 'bieszczady.webp', tatry: 'tatry.webp', wroclaw: 'wroclaw.webp', biebrza: 'biebrza.webp', 'beskid-niski': 'beskid-niski.webp', gorce: 'gorce.webp', pieniny: 'pieniny.webp', karkonosze: 'karkonosze.webp', stolowe: 'stolowe.webp', babia: 'babia.webp', kaszuby: 'kaszuby1.webp', hel: 'hel1.webp', drawsko: 'drawsko.webp', suwalszczyzna: 'suwalszczyzna1.webp', 'szczecin-zalew': 'szczecin-zalew.webp', narew: 'narew.webp', roztocze: 'roztocze.webp', krakow: 'krakow.webp', gdansk: 'gdansk.webp', torun: 'torun.webp', lublin: 'lublin.webp', poznan: 'poznan.webp', lodz: 'lodz.webp', zamosc: 'zamosc.webp', bialowieza: 'bialowieza.webp', kampinos: 'kampinos1.webp', ojcow: 'ojcow.webp', drawa: 'drawa.webp', polesie: 'polesie.webp', barycz: 'barycz1.webp', notecka: 'notecka.webp', podhale: 'tatry-zachodnie.webp', sopot: 'baltyk1.webp', kudowa: 'karkonosze-swierki.webp', olsztyn: 'wroclaw.webp', sandomierz: 'lublin.webp', zakopane: 'tatry1.webp', 'morskie-oko': 'tatry-zachodnie.webp', giewont: 'karkonosze-zima.webp', 'kasprowy-wierch': 'karkonosze-zima-2.webp', 'dolina-koscieliska': 'pieniny.webp', sniezka: 'sniezka.webp', samotnia: 'karkonosze-swierki.webp', 'polonina-wetlinska': 'bieszczady.webp', 'polonina-carynska': 'bieszczady1.webp', 'jezioro-solińskie': 'solina.webp', 'kolorowe-jeziorka': 'mazury.webp', 'slowinski-park': 'mierzeja.webp', 'tatrzanski-park': 'tatry-zachodnie.webp', szczeliniec: 'stolowe.webp', 'bledne-skaly': 'ojcow.webp', 'wigierski-park': 'suwalszczyzna1.webp', 'swietokrzyskie': 'polesie.webp', 'bory-tucholskie': 'drawa.webp', 'lasy-janowskie': 'polesie.webp', 'puszcza-notecka': 'notecka.webp', leba: 'mierzeja1.webp', ustka: 'baltyk1.webp', 'beskid-zywiecki': 'barycz.webp', augustowska: 'suwalszczyzna.webp', solina: 'solina.webp', 'tatry-zachodnie': 'tatry-zachodnie.webp', 'splyw-dunajcem': 'splyw-dunajcem.webp', 'biebrza-rzeka': 'biebrza-rzeka.webp', 'biebrza-losie': 'biebrza-losie.webp', 'bialowieza-alt': 'bialowieza1.webp', 'gorce-alt': 'gorce2.webp', 'kaszuby-alt': 'kaszuby2.webp', 'kampinos-alt': 'kampinos.webp'
};

window.photos = photos;

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
}, { rootMargin: '250px 0px' });

function observeTripArts(root) {
  (root || document).querySelectorAll('.trip-art[data-bg]').forEach(el => bgObserver.observe(el));
}
window.observeTripArts = observeTripArts;

async function init() {
  try {
    const response = await fetch(config[currentLang].tripsFile);
    const trips = await response.json();

    const render = (filter = 'all') => {
      grid.innerHTML = trips.filter(t => filter === 'all' || t.category === filter).map(t => {
        const img = photos[t.id] || 'hero-polska.webp';
        return `
        <article class="trip reveal">
          <div class="trip-art ${t.art}" data-id="${t.id}" data-bg="images/${img}" role="img" aria-label="${t.title}">
            <span>${t.place}</span>
            <button class="save-trip" data-id="${t.id}" aria-label="${t.title}">
              ${saved.includes(t.id) ? '♥' : '♡'}
            </button>
          </div>
          <a class="trip-link" href="kierunki/${t.id}${currentLang === 'pl' ? '' : '-en'}.html">
          <p class="meta">${t.region.toUpperCase()} <b>•</b> ${t.days}</p>
          <h3>${t.title}</h3>
          <p>${t.text}</p>
          <span class="read">${t.exploreRoute || config[currentLang].texts.exploreRoute}</span>
          </a>
        </article>
        `;
      }).join('');
      observeTripArts(grid);
      initReveal();
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
              return trip ? `<a class="saved-item" href="kierunki/${id}${currentLang === 'pl' ? '' : '-en'}.html"><span>${trip.place}</span>${trip.title} <b>→</b></a>` : '';
            }).join('')
          : `<p class="empty">${config[currentLang].texts.emptySaved}</p>`;
      }
    };

    document.querySelectorAll('.filters button').forEach(b => b.onclick = () => {
      document.querySelectorAll('.filters button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      render(b.dataset.filter);
    });

    document.querySelectorAll('[data-filter-link]').forEach(a => a.onclick = () => {
      const btn = document.querySelector(`.filters [data-filter="${a.dataset.filterLink}"]`);
      if (btn) btn.click();
    });

    const dialog = document.querySelector('#trip-dialog');
    document.addEventListener('click', async e => {
      const trigger = e.target.closest('.open-trip');
      if (trigger) {
        const trip = trips.find(x => x.id === trigger.dataset.id);
        if (!trip) return;
        document.querySelector('#trip-content').innerHTML = `<p class="loading">${config[currentLang].texts.loading}</p>`;
        dialog.showModal();
        try {
          const suffix = currentLang === 'en' ? '-en' : '';
          const res = await fetch(`articles/${trip.id}${suffix}.json`);
          if (!res.ok) throw new Error();
          const art = await res.json();
          const img = photos[trip.id] || 'hero-polska.webp';
          document.querySelector('#trip-content').innerHTML = `
            <div class="dialog-header">
              <div class="dialog-img" style="background-image:url('images/${img}');background-size:cover;background-position:center"></div>
              <div class="dialog-title-group">
              <p class="label">${trip.place.toUpperCase()} • ${trip.days}</p>
              <h2>${art.title}</h2>
              </div>
            </div>
            <p class="dialog-lead">${art.lead}</p>
            <div class="article-body">${art.body}</div>
            <div class="article-tip"><strong>💡 ${config[currentLang].texts.tipLabel}</strong> ${art.tip}</div>
            <h3 style="margin-top:24px">${config[currentLang].texts.itinerary}</h3>
            <ol>${trip.plan.map(x => `<li>${x}</li>`).join('')}</ol>
            <button class="dialog-save save-trip" data-id="${trip.id}">${saved.includes(trip.id) ? '✓ ' + config[currentLang].texts.saved : '♡ ' + config[currentLang].texts.saveTrip}</button>
          `;
        } catch (err) {
          const img = photos[trip.id] || 'hero-polska.webp';
          document.querySelector('#trip-content').innerHTML = `
            <div class="dialog-header">
              <div class="dialog-img" style="background-image:url('images/${img}');background-size:cover;background-position:center"></div>
              <div class="dialog-title-group">
              <p class="label">${trip.place.toUpperCase()} • ${trip.days}</p>
              <h2>${trip.title}</h2>
              </div>
            </div>
            <p class="dialog-lead">${trip.text}</p>
            <h3>${config[currentLang].texts.itinerary}</h3>
            <ol>${trip.plan.map(x => `<li>${x}</li>`).join('')}</ol>
            <button class="dialog-save save-trip" data-id="${trip.id}">${saved.includes(trip.id) ? '✓ ' + config[currentLang].texts.saved : '♡ ' + config[currentLang].texts.saveTrip}</button>
          `;
        }
      }

      if (e.target.closest('.save-trip')) {
        const id = e.target.closest('.save-trip').dataset.id;
        saved = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
        updateSaved();
        const activeFilter = document.querySelector('.filters .active')?.dataset.filter || 'all';
        render(activeFilter);
        const dialogSaveBtn = document.querySelector('.dialog-save');
        if (dialogSaveBtn && dialogSaveBtn.dataset.id === id) {
          dialogSaveBtn.textContent = saved.includes(id) ? '✓ ' + config[currentLang].texts.saved : '♡ ' + config[currentLang].texts.saveTrip;
        }
      }
    });

    document.querySelector('.close').onclick = () => dialog.close();
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

    document.querySelector('#saved-button').onclick = () => document.querySelector('#saved-panel').classList.add('open');
    document.querySelector('#close-saved').onclick = () => document.querySelector('#saved-panel').classList.remove('open');

    document.addEventListener('click', e => {
      if (e.target.closest('.saved-item')) {
        document.querySelector('#saved-panel').classList.remove('open');
      }
    });

    document.querySelector('#newsletter').onsubmit = e => {
      e.preventDefault();
      document.querySelector('#newsletter').reset();
      document.querySelector('#newsletter-message').textContent = config[currentLang].texts.newsletterMsg;
    };

    const menu = document.querySelector('.menu'), nav = document.querySelector('#nav');
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
      const btnEl = featureSec.querySelector('.feature-cta');
      const imgDiv = featureSec.querySelector('.feature-image');
      if (labelEl) labelEl.textContent = season.label;
      if (titleEl) titleEl.innerHTML = season.title;
      if (leadEl) leadEl.textContent = season.lead;
      if (btnEl) btnEl.setAttribute('href', `kierunki/${season.id}${currentLang === 'pl' ? '' : '-en'}.html`);
      if (imgDiv) {
        imgDiv.style.backgroundImage = `url('images/${season.image}')`;
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
      Object.entries(theme).forEach(([prop, value]) => {
        root.style.setProperty(`--${prop}`, value);
      });
    };

    const initReveal = () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, { threshold: 0.1 });
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    };

    const initPackingList = () => {
      const lists = {
        gory: ['Hiking boots', 'Rain jacket', 'Map & compass', 'Headlamp', 'First aid kit', 'Thermos with tea', 'Power bank', 'Layered clothing'],
        morze: ['Sunscreen', 'Beach towel', 'Flip-flops', 'Sunglasses', 'Swimwear', 'E-reader', 'Mineral water', 'Sandals'],
        miasto: ['Comfortable walking shoes', 'Small backpack', 'Power bank', 'Smart casual clothes', 'Umbrella', 'Camera', 'City card', 'Notebook & pen']
      };
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
    };

    render();
    updateSaved();
    updateFeaturedTrip();
    applySeasonalTheme();
    initReveal();
    document.querySelectorAll('section, .feature, .stats, .idea-list article').forEach(el => {
      el.classList.add('reveal');
    });
    initReveal();
    initPackingList();

  } catch (e) {
    console.error("Initialization error:", e);
  }
}

init();
