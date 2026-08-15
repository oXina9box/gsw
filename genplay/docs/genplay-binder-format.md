# GenPlay Paged Binder — Format Reference

The Paged Binder is a projection of a locked GEMGENPLAYMASTER.  It is
delivered as **one JSON file per page**, each self-contained with a full
identity envelope so any single page can be opened, understood, and
copy-pasted to a generation provider.

A binder may also be aggregated into a single JSON document:

```json
{
  "genplay_binder": {
    "pages": [ … ]
  }
}
```

## Page envelope

Every page repeats its identity header:

| Field | Type | Always present |
|-------|------|----------------|
| `page_number` | integer | yes |
| `page_type` | string | yes |
| `genplay_id` | string | yes |
| `channel_code` | string | yes |
| `episode_code` | string | yes |

## Page type catalog

| # | page_type | purpose |
|---|-----------|---------|
| 1 | `cover` | Title, genplay_id, date, version. |
| 2 | `table_of_contents` | Lists every page with its number and section title. |
| 3 | `director_notes` | General process rules (NOT episode-specific). |
| 4 | `channel_episode_dna` | Approved cameras, lenses, movements, channel rules. |
| 5 | `section_cover` | "Character Data" / "Location Data" / "Prop Data" headers. |
| 6 | `character_sheet` | One per character. |
| 7 | `location_sheet` | One per location. |
| 8 | `prop_sheet` | One page, up to 3 props. |
| 9 | `shot_image_page` | Image generation prompt for one shot. |
| 10 | `shot_walkthrough_page` | Video generation prompt + shot walk for one shot. |
| 11 | `post_pages_recap` | Shot list recap + storage directions. |

## Page content specifications

### `cover`

```json
{
  "page_number": 1,
  "page_type": "cover",
  "genplay_id": "GP-GN-20260815-001",
  "channel_code": "GN",
  "episode_code": "GN-E001",
  "title": "The Key",
  "date": "2026-08-15",
  "version": "1.0"
}
```

### `table_of_contents`

```json
{
  "page_number": 2,
  "page_type": "table_of_contents",
  "genplay_id": "GP-GN-20260815-001",
  "channel_code": "GN",
  "episode_code": "GN-E001",
  "toc": [
    { "page": 3, "section": "General Director Notes" },
    { "page": 4, "section": "Approved Gear & Channel DNA" }
  ]
}
```

### `director_notes`

```json
{
  "page_number": 3,
  "page_type": "director_notes",
  "title": "General Director Notes",
  "process_instructions": [
    "Genplay is the master source of truth. Do not deviate from approved gear or DNA.",
    "Copy and paste the exact prompts provided on the shot pages.",
    "Shots must be generated in sequential global order to maintain continuity.",
    "Keep inline shots together. B-roll filler is handled in post."
  ]
}
```

### `channel_episode_dna`

```json
{
  "page_number": 4,
  "page_type": "channel_episode_dna",
  "title": "Approved Gear & Rules",
  "approved_cameras": [ "ARRI Alexa 35" ],
  "approved_lenses":   [ "Cooke S4/i", "Zeiss Supreme Prime" ],
  "approved_movements": [ "slow tracking", "static hold" ],
  "channel_rules": [
    "Master Aspect Ratio: 9:16",
    "Color Pipeline: ACEScg to Rec.709",
    "Visual Style: Cinematic photorealism, subtle 35mm grain"
  ]
}
```

### `section_cover`

```json
{ "page_number": 5, "page_type": "section_cover", "section_title": "Character Data" }
```

### `character_sheet`

```json
{
  "page_number": 6,
  "page_type": "character_sheet",
  "character_id": "CDNA-001",
  "name": "Mara",
  "appearance_order": 1,
  "visual_identity": "30s female, guarded neutrality, charcoal wool coat, left cheek scar.",
  "copy_paste_image_snippet": "30s woman, guarded neutral expression, charcoal wool coat, silver ring, scar on left cheek, cinematic photorealism"
}
```

### `location_sheet`

```json
{
  "page_number": 8,
  "page_type": "location_sheet",
  "location_id": "LDNA-001",
  "name": "Mara's Apartment",
  "appearance_order": 1,
  "spatial_rules": "Door on frame right, window on frame left.",
  "lighting_rules": "Cool moonlight from camera left, warm practical lamp.",
  "copy_paste_image_snippet": "dimly lit apartment interior, sealed door right, rain-streaked window left, cinematic photorealism"
}
```

### `prop_sheet` (max 3 props per page)

```json
{
  "page_number": 10,
  "page_type": "prop_sheet",
  "props": [
    {
      "asset_id": "PDNA-001",
      "name": "Brass Key",
      "appearance_order": 1,
      "physical_properties": "Aged brass, long three-tooth key, small red thread through bow.",
      "copy_paste_image_snippet": "macro shot of an aged brass key, scratched burnished surface"
    }
  ]
}
```

### `shot_image_page`

```json
{
  "page_number": 11,
  "page_type": "shot_image_page",
  "scene_number": 1,
  "global_shot_number": 1,
  "shot_id": "GN_E001_S01_01",
  "take": 1,
  "required_dna": [ "CDNA-001", "LDNA-001" ],
  "reference_images": [ "REF-CDNA-001-HERO", "REF-LDNA-001-WIDE" ],
  "image_generation_prompt": "Wide shot, full room with Mara occupying the right third...",
  "negative": [ "extra doors", "changing room geometry" ]
}
```

### `shot_walkthrough_page`

```json
{
  "page_number": 12,
  "page_type": "shot_walkthrough_page",
  "header": {
    "channel_code": "grudge-nudges",
    "episode_code": "GN-E001",
    "scene_number": 1,
    "global_shot_number": 1,
    "take_number": 1,
    "date": "on generation"
  },
  "scene_detail": {
    "characters": [ "Mara" ],
    "locations":  [ "Mara's Apartment" ],
    "props":      [],
    "quick_detail": "Establish isolation and introduce the impossible object."
  },
  "shot_detail": {
    "characters": [ "Mara" ],
    "locations":  [ "Mara's Apartment" ],
    "props":      [],
    "timing":     "4.0 seconds (96 frames)"
  },
  "camera_and_action_list": [
    "Camera: ARRI Alexa 35, Super 35",
    "Lens: Cooke S4/i, 32mm, T2.8",
    "Movement: Slow lateral tracking, right to left",
    "Action: Mara enters from frame right, walks slowly, stops beside table.",
    "Lighting: Cool moonlight key from camera left, warm practical fill."
  ],
  "video_generation_prompt": "A slow lateral tracking shot searches the apartment..."
}
```

### `post_pages_recap`

```json
{
  "page_number": 15,
  "page_type": "post_pages_recap",
  "title": "Post Production & Storage Recap",
  "shot_list_recap": [
    {
      "global_shot": 1,
      "scene_number": 1,
      "export_id": "GN_E001_S01_01",
      "runtime": "4.0s",
      "take": 1,
      "boardfile": "GN_E001_S01_01_T01board.png",
      "takefile": "GN_E001_SC01_SH001_T01.mp4",
      "type": "inline"
    }
  ],
  "storage_directions": "Store all generated takes in the channel bucket..."
}
```

## File naming on disk

```
/channels/{channel_name}/episodes/{episode_code}/genplay/pages/
  page-001-cover.json
  page-002-toc.json
  page-003-director-notes.json
  page-004-channel-dna.json
  page-005-characters-cover.json
  page-006-character-mara.json
  page-007-locations-cover.json
  page-008-location-maras-apartment.json
  page-009-props-cover.json
  page-010-props-brass-key.json
  page-011-sc01-shot-001-image.json
  page-012-sc01-shot-001-walkthrough.json
  page-013-sc01-shot-002-image.json
  page-014-sc01-shot-002-walkthrough.json
  page-015-post-recap.json
  binder.json   ← aggregated binder
```

## Hard rules (enforced by the validator)

1. Shot numbers are cumulative and never reset.
2. Take starts at 1; re-prompts use take 02+ with the same shot number.
3. Data sheets ordered by screenplay appearance: characters, locations, props.
4. One image page + one walkthrough page per shot.
5. No status fields outside pinned DNA snapshots.
6. The TOC matches the actual page count.
7. Every `required_dna` reference resolves to a data sheet page in the binder.
