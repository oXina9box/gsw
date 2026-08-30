"use client";

import { useEffect } from "react";

export function MarketingEffects() {
  useEffect(() => {
    const scrollElements = document.querySelectorAll<HTMLElement>(".animate-on-scroll, .reveal-on-scroll");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      scrollElements.forEach((el) => {
        el.classList.add("animate", "is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate", "is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

    scrollElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
