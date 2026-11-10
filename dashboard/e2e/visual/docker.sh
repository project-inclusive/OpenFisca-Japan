#!/usr/bin/env bash
set -euo pipefail

visual_mode=${1:-compare}
visual_ref=${2:-6e5a6c6}
if [[ "$visual_mode" != compare && "$visual_mode" != capture ]] ||
  [[ $# -gt 2 ]] || [[ "$visual_mode" == compare && $# -gt 1 ]]; then
  echo 'Usage: bash e2e/visual/docker.sh compare | capture [oracle-git-ref]' >&2
  exit 1
fi

visual_repo=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
visual_oracle=$(mktemp -d)
trap 'rm -rf "$visual_oracle"' EXIT
visual_revision=''
if [[ "$visual_mode" == capture ]]; then
  visual_revision=$(git -C "$visual_repo" rev-parse --verify "${visual_ref}^{commit}")
  # Archive only the requested source, excluding local edits, node_modules and dist.
  git -C "$visual_repo" archive "$visual_revision" dashboard | tar -x -C "$visual_oracle"
  echo "Capturing oracle from $visual_revision"
fi

docker run --rm --init --ipc=host --platform linux/amd64 \
  --mount "type=bind,src=$visual_repo,dst=/work" \
  --mount 'type=volume,dst=/work/dashboard/node_modules' \
  --mount "type=bind,src=$visual_oracle,dst=/baseline,readonly" \
  --workdir /work/dashboard \
  --env CI=1 --env HUSKY=0 \
  --env "VISUAL_MODE=$visual_mode" --env "VISUAL_REVISION=$visual_revision" \
  mcr.microsoft.com/playwright:v1.64.1-noble bash -euo pipefail -c '
    # Isolated Linux dependencies; the host node_modules is never used or replaced.
    npm ci
    node -e "require(\"node:assert/strict\").equal(require(\"@playwright/test/package.json\").version, \"1.64.1\")"
    if [[ "$VISUAL_MODE" == capture ]]; then
      mkdir -p /tmp/visual-oracle
      cp -R /baseline/dashboard /tmp/visual-oracle/dashboard
      (cd /tmp/visual-oracle/dashboard && npm ci && npm run build)
      export VISUAL_CAPTURE=1
      export VISUAL_BASELINE_DIST=/tmp/visual-oracle/dashboard/dist
    else
      npm run build
    fi
    npx --no-install playwright test --config playwright.visual.config.ts
    if [[ "$VISUAL_MODE" == capture ]]; then
      node -e "require(\"node:fs\").writeFileSync(\"e2e/visual/snapshots/source.json\", JSON.stringify({revision: process.env.VISUAL_REVISION, image: \"mcr.microsoft.com/playwright:v1.64.1-noble\", platform: \"linux/amd64\", playwright: \"1.64.1\"}, null, 2) + \"\n\")"
    fi
  '
