# GTE — WWW

Koncepcyjny frontend strony Grupy TEB Edukacja. Projekt jest statycznym onepagerem zbudowanym w semantic HTML, native CSS i vanilla JavaScript — bez frameworka, bundlera i zależności runtime.

## Uruchomienie lokalne

Ze względu na ES Modules stronę należy uruchamiać przez lokalny serwer HTTP, a nie bezpośrednio przez `file://`.

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Następnie otwórz:

```text
http://127.0.0.1:4173/
```

## Struktura projektu

```text
/
├── index.html
├── css/
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── map.css
│   └── motion.css
├── js/
│   ├── main.js
│   ├── map.js
│   └── map-data.js
├── assets/
│   ├── graphics/
│   ├── logo/
│   ├── maps/
│   ├── partners/
│   └── photos/
└── qa/
```

### Odpowiedzialności

- `index.html` — semantyczna struktura strony i treść.
- `css/tokens.css` — kolory, typografia, spacing, szerokości i timing.
- `css/base.css` — font-face, reset, elementy bazowe i accessibility.
- `css/layout.css` — layout sekcji, komponenty i responsywność.
- `css/map.css` — wygląd mapy, pinów, tooltipu i mobile picker.
- `css/motion.css` — progressive enhancement animacji i reduced motion.
- `js/main.js` — nawigacja, header, scrollspy, focus management i reveal.
- `js/map.js` — interakcje mapy: piny, tooltip, selection i keyboard navigation.
- `js/map-data.js` — dane 46 miast i ich współrzędne.
- `assets/maps/poland-map.svg` — geometria mapy Polski.

## Mapa

Mapa została rozdzielona na trzy warstwy:

1. geometria — `assets/maps/poland-map.svg`,
2. dane — `js/map-data.js`,
3. interakcja — `js/map.js`.

Dzięki temu HTML nie przechowuje geometrii SVG ani ręcznie zapisanych 46 markerów.

## Hero

Aktualny wariant używa:

```text
assets/photos/approved-photo.png
```

Zdjęcie jest warstwą wizualną hero. Tekst i CTA pozostają niezależne od assetu.

## Partnerzy

Aktualna lista w UI obejmuje:

- Semilac Professional,
- Bielenda Professional,
- Schwarzkopf Professional,
- Ecolab,
- Kamsoft,
- Intel,
- Canon,
- Cisco Networking Academy Partner,
- iSpot Apple Premium Education Partner,
- InsERT,
- MSI Polska.

Dla iSpot używany jest tymczasowy fallback tekstowy. Przed finalnym wdrożeniem należy podmienić go na oficjalny asset partnera.

## Dane do potwierdzenia

W sekcji „GTE w liczbach” pozostają dwa jawne placeholdery:

- liczba szkół policealnych,
- liczba szkół średnich.

W `index.html` są oznaczone komentarzem `TODO`. Nie należy traktować wartości `xx` jako danych produkcyjnych.

## Kontakt

Aktualny kontakt w UI:

- Grupa TEB Edukacja,
- Centrala TEB Edukacja,
- ul. Pastelowa 16, 60-198 Poznań,
- +48 61 667 01 74,
- centrala@teb-edukacja.pl.

## Typografia

Projekt korzysta z lokalnych plików Proxima Nova 400 / 600 / 700.

> **Handoff / produkcja:** przed dalszą publiczną dystrybucją lub wdrożeniem należy potwierdzić warunki licencji webowej i sposób hostowania fontów. Obecne pliki OTF są assetami roboczymi projektu.

## Accessibility / progressive enhancement

Projekt zawiera m.in.:

- skip link,
- focus-visible,
- obsługę menu klawiaturą i Escape,
- roving tabindex na mapie,
- natywny picker miasta na mobile,
- `prefers-reduced-motion`,
- wersję strony działającą również bez JavaScriptu.

## QA

Materiały w `qa/` dokumentują wcześniejszy pełny przebieg testów Chrome. Po późniejszych zmianach treści, partnerów, kontaktu i assetów traktuj screenshoty jako **baseline**, a nie jako aktualny golden master.

Przed finalnym wdrożeniem zalecane jest ponowne uruchomienie:

```powershell
node --check js/main.js
node --check js/map.js
node qa/verify.mjs
node qa/render.mjs
```

Szczegóły: [qa/QA.md](qa/QA.md).

## Handoff

Projekt jest celowo prosty i bez procesu build. Developer może:

- wdrożyć go bezpośrednio jako statyczny frontend,
- przepisać sekcje do istniejącego CMS/frameworka,
- zachować obecne klasy i tokeny jako referencję wizualną,
- potraktować `map-data.js` jako źródło danych dla mapy w docelowym stacku.
