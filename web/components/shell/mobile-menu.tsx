"use client";

import { useEffect } from "react";

export function MobileMenuController() {
  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>(".menu-toggle");
    const nav = document.querySelector<HTMLElement>(".main-nav");
    if (!button || !nav) return;
    const toggle = () => { const open = nav.classList.toggle("is-open"); button.setAttribute("aria-expanded", String(open)); button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation"); };
    button.addEventListener("click", toggle);
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => nav.classList.remove("is-open")));
    return () => button.removeEventListener("click", toggle);
  }, []);
  return null;
}
