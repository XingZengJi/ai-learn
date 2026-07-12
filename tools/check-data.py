#!/usr/bin/env python3
"""校验 docs/data/ 下 5 个 JSON 的结构与交叉引用（纯标准库）。补完题库后必跑：python3 tools/check-data.py"""
import json
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "docs" / "data"


def main():
    errors = []

    def fail(msg):
        errors.append(msg)
        print("✗", msg)

    files = {}
    for name in ["courses", "knowledge", "projects", "progress", "quiz"]:
        p = DATA / (name + ".json")
        try:
            files[name] = json.loads(p.read_text())
            print("✓", p.name, "JSON 合法")
        except Exception as e:
            print("✗", p.name, "解析失败:", e)
            return 1

    course_ids = {c["id"] for c in files["courses"]["courses"]}
    kids = {k["id"] for k in files["knowledge"]["knowledge"]}
    pids = {p["id"] for p in files["projects"]["projects"]}

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

    # quiz：summary 非空；每题 4 选项、answer 下标合法、有题干和解析
    n_questions = 0
    for kid, v in files["quiz"].items():
        if kid.startswith("_"):
            continue
        if kid not in kids:
            fail(f"quiz 中的 {kid} 不在 knowledge.json 里")
            continue
        if not v.get("summary", "").strip():
            fail(f"quiz {kid} 缺 summary")
        if not v.get("questions"):
            fail(f"quiz {kid} 没有题目")
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
    print(f"知识点 {len(kids)} · 课程 {len(course_ids)} · 项目 {len(pids)} · 题库覆盖 {quiz_covered} 个知识点 / 共 {n_questions} 题")
    if errors:
        print(f"✗ 共 {len(errors)} 处错误")
        return 1
    print("✓ 全部校验通过")
    return 0


sys.exit(main())
