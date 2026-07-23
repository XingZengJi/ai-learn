# Introduction to Subagents - 02 Creating a subagent 创建子智能体

> Course: Introduction to Subagents(Subagents 入门)· Lesson 2
> 课程: Introduction to Subagents · 第 2 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

自定义子智能体专精于特定任务——评审代码、写测试、检查文档。它们定义为**带 YAML frontmatter 的 markdown 文件**,告诉 Claude 何时使用这个子智能体、以及它该怎么行动。

## 创建流程

最简单的方式是用 **`/agents`** 斜杠命令,它会打开管理子智能体的主界面,从那里选 **Create new agent**。

**第一步: 选作用域**

- **项目级 Project-level** —— 只在当前项目可用
- **用户级 User-level** —— 本机所有项目共享

**第二步: 选创建方式**

你可以手写配置,但**推荐的做法是让 Claude 帮你生成**——描述一下你想让这个子智能体做什么,Claude 会据此产出 name、description 和系统提示词。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1773974844%2Fsubagentsvideo2version3_04.1773974843174.png)

## 定制工具权限

创建过程中你可以选择这个子智能体能访问哪些工具。工具分类包括:

- 只读工具 Read-only tools
- 编辑工具 Edit tools
- 执行工具 Execution tools
- MCP 工具
- 其他工具

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1773974881%2Fsubagentsvideo2version3_06.1773974881320.png)

**想清楚它到底需要什么。** 一个代码评审员大概不需要编辑工具——它该读和分析代码,而不是改代码。不过你可能想保留执行工具,好让它更容易看出有哪些待提交的改动。

## 选模型与颜色

配好工具后,选择驱动这个子智能体的 Claude 模型,有四个选项:

| 选项 | 适合 |
|---|---|
| **Haiku** | 快速、轻量的任务 |
| **Sonnet** | 速度与深度之间的平衡点 |
| **Opus** | 复杂分析 |
| **Inherit** | 沿用主对话正在用的模型 |

最后选一个颜色。它会显示在界面上,让你一眼看出当前是哪个子智能体在跑——**小细节,但同时跑多个子智能体时很有用**。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1773974921%2Fsubagentsvideo2version3_07.1773974921584.png)

## 配置文件长什么样

创建完成后,配置文件保存进你的项目,通常在 `.claude/agents/你的智能体名.md`:

```markdown
---
name: code-quality-reviewer
description: Use this agent when you need to review recently written or modified code for quality, security, and best practice compliance.
tools: Bash, Glob, Grep, Read, WebFetch, WebSearch
model: sonnet
color: purple
---

You are an expert code reviewer specializing in quality assurance, security best practices, and
adherence to project standards. Your role is to thoroughly examine recently written or modified code
and identify issues that could impact reliability, security, maintainability, or performance.
```

各字段含义:

| 字段 | 说明 |
|---|---|
| `name` | 唯一标识符。你可以直接让 Claude 用它,或在消息里打 `@agent code-quality-reviewer` |
| `description` | **控制 Claude 何时决定使用这个子智能体**。必须是**单行**(需要换行就用转义的 `\n`)。可以在这里放示例对话,帮 Claude 理解什么时候该委派 |
| `tools` | 它能访问哪些工具。对应你生成时的选择,**随时可以在这里改** |
| `model` | 用哪个模型: `sonnet` / `opus` / `haiku` / `inherit` |
| `color` | 界面上用于识别的颜色 |

## 系统提示词

markdown 文件正文(YAML frontmatter 以下的全部内容)就是**系统提示词**。这里给子智能体下达指令: 它该关注什么、该怎么分析、该怎么把发现汇报回主智能体。

> **一份写得好的系统提示词,是「有用的子智能体」与「抓不住重点的子智能体」之间的分水岭。** 要具体说明它该找什么、输出该怎么组织。

## 让 Claude 自动使用你的子智能体

如果你希望 Claude 不用你明说就主动委派,**在 `description` 字段里包含 "proactively" 这个词**。例如:

```markdown
description: Proactively suggest running this agent after major code changes...
```

你还可以在描述里加**示例对话**,帮 Claude 理解具体该在哪些场景使用。**例子越具体,Claude 越清楚什么时候该委派。**

## 测试你的子智能体

创建完成后,改点代码、让 Claude 评审一下,试试看。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1773974991%2Fsubagentsvideo2version3_14.1773974991791.png)

**如果该用的时候没用上,回头检查 `description`。** 加入更具体的例子和触发场景,能帮 Claude 理解何时把工作委派给它。

## 对产品经理来说

「**代码评审员不需要编辑工具**」这个例子,是权限设计里最朴素也最容易被跳过的一条: **按职责给权限,而不是图省事全给。** 全给的诱惑很大,因为省得以后再调;代价是这个角色的边界变得模糊,而且它随时可能做出你没预期的事。

`model` 字段那四个选项也值得留意——**这是个成本/能力的显式旋钮**。一个只做快速搜索的子智能体用 Haiku 就够了,没必要每次都上 Opus。**能把不同环节匹配到不同档位的模型,是控制 AI 应用成本最直接的手段**,而很多方案从头到尾只用一个模型。

还有一点和上一门 Agent Skills 课完全呼应: **`description` 决定了它会不会被触发。** 两门课都把"没触发"的根因指向同一个字段。这背后是同一个机制——**主智能体在做选择时,看到的只有名称和描述**。

---

*本课程为 Anthropic Academy 官方课程,笔记为学习用途的中文整理。*
