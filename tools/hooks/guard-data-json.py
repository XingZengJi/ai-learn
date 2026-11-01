#!/usr/bin/env python3
"""PreToolUse hook：不让 Claude 把 docs/data/ 下的 JSON 整个重写一遍。

为什么要拦：这几个 JSON 是手写的紧凑排版（见 CLAUDE.md「改 docs/data/ 下的 JSON 时」）。
用 json.dump 整体写回，内容一个字没变，排版却全被拆开，两行的改动会变成几百上千行 diff，
既没法审，也会把真正的改动淹掉。CLAUDE.md 里写了这条规矩，但 CLAUDE.md 只是「建议」，
Claude 可能忘、可能觉得这次例外。hook 是「机制」：每次调用工具前都由 Claude Code 自动执行，
Claude 自己跳不过去。

工作方式：Claude Code 在每次调用 Write / Bash 之前，把「准备调用什么工具、参数是什么」
以 JSON 从标准输入交给本脚本。本脚本按两条规则判断：
  1. 用 Write 工具写 docs/data/ 下的 .json —— Write 是整个文件覆盖，拦下，改用 Edit 逐处改
  2. 用 Bash 跑的命令（或命令里运行的 .py 脚本）同时出现 json.dump( 和这几个数据文件 —— 拦下
退出码的约定（Claude Code 规定的）：
  0 = 放行；2 = 拦下，并把 stderr 的文字交给 Claude 看，让它知道为什么被拦、该怎么改。
  注意 1 不是拦下：退出码 1 只算「hook 出错」，工具照样执行。所以这里要么 0 要么 2。

已知漏网：f.write(json.dumps(data, indent=2)) 这种写法不含 json.dump(，拦不住。
CLAUDE.md 允许的批量补题脚本也要用 json.dumps 生成新增的块，没法一刀切。
这一类留给下一个 hook（收尾时跑 check-data.py 核对排版）兜底。

手动测试（不用启动 Claude Code）：
  echo '{"tool_name":"Write","tool_input":{"file_path":"docs/data/anthropic/quiz.json"}}' | python3 tools/hooks/guard-data-json.py; echo $?
"""
import json
import re
import sys
from pathlib import Path

DATA_FILES = re.compile(r"docs/data/|(courses|knowledge|projects|quiz)\.json")
PY_FILE = re.compile(r"[\w./~-]+\.py\b")

ADVICE = (
    "改 docs/data/ 下的 JSON 要按 CLAUDE.md「改 docs/data/ 下的 JSON 时」的规矩：\n"
    "  - 少量改动用 Edit 工具逐处改；\n"
    "  - 批量改动写脚本时，按顶层 key 切成文本块，只替换本次改动的块，并先做「原样读入再吐出、逐字节比对」的保真自检。"
)


def block(reason):
    print("【已拦下】" + reason + "\n" + ADVICE, file=sys.stderr)
    sys.exit(2)


def main():
    try:
        event = json.load(sys.stdin)
    except ValueError:
        sys.exit(0)  # 读不懂输入就放行：hook 自己出问题时不该把 Claude 卡死
    tool = event.get("tool_name")
    args = event.get("tool_input") or {}

    # 规则 1：Write 是整文件覆盖
    if tool == "Write":
        path = str(args.get("file_path", ""))
        if "docs/data/" in path and path.endswith(".json"):
            block("不要用 Write 整个覆盖 " + path + "。")

    # 规则 2：命令里（或命令运行的 .py 脚本里）对数据文件用 json.dump(
    if tool == "Bash":
        cmd = str(args.get("command", ""))
        texts = [cmd]
        cwd = Path(event.get("cwd") or ".")
        me = Path(__file__).resolve()
        for name in PY_FILE.findall(cmd):
            p = Path(name).expanduser()
            p = (p if p.is_absolute() else cwd / p).resolve()
            if p == me:
                continue  # 本脚本的说明文字里就有这两个词，不算
            try:
                texts.append(p.read_text(encoding="utf-8"))
            except OSError:
                pass  # 文件不存在或读不了：只看命令本身
        # 命令和每个脚本分开判断，必须在同一处同时出现才拦。
        # 曾经拼在一起判断：命令里 grep "json.dump("、check-data.py 里有 docs/data/，一条只读的 grep 被误拦
        if any("json.dump(" in t and DATA_FILES.search(t) for t in texts):
            block("这条命令（或它运行的脚本）用 json.dump( 整体写回 docs/data/ 下的 JSON。")

    sys.exit(0)


if __name__ == "__main__":
    main()
