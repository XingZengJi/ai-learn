#!/usr/bin/env python3
"""校验 docs/data/<厂商>/ 下 5 个 JSON 的结构与交叉引用（纯标准库）。补完数据后必跑：python3 tools/check-data.py"""
import json
import sys
from pathlib import Path

DATA_ROOT = Path(__file__).resolve().parent.parent / "docs" / "data"


def check_provider(data_dir):
    errors = []

    def fail(msg):
        errors.append(msg)
        print("  ✗", msg)

    files = {}
    for name in ["courses", "knowledge", "projects", "progress", "quiz"]:
        p = data_dir / (name + ".json")
        try:
            files[name] = json.loads(p.read_text())
        except Exception as e:
            print("  ✗", p.name, "解析失败:", e)
            return 1
    print("  ✓ 5 个 JSON 全部合法")

    course_ids = {c["id"] for c in files["courses"]["courses"]}
    kids = {k["id"] for k in files["knowledge"]["knowledge"]}
    pids = {p["id"] for p in files["projects"]["projects"]}
    tiers = files["courses"]["tiers"]
    layout = files["courses"].get("layout")

    # tiers 必须有 colorHex；layout 必须齐全且槽位够用
    for t, v in tiers.items():
        if not v.get("colorHex", "").startswith("#"):
            fail(f"tiers[{t}] 缺 colorHex")
    if not layout or "viewBox" not in layout or "regions" not in layout or "slots" not in layout:
        fail("courses.json 缺 layout（viewBox / regions / slots）")
    else:
        per_tier = {}
        for c in files["courses"]["courses"]:
            per_tier[str(c["tier"])] = per_tier.get(str(c["tier"]), 0) + 1
        for t, n in per_tier.items():
            slots = layout["slots"].get(t, [])
            if len(slots) < n:
                fail(f"梯队 {t} 有 {n} 门课但 layout.slots 只有 {len(slots)} 个槽位")
            if t not in tiers:
                fail(f"课程用到梯队 {t}，但 tiers 里没有定义")

    # knowledge → courses 引用
    for k in files["knowledge"]["knowledge"]:
        if k["course"] not in course_ids:
            fail(f'knowledge {k["id"]} 引用了不存在的课程 {k["course"]}')

    # projects.covers → knowledge 引用
    for p in files["projects"]["projects"]:
        for kid in p["covers"]:
            if kid not in kids:
                fail(f'project {p["id"]} 的 covers 引用了不存在的知识点 {kid}')

    # progress 只允许 doing/done，且 ID 必须存在
    for typ, pool in [("courses", course_ids), ("knowledge", kids), ("projects", pids)]:
        for _id, v in files["progress"].get(typ, {}).items():
            if _id not in pool:
                fail(f"progress.{typ} 引用了不存在的 {_id}")
            if v.get("status") not in ("doing", "done"):
                fail(f"progress.{typ}.{_id} 的 status 非法: {v.get('status')!r}")

    # quiz：summary 非空；questions 允许为空数组（题库待补充）；有题则每题 4 选项、answer 合法、有题干和解析
    n_questions = 0
    for kid, v in files["quiz"].items():
        if kid.startswith("_"):
            continue
        if kid not in kids:
            fail(f"quiz 中的 {kid} 不在 knowledge.json 里")
            continue
        if not v.get("summary", "").strip():
            fail(f"quiz {kid} 缺 summary")
        for i, q in enumerate(v.get("questions", []), 1):
            n_questions += 1
            if not q.get("q", "").strip():
                fail(f"quiz {kid} 第 {i} 题缺题干")
            if len(q.get("options", [])) != 4:
                fail(f"quiz {kid} 第 {i} 题选项数不是 4")
            if not (isinstance(q.get("answer"), int) and 0 <= q["answer"] < len(q.get("options", []))):
                fail(f"quiz {kid} 第 {i} 题 answer 下标越界或类型错误")
            if not q.get("explain", "").strip():
                fail(f"quiz {kid} 第 {i} 题缺 explain")

    quiz_covered = sum(1 for k in files["quiz"] if not k.startswith("_"))
    print(f"  知识点 {len(kids)} · 课程 {len(course_ids)} · 项目 {len(pids)} · 概要覆盖 {quiz_covered} 个知识点 / 共 {n_questions} 题")
    return len(errors)


def main():
    providers = sorted(d for d in DATA_ROOT.iterdir() if d.is_dir())
    if not providers:
        print("✗ docs/data/ 下没有厂商目录")
        return 1
    total_errors = 0
    for d in providers:
        print(f"[{d.name}]")
        total_errors += check_provider(d)
    if total_errors:
        print(f"✗ 共 {total_errors} 处错误")
        return 1
    print("✓ 全部校验通过")
    return 0


sys.exit(main())
