# Gem Studio — Website-frame

Atmospheric AI film studio front site + dashboard. **Vanilla HTML/CSS/JS only** — no
frameworks, no build step, no dependencies.

Production data lives in MongoDB and is the registry of record; this tree holds
only the surface layer. It references characters/productions by their `CHAR-` /
`AST-` / `LOC-` IDs — it never vendors JSON copies into app code (that is how a
second, drifting identity system is born).

## Folder map

```
Website-frame/
├── .gitignore              # excludes tool/OS artifacts (never versioned)
├── README.md               # this file
├── scripts/
│   └── structure-audit.sh  # CI + pre-commit guard against layout drift
├── dna/                    # PRODUCTION — DNA schemas & seeders (read-only)
├── genplay/                # PRODUCTION — gen-play outputs (read-only)
└── Gem-Studio/             # the studio app — single home, one entry point
    ├── index.html          # canonical landing page (entry point)
    ├── dashboard.html      # the studio dashboard (hash-routed /builder, /channel, …)
    ├── assets/
    │   ├── img/            # logo.png, gem-mark.png
    │   ├── css/
    │   │   ├── tokens.css  # design tokens ONLY (:root vars + font import)
    │   │   └── app.css     # layout + components (merged workbench + app layers)
    │   └── js/
    │       └── app.js      # all client logic (studio shell + landing interactions)
    └── _attic/             # superseded files — quarantined 7 days, then purged
```

## Studio brief (preserved from the hallmark preflight)

- Theme: custom OLED studio — dark / geometric-sans / warm + cool chromatic
- Anchor hue: hot pink
- Nav: N13 inline command pill (⌘K) · Footer: Ft5 statement
- Enrichment: Tier-A CSS art · Motion: CSS transitions + small vanilla JS
- Fonts: Syne · Space Grotesk · DM Mono

## Where new stuff goes

| New thing       | Goes in                                                          |
|---------------|------------------------------------------------------------------|
| A page         | `Gem-Studio/*.html`, linked from `index.html`                    |
| Styles / tokens | `Gem-Studio/assets/css/app.css` / `tokens.css`                  |
| Logic          | `Gem-Studio/assets/js/app.js` (add `js/modules/` only if it outgrows it) |
| Images         | `Gem-Studio/assets/img/`                                         |
| DNA records    | MongoDB via seeders (dna/) — never vendored into app folders     |

## Hygiene / governance

- `scripts/structure-audit.sh` fails CI and pre-commit on drift: loose files at
  the repo root, assets outside `Gem-Studio/assets/`, missing canonicals, or more
  than one file per role (the old `styles.css` vs `app.css` vs `tokens.css`
  split was exactly a clone/typo failure — now: one `app.css`, one `tokens.css`).
- `dna/` and `genplay/` are locked to seeder/pipeline paths. A PR touching them
  from any other path should fail CI (enforce in your CI policy; the audit script
  guards the surface layout).
- `_attic/` is a 7-day quarantine, not a warehouse: at weekly wrap, purge or
  promote its contents.
- Serve + link-check before merging any file move (`python -m http.server 8000`
  inside `Gem-Studio/`, watch for 404s).
- `scripts/security-gate.sh` is the pre-merge audit gate: it runs the vendored red-team scanner (`scripts/vendor/security_redteam_audit.py`, mode `local`) and fails on high-or-worse findings in tracked code outside `_attic/`. Audit reports land in the gitignored `security-audit-report/`.
