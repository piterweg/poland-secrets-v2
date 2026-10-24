# Polska bliżej — slow travel guide

Statyczna strona z przewodnikiem po Polsce w duchu slow travel.

## Struktura projektu

```
articles/            treści artykułów o kierunkach (JSON, PL + EN)
blog-posts.json      treści wpisów bloga
blog/                wygenerowane strony bloga
kierunki/            wygenerowane strony kierunków (PL + EN)
images/              zdjęcia i logo
generate-*.js        generatory HTML (blog, kierunki, regiony, sitemap, RSS)
prerender.js         wstrzykuje karty kierunków do stron głównych, hubów i regionów
generate-weekends.js kalendarz 52 weekendów (weekendy.html + weekendy-en.html)
weekend.css          źródło stylów kalendarza (wbudowywane w HTML przy buildzie)
```

## Build

Wymagany Node.js v18+.

```bash
npm run build
```

`build` uruchamia kolejno: `generate-blog.js` → `generate-blog-categories.js` →
`generate-destinations.js` → `generate-regions.js` → `prerender.js` →
`generate-weekends.js` → `generate-sitemap.js` → `generate-rss.js`.

## Kalendarz weekendów

`generate-weekends.js` przypisuje każdemu z 52 weekendów roku osobny kierunek:

- punktuje dopasowanie `bestSeason` do miesiąca weekendu,
- dba o równowagę kategorii i regionów (bez powtórzeń w kolejnych tygodniach),
- zimą preferuje miasta, zamki i kuchnię zamiast lasów i szlaków,
- pomija trasy dłuższe niż weekend (4+ dni) oraz miejsca nie będące
  propozycją na weekend,
- wybór jest deterministyczny — ten sam plik danych daje ten sam kalendarz.

Wynik to `weekendy.html` i `weekendy-en.html`: 12 sekcji miesięcznych, 52 wpisy,
podświetlony najbliższy weekend, `ItemList` w JSON-LD i linki do `/kierunki/`.

Style kalendarza (`weekend.css`) są **wbudowywane w `<style>`** przy generowaniu —
dzięki temu strona wygląda poprawnie nawet wtedy, gdy plik CSS nie trafi na
hosting albo podgląd otwiera sam HTML. Edytujesz `weekend.css`, potem:

```bash
npm run build:weekends
```

**Uwaga:** kalendarz buduje się na rok bieżący (`new Date().getFullYear()`), więc
na początku stycznia trzeba go przegenerować (albo dodać cron).

## Pogoda na trasie

`generate-weather.js` tworzy `pogoda.html`, `pogoda-en.html` i `weather-points.json`.
Współrzędne leżą w `weather-coords.json`: 115 kierunków ma konkretny punkt
(miasto, schronisko, park), a 9 tras ogólnopolskich ma `multi: true` — dla nich
nie ma prognozy punktowej.

Prognozę pobiera przeglądarka z Open-Meteo (bez klucza API) przez `weather.js`:
4-dniowy widget na stronie każdego kierunku oraz ranking weekendowy na
`/pogoda.html` (3 zapytania batchowane po 40 punktów, cache 30 min w sessionStorage).
Style: `weather.css`. Gdy brakuje `weather-coords.json`, build nadal przechodzi —
strony kierunków po prostu nie dostają widgetu.

## Adresy kierunków

Każdy kierunek ma własną, statyczną stronę: `/kierunki/<id>.html` (PL) i
`/kierunki/<id>-en.html` (EN). To one są w `sitemap.xml` i do nich linkują karty.

Stare adresy `article.html?id=<id>` są przekierowywane 301 na `/kierunki/<id>.html`
(reguła w `.htaccess`). `article.html` ma `noindex` i służy już tylko jako
awaryjny widok.

## Wdrożenie

Hosting obsługuje `.htaccess` (HTTPS, cache, kompresja, 404, przekierowania).
Wgranie na FTP: cała zawartość katalogu poza plikami `*.js` używanymi tylko
podczas builda.

## Przydatne komendy

| Cel | Komenda |
| --- | --- |
| Stan repo | `git status` |
| Historia | `git log --oneline -10` |
| Commit + push | `git add -A ; git commit -m "opis" ; git push origin main` |
