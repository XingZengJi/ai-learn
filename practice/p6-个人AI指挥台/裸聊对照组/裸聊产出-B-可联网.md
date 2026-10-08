> ⚠️ **以下为 AI 原样输出，未经核实，仅作 p6 对照实验材料**（对照的是「不给上下文、直接裸聊」能产出什么）。其中的判断与推测不代表作者观点。

写文件被拒了，直接输出。这次联网工具可用，内容全部来自实抓信源（每条都在末尾附了链接）。

---

# Claude Code 动态简报

**期号**：2026 年第 31 周（07-25 ~ 07-31） · **生成日期**：2026-07-31

## 1. 速览

本周是**"消化周"而非"发布周"**。三件事定调：

1. **MCP 2026-07-28 正式规范落地**（7/28）—— 协议核心转为无状态，是 MCP 自诞生以来最大的一次破坏性改版，Claude 侧支持"即将推出"
2. **CLI 发版罕见停摆** —— `v2.1.220`（7/25 01:35）之后本周**零新版本**，此前近乎日更
3. **7/29–30 两次网络故障** —— claude.ai / API / Claude Code / Cowork 均受影响，7/30 晚间恢复

上周 Opus 5 发布的势能仍在释放，本周官方注意力明显转向**协议层与稳定性**。

## 2. 头条：MCP 2026-07-28 规范正式发布

7 月 28 日，MCP 发布自 `2025-11-25` 以来的新规范版本。不是增量更新，**是协议范式的替换**。

### 破坏性变更（挑对 Claude Code 用户影响最大的）

| 变更 | 影响 |
|---|---|
| **移除会话层** —— 删掉 `Mcp-Session-Id` 头，`tools/list` 等不再随连接变化 | 需要跨调用状态的 server 改用**显式 handle 作为普通工具参数**传递 |
| **移除 `initialize` 握手**，协议彻底无状态 | 协议版本与客户端能力改由每请求的 `_meta` 携带；新增 `server/discover` RPC 做版本协商 |
| **移除 SSE 断流续传**（`Last-Event-ID`、事件 ID） | 响应流断了就丢请求，客户端**必须用新 request ID 重发** |
| **`resources/subscribe` → `subscriptions/listen`** | 单条长连 POST 流，客户端按类型显式 opt-in |
| **删除 `ping`、`logging/setLevel`、`notifications/roots/list_changed`** | 日志级别改为 per-request 的 `_meta.logLevel` |
| **所有 result 必须带 `resultType`** | 老 server 省略该字段时，客户端一律按 `"complete"` 处理 |
| **MRTR 多轮请求模式** | 取代服务端反向发起的 `roots/list` / `sampling/createMessage` / `elicitation/create` |

**Roots、Sampling、Logging 三大特性整体进入弃用期**（最短 12 个月窗口）。官方迁移路径：Roots → 用工具参数或 resource URI 传目录；Sampling → 直连 LLM 厂商 API；Logging → 写 `stderr` 或走 OpenTelemetry。`HTTP+SSE` 传输、OAuth 2.0 动态客户端注册（RFC 7591）同步降为 Deprecated，后者让位给 **Client ID Metadata Documents**。

### 顺带的好东西

- **Tasks 成为首个官方扩展**（`io.modelcontextprotocol/tasks`，AWS 贡献）—— 长任务改为 `tasks/get` 轮询 + `tasks/update` 回灌输入，server 可主动返回 task handle
- **列表结果可缓存** —— `tools/list` 等新增必填 `ttlMs` / `cacheScope`，并要求**确定性排序**以提高 prompt cache 命中率
- OpenTelemetry trace 透传约定（`traceparent` / `tracestate` / `baggage`）
- 新增**特性生命周期与弃用政策**（Active / Deprecated / Removed + 弃用登记表）

### Claude 侧时间表

官方博客只表态"支持正在向 Claude 各产品推出中（soon）"，**未给确切日期，也未给存量 server 的迁移指南**。当前建议仅两条：读规范和 SDK；要提交到 connectors 目录的先看提交文档。

> **判断**：本周不用动手，但下周起要盯 Claude Code changelog 里的 MCP 版本协商条目。自建 MCP server 且依赖 Sampling / Roots 的团队，现在就该排迁移工。无状态化对 serverless 是纯利好——之前因粘性会话被迫上有状态部署的可以重估。

## 3. CLI：本周发版停摆

npm `latest` 仍是 **`v2.1.220`**（GitHub tag 时间 7/25 01:35），本周内**无新版本**。对照前两周节奏，这个空窗很反常：

| 版本 | 时间 | 主要内容 |
|---|---|---|
| **v2.1.220** | 7/25 01:35 | 仅 "bug fixes and reliability improvements" |
| v2.1.219 | 7/24 17:14 | **Opus 5 成为默认模型**（1M 上下文）；`sandbox.network.strictAllowlist`；`DirectoryAdded` hook；**子智能体可嵌套派生，深度上限 3**；MCP 报错带 HTTP 状态码 |
| v2.1.218 | 7/22 21:24 | **`/code-review` 改为后台子智能体运行**；修 Windows `\u` 路径损坏 |
| v2.1.217 | 7/21 21:35 | emoji shortcode 补全；**并发子智能体默认上限 20**；修截断 MCP 输出的内存泄漏 |
| v2.1.216 | 7/20 22:14 | `sandbox.filesystem.disabled`；**修长会话的二次方级消息规范化开销** |
| v2.1.215 | 7/19 02:56 | **`/verify` 与 `/code-review` 不再自动触发，必须显式调用** |

官方文档站的 **What's new 周报也停在 Week 29（7/13–17）**，Week 30 / 31 的 digest 页面均返回 404。

> **判断**：停摆 + 周报断更 + 7/29–30 故障，三者时间重合，合理推测是发版让位于稳定性处置。对使用方反而是好消息——`2.1.216` 起连续多版在修长会话性能、内存泄漏、权限绕过，**本周是把团队版本统一升到 2.1.220 的好窗口**，没有新变更打断。

## 4. 可用性：7/29–30 两次网络故障

24 小时内两起独立网络故障，影响 **claude.ai、API、Claude Code、Cowork**；Claude for Government 跑在隔离基础设施上未受影响，7/30 晚间全面恢复。故障期间的流量重调度本身又造成一部分请求失败。截至发稿**官方未发布事后分析**。这是两周内第二起可用性事件（前一起为 7/17 计费/访问异常，官方已退款并补偿等额额度）。

> **判断**：把 Claude Code 放进 CI / 定时 routine 的团队，这周该补**降级路径**——`fallbackModel`（最多三个按序回退）+ 关键流水线的重试与告警。别让一次 upstream 故障静默地把夜间巡检跑成空。

## 5. 模型：Opus 5 的第一个完整使用周

官方口径：**$5 / $25 每百万 token**（与 Opus 4.8 持平），**Fast mode 为 2 倍价格、约 2.5 倍速度**；Max 默认模型、Pro 上最强模型；API id `claude-opus-5`；CLI `v2.1.219` 明确 **1M 上下文**。官方基准强调的是性价比：Frontier-Bench v0.1 超越所有模型且成本更低、CursorBench 3.2 以一半成本做到 Fable 5 峰值的 0.5% 以内、ARC-AGI 3 为次优模型 3 倍、OSWorld 2.0 以 1/3 成本超过 Fable 5。

**第三方汇总（未见于官方页面，仅供参考）**：SWE-bench Verified 96.0%、SWE-bench Pro 79.2%（列 Mythos 5 80.3%、Fable 5 80.0% 之后，但相比 Opus 4.8 的 69.2% 是大幅跃升）。多篇评测的共同观察：变化不在"发现更多 bug"，而在**会自我校验、自我纠错并迭代到成功**。

> **判断**：官方反复出现的是"同等表现、更低成本"而非跑分领先。**选型按每任务成本算，不按单价算。**

## 6. Anthropic 公司侧

| 日期 | 事项 |
|---|---|
| 7/30 | Frontier Red Team 发布网络安全评估中三起真实事件的调查结果 |
| 7/27 | **开源权重立场声明** —— Dario Amodei 撰文澄清"Anthropic 从未主张禁止开源权重模型"，称无危险性的开放模型是"公共品"；同时继续主张芯片出口管制与安全测试要求 |
| 7/27 | Cognizant 合作扩展，向企业客户交付 Claude |

## 7. 社区脉搏

`anthropics/claude-code` issue 区本周新建条目的集中主题：

- **成本失真** —— 有报告称 `budget.spent()` 少报达 72 倍，4 小时耗尽周预算（标 SEV-1）
- **额度** —— session limit 触发；Fable 5 在 Max 计划下仍被要求使用额度
- **认证链路** —— 后台 auth daemon 拒绝主动刷新后无法自愈；claude.ai connector 在长驻进程中永久卡死
- **UI** —— FleetView 从详情页返回后花屏，需 resize 才重绘（v2.1.220，Linux）
- **交互输入** —— Bash 模式 `!` 遇到需交互输入的命令（如 sudo 密码）静默退出、无输出
- **编排语义** —— 子智能体会话在 orchestrator 任务通知中的可达性令人困惑

> **判断**：`budget.spent()` 那条如果属实，对按预算跑无人值守 agent 的团队是真金白银的风险。官方确认前，**不要把硬性成本闸门只押在 `budget.spent()` 上**，加一层账单侧独立告警。

## 8. 建议动作

| 优先级 | 动作 | 理由 |
|---|---|---|
| 高 | 自建 MCP server 排查 Sampling / Roots / SSE 续传依赖 | 已进入弃用期，无状态化是硬破坏性变更 |
| 高 | 关键流水线补 `fallbackModel` + 重试告警 | 两周两起可用性事件，尚无事后分析 |
| 高 | 团队版本统一升到 `v2.1.220` | 连续多版修性能/内存泄漏/权限绕过，本周无新变更打断 |
| 中 | 成本闸门加账单侧独立告警 | `budget.spent()` 少报的社区报告未被证伪 |
| 中 | 检查自动化脚本对 `/verify`、`/code-review` 的依赖 | `2.1.215` 起不再自动触发 |
| 中 | 按每任务成本重做模型选型 | Opus 5 官方基准卖点在成本效率 |
| 低 | 评估无状态 MCP server 的 serverless 化 | 会话层移除后粘性部署约束解除 |

## 9. 口径说明

- **一手核实**：MCP 规范变更日志、GitHub Releases 时间戳、npm registry `latest`、Anthropic 新闻室、Opus 5 产品页、claude-code issue 区
- **二手**：故障时间线与影响面（第三方复盘引述 @ClaudeDevs）、SWE-bench 具体数值（汇总站，未见于官方页面）——正文已标注
- **未覆盖**：Week 30 / 31 官方 digest（404）、故障官方事后分析（未发布）、Claude Code 侧 MCP 新规范的确切支持日期（官方仅称 soon）

---

**Sources:**
- [Claude Code CHANGELOG](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md) · [GitHub Releases](https://github.com/anthropics/claude-code/releases) · [npm registry](https://registry.npmjs.org/@anthropic-ai/claude-code/latest) · [Claude Code issues](https://github.com/anthropics/claude-code/issues)
- [Claude Code What's new](https://code.claude.com/docs/en/whats-new) · [Releasebot 版本时间线](https://releasebot.io/updates/anthropic/claude-code)
- [MCP 2026-07-28 变更日志](https://modelcontextprotocol.io/specification/2026-07-28/changelog) · [MCP 博客](https://blog.modelcontextprotocol.io/posts/2026-07-28/) · [Anthropic：把 MCP 2026-07-28 带到 Claude](https://claude.com/blog/bringing-mcp-2026-07-28-to-claude)
- [Anthropic 新闻室](https://www.anthropic.com/news) · [Introducing Claude Opus 5](https://www.anthropic.com/news/claude-opus-5)
- [7/29–30 故障复盘（第三方）](https://explainx.ai/blog/claude-outage-network-failures-recovery-july-2026) · [Opus 5 基准汇总（第三方）](https://claude5.ai/news/claude-opus-5-benchmark-results-analysis)

---

两点说明：

- 目录里的 `裸聊产出-可联网.md` 我没能写入（权限被拒）。授权后我可以直接存过去。
- 上一版把本周记作 `07-25~07-31`，按 ISO 周历第 31 周实际是 `07-27~08-02`，官方 What's new 也是按周一到周五算（Week 29 = 7/13–17）。我沿用了你原来的窗口，好处是 `v2.1.220`（7/25）能进来；如果想跟官方对齐，下期起改成 `07-27~07-31`。
