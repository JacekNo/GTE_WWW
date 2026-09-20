# Visual & UX QA — GTE

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

**41/41 testów: PASS.** Automatyczne wyniki w [results.json](results.json), odtwarzalny scenariusz w [verify.mjs](verify.mjs).

- Brak poziomego overflow, wewnętrznego ucięcia badanej treści, brakujących obrazów i fontów w czterech wymaganych szerokościach.
- Hover, focus, Enter, Space, click/tap, utrzymanie wyboru po wyjściu kursora, podgląd innego miasta i powrót tooltipu do wybranego miasta, Escape oraz ARIA pressed/description.
- Wszystkie 46 tooltipów sprawdzono przy krawędziach mapy w każdej szerokości.
- Sprawdzono hit target każdego z 46 pinów, w tym Śląsk. Otoczki nie przechwytują kliknięć w sąsiednie miasta; geometria położenia pinów pozostała bez zmian.
- Na mobile dodatkowy natywny wybór miasta korzysta z tego samego stanu co mapa. [Wybrane miasto](map-mobile-selected.png).
- Menu mobilne: pełne przykrycie viewportu, przewijanie na niskim ekranie, otwarcie, zamknięcie po wyborze sekcji, Escape z przywróceniem focusu oraz zawijanie Tab wewnątrz otwartej nawigacji. [Screenshot](menu-mobile.png).
- Widoczny focus i skip link; obrys navy na białym tle i zielony na granacie. [Focus](keyboard-focus.png).
- Reduced motion od razu pokazuje treść i wszystkie punkty, usuwa animacje i smooth scroll. [Screenshot](reduced-motion-mobile.png).
- Wyłączony JavaScript: treść i nawigacja mobilna pozostają dostępne. [Screenshot](no-js-mobile.png).
- Krótkie nagłówki i dłuższe opisy przetestowano przez tymczasową zmianę tekstów w sesji przeglądarki. Brak zmian treści produkcyjnej.
- Quick scroll i reload w środku strony: treść widoczna. Brak wyjątków JavaScript oraz błędów pobierania assetów.

## Hero i Visual QA

Finalny hero pozostaje **brand-only**, zgodnie z informacją o braku zatwierdzonego zdjęcia. Wariant photo-enabled sprawdzono osobno przy użyciu testowego zdjęcia ze strony TEB: [desktop](hero-photo-1440.png), [mobile](hero-photo-390.png). Zdjęcie nie występuje na stronie docelowej i nie jest prezentowane jako rzeczywisty zespół GTE.

Po pierwszym renderze skorygowano linię hero, która przechodziła za CTA. Statystyki mają wyraźny poziom danych o ludziach i spokojniejszy poziom infrastruktury. Trzy podmioty mają wspólną linię oraz wyrównane logotypy i opisy; partnerzy tworzą otwarte pole znaków o różnych proporcjach. Mapa navy ma białe piny i granice, aktywny punkt i tooltip są zielone. Kontakt jest prostą sekcją dwóch kolumn, a na telefonie jedną kolumną.

Sekwencja mapy: outline 0–750 ms → boundaries 450–850 ms → pins 900–1700 ms. Motion jest jednorazowy; reduced motion go wyłącza.

## Ustalenia materiałowe

Dostarczone fonty to Proxima Nova **400 / 600 / 700**. Semibold 600 pełni rolę środkowej wagi zamiast nieobecnego Medium 500; zachowano prawdziwą wagę pliku i wyłączono syntezę fontów. Źródła kontaktu i logotypów oraz sposób dodania przyszłego zdjęcia opisano w [README](../README.md).

QA wykonano w Chrome, w tym z emulacją dotyku; nie obejmuje fizycznych urządzeń ani Safari/Firefox. Screenshoty zostały wizualnie sprawdzone przez agenta; nie zastępują akceptacji właściciela marki.
