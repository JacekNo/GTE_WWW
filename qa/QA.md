# Visual & UX QA — GTE

> **Status dokumentu:** screenshoty i wynik 41/41 pochodzą z baseline QA z 20.09.2026 i są materiałem historycznym. Skrypt `verify.mjs` został zsynchronizowany z bieżącym DOM w ramach clean baseline 23.09.2026, ale screenshoty i `results.json` należy wygenerować ponownie przed uznaniem ich za aktualny golden master.

20.09.2026 · Chrome 154 · lokalna strona HTTP · rzeczywiste rendery przeglądarki.

## Wynik

Przebudowano istniejącą stronę przy zachowaniu kolejności sekcji, treści biznesowej, logotypów grupy i geometrii mapy. Usunięto stare warianty CSS, offsety statystyk, spine, keywords, anchor lines, dekoracyjny okrąg kontaktu i informacje prototypowe. Bez nowych zależności runtime.

## Screenshoty końcowe

| Wariant | Viewport | Cała strona | Hero |
| --- | --- | --- | --- |
| Desktop | 1440 × 900 | [Pełna strona](desktop-1440.png) | [Hero](hero-1440.png) |
| Laptop | 1280 × 800 | [Pełna strona](desktop-1280.png) | [Hero](hero-1280.png) |
| Tablet | 768 × 1024 | [Pełna strona](desktop-768.png) | [Hero](hero-768.png) |
| Mobile | 390 × 844 | [Pełna strona](desktop-390.png) | [Hero](hero-390.png) |
| Browser zoom 125% | okno 1440 × 900; viewport CSS 1139 × 644 | [Pełna strona](zoom-125.png) | [Hero](zoom-125-hero.png) |

W 125% potwierdzono rzeczywisty `page zoom = 1.25` oraz `devicePixelRatio = 1.25`; `visualViewport.scale = 1`. Nie jest to CSS zoom ani symulowany pinch zoom. Obraz viewportu ma 1424 × 805 fizycznych pikseli, ponieważ zoom testowano w rzeczywistym oknie Chrome razem z jego chrome/scrollbar geometry. Szczegóły: [zoom.json](zoom.json).

## Interakcje i dostępność

Historyczny przebieg z 20.09.2026 zakończył się wynikiem **41/41 PASS**. Plik [results.json](results.json) odnosi się do tego przebiegu. Bieżący scenariusz w [verify.mjs](verify.mjs) został zaktualizowany do aktualnej struktury mapy i nawigacji i powinien zostać uruchomiony ponownie po clean baseline.

- Brak poziomego overflow, wewnętrznego ucięcia badanej treści, brakujących obrazów i fontów w czterech wymaganych szerokościach.
- Desktop: piny są informacyjne i reagują wyłącznie na hover kursora; nie mają semantyki przycisku, stanu `aria-pressed` ani trwałego zaznaczenia. Po opuszczeniu pina tooltip znika.
- Wszystkie 46 tooltipów sprawdzono przy krawędziach mapy w każdej szerokości.
- Sprawdzono hit target każdego z 46 pinów, w tym Śląsk. Otoczki nie przechwytują kliknięć w sąsiednie miasta; geometria położenia pinów pozostała bez zmian.
- Mobile: tapnięcie pina nie wykonuje akcji. Natywny picker miasta podświetla wskazane miasto i pokazuje odpowiadający mu tooltip. [Wybrane miasto](map-mobile-selected.png).
- Menu mobilne: pełne przykrycie viewportu, przewijanie na niskim ekranie, otwarcie, zamknięcie po wyborze sekcji, Escape z przywróceniem focusu oraz zawijanie Tab wewnątrz otwartej nawigacji. Aktualny test sprawdza również, czy strzałka przy „Kontakt” pozostaje bezpośrednio przy etykiecie. [Screenshot](menu-mobile.png).
- Widoczny focus i skip link; obrys navy na białym tle i zielony na granacie. [Focus](keyboard-focus.png).
- Reduced motion od razu pokazuje treść i wszystkie punkty, usuwa animacje i smooth scroll. [Screenshot](reduced-motion-mobile.png).
- Wyłączony JavaScript: treść i nawigacja mobilna pozostają dostępne. [Screenshot](no-js-mobile.png).
- Krótkie nagłówki i dłuższe opisy przetestowano przez tymczasową zmianę tekstów w sesji przeglądarki. Brak zmian treści produkcyjnej.
- Quick scroll i reload w środku strony: treść widoczna. Brak wyjątków JavaScript oraz błędów pobierania assetów.

## Hero i Visual QA

Baseline QA obejmował wariant brand-only oraz wariant ze zdjęciem. Aktualny HTML korzysta z `assets/photos/approved-photo.png` jako warstwy hero, dlatego screenshoty bazowe mogą różnić się od bieżącego widoku.

Po pierwszym renderze skorygowano linię hero, która przechodziła za CTA. Statystyki mają wyraźny poziom danych o ludziach i spokojniejszy poziom infrastruktury. Trzy podmioty mają wspólną linię oraz wyrównane logotypy i opisy; partnerzy tworzą otwarte pole znaków o różnych proporcjach. Mapa navy ma białe piny i granice, a chwilowo podświetlany punkt i tooltip są zielone. Kontakt jest prostą sekcją dwóch kolumn, a na telefonie jedną kolumną.

Aktualna mapa ma geometrię w osobnym `assets/maps/poland-map.svg`, dane miast w `js/map-data.js` i interakcje w `js/map.js`. Piny są nieinteraktywną warstwą informacyjną; na desktopie tooltip działa przez hover, a na mobile dostępny jest natywny picker. Motion pozostaje progressive enhancement; reduced motion go wyłącza.

## Ustalenia materiałowe

Dostarczone fonty to Proxima Nova **400 / 600 / 700**. Semibold 600 pełni rolę środkowej wagi zamiast nieobecnego Medium 500; zachowano prawdziwą wagę pliku i wyłączono syntezę fontów. Źródła kontaktu i logotypów oraz sposób dodania przyszłego zdjęcia opisano w [README](../README.md).

QA wykonano w Chrome, w tym z emulacją dotyku; nie obejmuje fizycznych urządzeń ani Safari/Firefox. Screenshoty zostały wizualnie sprawdzone przez agenta; nie zastępują akceptacji właściciela marki.
