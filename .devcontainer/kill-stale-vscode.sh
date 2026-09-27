#!/usr/bin/env bash
# devcontainer 内に残った VS Code Server の残骸プロセスを一覧・停止する。
#
# 対象は次の 2 種類に限定し、稼働中の接続は落とさない。
#   1. 最新 commit 以外の server-main.js（VS Code 更新後に残る旧 server）とその子孫
#   2. 親を失って PID 1 の子になった vscode-server 系プロセス（extension host、language server など）
#
# 使い方:
#   kill-stale-vscode.sh            残骸を停止する
#   kill-stale-vscode.sh --dry-run  停止対象を表示するだけ
#   kill-stale-vscode.sh --list     vscode-server 系プロセスをすべて表示する
set -euo pipefail

mode="kill"
case "${1:-}" in
--dry-run) mode="dry-run" ;;
--list) mode="list" ;;
"") ;;
*)
  echo "usage: $0 [--dry-run|--list]" >&2
  exit 2
  ;;
esac

# pid ppid etimes rss args を 1 行ずつ読み込む
snapshot="$(ps -eo pid=,ppid=,etimes=,rss=,args= --no-headers)"

is_vscode() {
  case "$1" in
  *vscode-server* | *vscode-remote-containers*) return 0 ;;
  *) return 1 ;;
  esac
}

print_row() {
  # $1=pid $2=ppid $3=etimes $4=rss(kB) $5=args
  local args
  args="$(printf '%s' "$5" | sed -E 's#/vscode/vscode-server/bin/linux-[a-z0-9]+/[0-9a-f]{40}[^/]*/#VS/#g; s#/home/node/\.vscode-server/#~VS/#g')"
  printf '%7s %7s %6dm %6dMB  %s\n' "$1" "$2" "$(($3 / 60))" "$(($4 / 1024))" "${args:0:110}"
}

if [ "$mode" = "list" ]; then
  printf '%7s %7s %7s %8s  %s\n' PID PPID AGE RSS COMMAND
  while read -r pid ppid etimes rss args; do
    [ -z "${pid:-}" ] && continue
    is_vscode "$args" && print_row "$pid" "$ppid" "$etimes" "$rss" "$args"
  done <<<"$snapshot" | sort -k4 -n -r
  exit 0
fi

# 1. 最新の server-main.js を特定する（起動が最も新しいものを正とする）
latest_commit=""
latest_etimes=""
declare -A server_commit=()
while read -r pid ppid etimes rss args; do
  [ -z "${pid:-}" ] && continue
  case "$args" in
  *server-main.js*)
    commit="$(printf '%s' "$args" | sed -nE 's#.*/bin/(linux-[a-z0-9]+/)?([0-9a-f]{40}[^/]*)/.*#\2#p')"
    [ -z "$commit" ] && continue
    server_commit["$pid"]="$commit"
    if [ -z "$latest_etimes" ] || [ "$etimes" -lt "$latest_etimes" ]; then
      latest_etimes="$etimes"
      latest_commit="$commit"
    fi
    ;;
  esac
done <<<"$snapshot"

# 2. 停止対象の根を集める
declare -A targets=()
while read -r pid ppid etimes rss args; do
  [ -z "${pid:-}" ] && continue
  [ "$pid" = "$$" ] && continue
  if [ -n "${server_commit[$pid]:-}" ] && [ "${server_commit[$pid]}" != "$latest_commit" ]; then
    targets["$pid"]="stale-server(${server_commit[$pid]:0:8})"
    continue
  fi
  if [ "$ppid" = "1" ] && is_vscode "$args"; then
    case "$args" in
    *server-main.js* | *bin/code-server*) ;; # 生きている server は PID 1 の子でも対象外
    *) targets["$pid"]="orphan" ;;
    esac
  fi
done <<<"$snapshot"

# 3. 根の子孫を集める
declare -A children=()
while read -r pid ppid etimes rss args; do
  [ -z "${pid:-}" ] && continue
  children["$ppid"]+="$pid "
done <<<"$snapshot"

collect_descendants() {
  local root="$1"
  for child in ${children[$root]:-}; do
    [ -n "${targets[$child]:-}" ] && continue
    targets["$child"]="child-of-$root"
    collect_descendants "$child"
  done
}
for root in "${!targets[@]}"; do
  collect_descendants "$root"
done

if [ "${#targets[@]}" -eq 0 ]; then
  echo "kill-stale-vscode: no stale processes (latest server: ${latest_commit:0:8})"
  exit 0
fi

total_kb=0
while read -r pid ppid etimes rss args; do
  [ -z "${pid:-}" ] && continue
  [ -z "${targets[$pid]:-}" ] && continue
  total_kb=$((total_kb + rss))
done <<<"$snapshot"
printf '%7s %7s %7s %8s  %s\n' PID PPID AGE RSS COMMAND
while read -r pid ppid etimes rss args; do
  [ -z "${pid:-}" ] && continue
  [ -z "${targets[$pid]:-}" ] && continue
  print_row "$pid" "$ppid" "$etimes" "$rss" "[${targets[$pid]}] $args"
done <<<"$snapshot" | sort -k4 -n -r
echo "kill-stale-vscode: ${#targets[@]} process(es), $((total_kb / 1024))MB (latest server: ${latest_commit:0:8})"

[ "$mode" = "dry-run" ] && exit 0

kill -TERM "${!targets[@]}" 2>/dev/null || true
sleep 3
remaining=()
for pid in "${!targets[@]}"; do
  kill -0 "$pid" 2>/dev/null && remaining+=("$pid")
done
if [ "${#remaining[@]}" -gt 0 ]; then
  kill -KILL "${remaining[@]}" 2>/dev/null || true
  echo "kill-stale-vscode: sent SIGKILL to ${#remaining[@]} process(es) that ignored SIGTERM"
fi
echo "kill-stale-vscode: done"
