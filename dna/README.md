# Gem-Studio DNA

The authoritative, in-universe entity system for Gem-Studio productions.
DNA is JSON — the master God-view database. Images and video are projections.

## The Big 3

| DNA | `dna_type` | `dna_id` prefix | Collection | Source of truth for |
|-----|------------|-----------------|------------|---------------------|
| Character DNA | CDNA | `CHAR-` | `characters` | characters (with wardrobe) |
| Location DNA | LDNA | `LOC-` | `locations` | sets and environments |
| Prop DNA (PDNA) | PDNA | `PROP-` | `props` | Prop Master registry: hero props, hand props, channel assets, electronics, vehicles, animals |

PDNA is a **Prop Master registry**, not an asset warehouse — an object becomes
PDNA only if it passes the gate (handled, moves between locations, changes
state, plot-important, channel asset, or vehicle/animal; see
`docs/PDNA_CREATION_GUIDE.md`). Refactored from legacy ADNA. Costume → CDNA
wardrobe; Weather → LDNA climate; Decor/generic furniture/installed TVs → LDNA
set_dressing.

ID format: `PREFIX` + `-` + 32 uppercase hex chars from SHA-256 of the deterministic seed, e.g. `CHAR-FA52F48A9EC776D68A09FEF43CB644C6`. Patterns: `^CHAR-[A-F0-9]{32}$`, `^LOC-[A-F0-9]{32}$`, `^PROP-[A-F0-9]{32}$`.

## JSON is the source of truth

- Every DNA record is valid JSON.
- The JSON Schemas in `schemas/` are the machine-readable law.
- The documents in `docs/` are the human-readable explanation. They stay aligned.

## Production flow

```
Approved DNA JSON  ->  Data Sheet Image
                   ->  GenPlay Shot Still
                 ->  Shot JSON + Shot Image
                 ->  Video Generation
```

DNA feeds generation; the reverse never happens. The Pre-Prompt Enricher (built later) filters this exhaustive database into the minimal prompt a given pipeline stage needs.

## Repository layout

```
dna/
  README.md            <- you are here
  DECISIONS.md         <- locked decisions + open questions
  docs/                <- human-readable specifications
    00-overview.md      purpose, flow, casting, data sheets
    10-cdna.md          Character DNA (7 morphology domains, v2 blocks)
    20-ldna.md          Location DNA (spatial, sensory, casting profile)
    30-pdna.md          Prop DNA registry (gate, prop types, creation guide ref)
    90-glossary.md      terms
    PDNA_CREATION_GUIDE.md  on-demand PDNA creation process + blank template
  schemas/             <- JSON Schemas (Draft-07) — the law
    cdna.schema.json
    ldna.schema.json
    pdna.schema.json
  examples/            <- one exhaustive, schema-valid example per type
    cdna.example.json
    ldna.example.json
    pdna.example.json
  props/               <- Prop Master registry records ({PROP-ID}.json)
  templates/           <- authoring templates (pdna.template.json)
  validator.py         <- validates a record against its schema
  dao.py                <- local JSON file DAO stub (no database yet)
```

## Validating a record

```bash
python dna/validator.py --all
python dna/validator.py --type cdna --file dna/examples/cdna.example.json
python dna/validator.py --type ldna --file dna/examples/ldna.example.json
python dna/validator.py --type pdna --file dna/examples/pdna.example.json
```

If the `jsonschema` library is available, full Draft-07 validation runs; otherwise a documented minimal structural check runs and a warning is printed.

## Accessing records programmatically

```python
from dao import DNAClient   # from dna/dao.py
db = DNAClient(root="dna_store")
db.characters.get_by_id("CHAR-...")
db.props.insert(record_dict)   # validates before write; rejects duplicates
db.load("PROP-...")           # dispatch by prefix
```

## In scope / out of scope

**In scope:** CDNA, LDNA, PDNA records, schemas, examples, validator, DAO stub.

**Out of scope (explicitly deferred, see DECISIONS.md):** Film DNA (FDNA), Studio DNA, Channel DNA, Season DNA, Socials DNA, GenPlay schema/pipeline, video generation pipeline, data-sheet image generation, prompt enrichment pipeline. None of these have been built.

## Relationship between artifacts

- `examples/*.example.json` — concrete records used for validation + developer reference.
- `schemas/*.schema.json` — enforced by `validator.py` and `dao.validate_before_write`.
- `docs/*` — explain the same fields in prose; field names are copied verbatim from the schemas.
- `validator.py` and `dao.py` are importable; `dao.py` imports `validator.py` so validation rules are never duplicated.
