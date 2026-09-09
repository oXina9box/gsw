"use client";

import { useState } from "react";
import Image from "next/image";
import { MotionController } from "./motion-controller";
import styles from "./landing-page.module.css";

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
    alt: "An astronaut exploring a derelict space station",
  },
  {
    id: "ember",
    category: "Fantasy",
    title: "Where embers wake",
    description: "Some worlds refuse to stay imaginary.",
    image: "/assets/landing/ember.webp",
    alt: "A torch-bearing rider facing an enormous ember dragon",
  },
  {
    id: "stage",
    category: "Virtual production",
    title: "The world is a stage",
    description: "Every great universe starts with a point of view.",
    image: "/assets/landing/stage.webp",
    alt: "A lone figure on an illuminated virtual production stage",
  },
];

export function WorldsGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeScene = scenes[activeIndex];

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.galleryControlsBar}>
        <MotionController />
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
