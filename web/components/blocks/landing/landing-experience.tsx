import Link from "next/link";
import Image from "next/image";
import { EntryActions } from "@/components/marketing/entry-actions";
import { WorldsGallery } from "./worlds-gallery";
import styles from "./landing-page.module.css";

const departments = [
  {
    number: "01",
    name: "Marketing",
    role: "Direction & Campaign Strategy",
    summary:
      "Turn loose intentions into concrete creative briefs, audience signals, and release plans that keep productions focused.",
    link: "/studio",
    linkText: "Explore Studio",
  },
  {
    number: "02",
    name: "Creative",
    role: "Worlds & Style Systems",
    summary:
      "Establish coherent visual lore, aesthetic DNA continuity, character definitions, and design constraints across all scenes.",
    link: "/studio",
    linkText: "Explore Creative",
  },
  {
    number: "03",
    name: "Production",
    role: "Pipeline & Media Assembly",
    summary:
      "Execute multi-stage generation, shot-level GenPlay contracts, approvals, and unified media stitching with human oversight.",
    link: "/system",
    linkText: "Explore System",
  },
  {
    number: "04",
    name: "Social Workshop",
    role: "Variants & Audience Feedback",
    summary:
      "Generate platform-native cuts, measure genuine audience engagement, and feed organic signals directly back into pre-production.",
    link: "/social-workshop",
    linkText: "Explore Workshop",
  },
];

const tickerItems = [
  "WORLD ENGINE",
  "PERSISTENT DNA",
  "CONNECTED DEPARTMENTS",
  "GENPLAY CONTRACTS",
  "CONTINUITY LEDGER",
  "PLATFORM-NATIVE CUTS",
];

export function LandingExperience() {
  return (
    <div className={styles.landingRoot}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection} aria-label="Introduction">
        <div className={styles.heroBackdrop}>
          <Image
            src="/assets/landing/stage.webp"
            alt="Cinematic production stage"
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow}>AI FILM STUDIO FOR SOLO CREATORS</span>
          <h1 className={styles.heroTitle}>
            MAKE THE <span className={styles.heroTitleOutline}>UNREAL.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            A connected studio for impossible stories. Ideate, worldbuild, generate, and distribute
            cinematic visions from a single creative floor.
          </p>

          <div className={styles.heroActionsGroup}>
            <EntryActions />
            <Link href="#worlds" className={styles.secondaryExploreLink}>
              Explore worlds &darr;
            </Link>
          </div>
        </div>
      </section>

      {/* 2. TICKER RIBBON */}
      <div className={styles.tickerTrack} aria-hidden="true">
        <div className={styles.tickerContent}>
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className={styles.tickerItem}>
              {item} <span className={styles.tickerBullet} aria-hidden="true">&bull;</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. VISION SECTION */}
      <section id="vision" className={styles.visionSection}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionEyebrow}>VISION</span>
          <h2 className={styles.sectionTitle}>BIG IDEAS. NO SMALL THINKING.</h2>
          <p className={styles.visionBody}>
            Great cinema has never been about tool count—it is about vision, consistency, and point
            of view. Gem Studio replaces disconnected prompts and fragmented workflows with an
            integrated studio pipeline. Every character, prop, and location retains its continuous
            identity across every frame.
          </p>
        </div>
      </section>

      {/* 4. WORLDS GALLERY SECTION */}
      <section id="worlds" className={styles.worldsSection}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionEyebrow}>CONCEPT VAULT</span>
          <h2 className={styles.sectionTitle}>WORLDS IN MOTION</h2>
          <p className={styles.sectionSubtitle}>
            Sample the aesthetic breadth made possible through unified DNA contracts and shot choreography.
          </p>
          <WorldsGallery />
        </div>
      </section>

      {/* 5. CONNECTED STUDIO / DEPARTMENTS */}
      <section id="studio" className={styles.studioSection}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionEyebrow}>CONNECTED CREATIVE FLOOR</span>
          <h2 className={styles.sectionTitle}>FOUR DEPARTMENTS. ONE TIMELINE.</h2>
          <p className={styles.sectionSubtitle}>
            Everything from initial market signals to the final platform cut runs through synchronized departments.
          </p>

          <div className={styles.departmentGrid}>
            {departments.map((dept) => (
              <div key={dept.number} className={styles.departmentCard}>
                <div className={styles.deptCardHeader}>
                  <span className={styles.deptNumber}>{dept.number}</span>
                  <h3 className={styles.deptName}>{dept.name}</h3>
                </div>
                <div className={styles.deptRole}>{dept.role}</div>
                <p className={styles.deptSummary}>{dept.summary}</p>
                <Link href={dept.link} className={styles.deptLink}>
                  {dept.linkText} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINALE SECTION */}
      <section id="next" className={styles.finaleSection}>
        <div className={styles.finaleInner}>
          <span className={styles.finaleEyebrow}>START CREATING</span>
          <h2 className={styles.finaleTitle}>YOUR NEXT OBSESSION.</h2>
          <p className={styles.finaleSubtitle}>
            Step onto the floor. Build your studio, define your lore, and direct films that refuse to stay imaginary.
          </p>
          <div className={styles.finaleActions}>
            <EntryActions />
          </div>
        </div>
      </section>
    </div>
  );
}
