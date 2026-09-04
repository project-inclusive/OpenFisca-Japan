#!/usr/bin/env bash
# AI CLI 用の設定ディレクトリ（名前付きボリュームのマウント先）を作成し、
# 所有者・権限を user が読み書きできる状態に整える。
# post-create.sh（初回ビルド時）と post-start.sh（毎回の起動時。ボリュームが
# リセットされた場合に備える）から共通で呼ばれる。
set -euo pipefail

# 権限を整える対象ディレクトリ（各 AI CLI の設定・認証情報の保存先）
DIRS=(
  /home/user/.claude
  /home/user/.codex
  /home/user/.copilot
)

for d in "${DIRS[@]}"; do
  sudo mkdir -p "$d"            # 無ければ作成
  sudo chown -R user:user "$d"  # user 所有にする
  chmod 700 "$d"                # 本人のみアクセス可
done
