/**
 * search.js — wyszukiwarka kierunków + bloga (client-side, bez zależności)
 *
 * Czyta: destinations-manifest.json, trips-*.json, blog-posts.json.
 * Self-injectuje się do <header class="header">.
 *
 * Konwencja URL bloga (potwierdzona):
 *   PL: blog/<slug>.html          np. blog/weekend-w-zakopanem.html
 *   EN: blog/<slug>-en.html       np. blog/weekend-w-zakopanem-en.html
 */
(function () {
  'use strict';

  const inSubdir = location.pathname.includes('/kierunki/') || location.pathname.includes('/blog/');
  const root = inSubdir ? '../' : '';
  const lang = (document.documentElement.lang || 'pl').slice(0, 2) === 'en' ? 'en' : 'pl';

  const T = {
    pl: {
      placeholder: 'Szukaj kierunku lub wpisu…',
      hint: 'Ctrl+K',
      empty: 'Nic nie znaleziono. Spróbuj innej frazy.',
      aria: 'Wyniki wyszukiwania',
      open: 'Otwórz wyszukiwarkę',
      close: 'Zamknij',
      badgeDest: 'Kierunek',
      badgeBlog: 'Blog',
      groupDest: 'Kierunki',
      groupBlog: 'Blog',
    },
    en: {
      placeholder: 'Search destinations or posts…',
      hint: 'Ctrl+K',
      empty: 'No results. Try another phrase.',
      aria: 'Search results',
      open: 'Open search',
      close: 'Close',
      badgeDest: 'Destination',
      badgeBlog: 'Blog',
      groupDest: 'Destinations',
      groupBlog: 'Blog',
    },
  }[lang];

  const CATEGORIES = {
    manifest:  { pl: 'Manifest',     en: 'Manifest' },
    plany:     { pl: 'Plany',        en: 'Itineraries' },
    poradniki: { pl: 'Poradniki',    en: 'Guides' },
    kuchnia:   { pl: 'Kuchnia',      en: 'Cuisine' },
    inspiracje:{ pl: 'Inspiracje',   en: 'Inspiration' },
  };

  let INDEX = null;
  let loading = null;

  async function loadIndex() {
    if (INDEX) return INDEX;
    if (loading) return loading;

    loading = (async () => {
      const fetches = [
        fetch(root + 'destinations-manifest.json').then((r) => r.ok ? r.json() : { items: {} }).catch(() => ({ items: {} })),
        fetch(root + 'trips-' + lang + '.json').then((r) => r.ok ? r.json() : []).catch(() => []),
        fetch(root + 'blog-posts.json').then((r) => r.ok ? r.json() : []).catch(() => []),
      ];
      const [manifest, trips, posts] = await Promise.all(fetches);
      const tripById = new Map((trips || []).map((t) => [t.id, t]));

      const items = [];

      for (const [id, langs] of Object.entries(manifest.items || {})) {
        const entry = langs[lang];
        if (!entry) continue;
        const trip = tripById.get(id) || {};
        items.push({
          type: 'dest',
          id,
          lang,
          path: entry.path,
          title: entry.title || trip.title || id,
          place: trip.place || '',
          region: trip.region || '',
          text: trip.text || '',
          image: entry.image ? root + 'images/' + entry.image : '',
          words: entry.words || 0,
        });
      }

      for (const post of posts || []) {
        const loc = post[lang] || post.pl;
        if (!loc) continue;
        const cat = CATEGORIES[post.category] ? CATEGORIES[post.category][lang] : post.category;
        const path = 'blog/' + post.slug + (lang === 'en' ? '-en' : '') + '.html';
        items.push({
          type: 'blog',
          id: post.slug,
          lang,
          path,
          title: loc.title || post.slug,
          place: cat || '',
          region: '',
          text: stripHtml((loc.lead || '') + ' ' + (loc.body || '')),
          image: post.image ? root + 'images/' + post.image : '',
          date: post.date || '',
        });
      }

      INDEX = items;
      return items;
    })();

    return loading;
  }

  function stripHtml(s) {
    return String(s || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z#0-9]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function norm(s) {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l');
  }

  function score(item, terms) {
    const hay = {
      title: norm(item.title),
      place: norm(item.place),
      region: norm(item.region),
      text: norm(item.text).slice(0, 600),
    };
    let total = 0;
    if (item.type === 'dest') total += 3;
    for (const t of terms) {
      if (hay.title.startsWith(t)) total += 40;
      else if (hay.title.includes(t)) total += 25;
      if (hay.place.startsWith(t)) total += 30;
      else if (hay.place.includes(t)) total += 15;
      if (hay.region.includes(t)) total += 8;
      if (hay.text.includes(t)) total += 3;
    }
    return total;
  }

  function search(query) {
    if (!INDEX) return [];
    const terms = norm(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return INDEX
      .map((item) => ({ item, s: score(item, terms) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 10)
      .map((x) => x.item);
  }

  function buildUI() {
    const header = document.querySelector('header.header');
    if (!header) return null;

    const wrap = document.createElement('div');
    wrap.className = 'search-wrap';
    wrap.innerHTML =
      '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
      '<input class="search-input" type="search" autocomplete="off" spellcheck="false" aria-label="' + T.placeholder + '" placeholder="' + T.placeholder + '">' +
      '<span class="search-hint">' + T.hint + '</span>' +
      '<button class="search-close" aria-label="' + T.close + '">×</button>' +
      '<div class="search-results" role="listbox" aria-label="' + T.aria + '"></div>';

    const toggle = document.createElement('button');
    toggle.className = 'search-toggle';
    toggle.setAttribute('aria-label', T.open);
    toggle.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

    const nav = header.querySelector('nav');
    if (nav) {
      header.insertBefore(toggle, nav);
      header.insertBefore(wrap, nav);
    } else {
      header.appendChild(toggle);
      header.appendChild(wrap);
    }

    return { wrap, input: wrap.querySelector('.search-input'), results: wrap.querySelector('.search-results'), toggle };
  }

  function renderResults(container, items, query) {
    if (!items.length) {
      container.innerHTML = '<div class="search-empty">' + T.empty + '</div>';
      container.classList.add('open');
      return;
    }
    const dest = items.filter((x) => x.type === 'dest');
    const blog = items.filter((x) => x.type === 'blog');
    const groups = [];
    if (dest.length) groups.push({ label: T.groupDest, items: dest });
    if (blog.length) groups.push({ label: T.groupBlog, items: blog });

    let idx = 0;
    container.innerHTML = groups
      .map((g) => {
        const rows = g.items.map((item) => {
          const href = inSubdir ? item.path.split('/').pop() : item.path;
          const img = item.image
            ? '<img src="' + item.image + '" alt="" loading="lazy">'
            : '<div style="width:44px;height:44px;border-radius:8px;background:#eee;flex-shrink:0"></div>';
          const meta = [item.region, item.place].filter(Boolean).join(' • ').toUpperCase();
          const badge = '<span class="sr-badge sr-badge-' + item.type + '">' + (item.type === 'dest' ? T.badgeDest : T.badgeBlog) + '</span>';
          const cls = 'search-result' + (idx === 0 ? ' active' : '');
          idx++;
          return (
            '<a class="' + cls + '" href="' + href + '" role="option">' +
            img +
            '<div class="sr-body">' +
            '<div class="sr-title">' + escapeHtml(item.title) + badge + '</div>' +
            '<div class="sr-meta">' + escapeHtml(meta) + '</div>' +
            '</div></a>'
          );
        }).join('');
        return '<div class="sr-group-label">' + escapeHtml(g.label) + '</div>' + rows;
      })
      .join('');
    container.classList.add('open');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function closeResults(ui) {
    ui.results.classList.remove('open');
    ui.results.innerHTML = '';
  }

  function init() {
    const ui = buildUI();
    if (!ui) return;

    let activeIndex = 0;
    let currentItems = [];

    const input = ui.input;
    const results = ui.results;

    function updateActive() {
      const nodes = results.querySelectorAll('.search-result');
      nodes.forEach((n, i) => n.classList.toggle('active', i === activeIndex));
      const active = nodes[activeIndex];
      if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
    }

    let debounce;
    input.addEventListener('input', async () => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        const q = input.value.trim();
        if (!q) { closeResults(ui); return; }
        await loadIndex();
        currentItems = search(q);
        activeIndex = 0;
        renderResults(results, currentItems, q);
      }, 120);
    });

    input.addEventListener('focus', () => {
      loadIndex();
      if (input.value.trim()) renderResults(results, currentItems, input.value.trim());
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentItems.length) { activeIndex = (activeIndex + 1) % currentItems.length; updateActive(); }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentItems.length) { activeIndex = (activeIndex - 1 + currentItems.length) % currentItems.length; updateActive(); }
      } else if (e.key === 'Enter') {
        const node = results.querySelectorAll('.search-result')[activeIndex];
        if (node) { e.preventDefault(); node.click(); }
      } else if (e.key === 'Escape') {
        input.value = '';
        closeResults(ui);
        input.blur();
      }
    });

    document.addEventListener('click', (e) => {
      if (!ui.wrap.contains(e.target) && e.target !== ui.toggle) closeResults(ui);
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        ui.wrap.classList.add('open');
        input.focus();
        input.select();
      }
    });

    ui.toggle.addEventListener('click', () => {
      ui.wrap.classList.add('open');
      setTimeout(() => input.focus(), 50);
    });

    ui.wrap.querySelector('.search-close').addEventListener('click', () => {
      ui.wrap.classList.remove('open');
      closeResults(ui);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();