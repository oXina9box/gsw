# DNA Decision Log

Gem-Studio DNA foundation. Locked decisions override all earlier schema thinking.
Last updated: 2026-08-15.

## Philosophy

**Exhaustive Digital Twin model.** The DNA is the master, God-view database. It holds
every measurable morphological and material detail — millimeter ratios, exact anatomical
angles, precise PBR values. The Pre-Prompt Enricher (built later) filters this data for
AI generation. The database is never dumbed down to save prompt space. JSON is the
language; images are projections of the DNA.

## Locked decisions

| # | Decision | Detail |
|---|----------|--------|
| 1 | Big 3 only | Build CDNA, LDNA, PDNA. No FDNA, Studio DNA, Channel DNA, Season DNA, Socials DNA, GenPlay schema, video pipeline, data-sheet image generation, or prompt enrichment pipeline yet. |
| 2 | ADNA becomes PDNA | ADNA deprecated. PDNA = Prop DNA. Covers vehicles, animals, props, set props, documents, weapons, electronics, decor, weather, media, signage, reusable furniture. |
| 3 | Wardrobe lives in CDNA | Costume is NOT a PDNA category. Clothing is tied to identity, body shape, socioeconomic state, profession, emotional state, episode continuity, damage/stains, character arc. |
| 4 | Real-time clock compatibility | Schemas support `birth_date_actual`, `aging_policy`, `age_lock`, `age_offset_years`, `life_stage`, `temporal_variants`. Clock engine not built yet. |
| 5 | Temporal variants are variants | Young/Teen/Adult/Old forms are `temporal_variants[]` entries on one character, never separate CDNA records. |
| 6 | Voice is tool-agnostic | `voice_identity` block with `provider_bindings[]`. No provider hard-coded. Supports video-native voice, external VO, ADR, narration, future providers. |
| 7 | JSON is source of truth | All records valid JSON. Schema = machine-readable law; docs = human-readable explanation. They must stay aligned. |
| 8 | User controls everything | No destructive changes, no unknown-file overwrites, no external services, no live database writes, no package installs without clear reporting. |
| 9 | ID format | `dna_id` = prefix + `-` + 32 uppercase hex chars (SHA-256-based). Patterns: `^CHAR-[A-F0-9]{32}$`, `^LOC-[A-F0-9]{32}$`, `^PROP-[A-F0-9]{32}$`. |
| 10 | PDNA prop_type enum | ~~Exactly: Vehicle, Prop, Animal, Weather, Decor, Media.~~ **Superseded** by the Prop Master amendment (2026-08-15): exactly ChannelAsset, HeroProp, HandProp, Electronics, Vehicle, Animal. |
| 11 | JSON Schema draft | Draft-07, matching reference docs. |
| 12 | Extensible deep objects | No `additionalProperties: false` on deep morphological/branch objects. The twin accepts exhaustive data as it grows. Top-level required fields stay enforced. |

## Record conventions

| DNA type | dna_type | dna_id prefix | Collection |
|----------|----------|---------------|------------|
| Character DNA | CDNA | CHAR- | characters |
| Location DNA | LDNA | LOC- | locations |
| Prop DNA | PDNA | PROP- | props |

## Open questions

1. ~~Set props / documents / weapons / electronics / signage modeling.~~ **Resolved** by the Prop Master amendment: fine categories ride `type_branch.prop_category`; decor/furniture/installed TVs default to LDNA set_dressing unless they pass the PDNA gate (see `docs/PDNA_CREATION_GUIDE.md` §C promotion).
2. ~~Furniture promotion threshold.~~ **Resolved**: furniture enters PDNA only via the 6-question gate; otherwise it is LDNA set_dressing.
3. **Aging engine formula.** `age_calculation_formula` and aging-onset curves carried from legacy CDNA are not yet specified for CDNA v2. Temporal block currently holds policy, not curves.
4. **Relationship edge directionality.** Whether `relationship_edges` are stored on both characters or resolved by lookup at read time.
5. **18+ gated content.** Legacy CDNA sections 20–21 (sexual profile, restricted anatomy) carried forward only as the optional `secondary_sex_and_intimate_phenotype` morphology domain; gating rules (`is_18_plus`) still to be ported into metadata.
6. **Collection storage format.** DAO currently writes one JSON file per record under a directory; MongoDB mapping (field names, indexes, unique constraints) deferred.
7. **seed_id vs base_seed.** Envelope carries `seed_id`; metadata carries legacy `base_seed`. Whether both persist long-term is undecided.

## Amendment: LDNA v2.1 (2026-08-15)

Adopted the exhaustive-but-trimmed, visually deterministic LDNA architecture.
Locked by this amendment:

1. Field classes documented per block only: FACT / RELATIONSHIP / RENDER. No class field in data.
2. Boundary rules: recurring objects are PDNA refs in `set_dressing.prop_bindings` (never inline); named people are CDNA refs (never in `human_presence`); cinematography belongs to future FDNA (`default_view` + `rendering_constraints` minimal, flagged future-FDNA).
3. `atmosphere` block = MOOD. Physical air effects (haze/fog/mist/dust/smoke) live in `climate`.
4. Required set: `identity_core` (common_name, type, city, zoning, one_liner), `spatial.is_indoor`, `sensory` (lighting_quality, ambient_sound_level, primary_smell), `atmosphere.baseline_mood`.
5. Superseded and removed blocks: `time_of_day_windows`, `seasonal_states`, `temporal_state`, `operational_state`, `occupancy_state`, `decay_state_machine`, `zone_branches`; folded into `time_state`, `condition_state`, `climate`, flat `sensory`/`lighting`/`materials` (migration table in docs/20-ldna.md).
6. `core_signature` demoted to optional mirror block (zoning/baseline_mood anchored in identity_core/atmosphere).
7. `casting_profile.time_based_rules` is an array of strings.

### Open questions (LDNA v2.1)

8. Freeform string fields across new blocks (geography, climate, etc.) may deserve vocabularies later; enums added only where the amendment fixed a vocabulary.
9. Whether `sensory.lighting_quality` should eventually merge into `lighting` (kept required anchor for now per amendment).

## Amendment: PDNA Prop Master registry (2026-08-15)

Locked by this amendment (supersedes decision 10 above):

1. PDNA is a PROP MASTER registry, not an asset warehouse. 6-question gate decides admission (handled / moves between locations / changes state / plot-important / channel asset / vehicle or animal). No to all → LDNA set_dressing.
2. prop_type enum exactly: ChannelAsset, HeroProp, HandProp, Electronics, Vehicle, Animal. Removed: Costume (→ CDNA wardrobe), Weather (→ LDNA climate/time_state), Decor + generic furniture + installed TVs (→ LDNA set_dressing). Media also removed — devices like cameras are Electronics.
3. Clone prevention: core_signature format `prop_type|object|primary_material|secondary_material|VARIANT_TRAIT`; variant trait mandatory. `variant_group` groups intentional siblings.
4. Record shape v2.2: flat `physical`, single `type_branch`, `ownership`, `scene`, `history`, `plot_utility`, `pbr` accepts float or legacy string forms, `ip_adapter_scale`.
5. Registry storage: `dna/props/{PROP-ID}.json` (local JSON only; no MongoDB).
6. Camera example migrated: prop_type Media → Electronics.
7. Seeded: two channel-one director's chairs (variant_group `first-channel-director-chairs`).
   - Chair A black: `PROP-18AFEF5A7884DDC603DFA71543DB42E8`
   - Chair B natural: `PROP-5A7794DA705EEF43DA244CCF5EEBF4B9`

### Open questions (Prop Master)

10. HeroProp vs HandProp vs ChannelAsset precedence when multiple gates apply (chairs are channel assets AND handled; classified ChannelAsset per directive).
11. Whether `ownership.home_location_id` for the chairs should be filled once a studio/stage LDNA exists.
