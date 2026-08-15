#!/usr/bin/env bash
# scripts/structure-audit.sh
# Fails fast if the repo drifts from the studio backlot layout.
# Wire into CI and as a pre-commit hook. Exit non-zero on any drift.
set -uo pipefail; fail=0
drift(){ echo "DRIFT: $1"; fail=1; }

# 1. No loose code/asset files at the repo root (production surface lives in Gem-Studio/)
find . -maxdepth 1 -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' -o -name '*.png' \) | grep -q . \
  && drift "loose code/asset files at repo root"

# 2. No raw assets sitting directly under Gem-Studio/ — they must be under assets/
find Gem-Studio -maxdepth 1 -type f \( -name '*.css' -o -name '*.js' -o -name '*.png' \) | grep -q . \
  && drift "assets outside Gem-Studio/assets/"

# 3. Canonical files exist in their enforced homes
[ -e Gem-Studio/assets/css/tokens.css ] || drift "tokens.css missing from assets/css/"
[ -e Gem-Studio/assets/css/app.css ]    || drift "app.css missing from assets/css/"
[ -e Gem-Studio/assets/js/app.js ]     || drift "app.js missing from assets/js/"
[ -e Gem-Studio/index.html ]           || drift "index.html missing from Gem-Studio/"
[ -e Gem-Studio/assets/img/logo.png ] || drift "logo.png missing from assets/img/"
[ -e Gem-Studio/assets/img/gem-mark.png ] || drift "gem-mark.png missing from assets/img/"

# 4. One file per role (exclude _attic quarantine & .git so superseded copies don't count)
n_index=$(find . -name 'index.html' -not -path './.git/*' -not -path '*/_attic/*' | wc -l)
[ "$n_index" = 1 ] || drift "expected exactly 1 canonical index.html, found $n_index"
n_appjs=$(find . -name 'app.js' -not -path './.git/*' -not -path '*/_attic/*' | wc -l)
[ "$n_appjs" = 1 ] || drift "expected exactly 1 canonical app.js, found $n_appjs"
n_appcss=$(find . -name 'app.css' -not -path './.git/*' -not -path '*/_attic/*' | wc -l)
[ "$n_appcss" = 1 ] || drift "expected exactly 1 canonical app.css, found $n_appcss"
n_tokens=$(find . -name 'tokens.css' -not -path './.git/*' -not -path '*/_attic/*' | wc -l)
[ "$n_tokens" = 1 ] || drift "expected exactly 1 canonical tokens.css, found $n_tokens"

exit $fail
