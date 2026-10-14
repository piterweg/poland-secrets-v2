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


## Ściągawka — najczęstsze komendy
Cel	Komenda
1. Sprawdź stan	git status
2. Zobacz historię	git log --oneline -10
3. Dodaj wszystkie zmiany	git add -A
4. Commit	git commit -m "opis"
5. Push na GitHub	git push origin main
6. Pull z GitHuba	git pull origin main
7. Zobacz zdalne repo	git remote -v
8. Zmień URL zdalnego repo	git remote set-url origin <nowy-url>
