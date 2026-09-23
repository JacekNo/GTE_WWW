import { MAP_CITIES, MAP_VIEWBOX } from "./map-data.js";

const PIN_SVG = `
  <svg class="map-city__glyph" viewBox="-10 -8 20 18" aria-hidden="true">
    <path d="M8.525 .022L0 8.55L-8.528 .022V-6.105L0 2.42L8.525-6.105V.022Z" />
  </svg>
`;

export function setupMap(map) {
  if (!map) return;

  const stage = map.querySelector("[data-map-stage]");
  const pinsLayer = map.querySelector("[data-map-pins]");
  const picker = map.querySelector("[data-map-picker]");
  const tooltip = map.querySelector("[data-map-tooltip]");
  const tooltipLabel = map.querySelector("[data-map-tooltip-label]");

  if (!stage || !pinsLayer || !picker || !tooltip || !tooltipLabel) return;

  const pins = MAP_CITIES.map((city, index) => {
    const marker = document.createElement("span");
    const xPercent = (city.x / MAP_VIEWBOX.width) * 100;
    const yPercent = (city.y / MAP_VIEWBOX.height) * 100;
    const scatter =
      (index * 137 + Math.round(city.x * 0.8) + Math.round(city.y * 0.35)) %
      720;
    const delay = 140 + scatter;

    marker.className = "map-city";
    marker.dataset.city = city.name;
    marker.setAttribute("aria-hidden", "true");
    marker.style.setProperty("--x", `${xPercent.toFixed(4)}%`);
    marker.style.setProperty("--y", `${yPercent.toFixed(4)}%`);
    marker.style.setProperty("--city-delay", `${delay}ms`);
    marker.innerHTML = PIN_SVG;

    pinsLayer.append(marker);
    picker.add(new Option(city.name, city.name));

    return marker;
  });

  let hoveredPin = null;
  let pickerPin = null;

  const positionTooltip = (pin) => {
    const stageRect = stage.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();
    const rawX = pinRect.left + pinRect.width / 2 - stageRect.left;
    const rawY = pinRect.top + pinRect.height / 2 - stageRect.top;

    tooltip.style.setProperty("--tooltip-x", `${rawX}px`);
    tooltip.style.setProperty("--tooltip-y", `${rawY}px`);
    tooltip.classList.remove("is-below");

    requestAnimationFrame(() => {
      const tooltipRect = tooltip.getBoundingClientRect();
      const horizontalPad = 8;
      const halfWidth = tooltipRect.width / 2;
      const clampedX = Math.min(
        Math.max(rawX, halfWidth + horizontalPad),
        stageRect.width - halfWidth - horizontalPad,
      );

      tooltip.style.setProperty("--tooltip-x", `${clampedX}px`);

      if (rawY < tooltipRect.height + 24) {
        tooltip.classList.add("is-below");
      }
    });
  };

  const showTooltip = (pin) => {
    if (!pin) return;

    tooltipLabel.textContent = pin.dataset.city;
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    positionTooltip(pin);
  };

  const hideTooltip = () => {
    tooltip.classList.remove("is-visible", "is-below");
    tooltip.setAttribute("aria-hidden", "true");
  };

  const setHoveredPin = (pin) => {
    if (hoveredPin === pin) return;

    hoveredPin?.classList.remove("is-highlighted");
    hoveredPin = pin;
    hoveredPin?.classList.add("is-highlighted");

    if (hoveredPin) showTooltip(hoveredPin);
  };

  const clearHoveredPin = (pin) => {
    if (pin && hoveredPin !== pin) return;

    hoveredPin?.classList.remove("is-highlighted");
    hoveredPin = null;

    if (pickerPin) showTooltip(pickerPin);
    else hideTooltip();
  };

  const setPickerPin = (pin) => {
    pickerPin?.classList.remove("is-picker-selected");
    pickerPin = pin;
    pickerPin?.classList.add("is-picker-selected");

    if (pickerPin) showTooltip(pickerPin);
    else hideTooltip();
  };

  pinsLayer.addEventListener("pointerover", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;

    const pin = event.target.closest(".map-city");
    if (pin) setHoveredPin(pin);
  });

  pinsLayer.addEventListener("pointerout", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;

    const pin = event.target.closest(".map-city");
    if (!pin || pin.contains(event.relatedTarget)) return;

    clearHoveredPin(pin);
  });

  picker.addEventListener("change", () => {
    const pin = pins.find((item) => item.dataset.city === picker.value) || null;
    setPickerPin(pin);
  });

  window.addEventListener(
    "resize",
    () => {
      const activePin = hoveredPin || pickerPin;
      if (activePin) positionTooltip(activePin);
    },
    { passive: true },
  );
}
