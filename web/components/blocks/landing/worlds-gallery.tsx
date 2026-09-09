"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import Image from "next/image";
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

interface Scene {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  alt: string;
}

const scenes: Scene[] = [
  {
    id: "orbit",
    category: "Science fiction",
    title: "Beyond the signal",
    description: "At the edge of everything we know.",
    image: "/assets/landing/orbit.webp",
    alt: "Deep orbital space station against an atmospheric planet horizon",
  },
  {
    id: "ember",
    category: "Fantasy",
    title: "Where embers wake",
    description: "Some worlds refuse to stay imaginary.",
    image: "/assets/landing/ember.webp",
    alt: "Glowing embers and mystical spires rising through ancient mist",
  },
  {
    id: "stage",
    category: "Virtual production",
    title: "The world is a stage",
    description: "Every great universe starts with a point of view.",
    image: "/assets/landing/stage.webp",
    alt: "Futuristic virtual production stage with volumetric lighting",
  },
];

interface WorldsGalleryProps {
  onMotionChange?: (paused: boolean) => void;
}

export function WorldsGallery({ onMotionChange }: WorldsGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [manualPaused, setManualPaused] = useState<boolean | null>(null);

  const paused = manualPaused !== null ? manualPaused : prefersReduced;

  const togglePause = useCallback(() => {
    const next = !paused;
    setManualPaused(next);
    onMotionChange?.(next);
  }, [paused, onMotionChange]);
  const activeScene = scenes[activeIndex];

  return (
    <div className={`${styles.galleryContainer} ${paused ? styles.galleryPaused : ""}`}>
      <div className={styles.galleryControlsBar}>
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
      </div>

      <div className={styles.stageFrame}>
        <div className={styles.stageImageWrapper}>
          <Image
            src={activeScene.image}
            alt={activeScene.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1120px"
            className={styles.stageImage}
            priority={false}
          />
          <div className={styles.stageOverlay} />
        </div>

        <div className={styles.stageCaptionArea} aria-live="polite" aria-atomic="true">
          <span className={styles.sceneCategory}>{activeScene.category}</span>
          <h3 className={styles.sceneTitle}>{activeScene.title}</h3>
          <p className={styles.sceneDescription}>{activeScene.description}</p>
        </div>
      </div>

      <div
        role="group"
        aria-label="Choose a concept world"
        className={styles.sceneSelectorGroup}
      >
        {scenes.map((scene, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <button
              key={scene.id}
              type="button"
              className={`${styles.sceneTabButton} ${isSelected ? styles.sceneTabActive : ""}`}
              onClick={() => setActiveIndex(idx)}
              aria-pressed={isSelected}
            >
              <span className={styles.sceneTabNumber}>0{idx + 1}</span>
              <span className={styles.sceneTabCategory}>{scene.category}</span>
              <span className={styles.sceneTabTitle}>{scene.title}</span>
            </button>
          );
        })}
      </div>

      <p className={styles.disclaimerNote}>
        Visual explorations, not released Gem Studio productions.
      </p>
    </div>
  );
}
