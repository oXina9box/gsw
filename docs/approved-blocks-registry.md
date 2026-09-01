# Approved Presentation Blocks & Component Registry

This document records the exact presentation blocks and layout components approved for Gem Studio's unauthenticated site and authentication flows, along with their mapped implementation files, props interfaces, and usage budgets.

---

## 1. Global Shell & Navigation Components

### 1.1 N5 Floating Pill Header / Navigation
- **File:** `web/components/shell/site-header-client.tsx` & `web/components/shell/site-header.tsx`
- **Origin:** N5 Floating Pill Navigation Standard
- **Features:**
  - Fixed top floating pill container (`rounded-full border border-border bg-surface/85 backdrop-blur-md`).
  - Brand Gem Studio logo component (`GemLogo`, width 110).
  - Monospaced, uppercase unauthenticated navigation links (`/studio`, `/system`, `/docs`, `/pricing`, `/portfolio`).
  - Interactive accent hovers: Cyan (`/studio`, `/system`), Lime (`/docs`), Amber (`/pricing`), Pink (`/portfolio`).
  - Desktop Auth actions (`Create Studio`, `Sign in`) and mobile dropdown menu with focus trapping and ESC support.
- **Budget:** Global Shell (Mounted on all unauthed & auth layouts).

### 1.2 Ft5 Statement Footer
- **File:** `web/components/shell/site-footer.tsx`
- **Origin:** Ft5 Statement Footer Standard
- **Features:**
  - Single-band statement typography layout (`font-display font-bold text-text clamp(1.9rem,4.5vw,3.6rem)`).
  - Hairline separator with meta row containing brand logo, inline footer navigation, and accessible social SVGs (Facebook, Instagram, Twitter/X, GitHub, Dribbble).
  - Server-side draft link gating (`SITE_CONTENT_APPROVED`) for `/core-values`, `/terms`, `/privacy`.
  - Monospaced copyright notice: `© 2026 Gem Studio™. All Rights Reserved.`
- **Budget:** Global Shell (Mounted on all marketing and product layouts).

---

## 2. Approved Marketing Content Sections

Located in `web/components/blocks/kometa/kometa-approved-sections.tsx` and `web/components/blocks/flowbite/flowbite-cta.tsx`:

### 2.1 Content Section 1 (`KometaC1Section` / C1)
- **Origin:** Kometa Content Block #1 (Redesigned)
- **Layout:** 12-column grid (5/7). Left: Badge + Syne title + lede + hairline-divided items with pink mono numbering `0X`, Syne titles, and muted descriptions. Right: Connected 3-image mosaic (1 hero + 2 thumbnails) with 1px borders and `rounded-md`.
- **Component:** `KometaC1Section`
- **Props:** `badge`, `badgeColor`, `title`, `lede`, `items: Array<{ title, description, icon? }>`, `images: { hero, small1, small2, alt? }`.
- **Usage:** 
  - `web/app/(marketing)/studio/page.tsx`
  - `web/app/(marketing)/portfolio/page.tsx`
  - `web/app/(marketing)/gallery/page.tsx`

### 2.2 Content Section 2 (`KometaC2Section` / C2)
- **Origin:** Kometa Content Block #2 (Redesigned)
- **Layout:** 2-column grid. Left: Syne title + lede + 2 card pills styled as `border-l-2 border-{accent} bg-surface-2 rounded-sm p-5`. Right: Single featured image with 1px border and `rounded-md`.
- **Component:** `KometaC2Section`
- **Props:** `title`, `lede`, `pill1: { title, description }`, `pill2: { title, description }`, `imageSrc`, `imageAlt?`, `highlightColor?`.
- **Usage:**
  - `web/app/(marketing)/page.tsx` (Landing Page)
  - `web/app/(marketing)/pricing/page.tsx`
  - `web/app/(marketing)/core-values/page.tsx`

### 2.3 Step Section (`KometaStepSection` / S1)
- **Origin:** Kometa Step Block (Redesigned)
- **Layout:** Connected 3-column cells (`grid md:grid-cols-3 gap-px bg-border border border-border rounded-md overflow-hidden`), each with pink mono step number `Step 0X`, Syne title, description, and mono link with `→`.
- **Component:** `KometaStepSection`
- **Props:** `badge?`, `title`, `lede?`, `steps: [KometaStepItem, KometaStepItem, KometaStepItem]`.
- **Usage:**
  - `web/app/(marketing)/page.tsx` (Landing Page)
  - `web/app/(marketing)/pricing/page.tsx`

### 2.4 Category Grid Section (`KometaF1Section` / F1)
- **Origin:** Kometa Feature Block #1 (Redesigned)
- **Layout:** Connected category grid (`gap-px bg-border border border-border rounded-md overflow-hidden`), circular icon badges, mono uppercase labels, and centered bottom CTA button.
- **Component:** `KometaF1Section`
- **Props:** `title`, `lede?`, `items: Array<{ label, icon?, href? }>`, `ctaHref?`, `ctaLabel?`.
- **Usage:**
  - `web/app/(marketing)/system/page.tsx`
  - `web/app/(marketing)/social-workshop/page.tsx`

### 2.5 Feature Cards Section (`KometaF2Section` / F2)
- **Origin:** Kometa Feature Block #2 (Redesigned)
- **Layout:** Connected 4-column card grid (`gap-px bg-border border border-border rounded-md overflow-hidden`), pink mono indexing `0X`, Syne title, description, pink checkmark lists, and bottom department links.
- **Component:** `KometaF2Section`
- **Props:** `heading`, `lede`, `cards: [KometaF2Card, KometaF2Card, KometaF2Card, KometaF2Card]`.
- **Usage:**
  - `web/app/(marketing)/studio/page.tsx`
  - `web/app/(marketing)/core-values/page.tsx`

### 2.6 Spotlight Cards Section (`KometaC3Section` / C3)
- **Origin:** Kometa Content Block #3 (Redesigned)
- **Layout:** 2-column cards (`border border-border rounded-md bg-surface-2 p-8 transition-colors hover:border-cyan`), Syne titles, descriptions, and translating mono `View →`.
- **Component:** `KometaC3Section`
- **Props:** `items: Array<{ title, description, href }>`.
- **Usage:**
  - `web/app/(marketing)/docs/page.tsx`
  - `web/app/(marketing)/pricing/page.tsx`
  - `web/app/(marketing)/social-workshop/page.tsx`

### 2.7 Diagonal Split Hero Section (`KometaC4Section` / C4)
- **Origin:** Kometa Content Block #4 (Redesigned)
- **Layout:** 50/50 split container (`border border-border rounded-md overflow-hidden bg-surface`). Left: Full-bleed image. Right: Badge + Syne title + description + primary pink pill button + secondary mono link.
- **Component:** `KometaC4Section`
- **Props:** `badge?`, `title`, `description`, `imageSrc`, `primaryCta`, `secondaryCta?`.
- **Usage:**
  - `web/app/(marketing)/studio/page.tsx`
  - `web/app/(marketing)/portfolio/page.tsx`
  - `web/app/(marketing)/gallery/page.tsx`

### 2.8 Staggered Hover Grid Section (`KometaC5Section` / C5)
- **Origin:** Kometa Content Block #5 (Redesigned)
- **Layout:** 4-card grid with left cyan border accent (`border-l-2 border-l-cyan border border-border bg-surface-2 p-6 rounded-sm`), vertical stagger via `md:translate-y-6`, and bottom CTA button.
- **Component:** `KometaC5Section`
- **Props:** `badge?`, `title`, `lede?`, `cards: [KometaC5Item, KometaC5Item, KometaC5Item, KometaC5Item]`, `ctaHref?`, `ctaLabel?`.
- **Usage:**
  - `web/app/(marketing)/system/page.tsx`
  - `web/app/(marketing)/docs/page.tsx`

### 2.9 Statement CTA Band (`FlowbiteCtaSection` / CTA1)
- **Origin:** Statement CTA Band Standard
- **Layout:** Full-width typography band (`border-y border-border bg-surface-2 px-4 py-20 text-center`) with clamp-sized Syne headline, muted description, and primary pink pill button.
- **Component:** `FlowbiteCtaSection`
- **Props:** `title`, `description`, `ctaHref`, `ctaLabel?`.
- **Usage:**
  - `web/app/(marketing)/page.tsx` (Landing Page)
  - `web/app/(marketing)/system/page.tsx`

---

## 3. Approved Social & Testimonial Blocks

Located in `web/components/blocks/preline/preline-vertical-marquee.tsx`:

### 3.1 Vertical Testimonial Marquee (`PrelineVerticalMarquee` / VM)
- **Origin:** Preline Vertical Marquee Block (Redesigned)
- **Layout:** Dual opposing vertical marquee columns driven by CSS `@keyframes marquee-up`, gradient edge masks, creator avatars, user handles, and verified quote cards with `rounded-sm` and `bg-surface-2`.
- **Component:** `PrelineVerticalMarquee`
- **Props:** `title?`, `subtitle?`, `column1: PrelineMarqueeItem[]`, `column2: PrelineMarqueeItem[]`.
- **Usage:**
  - `web/app/(marketing)/page.tsx` (Landing Page)

---

## 4. Approved Authentication & Onboarding Blocks

Located in `web/components/blocks/preline/preline-vertical-marquee.tsx` and `web/app/(auth)/`:

### 4.1 Split Auth Screen Layout (`PrelineSplitAuth` / AUTH-SPLIT)
- **Origin:** Preline Split Login Page (Redesigned)
- **Layout:** 12-column split card (`border border-border rounded-md bg-surface overflow-hidden`). Left (5 cols): Tagline badge + Syne heading + honest placeholder rows with `—` values. Right (7 cols): Title + subtitle + interactive auth form slot + footer helper links.
- **Component:** `PrelineSplitAuth`
- **Props:** `title`, `subtitle`, `sidebarTagline?`, `sidebarHeadline?`, `children`, `footer?`.
- **Usage:**
  - `web/app/(auth)/login/page.tsx`
  - `web/app/(auth)/reset-password/page.tsx`
  - `web/app/(auth)/forgot-password/page.tsx`
  - `web/app/(auth)/verify-email/page.tsx`
  - `web/app/(auth)/mfa/page.tsx`

### 4.2 Minimal 404 Error Screen
- **Origin:** Minimal 404 Screen Standard
- **Layout:** Centered error display with mono `404` badge, Syne headline, description, and primary pink button back to home.
- **Location:** `web/app/(marketing)/not-found.tsx`

---

## 5. Animation on Scroll Standard

- **CSS Keyframes:**
  - `@keyframes animationIn` in `web/app/globals.css`: `0%` (opacity 0, translateY 30px, blur 8px) to `100%` (opacity 1, translateY 0, blur 0).
  - `@keyframes marquee-up` in `web/app/globals.css`: `to { transform: translateY(-50%); }` for continuous seamless vertical marquee columns.
- **CSS Utility Classes:** `.animate-on-scroll` (paused by default, running when `.animate` is added).
- **Client Observer:** `web/components/marketing/marketing-effects.tsx` automatically registers all `.animate-on-scroll` elements via `IntersectionObserver` (`threshold: 0.15`, `rootMargin: 0px 0px -10% 0px`), respecting `prefers-reduced-motion`.
