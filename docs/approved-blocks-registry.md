# Approved Presentation Blocks & Component Registry

This document records the exact presentation blocks and layout components approved for Gem Studio's unauthenticated site and authentication flows, along with their mapped implementation files, props interfaces, and usage budgets.

---

## 1. Global Shell & Navigation Components

### 1.1 Kometa Dark Header / Navigation
- **File:** `web/components/shell/site-header-client.tsx` & `web/components/shell/site-header.tsx`
- **Origin:** Kitwind Kometa Navbar
- **Features:** 
  - Responsive desktop and mobile drawer navigation with focus trapping and ESC support.
  - Brand Gem Studio Logo component (`GemLogo`).
  - Unauthenticated navigation links (`/studio`, `/system`, `/docs`, `/pricing`, `/portfolio`).
  - Interactive accent hovers: Cyan (`/studio`, `/system`), Lime (`/docs`), Amber (`/pricing`), Pink (`/portfolio`).
  - Auth CTA triggers (`Create Studio`, `Sign in`) opening direct flows / modals.
- **Budget:** Global Shell (Mounted on all unauthed & auth layouts).

### 1.2 Flowbite Unauthed Footer
- **File:** `web/components/shell/site-footer.tsx`
- **Origin:** Flowbite Footer Block
- **Features:**
  - 3-column responsive link structure: **Explore**, **Resources**, **Legal**.
  - Brand Gem Studio logo with copyright notice.
  - Social icon links (Facebook, Instagram, Twitter/X, GitHub, Dribbble) with accessibility labels and SVG icons.
  - Stripped of all authenticated `/app` routes for consistent public display.
- **Budget:** Global Shell (Mounted on all marketing and product layouts).

---

## 2. Approved Marketing Content Sections

Located in `web/components/blocks/kometa/kometa-approved-sections.tsx` and `web/components/blocks/flowbite/flowbite-cta.tsx`:

### 2.1 Content Section 1 (`KometaC1Section` / C1)
- **Origin:** Kometa Content Block #1
- **Layout:** 2-column grid. Left: Badge + title + lede + 3 stacked bullet items with circular icon badges and divider rules. Right: 3-image mosaic (1 full-width hero image + 2 side-by-side thumbnails).
- **Component:** `KometaC1Section`
- **Props:** `badge`, `badgeColor`, `title`, `lede`, `items: Array<{ title, description, icon? }>`, `images: { hero, small1, small2, alt? }`.
- **Usage:** 
  - `web/app/(marketing)/studio/page.tsx`
  - `web/app/(marketing)/portfolio/page.tsx`
  - `web/app/(marketing)/gallery/page.tsx`

### 2.2 Content Section 2 (`KometaC2Section` / C2)
- **Origin:** Kometa Content Block #2
- **Layout:** 2-column grid. Left: Heading + lede text + 2 card pills with left accent border. Right: Single large featured media/image.
- **Component:** `KometaC2Section`
- **Props:** `title`, `lede`, `pill1: { title, description }`, `pill2: { title, description }`, `imageSrc`, `imageAlt?`, `highlightColor?`.
- **Usage:**
  - `web/app/(marketing)/page.tsx` (Landing Page)
  - `web/app/(marketing)/pricing/page.tsx`
  - `web/app/(marketing)/core-values/page.tsx`

### 2.3 Step Section (`KometaStepSection` / S1)
- **Origin:** Kometa Step Block
- **Layout:** 3-column horizontal/vertical sequential cards with numbered circular step indicators (`01`, `02`, `03`), descriptions, action links, and horizontal connecting arrows on desktop.
- **Component:** `KometaStepSection`
- **Props:** `badge?`, `title`, `lede?`, `steps: [KometaStepItem, KometaStepItem, KometaStepItem]`.
- **Usage:**
  - `web/app/(marketing)/page.tsx` (Landing Page)
  - `web/app/(marketing)/pricing/page.tsx`

### 2.4 Category Grid Section (`KometaF1Section` / F1)
- **Origin:** Kometa Feature Block #1
- **Layout:** 6-column category pill grid with circular icon headers, title, lede, and centered bottom CTA button.
- **Component:** `KometaF1Section`
- **Props:** `title`, `lede?`, `items: Array<{ label, icon?, href? }>`, `ctaHref?`, `ctaLabel?`.
- **Usage:**
  - `web/app/(marketing)/system/page.tsx`
  - `web/app/(marketing)/social-workshop/page.tsx`

### 2.5 Feature Cards Section (`KometaF2Section` / F2)
- **Origin:** Kometa Feature Block #2
- **Layout:** 4-column feature card grid with top headline/lede row, numbered circular badges, descriptive body, checkmark bullet list, and bottom navigation links.
- **Component:** `KometaF2Section`
- **Props:** `heading`, `lede`, `cards: [KometaF2Card, KometaF2Card, KometaF2Card, KometaF2Card]`.
- **Usage:**
  - `web/app/(marketing)/studio/page.tsx`
  - `web/app/(marketing)/core-values/page.tsx`

### 2.6 Spotlight Cards Section (`KometaC3Section` / C3)
- **Origin:** Kometa Content Block #3
- **Layout:** 2-column interactive cards with hover border transition, arrow link badges, title, and body description.
- **Component:** `KometaC3Section`
- **Props:** `items: Array<{ title, description, href }>`.
- **Usage:**
  - `web/app/(marketing)/docs/page.tsx`
  - `web/app/(marketing)/pricing/page.tsx`
  - `web/app/(marketing)/social-workshop/page.tsx`

### 2.7 Diagonal Split Hero Section (`KometaC4Section` / C4)
- **Origin:** Kometa Content Block #4
- **Layout:** 50/50 split container. Left: Full-bleed image with cover styling. Right: Badge + title + description + primary/secondary CTA buttons.
- **Component:** `KometaC4Section`
- **Props:** `badge?`, `title`, `description`, `imageSrc`, `primaryCta`, `secondaryCta?`.
- **Usage:**
  - `web/app/(marketing)/studio/page.tsx`
  - `web/app/(marketing)/portfolio/page.tsx`
  - `web/app/(marketing)/gallery/page.tsx`

### 2.8 Staggered Hover Grid Section (`KometaC5Section` / C5)
- **Origin:** Kometa Content Block #5
- **Layout:** 4-card vertical staggered grid with left cyan border accent, hover lift translation (`hover:-translate-y-1.5`), and bottom CTA button.
- **Component:** `KometaC5Section`
- **Props:** `badge?`, `title`, `lede?`, `cards: [KometaC5Item, KometaC5Item, KometaC5Item, KometaC5Item]`, `ctaHref?`, `ctaLabel?`.
- **Usage:**
  - `web/app/(marketing)/system/page.tsx`
  - `web/app/(marketing)/docs/page.tsx`

### 2.9 Flowbite Dashboard CTA Section (`FlowbiteCtaSection` / CTA1)
- **Origin:** Flowbite Marketing UI CTA Block
- **Layout:** 2-column rounded card. Left: High-contrast product dashboard mockup preview. Right: Title + lede paragraph + primary action button with arrow icon.
- **Component:** `FlowbiteCtaSection`
- **Props:** `title`, `description`, `ctaHref`, `ctaLabel?`, `imageDarkSrc?`, `imageAlt?`.
- **Usage:**
  - `web/app/(marketing)/page.tsx` (Landing Page)
  - `web/app/(marketing)/system/page.tsx`

---

## 3. Approved Social & Testimonial Blocks

Located in `web/components/blocks/preline/preline-vertical-marquee.tsx`:

### 3.1 Vertical Testimonial Marquee (`PrelineVerticalMarquee` / VM)
- **Origin:** Preline Vertical Marquee Block
- **Layout:** Dual opposing vertical testimonial columns with gradient edge masks, creator avatars, user handles, and verified quote cards.
- **Component:** `PrelineVerticalMarquee`
- **Props:** `title?`, `subtitle?`, `column1: PrelineMarqueeItem[]`, `column2: PrelineMarqueeItem[]`.
- **Usage:**
  - `web/app/(marketing)/page.tsx` (Landing Page)

---

## 4. Approved Authentication & Onboarding Blocks

Located in `web/components/blocks/preline/preline-vertical-marquee.tsx` and `web/app/(auth)/`:

### 4.1 Split Auth Screen Layout (`PrelineSplitAuth` / AUTH-SPLIT)
- **Origin:** Preline Split Login Page with Onboarding Sidebar
- **Layout:** 12-column split card. Left (5 cols): Tagline badge + heading + live metric preview cards (Traffic, Continuity Locks, Market Share) + partner credentials. Right (7 cols): Title + subtitle + interactive auth form slot + footer helper links.
- **Component:** `PrelineSplitAuth`
- **Props:** `title`, `subtitle`, `sidebarTagline?`, `sidebarHeadline?`, `children`, `footer?`.
- **Usage:**
  - `web/app/(auth)/login/page.tsx`
  - `web/app/(auth)/reset-password/page.tsx`
  - `web/app/(auth)/forgot-password/page.tsx`
  - `web/app/(auth)/verify-email/page.tsx`
  - `web/app/(auth)/mfa/page.tsx`

### 4.2 Minimal 404 Error Screen (`Preline404` / 404)
- **Origin:** Preline 404 Error Block
- **Layout:** Centered error display with large `404` status code, error explanation, and primary return button.
- **Location:** `web/app/_not-found/page.tsx` & `web/app/not-found.tsx`

---

## 5. Animation on Scroll Standard

- **CSS Keyframes:** `@keyframes animationIn` in `web/app/globals.css`
  - `0%`: `opacity: 0; transform: translateY(30px); filter: blur(8px);`
  - `100%`: `opacity: 1; transform: translateY(0); filter: blur(0px);`
- **CSS Utility Classes:** `.animate-on-scroll` (paused by default, running when `.animate` is added).
- **Client Observer:** `web/components/marketing/marketing-effects.tsx` automatically registers all `.animate-on-scroll` elements via `IntersectionObserver` (`threshold: 0.15`, `rootMargin: 0px 0px -10% 0px`), respecting `prefers-reduced-motion`.
