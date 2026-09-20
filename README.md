# GTE — Visual & UX Redesign

Strona Grupy TEB Edukacja: semantic HTML, native CSS i vanilla JavaScript. Bez frameworka, bundlera i zależności runtime.

## Uruchomienie

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Otwórz http://127.0.0.1:4173/. Raport i screenshoty: [qa/QA.md](qa/QA.md).

## Struktura

- `index.html` — treść, sekcje i oryginalna geometria interaktywnej mapy.
- `css/tokens.css` — kolor, typografia, standardowy i kompaktowy rytm sekcji.
- `css/base.css` — dostarczone fonty, semantyczne podstawy i dostępność.
- `css/layout.css` — komponenty i responsywność; zastępuje poprzednie warianty CSS.
- `css/motion.css` — reveal treści, draw linii, aktywacja punktów, reduced motion.
- `js/motion.js` — istniejący model hover/focus/selection mapy, pozycjonowanie tooltipów, menu i IntersectionObserver. Lista miast na telefonie używa tego samego stanu wyboru co mapa.

## Typografia

Używane są trzy dostarczone lokalne pliki Proxima Nova w `assets`: Regular **400**, Semibold **600**, Bold **700**. Plik opisany jako Semibold ma faktyczną wagę 600; nie jest odmianą Medium 500. Dlatego środkowa rola typograficzna (`--weight-medium`) korzysta jawnie z 600. Po dostarczeniu Medium wystarczy podmienić źródło odpowiedniego `@font-face`, jego wagę oraz token na 500. Font synthesis jest wyłączony; strona nie pobiera fontów z zewnętrznych usług.

## Hero z fotografią i bez niej

Domyślny, finalny wariant to **brand-only**. Aby włączyć zdjęcie, dodaj jako pierwsze dziecko `.hero`:

```html
<img class="hero__photo" src="assets/photos/approved-photo.jpg" alt="" />
```

Zdjęcie jest dekoracyjnym tłem: layout, headline i kontrolka przewijania nie zmieniają struktury. CSS automatycznie nakłada navy treatment i wycisza linię. Kadr można ustawić przez `--hero-photo-position: 60% center` na hero. Nie należy dodawać klasy bez faktycznego obrazu.

Alternatywnie, przy hero bez zdjęcia, w `.about__grid` przygotowany jest slot:

```html
<figure class="about__photo" data-reveal>
  <img src="assets/photos/approved-team.jpg" alt="Opis zatwierdzonego zdjęcia zespołu lub siedziby" loading="lazy" />
</figure>
```

Nie ma pustego placeholdera w widoku strony. Plik `qa/photo-fixture.jpg` służy wyłącznie testom; nie jest zdjęciem siedziby lub zespołu GTE i nie występuje w finalnym HTML.

## Źródła uzupełnionych assetów i kontaktu

- Oryginalne logotypy GTE / FORTEB / TEB / EDICON oraz mapa i sygnet: istniejące repo.
- Partnerzy: osiem oficjalnych SVG pobranych z [teb.pl](https://teb.pl/), ścieżka `/assets/partners/teb-edukacja-partner-{marka}.svg`. Nazwy partnerów zachowane z dotychczasowej strony. Logo files: semilac, bielenda, schwarzkopf, microsoft, canon, cisco, insert, inglot.
- Kontakt centrali: [oficjalna strona kontaktowa TEB](https://teb.pl/kontakt/), odczyt 20.09.2026: ul. Pastelowa 16, 60-198 Poznań; +48 61 667 01 74; centrala@teb-edukacja.pl. W UI dane są opisane jako kontakt do centrali TEB Edukacja.
- Wyłącznie testowe zdjęcie: [oficjalny zasób TEB — organizacja i zarządzanie](https://teb.pl/wp-content/uploads/2023/01/teb-edukacja-branza-organiazacja-i-zarzadzanie-720x480.jpg).
- Liczby i pozostałe informacje zachowano zgodnie z briefem i istniejącą treścią; redesign nie jest audytem aktualności danych biznesowych.

## QA

Skrypty `qa/*.mjs` używają wbudowanego WebSocket/fetch w Node 22 i Chrome DevTools Protocol. Nie dodają zależności do strony. Chrome testowy działa na porcie 9223 z osobnym profilem, serwer na 4173.

```powershell
node --check js/motion.js
node qa/verify.mjs
node qa/render.mjs
```

Test 125% uruchamiany jest na osobnym profilu Chrome (port 9224). Rzeczywisty page zoom ustawiony w Preferences: `partition.default_zoom_level.x = log(1.25) / log(1.2)`. Potwierdzenie pomiaru: `devicePixelRatio = 1.25`, `visualViewport.scale = 1`, `innerWidth = 1139` przy oknie 1440 px. Nie użyto CSS zoom ani emulacji pinch-to-zoom.

```powershell
$env:CDP_PORT = '9224'
node qa/zoom.mjs
Remove-Item Env:\CDP_PORT
```
