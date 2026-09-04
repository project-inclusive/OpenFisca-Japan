#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ensure the mounted volume dirs are writable before installing into them below.
bash "${SCRIPT_DIR}/prepare-agent-dirs.sh"

# Install Codex CLI (official installer, falling back to the npm package).
if ! curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh; then
  echo "Official Codex installer failed. Falling back to npm package."
  sudo npm install -g @openai/codex@latest
fi

# Add `gh copilot` when the GitHub CLI is present.
if command -v gh >/dev/null 2>&1; then
  gh extension install github/gh-copilot --force || true
fi

# Link the repo's tmux config into $HOME so tmux picks it up.
TMUX_CONF_SOURCE="${SCRIPT_DIR}/tmux.conf"
if [ -f "$TMUX_CONF_SOURCE" ]; then
  ln -sfn "$TMUX_CONF_SOURCE" "${HOME}/.tmux.conf"
fi
