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
```

## Build

Wymagany Node.js v18+.

```bash
npm run build
```

`build` uruchamia kolejno: `generate-blog.js` → `generate-destinations.js` →
`generate-sitemap.js` → `generate-rss.js`. Karty na stronach głównych, hubach i
regionach wstrzykuje `prerender.js` (uruchom go po wygenerowaniu kierunków):

```bash
node prerender.js
```

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
