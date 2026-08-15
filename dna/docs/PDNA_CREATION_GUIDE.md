# Create New PDNA Item — Prop Master Creation Guide

PDNA is a **Prop Master registry**, not an asset warehouse. Only objects that
pass the gate get a PROP- record. Everything else stays in LDNA `set_dressing`.

## A. The Gate — answer BEFORE creating any PDNA

Does the object satisfy at least ONE of these six questions?

1. Is it **handled/carried** by characters?
2. Does it **move between locations**?
3. Does it **change state** (damage / repair / destroy)?
4. Is it **plot-important**?
5. Is it a **channel/brand asset**?
6. Is it a **vehicle or animal**?

**If NO to all six** → do NOT create a PDNA record. Add the item to the
relevant LDNA's `set_dressing` block instead and STOP.

Routing for the removed ADNA categories (never allowed as `prop_type`):

| Old category | Lives in |
|--------------|----------|
| Costume | CDNA `wardrobe` |
| Weather | LDNA `climate` / `time_state` |
| Decor, generic furniture, installed TVs | LDNA `set_dressing` |

## B. The Creation Process

1. **Pick `prop_type`** from the six-value enum — exactly one of:
   `ChannelAsset`, `HeroProp`, `HandProp`, `Electronics`, `Vehicle`, `Animal`.
2. **Build `metadata.core_signature`** as:
   `prop_type|object|primary_material|secondary_material|VARIANT_TRAIT`
   The VARIANT TRAIT (color, size, model) MUST be included so intentional
   variants are not flagged as clones.
   Example: `ChannelAsset|director_chair|wood|canvas|black`.
3. **If it is a variant** of an existing prop, set `metadata.variant_group`
   to the parent group (e.g. `first-channel-director-chairs`).
4. **Fill `identity_core`** — `prop_name`, `prop_type`, `one_liner`
   (plus `alternate_names`, `ai_seed`).
5. **Fill `physical`** — dimensions, `weight_kg`, `base_color_hex`,
   `material_finish`, `age_wear_level`.
6. **Fill the matching `type_branch`** for the prop_type
   (ChannelAsset: channel_binding/placement_role/materials/branding;
   HandProp/HeroProp: prop_category/handheld/weapon fields;
   Vehicle/Animal: their sub-objects).
7. **Fill `ownership`** — `owner_char_id` / `home_location_id` /
   `channel_asset` (empty string `""` when unassigned).
8. **Set continuity defaults** — `condition_current_pct: 100`,
   `is_destroyed: false`.
9. **Write `image_gen_prompt`**.
10. **Validate against the schema, then write** `{PROP-ID}.json` to `dna/props/`.

```bash
python dna/validator.py --type pdna --file dna/props/{PROP-ID}.json
```

`dna_id` format: `PROP-` + 32 uppercase hex chars (SHA-256 of a descriptive
seed string). `collection: props`.

## C. Promotion from LDNA

When a set-dressing item becomes plot-important (e.g. a background TV gets
smashed):

1. Create a new PDNA record **forked from the LDNA description** (copy the
   descriptor text into `identity_core.one_liner` + `physical`/`type_branch`).
2. Set `metadata.is_type_asset: false`.
3. Apply the creation process from step 2 onward (core_signature, physical,
   continuity defaults, image_gen_prompt).
4. Update the LDNA: replace the inline descriptor with the new `PROP-` id in
   `set_dressing.prop_bindings`, keeping the generic descriptor removed.

## D. The Blank Template

Copy `dna/templates/pdna.template.json`, fill in every field, then validate
and write to `dna/props/{PROP-ID}.json`. Full template:

```json
{
  "dna_id": "PROP-",
  "dna_type": "PDNA",
  "channel": "",
  "status": "active",
  "metadata": {
    "base_seed": "",
    "core_signature": "",
    "is_channel_asset": false,
    "is_type_asset": false,
    "variant_group": "",
    "overrides": {}
  },
  "identity_core": {
    "prop_name": "",
    "prop_type": "",
    "one_liner": "",
    "alternate_names": [],
    "ai_seed": 0
  },
  "physical": {
    "global_scale": 1.0,
    "dimensions_x_cm": 0,
    "dimensions_y_cm": 0,
    "dimensions_z_cm": 0,
    "weight_kg": 0,
    "base_color_hex": "",
    "material_finish": "",
    "pattern_style": "",
    "age_wear_level": "",
    "customization_markings": [],
    "has_physics": false,
    "destructible": false
  },
  "pbr": {
    "albedo_description": "",
    "roughness_value": "",
    "metallic_value": "",
    "normal_details": "",
    "subsurface_scattering": false,
    "emissive_properties": "",
    "anisotropy_notes": ""
  },
  "type_branch": {
    "channel_binding": "",
    "placement_role": "",
    "frame_material": "",
    "seat_material": "",
    "back_material": "",
    "fabric_color": "",
    "foldable": false,
    "name_panel": false,
    "name_panel_text": "",
    "branding": "",
    "backup_count": 0
  },
  "ownership": {
    "owner_char_id": "",
    "handler_char_ids": [],
    "home_location_id": "",
    "allowed_location_ids": [],
    "channel_asset": false
  },
  "scene": {
    "scope": "",
    "interaction_type": "",
    "character_bindings": [],
    "interaction_notes": "",
    "spawn_location": ""
  },
  "continuity": {
    "last_used_episode": "",
    "condition_current_pct": 100,
    "is_destroyed": false
  },
  "state_events": [],
  "history": {
    "origin_era": "",
    "previous_owners": 0
  },
  "plot_utility": {
    "narrative_importance": "",
    "fragility": ""
  },
  "data_sheet": {
    "status": "not_generated",
    "required_outputs": [],
    "sheet_prompt_template": "",
    "sheet_negative_prompt": "",
    "reference_uri": "",
    "approved_version": ""
  },
  "image_gen_prompt": "",
  "reference_uri": "",
  "ip_adapter_scale": 0.75
}
```

Note: the template has empty required values, so it will NOT pass validation
until filled in (`identity_core.prop_name`/`prop_type` and `physical` are the
required anchors).
