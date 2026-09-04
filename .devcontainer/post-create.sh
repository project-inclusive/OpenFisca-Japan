#!/usr/bin/env bash
set -euo pipefail

# Ensure the mounted volume dirs are writable before installing into them below.
# (post-start.sh repeats this on every start in case the volume gets reset.)
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

WORKSPACE_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
TMUX_CONF_SOURCE="${WORKSPACE_DIR}/.devcontainer/tmux.conf"
TMUX_CONF_TARGET="${HOME}/.tmux.conf"

if [ -f "$TMUX_CONF_SOURCE" ]; then
  ln -sfn "$TMUX_CONF_SOURCE" "$TMUX_CONF_TARGET"
fi
