#!/usr/bin/env bash
# Builds every edition branch at its current head and assembles one GitHub Pages site:
# each branch lands at the path its edition.json names (main = V1 → /, v2-wip = V2 → /v2/).
set -euo pipefail

OUT="${1:-pages}"
rm -rf "$OUT" && mkdir -p "$OUT"
OUT=$(cd "$OUT" && pwd)
built=()

# The root edition first: the next one then fills its own sub-folder.
for branch in main v2-wip; do
  sha=$(git rev-parse --verify -q "origin/$branch") || { echo "no $branch branch, skipped"; continue; }
  dir=$(mktemp -d)
  git worktree add -q --detach "$dir" "$sha"
  trap 'git worktree remove --force "$dir" 2>/dev/null || true' EXIT
  # A branch from before editions (no edition.json) is V1, at the root.
  path=$(node -e "const f = '$dir/edition.json'; if (!require('fs').existsSync(f)) process.exit(0); const e = require(f); process.stdout.write(e.editions[e.current])")
  echo "$branch ($sha) → /$path"
  (cd "$dir" && npm ci --no-audit --no-fund > /dev/null && npm run build > /dev/null)
  mkdir -p "$OUT/$path"
  cp -R "$dir/dist/." "$OUT/$path"
  git worktree remove --force "$dir"
  trap - EXIT
  built+=("$branch=$sha")
done

[ ${#built[@]} -gt 0 ] || { echo "nothing built"; exit 1; }
echo "built=${built[*]}" >> "${GITHUB_OUTPUT:-/dev/null}"
