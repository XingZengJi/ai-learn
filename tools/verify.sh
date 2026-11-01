#!/usr/bin/env bash
# 一条命令跑完本仓的全部检查：数据校验 + 网页冒烟测试（含宽屏 / 手机星图压盖核算）。
# 用法（在仓库任意位置都行）：bash tools/verify.sh
# 输出只留结论和失败项；e2e 的完整输出存在 tools/e2e-last.log（*.log 已 gitignore）。
# 退出码：0 = 全部通过；1 = 有检查没通过。
set -u
cd "$(dirname "$0")/.." || exit 1
LOG=tools/e2e-last.log
fail=0

echo "== 1/2 数据校验（tools/check-data.py）"
if out=$(python3 tools/check-data.py 2>&1); then
  echo "$out" | tail -1
else
  echo "$out" | grep -E "✗|^\[" ; fail=1
fi

echo "== 2/2 网页冒烟测试（tools/e2e.js，约半分钟）"
if [ ! -d tools/node_modules ]; then
  echo "首次运行，按 tools/package-lock.json 安装测试依赖（只装进 tools/node_modules）…"
  (cd tools && npm ci --silent) || { echo "✗ 依赖安装失败"; exit 1; }
fi
start=$(date +%s)
(cd tools && node e2e.js) > "$LOG" 2>&1
code=$?
secs=$(( $(date +%s) - start ))
pass=$(grep -c "✓" "$LOG")
if [ $code -eq 0 ]; then
  echo "✓ ${pass} 项通过（${secs} 秒）"
else
  fail=1
  # 失败项连同它所在的段落标题一起打印，方便定位
  awk '/^— /{sec=$0} /✗|测试崩溃|Error/{if(sec!=last){print sec; last=sec} print}' "$LOG" | head -40
  echo "✗ e2e 没通过（退出码 ${code}，${pass} 项通过）。完整输出：${LOG}"
fi

echo "=="
[ $fail -eq 0 ] && echo "✓ 全部检查通过" || echo "✗ 有检查没通过"
exit $fail
