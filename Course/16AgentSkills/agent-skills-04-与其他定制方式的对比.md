# Introduction to Agent Skills - 04 Skills vs. other Claude Code features 与其他定制方式的对比

> Course: Introduction to Agent Skills(Agent Skills 入门)· Lesson 4
> 课程: Introduction to Agent Skills · 第 4 课 · 建议用时 15 分钟
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## What You'll Learn 本课目标

- 把 Skills 与 CLAUDE.md、子智能体、Hooks、MCP 服务器做对比
- 为给定场景选对定制方式
- 设计一套多种能力互补的配置

Claude Code 提供好几种定制方式,**选错会带来不必要的复杂度**。这一课就是讲怎么选。

## CLAUDE.md vs Skills

**CLAUDE.md 每次对话都加载,始终生效。** 想让 Claude 在这个项目里用 TypeScript 严格模式,写进 CLAUDE.md。

**Skills 按需加载。** 匹配上请求时,它的指令才加入对话。你写新代码时不需要 PR 评审清单待在上下文里——等你要评审时它才激活。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1771527266%2FSkills4_06.1771527266559.png)

| 用 CLAUDE.md | 用 Skills |
|---|---|
| 始终适用的项目级标准 | 任务特定的专业知识 |
| 约束条件(如「绝不修改数据库 schema」) | 只是偶尔相关的知识 |
| 框架偏好与代码风格 | 会把每次对话搞乱的详细流程 |

## Skills vs 子智能体 Subagents

- **Skills 给当前对话增加知识** —— 激活时,指令加入现有上下文
- **子智能体在独立上下文里运行** —— 接到任务,独立完成,返回结果,与主对话隔离

| 用子智能体 | 用 Skills |
|---|---|
| 想把任务委派到独立执行环境 | 想增强 Claude 处理当前任务的知识 |
| 需要与主对话不同的工具权限 | 这份专业知识贯穿整场对话 |
| 想让委派的工作与主上下文隔离 | |

## Skills vs Hooks

- **Hooks 由事件触发** —— 比如每次 Claude 保存文件就跑一次 linter,或在特定工具调用前做校验
- **Skills 由请求触发** —— 根据你在问什么而激活

| 用 Hooks | 用 Skills |
|---|---|
| 每次文件保存都该跑的操作 | 影响 Claude 怎么处理请求的知识 |
| 特定工具调用前的校验 | 影响 Claude 推理方式的准则 |
| Claude 动作的自动副作用 | |

## MCP 服务器

**MCP 提供的是外部工具与集成——和 Skills 完全是另一个类别的东西。** 它不是"另一种写指令的方式",而是给 Claude 接上外部系统。

## 组合使用

一套典型配置可能长这样:

| 组件 | 职责 |
|---|---|
| **CLAUDE.md** | 始终生效的项目标准 |
| **Skills** | 按需加载的任务专业知识 |
| **Hooks** | 事件触发的自动操作 |
| **子智能体** | 委派工作的隔离执行环境 |
| **MCP 服务器** | 外部工具与集成 |

**各管各的专长。别在另一个选项更合适时硬把一切塞进 Skills——而且这些是可以同时用的。**

## Key Takeaways 核心要点

- **CLAUDE.md 每次都加载**,适合始终生效的项目标准;**Skills 按需加载**,适合任务特定的专业知识
- **子智能体跑在隔离上下文里**,用于委派工作;**Skills 给当前对话加知识**
- **Hooks 是事件驱动**(文件保存、工具调用);**Skills 是请求驱动**(基于你在问什么)
- **MCP 服务器提供外部工具与集成**,与 Skills 属于完全不同的类别
- 每种能力各有专长——**组合使用,而不是硬塞进一种**

## Lesson Reflection 本课反思

- 看看你现在的 CLAUDE.md,里面有没有哪些内容更适合做成 Skill(只在相关时加载)?
- 团队的开发流程里,哪种组合(Skills、Hooks、子智能体、MCP)最能解决你们最常见的痛点?

## 对产品经理来说

这一课本质上是一张**选型对照表**,而选型的核心变量就两个: **什么时候加载**,和**在哪个上下文里跑**。

- 按时机分: 始终(CLAUDE.md)/ 按请求(Skills)/ 按事件(Hooks)
- 按上下文分: 当前对话(Skills)/ 隔离环境(子智能体)
- 单独一类: 接外部系统(MCP)

想清楚这两个维度,选型就不用背表了。

对你现在的仓库来说,那个反思题很值得真做一遍: **打开 CLAUDE.md,看看哪些内容其实只在特定时候用得上。** 比如「补题库」那套流程——只有出题时才需要,平时每次对话都载入它是浪费。这类"有明确触发场景的多步流程",正是 Skills 的典型形态。

更普遍的一点是: **「什么都能用 X 做」通常是选型出问题的信号。** 一个足够灵活的工具会诱惑你拿它解决所有问题,代价是复杂度慢慢堆积在一个不该承担这些的地方。这条在选技术方案、选协作工具、设计组织流程时都成立。

---

*本课程为 Anthropic Academy 官方课程,笔记为学习用途的中文整理。*
