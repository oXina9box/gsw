"""GenPlay Paged Binder package.

WHAT THIS IS
    The GenPlay Paged Binder compiles a locked GEMGENPLAYMASTER JSON into a
    directory of one self-contained page per concern.  Each page carries its
    identity envelope (genplay_id, channel_code, episode_code) so any single
    file can be opened, understood, and copy-pasted to a generation provider
    in isolation.

Entry point:  ``python -m genplay <command>``
"""
from __future__ import annotations

from .binder import (
    BinderCompiler,
    BinderValidator,
    BinderReader,
    main,
)

__all__ = [
    "BinderCompiler",
    "BinderValidator",
    "BinderReader",
    "main",
]

__version__ = "1.0.0"
