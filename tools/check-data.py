#!/usr/bin/env python3
"""校验 docs/data/<厂商>/ 下 4 个 JSON 的结构与交叉引用（纯标准库）。补完数据后必跑：python3 tools/check-data.py"""
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DATA_ROOT = REPO / "docs" / "data"
# 正确项的显示宽度超过最长干扰项的这个倍数就报错：选项会乱序，长度成了唯一残留线索，挑最长的就能蒙对
ANSWER_LEN_RATIO = 1.3


def display_width(s):
    """汉字等全角字符算 2，其余算 1，接近读者眼里的长短"""
    return sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in s)


def check_provider(data_dir, counts):
    errors = []

    def fail(msg):
        errors.append(msg)
        print("  ✗", msg)

    files = {}
    for name in ["courses", "knowledge", "projects", "quiz"]:
        p = data_dir / (name + ".json")
        try:
            files[name] = json.loads(p.read_text())
        except Exception as e:
            print("  ✗", p.name, "解析失败:", e)
            return 1
    print("  ✓ 4 个 JSON 全部合法")

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

    # notes 指向的笔记文件夹必须已提交进公开仓：网页上「看中文笔记」直接链到 GitHub，
    # 无许可课程的笔记只在本地、被 .gitignore 挡着，写进来就是一个 404 链接
    for c in files["courses"]["courses"]:
        notes = c.get("notes")
        if notes is None:
            continue
        tracked = subprocess.run(["git", "-C", str(REPO), "ls-files", "--", notes + "/README.md"],
                                 capture_output=True, text=True).stdout.strip()
        if not tracked:
            fail(f'课程 {c["id"]} 的 notes 指向 {notes}，但这个文件夹没有提交进仓库（或缺 README.md）')

    # knowledge → courses 引用
    for k in files["knowledge"]["knowledge"]:
        if k["course"] not in course_ids:
            fail(f'knowledge {k["id"]} 引用了不存在的课程 {k["course"]}')

    # projects.covers → knowledge 引用
    for p in files["projects"]["projects"]:
        for kid in p["covers"]:
            if kid not in kids:
                fail(f'project {p["id"]} 的 covers 引用了不存在的知识点 {kid}')

    # 项目 id 必须是 p + 数字（≤ 52）：分享链接按项目编号做位图编码，见 share.js 的 encodeProjects
    for pid in pids:
        if not re.fullmatch(r"p\d{1,2}", pid) or int(pid[1:]) > 52:
            fail(f"project id {pid} 不符合 p<1–52> 格式，分享链接编不进去")

    # 这些字段在网页里走 innerHTML 拼接，字面的 <xxx> 会被浏览器当成标签吞掉（题目选项/解析/概要已改为纯文本，不受限）
    html_fields = [("courses", c["id"], c.get(f, "")) for c in files["courses"]["courses"] for f in ("cn", "en")]
    html_fields += [("tiers", t, v.get("name", "")) for t, v in tiers.items()]
    html_fields += [("knowledge", k["id"], k.get("name", "")) for k in files["knowledge"]["knowledge"]]
    html_fields += [("projects", p["id"], s) for p in files["projects"]["projects"]
                    for s in [p.get("name", ""), p.get("level", ""), p.get("weeks", ""), p.get("desc", "")] + p.get("extraSkills", [])]
    for typ, _id, text in html_fields:
        if re.search(r"<[A-Za-z/!]", text):
            fail(f"{typ} {_id} 含有尖括号写法 {text!r}：网页会把它当成 HTML 标签吞掉，请改写")

    # quiz：summary 非空；questions 允许为空数组（题库待补充）；有题则每题 4 选项、answer 合法、有题干和解析
    n_questions = 0
    n_longest = 0  # 正确项恰好最长的题数，只做提示
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
            opts = q.get("options", [])
            if len(opts) == 4 and isinstance(q.get("answer"), int) and 0 <= q["answer"] < 4:
                widths = [display_width(o) for o in opts]
                right = widths[q["answer"]]
                longest_wrong = max(w for j, w in enumerate(widths) if j != q["answer"])
                n_longest += right > longest_wrong
                if right > longest_wrong * ANSWER_LEN_RATIO:
                    fail(f"quiz {kid} 第 {i} 题正确项明显比干扰项长（{right} : {longest_wrong}），"
                         "把理由挪进 explain 或补长干扰项")

    quiz_covered = sum(1 for k in files["quiz"] if not k.startswith("_"))
    print(f"  知识点 {len(kids)} · 课程 {len(course_ids)} · 项目 {len(pids)} · 概要覆盖 {quiz_covered} 个知识点 / 共 {n_questions} 题")
    if n_questions:
        print(f"  正确项是最长选项的题占 {n_longest / n_questions:.0%}（四选一随机约 25%，越接近越好）")
    counts[data_dir.name] = {"courses": len(course_ids), "knowledge": len(kids), "projects": len(pids), "questions": n_questions}
    return len(errors)


def check_copy(counts):
    """宣传文案里写死的数字要跟数据对得上：加课、补题后最容易忘的就是这几处"""
    total = {f: sum(c[f] for c in counts.values()) for f in ("courses", "knowledge", "questions")}
    a = counts.get("anthropic")
    expect = [
        ("docs/index.html", r"(\d+) 门课、(\d+) 个知识点、(\d+) 道测验题", (total["courses"], total["knowledge"], total["questions"])),
        ("README.md", r"(\d+) 门课、(\d+) 个知识点、(\d+) 道测验题", (total["courses"], total["knowledge"], total["questions"])),
    ]
    if a:
        expect.append(("学习计划.md", r"(\d+) 个知识点是星星，(\d+) 门课是星座，(\d+) 个项目是行星",
                       (a["knowledge"], a["courses"], a["projects"])))
    errors = 0
    for name, pattern, want in expect:
        m = re.search(pattern, (REPO / name).read_text())
        if not m:
            print(f"  ✗ {name} 里找不到计数文案（/{pattern}/）")
            errors += 1
        elif tuple(map(int, m.groups())) != want:
            print(f"  ✗ {name} 写的是「{m.group(0)}」，数据实际是 {want}")
            errors += 1
    if errors:
        print("    改文案时别忘了 docs/og-image.png 上也印着这几个数，那张图要重做")
    else:
        print(f"  ✓ README、分享卡片、学习计划里的计数与数据一致")
    return errors


def main():
    providers = sorted(d for d in DATA_ROOT.iterdir() if d.is_dir())
    if not providers:
        print("✗ docs/data/ 下没有厂商目录")
        return 1
    total_errors = 0
    counts = {}
    for d in providers:
        print(f"[{d.name}]")
        total_errors += check_provider(d, counts)
    print("[文案]")
    total_errors += check_copy(counts)
    if total_errors:
        print(f"✗ 共 {total_errors} 处错误")
        return 1
    print("✓ 全部校验通过")
    return 0


sys.exit(main())
