# DNA Overview

## Purpose

Gem-Studio DNA is the persistent, reusable entity system for an AI film studio.
A DNA record is the single source of truth for a character, location, or prop.
It is an exhaustive digital twin: it holds every measurable, morphological, and
material detail (millimeter ratios, exact anatomical angles, precise PBR values).
Images and video are projections. Pipelines never write back into DNA.

Each record is a single self-contained JSON document. Deterministic generation
comes from a 4-byte hex `base_seed`; the same seed always reproduces the same
trait web. `dna_id` is `PREFIX-` plus the first 32 hex chars of `SHA-256(seed)`.

## The Big 3

1. **CDNA — Character DNA** (`dna_type: CDNA`, prefix `CHAR-`, collection `characters`).
   Includes wardrobe, because clothing is tied to character identity, body shape,
   socioeconomic state, profession, emotional state, episode continuity, damage,
   and character arc.
2. **LDNA — Location DNA** (`dna_id: LOC-`, collection `locations`).
   Environment, architecture, sensory cue systems, decay machine, occupancy.
3. **PDNA — Prop DNA** (`dna_id: PROP-`, collection `props`).
   A Prop Master registry, not an asset warehouse. Only objects passing the
   PDNA gate qualify (handled, moves between locations, changes state,
   plot-important, channel asset, or vehicle/animal). Prop types: ChannelAsset,
   HeroProp, HandProp, Electronics, Vehicle, Animal. Costume/Weather/Decor/
   Media removed (CDNA wardrobe, LDNA climate, LDNA set_dressing). See
   `docs/PDNA_CREATION_GUIDE.md`.

## Production flow

```
Approved DNA JSON  ->  Data Sheet Image      (per-type data_sheet block)
                   ->  GenPlay Shot Still    (per-character / per-location prompts)
                ->  Shot JSON + Shot Image
                ->  Video Generation
```

DNA is the source of truth. The Pre-Prompt Enricher (future) takes the
exhaustive DNA and emits the minimal prompt each downstream stage requires.

## Entity relationship graph

```
CDNA (characters)  ──references──► LDNA (locations)      via location_tie / owner_loc_id
CDNA  ──owns──► PDNA (props)       via owner_char_id / character_bindings
PDNA  ──lives_at──► LDNA          via home_location_id
LDNA ──staff──► CDNA             via character_connections.staff_char_ids / owner_char_id
CDNA ──relates──► CDNA          via relationship_edges.related_char_id
```

`dna_type` is the discriminator. `dna_id` carries the collection prefix
(`CHAR-`/`LOC-`/`PROP-`) so records cross-link safely and a validator can
reject a malformed reference.

## Casting model

- CDNA `casting` carries per-character production metadata: `casting_tier`
  (principal | supporting | persistent_npc | background | shell | stub),
  `availability_state` (active | alive | dead | missing | incarcerated | unknown).
- LDNA `casting_profile` describes crowd rules at a location: expected roles with
  min/max counts and a default crowd density.
- `shell` tier (CDNA) and `shell_mode_enabled` (LDNA) mark background-only entities
  that can be upgraded later by re-running the deterministic seed.

A "persistent NPC" is a CDNA with `metadata.is_persistent=true` and a `shell`/
`background`/`stub` casting tier; an "active" character is `status=active`,
`availability_state=alive`.

## Data sheet concept

Every DNA type owns an optional `data_sheet` block with a shared contract:
`status` (not_generated | draft | approved), `required_outputs`,
`sheet_prompt_template`, `sheet_negative_prompt`, `reference_uri`,
`approved_version`. This is the handoff artifact to the Data Sheet Image stage.

## Shot still concept

A shot still is rendered from a CDNA + LDNA + PDNA set chosen for a scene.
CDNA `image_gen_prompt` / `cinematic` and voice_identity `provider_bindings`
feed character consistency; LDNA `sensory`/`spatial` feed environment; PDNA
`image_gen_prompt` / PBR feed prop rendering and binding. Shot JSON (future)
records which DNA fed which frame.

## Real-time clock compatibility

Schemas are forward-compatible with aging without shipping the clock engine:
- CDNA `temporal`: `birth_date_actual`, `aging_policy`
  (real_time | story_time | frozen), `age_lock`, `age_offset_years`, `life_stage`.
- CDNA `temporal_variants[]`: age-state variants (young, teen, adult, old,
  flashback) of the same character with `physical_overrides`,
  `wardrobe_overrides`, `voice_overrides`.
- LDNA `time_state` (time-of-day/period) and `climate`; mood lives in `atmosphere`.

Age is computed at render time from the policy, so no field is locked to "now."

## Future layers (not built)

The following are part of the studio vision but are explicitly out of scope
for this foundation:

- **FDNA** — Film DNA. Cinematic ownership currently lives in CDNA `cinematic`
  as a flagged temporary block.
- **Studio DNA / Channel DNA / Season DNA / Socials DNA** — narrative and
  channel-level entities.
- **GenPlay schema & pipeline** — shot still and video orchestration.
- Prompt enrichment, data-sheet image generation, and video generation.

They are recorded as open questions / future work, not stubbed.

## Reference

- `DECISIONS.md` — locked decisions and design rationale.
- `schemas/*.schema.json` — JSON Schema (Draft-07), the machine law.
- `examples/*.example.json` — canonical exhaustive examples (validate with
  `python dna/validator.py --all`).
