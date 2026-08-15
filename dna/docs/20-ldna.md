# Location DNA (LDNA) v2.1

Exhaustive-but-trimmed, visually deterministic location records.

JSON Schema: `dna/schemas/ldna.schema.json` (Draft-07).
Example: `dna/examples/ldna.example.json`.

## Field classes

Every field belongs to one of three classes. The class is documented per block
below — there is no class field in the data.

| Class | Meaning |
|-------|---------|
| **FACT** | What physically exists. |
| **RELATIONSHIP** | How things relate spatially. |
| **RENDER** | How the AI should depict the facts. |

## Boundary rules (invariants)

1. **Recurring or plot-important objects are never described inline.** They are
   PDNA records referenced in `set_dressing.prop_bindings` (array of `PROP-` ids).
   Generic, non-recurring set dressing stays as descriptors.
2. **Named/recurring people are never described here.** They are CDNA records
   referenced in `character_connections` / `casting_profile`.
   `human_presence` describes ONLY anonymous crowd/environmental people.
3. **Full cinematography (camera, lens, composition, grade) belongs to future
   Film DNA.** For now, `default_view` and `rendering_constraints` hold only the
   minimum needed to render the Location Data Sheet. Both are flagged future-FDNA.

## Naming collision note

`atmosphere` in this schema means **MOOD** (baseline_mood, comfort, isolation).
Physical air effects (haze/fog/mist/dust/smoke) live in `climate`.

## A. Record envelope (FACT)

| Field | Type | Required |
|-------|------|----------|
| `dna_id` | string `^LOC-[A-F0-9]{32}$` | yes |
| `dna_type` | const `LDNA` | yes |
| `channel` | string | yes |
| `seed_id` | string `^SEED-[A-F0-9]{32}$` | no |
| `status` | enum draft\|active\|archived\|retired\|deceased\|destroyed | yes |
| `created_at` / `updated_at` | datetime | no |

## identity_core (FACT) — required block

Required: `common_name`, `type`, `city`, `zoning`, `one_liner`.

Optional additions: `location_subtype`, `cultural_style`, `architectural_style`,
`development_pattern`, `settlement_scale`, `density`, `function`,
`activity_level`, plus legacy geography strings (`gps_coordinates`,
`fictional_address`, `neighborhood`, `country`, `time_zone`, `altitude_m`,
`climate_zone`, `walkability_score`).

`zoning` enum: Commercial | Residential | Municipal.

## geography (FACT)

`region_type`, `terrain`, `elevation_character`, `water_proximity`, `water_type`,
`landform`, `geographic_openness`, `natural_surroundings`, `urban_context`,
`regional_character`.

## climate (FACT) — includes air effects

`climate`, `season`, `temperature`, `humidity`, `precipitation`, `weather`,
`wind`, `air_character`, `ground_condition`, **`haze`, `fog`, `mist`, `dust`,
`smoke`**, `air_visibility`, `distance_visibility`.

## time_state (FACT)

Supersedes the retired `time_of_day_windows` + `seasonal_states` blocks.

`time_of_day`, `sun_position`, `sun_direction`, `daylight_level`,
`twilight_state`, `night_state`, `historical_period`, `currentness`,
`seasonal_state`.

## spatial (FACT + RELATIONSHIP) — required block

Required: `is_indoor`.

Kept from legacy: `is_indoor`, `is_outdoor`, `area_sq_m`, `floor_count`,
`ceiling_height_m`, `entrance_type`, `parking_availability`.

Added: `spatial_layout`, `orientation`, `symmetry`, `organization`, `scale`,
`enclosure`, `openness`, `foreground_depth`, `midground_depth`,
`background_depth`, `visual_layers`, `focal_point`, `dominant_axis`,
`sightline`, `perspective`, `circulation_pattern`, `hierarchy`, `negative_space`.

## ground_surface (FACT)

`ground_type`, `surface_material`, `surface_pattern`, `surface_condition`,
`surface_age`, `surface_texture`, `surface_moisture`, `grade`, `drainage`,
`vegetation_intrusion`.

## architecture (FACT) — conditional for built environments

`building_count`, `building_density`, `building_height`, `building_form`,
`roof_style`, `roof_material`, `facade_material`, `wall_condition`,
`window_style`, `door_style`, `balcony_presence`, `balcony_style`,
`ornamentation`, `architectural_uniformity`, `building_spacing`, `setback`,
`foundation_visibility`, `structural_age`, `renovation_level`.

Open block — zoning/type branch detail allowed (`additionalProperties` not set false).

## infrastructure (FACT)

`road_type`, `road_width`, `road_condition`, `sidewalk_type`, `curb_type`,
`street_lighting`, `utility_lines`, `utility_poles`, `traffic_control`,
`signage`, `street_sign_style`, `parking`, `barriers`, `railings`,
`public_fixtures`, `transit_infrastructure`.

## vegetation (FACT)

`vegetation_density`, `vegetation_type`, `tree_presence`,
`tree_species_character`, `tree_size`, `tree_spacing`, `shrub_presence`,
`grass_presence`, `flower_presence`, `groundcover`, `vine_presence`,
`canopy_density`, `vegetation_condition`, `cultivation_level`,
`seasonal_foliage`.

## natural_features (FACT)

`rock_presence`, `rock_type`, `cliff_presence`, `soil_type`, `sand_presence`,
`water_presence`, `water_surface`, `water_color`, `shoreline_type`,
`natural_landmark`, `natural_feature_scale`.

## set_dressing (FACT)

Generic dressing descriptors: `street_furniture`, `vehicles`, `vehicle_density`,
`signs`, `awnings`, `containers`, `sculptures`, `fences`, `gates`,
`trash_containers`, `construction_elements`, `market_elements`,
`commercial_displays`.

`prop_bindings` — array of `PROP-` ids matching `^PROP-[A-F0-9]{32}$` for
recurring/plot-important objects physically present here (boundary rule 1).

## human_presence (FACT) — anonymous crowd only

`population_presence`, `crowd_density`, `pedestrian_density`, `activity`,
`social_activity`, `occupation_activity`, `movement_level`,
`visibility_of_people`, `clothing_character`, `group_distribution`.

Boundary rule 2: named/recurring people are CDNA references, not text here.

## casting_profile (FACT) — feeds NPC casting

`expected_roles[]` — `{role (required), minimum_count, maximum_count,
recurring_potential, create_if_missing, notes}`.
`crowd_density_default` — enum Deserted | Sparse | Moderate | Crowded | Packed.
`time_based_rules` — array of strings.

## materials (FACT)

`primary_material`, `secondary_material`, `tertiary_material`, `material_age`,
`material_finish`, `material_texture`, `material_uniformity`,
`material_density`.

## color (FACT)

`dominant_color`, `secondary_color`, `accent_color`, `color_temperature`,
`color_saturation`, `color_contrast`, `material_color_variation`,
`natural_color_intensity`, `overall_palette`.

## lighting (FACT/RENDER)

`lighting_source`, `lighting_direction`, `lighting_intensity`,
`lighting_quality` (enum — same values as `sensory.lighting_quality`),
`shadow_strength`, `shadow_direction`, `shadow_length`, `ambient_light`,
`artificial_light`, `light_color`, `highlight_level`, `contrast_level`.

## sensory (FACT) — required block

Required: `lighting_quality` (enum), `ambient_sound_level` (enum),
`primary_smell`.

Kept: `primary_ambient_sound`, `acoustic_signature`, `smell_intensity` (enum),
`temperature_regulation`, `floor_feel`, `air_movement` (enum).

Added sound-implied visual cues: `traffic_activity`, `water_activity`,
`wind_effect`, `machinery_activity`, `animal_presence`.

## atmosphere (RENDER — mood) — required block

This block means mood. Required: `baseline_mood` (enum Electric | Melancholic |
Warm | Tense | Sterile | Chaotic | Nostalgic).

Kept: `comfort_level`, `isolation_factor`, `background_activity`,
`emotional_trigger_notes`.

Added: `visual_mood`, `visual_energy`, `visual_tension`, `visual_drama`,
`visual_character`, `visual_realism`.

## condition_state (FACT)

Folds the retired `operational_state`, `occupancy_state`, and
`decay_state_machine` blocks.

Kept: `decay_state` (enum), `operational_status` (enum), `occupancy_state`
(enum), `structural_integrity_pct` (0–100).

Added: `overall_condition`, `weathering`, `wear`, `damage`, `restoration`,
`cleanliness`, `patina`, `construction_freshness`, `event_state`,
`construction_state`, `seasonal_event`, `weather_event`, `temporary_objects`,
`temporary_population_change`.

## signature_features (FACT) — anti-generic

`landmark`, `signature_structure`, `signature_material`, `signature_color`,
`signature_feature`, `unique_pattern`, `recognition_feature`.

## spatial_relationships (RELATIONSHIP)

`building_to_road_relationship`, `building_to_building_relationship`,
`vegetation_to_building_relationship`, `water_to_land_relationship`,
`street_to_horizon_relationship`, `landmark_to_scene_relationship`,
`foreground_to_background_relationship`.

## worldbuilding (FACT)

`reality_status`, `world_type`, `technology_level`, `civilization_level`,
`fantasy_level`, `historical_accuracy`, `cultural_inspiration`,
`design_language`.

## default_view (RENDER) — FUTURE-FDNA

Minimum needed to render the Location Data Sheet. Full cinematography belongs
to Film DNA when it exists.

`camera_position`, `camera_height`, `camera_distance`, `camera_angle`,
`lens_type`, `focal_length_character`, `depth_of_field`, `focus_point`,
`framing`, `composition`, `horizon_position`.

## exclusions (RENDER) — feeds negative_prompt

Each field is an array of strings: `excluded_structures`, `excluded_materials`,
`excluded_colors`, `excluded_objects`, `excluded_architecture`,
`excluded_weather`, `excluded_activity`, `excluded_visual_styles`.

## rendering_constraints (RENDER) — FUTURE-FDNA

`render_style`, `detail_level`, `realism_level`, `stylization_level`,
`image_quality`.

## Unchanged continuity groups

- `metadata` (FACT) — `base_seed`, `core_signature`, `is_persistent`, `is_shell`, `overrides`.
- `secret_layers` (FACT) — hidden spaces, rumor, urban legend, crime scene history.
- `character_connections` (FACT) — `associated_characters[]`, `owner_char_id` /
  `manager_char_id` (`CHAR-` refs), `regular_patrons[]`, **`staff_char_ids[]`**
  (`CHAR-` refs), `notable_events_hosted[]`.
- `plot_utility` (FACT) — narrative role, critical threads, destruction probability.
- `history` (FACT) — `first_appearance`, `used_in_episodes[]`, `notable_events[]`.
- `image_gen_prompt` — full prompt for Location Data Sheet generation.
- `reference_uri` — canonical reference URI for approved visuals.
- `data_sheet` — shared contract: `status` (not_generated|draft|approved),
  `required_outputs[]`, `sheet_prompt_template`, `sheet_negative_prompt`,
  `reference_uri`, `approved_version`.
- `core_signature` — optional mirror block for the 5-trait clone-prevention
  signature (`zoning`, `architecture_era`, `socioeconomic_tier`,
  `baseline_mood`, `dominant_palette`, `signature_5_trait`,
  `core_signature_hash`).
- `continuity_flags` — stale/closure/cross-channel tracking.

## Superseded blocks (migration note)

| Removed | Folded into |
|---------|-------------|
| `time_of_day_windows` | `time_state` |
| `seasonal_states` | `time_state.seasonal_state` + `climate.season` |
| `operational_state` | `condition_state.operational_status` |
| `occupancy_state` | `condition_state.occupancy_state` |
| `decay_state_machine` | `condition_state.decay_state` |
| `temporal_state` | `time_state` + `condition_state.event_state` |
| `zone_branches` (commercial/residential/municipal_details) | `identity_core` subtype fields + `architecture`/`infrastructure`/`set_dressing` detail |
| `sensory.visual/sound/smell/touch` nesting | flat `sensory` fields + `lighting` + `materials` |
