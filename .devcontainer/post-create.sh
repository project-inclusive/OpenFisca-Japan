#!/usr/bin/env bash
set -euo pipefail

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

# Install Codex CLI (official installer, falling back to the npm package).
if ! curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh; then
  echo "Official Codex installer failed. Falling back to npm package."
  sudo npm install -g @openai/codex@latest
fi

# Add `gh copilot` when the GitHub CLI is present.
if command -v gh >/dev/null 2>&1; then
  gh extension install github/gh-copilot --force || true
fi
