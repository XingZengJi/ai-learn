# Claude Code 101 - 2 How Claude Code Works Claude Code 工作原理

> Course: Claude Code 101 · Lesson 2
> 课程: Claude Code 101 · 第 2 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 整理翻译存档

Claude Code is different from typical chat applications. Understanding how it works under the hood will help you use it more effectively.

> Claude Code 和常见的聊天类应用不一样。理解它底层的运作方式,能帮你更有效地使用它。

## The Agentic Loop 智能体循环

Claude Code is best explained through the agentic loop:

> 理解 Claude Code 最好的方式,是看它的「智能体循环」(agentic loop):

1. You enter a prompt into Claude Code.

   你向 Claude Code 输入一条提示词。

2. Claude gathers the context it needs by interacting with the model, which returns text or a tool call that Claude Code can execute.

   Claude 通过与模型交互来收集所需的上下文,模型会返回文本,或者返回一个 Claude Code 可以执行的工具调用(tool call)。

3. It takes action — for example, editing a file or running a command.

   它采取行动——比如编辑一个文件,或者运行一条命令。

4. It verifies the results and determines whether they achieve what your prompt set out to do.

   它核查执行结果,判断是否达成了你提示词里设定的目标。

5. If they do, Claude finishes and waits for the next prompt. If they don't, it loops back and tries again until the results are complete and verifiable.

   如果达成了,Claude 就完成任务,等待你下一条提示词;如果没达成,它就回到循环里重新尝试,直到结果完整且可核查。

Throughout this loop, you can add context, interrupt, or steer the model to help guide it toward your goal.

> 在整个循环过程中,你都可以随时补充上下文、打断它,或者引导模型,帮它更好地朝你的目标前进。

> Diagram of the agentic loop: Your prompt flows into the loop of Gather context, Take action, and Verify results, with the ability to interrupt, steer, or add context at any point(课程页面内嵌图示,此处仅保留文字说明,未随文字内容一并提供)

对产品经理来说,这个循环很像带一个执行力很强、但需要你随时把关的下属:你交代需求(输入提示词)→ 他先去了解情况(收集上下文)→ 动手干活(采取行动)→ 自己检查结果对不对(核查结果)→ 不对就返工,对了就等你下一个任务。你可以在任何一步插话、补充信息或叫停。

## Context 上下文

Claude has a context window that determines how much of your conversation, file contents, command outputs, and more it can store and reference. Once you reach that limit, Claude Code compacts your conversation — automatically determining what it can remove or summarize to bring the context window back down to a usable size.

> Claude 拥有一个上下文窗口,决定了它能存储和引用多少对话内容、文件内容、命令输出等信息。一旦达到这个上限,Claude Code 会「压缩」(compact)你的对话——自动判断哪些内容可以删除或总结,把上下文窗口重新压缩到可用的大小。

## Tools 工具

Tools are the backbone of how agents work. Most AI assistants simply take text in and return text out. Tools let Claude Code determine when to execute code to get closer to completing a task. This could be a file-reading tool, a web search tool, or any number of other capabilities. Claude Code uses semantic understanding to determine when to call a tool and how to use the output.

> 工具(tools)是智能体运作方式的核心支柱。大多数 AI 助手只是「输入文字、输出文字」,而工具让 Claude Code 能够判断什么时候该执行代码,从而更接近完成任务的目标。这可能是一个读文件的工具、一个网络搜索工具,或是其他任意数量的能力。Claude Code 会依靠语义理解来判断何时调用某个工具,以及如何使用工具返回的结果。

## Permissions 权限

Claude Code has several permission modes:

> Claude Code 有几种权限模式:

- **Default behavior**: Claude asks for explicit permission before editing a file or running a shell command.

  **默认模式**:Claude 在编辑文件或运行 shell 命令之前,会明确请求你的许可。

- **Auto-accept**: Files are edited without asking, but commands still require approval.

  **自动接受模式**:文件编辑无需询问就会执行,但命令仍需你批准。

- **Plan mode**: Uses read-only tools to compile a plan of action before starting any work.

  **计划模式(Plan mode)**:在开始任何实际工作之前,先只用只读工具梳理出一份行动计划。

> Claude Code asking for permission before running a bash command(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

All of this can be configured in your settings file. Be cautious when skipping permissions — giving Claude Code free rein to run commands means a mistake could be harder to catch before it happens.

> 以上所有权限设置都可以在配置文件中调整。跳过权限确认时要格外谨慎——放手让 Claude Code 自由运行命令,意味着一旦出错,在造成影响之前就更难被及时发现。

## Recap 小结

Claude Code combines several agentic concepts: an agentic loop, a managed context window, tools, and configurable permissions — all inside your terminal. It can read your codebase, take action, and verify its own work. That's what makes it fundamentally different from a chat window.

> Claude Code 融合了几个智能体核心概念:智能体循环、受管理的上下文窗口、工具,以及可配置的权限——这一切都发生在你的终端里。它能阅读你的代码库、采取行动,并核查自己的工作成果。这正是它与普通聊天窗口有本质区别的原因。
