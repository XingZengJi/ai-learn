# Introduction to Agent Skills - 01 What are skills? 什么是 Skills

> Course: Introduction to Agent Skills(Agent Skills 入门)· Lesson 1
> 课程: Introduction to Agent Skills · 第 1 课 · 建议用时 15 分钟
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## What You'll Learn 本课目标

- 说清楚什么是 Claude Code Skills、它怎么工作
- 说明 Skills 存放在哪里(个人目录 vs 项目目录)
- 区分 Skills、CLAUDE.md 和斜杠命令
- 判断什么场景下 Skills 是对的定制方式

## 它要解决的问题

每次向 Claude 解释团队的编码规范,你都在重复自己。每次 PR 评审,你都要重新描述希望反馈怎么组织。每次提交,你都要提醒它你偏好的格式。

**Skills 就是来解决这个的。** 一个 Skill 是一份 markdown 文件,把「怎么做某件事」教给 Claude 一次,之后它在相关场景**自动**应用这份知识。

## Skills 是什么

Skills 是**装着指令与资源的文件夹**,Claude Code 能发现它们并用来更准确地完成任务。每个 Skill 的核心是一个 `SKILL.md` 文件,frontmatter 里写着 `name` 和 `description`。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1771527257%2FSkills1_05.1771527257795.png)

**`description` 是 Claude 判断要不要用这个 Skill 的依据。** 当你发出请求,Claude 会把你的话与所有可用 Skill 的描述做比对,激活匹配上的那些。

frontmatter 长这样:

```markdown
---
name: pr-review
description: Reviews pull requests for code quality. Use when reviewing PRs or checking code changes.
---
```

frontmatter 下面写的就是实际指令——你的评审清单、格式偏好,或者这个任务需要 Claude 知道的任何东西。

## Skills 存在哪里

| 类型 | 位置 | 特点 |
|---|---|---|
| **个人 Skills** | `~/.claude/skills` | 跟着你走,在所有项目里都生效 |
| **项目 Skills** | 仓库根目录下 `.claude/skills` | 克隆仓库的人自动获得 |

Windows 上个人 Skills 在 `C:/Users/<你的用户名>/.claude/skills`。

个人 Skills 适合放你的提交信息风格、文档格式、你喜欢的代码讲解方式;项目 Skills 适合放团队标准,比如公司的品牌规范、网页设计的指定字体与配色——它们**随代码一起进版本控制**,全团队共享。

## Skills vs CLAUDE.md vs 斜杠命令

这是本课最需要记住的区分:

| 方式 | 加载时机 | 适合 |
|---|---|---|
| **CLAUDE.md** | **每次对话都加载** | 始终生效的项目标准(比如「一律用 TypeScript 严格模式」) |
| **Skills** | **按需加载**,匹配到才载入 | 任务特定的专业知识 |
| **斜杠命令** | **必须你手动输入** | 需要显式触发的操作 |

Skills 的独特之处是**自动且任务特定**。启动时 Claude 只加载 Skill 的**名称和描述**,不占满上下文窗口——你调试代码时,PR 评审清单不需要待在上下文里,等你真的要评审时它才加载。

当 Claude 把某个 Skill 匹配到你的请求时,终端里会显示它被载入:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1771527259%2FSkills1_17.1771527259668.png)

## 什么时候该写 Skill

Skills 最适合**只在特定任务里用得上的专门知识**:

- 团队遵循的代码评审标准
- 你偏好的提交信息格式
- 机构的品牌规范
- 特定类型文档的模板
- 针对某个框架的调试清单

**判断标准只有一句**:

> 如果你发现自己在反复向 Claude 解释同一件事,那就是一个等着被写出来的 Skill。

## Key Takeaways 核心要点

- Skills 是装着指令的文件夹,核心是带 `name` 和 `description` frontmatter 的 `SKILL.md`
- **Claude 用 `description` 做匹配**——把你的请求与所有可用描述比对,激活匹配的
- 个人 Skills 在 `~/.claude/skills`(跨项目);项目 Skills 在 `.claude/skills`(随仓库共享)
- Skills **按需加载**,不同于每次都载入的 CLAUDE.md,也不同于必须手动输入的斜杠命令
- **反复解释同一件事 = 一个该写的 Skill**

## Lesson Reflection 本课反思

- 回想最近几次用 Claude Code 的经历,你重复了哪些指令?写成 Skill 能省多少时间?
- 团队工作流里,哪些标准或流程最值得编码成 Skills?

## 对产品经理来说

这一课的价值不在技术细节,在那条判断标准: **重复即信号**。你反复解释的东西,本质上是你脑子里有、但系统里没有的知识。这跟识别"该写进文档的东西"是同一个直觉——只不过这次的读者是 AI,而且它读完真的会照做。

三种定制方式的区分也值得记牢,因为**选错的代价是上下文浪费**: 始终生效的放 CLAUDE.md,偶尔用到的放 Skills。很多人把所有规范一股脑塞进 CLAUDE.md,结果每次对话都背着一堆当前用不上的规则,既占窗口又稀释注意力。

你自己就有现成的例子:这个仓库的 `CLAUDE.md` 写的是"点亮流程""补题库流程"这类项目级约定——始终该知道的;而 `shared/skills/` 下那些才是按需加载的。这个分工恰好就是这一课讲的。

---

*本课程为 Anthropic Academy 官方课程,笔记为学习用途的中文整理。*
