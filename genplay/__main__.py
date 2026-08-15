#!/usr/bin/env python3
"""CLI entry point: python -m genplay <command>"""
from __future__ import annotations

import sys

from .binder import main

if __name__ == "__main__":
    sys.exit(main())
