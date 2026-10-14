# Polska bliżej – Slow travel guide

Statyczna strona z przewodnikiem po Polsce.

## Struktura projektu
- `articles/` – treści artykułów (JSON)
- `blog/` – wygenerowane strony bloga
- `kierunki/` – wygenerowane strony kierunków
- `images/` – zdjęcia
- `generate-*.js` – skrypty generujące HTML

## Jak uruchomić lokalnie
1. Zainstaluj Node.js
2. `node generate-blog.js`
3. `node generate-destinations.js`
4. Otwórz `index.html` w przeglądarce

## Wdrożenie
- GitHub Pages: [instrukcja](https://docs.github.com/en/pages)
- Lub własny hosting (FTP)
