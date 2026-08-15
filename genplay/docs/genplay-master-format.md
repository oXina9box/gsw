# GENGENPLAYMASTER — Master Format (v4)

The locked GenPlay master is the single source of truth for a director-controlled
production contract.  It binds story, DNA continuity, shot authoring, generation,
and edit into one JSON document.  The Paged Binder is a **projection** of this
master — it is not a new source of truth.

## Document envelope

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Human-readable title. |
| `genplay_id` | string | `GP-{CHANNEL_CODE}-{YYYYMMDD}-{NNN}` — globally unique across all productions. |
| `channel_code` | string | Short code (e.g. `GN`). |
| `channel_name` | string | Display name (e.g. `grudge-nudges`). |
| `episode_code` | string | `{CHANNEL_CODE}-E{N}` (e.g. `GN-E001`). |
| `seed_id` | string | Seed identifier for deterministic generation. |
| `logline` | string | One-sentence story summary. |
| `date` | string | `YYYY-MM-DD` — lock date. |
| `version` | string | Semver-ish version, e.g. `1.0`. |
| `locked` | `true` | MUST be `true`. A locked master is immutable. |

## Sections

### `creative_direction`

Approved gear and channel-wide creative rules.  These become the binder's
`channel_episode_dna` page.

| Field | Type |
|-------|------|
| `approved_cameras` | string[] |
| `approved_lenses` | string[] |
| `approved_movements` | string[] |
| `aspect_ratio` | string (e.g. `9:16`) |
| `frame_rate` | integer |
| `color_pipeline` | string |
| `visual_style` | string |

### `continuity`

| Field | Type |
|-------|------|
| `global_rules` | string[] — episode-wide continuity rules |

### `cast[]` — Characters

Ordered by screenplay appearance.  Each entry:

| Field | Type | Notes |
|-------|------|-------|
| `dna_id` | string | `CHAR-` + 32 hex — resolves to a CDNA record in the DNA registry. |
| `genplay_id` | string | Short cross-reference ID (`CDNA-001`). |
| `name` | string | Display name. |
| `appearance_order` | integer | 1-based, order of first appearance. |
| `visual_identity` | string | Human-readable summary of appearance. |
| `image_gen_prompt` | string | Copy-paste-ready image prompt. |

### `locations[]` — Locations

Ordered by screenplay appearance.  Each entry:

| Field | Type | Notes |
|-------|------|-------|
| `dna_id` | string | `LOC-` + 32 hex — resolves to an LDNA record. |
| `genplay_id` | string | Short ID (`LDNA-001`). |
| `name` | string | Display name. |
| `appearance_order` | integer | 1-based. |
| `spatial_rules` | string | Camera axis, door/window placement, floor layout. |
| `lighting_rules` | string | Light sources, contrast, color temperature. |
| `image_gen_prompt` | string | Copy-paste-ready image prompt. |

### `assets[]` — Props (PDNA)

Ordered by screenplay appearance.  Each entry:

| Field | Type | Notes |
|-------|------|-------|
| `dna_id` | string | `PROP-` + 32 hex — resolves to a PDNA record. |
| `genplay_id` | string | Short ID (`PDNA-001`). |
| `name` | string | Display name. |
| `appearance_order` | integer | 1-based. |
| `physical_properties` | string | Material, dimensions, wear, distinguishing features. |
| `image_gen_prompt` | string | Copy-paste-ready image prompt. |

> **Note on ADNA/PDNA**: The original GenPlay v1 spec referenced "ADNA" (Asset DNA).
> The DNA registry has since deprecated ADNA in favour of PDNA (Prop DNA).  The
> master uses `dna_id` values with the `PROP-` prefix.  See
> `dna/docs/30-pdna.md` for the Prop Master registry rules.

### `scenes[]` — Shots

Scenes are ordered as they appear in the screenplay.  Each scene contains its
shots.  Shot numbering is a running total across all scenes — it never resets.

| Scene field | Type |
|-------------|------|
| `scene_number` | integer |
| `heading` | string (e.g. `INT. MARA'S APARTMENT - NIGHT`) |
| `detail` | string — quick scene summary |
| `characters` | string[] — genplay_ids of characters in scene |
| `locations` | string[] — genplay_ids of locations in scene |
| `props` | string[] — genplay_ids of props in scene |
| `shots[]` | Shot objects (see below) |

Each **shot** object:

| Field | Type | Notes |
|-------|------|-------|
| `shot_id` | string | `GN_E001_S{nn}_{nnn}` — episode + scene + shot. |
| `take` | integer | Starts at 1. Re-prompts use same shot number, take 02+. |
| `date_shot` | string | `ongeneration` until generated. |
| `required_dna` | string[] | genplay_ids referenced by this shot. |
| `reference_images` | string[] | Ref IDs for identity enforcement. |
| `image_prompt` | string | Image generation prompt (single, brief). |
| `negative` | string[] | Negative prompt entries. |
| `timing` | object | `{seconds, frames, frame_rate}`. |
| `camera` | string[] | Camera details — body, lens, aperture, shutter, ISO, white balance, height, distance, focus. |
| `movement` | string[] | Movement type, direction, stabilization. |
| `dialogue` | string[] | Minimal dialogue lines (video generation handles audio). |
| `action` | string[] | Action description lines. |
| `continuity` | object | `{in, out}` — continuity match points. |
| `video_prompt` | string | Video generation prompt (single, brief). |

### `edit_plan`

| Field | Type |
|-------|------|
| `storage_directions` | string — where to store outputs, ordering rules |

### `delivery`

Reserved for future delivery specs.  Currently empty `{}`.

## DNA resolution

The master references DNA records by `dna_id` (CHAR-/LOC-/PROP-).  The binder
compiler optionally resolves these against the DNA registry (via
`dna/dao.py` `DNAClient`) when `--dna-root` is provided.  If a record is not
found the compiler falls back to the data already embedded in the master.
