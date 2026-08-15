#!/usr/bin/env python3
"""GenPlay Paged Binder — compile, validate, and read locked GenPlay binders.

WHAT THIS IS
    Builds, validates, and reads the GenPlay Paged Binder: a projection of a
    locked GEMGENPLAYMASTER JSON into one self-contained page per concern.
    Each page carries its identity envelope (genplay_id, channel_code,
    episode_code) so any single file can be opened, understood, and
    copy-pasted to a generation provider in isolation.

    Three components:
      BinderCompiler  — reads a master, emits pages + aggregated binder.json
      BinderValidator — validates pages independently (envelope, DNA refs,
                        shot numbering, shot pairing, TOC, status fields)
      BinderReader    — reads a single page by number or filename, fetches
                        shot prompts and referenced DNA sheets

WHAT THIS IS NOT
    - Not the master source of truth.  The binder is a projection.
    - Not an interactive editor.  Locked binders are immutable; revisions
      create a new version of the binder.
    - No status fields are written to pages.

Usage:
    python -m genplay compile  --master GENPLAY_MASTER.json --output ./channels/.../genplay
    python -m genplay validate --binder ./channels/.../genplay
    python -m genplay read     --binder ./channels/.../genplay --page 11
    python -m genplay compile  --self-check
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
SCHEMA_DIR = HERE / "schemas"
EXAMPLE_DIR = HERE / "examples"
DOCS_DIR = HERE / "docs"
MASTER_SCHEMA = "genplay-master.schema.json"

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Standard director notes (process rules, NOT episode-specific)
DIRECTOR_NOTES_TITLE = "General Director Notes"
DIRECTOR_NOTES = [
    "Genplay is the master source of truth. Do not deviate from approved gear or DNA.",
    "Copy and paste the exact prompts provided on the shot pages.",
    "Shots must be generated in sequential global order to maintain continuity.",
    "Keep inline shots together. B-roll filler is handled in post.",
]

# Page type constants
PT_COVER = "cover"
PT_TOC = "table_of_contents"
PT_DIRECTOR_NOTES = "director_notes"
PT_CHANNEL_DNA = "channel_episode_dna"
PT_SECTION_COVER = "section_cover"
PT_CHARACTER_SHEET = "character_sheet"
PT_LOCATION_SHEET = "location_sheet"
PT_PROP_SHEET = "prop_sheet"
PT_SHOT_IMAGE = "shot_image_page"
PT_SHOT_WALKTHROUGH = "shot_walkthrough_page"
PT_POST_RECAP = "post_pages_recap"

# Section titles for section_cover pages
SECTION_TITLES = {
    "characters": "Character Data",
    "locations": "Location Data",
    "props": "Prop Data",
}

# Section slug used in page filenames
SECTION_SLUGS = {
    "Character Data": "characters",
    "Location Data": "locations",
    "Prop Data": "props",
}

# Maximum props per prop_sheet page
PROPS_PER_PAGE = 3

# Shot ID format: {CHANNEL}_{EPISODE}_S{scene}_{shot}  e.g. GN_E001_S01_01
SHOT_ID_RE = re.compile(r"^([A-Z]+)_([A-Z]+)E(\d+)_S(\d+)_(\d+)$")

# Identity fields that every page carries
ENVELOPE_FIELDS = ("page_number", "page_type", "genplay_id", "channel_code", "episode_code")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _slug(name: str) -> str:
    """Convert a name to a lowercase slug for filenames."""
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _zero_pad(n: int, width: int) -> str:
    return str(n).zfill(width)


def _parse_shot_id(shot_id: str) -> dict[str, Any]:
    """Extract scene_num, shot_local from a shot_id like GN_E001_S01_01."""
    m = SHOT_ID_RE.match(shot_id)
    if m:
        return {"channel": m.group(1), "episode": m.group(2), "episode_num": int(m.group(3)),
                "scene_num": int(m.group(4)), "shot_local": int(m.group(5))}
    # Fallback: try S{nn}_{nn} pattern
    m2 = re.match(r".*S(\d+)_(\d+)$", shot_id)
    if m2:
        return {"scene_num": int(m2.group(1)), "shot_local": int(m2.group(2))}
    return {"scene_num": 0, "shot_local": 0}


def _load_schema(schema_name: str) -> dict | None:
    """Load a JSON schema from the schemas directory."""
    path = SCHEMA_DIR / schema_name
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def _validate_master_schema(master: dict) -> list[str]:
    """Validate master against the master schema.  Returns error list (empty = pass)."""
    schema = _load_schema(MASTER_SCHEMA)
    if schema is None:
        return ["master schema not found"]

    # Try full jsonschema validation
    try:
        import jsonschema  # type: ignore
        jsonschema.Draft7Validator.check_schema(schema)
        validator = jsonschema.Draft7Validator(schema)
        errs = sorted(validator.iter_errors(master),
                      key=lambda e: list(e.absolute_path))
        messages = []
        for err in errs:
            loc = ".".join(str(p) for p in err.absolute_path) or "<root>"
            messages.append(f"master[{loc}]: {err.message}")
        return messages
    except ImportError:
        pass

    # Minimal fallback: check required top-level keys
    required = schema.get("required", [])
    errs = []
    for key in required:
        if key not in master:
            errs.append(f"master: missing required field: {key}")
    # Check document.locked
    doc = master.get("document", {})
    if doc.get("locked") is not True:
        errs.append("document.locked must be true (master must be locked)")
    return errs


def _atomic_write_json(path: Path, data: dict) -> None:
    """Write JSON atomically (temp + replace)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    os.replace(tmp, path)


def _page_filename(page: dict) -> str:
    """Generate a filename for a page based on its type and content."""
    num = _zero_pad(page["page_number"], 3)
    pt = page["page_type"]

    if pt == PT_COVER:
        return f"page-{num}-cover.json"
    if pt == PT_TOC:
        return f"page-{num}-toc.json"
    if pt == PT_DIRECTOR_NOTES:
        return f"page-{num}-director-notes.json"
    if pt == PT_CHANNEL_DNA:
        return f"page-{num}-channel-dna.json"
    if pt == PT_SECTION_COVER:
        slug = SECTION_SLUGS.get(page.get("section_title", ""), "section")
        return f"page-{num}-{slug}-cover.json"
    if pt == PT_CHARACTER_SHEET:
        return f"page-{num}-character-{_slug(page.get('name', 'char'))}.json"
    if pt == PT_LOCATION_SHEET:
        return f"page-{num}-location-{_slug(page.get('name', 'loc'))}.json"
    if pt == PT_PROP_SHEET:
        sheet_num = page.get("_sheet_num", 1)
        return f"page-{num}-props-sheet-{_zero_pad(sheet_num, 2)}.json"
    if pt == PT_SHOT_IMAGE:
        s = _zero_pad(page.get("scene_number", 0), 2)
        sh = _zero_pad(
            _parse_shot_id(page.get("shot_id", "")).get("shot_local", 0), 3)
        return f"page-{num}-sc{s}-shot-{sh}-image.json"
    if pt == PT_SHOT_WALKTHROUGH:
        s = _zero_pad(page.get("scene_number", 0), 2)
        sh = _zero_pad(
            _parse_shot_id(page.get("shot_id", "")).get("shot_local", 0), 3)
        return f"page-{num}-sc{s}-shot-{sh}-walkthrough.json"
    if pt == PT_POST_RECAP:
        return f"page-{num}-post-recap.json"
    return f"page-{num}-{pt}.json"


# ---------------------------------------------------------------------------
# BinderCompiler
# ---------------------------------------------------------------------------

class BinderCompiler:
    """Compiles a locked GenPlay master into a paged binder.

    The compiler is deterministic: the same master + same DNA registry
    always produces the same pages in the same order with the same
    page numbers.

    Parameters
    ----------
    master : dict
        A parsed GEMGENPLAYMASTER JSON object.
    dna_client : optional
        A ``dna.dao.DNAClient`` instance for resolving dna_id references.
        When provided, the compiler verifies that referenced DNA records
        exist in the registry.  Missing records produce warnings, not
        errors — the master's embedded data is always sufficient.
    """

    def __init__(self, master: dict, dna_client: Any = None):
        if not isinstance(master, dict):
            raise TypeError("master must be a dict")
        self.master = master
        self.doc = master["document"]
        self.cd = master.get("creative_direction", {})
        self.continuity = master.get("continuity", {})
        self.dna_client = dna_client
        self._pages: list[dict] = []
        self._global_shot_number = 0
        self._dna_lookup: dict[str, str] = {}  # genplay_id → dna_id
        self._name_lookup: dict[str, str] = {}  # genplay_id → display name
        self._type_lookup: dict[str, str] = {}  # genplay_id → "character"|"location"|"prop"
        self._shot_global_map: dict[str, int] = {}  # shot_id → global_shot_number

    def compile(self) -> list[dict]:
        """Compile all pages.

        Returns an ordered list of page dicts.  The TOC is generated
        last and inserted at index 1 (page 2), so all subsequent page
        numbers are correct.
        """
        # Validate master against schema
        errs = _validate_master_schema(self.master)
        if errs:
            raise ValueError(f"master validation failed:\n  " + "\n  ".join(errs))

        # Build DNA lookups
        self._build_lookups()

        # Build content pages (TOC placeholder at index 1)
        self._build_cover()
        self._pages.append(self._env(PT_TOC))  # placeholder, filled later
        self._build_director_notes()
        self._build_channel_dna()
        self._build_character_section()
        self._build_location_section()
        self._build_prop_section()
        self._build_shot_pages()
        self._build_post_recap()

        # Assign sequential page numbers
        for i, page in enumerate(self._pages):
            page["page_number"] = i + 1

        # Fill in the TOC with correct page references
        self._fill_toc(self._pages[1])

        return list(self._pages)

    # -- lookups -----------------------------------------------------------

    def _build_lookups(self) -> None:
        """Build genplay_id → dna_id, name, and type lookups."""
        for char in self.master.get("cast", []):
            gid = char.get("genplay_id", "")
            self._dna_lookup[gid] = char.get("dna_id", "")
            self._name_lookup[gid] = char.get("name", "")
            self._type_lookup[gid] = "character"
        for loc in self.master.get("locations", []):
            gid = loc.get("genplay_id", "")
            self._dna_lookup[gid] = loc.get("dna_id", "")
            self._name_lookup[gid] = loc.get("name", "")
            self._type_lookup[gid] = "location"
        for asset in self.master.get("assets", []):
            gid = asset.get("genplay_id", "")
            self._dna_lookup[gid] = asset.get("dna_id", "")
            self._name_lookup[gid] = asset.get("name", "")
            self._type_lookup[gid] = "prop"

    # -- envelope ----------------------------------------------------------

    def _env(self, page_type: str) -> dict:
        """Create a page dict with the identity envelope."""
        return {
            "page_number": 0,  # assigned after all pages are built
            "page_type": page_type,
            "genplay_id": self.doc["genplay_id"],
            "channel_code": self.doc["channel_code"],
            "episode_code": self.doc["episode_code"],
        }

    # -- page builders -----------------------------------------------------

    def _build_cover(self) -> None:
        p = self._env(PT_COVER)
        p["title"] = self.doc["title"]
        p["date"] = self.doc["date"]
        p["version"] = self.doc["version"]
        if "logline" in self.doc:
            p["logline"] = self.doc["logline"]
        self._pages.append(p)

    def _build_director_notes(self) -> None:
        p = self._env(PT_DIRECTOR_NOTES)
        p["title"] = DIRECTOR_NOTES_TITLE
        p["process_instructions"] = list(DIRECTOR_NOTES)
        self._pages.append(p)

    def _build_channel_dna(self) -> None:
        p = self._env(PT_CHANNEL_DNA)
        p["title"] = "Approved Gear & Rules"
        p["approved_cameras"] = list(self.cd.get("approved_cameras", []))
        p["approved_lenses"] = list(self.cd.get("approved_lenses", []))
        p["approved_movements"] = list(self.cd.get("approved_movements", []))
        rules = []
        rules.append(f"Master Aspect Ratio: {self.cd.get('aspect_ratio', '')}")
        rules.append(f"Frame Rate: {self.cd.get('frame_rate', 24)}fps")
        rules.append(f"Color Pipeline: {self.cd.get('color_pipeline', '')}")
        rules.append(f"Visual Style: {self.cd.get('visual_style', '')}")
        for gr in self.continuity.get("global_rules", []):
            rules.append(f"Continuity: {gr}")
        p["channel_rules"] = rules
        self._pages.append(p)

    def _build_character_section(self) -> None:
        """Section cover + one character_sheet per character, ordered by appearance."""
        p = self._env(PT_SECTION_COVER)
        p["section_title"] = SECTION_TITLES["characters"]
        self._pages.append(p)

        cast = sorted(self.master.get("cast", []),
                      key=lambda c: c.get("appearance_order", 0))
        for char in cast:
            self._build_character_sheet(char)

    def _build_character_sheet(self, char: dict) -> None:
        p = self._env(PT_CHARACTER_SHEET)
        gid = char["genplay_id"]
        p["character_id"] = gid
        p["name"] = char["name"]
        p["appearance_order"] = char["appearance_order"]
        p["visual_identity"] = char.get("visual_identity", "")
        p["copy_paste_image_snippet"] = char.get("image_gen_prompt", "")
        if "dna_id" in char:
            p["dna_id"] = char["dna_id"]
        self._pages.append(p)

    def _build_location_section(self) -> None:
        """Section cover + one location_sheet per location, ordered by appearance."""
        p = self._env(PT_SECTION_COVER)
        p["section_title"] = SECTION_TITLES["locations"]
        self._pages.append(p)

        locs = sorted(self.master.get("locations", []),
                      key=lambda l: l.get("appearance_order", 0))
        for loc in locs:
            self._build_location_sheet(loc)

    def _build_location_sheet(self, loc: dict) -> None:
        p = self._env(PT_LOCATION_SHEET)
        gid = loc["genplay_id"]
        p["location_id"] = gid
        p["name"] = loc["name"]
        p["appearance_order"] = loc["appearance_order"]
        p["spatial_rules"] = loc.get("spatial_rules", "")
        p["lighting_rules"] = loc.get("lighting_rules", "")
        p["copy_paste_image_snippet"] = loc.get("image_gen_prompt", "")
        if "dna_id" in loc:
            p["dna_id"] = loc["dna_id"]
        self._pages.append(p)

    def _build_prop_section(self) -> None:
        """Section cover + prop sheets (max 3 props per page), ordered by appearance."""
        p = self._env(PT_SECTION_COVER)
        p["section_title"] = SECTION_TITLES["props"]
        self._pages.append(p)

        assets = sorted(self.master.get("assets", []),
                        key=lambda a: a.get("appearance_order", 0))
        # Group into pages of PROPS_PER_PAGE
        for i in range(0, len(assets), PROPS_PER_PAGE):
            chunk = assets[i:i + PROPS_PER_PAGE]
            self._build_prop_sheet(chunk, sheet_num=i // PROPS_PER_PAGE + 1)

    def _build_prop_sheet(self, chunk: list[dict], sheet_num: int) -> None:
        p = self._env(PT_PROP_SHEET)
        p["_sheet_num"] = sheet_num
        p["props"] = []
        for asset in chunk:
            entry = {
                "asset_id": asset["genplay_id"],
                "name": asset["name"],
                "appearance_order": asset["appearance_order"],
                "physical_properties": asset.get("physical_properties", ""),
                "copy_paste_image_snippet": asset.get("image_gen_prompt", ""),
            }
            if "dna_id" in asset:
                entry["dna_id"] = asset["dna_id"]
            p["props"].append(entry)
        self._pages.append(p)

    def _build_shot_pages(self) -> None:
        """For each scene, for each shot: image page + walkthrough page.
        
        ...
        """
        for scene in self.master.get("scenes", []):
            scene_num = scene["scene_number"]
            scene_chars = [self._name_lookup.get(gid, gid) for gid in scene.get("characters", [])]
            scene_locs = [self._name_lookup.get(gid, gid) for gid in scene.get("locations", [])]
            scene_props = [self._name_lookup.get(gid, gid) for gid in scene.get("props", [])]

            for shot in scene.get("shots", []):
                self._global_shot_number += 1
                gsn = self._global_shot_number
                self._shot_global_map[shot["shot_id"]] = gsn
                self._build_shot_image_page(shot, scene_num, gsn)
                self._build_shot_walkthrough_page(shot, scene_num, gsn,
                                                    scene_chars, scene_locs, scene_props,
                                                    scene.get("detail", ""))

    def _build_shot_image_page(self, shot: dict, scene_num: int, gsn: int) -> None:
        p = self._env(PT_SHOT_IMAGE)
        p["scene_number"] = scene_num
        p["global_shot_number"] = gsn
        p["shot_id"] = shot["shot_id"]
        p["take"] = shot.get("take", 1)
        p["required_dna"] = list(shot.get("required_dna", []))
        p["reference_images"] = list(shot.get("reference_images", []))
        p["image_generation_prompt"] = shot.get("image_prompt", "")
        p["negative"] = list(shot.get("negative", []))
        self._pages.append(p)

    def _build_shot_walkthrough_page(
        self, shot: dict, scene_num: int, gsn: int,
        scene_chars: list[str], scene_locs: list[str],
        scene_props: list[str], scene_detail: str,
    ) -> None:
        p = self._env(PT_SHOT_WALKTHROUGH)
        p["shot_id"] = shot["shot_id"]
        p["scene_number"] = scene_num
        p["global_shot_number"] = gsn

        # Header
        p["header"] = {
            "channel_code": self.doc.get("channel_name", self.doc["channel_code"]),
            "episode_code": self.doc["episode_code"],
            "scene_number": scene_num,
            "global_shot_number": gsn,
            "take_number": shot.get("take", 1),
            "date": shot.get("date_shot", "ongeneration"),
        }

        # Scene detail (embedded for self-containment)
        p["scene_detail"] = {
            "characters": scene_chars,
            "locations": scene_locs,
            "props": scene_props,
            "quick_detail": scene_detail,
        }

        # Shot detail — resolve required_dna by type
        shot_detail_chars: list[str] = []
        shot_detail_locs: list[str] = []
        shot_detail_props: list[str] = []
        for gid in shot.get("required_dna", []):
            name = self._name_lookup.get(gid, gid)
            gtype = self._type_lookup.get(gid, "")
            if gtype == "character":
                shot_detail_chars.append(name)
            elif gtype == "location":
                shot_detail_locs.append(name)
            elif gtype == "prop":
                shot_detail_props.append(name)
        timing = shot.get("timing", {})
        timing_str = f"{timing.get('seconds', 0)} seconds ({timing.get('frames', 0)} frames)"
        p["shot_detail"] = {
            "characters": shot_detail_chars,
            "locations": shot_detail_locs,
            "props": shot_detail_props,
            "timing": timing_str,
        }

        # Camera and action list
        p["camera_and_action_list"] = self._build_camera_action_list(shot)

        # Dialogue (video generation handles audio)
        p["dialogue"] = list(shot.get("dialogue", []))

        # Video prompt
        p["video_generation_prompt"] = shot.get("video_prompt", "")

        self._pages.append(p)

    def _build_camera_action_list(self, shot: dict) -> list[str]:
        """Format camera/movement/action fields into human-readable list."""
        items = []
        cam_labels = {
            "body": "Camera", "lens": "Lens", "aperture": "Aperture",
            "shutter": "Shutter", "iso": "ISO", "white_balance": "White Balance",
            "height": "Height", "distance": "Distance", "focus": "Focus",
        }
        for entry in shot.get("camera", []):
            if ":" in entry:
                key, val = entry.split(":", 1)
                key = key.strip()
                val = val.strip()
                label = cam_labels.get(key, key.capitalize())
                items.append(f"{label}: {val}")
            else:
                items.append(entry)

        # Movement
        mv_parts = []
        for entry in shot.get("movement", []):
            if ":" in entry:
                _, val = entry.split(":", 1)
                mv_parts.append(val.strip())
            else:
                mv_parts.append(entry)
        if mv_parts:
            items.append(f"Movement: {', '.join(mv_parts)}")

        # Action
        for act in shot.get("action", []):
            items.append(f"Action: {act}")

        # Dialogue (as list items for readability)
        for line in shot.get("dialogue", []):
            items.append(f"Dialogue: {line}")

        return items

    def _build_post_recap(self) -> None:
        p = self._env(PT_POST_RECAP)
        p["title"] = "Post Production & Storage Recap"
        recap = []
        for scene in self.master.get("scenes", []):
            scene_num = scene["scene_number"]
            for shot in scene.get("shots", []):
                sd = shot.get("timing", {})
                runtime = f"{sd.get('seconds', 0)}s"
                parsed = _parse_shot_id(shot["shot_id"])
                s_num = parsed.get("scene_num", scene_num)
                shot_local = parsed.get("shot_local", 0)
                s_str = _zero_pad(s_num, 2)
                sh_str = _zero_pad(shot_local, 3)
                take_str = _zero_pad(shot.get("take", 1), 2)
                channel = self.doc["channel_code"]
                episode = self.doc["episode_code"].replace(f"{channel}-", "")
                boardfile = f"{channel}{episode}SH{sh_str}T{take_str}board.png"
                takefile = f"{channel}{episode}SC{s_str}SH{sh_str}T{take_str}.mp4"
                recap.append({
                    "global_shot": self._shot_global_map[shot["shot_id"]],
                    "scene_number": scene_num,
                    "export_id": shot["shot_id"],
                    "runtime": runtime,
                    "take": shot.get("take", 1),
                    "boardfile": boardfile,
                    "takefile": takefile,
                    "type": "inline",
                })
        p["shot_list_recap"] = recap
        p["storage_directions"] = self.master.get("edit_plan", {}).get(
            "storage_directions", "")
        self._pages.append(p)

    # -- TOC ----------------------------------------------------------------

    def _fill_toc(self, toc_page: dict) -> None:
        """Fill in the TOC from the actual emitted pages."""
        entries = []
        # TOC lists all pages after the cover and TOC itself (index 2+)
        for page in self._pages[2:]:
            entries.append({
                "page": page["page_number"],
                "section": self._toc_section(page),
            })
        toc_page["toc"] = entries

    @staticmethod
    def _toc_section(page: dict) -> str:
        pt = page["page_type"]
        if pt == PT_DIRECTOR_NOTES:
            return "General Director Notes"
        if pt == PT_CHANNEL_DNA:
            return "Approved Gear & Channel DNA"
        if pt == PT_SECTION_COVER:
            return page.get("section_title", "Section")
        if pt == PT_CHARACTER_SHEET:
            return f"Character: {page.get('name', '?')}"
        if pt == PT_LOCATION_SHEET:
            return f"Location: {page.get('name', '?')}"
        if pt == PT_PROP_SHEET:
            names = [p["name"] for p in page.get("props", [])]
            return f"Props: {', '.join(names)}" if names else "Props"
        if pt == PT_SHOT_IMAGE:
            n = page.get("global_shot_number", 0)
            s = page.get("scene_number", 0)
            return f"Scene {s} / Shot {n:03d} Image & DNA"
        if pt == PT_SHOT_WALKTHROUGH:
            n = page.get("global_shot_number", 0)
            s = page.get("scene_number", 0)
            return f"Scene {s} / Shot {n:03d} Walkthrough & Prompt"
        if pt == PT_POST_RECAP:
            return "Post Production & Storage Recap"
        return pt

    # -- Writing -----------------------------------------------------------

    def write_pages(self, output_dir: str | Path) -> list[str]:
        """Write individual page files + aggregated binder.json.
        
        Creates the channel directory structure:
            {output_dir}/pages/page-{NNN}-{slug}.json
            {output_dir}/binder.json
            {output_dir}/boards/   (placeholder — files go here when generated)
            {output_dir}/takes/
            {output_dir}/broll/
        
        Returns list of written file paths.
        """
        out = Path(output_dir)
        pages_dir = out / "pages"
        pages_dir.mkdir(parents=True, exist_ok=True)
        # Create storage subdirectories (empty until generation runs)
        (out / "boards").mkdir(parents=True, exist_ok=True)
        (out / "takes").mkdir(parents=True, exist_ok=True)
        (out / "broll").mkdir(parents=True, exist_ok=True)

        written = []
        for page in self._pages:
            fname = self._page_filename(page)
            fpath = pages_dir / fname
            # Strip internal fields (e.g., _sheet_num) from output
            clean = {k: v for k, v in page.items() if not k.startswith("_")}
            _atomic_write_json(fpath, clean)
            written.append(str(fpath))

        # Write aggregated binder (with internal fields stripped)
        clean_pages = [
            {k: v for k, v in p.items() if not k.startswith("_")}
            for p in self._pages
        ]
        binder = {"genplay_binder": {"pages": clean_pages}}
        binder_path = out / "binder.json"
        _atomic_write_json(binder_path, binder)
        written.append(str(binder_path))

        return written

    def _page_filename(self, page: dict) -> str:
        """Generate a filename for a page (delegates to module-level function)."""
        return _page_filename(page)


# ---------------------------------------------------------------------------
# BinderValidator
# ---------------------------------------------------------------------------

class BinderValidator:
    """Validates binder pages independently.

    Validation checks:
      1. Envelope is complete on every page.
      2. All DNA IDs referenced by shot pages resolve to a sheet page.
      3. Shot numbers are cumulative and never reset.
      4. Every shot has exactly one image page and one walkthrough page.
      5. Every scene has scene_detail in its walkthrough pages.
      6. The TOC matches the actual page count.
      7. No status fields outside pinned DNA snapshots.
    """

    REQUIRED_ENVELOPE = ("page_number", "page_type", "genplay_id",
                         "channel_code", "episode_code")

    # Fields that are forbidden on pages (locked document = no status)
    FORBIDDEN_STATUS_FIELDS = ("qc_status", "document_status",
                               "lock_status", "quality_control")

    def __init__(self, binder_path: str | Path):
        self.binder_path = Path(binder_path)
        self.errors: list[str] = []
        self._pages: list[dict] = []

    def validate(self) -> list[str]:
        """Load and validate the binder.  Returns list of error strings."""
        self.errors = []
        self._pages = self._load_pages()
        if not self._pages:
            self.errors.append("no pages found")
            return self.errors

        self._check_envelopes()
        self._check_dna_resolution()
        self._check_shot_numbers()
        self._check_shot_pairing()
        self._check_toc()
        self._check_no_status_fields()

        return self.errors

    def _load_pages(self) -> list[dict]:
        """Load pages from binder.json or from individual page-*.json files."""
        binder_json = self.binder_path / "binder.json"
        if binder_json.exists():
            with open(binder_json, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            return data.get("genplay_binder", {}).get("pages", [])

        # Try individual page files
        pages_dir = self.binder_path / "pages"
        if pages_dir.exists():
            pages = []
            for fpath in sorted(pages_dir.glob("page-*.json")):
                with open(fpath, "r", encoding="utf-8") as fh:
                    pages.append(json.load(fh))
            return pages

        # Maybe it's a single binder.json file
        if binder_json.exists() or self.binder_path.suffix == ".json":
            with open(self.binder_path, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            if "genplay_binder" in data:
                return data["genplay_binder"]["pages"]
            if "pages" in data:
                return data["pages"]

        return []

    def _check_envelopes(self) -> None:
        """Check that every page has the required envelope fields."""
        for p in self._pages:
            for field in self.REQUIRED_ENVELOPE:
                if field not in p:
                    self.errors.append(
                        f"page {p.get('page_number', '?')}: "
                        f"missing envelope field '{field}'")

        # Check page numbers are sequential starting at 1
        nums = [p.get("page_number") for p in self._pages
                if isinstance(p.get("page_number"), int)]
        if nums and nums != list(range(1, len(nums) + 1)):
            self.errors.append(
                f"page numbers are not sequential: {nums}")

    def _check_dna_resolution(self) -> None:
        """Check that every required_dna reference resolves to a sheet page."""
        # Build lookup of all DNA IDs that have sheets
        sheet_ids = set()
        for p in self._pages:
            pt = p.get("page_type", "")
            if pt == PT_CHARACTER_SHEET:
                sheet_ids.add(p.get("character_id", ""))
            elif pt == PT_LOCATION_SHEET:
                sheet_ids.add(p.get("location_id", ""))
            elif pt == PT_PROP_SHEET:
                for prop in p.get("props", []):
                    sheet_ids.add(prop.get("asset_id", ""))

        # Check every required_dna on shot pages resolves
        for p in self._pages:
            if p.get("page_type") == PT_SHOT_IMAGE:
                for dna_id in p.get("required_dna", []):
                    if dna_id not in sheet_ids:
                        self.errors.append(
                            f"page {p.get('page_number')}: "
                            f"required_dna '{dna_id}' has no matching sheet page")

    def _check_shot_numbers(self) -> None:
        """Check that global_shot_number is cumulative and never resets."""
        image_pages = [p for p in self._pages
                       if p.get("page_type") == PT_SHOT_IMAGE]
        expected = 1
        for p in image_pages:
            gsn = p.get("global_shot_number", 0)
            if gsn != expected:
                self.errors.append(
                    f"page {p.get('page_number')}: global_shot_number={gsn}, "
                    f"expected {expected} (not cumulative)")
            expected += 1

    def _check_shot_pairing(self) -> None:
        """Check that every shot has exactly one image page and one walkthrough
        page, paired by shot_id."""
        shot_ids = []
        for p in self._pages:
            if p.get("page_type") in (PT_SHOT_IMAGE, PT_SHOT_WALKTHROUGH):
                shot_ids.append(p.get("shot_id", ""))

        from collections import Counter
        counts = Counter(shot_ids)
        for shot_id, count in counts.items():
            if count != 2:
                self.errors.append(
                    f"shot '{shot_id}' has {count} pages "
                    f"(expected exactly 2: one image + one walkthrough)")

        # Check pairing: image page should come before walkthrough page
        seen = set()
        for p in self._pages:
            sid = p.get("shot_id", "")
            pt = p.get("page_type")
            if pt == PT_SHOT_IMAGE:
                if sid in seen:
                    self.errors.append(
                        f"page {p.get('page_number')}: duplicate image page for "
                        f"shot '{sid}'")
                seen.add(sid)
            elif pt == PT_SHOT_WALKTHROUGH:
                if sid not in seen:
                    self.errors.append(
                        f"page {p.get('page_number')}: walkthrough page for "
                        f"shot '{sid}' appears before its image page")

    def _check_toc(self) -> None:
        """Check that the TOC matches the actual page count."""
        toc_pages = [p for p in self._pages
                     if p.get("page_type") == PT_TOC]
        if not toc_pages:
            self.errors.append("missing table_of_contents page")
            return

        toc = toc_pages[0]
        toc_entries = toc.get("toc", [])
        # TOC should list all pages except cover (page 1) and TOC itself (page 2)
        content_pages = [p for p in self._pages if p.get("page_number", 0) > 2]
        if len(toc_entries) != len(content_pages):
            self.errors.append(
                f"TOC lists {len(toc_entries)} entries but there are "
                f"{len(content_pages)} content pages (pages 3+)")
            return

        # Verify TOC page numbers match
        toc_page_nums = {e["page"] for e in toc_entries}
        actual_nums = {p["page_number"] for p in content_pages}
        if toc_page_nums != actual_nums:
            missing = actual_nums - toc_page_nums
            extra = toc_page_nums - actual_nums
            if missing:
                self.errors.append(f"TOC missing entries for pages: {sorted(missing)}")
            if extra:
                self.errors.append(f"TOC has extra entries for pages: {sorted(extra)}")

    def _check_no_status_fields(self) -> None:
        """Check that no status fields exist outside pinned DNA snapshots."""
        for p in self._pages:
            pt = p.get("page_type", "")
            if pt in (PT_COVER, PT_TOC, PT_DIRECTOR_NOTES, PT_CHANNEL_DNA,
                      PT_SECTION_COVER, PT_POST_RECAP):
                for field in self.FORBIDDEN_STATUS_FIELDS:
                    if field in p:
                        self.errors.append(
                            f"page {p.get('page_number')}: forbidden status "
                            f"field '{field}' on {pt} page")

        # Also check nested objects
        for p in self._pages:
            for field in self.FORBIDDEN_STATUS_FIELDS:
                # Check top-level and in content dicts
                if field in p:
                    self.errors.append(
                        f"page {p.get('page_number')}: forbidden status "
                        f"field '{field}'")


# ---------------------------------------------------------------------------
# BinderReader
# ---------------------------------------------------------------------------

class BinderReader:
    """Reads individual pages from a compiled binder.

    Supports reading a single page by number or file name without loading
    the entire binder.  Also provides convenience methods for fetching
    shot prompts and referenced DNA sheets for generation dispatch.
    """

    def __init__(self, binder_dir: str | Path):
        self.binder_dir = Path(binder_dir)
        self._pages_dir = self.binder_dir / "pages"
        self._binder_json = self.binder_dir / "binder.json"
        self._cache: dict[int, dict] = {}
        self._index: dict[str, int] = {}  # filename → page_number

    def _load_index(self) -> None:
        """Load the page index from binder.json (fast path)."""
        if not self._binder_json.exists():
            # Fall back to scanning page files
            if self._pages_dir.exists():
                for fpath in sorted(self._pages_dir.glob("page-*.json")):
                    num = int(fpath.stem.split("-")[1])
                    self._index[fpath.name] = num
            return
        with open(self._binder_json, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        pages = data.get("genplay_binder", {}).get("pages", [])
        for p in pages:
            self._index[p.get("page_number", 0)] = p.get("page_number", 0)

    def read_page(self, page_number: int | None = None,
                  filename: str | None = None) -> dict | None:
        """Read a single page by number or filename.

        Returns the page dict, or None if not found.
        """
        if page_number is not None and page_number in self._cache:
            return self._cache[page_number]

        if page_number is not None:
            fpath = self._find_page_by_number(page_number)
        elif filename is not None:
            fpath = self._pages_dir / filename
        else:
            return None

        if not fpath or not fpath.exists():
            return None

        with open(fpath, "r", encoding="utf-8") as fh:
            page = json.load(fh)

        if page_number is not None:
            self._cache[page_number] = page

        return page

    def _find_page_by_number(self, page_number: int) -> Path | None:
        """Find the file path for a given page number."""
        if self._binder_json.exists():
            with open(self._binder_json, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            pages = data.get("genplay_binder", {}).get("pages", [])
            for p in pages:
                if p.get("page_number") == page_number:
                    # Find matching file
                    fname = self._page_filename_for(p)
                    fpath = self._pages_dir / fname
                    if fpath.exists():
                        return fpath
                    return None
            return None

        # Scan pages directory
        if self._pages_dir.exists():
            for fpath in self._pages_dir.glob(f"page-{page_number:03d}-*.json"):
                return fpath
        return None

    def _page_filename_for(self, page: dict) -> str:
        """Reconstruct filename from page dict (delegates to module-level function)."""
        return _page_filename(page)

    def get_shot_pages(self, shot_id: str) -> dict[str, dict] | None:
        """Get the image and walkthrough pages for a given shot_id."""
        if not self._binder_json.exists():
            return None
        with open(self._binder_json, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        pages = data["genplay_binder"]["pages"]
        result = {}
        for p in pages:
            if p.get("shot_id") == shot_id:
                pt = p.get("page_type")
                if pt == PT_SHOT_IMAGE:
                    result["image"] = p
                elif pt == PT_SHOT_WALKTHROUGH:
                    result["walkthrough"] = p
        if not result:
            return None
        return result

    def get_dna_sheet(self, dna_id: str) -> dict | None:
        """Find the data sheet page for a given DNA/genplay ID."""
        if not self._binder_json.exists():
            return None
        with open(self._binder_json, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        pages = data["genplay_binder"]["pages"]
        for p in pages:
            pt = p.get("page_type")
            if pt == PT_CHARACTER_SHEET and p.get("character_id") == dna_id:
                return p
            if pt == PT_LOCATION_SHEET and p.get("location_id") == dna_id:
                return p
            if pt == PT_PROP_SHEET:
                for prop in p.get("props", []):
                    if prop.get("asset_id") == dna_id:
                        return prop
        return None

    def get_generation_prompts(self, shot_id: str) -> dict[str, str] | None:
        """Fetch the image and video generation prompts for a shot.

        Returns a dict with keys 'image_prompt' and 'video_prompt',
        plus 'required_dna' and 'reference_images' for identity enforcement.
        """
        pages = self.get_shot_pages(shot_id)
        if not pages:
            return None

        result = {}
        img = pages.get("image", {})
        if img:
            result["image_prompt"] = img.get("image_generation_prompt", "")
            result["required_dna"] = img.get("required_dna", [])
            result["reference_images"] = img.get("reference_images", [])
            result["negative"] = img.get("negative", [])

        wl = pages.get("walkthrough", {})
        if wl:
            result["video_prompt"] = wl.get("video_generation_prompt", "")
            result["dialogue"] = wl.get("dialogue", [])
            result["camera_and_action"] = wl.get("camera_and_action_list", [])

        return result

    def list_shot_ids_in_order(self) -> list[str]:
        """Return all shot_ids in global shot order (enforces generation order)."""
        if not self._binder_json.exists():
            return []
        with open(self._binder_json, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        pages = data["genplay_binder"]["pages"]
        image_pages = [p for p in pages
                       if p.get("page_type") == PT_SHOT_IMAGE]
        image_pages.sort(key=lambda p: p.get("global_shot_number", 0))
        return [p["shot_id"] for p in image_pages]


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _cmd_compile(args: argparse.Namespace) -> int:
    """Compile a master JSON into a paged binder."""
    with open(args.master, "r", encoding="utf-8") as fh:
        master = json.load(fh)

    # Optionally resolve DNA references
    dna_client = None
    if args.dna_root:
        sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
        try:
            from dna.dao import DNAClient  # type: ignore
            dna_client = DNAClient(root=args.dna_root)
        except ImportError:
            print(f"WARN: dna DAO not available; running without DNA resolution",
                  file=sys.stderr)

    compiler = BinderCompiler(master, dna_client=dna_client)
    pages = compiler.compile()
    written = compiler.write_pages(args.output)
    print(f"Compiled {len(pages)} pages to {args.output}/")
    for fpath in written:
        print(f"  {fpath}")
    return 0


def _cmd_validate(args: argparse.Namespace) -> int:
    """Validate a binder directory or binder.json."""
    validator = BinderValidator(args.binder)
    errors = validator.validate()
    if errors:
        print(f"FAIL  {args.binder}")
        for err in errors:
            print(f"      - {err}")
        return 1
    page_count = len(validator._pages)
    print(f"OK    {args.binder}  ({page_count} pages validated)")
    return 0


def _cmd_read(args: argparse.Namespace) -> int:
    """Read a single page from a binder."""
    reader = BinderReader(args.binder)
    page = reader.read_page(page_number=args.page, filename=args.filename)
    if page is None:
        if args.page:
            print(f"ERROR: page {args.page} not found in {args.binder}")
        else:
            print(f"ERROR: file '{args.filename}' not found in {args.binder}/pages/")
        return 1
    print(json.dumps(page, indent=2, ensure_ascii=False))
    return 0


def _cmd_self_check(args: argparse.Namespace) -> int:
    """Self-check: compile the example master and validate the output."""
    master_path = EXAMPLE_DIR / "genplay-master-example.json"
    with open(master_path, "r", encoding="utf-8") as fh:
        master = json.load(fh)

    tmp = tempfile.mkdtemp(prefix="genplay_selftest_")
    try:
        compiler = BinderCompiler(master)
        pages = compiler.compile()
        assert len(pages) >= 10, f"expected >=10 pages, got {len(pages)}"

        # Write to temp dir
        written = compiler.write_pages(tmp)
        assert len(written) > 0

        # Validate
        validator = BinderValidator(tmp)
        errors = validator.validate()
        assert not errors, f"validation errors: {errors}"

        # Test reader
        reader = BinderReader(tmp)
        cover = reader.read_page(page_number=1)
        assert cover["page_type"] == "cover", f"expected cover, got {cover['page_type']}"

        # Find a shot_id
        for p in pages:
            if p.get("page_type") == "shot_image_page":
                shot_id = p["shot_id"]
                break
        else:
            assert False, "no shot_image_page in compiled output"

        prompts = reader.get_generation_prompts(shot_id)
        assert prompts is not None, f"no prompts for {shot_id}"
        assert prompts["image_prompt"] != "", "image prompt is empty"
        assert prompts["video_prompt"] != "", "video prompt is empty"

        ids = reader.list_shot_ids_in_order()
        assert len(ids) >= 1, "no shot IDs found"

        print(f"genplay self-check: PASS  (root={tmp}, pages={len(pages)})")
        return 0
    finally:
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="genplay/binder.py",
        description="GenPlay Paged Binder — compiler, validator, and reader.")
    sub = parser.add_subparsers(dest="command", required=True)

    # compile
    p_compile = sub.add_parser("compile", help="Compile a master JSON into a binder.")
    p_compile.add_argument("--master", required=True, help="Path to locked master JSON.")
    p_compile.add_argument("--output", required=True,
                           help="Output directory (e.g. channels/GN/episodes/GN-E001/genplay).")
    p_compile.add_argument("--dna-root", default=None,
                           help="Path to DNA registry root for resolving DNA IDs (optional).")
    p_compile.set_defaults(func=_cmd_compile)

    # validate
    p_validate = sub.add_parser("validate", help="Validate a binder directory.")
    p_validate.add_argument("--binder", required=True,
                          help="Path to binder directory (containing binder.json or pages/).")
    p_validate.set_defaults(func=_cmd_validate)

    # read
    p_read = sub.add_parser("read", help="Read a single page.")
    p_read.add_argument("--binder", required=True, help="Path to binder directory.")
    group = p_read.add_mutually_exclusive_group(required=True)
    group.add_argument("--page", type=int, help="Page number to read.")
    group.add_argument("--filename", help="Page filename to read.")
    p_read.set_defaults(func=_cmd_read)

    # self-check
    p_sc = sub.add_parser("self-check", help=argparse.SUPPRESS)
    p_sc.set_defaults(func=_cmd_self_check)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
