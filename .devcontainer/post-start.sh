#!/usr/bin/env bash
# コンテナ起動のたびに実行されるスクリプト。
# （devcontainer.json の postStartCommand から呼ばれる）
# 永続化ボリュームがリセットされた場合に備え、AI CLI 用ディレクトリの権限を毎回整える。
set -euo pipefail

# このスクリプト自身のあるディレクトリ（.devcontainer）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "${SCRIPT_DIR}/prepare-agent-dirs.sh"
