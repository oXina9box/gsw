# Glossary

Terms used across the DNA foundation.

- **DNA** — The persistent, exhaustive in-universe entity system at the heart of
  Gem-Studio. Each record is a single JSON document and the source of truth for
  one character, location, or prop. DNA is the God-view database; pipelines are
  projections only.
- **CDNA** — Character DNA. `dna_type: CDNA`, prefix `CHAR-`, collection
  `characters`. Carries wardrobe (which PDNA does not).
- **LDNA** — Location DNA. `dna_type: LDNA`, prefix `LOC-`, collection
  `locations`. Spatial mechanics, sensory cue systems, decay machine.
- **PDNA** — Prop DNA. `dna_type: PDNA`, prefix `PROP-`, collection `props`.
  Prop Master registry refactored from legacy ADNA. Only objects passing the
  PDNA gate qualify: ChannelAsset, HeroProp, HandProp, Electronics, Vehicle,
  Animal. Costume/Weather/Decor/Media removed (routed to CDNA wardrobe, LDNA
  climate, LDNA set_dressing).
- **ADNA** — Legacy Asset DNA. Deprecated. Superseded by PDNA.
- **PDNA gate** — The 6 questions that decide whether an object becomes a PDNA
  record (handled, moves between locations, changes state, plot-important,
  channel asset, vehicle/animal). No to all → LDNA `set_dressing`.
- **variant_group** — `metadata.variant_group` groups intentional PDNA siblings
  (e.g. two director's-chair fabric colors); `core_signature` includes the
  variant trait so siblings are not flagged as clones.
- **FDNA** — Film DNA. Out of scope. Cinematic ownership currently lives in the
  CDNA `cinematic` block (flagged temporary compatibility block).
- **GenPlay** — The shot-still and video generation pipeline. Out of scope; LDNA
  and PDNA carry `genplay_reference_urls` / GenPlay refs for future wiring only.
- **Data Sheet** — The per-record handoff artifact defined by the `data_sheet`
  block (`status`, `required_outputs`, prompt templates, `approved_version`).
- **Shot Still** — A rendered frame assembled from a CDNA + LDNA + PDNA set;
  not a file or schema here, just the documented handoff target.
- **core_signature** — A 5-trait signature (for characters: Gender × MST ×
  Somatotype × Hair Type × Enneagram; for locations: Zoning × Architecture era ×
  Socioeconomic tier × Baseline mood × Dominant palette) used for clone
  prevention before save.
- **base_seed** — The 4-byte hex seed that drives deterministic `random`
  reproduction of a record. Same seed ⇒ identical trait web.
- **UUIDv5** — Namespace+name UUID (name-based, deterministic). Used as the basis
  for deriving stable `dna_id` suffixes in tooling; DNA itself stores the
  resulting 32-hex suffix rather than the UUID string.
- **MST** — Melanin/Skin Tone scale (1–10, 1 = Porcelain, 10 = Espresso). The
  master skin-tone anchor in CDNA `physical.skin.mst_level` / the
  `dermatological_profile` domain.
- **FACS** — Facial Action Coding System. CDNA `cinematic`/`psychological`
  surfaces FACS AU codes (e.g. AU 6 + AU 12 for genuine joy) for expression
  consistency.
- **PBR** — Physically Based Rendering. PDNA `pbr` holds exhaustive values
  (albedo hex, roughness/metallic floats, IOR, anisotropy angles, SSS depth).
- **temporal variant** — An age/state variant (young, teen, adult, old,
  flashback) of one character, stored as an entry in CDNA
  `temporal_variants[]`. Variants share one `dna_id`, not separate records.
- **casting tier** — CDNA `casting.casting_tier`: principal | supporting |
  persistent_npc | background | shell | stub.
- **persistent NPC** — A CDNA with `metadata.is_persistent=true` and a persistent
  casting tier; reusable across episodes/scenes.
- **shell character** — A CDNA with `metadata.is_shell=true` and `casting_tier`
  shell: visual identity only, upgraded later by re-running the seed.
- **relationship edge** — A structured, queryable link in CDNA
  `relationship_edges[]` (`edge_id`, `related_char_id`, `relation_type`,
  `sentiment`, dates, notes). Replaces/augments the legacy `relationship_graph`.
- **wardrobe outfit** — An entry in CDNA `wardrobe.outfits[]`: `outfit_id`,
  `outfit_name`, `garment_type`, `pieces[]` (with fabric, `color_hex`,
  `wear_level`, `damage`), `image_gen_prompt`, `status`.
- **provider binding** — An entry in CDNA `voice_identity.provider_bindings[]`:
  `provider`, `external_voice_id`, `model`, `priority`, `status`, `quality`,
  `notes`. The schema never hard-codes a provider.
