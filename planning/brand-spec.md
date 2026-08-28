# Gem Studio Brand & Design System Specification

## 1. Visual Language & Direction

```yaml
surface: Authenticated onboarding modal + billing/BYOK selector + first-lane workbench
audience: Solo AI film creator configuring studio workspace
visual-lane: Warm cinematic builder tool; restrained dark instrument-panel layout
dials:
  variance: 5
  motion-intensity: 4
  information-density: 5
  asset-dependence: 7
  brand-fidelity: 8
```

## 2. Color Palette & Roles

| Role | Token / Value | Purpose | Contrast vs Background (`#09090b`) |
|---|---|---|---|
| **Background** | `#09090b` (zinc-950) | Root canvas & page background | Base (1:1) |
| **Surface / Card** | `#111115` (dark zinc) | Modal panels, card containers, workbenches | 1.15:1 (structural separation) |
| **Elevated Surface** | `#18181b` (zinc-900) | Dropdowns, active inputs, popovers | 1.35:1 |
| **Border / Hairline** | `#27272a` (zinc-800) | Container outlines, subtle separators | 1.8:1 (UI divider) |
| **Border Focus** | `#ea0070` | Focus rings and active boundary highlights | 3.9:1 (UI safe) |
| **Primary Accent** | `#ea0070` (gem magenta) | Primary CTA buttons, key indicators, branding | 3.9:1 vs bg, 4.58:1 vs `#ffffff` text |
| **Secondary Accent** | `#7000ea` (gem violet) | Secondary badges, channel accents | 2.6:1 vs bg, 4.7:1 vs `#ffffff` text |
| **Text Primary** | `#f4f4f5` (zinc-100) | Headlines, primary labels, body prose | 17.5:1 (AAA text safe) |
| **Text Muted** | `#a1a1aa` (zinc-400) | Secondary labels, hints, metadata | 6.1:1 (AA text safe) |
| **Text Subtle** | `#71717a` (zinc-500) | Placeholder text, disabled labels | 3.6:1 |
| **Status Success** | `#10b981` (emerald-500) | Verified connections, completed steps | 7.5:1 (AA text safe) |
| **Status Warning** | `#f59e0b` (amber-500) | Missing setup fields, review needed | 9.8:1 (AA text safe) |
| **Status Error** | `#ef4444` (red-500) | Failed validations, disconnected keys | 4.8:1 (AA text safe) |

### Color Contract & Rules
- Text on primary accent (`#ea0070`) **must** be pure white (`#ffffff`) to ensure AA contrast (4.58:1).
- Dark cards/sections must never use dark ink text.
- Primary accent coverage must not exceed ~5% of any viewport.

## 3. Typography

- **Display / Headlines:** `font-sans` (Inter, system-ui), tight line-height (1.1–1.25), tracking `-0.02em`, `font-semibold` (600) or `font-bold` (700). Normal font-style (no italic headers).
- **Body:** `font-sans`, line-height 1.5, `font-normal` (400) or `font-medium` (500).
- **Monospace:** `font-mono` (JetBrains Mono, Menlo, monospace), reserved exclusively for API key prefixes (`sk-...`), IDs, timestamps, and JSON data. Paragraph text is never set in monospace.
- Maximum font families: 2 (sans + mono).

## 4. Spacing & Elevation

- **Scale:** 4px base (`space-1` = 4px, `space-2` = 8px, `space-3` = 12px, `space-4` = 16px, `space-6` = 24px, `space-8` = 32px, `space-12` = 48px).
- **Cards & Containers:** Internal padding $\ge 24\text{px}$ (`p-6`). Internal padding $\le$ external gap between adjacent containers.
- **Radii:**
  - Outer dialogs & workbench cards: `12px` (`rounded-xl`).
  - Inputs, buttons, and inner list items: `8px` (`rounded-lg`) or `6px` (`rounded-md`).
  - Pills / Status Badges: `9999px` (`rounded-full`).

## 5. Motion Policy & Anti-Slop Discipline

- **No `transition: all`:** Explicitly declare animated properties (`transition-colors`, `transition-opacity`, `transition-transform`).
- **Allowed Animated Properties:** Only `opacity` and `transform`. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`.
- **Timing:** UI animations (modal entrance, dropdown expand, step switch) must stay $\le 300\text{ms}$.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo) for entrances, `cubic-bezier(0.7, 0, 0.84, 0)` for exits.
- **Reduced Motion:** All transitions must honor `prefers-reduced-motion: reduce` by collapsing to $\le 150\text{ms}$ crossfades or instantaneous cuts.
- **Focus Rings:** Visible instantly with `focus-visible:ring-2 focus-visible:ring-[#ea0070]` with zero transition delay.

## 6. Component States

Every interactive element (modal, form input, button, lane card) must handle all states:
1. **Populated / Default:** Clear hierarchy, dark surface, legible label.
2. **Focus-visible:** Distinct ring ($\ge 3:1$ contrast against surface).
3. **Hover:** Subtle brightness increase ($\approx 5\%$) or border highlight; no layout shifting.
4. **Active / Pressed:** Slight scale (`scale-[0.98]`) or background darkening.
5. **Loading:** Spinner or skeleton indicator, button disabled, accessible `aria-busy`.
6. **Disabled:** Visual signal via reduced opacity ($0.5$), `cursor: not-allowed`, and native `disabled` attribute.
7. **Error:** Clear red border (`#ef4444`), contextual error text with `role="alert"`.
8. **Empty State:** Explains what is missing and offers a single primary action to proceed.

## 7. Logo & Asset Standards

- **Studio Brand Logo:** Stored in `assets/img/logo.png` / `web/public/assets/img/logo.png` and `gem-mark.png`.
- **User Uploads:** Allowed types: `image/svg+xml`, `image/png`, `image/webp`. Max size: 5 MB. Max dimensions: 4096×4096px. Storage: workspace-scoped bucket with server-side validation.
- **Illustrations:** Derived from unDraw SVG assets, recolored to brand accent (`#ea0070`), validated XML with no unescaped entity tags.
