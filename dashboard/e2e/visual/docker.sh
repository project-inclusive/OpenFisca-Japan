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
visual_container=''
trap '
  if [[ -n "$visual_container" ]]; then
    docker rm -f "$visual_container" >/dev/null || true
  fi
  rm -rf "$visual_oracle"
' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
visual_revision=''
if [[ "$visual_mode" == capture ]]; then
  visual_revision=$(git -C "$visual_repo" rev-parse --verify "${visual_ref}^{commit}")
  # Archive only the requested source, excluding local edits, node_modules and dist.
  git -C "$visual_repo" archive --output="$visual_oracle/oracle.tar" "$visual_revision" dashboard
  echo "Capturing oracle from $visual_revision"
fi

# Include uncommitted and untracked dashboard edits so compare can check changes
# before committing them. Never send host dependencies or generated build output.
tar -C "$visual_repo" --exclude=node_modules --exclude=dist --exclude=tmp \
  -cf "$visual_oracle/dashboard.tar" dashboard

visual_container=$(docker create --init --ipc=host --platform linux/amd64 \
  --workdir /work/dashboard \
  --env CI=1 --env HUSKY=0 \
  --env "VISUAL_MODE=$visual_mode" --env "VISUAL_REVISION=$visual_revision" \
  mcr.microsoft.com/playwright:v1.64.1-noble bash -euo pipefail -c '
    mkdir -p /work/tmp/playwright-visual
    tar -xf /tmp/dashboard.tar -C /work
    # Isolated Linux dependencies; the host node_modules is never used or replaced.
    npm ci
    node -e "require(\"node:assert/strict\").equal(require(\"@playwright/test/package.json\").version, \"1.64.1\")"
    if [[ "$VISUAL_MODE" == capture ]]; then
      mkdir -p /tmp/visual-oracle
      tar -xf /tmp/visual-oracle.tar -C /tmp/visual-oracle
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
  ')

# docker cp resolves local paths in this shell, even when the daemon is on the
# devcontainer host. Copy archives to the image's existing /tmp before starting.
docker cp "$visual_oracle/dashboard.tar" "$visual_container:/tmp/dashboard.tar"
if [[ "$visual_mode" == capture ]]; then
  docker cp "$visual_oracle/oracle.tar" "$visual_container:/tmp/visual-oracle.tar"
fi

visual_status=0
docker start --attach "$visual_container" || visual_status=$?

# Keep the stopped container until failure diagnostics have also been recovered.
docker cp "$visual_container:/work/tmp/playwright-visual" "$visual_oracle/results"
mkdir -p "$visual_repo/tmp"
rm -rf "$visual_repo/tmp/playwright-visual"
mv "$visual_oracle/results" "$visual_repo/tmp/playwright-visual"
if [[ "$visual_mode" == capture && "$visual_status" == 0 ]]; then
  docker cp "$visual_container:/work/dashboard/e2e/visual/snapshots/." \
    "$visual_repo/dashboard/e2e/visual/snapshots"
fi
exit "$visual_status"
