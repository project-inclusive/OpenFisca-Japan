#!/usr/bin/env bash
set -euo pipefail

# Ensure the mounted agent-config volume dirs exist and are owned/writable by `user`.
# Shared by post-create.sh (first build) and post-start.sh (every start, in case a
# volume gets reset).
DIRS=(
  /home/user/.claude
  /home/user/.codex
  /home/user/.copilot
)

for d in "${DIRS[@]}"; do
  sudo mkdir -p "$d"
  sudo chown -R user:user "$d"
  chmod 700 "$d"
done
