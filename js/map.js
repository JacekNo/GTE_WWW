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
    const button = document.createElement("button");
    const xPercent = (city.x / MAP_VIEWBOX.width) * 100;
    const yPercent = (city.y / MAP_VIEWBOX.height) * 100;
    const scatter =
      (index * 137 + Math.round(city.x * 0.8) + Math.round(city.y * 0.35)) %
      720;
    const delay = 140 + scatter;

    button.type = "button";
    button.className = "map-city";
    button.dataset.city = city.name;
    button.setAttribute("aria-label", city.name);
    button.setAttribute("aria-pressed", "false");
    button.tabIndex = index === 0 ? 0 : -1;
    button.style.setProperty("--x", `${xPercent.toFixed(4)}%`);
    button.style.setProperty("--y", `${yPercent.toFixed(4)}%`);
    button.style.setProperty("--city-delay", `${delay}ms`);
    button.innerHTML = PIN_SVG;

    pinsLayer.append(button);
    picker.add(new Option(city.name, city.name));

    return button;
  });

  let selectedPin = null;
  let transientPin = null;

  const setRovingTabIndex = (activePin) => {
    pins.forEach((pin) => {
      pin.tabIndex = pin === activePin ? 0 : -1;
    });
  };

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
    pins.forEach((item) => item.removeAttribute("aria-describedby"));
    pin.setAttribute("aria-describedby", tooltip.id);
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    positionTooltip(pin);
  };

  const hideTooltip = () => {
    tooltip.classList.remove("is-visible", "is-below");
    tooltip.setAttribute("aria-hidden", "true");
    pins.forEach((item) => item.removeAttribute("aria-describedby"));
  };

  const refreshTooltip = () => {
    const activePin = transientPin || selectedPin;
    if (activePin) showTooltip(activePin);
    else hideTooltip();
  };

  const setTransientPin = (pin) => {
    if (transientPin && transientPin !== pin) {
      transientPin.classList.remove("is-highlighted");
    }

    transientPin = pin;
    transientPin?.classList.add("is-highlighted");
    refreshTooltip();
  };

  const clearTransientPin = (pin = null) => {
    if (pin && transientPin !== pin) return;

    transientPin?.classList.remove("is-highlighted");
    transientPin = null;
    refreshTooltip();
  };

  const selectPin = (pin) => {
    const nextPin = selectedPin === pin ? null : pin;

    selectedPin?.classList.remove("is-selected");
    selectedPin?.setAttribute("aria-pressed", "false");

    selectedPin = nextPin;

    if (selectedPin) {
      selectedPin.classList.add("is-selected");
      selectedPin.setAttribute("aria-pressed", "true");
      picker.value = selectedPin.dataset.city;
      setRovingTabIndex(selectedPin);
    } else {
      picker.value = "";
    }

    refreshTooltip();
  };

  pinsLayer.addEventListener("pointerover", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    const pin = event.target.closest(".map-city");
    if (pin) setTransientPin(pin);
  });

  pinsLayer.addEventListener("pointerout", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    const pin = event.target.closest(".map-city");
    if (!pin || pin.contains(event.relatedTarget)) return;
    clearTransientPin(pin);
  });

  pinsLayer.addEventListener("focusin", (event) => {
    const pin = event.target.closest(".map-city");
    if (!pin) return;
    setRovingTabIndex(pin);
    setTransientPin(pin);
  });

  pinsLayer.addEventListener("focusout", (event) => {
    const pin = event.target.closest(".map-city");
    if (!pin) return;
    clearTransientPin(pin);
  });

  pinsLayer.addEventListener("click", (event) => {
    const pin = event.target.closest(".map-city");
    if (!pin) return;
    selectPin(pin);
  });

  pinsLayer.addEventListener("keydown", (event) => {
    const currentPin = event.target.closest(".map-city");
    if (!currentPin) return;

    const currentIndex = pins.indexOf(currentPin);
    const step = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    }[event.key];

    if (step) {
      event.preventDefault();
      const nextIndex = (currentIndex + step + pins.length) % pins.length;
      setRovingTabIndex(pins[nextIndex]);
      pins[nextIndex].focus();
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const targetPin = event.key === "Home" ? pins[0] : pins.at(-1);
      setRovingTabIndex(targetPin);
      targetPin.focus();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (selectedPin) selectPin(selectedPin);
      clearTransientPin();
    }
  });

  picker.addEventListener("change", () => {
    const pin = pins.find((item) => item.dataset.city === picker.value) || null;

    if (!pin) {
      if (selectedPin) selectPin(selectedPin);
      return;
    }

    if (selectedPin !== pin) selectPin(pin);
    showTooltip(pin);
  });

  map.addEventListener("click", (event) => {
    if (event.target.closest(".map-city, .map-picker")) return;
    if (selectedPin) selectPin(selectedPin);
  });

  window.addEventListener(
    "resize",
    () => {
      const activePin = transientPin || selectedPin;
      if (activePin) positionTooltip(activePin);
    },
    { passive: true },
  );
}
