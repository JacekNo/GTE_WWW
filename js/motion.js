(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const hero = document.querySelector('.hero');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-nav');
  const maps = [...document.querySelectorAll('[data-map]')];
  document.documentElement.classList.add('has-js');

  const setupMapInteractions = (map) => {
    const cities = [...map.querySelectorAll('.map-city')];
    const tooltip = map.querySelector('[data-map-tooltip]');
    const tooltipLabel = map.querySelector('[data-map-tooltip-label]');

    if (!cities.length || !tooltip || !tooltipLabel) return;

    let selectedCity = null;
    let highlightedCity = null;
    const pickerLabel = document.createElement('label');
    pickerLabel.className = 'map-picker';
    pickerLabel.textContent = 'Wybierz miasto na mapie';
    const picker = document.createElement('select');
    picker.add(new Option('Wybierz miasto', ''));
    cities.forEach((city) => picker.add(new Option(city.dataset.city, city.dataset.city)));
    pickerLabel.append(picker);
    map.append(pickerLabel);

    const setMapState = () => {
      map.classList.toggle('has-active-city', Boolean(highlightedCity || selectedCity));
      picker.value = selectedCity?.dataset.city || '';
    };

    const positionTooltip = (city) => {
      const pin = city.querySelector('.map-city__pin');
      if (!pin) return;

      const mapRect = map.getBoundingClientRect();
      const pinRect = pin.getBoundingClientRect();
      const rawX = pinRect.left + pinRect.width / 2 - mapRect.left;
      const rawY = pinRect.top + pinRect.height / 2 - mapRect.top;

      tooltip.style.setProperty('--tooltip-x', `${rawX}px`);
      tooltip.style.setProperty('--tooltip-y', `${rawY}px`);
      tooltip.classList.remove('is-below');

      window.requestAnimationFrame(() => {
        const tooltipRect = tooltip.getBoundingClientRect();
        const horizontalPad = 8;
        const halfWidth = tooltipRect.width / 2;
        const clampedX = Math.min(
          Math.max(rawX, halfWidth + horizontalPad),
          mapRect.width - halfWidth - horizontalPad,
        );

        tooltip.style.setProperty('--tooltip-x', `${clampedX}px`);

        if (rawY < tooltipRect.height + 24) {
          tooltip.classList.add('is-below');
        }
      });
    };

    const showTooltip = (city) => {
      const label = city.dataset.city;
      if (!label) return;

      tooltipLabel.textContent = label;
      cities.forEach((item) => item.removeAttribute('aria-describedby'));
      city.setAttribute('aria-describedby', tooltip.id);
      tooltip.classList.add('is-visible');
      tooltip.setAttribute('aria-hidden', 'false');
      positionTooltip(city);
    };

    const hideTooltip = () => {
      tooltip.classList.remove('is-visible', 'is-below');
      tooltip.setAttribute('aria-hidden', 'true');
      cities.forEach((item) => item.removeAttribute('aria-describedby'));
    };

    const highlightCity = (city) => {
      if (highlightedCity && highlightedCity !== city) {
        highlightedCity.classList.remove('is-highlighted');
      }

      highlightedCity = city;
      city?.classList.add('is-highlighted');
      setMapState();

      if (city) showTooltip(city);
    };

    const clearHighlight = (city) => {
      if (city && highlightedCity !== city) return;

      highlightedCity?.classList.remove('is-highlighted');
      highlightedCity = null;
      setMapState();

      if (selectedCity) {
        showTooltip(selectedCity);
      } else {
        hideTooltip();
      }
    };

    const selectCity = (city) => {
      const willSelect = selectedCity !== city;

      cities.forEach((item) => {
        item.classList.remove('is-selected');
        item.setAttribute('aria-pressed', 'false');
      });

      selectedCity = willSelect ? city : null;

      if (selectedCity) {
        selectedCity.classList.add('is-selected');
        selectedCity.setAttribute('aria-pressed', 'true');
        showTooltip(selectedCity);
      } else if (highlightedCity) {
        showTooltip(highlightedCity);
      } else {
        hideTooltip();
      }

      setMapState();
    };

    picker.addEventListener('change', () => {
      highlightedCity?.classList.remove('is-highlighted');
      highlightedCity = null;
      selectCity(cities.find((city) => city.dataset.city === picker.value) || null);
    });

    cities.forEach((city, index) => {
      city.addEventListener('mouseenter', () => highlightCity(city));
      city.addEventListener('mouseleave', () => clearHighlight(city));
      city.addEventListener('focus', () => highlightCity(city));
      city.addEventListener('blur', () => clearHighlight(city));
      city.addEventListener('click', (event) => {
        event.stopPropagation();
        selectCity(city);
      });
      city.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectCity(city);
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          if (selectedCity) selectCity(selectedCity);
          clearHighlight();
          city.blur();
        }
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (step) {
          event.preventDefault();
          cities[(index + step + cities.length) % cities.length].focus();
        }
      });
    });

    map.addEventListener('click', (event) => {
      if (event.target.closest('.map-city, .map-picker')) return;
      if (selectedCity) selectCity(selectedCity);
    });

    window.addEventListener('resize', () => {
      const city = highlightedCity || selectedCity;
      if (city) positionTooltip(city);
    }, { passive: true });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (selectedCity) selectCity(selectedCity);
      clearHighlight();
    });
  };

  maps.forEach(setupMapInteractions);

  const syncHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 32);
  };

  const closeMenu = (restoreFocus = false) => {
    const wasOpen = menuButton?.getAttribute('aria-expanded') === 'true';
    menuButton?.setAttribute('aria-expanded', 'false');
    navigation?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    if (restoreFocus && wasOpen) menuButton.focus();
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    navigation?.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    closeMenu();
    const destination = document.querySelector(link.hash);
    destination?.setAttribute('tabindex', '-1');
    destination?.focus({ preventScroll: true });
  }));

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu(true);
    if (event.key === 'Tab' && menuButton?.getAttribute('aria-expanded') === 'true') {
      const lastLink = navigation.querySelector('a:last-child');
      if (event.shiftKey && document.activeElement === menuButton) {
        event.preventDefault();
        lastLink.focus();
      } else if (!event.shiftKey && document.activeElement === lastLink) {
        event.preventDefault();
        menuButton.focus();
      }
    }
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      syncHeader();
      scrollTicking = false;
    });
  }, { passive: true });

  syncHeader();

  if (reduceMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
    document.querySelector('[data-map]')?.classList.add('is-active');
    hero?.classList.add('is-ready');
    return;
  }

  document.documentElement.classList.add('has-motion');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));

  const momentObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-active');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -18% 0px', threshold: 0.18 });

  document.querySelectorAll('[data-map]').forEach((element) => momentObserver.observe(element));

  window.requestAnimationFrame(() => {
    hero?.classList.add('is-ready');
    hero?.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
  });
})();
