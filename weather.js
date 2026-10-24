/**
 * Pogoda na trasie — Open-Meteo (bez klucza API, dane po stronie przeglądarki).
 *
 * Tryby:
 *  - widget:  <section data-weather data-lat=".." data-lon=".." data-days="4" data-lang="pl">
 *  - ranking: <div data-weather-ranking data-lang="pl" data-limit="12">  (strona /pogoda.html)
 *
 * Cache: sessionStorage, 30 minut. Brak sieci nie psuje strony — pokazujemy komunikat.
 */
(function () {
  'use strict';

  var API = 'https://api.open-meteo.com/v1/forecast';
  var TTL = 30 * 60 * 1000;
  var BATCH = 40;

  var TEXT = {
    pl: {
      today: 'dziś', tomorrow: 'jutro',
      days: ['niedz.', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.'],
      months: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
      rain: 'deszcz', wind: 'wiatr', updated: 'aktualizacja',
      error: 'Prognoza jest chwilowo niedostępna. Sprawdź pogodę przed wyjazdem.',
      loading: 'Ładowanie prognozy…',
      best: 'najlepsza pogoda', score: 'ocena', bestTime: 'Najlepszy moment:',
      none: 'Brak danych pogodowych.'
    },
    en: {
      today: 'today', tomorrow: 'tomorrow',
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      rain: 'rain', wind: 'wind', updated: 'updated',
      error: 'The forecast is temporarily unavailable. Check the weather before you go.',
      loading: 'Loading forecast…',
      best: 'best weather', score: 'score', bestTime: 'Best window:',
      none: 'No weather data.'
    }
  };

  // Kody WMO → ikona + opis
  var WMO = {
    0: ['☀️', 'bezchmurnie', 'clear'],
    1: ['🌤️', 'prawie bezchmurnie', 'mostly clear'],
    2: ['⛅', 'częściowe chmury', 'partly cloudy'],
    3: ['☁️', 'zachmurzenie', 'overcast'],
    45: ['🌫️', 'mgła', 'fog'],
    48: ['🌫️', 'mgła z szronem', 'rime fog'],
    51: ['🌦️', 'mżawka', 'light drizzle'],
    53: ['🌦️', 'mżawka', 'drizzle'],
    55: ['🌧️', 'gęsta mżawka', 'dense drizzle'],
    56: ['🌧️', 'mżawka marznąca', 'freezing drizzle'],
    57: ['🌧️', 'mżawka marznąca', 'freezing drizzle'],
    61: ['🌧️', 'lekki deszcz', 'light rain'],
    63: ['🌧️', 'deszcz', 'rain'],
    65: ['🌧️', 'ulewa', 'heavy rain'],
    66: ['🌧️', 'deszcz marznący', 'freezing rain'],
    67: ['🌧️', 'deszcz marznący', 'freezing rain'],
    71: ['🌨️', 'lekki śnieg', 'light snow'],
    73: ['🌨️', 'śnieg', 'snow'],
    75: ['❄️', 'intensywny śnieg', 'heavy snow'],
    77: ['🌨️', 'śnieg ziarnisty', 'snow grains'],
    80: ['🌦️', 'przelotny deszcz', 'rain showers'],
    81: ['🌧️', 'przelotne opady', 'rain showers'],
    82: ['⛈️', 'gwałtowne opady', 'violent showers'],
    85: ['🌨️', 'przelotny śnieg', 'snow showers'],
    86: ['❄️', 'obfite opady śniegu', 'heavy snow showers'],
    95: ['⛈️', 'burza', 'thunderstorm'],
    96: ['⛈️', 'burza z gradem', 'thunderstorm with hail'],
    99: ['⛈️', 'burza z gradem', 'thunderstorm with hail']
  };

  function t(lang) { return TEXT[lang] || TEXT.pl; }

  function describe(code, lang) {
    var w = WMO[code] || ['🌡️', 'pogoda zmienna', 'changeable'];
    return lang === 'en' ? w[2] : w[1];
  }

  function icon(code) { return (WMO[code] || ['🌡️'])[0]; }

  // ── Cache ──
  function cacheGet(key) {
    try {
      var raw = sessionStorage.getItem(key);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (Date.now() - obj.ts > TTL) return null;
      return obj.data;
    } catch (e) { return null; }
  }

  function cacheSet(key, data) {
    try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: data })); } catch (e) { /* brak miejsca */ }
  }

  // ── Zapytanie do API ──
  function buildUrl(lats, lons, days) {
    return API +
      '?latitude=' + lats.join(',') +
      '&longitude=' + lons.join(',') +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max' +
      '&timezone=Europe%2FWarsaw' +
      '&forecast_days=' + Math.min(Math.max(days || 4, 1), 7);
  }

  function getJson(url, timeoutMs) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, timeoutMs || 12000);
    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .finally(function () { clearTimeout(timer); });
  }

  // ── Formatowanie ──
  function dayLabel(iso, lang) {
    var parts = iso.split('-');
    var d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
    var txt = t(lang);
    var today = new Date();
    var isToday = d.toISOString().slice(0, 10) === new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().slice(0, 10);
    return {
      name: isToday ? txt.today : txt.days[d.getUTCDay()],
      date: d.getUTCDate() + ' ' + txt.months[d.getUTCMonth()]
    };
  }

  function dayScore(d) {
    // Ocena „na wyjazd”: liczy się temperatura w dzień (tmax), nie średnia doby —
    // inaczej bezchmurny październikowy dzień 14°C wypada gorzej niż pochmurny 20°C.
    var s = 100;
    s -= (d.pop || 0) * 0.9;
    if (d.tmax < 15) s -= (15 - d.tmax) * 4;
    if (d.tmax > 28) s -= (d.tmax - 28) * 4;
    s -= Math.max(0, (d.wind || 0) - 20) * 1.5;
    if (d.code >= 95) s -= 45;
    else if (d.code >= 61) s -= 35;
    else if (d.code >= 51) s -= 18;
    else if (d.code === 45 || d.code === 48) s -= 12;
    else if (d.code === 3) s -= 8;
    return Math.max(0, Math.min(100, Math.round(s)));
  }

  function normDay(daily, i) {
    return {
      date: daily.time[i],
      code: daily.weather_code[i],
      tmax: Math.round(daily.temperature_2m_max[i]),
      tmin: Math.round(daily.temperature_2m_min[i]),
      pop: daily.precipitation_probability_max[i] == null ? 0 : Math.round(daily.precipitation_probability_max[i]),
      wind: daily.wind_speed_10m_max[i] == null ? 0 : Math.round(daily.wind_speed_10m_max[i])
    };
  }

  function daysFrom(result, lang) {
    var daily = result.daily;
    var out = [];
    for (var i = 0; i < daily.time.length; i++) {
      var d = normDay(daily, i);
      d.icon = icon(d.code);
      d.desc = describe(d.code, lang);
      d.label = dayLabel(d.date, lang);
      d.score = dayScore(d);
      out.push(d);
    }
    return out;
  }

  // ── Widget na stronie kierunku ──
  function renderWidget(box) {
    var lat = box.getAttribute('data-lat');
    var lon = box.getAttribute('data-lon');
    var days = parseInt(box.getAttribute('data-days'), 10) || 4;
    var lang = box.getAttribute('data-lang') || 'pl';
    var grid = box.querySelector('[data-weather-grid]');
    var updated = box.querySelector('[data-weather-updated]');
    if (!lat || !lon || !grid) return;

    var key = 'pb-weather:' + lat + ',' + lon + ':' + days;

    var paint = function (list) {
      if (!list || !list.length) { grid.innerHTML = '<p class="weather-error">' + t(lang).none + '</p>'; return; }
      grid.innerHTML = list.map(function (d) {
        return '<div class="weather-day">' +
          '<p class="weather-day-name">' + d.label.name + '<span>' + d.label.date + '</span></p>' +
          '<p class="weather-icon" aria-hidden="true">' + d.icon + '</p>' +
          '<p class="weather-temp"><strong>' + d.tmax + '°</strong><span>' + d.tmin + '°</span></p>' +
          '<p class="weather-desc">' + d.desc + '</p>' +
          '<p class="weather-meta"><span>💧 ' + d.pop + '%</span><span>💨 ' + d.wind + ' km/h</span></p>' +
          '</div>';
      }).join('');
      if (updated) {
        var now = new Date();
        updated.textContent = '· ' + t(lang).updated + ' ' +
          String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      }
    };

    var cached = cacheGet(key);
    if (cached) { paint(daysFrom(cached, lang)); return; }

    getJson(buildUrl([lat], [lon], days))
      .then(function (res) {
        var data = Array.isArray(res) ? res[0] : res;
        if (!data || !data.daily) throw new Error('brak danych');
        cacheSet(key, data);
        paint(daysFrom(data, lang));
      })
      .catch(function () {
        grid.innerHTML = '<p class="weather-error">' + t(lang).error + '</p>';
      });
  }

  // ── Ranking „gdzie w weekend słońce” ──
  function weekendDates(list) {
    // Sobota + niedziela najbliższego weekendu; w sobotę i niedzielę — bieżący weekend.
    var today = new Date();
    var todayIso = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().slice(0, 10);
    var idx = list.indexOf(todayIso);
    if (idx === -1) return [list[0], list[1] || list[0]];

    var dow = new Date(todayIso + 'T00:00:00Z').getUTCDay(); // 0 = niedziela, 6 = sobota
    if (dow === 6) return [list[idx], list[idx + 1] || list[idx]];
    if (dow === 0) return [list[idx], list[idx]];

    var sat = idx + (6 - dow);
    if (sat < list.length - 1) return [list[sat], list[sat + 1]];
    // Weekend poza prognozą — bierzemy najbliższe dwa dni
    return [list[Math.min(idx + 1, list.length - 1)], list[Math.min(idx + 2, list.length - 1)]];
  }

  function renderRanking(box) {
    var lang = box.getAttribute('data-lang') || 'pl';
    var limit = parseInt(box.getAttribute('data-limit'), 10) || 12;
    var txt = t(lang);

    box.innerHTML = '<p class="wrank-loading">' + txt.loading + '</p>';

    fetch('weather-points.json', { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (points) {
        var chunks = [];
        for (var i = 0; i < points.length; i += BATCH) chunks.push(points.slice(i, i + BATCH));

        return chunks.reduce(function (chain, chunk) {
          return chain.then(function (acc) {
            var lats = chunk.map(function (p) { return p.lat; });
            var lons = chunk.map(function (p) { return p.lon; });
            return getJson(buildUrl(lats, lons, 7))
              .then(function (res) {
                var arr = Array.isArray(res) ? res : [res];
                arr.forEach(function (r, i) { acc.push({ point: chunk[i], result: r }); });
                return acc;
              })
              .catch(function () { return acc; });
          });
        }, Promise.resolve([]));
      })
      .then(function (rows) {
        var scored = rows
          .filter(function (r) { return r.result && r.result.daily; })
          .map(function (r) {
            var days = daysFrom(r.result, lang);
            var wk = weekendDates(r.result.daily.time);
            var sat = days.find(function (d) { return d.date === wk[0]; });
            var sun = days.find(function (d) { return d.date === wk[1]; });
            var score = Math.round(((sat ? sat.score : 0) + (sun ? sun.score : 0)) / 2);
            return { point: r.point, sat: sat, sun: sun, score: score };
          })
          .sort(function (a, b) { return b.score - a.score; })
          .slice(0, limit);

        if (!scored.length) throw new Error('brak danych');

        box.innerHTML = scored.map(function (row, i) {
          var d = row.sat || row.sun;
          var dayLine = function (x) {
            if (!x) return '';
            return '<div class="wrank-day"><span>' + x.label.name + '</span>' +
              '<b>' + x.icon + ' ' + x.tmax + '°</b>' +
              '<em>' + x.pop + '% 💧</em><small>' + x.desc + '</small></div>';
          };
          return '<a class="wrank-item" href="' + row.point.url + '">' +
            '<span class="wrank-pos">' + String(i + 1).padStart(2, '0') + '</span>' +
            '<span class="wrank-body">' +
              '<strong>' + row.point.name + '</strong>' +
              '<span class="wrank-region">' + row.point.region + '</span>' +
              '<span class="wrank-days">' + dayLine(row.sat) + dayLine(row.sun) + '</span>' +
            '</span>' +
            '<span class="wrank-score' + (i === 0 ? ' is-best' : '') + '">' +
              (i === 0 ? txt.best : row.score) +
            '</span>' +
            '</a>';
        }).join('');
      })
      .catch(function () {
        box.innerHTML = '<p class="weather-error">' + txt.error + '</p>';
      });
  }

  function init() {
    var widgets = document.querySelectorAll('[data-weather]');
    for (var i = 0; i < widgets.length; i++) renderWidget(widgets[i]);

    var rankings = document.querySelectorAll('[data-weather-ranking]');
    for (var j = 0; j < rankings.length; j++) renderRanking(rankings[j]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
