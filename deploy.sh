#!/usr/bin/env bash
# 一鍵部署:自動把 sw.js 的 cache 版本 +1,再 commit + push。
# 用法:  ./deploy.sh "這次改了什麼"
set -euo pipefail
cd "$(dirname "$0")"

msg="${1:-update}"

# 找出目前的 ledger-vN,計算下一號
cur=$(grep -oE "ledger-v[0-9]+" sw.js | head -1)
n=$(printf '%s' "$cur" | grep -oE '[0-9]+')
next=$((n + 1))

# 就地把版本號 +1 (macOS 的 sed 要 -i '')
sed -i '' "s/ledger-v${n}/ledger-v${next}/" sw.js
echo "cache: ledger-v${n} -> ledger-v${next}"

git add -A
git commit -m "${msg} (cache v${next})"
git push

echo "✅ 已推送。GitHub Pages 約 1 分鐘後生效: https://kuan-hsun.github.io/kxon_ledger/"
