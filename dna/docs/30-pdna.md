# Prop DNA (PDNA) — Prop Master Registry

PDNA is a **Prop Master registry**, not an asset warehouse. An object becomes
PDNA only if it passes the gate; everything else stays in LDNA `set_dressing`.

JSON Schema: `dna/schemas/pdna.schema.json` (Draft-07).
Example: `dna/examples/pdna.example.json`.
Registry records: `dna/props/{PROP-ID}.json`.
Creation process: `docs/PDNA_CREATION_GUIDE.md`.
Blank template: `dna/templates/pdna.template.json`.

## The PDNA gate

An object becomes PDNA only if it satisfies at least one of:

1. handled/carried by characters
2. moves between locations
3. changes state (damage/repair/destroy)
4. is plot-important
5. is a channel/brand asset
6. is a vehicle or animal

If none apply → LDNA `set_dressing`. Removed ADNA categories are routed:
**Costume** → CDNA `wardrobe`; **Weather** → LDNA `climate`/`time_state`;
**Decor / generic furniture / installed TVs** → LDNA `set_dressing`.

## Identity

| Field | Rule |
|-------|------|
| `dna_type` | const `PDNA` |
| `dna_id` | `PROP-` + 32 uppercase hex, `^PROP-[A-F0-9]{32}$` |
| Collection | `props` |
| Renames from ADNA | `asset_name` → `prop_name`, `asset_type` → `prop_type` |

## prop_type enum (locked, exactly six)

`ChannelAsset` | `HeroProp` | `HandProp` | `Electronics` | `Vehicle` | `Animal`

Removed and rejected: `Costume`, `Weather`, `Decor`, `Media`.

## Clone prevention

- `metadata.core_signature` MUST include the **variant trait** (color, size,
  model). Format:
  `prop_type|object|primary_material|secondary_material|VARIANT_TRAIT`
  Example: `ChannelAsset|director_chair|wood|canvas|black`.
- `metadata.variant_group` groups intentional siblings (e.g.
  `first-channel-director-chairs` for the black + natural canvas chairs).

## Record blocks

### Envelope
`dna_id` (required), `dna_type` (required), `channel` (required), `seed_id`,
`status` (draft|active|archived|retired|deceased|destroyed, required),
`created_at`, `updated_at`.

### metadata
`base_seed`, `core_signature`, `is_channel_asset`, `is_type_asset`,
`variant_group`, `is_persistent`, `is_shell`, `overrides`.

### identity_core (required)
`prop_name` (required), `prop_type` (required), `one_liner`,
`alternate_names[]`, `ai_seed` (integer).

### physical (required block)
`global_scale`, `dimensions_x_cm`/`_y_cm`/`_z_cm`, `weight_kg`,
`base_color_hex` (`#RRGGBB`), `material_finish` (Matte|Satin|Glossy|Mirror|
Transparent|Translucent|Textured), `pattern_style`, `age_wear_level`
(Pristine|Lightly Used|Worn|Damaged|Heavily Damaged),
`customization_markings[]`, `has_physics`, `destructible`.

### pbr
`albedo_description`, `albedo_hex`, `roughness` (float 0–1) or legacy
`roughness_value` (string), `metallic` / `metallic_value`, `ior`,
`anisotropy_angle_deg`/`_direction_deg`/`anisotropy_notes`,
`emissive_luminance_nits`/`emissive_properties`, `normal_details`,
`normal_map_height_mm`, `subsurface_scattering` (boolean), `sss`
(`{enabled, depth_mm, profile}`), `clearcoat`, `sheen`.

### type_branch
One branch object matching `prop_type` (open for type-specific detail):

- **ChannelAsset** — `channel_binding`, `placement_role`, `frame_material`,
  `seat_material`, `back_material`, `fabric_color`, `foldable`, `name_panel`,
  `name_panel_text`, `branding`, `backup_count`.
- **HandProp / HeroProp** — `prop_category` (Electronics|Kitchenware|Tool|
  Weapon|Document|Food|Drink|Sports Equipment|Medical|Musical Instrument|
  Luggage|Signage|Furniture|Other), `handheld`, `two_handed`,
  `surface_area_description`, `interactable_parts[]`,
  `sound_on_interaction`, `is_weapon`, `weapon_type`, `safety_protocol`.
- **Vehicle** — `type_branch.vehicle` sub-object (legacy vehicle fields).
- **Animal** — `type_branch.animal` (`species`, `breed_type`, `size_class`,
  coat colors/pattern, `temperament_baseline`, `vocalization_type`, `is_mount`).

### ownership
`owner_char_id` (`CHAR-` ref or `""`), `handler_char_ids[]`,
`home_location_id` (`LOC-` ref or `""`), `allowed_location_ids[]`,
`channel_asset` (boolean).

### scene
`scope` (Foreground|Midground|Background), `interaction_type`
(Static|Passive|Active|Physics), `character_bindings[]` (`CHAR-` refs),
`interaction_notes`, `spawn_location`.

### continuity
`last_used_episode`, `last_used_date`, `condition_current_pct` (0–100),
`durability_remaining_uses`, `is_destroyed`, `destroyed_in_episode`,
`is_stale_unused_days`, `has_cross_channel_appearances`,
`cross_channel_episodes[]`, `universe_timeline_registered`.

### state_events[]
`event_id`, `event_time`, `episode_id`, `scene_id`, `event_type`
(damage|wear|repair|relocate|acquire|destroy|modify|other), `description`,
`state_change`.

### history
`origin_era`, `previous_owners` (integer).

### plot_utility
`narrative_importance`, `fragility`.

### data_sheet
Shared contract: `status` (not_generated|draft|approved), `required_outputs[]`,
`sheet_prompt_template`, `sheet_negative_prompt`, `reference_uri`,
`approved_version`.

### Tail fields
`image_gen_prompt`, `reference_uri`, `ip_adapter_scale` (0–1).

## Seeded registry (channel-one)

| PROP-ID | prop_name | variant_group | core_signature |
|---------|-----------|---------------|----------------|
| `PROP-18AFEF5A7884DDC603DFA71543DB42E8` | Director's Chair — Black Canvas | first-channel-director-chairs | `ChannelAsset\|director_chair\|wood\|canvas\|black` |
| `PROP-5A7794DA705EEF43DA244CCF5EEBF4B9` | Director's Chair — Natural Canvas | first-channel-director-chairs | `ChannelAsset\|director_chair\|wood\|canvas\|natural` |

Same variant group; signatures differ only by the fabric-color variant trait,
so they are intentional siblings, not clones.
