#!/usr/bin/env bash
set -euo pipefail

DIRS=(
  /home/user/.claude
)

for d in "${DIRS[@]}"; do
  sudo mkdir -p "$d"
  sudo chown -R user:user "$d"
  chmod 700 "$d"
done
