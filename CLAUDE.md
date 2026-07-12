# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 这个仓库是什么

学习者（产品经理出身、非技术背景）系统学习 Anthropic 官方 Skilljar 课程的公开学习仓库，不是常规代码项目。全部内容用中文写；解释技术概念时用非技术语言和 PM 类比。原则：**Claude 写代码，学习者读懂代码**——做任何技术改动时要顺带讲清楚"为什么"。

- `学习计划.md` — 学习计划权威文档：20 门课速览、10 周安排、工程基础加油包、进度追踪表
- `docs/` — 「CC 学习成就地图」网页（GitHub Pages 站点，https://xingzengji.github.io/ai-learn/）
- `Course/<课程名>/` — 课程笔记（中英对照/中文翻译），按 `claude-101-N-标题.md` 编号
- `notes/` — 学习笔记（费曼输出法）
- `practice/` — 实践产出

## 核心工作流：「点亮」

用户学完一个知识点/课程/项目后会说「点亮 XX」。流程：

1. 更新 `docs/data/progress.json` —— 这是**唯一权威进度文件**，只记录 `doing` / `done` 条目（含 `date`），未出现的一律视为 todo
2. 如涉及课程完成，同步更新 `学习计划.md` 第六节的进度追踪表
3. **提交并推送** —— 每次点亮本身就是一次 GitHub 贡献，地图底部热力图同步 +1

ID 约定：课程 `c01`–`c20`，知识点 `k<课程两位数><序号两位数>`（如 `k0203` = c02 的第 3 个知识点），项目 `p1`–`p5`。ID 与元数据定义在 `docs/data/courses.json`、`knowledge.json`、`projects.json` 中；progress.json 只引用这些 ID。

## 成就地图（docs/）架构

纯静态站点，**无构建步骤、无依赖**，vanilla JS（IIFE 风格），GitHub Pages 直接从 main 分支的 `docs/` 目录发布——推送即上线。

- `js/app.js` — 主逻辑：并行加载 5 个 JSON，合并权威进度与浏览器本地「预览点亮」（localStorage key `cc-map-preview`），状态优先级 `done > preview > doing > todo`，渲染课程/项目列表
- `js/quiz.js` — 知识点详情弹窗 + 测验：点击星星/列表项打开详情（概要 + 测验按钮）。**有题必考、无题可直点**——`data/quiz.json` 里有题库的知识点必须测验全对才能预览点亮（通过记录存 localStorage key `cc-map-quiz-passed`，「清除预览」不清它）；没题库的知识点详情页里保留「直接预览点亮」按钮
- `js/starmap.js` — SVG 星图：知识点=星星，课程=星座（每梯队固定槽位），用课程 ID 做种子的伪随机布局保证每次渲染一致；整座点亮加光环与 ✦ 徽记
- `js/heatmap.js` — GitHub 贡献热力图：客户端直接请求 `github-contributions-api.jogruber.de` 公开 API，SVG 自绘
- `data/quiz.json` — 知识点概要与题库（目前只有 c01 的 k0101–k0108）；`answer` 是 `options` 的 0 起下标，渲染时选项乱序
- 三个梯队颜色在 app.js 和 starmap.js 中各有一份 `TIER_COLOR` 常量，改配色时两处都要改

本地预览（JSON 通过 fetch 加载，直接打开 file:// 会失败，必须起本地服务器）：

```bash
python3 -m http.server 8000 -d docs
# 浏览器打开 http://localhost:8000
```

## 工作流：补题库（学完一门课后）

用户说「给 cXX 出题」「补 cXX 的题库/知识点详情」时执行。**无需改任何 JS/HTML**——弹窗按 `docs/data/quiz.json` 数据自动填充：

1. 通读 `Course/<课程名>/` 全部笔记；若有结业测验笔记，出题风格与考点向它对齐
2. 核对 `docs/data/knowledge.json` 里该课的知识点划分是否覆盖全部课次，缺了先补（c01 曾漏掉 Skills 课）；增删知识点要同步 `学习计划.md` 开头的「84 个知识点」总数文案
3. 每个知识点写入 quiz.json：`summary`（2–4 句概要，PM 友好语言）+ 3–4 道单选题。每题 4 个选项，`answer` 是 0 起下标（渲染时自动乱序），`explain` 必填并写清依据。题目组成：记忆型考点为主，**每个知识点至少 1 道场景判断题**（给出具体工作场景，选做法或选工具）
4. 校验：`python3 tools/check-data.py`（结构与交叉引用，零依赖）；若这次还改了 docs/ 下的 JS/HTML，再跑 `cd tools && npm install && node e2e.js`（jsdom 冒烟测试，走完整答题流程）
5. 提交推送（中文提交信息）——推送即上线

## 提交约定

提交信息用中文，简述做了什么（参考 git log 已有风格）。用户明确要求或点亮流程触发时才提交推送。
