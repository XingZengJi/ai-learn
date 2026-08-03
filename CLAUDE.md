# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 这个仓库是什么

学习者（产品经理出身、非技术背景）系统学习 Anthropic 官方 Skilljar 课程的公开学习仓库，不是常规代码项目。全部内容用中文写；解释技术概念时用非技术语言和 PM 类比。原则：**Claude 写代码，学习者读懂代码**——做任何技术改动时要顺带讲清楚"为什么"。

- `学习计划.md` — 学习计划权威文档：全部课程速览、10 周安排、工程基础加油包、进度追踪表
- `docs/` — 「CC 学习成就地图」网页（GitHub Pages 站点，https://xingzengji.github.io/ai-learn/）
- `Course/<厂商>/<NN课程名>/` — 课程笔记（中英对照/中文译述）。厂商层目前有 `Claude/`（Anthropic Skilljar 课程）与 `Codex/`（OpenAI Codex 课程）
- `notes/` — 学习笔记（费曼输出法）
- `practice/` — 实践产出（按项目分文件夹，见下）
- `tools/` — `check-data.py`（零依赖数据校验）、`e2e.js`（jsdom 冒烟测试）

## 常用命令

```bash
# 数据校验：结构 + 交叉引用，两个厂商一起校验。改过 docs/data/ 下任何 JSON 都要跑
python3 tools/check-data.py

# 站点冒烟测试：jsdom 模拟，走完整答题流程 + 双厂商切换。改过 docs/ 下 JS/HTML 或数据后跑
cd tools && npm install && node e2e.js

# 本地预览：JSON 走 fetch，直接开 file:// 会失败，必须起服务器
python3 -m http.server 8000 -d docs   # → http://localhost:8000

# 课程文件夹 ↔ 成就地图课程 ID 的映射（两套编号不一致，别靠猜）
grep -H "对应成就地图课程 ID" Course/*/*/README.md
```

`e2e.js` 是单文件脚本，**没有「只跑某个用例」的入口**；要缩小范围就临时注释掉不关心的段落，别去搭测试框架。仓库没有 lint、没有构建步骤。

### Course/ 的约定

- **第一层是厂商**：`Course/Claude/`（Anthropic Skilljar 课程，原先直接摊在 `Course/` 下的 21 个文件夹已整体挪进来）、`Course/Codex/`（OpenAI Codex 课程）。新抓的课先判断归属哪个厂商，再在其下建课程文件夹；下面所有约定都作用在**课程文件夹**这一层
- **`Course/Codex/` 的笔记挂在成就地图的 openai 厂商下**（`docs/data/openai/`，与现有的 OpenAI Academy 证书课 c01–c03 同一套 ID 空间，接着往下编号），不新开第三个厂商
- **文件夹名 = 两位序号 + 简称**（如 `19AIF4SB`、`20AIforB`）。序号是学习/收录顺序，**不等于成就地图的课程 ID**（例如 `09FluforEdu` 对应 `c16`），也不保证唯一（`20AIforB` 与 `20AIforPK12` 同号）。两套编号的映射写在各文件夹 README 的「对应成就地图课程 ID」一行
- **每个课程各自一套文件名前缀**，由该文件夹第一课确定后续沿用，不是全仓库统一格式（如 `ai-fluency-smb-NN-标题.md`、`mcp-N-标题.md`）。新建文件夹时先看有没有更贴近的现成前缀可沿用，没有再另起一个
- **较新的文件夹都带一份 `README.md`**：课次一览表、课程结构、「几条值得单独记住的」、与同系列课程的对照、许可声明。新建课程文件夹时照此补上
- **`Course/*/*/_source/` 已 gitignore** —— 英文原文抓取件仅本地留存供核对，不入公开仓库
- 每篇笔记开头有固定的引用块：课程名/课次/来源/许可。原课程多为 CC BY-NC-SA 4.0，**中文译述属改编作品，必须署名原作者并声明以同一许可提供**（各版 AI Fluency 课还需标注具体合作方，如 Teach For America、CodePath、AFT）

## practice/ 的约定：一个项目一个文件夹，本体建在仓外

`practice/` 下**每个项目一个 `pN-项目名/` 文件夹**（如 `p6-个人AI指挥台/`），内部文件不再重复项目名前缀（`实践课方案.md`、`产品需求清单.md`、`复盘.md`）。文档之间互相指路写「同目录 / 本目录」，将来整体挪动不用改引用。跨项目的文档（`项目集规划书.md`）留在 `practice/` 顶层。

**关键分界：`practice/pN-*/` 只放学习材料与记录（方案、需求、工作表、复盘），项目本体建在 ai-learn 之外。**

| 项目 | 本体位置 | 原因 |
|---|---|---|
| p2 拆书工坊 | `~/workspace/projects/book-workshop/`（独立仓） | 方案写明「从零建仓」，`git init` 是阶段 1 第 1 条操作 |
| p6 指挥台 | `~/workspace/projects/weekly-report/` | 素材与简报不能进公开仓 |
| p3 让仓库自己看着自己 | **就是 ai-learn 本身** | 改造对象即本仓 |
| p4 / p5 / p8 | 各自独立仓 | 要被调用、要部署上线 |

两条硬理由，别为了「方便」破例：

1. **ai-learn 是公开仓库**，`docs/` 直接走 GitHub Pages。素材、简报、客户相关内容放进来等于发布出去
2. **把整个学习仓交给 Cowork / Claude Code，正是课程点名的反面教材**（k0302「图省事把整个文档目录丢给它」）。p6 的 FR-8 要练的就是反着做

**项目本体的初始化不要代劳。** 建仓、`git init`、选工作目录都是知识点本身（k0202「在哪启动就只能访问哪」），教练替学习者建等于把第一课上掉了。

## 核心工作流：「点亮」

用户学完一个知识点/课程/项目后会说「点亮 XX」。流程：

1. 更新 `docs/data/anthropic/progress.json` —— 这是 Anthropic 版的**唯一权威进度文件**，只记录 `doing` / `done` 条目（含 `date`），未出现的一律视为 todo。若点亮的是 OpenAI 版内容（用户会说「点亮 OpenAI 的 XX」），改 `docs/data/openai/progress.json`
2. 如涉及课程完成，同步更新 `学习计划.md` 第六节的进度追踪表（仅 Anthropic 课程）
3. **提交并推送** —— 每次点亮本身就是一次 GitHub 贡献，地图底部热力图同步 +1

ID 约定：课程 `c01` 起，知识点 `k<课程两位数><序号两位数>`（如 `k0203` = c02 的第 3 个知识点），项目 `p1`–`p5`。**两个厂商各自一套同格式 ID，互不冲突**（数据目录、progress 文件、localStorage 键都按厂商隔离），用户没说厂商时默认 Anthropic。ID 与元数据定义在各厂商目录的 `courses.json`、`knowledge.json`、`projects.json` 中；progress.json 只引用这些 ID。

**地图上允许存在指向同一门课的重复条目**：`c12` 与 `c21` 都是 `ai-fluency-for-builders`（前者按官方目录写，后者按实际学完的笔记重写），这是用户明确选择保留的，不要当成 bug 去合并。

### 新增一门课到地图

1. `courses.json` 的 `courses` 数组加条目；`knowledge.json` 加至少一个知识点
2. **确认该梯队的 `layout.slots` 还有空位** —— 槽位可能刚好用满（第三天区曾是 9 门课占满 9 个槽位）。不够就补槽位坐标，必要时同步调大 `layout.viewBox` 高度。`check-data.py` 会校验「课程数 ≤ 槽位数」
3. 同步 `学习计划.md` 的**四处**计数与清单：开头的知识点/课程总数文案、第一节的课程总数、第二节的速览表、注释里的定制版范围

### 星座大小由知识点数决定，加知识点也可能撑爆布局

`check-data.py` 只校验「课程数 ≤ 槽位数」，**查不出星座之间的视觉碰撞**。星图的几何全部由 `starmap.js` 按该课的星星数 `n` 算出来：

| 量 | 公式 |
| --- | --- |
| 星云半径 | `R = n === 1 ? 0 : min(30 + n * 7, 80)`，纵向再乘 `0.72` |
| 全座点亮的光环 | `n === 1 ? 42 : R + 42` |
| 课程标签 y | `cy + (n === 1 ? 24 : R * 0.82 + 22)`，其下 15px 还有计数行 |

后果：一门课从 1 个占位知识点扩到 8 个，`R` 就从 0 跳到 80，原本挨得很近的槽位会立刻互相压盖。经验值是**同排间距 ≥ 180、上下排间距 ≥ 200**（还要留出标签带），否则星云交叠、标签压到下一排的星上。**给已有课程大批量补知识点后，务必按上表核算一遍相邻槽位的间距**，不够就重排 `layout.slots` 并调大 `viewBox` 高度——第二、三天区就是这么从 80px 行距重排成 200px、`viewBox` 高度从 1060 加到 1780 的。

## 成就地图（docs/）架构

纯静态站点，**无构建步骤、无依赖**，vanilla JS（IIFE 风格），GitHub Pages 直接从 main 分支的 `docs/` 目录发布——推送即上线。

**双版本**：站点承载两套课程体系——Anthropic（默认）和 OpenAI Academy，右上角按钮切换。厂商解析顺序：URL `?v=openai` → localStorage `cc-map-provider` → 默认 anthropic。数据按厂商目录隔离：`data/anthropic/` 与 `data/openai/` 各有同构的 5 个 JSON。OpenAI 版的 localStorage 键带 `:openai` 后缀（`cc-map-preview:openai` 等），Anthropic 用无后缀键（兼容历史数据）。

- `js/app.js` — 主逻辑：顶部 `PROVIDERS` 配置（数据目录、眉题、页脚链接、存储后缀），按厂商并行加载 5 个 JSON，合并权威进度与浏览器本地「预览点亮」（localStorage key `cc-map-preview[:openai]`），状态优先级 `done > preview > doing > todo`，渲染课程/项目列表
- `js/quiz.js` — 知识点详情弹窗 + 测验：点击星星/列表项打开详情（概要 + 测验按钮）。**有题必考、无题可直点**——quiz.json 里 `questions` 非空的知识点必须测验全对才能预览点亮（通过记录存 `cc-map-quiz-passed[:openai]`，「清除预览」不清它）；`questions` 为空或无条目的知识点显示概要/占位 + 「直接预览点亮」按钮。**现状：Anthropic 侧 175 个知识点已全部有题，那条「直接预览点亮」的分支只有 OpenAI 版还在走**（其 quiz.json 目前全为空），改动它时两边都要想到
- 全对撒花：通过时先把知识点 id 记进 `pendingCelebrate`，**等弹窗关闭后**才在那颗星周围迸发纸屑（弹窗开着时撒等于被盖住）。定位靠 starmap 给每个星星组打的 `data-k` 属性——这是 `starmap.js` 与 `quiz.js` 之间的隐式契约，改星星渲染时别把它弄丢
- `js/starmap.js` — SVG 星图：知识点=星星，课程=星座，用课程 ID 做种子的伪随机布局保证每次渲染一致；整座点亮加光环与 ✦ 徽记。**天区/槽位/viewBox 全部来自各厂商 courses.json 的 `layout` 字段**，星图代码不含任何厂商假设（星座大小与布局间距的换算见上文）
- `js/heatmap.js` — GitHub 贡献热力图：客户端直接请求 `github-contributions-api.jogruber.de` 公开 API，SVG 自绘；两个版本共享
- `data/<厂商>/quiz.json` — 知识点概要与题库；`answer` 是 `options` 的 0 起下标，渲染时选项乱序；`questions: []` 表示题库待补充
- **配色的唯一数据源是各厂商 courses.json 的 `tiers[*].colorHex`**，加载后由 app.js 注入 CSS 变量 `--t1/--t2/--t3`；style.css 里 `body[data-provider="openai"]` 的同值覆盖只为防首屏闪色，改配色时两处同步

### 改 docs/data/ 下的 JSON 时

**默认用文本编辑（Edit 工具）逐处改，不要用 `json.dump` 整体写回。** 两类文件的排版不一样，混淆会炸出巨大 diff：

- `courses.json` / `knowledge.json` / `projects.json` / `progress.json` —— **手写的紧凑单行格式**（`{ "id": "c20", ... },` 一行一条、`"3": [[200, 1030], [600, 1030], ...]`）。`json.dump` 会把每个元素拆成多行，两行的改动会变成 800+ 行 diff
- `quiz.json` —— 2 空格缩进的常规 pretty JSON，但**短 `options` 数组是压在一行**的，整体 `json.dump` 同样会把它们全部拆开

批量补题（一次改几十个知识点）时逐处 Edit 不现实，可以写脚本，但必须**按顶层 key 把 quiz.json 切成文本块、只替换/插入本次改动的块，已有块原样保留**；脚本先做一次「读进来再原样吐出，与磁盘逐字节比对」的保真自检，通过了才允许写入。这样几百条新增也只产生真正改动的 diff。

## 工作流：补题库（学完一门课后）

用户说「给 cXX 出题」「补 cXX 的题库/知识点详情」时执行（默认 Anthropic，说明是 OpenAI 时改 `data/openai/` 下的对应文件）。**无需改任何 JS/HTML**——弹窗按 `docs/data/<厂商>/quiz.json` 数据自动填充：

1. 通读 `Course/<厂商>/<课程名>/` 全部笔记；若有结业测验笔记，出题风格与考点向它对齐
2. 核对该厂商 `knowledge.json` 里该课的知识点划分是否覆盖全部课次，缺了先补（c01 曾漏掉 Skills 课）；增删 Anthropic 知识点要同步 `学习计划.md` 开头那句「N 个知识点是星星，M 门课是星座」的计数文案
3. 每个知识点写入 quiz.json：`summary`（2–4 句概要，PM 友好语言）+ 3–4 道单选题。每题 4 个选项，`answer` 是 0 起下标，`explain` 必填并写清依据。题目组成：记忆型考点为主，**每个知识点至少 1 道场景判断题**（给出具体工作场景，选做法或选工具）
4. 校验：`python3 tools/check-data.py`；**批量补题后 `node e2e.js` 也要跑**——它的断言会被数据变化打破（曾把某个知识点写死当「无题库」样本、把课程数写死成 20）
5. 提交推送（中文提交信息）——推送即上线

### 出题的三条硬规矩（都源于「渲染时选项会乱序」）

一次给 18 门课补题时，12 个并行 agent 几乎全都犯了前两条，事后才发现，所以单列出来：

1. **正确项不能明显比干扰项长。** 选项乱序后，长度就成了唯一残留线索——把理由塞进正确项，等于不读题也能选中。理由一律写进 `explain`，必要时给过短的干扰项补齐信息量，让四项长度相当
2. **题干和 `explain` 里绝不能出现「选项二是…」这类位置指代**，乱序后必然指错。要指就直接说内容（「把 Product 和 Process 说反的那一项」）
3. **干扰项必须是「笔记里没这么说」，而不是「笔记里其实也这么说」**——后者会变成第二个正确答案。写完回笔记逐条核干扰项，比核正确项更容易发现问题

另外：**整题重写时必须重新确定 `answer`**，沿用旧下标会把正确答案指到别的选项上（这个坑真踩过）。跨课程也要查重——`c11`/`c14`/`c15` 是同一套课程内容的三个平台版本，`c06` 与各行业定制版 AI 素养课同源，最容易出现几乎逐字相同的题。

## 工作流：抓取并译述一门新课

用户给 Skilljar 课程链接、要求存到某个文件夹时执行。

1. **取课次清单**：抓课程页（`https://anthropic.skilljar.com/<slug>`），课次链接在 `a.lesson-modular` 的 `href`；`li.section` / `.lesson-section` 是**章节标题不是课次**，别算进去。学习路径（`/path/<slug>`）下挂多门课，各自有独立 slug 与合作方，需分别抓
2. **抓正文**：登录态是纯 cookie（`sj_sessionid`），`curl` 即可，无需浏览器。**正文容器是 `#lesson-main-content`**
3. **译述**：中文译述而非逐句直译，保留原文的关键措辞与对比句；每篇补一节「对产品经理来说」，用 PM 语境解释这一课真正的抓手
4. 写 `README.md`（见上文 Course/ 约定），英文抓取件存 `_source/`

**两类拿不到的内容，如实在笔记里标注，不要编补**：

- **视频没有站内文字稿** —— 页面正文通常只有本课目标 / 核心要点 / 练习 / 反思。部分课程会提示可在 YouTube 上开字幕（视频页 "Show transcript"）
- **交互式课次是浏览器端渲染的** —— 常规提取会得到空内容（不是抓取失败）。内容在页面内联 `<script>` 的数据结构里，可从中取出结构与条目；工作坊幻灯片/手册这类资产则只能记录「它是什么、怎么用」，建议用户回站点亲手看

## 中文文件名与 git

仓库里几乎所有路径都是中文，git 默认会把非 ASCII 路径转义成八进制（`\345\255\246...`），导致 `git ls-files | grep 学习计划`、`git status --short | grep 中文` 全部匹配不到，看起来像"文件没被跟踪"。**查中文路径时加 `-c core.quotepath=false`**：

```bash
git -c core.quotepath=false status --short
git -c core.quotepath=false ls-files Course/
```

## 提交约定

提交信息用中文，简述做了什么（参考 git log 已有风格）。用户明确要求或点亮流程触发时才提交推送。
