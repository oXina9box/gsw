import Link from "next/link";
import Image from "next/image";
import { EntryActions } from "@/components/marketing/entry-actions";
import { WorldsGallery } from "./worlds-gallery";
import styles from "./landing-page.module.css";

const departments = [
  {
    number: "01",
    tag: "01 / DEVELOP",
    name: "DEVELOP",
    title: "Find the story.",
    symbol: "✳",
    accentVar: "var(--color-pink)",
    summary:
      "Turn a spark into a narrative. Shape the beats, write the scene, and find the voice that makes it yours.",
    tags: "STORY / SCRIPT / STORYBOARD",
    link: "/studio",
    linkText: "Explore Studio",
  },
  {
    number: "02",
    tag: "02 / BUILD",
    name: "BUILD",
    title: "Make a world.",
    symbol: "◇",
    accentVar: "var(--color-cyan)",
    summary:
      "Create characters with depth and places with a past. Give every detail a reason to be there.",
    tags: "CHARACTER / LOCATION / DESIGN",
    link: "/studio",
    linkText: "Explore Creative",
  },
  {
    number: "03",
    tag: "03 / DIRECT",
    name: "DIRECT",
    title: "Chase the feeling.",
    symbol: "⌖",
    accentVar: "var(--color-lime)",
    summary:
      "Frame the moment. Explore light, movement, and performance until the picture matches your vision.",
    tags: "COMPOSITION / MOTION / SCENE",
    link: "/system",
    linkText: "Explore System",
  },
  {
    number: "04",
    tag: "04 / FINISH",
    name: "FINISH",
    title: "Bring it together.",
    symbol: "≋",
    accentVar: "var(--color-amber)",
    summary:
      "Find the rhythm in the edit. Add sound, color, and the finishing touches that make a story land.",
    tags: "EDIT / SOUND / COLOR",
    link: "/social-workshop",
    linkText: "Explore Workshop",
  },
];

const tickerItems = [
  "STORY",
  "CHARACTER",
  "WORLD",
  "MOTION",
  "SOUND",
  "IMAGINATION",
];

export function LandingExperience() {
  return (
    <div data-landing-root className={styles.landingRoot}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection} aria-label="Introduction">
        <div className={styles.heroBackdrop}>
          <Image
            src="/assets/landing/stage.webp"
            alt="A lone figure facing an illuminated virtual production stage"
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>
            <span aria-hidden="true">◇</span> INDEPENDENT IMAGINATION. AMPLIFIED.
          </div>
          <h1 className={styles.heroTitle}>
            MAKE THE<br />
            <span className={styles.heroTitleHighlight}>UNREAL.</span>
            <span className={styles.titleStar} aria-hidden="true">✳</span>
          </h1>
          <div className={styles.heroBottom}>
            <p className={styles.heroSubtitle}>
              Your story. Your universe. Your rules.<br />
              A new creative frontier, powered by AI.<br />
              <strong>Welcome to Gem Studio.</strong>
            </p>
            <div className={styles.heroActionsGroup}>
              <EntryActions />
              <Link href="#worlds" className={styles.secondaryExploreLink}>
                Enter the imagination &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TICKER RIBBON */}
      <div className={styles.tickerTrack} aria-hidden="true">
        <div className={styles.tickerContent}>
          {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className={styles.tickerItem}>
              {item} <span className={styles.tickerBullet} aria-hidden="true">✳</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. VISION SECTION */}
      <section id="vision" className={styles.visionSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>
            <span>01 / THE VISION</span>
            <span className={styles.labelAccent}>HUMAN VISION. EXPANDED.</span>
          </div>
          <div className={styles.visionGrid}>
            <h2 className={styles.visionHeading}>
              BIG IDEAS.<br />
              NO SMALL<br />
              <span className={styles.textOutline}>THINKING.</span>
            </h2>
            <div className={styles.visionCopy}>
              <span className={styles.asterisk} aria-hidden="true">✳</span>
              <p className={styles.visionLarge}>
                That scene in your head?<br />
                Give it somewhere to exist.
              </p>
              <p>
                Gem Studio is being built for the stories that won&apos;t leave you alone. The characters
                you haven&apos;t met yet. The worlds that don&apos;t exist. Until you make them.
              </p>
              <p>
                A connected creative space for turning raw imagination into something you can see,
                feel, and share.
              </p>
              <Link href="#studio" className={styles.visionTextLink}>
                Meet your creative playground &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORLDS GALLERY SECTION */}
      <section id="worlds" className={styles.worldsSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>
            <span>02 / WORLDS WITHOUT LIMITS</span>
            <span>CONCEPT GALLERY</span>
          </div>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>
              WHAT IF<br />
              <span className={styles.labelAccent}>BECAME REAL?</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              A glimpse of the possibilities.<br />
              Concept frames. Open-ended imagination.
            </p>
          </div>
          <WorldsGallery />
        </div>
      </section>

      {/* 5. CONNECTED STUDIO / DEPARTMENTS */}
      <section id="studio" className={styles.studioSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>
            <span>03 / THE CREATIVE SPACE</span>
            <span className={styles.labelAccentGreen}>FROM FIRST SPARK TO FINAL FRAME</span>
          </div>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>
              ONE VISION.<br />
              <span className={styles.textOutline}>EVERY DIMENSION.</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              The creative journey we&apos;re bringing together.<br />
              You stay in the director&apos;s chair.
            </p>
          </div>

          <div className={styles.departmentGrid}>
            {departments.map((dept) => (
              <article
                key={dept.number}
                className={styles.departmentCard}
                style={{ "--dept-accent": dept.accentVar } as React.CSSProperties}
              >
                <div className={styles.deptCardHeader}>
                  <span className={styles.deptTag}>{dept.tag}</span>
                  <span className={styles.deptSymbol} aria-hidden="true">{dept.symbol}</span>
                </div>
                <h3 className={styles.deptCardTitle}>{dept.title}</h3>
                <p className={styles.deptSummary}>{dept.summary}</p>
                <div className={styles.deptTagsList}>{dept.tags}</div>
                <Link href={dept.link} className={styles.deptLink}>
                  {dept.linkText} &rarr;
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINALE SECTION */}
      <section id="next" className={styles.finaleSection}>
        <div className={styles.finaleInner}>
          <div className={styles.finaleTop}>
            <span>GEM STUDIO / COMING INTO FOCUS</span>
            <span>THE STORY IS JUST BEGINNING.</span>
          </div>
          <p className={styles.finaleLead}>For the beautifully impossible.</p>
          <h2 className={styles.finaleTitle}>
            YOUR NEXT<br />
            <span>OBSESSION.</span>
          </h2>
          <div className={styles.finaleBottom}>
            <p className={styles.finaleSubtitle}>
              We&apos;re building the space.<br />
              You bring the imagination.
            </p>
            <div className={styles.finaleActions}>
              <EntryActions />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
