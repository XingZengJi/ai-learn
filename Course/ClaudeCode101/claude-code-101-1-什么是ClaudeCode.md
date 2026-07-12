# Claude Code 101 - 1 What is Claude Code? 什么是 Claude Code?

> Course: Claude Code 101 · Lesson 1
> 课程: Claude Code 101 · 第 1 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 整理翻译存档

## What is Claude Code? 什么是 Claude Code?

Claude Code is an agentic coding tool that understands your codebase, edits your files, runs commands, and integrates with your existing developer tools to help you get things done faster. It's available in your terminal, Visual Studio Code, the Claude Desktop app, on the web, and in JetBrains IDEs.

> Claude Code 是一款智能体编码工具(agentic coding tool),它能理解你的代码库、编辑你的文件、运行命令,并与你现有的开发工具集成,帮你更快完成工作。你可以在终端、Visual Studio Code、Claude 桌面应用、网页端以及 JetBrains 系列 IDE 中使用它。

## What Separates Claude Code from Claude? Claude Code 与 Claude 的区别

If you've used Claude.ai before, you might be wondering what makes Claude Code different. Unlike Claude.ai, Claude Code has direct access to your files, your terminal, and your entire codebase. Instead of copying and pasting code back and forth, it goes in and does the work itself.

> 如果你用过 Claude.ai,可能会好奇 Claude Code 有什么不同。与 Claude.ai 不同,Claude Code 能直接访问你的文件、终端和整个代码库。它不需要你来回复制粘贴代码,而是自己动手完成工作。

The key differentiator is that Claude Code works as an AI Agent.

> 关键的区别在于:Claude Code 是以 AI 智能体(AI Agent)的方式工作的。

### What is an Agent? 什么是 Agent(智能体)?

An AI Agent is software that can interact with its environment and perform actions to complete a defined goal. At its core, this works by having a large language model operating in a loop in real time. AI Agents can have access to tools, external services, or even other AI Agents to help reach their goals.

> AI 智能体(AI Agent)是一种能够与所处环境交互、并采取行动以完成既定目标的软件。其核心原理是让大语言模型实时地在一个循环中运转。AI 智能体可以调用工具、外部服务,甚至其他 AI 智能体,来帮助自己达成目标。

对产品经理来说,可以把「Agent」理解成:普通 Claude.ai 像是一个只会「说」的顾问,你说需求、它给建议,落地还得你自己动手;而 Claude Code 这个 Agent 更像一个会自己动手干活的助理——听完需求后,会主动去翻文件、跑命令、改代码,再回头检查结果对不对,而不是只在嘴上给你建议。

## What Can Claude Code Actually Do? Claude Code 实际能做什么?

Here's what that looks like in practice:

> 具体到实践中,Claude Code 能做这些事:

- **Read and understand your codebase.** You can ask Claude Code to explain a feature or trace a bug throughout your code.

  **阅读并理解你的代码库。** 你可以让 Claude Code 解释某个功能,或者顺着代码追踪一个 bug 的来龙去脉。

- **Edit files across your project.** Claude Code can refactor a function and update every file that references it.

  **跨项目编辑文件。** Claude Code 可以重构一个函数,并同步更新所有引用它的文件。

- **Run terminal commands.** It can execute your build script, run your tests, install packages, and use the output to decide what to do next.

  **运行终端命令。** 它可以执行构建脚本、跑测试、安装依赖包,并根据输出结果决定下一步该做什么。

- **Search the web.** If it needs documentation or the latest API references, it can look that up for you.

  **搜索网络。** 如果需要查文档或最新的 API 参考资料,它可以帮你查找。

## Using Claude Code Effectively 如何有效使用 Claude Code

To use Claude Code effectively, keep these three concepts in mind:

> 想用好 Claude Code,请记住以下三个核心概念:

- **The context window.** Think of this as Claude's working memory. It can hold a lot, but not everything at once. This is where the "agentic" aspect comes in — Claude finds strategic ways to locate answers within your codebase without loading the entire thing into context.

  **上下文窗口(context window)。** 可以把它理解成 Claude 的「工作记忆」。它能装下很多内容,但不能把所有东西同时都装进去。这正是「智能体」特性发挥作用的地方——Claude 会用有策略的方式在代码库里定位答案,而不是把整个代码库都塞进上下文。

- **It asks for permission.** By default, Claude Code will ask you before running commands or making changes. You're always in control, whether you prefer a hands-on or hands-off approach.

  **它会请求许可。** 默认情况下,Claude Code 在运行命令或做出改动之前会先征求你的同意。无论你喜欢亲力亲为地把关,还是放手让它自主处理,主导权始终在你手里。

- **It can make mistakes.** Just like any tool, Claude Code isn't perfect. It might misunderstand your intent, introduce a bug, or over-engineer a solution. Staying in the loop helps you catch these early.

  **它也会犯错。** 和任何工具一样,Claude Code 并不完美。它可能会误解你的意图、引入新的 bug,或者把方案做得过度复杂。持续参与、保持关注,能帮你尽早发现这些问题。

## Recap 小结

Claude Code is an agentic coding tool. It reads your codebase, edits your files, runs commands, and connects to external tools to help you ship faster. You can use it today in your terminal, VS Code, JetBrains, and the Claude Desktop app.

> Claude Code 是一款智能体编码工具。它能阅读你的代码库、编辑文件、运行命令,并连接外部工具,帮你更快交付成果。你现在就可以在终端、VS Code、JetBrains 和 Claude 桌面应用中使用它。
