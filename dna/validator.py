#!/usr/bin/env python3
"""Gem-Studio DNA validator.

Validates a DNA JSON record against its schema.

Usage:
    python dna/validator.py --type cdna  --file dna/examples/cdna.example.json
    python dna/validator.py --type ldna  --file dna/examples/ldna.example.json
    python dna/validator.py --type pdna  --file dna/examples/pdna.example.json
    python dna/validator.py --all                       # validate every example

Behavior:
  - Resolves the schema for the requested DNA type.
  - If ``jsonschema`` is importable (Draft-07), runs FULL schema validation
    (every field, enum, pattern, required check). This is the preferred path.
  - If ``jsonschema`` is NOT available, falls back to a MINIMAL structural check:
    file exists, JSON parses, required top-level fields exist, dna_id prefix
    matches the expected type, dna_type matches the expected type, status is
    valid, and (PDNA only) Costume is rejected.

A full-schema-library notice is printed when the fallback is used so the operator
knows the run is structural-only.

Exit code 0 = valid, 1 = invalid, 2 = usage error.
No third-party packages are installed by this tool; it adapts to the environment.
No database is touched.
"""
from __future__ import annotations

import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SCHEMA_DIR = os.path.join(HERE, "schemas")
EXAMPLE_DIR = os.path.join(HERE, "examples")


# ---------------------------------------------------------------------------
# Type registry
# ---------------------------------------------------------------------------
# Each type: (schema filename, dna_type const, required prefix, allowed statuses)
DNA_TYPES = {
    "cdna": {
        "schema": "cdna.schema.json",
        "dna_type": "CDNA",
        "prefix": "CHAR-",
        "statuses": ["draft", "active", "archived", "retired", "deceased", "destroyed"],
        "required": ["dna_id", "dna_type", "channel", "status", "metadata", "identity_core",
                     "physical", "cinematic", "image_gen_prompt"],
    },
    "ldna": {
        "schema": "ldna.schema.json",
        "dna_type": "LDNA",
        "prefix": "LOC-",
        "statuses": ["draft", "active", "archived", "retired", "deceased", "destroyed"],
        "required": ["dna_id", "dna_type", "channel", "status", "identity_core",
                     "spatial", "sensory", "atmosphere"],
    },
    "pdna": {
        "schema": "pdna.schema.json",
        "dna_type": "PDNA",
        "prefix": "PROP-",
        "statuses": ["draft", "active", "archived", "retired", "deceased", "destroyed"],
        "required": ["dna_id", "dna_type", "channel", "status", "identity_core", "physical"],
    },
}


# ---------------------------------------------------------------------------
# Minimal structural validator (fallback when jsonschema is absent)
# ---------------------------------------------------------------------------
def _prefix_for(dna_id: str) -> str | None:
    for t in DNA_TYPES.values():
        if dna_id.startswith(t["prefix"]):
            return t["prefix"]
    return None


def minimal_validate(rec: dict, dtype_key: str) -> list[str]:
    """Return a list of human-readable error strings. Empty == pass."""
    errs: list[str] = []
    reg = DNA_TYPES[dtype_key]

    for req in reg["required"]:
        if req not in rec or rec[req] is None:
            errs.append(f"missing required field: {req}")

    dt = rec.get("dna_type")
    if dt != reg["dna_type"]:
        errs.append(f"dna_type mismatch: expected {reg['dna_type']!r}, got {dt!r}")

    dna_id = rec.get("dna_id", "")
    if not dna_id.startswith(reg["prefix"]):
        errs.append(f"dna_id prefix mismatch: expected {reg['prefix']!r}, got {dna_id[:12]!r}...")

    status = rec.get("status", "")
    if status not in reg["statuses"]:
        errs.append(f"invalid status: {status!r} (allowed: {reg['statuses']})")

    # PDNA-specific rule: Costume must never appear.
    if dtype_key == "pdna":
        prop_type = rec.get("identity_core", {}).get("prop_type", "")
        if isinstance(prop_type, str) and prop_type.lower() == "costume":
            errs.append("PDNA must not use prop_type='Costume' (wardrobe belongs in CDNA)")
        if "costume" in {k.lower() for k in rec.get("type_branches", {}).keys()}:
            errs.append("PDNA must not contain a Costume type branch (wardrobe belongs in CDNA)")

    return errs


# ---------------------------------------------------------------------------
# Full schema validator (preferred; uses jsonschema if present)
# ---------------------------------------------------------------------------
def full_validate(rec: dict, dtype_key: str) -> tuple[bool, list[str]]:
    try:
        import jsonschema  # type: ignore
    except Exception:
        return False, []

    schema_path = os.path.join(SCHEMA_DIR, DNA_TYPES[dtype_key]["schema"])
    try:
        with open(schema_path, "r", encoding="utf-8") as fh:
            schema = json.load(fh)
    except FileNotFoundError:
        return False, [f"schema not found: {schema_path}"]
    except json.JSONDecodeError as exc:
        return False, [f"schema is not valid JSON: {exc}"]

    # Meta-validate the schema itself.
    try:
        jsonschema.Draft7Validator.check_schema(schema)
    except jsonschema.SchemaError as exc:
        return False, [f"schema is not valid Draft-07: {exc.message}"]

    validator = jsonschema.Draft7Validator(schema)
    errs = sorted(validator.iter_errors(rec), key=lambda e: list(e.absolute_path))
    messages = []
    for err in errs:
        loc = ".".join(str(p) for p in err.absolute_path) or "<root>"
        messages.append(f"{loc}: {err.message}")
    # Cross-check the PDNA Costume rule even under full validation (belt + suspenders).
    if dtype_key == "pdna":
        pt = rec.get("identity_core", {}).get("prop_type", "")
        if isinstance(pt, str) and pt.lower() == "costume":
            messages.append("identity_core.prop_type must not be 'Costume' (wardrobe lives in CDNA)")
    return True, messages


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------
def validate_file(path: str, dtype_key: str | None = None) -> bool:
    if not os.path.isfile(path):
        print(f"FAIL  {path}\n      file does not exist")
        return False
    try:
        with open(path, "r", encoding="utf-8") as fh:
            rec = json.load(fh)
    except json.JSONDecodeError as exc:
        print(f"FAIL  {path}\n      JSON parse error: {exc}")
        return False
    if not isinstance(rec, dict):
        print(f"FAIL  {path}\n      top-level JSON value must be an object")
        return False

    # Let the record declare its own type when --type is not given.
    if dtype_key is None:
        dt = rec.get("dna_type", "")
        inv = {v["dna_type"]: k for k, v in DNA_TYPES.items()}
        dtype_key = inv.get(dt)
        if dtype_key is None:
            print(f"FAIL  {path}\n      unknown dna_type: {dt!r}")
            return False
    else:
        if dtype_key not in DNA_TYPES:
            print(f"FAIL  {path}\n      unknown type key: {dtype_key!r}")
            return False

    used_full, full_errs = full_validate(rec, dtype_key)
    if used_full:
        if full_errs:
            print(f"FAIL  {path}")
            for m in full_errs:
                print(f"      - {m}")
            return False
        print(f"OK    {path}   (full JSON Schema validation, type={DNA_TYPES[dtype_key]['dna_type']})")
        return True
    else:
        # Fallback: minimal structural validation.
        print(f"WARN  {path}   (jsonschema library unavailable; running minimal structural check)")
        errs = minimal_validate(rec, dtype_key)
        if errs:
            print(f"FAIL  {path}")
            for m in errs:
                print(f"      - {m}")
            print("      full JSON Schema validation requires the 'jsonschema' library")
            return False
        print(f"OK    {path}   (minimal structural check passed; install 'jsonschema' for full validation)")
        return True


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="dna/validator.py", description="Validate Gem-Studio DNA records.")
    ap.add_argument("--type", choices=list(DNA_TYPES), help="DNA type key (cdna/ldna/pdna).")
    ap.add_argument("--file", help="Path to a DNA JSON record to validate.")
    ap.add_argument("--all", action="store_true", help="Validate every example in dna/examples/.")
    args = ap.parse_args(argv)

    if not args.all and not args.file:
        ap.error("provide --file <path> or use --all")

    if args.all:
        files = [
            ("cdna", os.path.join(EXAMPLE_DIR, "cdna.example.json")),
            ("ldna", os.path.join(EXAMPLE_DIR, "ldna.example.json")),
            ("pdna", os.path.join(EXAMPLE_DIR, "pdna.example.json")),
        ]
        results = [validate_file(path, dtype) for dtype, path in files]
        return 0 if all(results) else 1

    return 0 if validate_file(args.file, args.type) else 1


if __name__ == "__main__":
    sys.exit(main())
