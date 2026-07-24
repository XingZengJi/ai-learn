# Building with the Claude API - 63 Anthropic apps Anthropic 出品的应用

> Course: Building with the Claude API · Lesson 63
> 课程: Building with the Claude API · 第 63 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

在这个模块里,我们会探索 Anthropic 打造的两款强大应用:Claude Code 和 Computer Use。它们不仅本身就是好用的工具,更是「AI agent(智能体)实际运作」的绝佳范例。理解它们是如何运作的,能为你之后自己搭建 agent 打下坚实的基础。

## 我们的学习计划

我们会按一个循序渐进的顺序,逐步加深理解:

1. **Claude Code** —— 从这个跑在终端里的智能编程助手开始
2. **Computer Use** —— 探索这套能让 Claude 与桌面应用交互的工具
3. **Agents(智能体)** —— 理解是什么让这些应用作为 agent 获得成功

## Claude Code

Claude Code 是一个基于终端的编程助手,能在各种编程任务上帮到你。可以把它想象成:Claude 就在你的命令行里,随时准备:

- 编辑文件、修复 bug
- 回答编程相关的问题
- 协助各种开发工作流程

我们会走一遍完整的搭建流程,然后在一个小样例项目上实际使用 Claude Code,让你清楚看到它在实践中是如何运作的。

## Computer Use

Computer Use 把 Claude 的能力推进得更远。它是一套工具集合,能让 Claude 与完整的桌面电脑环境交互。这意味着 Claude 可以:

- 访问网站、浏览互联网
- 与桌面应用程序交互
- 执行需要在可视化界面里操作的任务

相比纯文本交互,这极大地扩展了 Claude 能做的事情。

## 为什么这些对理解 Agent 很重要

Claude Code 和 Computer Use 都是理解 agent 的绝佳案例研究。它们展示了让 agent 真正有效运作的几条关键原则:

- 工具的集成与使用
- 多步骤任务的执行
- 与环境的交互
- 自主的问题解决能力

通过研究这些真实世界的实现,你会获得关于「Claude Code 和 Computer Use 为什么能成功」的洞察,这些洞察也会为你自己开发 agent 提供参考。

下一节,我们从 Claude Code 的搭建流程开始。

---

对产品经理来说,这一课是给「智能体(agent)」这个概念找了两个活生生的产品原型:Claude Code(智能编程助手)证明了「给 AI 配上合适的工具 + 让它自主决定怎么用」能解决实打实的工程问题;Computer Use 则证明了这套思路能扩展到「操作图形界面」这类更复杂的场景。理解这两款产品的设计,比单纯听「什么是 agent」的定义,更能帮你判断自己团队的需求适不适合用 agent 模式来做。
