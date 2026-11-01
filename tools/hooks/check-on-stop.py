#!/usr/bin/env python3
"""Stop hook：Claude 每次准备结束回复时，检查 docs/data/ 有没有被改坏；坏了就不让它停，先修。

和 guard-data-json.py 的分工：
  - guard-data-json.py 是「事前」：动手之前看命令文字，拦明显的整体写回。但它只看文字，有漏网
  - 本脚本是「事后」：不管用什么写法改的，直接看改完的文件。专门兜前者的漏网

检查两件事（只在 docs/data/ 有未提交改动时才跑，平时零开销）：
  1. python3 tools/check-data.py —— 结构、交叉引用、出题硬规矩，0.1 秒
  2. 排版没被整体重写 —— 数「开合在同一行、里面有逗号的短数组 / 短对象」有几处，和上次提交对比。
     json 库带缩进整体写回会把它们全部拆开，不带缩进会把整个文件压成一行，两种都能数出来。
     CLAUDE.md 允许的批量补题（只替换改动的块）不会让这个数字明显下降

退出码：0 = 放行；2 = 不让停，stderr 交给 Claude 接着修。
防死循环：被拦下后 Claude 修完再停时，输入里 stop_hook_active 为 true。这时即使还没过也放行
（不然修不好就永远停不下），但把问题用 systemMessage 直接显示给用户。

不跑 e2e.js：一次要一两分钟、占 1G 内存，每轮回复都跑太重。网页测试交给推送后的 GitHub Actions。

手动测试：echo '{}' | python3 tools/hooks/check-on-stop.py; echo $?
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(os.environ.get("CLAUDE_PROJECT_DIR") or Path(__file__).resolve().parents[2])
DATA = "docs/data"
# 开合在同一行、里面至少一个逗号的 [ ... ] 或 { ... }，如 [180, 150]、{ "id": "k0101", ... }
INLINE = re.compile(r"[\[{][^\[\]{}\n]*,[^\[\]{}\n]*[\]}]")


def git(*args):
    return subprocess.run(["git", "-c", "core.quotepath=false", *args], cwd=ROOT,
                          capture_output=True, text=True)


def changed_files():
    out = git("status", "--porcelain", "--", DATA).stdout
    return [line[3:].strip() for line in out.splitlines() if line.strip()]


def layout_problem(path):
    """和上次提交比，排版是否被整体重写。返回问题描述，没问题返回 None"""
    if not path.endswith(".json"):
        return None
    old = git("show", "HEAD:" + path)
    if old.returncode != 0:
        return None  # 新文件，没有可比的
    try:
        new = (ROOT / path).read_text(encoding="utf-8")
    except OSError:
        return None  # 文件被删：交给 check-data.py 报
    old_text = old.stdout
    k_old, k_new = len(INLINE.findall(old_text)), len(INLINE.findall(new))
    n_old, n_new = old_text.count("\n"), new.count("\n")
    if k_old >= 10 and k_new < k_old / 2:
        return f"{path}：压在一行的短数组 / 短对象从 {k_old} 处降到 {k_new} 处，像是被 json 库带缩进整体写回了"
    if n_old >= 30 and n_new < n_old / 3:
        return f"{path}：行数从 {n_old} 降到 {n_new}，像是被 json 库不带缩进压成了一行"
    return None


def main():
    try:
        event = json.load(sys.stdin)
    except ValueError:
        event = {}
    files = changed_files()
    if not files:
        sys.exit(0)

    problems = []
    r = subprocess.run([sys.executable, "tools/check-data.py"], cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        lines = [l for l in r.stdout.splitlines() if "✗" in l or l.startswith("[")]  # 错误行 + 它属于哪个厂商
        detail = "\n".join(lines[:20]) or "\n".join(r.stdout.splitlines()[-15:])
        problems.append("tools/check-data.py 没通过：\n" + detail)
    for f in files:
        p = layout_problem(f)
        if p:
            problems.append(p + "。用 git diff --stat 看看改动量；要恢复排版，用 git show HEAD:" + f + " 取回原文（别用 git stash / checkout，会连带别的未提交改动），再按 CLAUDE.md「改 docs/data/ 下的 JSON 时」把本次的改动逐块加回去")

    if not problems:
        sys.exit(0)
    msg = "【收尾检查没通过】docs/data/ 有未提交改动，发现问题：\n- " + "\n- ".join(problems)
    if event.get("stop_hook_active"):
        # 已经被拦过一次还没修好：放行，免得死循环。退出码 0 时 stderr 不会给任何人看，
        # 所以改用 systemMessage 直接显示给用户——问题没解决，用户必须知道
        print(json.dumps({"systemMessage": msg + "\n（已拦过一次仍未修好，为免死循环放行了，请人工处理）"}, ensure_ascii=False))
        sys.exit(0)
    print(msg + "\n请先修好再结束；修不好就如实告诉用户卡在哪。", file=sys.stderr)
    sys.exit(2)


if __name__ == "__main__":
    main()
