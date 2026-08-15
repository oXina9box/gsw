#!/usr/bin/env python3
"""Gem-Studio DNA DAO.

A clean, local-only data-access layer for DNA records.

WHAT THIS IS
    A file-backed stub that stores one record per JSON file per collection.
    It validates every write against the matching schema (delegating to
    ``validator.py``) before persisting, and refuses to overwrite an existing
    record unless an upsert is explicitly requested.

WHAT THIS IS NOT
    - No MongoDB integration (deferred by design; see DECISIONS.md #6).
    - No live database connection, no network, no credentials.
    - No ORM. The on-disk layout is plain JSON you can inspect/rename.

Record layout (on-disk):
    <root>/<collection>/<dna_id>.json      e.g.  ./dna_store/characters/CHAR-AB...json

Usage:
    from dao import DNAClient
    db = DNAClient(root="dna_store")
    rec = db.characters.get_by_id("CHAR-...")
    db.characters.insert(record_dict)          # rejects duplicates, validates first
    db.chars.upsert(record_dict)               # overwrites / creates
    found = db.props.find(lambda r: r["status"] == "active")

Run ``python3 dna/dao.py`` for a self-check that writes to a temporary directory
and asserts insert/upsert/find/get_by_id/reject-duplicate behavior.
"""
from __future__ import annotations

import json
import os
import sys
import tempfile
from dataclasses import dataclass
from typing import Any, Callable, Iterable

# Make validator.py importable when this module is run as a script.
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)

import validator as _v  # noqa: E402  (sibling module)


@dataclass
class DNARecord:
    """An in-memory DNA record wrapping its raw JSON object."""

    dna_id: str
    dna_type: str
    data: dict

    @classmethod
    def from_dict(cls, data: dict) -> "DNARecord":
        if not isinstance(data, dict):
            raise TypeError("a DNA record must be a JSON object")
        return cls(dna_id=data.get("dna_id", ""), dna_type=data.get("dna_type", ""), data=data)

    def to_dict(self) -> dict:
        return self.data


class BaseDAO:
    """File-backed DAO for one DNA collection.

    A subclass sets ``collection`` and ``dtype`` (the validator type key).
    """

    collection: str = "dna"
    dtype: str = ""

    def __init__(self, root: str):
        self.root = os.path.abspath(root)
        self.coll_dir = os.path.join(self.root, self.collection)
        os.makedirs(self.coll_dir, exist_ok=True)

    # -- validation -------------------------------------------------------
    def validate_before_write(self, data: dict) -> None:
        """Validate ``data`` against schema + PDNA Costume rule. Raises ValueError on failure."""
        used_full, errs = _v.full_validate(data, self.dtype)
        if not used_full:
            errs = _v.minimal_validate(data, self.dtype)
        if errs:
            preview = "\n      ".join(errs[:25])
            raise ValueError(f"{self.dna_type_label()}: validation failed:\n      {preview}")

    def dna_type_label(self) -> str:
        return _v.DNA_TYPES.get(self.dtype, {}).get("dna_type", self.dtype.upper())

    # -- path helpers -----------------------------------------------------
    def _record_path(self, dna_id: str) -> str:
        return os.path.join(self.coll_dir, f"{dna_id}.json")

    def _iter_record_paths(self) -> Iterable[str]:
        if not os.path.isdir(self.coll_dir):
            return
        for name in os.listdir(self.coll_dir):
            if name.endswith(".json"):
                yield os.path.join(self.coll_dir, name)

    # -- CRUD -------------------------------------------------------------
    def get_by_id(self, dna_id: str) -> DNARecord | None:
        path = self._record_path(dna_id)
        if not os.path.isfile(path):
            return None
        with open(path, "r", encoding="utf-8") as fh:
            return DNARecord.from_dict(json.load(fh))

    def get_all_ids(self) -> list[str]:
        return [os.path.splitext(os.path.basename(p))[0] for p in self._iter_record_paths()]

    def find(self, predicate: Callable[[dict], bool]) -> list[DNARecord]:
        out = []
        for path in self._iter_record_paths():
            with open(path, "r", encoding="utf-8") as fh:
                rec = DNARecord.from_dict(json.load(fh))
            if predicate(rec.data):
                out.append(rec)
        return out

    def insert(self, data: dict) -> DNARecord:
        """Create a new record. Validates first; rejects duplicates."""
        self.validate_before_write(data)
        dna_id = data["dna_id"]
        if os.path.exists(self._record_path(dna_id)):
            raise FileExistsError(f"{dna_id}: record already exists; use upsert to overwrite")
        self._atomic_write(dna_id, data)
        return DNARecord.from_dict(data)

    def upsert(self, data: dict) -> DNARecord:
        """Insert or overwrite a record after validation."""
        self.validate_before_write(data)
        dna_id = data["dna_id"]
        self._atomic_write(dna_id, data)
        return DNARecord.from_dict(data)

    def _atomic_write(self, dna_id: str, data: dict) -> None:
        """Write JSON atomically: write temp then os.replace. Never partial."""
        path = self._record_path(dna_id)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        tmp = f"{path}.tmp"
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2, ensure_ascii=False)
            fh.write("\n")
        os.replace(tmp, path)

    # -- future MongoDB hook (NOT IMPLEMENTED) ----------------------------
    def to_mongo_filter(self, dna_id: str) -> dict:
        """Placeholder showing the intended Mongo query shape (collection = characters/locations/props)."""
        return {"dna_id": dna_id}


class CharacterDAO(BaseDAO):
    collection = "characters"
    dtype = "cdna"


class LocationDAO(BaseDAO):
    collection = "locations"
    dtype = "ldna"


class PropDAO(BaseDAO):
    collection = "props"
    dtype = "pdna"


class DNAClient:
    """Entry point exposing the three live DAOs.

    MongoDB integration is intentional future work; today this resolves to
    local JSON files and is safe to call offline.
    """

    def __init__(self, root: str):
        self.root = root
        self.characters = CharacterDAO(root)
        self.locations = LocationDAO(root)
        self.props = PropDAO(root)

    def load(self, dna_id: str) -> DNARecord | None:
        """Resolve any dna_id to its record regardless of collection."""
        if dna_id.startswith("CHAR-"):
            return self.characters.get_by_id(dna_id)
        if dna_id.startswith("LOC-"):
            return self.locations.get_by_id(dna_id)
        if dna_id.startswith("PROP-"):
            return self.props.get_by_id(dna_id)
        return None


# ---------------------------------------------------------------------------
# Self-check
# ---------------------------------------------------------------------------
def _selftest() -> int:
    import shutil

    tmp = tempfile.mkdtemp(prefix="dna_dao_selftest_")
    try:
        db = DNAClient(root=tmp)

        # Seed with the canonical examples so validation logic is exercised.
        cdna = json.load(open(os.path.join(_THIS_DIR, "examples", "cdna.example.json")))
        prop = json.load(open(os.path.join(_THIS_DIR, "examples", "pdna.example.json")))
        loc = json.load(open(os.path.join(_THIS_DIR, "examples", "ldna.example.json")))

        # insert
        rec = db.characters.insert(cdna)
        assert rec.dna_id == cdna["dna_id"], rec.dna_id
        assert db.characters.get_by_id(cdna["dna_id"]) is not None, "get_by_id failed"

        # duplicate insert rejected
        dup = False
        try:
            db.characters.insert(cdna)
        except FileExistsError:
            dup = True
        assert dup, "duplicate insert was not rejected"

        # find by predicate
        found = db.characters.find(lambda r: r["status"] == "active")
        assert len(found) == 1 and found[0].dna_id == cdna["dna_id"]

        # upsert overwrite
        cdna["identity_core"]["age"] = 32
        db.characters.upsert(cdna)
        again = db.characters.get_by_id(cdna["dna_id"])
        assert again.data["identity_core"]["age"] == 32

        # prop dao + cross-type client.load dispatch
        db.props.insert(prop)
        assert db.load(prop["dna_id"]).dna_id == prop["dna_id"]

        # location dao round-trip + LDNA boundary check (prop_bindings must be PROP- ids)
        db.locations.insert(loc)
        assert db.load(loc["dna_id"]).dna_id == loc["dna_id"]
        assert db.locations.find(lambda r: r["identity_core"]["zoning"] == "Commercial")[0].dna_id == loc["dna_id"]

        # validate_before_write rejects invalid data (PDNA Costume)
        bad = {
            "dna_id": "PROP-00000000000000000000000000000000",
            "dna_type": "PDNA", "channel": "grudgenudges", "status": "active",
            "identity_core": {"prop_name": "x", "prop_type": "Costume"},
            "physical": {}, "image_gen_prompt": "x",
        }
        rejected = False
        try:
            db.props.validate_before_write(bad)
        except ValueError:
            rejected = True
        assert rejected, "PDNA Costume was not rejected at validate_before_write"

        print(f"dao self-check: PASS  (root={tmp})")
        return 0
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(_selftest())
