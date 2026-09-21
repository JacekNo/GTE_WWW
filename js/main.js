import { setupMap } from "./map.js";

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
const navLinks = navigation ? [...navigation.querySelectorAll('a[href^="#"]')] : [];
const sectionsByNav = navLinks
  .map((link) => ({ link, section: document.querySelector(link.hash) }))
  .filter(({ section }) => section);
const maps = [...document.querySelectorAll("[data-map]")];

root.classList.add("has-js");
maps.forEach(setupMap);

function syncHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 32);
}

function closeMenu({ restoreFocus = false } = {}) {
  const wasOpen = menuButton?.getAttribute("aria-expanded") === "true";

  menuButton?.setAttribute("aria-expanded", "false");
  navigation?.classList.remove("is-open");
  document.body.classList.remove("menu-open");

  if (restoreFocus && wasOpen) menuButton?.focus();
}

function setupNavigation() {
  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    const nextOpen = !isOpen;

    menuButton.setAttribute("aria-expanded", String(nextOpen));
    navigation?.classList.toggle("is-open", nextOpen);
    document.body.classList.toggle("menu-open", nextOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();

      const destination = document.querySelector(link.hash);
      if (!destination) return;

      destination.setAttribute("tabindex", "-1");
      destination.focus({ preventScroll: true });
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu({ restoreFocus: true });
      return;
    }

    if (
      event.key !== "Tab" ||
      menuButton?.getAttribute("aria-expanded") !== "true" ||
      !navigation
    ) {
      return;
    }

    const lastLink = navigation.querySelector("a:last-child");
    if (!lastLink) return;

    if (event.shiftKey && document.activeElement === menuButton) {
      event.preventDefault();
      lastLink.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault();
      menuButton.focus();
    }
  });

  window.matchMedia("(min-width: 801px)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
}

function setupScrollSpy() {
  if (!("IntersectionObserver" in window) || !sectionsByNav.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const activeItem = sectionsByNav.find(
        ({ section }) => section === visible.target,
      );

      navLinks.forEach((link) => {
        const isActive = link === activeItem?.link;
        link.classList.toggle("is-active", isActive);

        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    {
      rootMargin: "-30% 0px -55% 0px",
      threshold: 0,
    },
  );

  sectionsByNav.forEach(({ section }) => observer.observe(section));
}

function setupHeaderScrollState() {
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        syncHeader();
        ticking = false;
      });
    },
    { passive: true },
  );

  syncHeader();
}

function setupMotion() {
  const revealElements = [...document.querySelectorAll("[data-reveal]")];

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    maps.forEach((map) => map.classList.add("is-active"));
    return;
  }

  root.classList.add("has-motion");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));

  const mapObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-active");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -18% 0px", threshold: 0.18 },
  );

  maps.forEach((map) => mapObserver.observe(map));
}

setupNavigation();
setupScrollSpy();
setupHeaderScrollState();
setupMotion();
