#!/usr/bin/env bash
set -euo pipefail

# Bump the patch version for root + all sub-packages and publish.
# Usage:
#   ./scripts/bump-version.sh          # bump patch (0.2.8 → 0.2.9)
#   ./scripts/bump-version.sh minor    # bump minor (0.2.8 → 0.3.0)
#   ./scripts/bump-version.sh 1.0.0    # set explicit version

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_PKG="$ROOT_DIR/package.json"

# Resolve current version from root package.json
CURRENT=$(node -p "require('$ROOT_PKG').version")
echo "Current version: $CURRENT"

BUMP="${1:-patch}"

if [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
  # Explicit version given
  NEXT="$BUMP"
elif [[ "$BUMP" == "patch" ]]; then
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
  NEXT="$MAJOR.$MINOR.$((PATCH + 1))"
elif [[ "$BUMP" == "minor" ]]; then
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
  NEXT="$MAJOR.$((MINOR + 1)).0"
elif [[ "$BUMP" == "major" ]]; then
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
  NEXT="$((MAJOR + 1)).0.0"
else
  echo "Usage: $0 [patch|minor|major|<explicit-version>]"
  exit 1
fi

echo "Bumping: $CURRENT → $NEXT"
echo ""

# Collect all package.json files (root + sub-packages)
PKG_FILES=("$ROOT_PKG")
for f in "$ROOT_DIR"/packages/*/package.json; do
  PKG_FILES+=("$f")
done

# Replace version in each file
for f in "${PKG_FILES[@]}"; do
  sed -i '' "s/\"version\": \"$CURRENT\"/\"version\": \"$NEXT\"/" "$f"
  echo "  ✓ $(basename "$(dirname "$f")")/package.json → $NEXT"
done

echo ""
echo "Done! All packages bumped to $NEXT."
echo ""
echo "Next steps:"
echo "  1. npm login          (if not logged in)"
echo "  2. pnpm run release:publish"
