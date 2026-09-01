"use client";

import { useEffect } from "react";

export function MarketingEffects() {
  useEffect(() => {
    const SELECTOR = ".animate-on-scroll, .reveal-on-scroll";
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const activate = (el: HTMLElement) => el.classList.add("animate", "is-visible");

    const revealIfVisible = (el: HTMLElement, observer: IntersectionObserver) => {
      if (prefersReduced) {
        activate(el);
        return;
      }
      observer.observe(el);
    };

    if (prefersReduced) {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach(activate);
      // ponytail: MutationObserver still needed for late-mounted content even with reduced-motion
      const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of Array.from(m.addedNodes)) {
            if (!(node instanceof HTMLElement)) continue;
            if (node.matches(SELECTOR)) activate(node);
            node.querySelectorAll<HTMLElement>(SELECTOR).forEach(activate);
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add("animate", "is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "50px 0px 50px 0px" });

    // initial scan
    document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => revealIfVisible(el, observer));

    // ponytail: catch client-nav + Suspense-streamed nodes that mount after initial scan
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of Array.from(m.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches(SELECTOR)) revealIfVisible(node, observer);
          node.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => revealIfVisible(el, observer));
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
