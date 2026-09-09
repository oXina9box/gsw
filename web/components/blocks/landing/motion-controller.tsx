"use client";

import { useState, useSyncExternalStore, useCallback, useEffect } from "react";
import styles from "./landing-page.module.css";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function MotionController() {
  const prefersReduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [manualPaused, setManualPaused] = useState<boolean | null>(null);

  const paused = manualPaused !== null ? manualPaused : prefersReduced;

  useEffect(() => {
    const root = document.querySelector("[data-landing-root]");
    if (root) {
      if (paused) {
        root.classList.add(styles.landingPaused);
      } else {
        root.classList.remove(styles.landingPaused);
      }
    }
  }, [paused]);

  const togglePause = useCallback(() => {
    setManualPaused((prev) => {
      const current = prev !== null ? prev : prefersReduced;
      return !current;
    });
  }, [prefersReduced]);

  return (
    <div className={styles.motionToggleWrapper}>
      <button
        type="button"
        className={styles.motionButton}
        onClick={togglePause}
        aria-pressed={paused}
        aria-label={paused ? "Resume ambient motion" : "Pause ambient motion"}
      >
        <span className={styles.motionIndicator} aria-hidden="true" />
        <span>{paused ? "Resume ambient motion" : "Pause ambient motion"}</span>
      </button>
    </div>
  );
}
