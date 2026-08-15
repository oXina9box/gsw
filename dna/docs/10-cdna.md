# Character DNA (CDNA)

Character DNA is the authoritative God-view character record. It is exhaustive:
the deep anatomical and material detail lives in seven morphological domains under
`physical`, while production state lives in the optional v2 blocks
(wardrobe, temporal, voice_identity, casting, relationships, data_sheet).

JSON Schema: `dna/schemas/cdna.schema.json` (Draft-07).
Example: `dna/examples/cdna.example.json`.

## A. Record envelope

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `dna_id` | string | yes | `CHAR-` + 32 uppercase hex (SHA-256 of seed). Pattern `^CHAR-[A-F0-9]{32}$`. |
| `dna_type` | string | yes | const `CDNA`. |
| `channel` | string | yes | Producing channel. |
| `seed_id` | string | no | `SEED-` + 32 hex, when managed separately. |
| `status` | string | yes | `draft` | `active` | `archived` | `retired` | `deceased` | `destroyed`. |
| `created_at` / `updated_at` | datetime | no | Date or full ISO-8601. |

## B. metadata

Clone prevention + role flags.

| Field | Type | Notes |
|-------|------|-------|
| `base_seed` | string | 4-byte hex deterministic seed. |
| `core_signature` | string | 5-trait signature (Gender × MST × Somatotype × Hair Type × Enneagram) hashed for clone prevention. |
| `is_npc` | boolean | |
| `is_persistent` | boolean | Reusable across episodes/scenes. |
| `is_shell` | boolean | Visual-only background entity; upgraded later. |
| `is_18_plus` | boolean | Gates mature morphology data. |
| `overrides` | object | Hand-authored field overrides (consume RNG cycles to stay deterministic). |

## C. identity_core  (required)

Human-readable identity. `full_name` required.

`full_name`, `preferred_pronouns`, `gender_identity`, `nickname`,
`cultural_background`, `religious_orientation`, `political_leaning`,
`socioeconomic_origin`, `socioeconomic_current`, `education`,
`professional_title`, `age`, `birth_date_actual`, `spawn_date`, `attitude`,
`one_liner`.

## D. physical  (required)

Required anchors: `height_cm`, `weight_kg`, `somatotype`, and the legacy
compatibility objects `skin`, `head`, `eyes`, `nose`, `lips`, `hair`. Deep
anatomical data is organized into seven domains (see §Morphological domains).

### Required legacy anchors
- `height_cm` (number, cm), `weight_kg` (number, kg), `somatotype`
  (Ectomorph | Mesomorph | Endomorph).
- `skin` — `mst_level` required (MST 1–10). Optional: `fitzpatrick` (1–6),
  `undertone`, `hex_override` (`^[0-9A-Fa-f]{6}$`).
- `head`, `eyes`, `nose`, `lips`, `hair` — free-form objects preserving the
  legacy Body Mapping / Follicles structure (closed over for compatibility).

### Visual identity fields (optional)
`face_shape`, `apparent_age`, `handedness` (left | right | ambidextrous),
`body_hair`, `hormonal_presentation`, `distinctive_marks`
(array of `{mark_type (tattoo|piercing|scar|birthmark|mole|other), placement, description}`),
`eyebrows`, `cheeks`, `jaw_chin`.

### 1. Morphological domains (optional, exhaustive)

These hold the uncompromising detail; the Pre-Prompt Enricher filters them later.
All domain objects are extensible (`additionalProperties` allowed).

- **anthropometry** — cranial, torso, limb ratios, extremities.
  `height_cm`, `weight_kg`, `bmi`, `sitting_height_cm`, `leg_length_cm`,
  `torso_length_cm`, `cranial_perimeter_cm`, `cranial_length_cm`,
  `cranial_breadth_cm`, `bizygomatic_breadth_cm`, `biacromial_breadth_cm`,
  `chest/waist/hip_circumference_cm`, `midarm/thigh_calf_circumference_cm`,
  `hand/foot_length_cm` + `hand_breadth_cm` + `foot_breadth_cm`,
  `digit_ratio_2_4` / `2_5` / `2_10`, `fingerprint_whorl_pattern`.

- **craniofacial_morphology** — orbits, nasal complex, maxilla/mandible, soft tissue.
  `interpupillary_distance_mm`, `palpebral_fissure_height_mm` / `_width_mm`,
  `intercanthal_distance_mm`, `nasofrontal_angle_deg`, `nasolabial_angle_deg`,
  `alar_base_width_mm`, `nostril_width_mm`, `nostril_flare_pct`,
  `gonial_angle_left_deg` / `_right_deg`, `mandibular_symphysis_length_mm`,
  `mandibular_body_height_mm`, `dental_midline_deviation_mm`,
  `maxillary_incisal_edge_exposure_mm`, `buccal_fat_thickness_mm`,
  `nasolabial_fold_depth_mm`, `lower_lip_thickness_mm`, `upper_lip_length_mm`,
  `facial_third_ratios`, `soft_tissue_theon_thickness_mm`, `soft_tissue_theon_notes`.

- **dermatological_profile** — tone, texture, vascular, aging.
  `mst_scale_level` (1–10), `fitzpatrick`, `undertone`,
  `capillary_visibility`, `freckle_map`, `wringle_vectors`, `elastosis_notes`,
  `subsurface_scattering_depth_mm`, `pore_density_zones`.

- **trichological_profile** — scalp, strand, body hair.
  `scalp_follicle_density_hairs_per_cm2`, `norwood_scale_left` (1–7),
  `strand_diameter_microns`, `strand_cross_section`
  (round|oval|flat|ribbon), `strand_porosity`, `body_hair_distribution`.

- **musculoskeletal_and_kinematic** — posture, gait.
  `muscle_belly_lengths`, `tendon_insertion_points`, `spine_curves`
  (`cervical_deg`, `thoracic_deg`, `lumbar_deg`, `sacral_incidence_deg`),
  `pelvic_tilt_deg`, `shoulder_asymmetry_deg`, `stride_length_cm`,
  `cadence_steps_per_min`, `arm_swing_asymmetry_pct`, `gait_parameters`.

- **secondary_sex_and_intimate_phenotype** — gated by `metadata.is_18_plus` when
  active. `hormonal_presentation` (androgenic|gynoid|balanced),
  `android_gynoid_ratio`, `fat_distribution_pattern`, `breast_anatomy`
  (`tissue_density_gcm3`, `ptosis_grade`, `volume`),
  `pelvic_gynecic_index`, `gluteal_tilt_deg`, `intimate_morphology_summary`.

- **distinctive_asymmetries_and_anomalies** —
  `facial_asymmetry_vector_left`/`_right`, `deviated_septum` +
  `deviated_septum_direction`, `darwin_tubercle_left`/`_right`,
  `diastema_mm`, `rotated_incisors_severity` (none|mild|moderate|severe),
  `anomaly_notes`.

## E. cinematic  (required — temporary)

> TEMPORARY COMPATIBILITY BLOCK. Future cinematic ownership belongs to FDNA.

Lens/aperture/lighting + generation consistency. `lens_profile`
(`primary`, `special`), `aperture`, `lighting_model`,
`unconventional_angles_framing`, `cinematography_notes`
(`negative_prompt_block`, `camera_hardware_tag`, `consistency_method`,
`seed_value_locked`).

## F. psychological  (optional)

Legacy deep dive + v2 additions.

- `big_five` — openness/conscientiousness/extraversion/agreeableness/neuroticism
  `{score 0–1, notes}`.
- `temperament` (`dominance`, `primary_stress_emotion`, `joy_trigger`,
  `humor_style`, `chronotype`).
- `behavioral_drivers` (v2) — `baseline_confidence`,
  `communication_style`, `humor_style`, `coping_mechanism`, `trust_baseline`,
  `stress_response` (`mode`, `physical_tic`, `vocal_change`).
- `narrative_subtext` (v2) — `core_wound`, `the_secret`, `worldview`,
  `blind_spot`, `primary_trigger`, `intimate_history`, `romantic_blind_spot`.

## G. speech_pattern  (optional)

Legacy Speech Pattern DNA: `average_sentence_length`, `vocabulary_level`,
`favorite_words_phrases`, `verbal_tics`, `accent_details`, `code_switching_behavior`,
`voice_pitch`, `voice_tone`, `speech_pace`, `laugh_type`, `cry_style`, emotional
speech shifts, social baseline (`sarcasm_level`, `formality_baseline`,
`greeting_style`, `apology_style`, `compliment_style`, `insult_style`).

## H. voice_identity  (optional)

Tool-agnostic voice block. No provider is hard-coded.

`voice_name`, `voice_status`, `voice_owner_type`, `voice_age_range`,
`gender_expression`, `accent`, `dialect_notes`, `timbre`, `pitch`, `resonance`,
`tempo`, `rhythm`, `energy_baseline`, `emotional_range`, `vocal_tics`,
`speech_pattern_ref`, `native_video_voice_notes`, `voiceover_notes`,
`adr_notes`, `reference_audio_uris`, `voice_embedding_uri`,
`usage_rights`, `provider_bindings[]`.

`provider_bindings` entries: `provider`, `external_voice_id`, `model`, `priority`,
`status` (active|inactive|testing|retired), `quality`, `notes`.

## I. wardrobe  (optional)

Clothing lives on the character. `style_profile`, `sizing`, `default_outfit_id`,
`current_outfit_id`, `outfits[]`, `uniforms[]`, `outfit_history[]`.

Outfit object: `outfit_id`, `outfit_name`, `garment_type`, `one_liner`,
`pieces[]` (`piece`, `description`, `fabric`, `fit`, `color_hex`,
`wear_level`, `damage`), `scene_types`, `seasonality`,
`continuity_condition_pct`, `last_used_episode`, `image_gen_prompt`,
`reference_uri`, `status`. Uniforms reuses the outfit object.

## J. temporal  (optional)

Real-time clock compatibility (clock engine built later). `aging_policy`
(real_time | story_time | frozen) required. Plus `birth_date_actual`
(`YYYY-MM-DD`), `age_lock`, `age_offset_years`, `life_stage`
(infant|child|teen|adult|middle_aged|elderly), `temporal_notes`.

## K. temporal_variants  (optional)

Array. Each variant is an age/state of the SAME character (not a new record).
`variant_id`, `label` (young|teen|adult|old|flashback|...), `age_range`,
`priority`, `use_when`, `physical_overrides`, `wardrobe_overrides`,
`voice_overrides`, `image_gen_prompt_modifier`.

## L. casting  (optional)

`casting_tier` (principal|supporting|persistent_npc|background|shell|stub),
`casting_pool`, `is_background`, `is_recurring`, `is_promotable`,
`availability_state` (active|alive|dead|missing|incarcerated|unknown),
`first_appearance`, `last_appearance`, `promotion_history[]`.

## M. relationships  (optional)

- `relationship_graph` (legacy, free-form) — backward compat.
- `relationship_edges[]` — structured, queryable. `edge_id`, `related_char_id`
  (`CHAR-` + 32 hex), `relation_type` (20 values incl. parent|child|spouse|
  partner|sibling|friend|enemy|coworker|boss|employee|neighbor|mentor|student|
  lover|ex|acquaintance|owner|patron|staff|customer), `relation_subtype`,
  `canonical`, `current_status`, `sentiment` (positive|neutral|negative|
  complicated), `start_date`, `end_date`, `notes`.

## N. location_tie  (optional legacy)
## O. episode_history  (optional legacy)
  Arrays/lists tracking where the character appeared.

## P. data_sheet  (optional)

Shared contract: `status` (not_generated|draft|approved), `required_outputs[]`,
`sheet_prompt_template`, `sheet_negative_prompt`, `reference_uri`,
`approved_version`.

## Q. image_gen_prompt  (required)

Full prompt for data-sheet / shot-still generation.

## R. voice_gen_notes  (optional legacy)

Retained for backward compatibility; `voice_identity` is the future home.
