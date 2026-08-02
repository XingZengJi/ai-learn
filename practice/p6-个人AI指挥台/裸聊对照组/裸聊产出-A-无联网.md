联网工具（WebSearch / WebFetch）和文件写入都被拒绝了，所以这份简报有一个必须先说清楚的限制：**我抓不到本周（07-25~07-31）的官方 changelog 和公告**。为了不编"本周新闻",我把信源换成了两类——**【实测】**是从当前正在运行的这个 Claude Code 环境里直接观察到的真实状态,**【存量】**是我的知识（截止 2026-05）。增量那一维缺失,盘点这一维是准的。

---

# Claude Code 动态简报

**期号**：2026 年第 31 周（07-25 ~ 07-31） · **生成日期**：2026-07-31

## 1. 速览

当前环境暴露出的产品形态可以概括为一句话：**Claude Code 已经从"终端里的编码助手"变成了"带调度、带记忆、带多智能体编排的开发工作台"**。三条主线：

1. **上下文被当成一等资源来管理** —— 延迟工具加载、自动摘要、长 TTL 缓存
2. **执行正在脱离单会话** —— 后台任务、云端 worktree、定时 routine
3. **能力正在被"包装化"** —— Skill 成为承载团队工作流的标准单元

## 2. 重点观察

### 2.1 延迟工具加载（ToolSearch）已是默认形态 【实测】

本次会话启动时只有 9 个核心工具带完整 schema 进上下文，其余约 20 个（`WebSearch`、`TaskCreate`、`Monitor`、`CronCreate`、MCP 工具等）**只给名字、不给参数定义**，用时再拉：

```
ToolSearch(query="select:WebSearch,WebFetch")   # 精确取用
ToolSearch(query="+slack send")                 # 关键词检索
```

这是对"MCP 装多了就爆上下文"这个长期痛点的正面回应。**如果团队之前为了省 token 而克制安装 MCP server，这条约束可以放宽了。**

### 2.2 子智能体：worktree 与远程隔离 【实测】

`Agent` 工具支持 `isolation` 参数：`"worktree"` 给子智能体独立 git worktree（无变更时自动清理），`"remote"` 丢到远程云环境跑（强制后台）。子智能体**默认后台运行**，完成时回调；`SendMessage` 可以带上下文继续追问已有 agent，不用冷启新的。

并行改造第一次有了不互相踩脚的原生方案。但环境提示里也写得很直白：**每次 spawn 都是冷启动，会重新推导你已有的上下文，是最贵的路径**——"多角度""彻底""分几步"都不构成派子智能体的理由，除非真需要并行隔离。

### 2.3 Skill 生态：分层与作用域 【实测】

挂载的 20+ 个 Skill 已有清晰分层：文档产出（`document-skills:docx/xlsx/pptx/pdf`）、设计（`dataviz`、`frontend-design`）、工程流程（`tdd`、`diagnosing-bugs`、`simplify`、`security-review`、`codebase-design`）、元技能（`skill-creator`）、harness 配置（`update-config`、`fewer-permission-prompts`）。

命名支持 **plugin 前缀**（`plugin:skill`）和**目录作用域**（`apps/web:deploy`，同名时最具体目录优先）——monorepo 里各子项目可以各自定义同名 `deploy`/`test` 而不冲突。

值得单独点名：`skill-creator` 内置 eval 和方差分析，说明官方把 Skill 当作**需要被度量的工程产物**，不是提示词片段。

### 2.4 调度与长运行 【实测】

| 机制 | 形态 | 适用 |
|---|---|---|
| `run_in_background` | 脱离当前轮次，退出时回调 | 长编译、测试套件 |
| `/loop` + `ScheduleWakeup` | 会话内自定节奏 | 盯 CI、盯部署 |
| `/schedule` + `CronCreate` | cron 定时的**云端** agent | 每日巡检、周报生成 |

一个值得抄作业的细节：**不要为轮询后台任务设短间隔唤醒**——harness 追踪的任务完成会自动回调，短轮询纯浪费；短间隔只用在 harness 看不见的外部状态（CI、部署、远端队列）上。

顺带一提，**这份周报本身就是 `/schedule` 的教科书用例**。

### 2.5 持久记忆：文件化 + 索引化 【实测】

不是黑盒向量库，而是**一个目录 + 一堆带 frontmatter 的 markdown**，外加随会话加载的 `MEMORY.md` 索引。四类：`user` / `feedback` / `project` / `reference`，条目间用 `[[wiki-link]]` 互链。设计意图很明确：可读、可审、可 diff、可手删。规则里还明确禁止存"仓库已记录的东西"（代码结构、git 历史、CLAUDE.md）——记忆只装**代码里读不出来的**信息。

### 2.6 模型与运行档位 【实测】

- 当前会话：**Opus 5**（`claude-opus-5`）；Claude 5 家族含 Fable 5、Opus 5、Sonnet 5，另有 Haiku 4.5
- 子智能体可用 `model` 单独覆盖档位，**fork 类型除外**（永远继承父级）
- **Fast mode**（`/fast`）：Opus 5 / 4.8 / 4.7 可用。环境提示特意澄清了一个常见误解——**它不降级到小模型**，仍是 Opus，只是输出更快
- 本会话用 **1 小时** prompt cache TTL（用量超额后降到 5 分钟）

### 2.7 `/code-review ultra` 【实测】

多智能体云端审查，覆盖当前分支或指定 PR（`/code-review ultra <PR#>`）。两个约束：**用户触发、单独计费**，模型侧无法自行发起；无参数形态打包本地分支，**不需要 GitHub remote**，但必须在 git 仓库内。`/ultrareview` 是废弃别名。

## 3. 存量条目（截至 2026-05，需复核）【存量】

- **Hooks**：在 `settings.json` 配置，由 harness 而非模型执行。"从今往后每次 X 都要 Y"只能靠 hook，写进记忆无效
- **权限模式**：被拒的调用应调整方案而非原样重试（本期简报就是活例子）
- **多端形态**：CLI、桌面端（Mac/Windows）、Web（claude.ai/code）、IDE 插件（VS Code、JetBrains）
- **上下文压缩**：会话过长时自动摘要，摘要 + 未压缩部分进入下一窗口

## 4. 建议动作

| 优先级 | 动作 | 理由 |
|---|---|---|
| 高 | 授权 WebSearch / WebFetch | 否则周报永远缺"增量"这一维 |
| 高 | 用 `/schedule` 把周报做成定时 routine | 手工成本高、格式固定 |
| 中 | 重新评估 MCP server 安装清单 | ToolSearch 已解除上下文顾虑 |
| 中 | 把团队工作流沉淀成 Skill 并配 eval | `skill-creator` 已提供度量手段 |
| 中 | 跑一次 `/fewer-permission-prompts` | 自动生成只读命令白名单 |
| 低 | 梳理 `MEMORY.md` 清过期条目 | 索引随会话加载，冗余直接吃上下文 |

## 5. 本期缺口

没能覆盖：本周官方 changelog 与版本号 · 本周 Anthropic 博客/公告 · 社区动态（GitHub issue、HN/X） · 竞品对照 · 定价与用量政策变化。

补齐方式：授权联网后抓 `github.com/anthropics/claude-code` 的 `CHANGELOG.md`、`anthropic.com/news`、`docs.claude.com` 发布说明三个源即可覆盖前两项。

---

需要我做的话：授权 WebSearch/WebFetch 后我可以重出一版带引用的正式增量简报；或者授权写文件，我把这份存成 `裸聊产出.md`（该文件已存在且为空）。
