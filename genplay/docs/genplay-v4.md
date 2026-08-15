# GenPlay v4 — Shot Contract & Compilation Rules

Canonical shot contract and the rules the Paged Binder compiler must enforce.

## 1. Shot numbering (global cumulative)

Shot numbers are a running total across **all** scenes.  Scene 2's first shot
continues from Scene 1's last shot.  Numbering **never** resets.

```
Scene 1  Shot 001 → global_shot_number = 1
Scene 1  Shot 002 → global_shot_number = 2
Scene 2  Shot 001 → global_shot_number = 3   (NOT reset to 1)
```

## 2. Takes

Take always starts at 1 for a new shot.  Re-prompts for continuity fixes or
alternate angles become take 02+ with the **same** shot number:

```
GN_E001_S01_01  take 1   — primary take
GN_E001_S01_01  take 2   — continuity fix
```

## 3. Data sheet ordering

Data sheets are ordered by **appearance in the screenplay**.  Characters first,
locations second, props third.  Within each category, `appearance_order`
determines the sequence.

## 4. One prompt per shot

- The **shot_image_page** carries the single image generation prompt.
- The **shot_walkthrough_page** carries the single video generation prompt.
- Prompts are brief, simple, list-style.

Every `shot_image_page` lists which character / location / prop DNA sheets are
required (with their genplay_ids) **before** the prompt, so the generator can
cross-reference identity.

## 5. Scene detail

Each scene has a detail — characters present, locations, props, and a quick
one-line summary.  In the binder this is embedded in the `shot_walkthrough_page`
under `scene_detail`.

## 6. Scene detail + walkthrough ordering

Within a scene, pages alternate: `shot_image_page` then `shot_walkthrough_page`
for each shot, in global shot order.  Scene detail is embedded in the first
walkthrough page of that scene.

## 7. Post-production pages

The `post_pages_recap` page lists every shot with its global shot number,
scene number, shot_id, runtime, take, output filenames, and type (inline).

File naming conventions:

```
Board/still frames: {CHANNEL}{EPISODE}SH{NNN}T{NN}board.png
Takes:              {CHANNEL}{EPISODE}SC{NN}SH{NNN}T{NN}.mp4
```

## 8. No status fields on locked documents

A locked GenPlay is locked.  No shot QC status, no document status.  DNA
records inside data sheets retain their schema-required fields as pinned
snapshots (e.g. `dna_id`, `status`, key identity fields).  Everything else is
frozen.

## 9. The Genplay is the master source of truth

A shot never calls for anything outside the Genplay.  No ad-hoc props, no
unapproved cameras, no off-contract lens choices.

## 10. Dialogue is handled by video generation

Dialogue appears as minimal dialogue lines in the walkthrough, not as a
separate audio workflow.

## 11. Generation order

Inline shots are generated in **global sequential order**.  Shot N+1 is not
generated until shot N is complete.  B-roll filler is done post if needed.

## 12. B-roll

Generate inline shots in global order, keep them together.  B-roll filler is
done post only.  Re-prompts get take 02 with the same shot number.

---

## Compilation mapping (master → binder)

| Master field | Binder page type |
|---|---|
| `document` | `cover` |
| (new) | `table_of_contents` |
| (new) | `director_notes` |
| `creative_direction` + `continuity.global_rules` | `channel_episode_dna` |
| (section header) | `section_cover` (Character Data) |
| `cast[]` | `character_sheet` (1 per page) |
| (section header) | `section_cover` (Location Data) |
| `locations[]` | `location_sheet` (1 per page) |
| (section header) | `section_cover` (Prop Data) |
| `assets[]` | `prop_sheet` (max 3 per page) |
| `scenes[].shots[]` image prompt | `shot_image_page` (1 per page) |
| `scenes[].shots[]` full contract | `shot_walkthrough_page` (1 per page) |
| `edit_plan` + `delivery` | `post_pages_recap` |

Fields that do **not** carry into the binder: `qc.status`, `document.status`,
`lock`, `quality_control`, `edit.clipbreakpoints`.  All substantive shot data
carries over.
