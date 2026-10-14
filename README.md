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
Sprawdź stan	git status
Zobacz historię	git log --oneline -10
Dodaj wszystkie zmiany	git add -A
Commit	git commit -m "opis"
Push na GitHub	git push origin main
Pull z GitHuba	git pull origin main
Zobacz zdalne repo	git remote -v
Zmień URL zdalnego repo	git remote set-url origin <nowy-url>
