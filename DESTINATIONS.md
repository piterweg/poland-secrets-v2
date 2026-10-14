# Statyczne strony kierunków

Każdy kierunek ma teraz własny adres, zbudowany z danych, które już są w repo:

| Adres | Treść |
|---|---|
| `kierunki/<id>.html` | wersja PL (np. `kierunki/baltyk.html`) |
| `kierunki/<id>-en.html` | wersja EN (używa jej też strona ES) |

Zastępuje to `article.html?id=<id>`, które ładowało treść JavaScriptem. Stary adres przekierowuje na nowy (patrz `article.html`).

## Budowanie

```bash
node generate-destinations.js && node prerender.js && node generate-sitemap.js
```

1. `generate-destinations.js` czyta `trips-pl.json`, `trips-en.json`, `articles/<id>.json`, `articles/<id>-en.json`, mapę `photos` z `app.js` i `regions-data.json`. Zapisuje `kierunki/*.html` oraz `destinations-manifest.json`.
2. `prerender.js` wstawia do kart (strona główna, huby, regiony) prawdziwe linki `<a href="kierunki/…">`.
3. `generate-sitemap.js` czyta manifest i wpisuje strony PL + EN z `hreflang` (zamiast 145 adresów `article.html?id=`).

Strony z komentarzem `<!-- generated-by: generate-destinations.js -->` są nadpisywane przy każdym buildzie. Nie edytuj ich ręcznie, zmieniaj dane w JSON-ach.

## Opcje `generate-destinations.js`

| Opcja | Działanie |
|---|---|
| `--noindex-below N` | strony krótsze niż N słów dostają `noindex, follow` i nie trafiają do sitemapy (cienka treść) |
| `--only id1,id2` | buduje tylko wybrane kierunki (podgląd) |
| `--strict` | kończy się kodem 1 przy błędach danych (np. uszkodzony JSON) |
| `--verbose` | pokazuje wszystkie ostrzeżenia |

Domyślnie wszystkie strony są indeksowalne. Zwróć uwagę na wiersz „Poniżej 800 słów” w raporcie: dziś artykuły mają ok. 200 słów. Gdy rozbudujesz najważniejsze kierunki, użyj `--noindex-below 400` (albo 800), żeby do indeksu trafiały tylko strony z solidną treścią.

## Nowy kierunek

1. Dodaj wpis do `trips-pl.json` (i `trips-en.json`) oraz artykuł `articles/<id>.json` (`<id>-en.json`).
2. Dodaj zdjęcie do `images/` i wpis w mapie `photos` w `app.js`.
3. Uruchom budowanie (komenda wyżej).

## Dane do uzupełnienia

Raport generatora wypisuje brakujące zdjęcia (głównie ID z mapy `photos` bez pliku w `images/`) i galerie wskazujące nieistniejące pliki. Dla brakującego zdjęcia głównego strona bierze pierwsze istniejące zdjęcie z galerii, a w ostateczności `hero-polska.webp`.

## Przekierowanie 301 na serwerze (zalecane)

`article.html` przekierowuje przez JavaScript. Jeśli hosting pozwala, ustaw też przekierowanie 301 z `/article.html?id=<id>` na `/kierunki/<id>.html`, żeby wyszukiwarki szybciej przeniosły sygnały na nowe adresy.
