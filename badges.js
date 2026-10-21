/**
 * badges.js — wstrzykuje badge „Najlepszy czas” + czas dojazdu na karty .trip
 * Dane z trips-pl.json / trips-en.json (pola bestSeason, drive).
 */
(function () {
  'use strict';

  var lang = ((document.documentElement.lang || 'pl').toLowerCase().indexOf('en') === 0) ? 'en' : 'pl';
  var LABEL_SEASON = lang === 'en' ? 'Best:' : 'Najlepiej:';
  var LABEL_FROM = lang === 'en' ? 'From' : 'Z';
  var CITY = lang === 'en'
    ? { waw: 'Warsaw', krk: 'Kraków', gdn: 'Gdańsk' }
    : { waw: 'Warszawy', krk: 'Krakowa', gdn: 'Gdańska' };

  var tripsById = null;

  function pickNearestDrive(drive) {
    if (!drive) return null;
    // Prefer shortest-looking time for the badge (show one primary city)
    var order = ['waw', 'krk', 'gdn'];
    var best = null;
    var bestHours = 99;
    order.forEach(function (key) {
      if (!drive[key]) return;
      var m = String(drive[key]).match(/([\d.]+)/);
      var h = m ? parseFloat(m[1]) : 99;
      if (h < bestHours) {
        bestHours = h;
        best = { key: key, value: drive[key] };
      }
    });
    return best;
  }

  function buildBadgesHtml(trip) {
    if (!trip) return '';
    var parts = [];
    if (trip.bestSeason) {
      parts.push(
        '<span class="trip-badge trip-badge--season" title="' + LABEL_SEASON + ' ' + trip.bestSeason + '">' +
        '<span class="badge-ico" aria-hidden="true">📅</span> ' + LABEL_SEASON + ' ' + trip.bestSeason +
        '</span>'
      );
    }
    var nearest = pickNearestDrive(trip.drive);
    if (nearest) {
      // Show primary (nearest major city) + title with all three
      var titleParts = [];
      ['waw', 'krk', 'gdn'].forEach(function (k) {
        if (trip.drive[k]) titleParts.push(CITY[k] + ': ' + trip.drive[k]);
      });
      parts.push(
        '<span class="trip-badge trip-badge--drive" title="' + titleParts.join(' · ') + '">' +
        '<span class="badge-ico" aria-hidden="true">🚗</span> ' + LABEL_FROM + ' ' + CITY[nearest.key] + ' ' + nearest.value +
        '</span>'
      );
    }
    if (!parts.length) return '';
    return '<div class="trip-badges">' + parts.join('') + '</div>';
  }

  function enhanceCard(article, trip) {
    if (!article || !trip) return;
    if (article.querySelector('.trip-badges')) return;
    var meta = article.querySelector('.meta');
    var html = buildBadgesHtml(trip);
    if (!html) return;
    if (meta) {
      meta.insertAdjacentHTML('afterend', html);
    } else {
      var h3 = article.querySelector('h3');
      if (h3) h3.insertAdjacentHTML('beforebegin', html);
    }
  }

  function enhanceAll() {
    if (!tripsById) return;
    document.querySelectorAll('article.trip').forEach(function (article) {
      var id =
        (article.querySelector('[data-id]') && article.querySelector('[data-id]').dataset.id) ||
        (article.querySelector('.open-trip') && article.querySelector('.open-trip').dataset.id) ||
        (article.querySelector('.save-trip') && article.querySelector('.save-trip').dataset.id);
      if (!id) return;
      enhanceCard(article, tripsById[id]);
    });
  }

  // Expose for generator.js
  window.PBBadges = {
    buildHtml: buildBadgesHtml,
    enhanceAll: enhanceAll,
    enhanceCard: enhanceCard
  };

  async function init() {
    try {
      var file = lang === 'en' ? 'trips-en.json' : 'trips-pl.json';
      var res = await fetch(file);
      var trips = await res.json();
      tripsById = {};
      (trips || []).forEach(function (t) {
        if (t && t.id) tripsById[t.id] = t;
      });
      enhanceAll();

      // Re-run when generator / hub inject new cards
      if (window.MutationObserver) {
        var obs = new MutationObserver(function () { enhanceAll(); });
        ['weekend-generator', 'hub-grid', 'kierunki'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) obs.observe(el, { childList: true, subtree: true });
        });
      }
    } catch (e) {
      console.warn('badges.js:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
