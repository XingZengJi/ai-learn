# Claude Code 101 - 4 Your First Prompt 你的第一个提示词

> Course: Claude Code 101 · Lesson 4
> 课程: Claude Code 101 · 第 4 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 整理翻译存档

You talk to Claude Code like you would any AI assistant. When entering your prompt, here are some things to consider that can both protect you and make things easier.

> 和 Claude Code 对话,就像和任何 AI 助手对话一样。在输入提示词时,有几件事值得考虑,既能保护你,也能让事情更顺利。

## Auto-Accept vs. Approval 自动接受 vs. 逐一审批

You can choose whether Claude auto-accepts every file change it suggests, or whether it asks for your explicit permission each time. Press Shift + Tab to cycle between modes.

> 你可以选择让 Claude 自动接受它提出的每一个文件改动,还是每次都明确征求你的许可。按 Shift + Tab 可以在几种模式之间切换。

- **Approval mode**: Claude asks permission each time it wants to edit a file or run a command.

  **审批模式**:Claude 每次想编辑文件或运行命令时,都会先请求许可。

- **Auto-accept mode**: File edits are automatically approved, but commands still require your permission.

  **自动接受模式**:文件编辑会自动通过,但命令仍然需要你批准。

There's no right or wrong answer — it's whatever you're comfortable with.

> 这没有绝对的对错——选你自己觉得舒服的方式就好。

> Claude Code in auto-accept mode, reading files and working through a task(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## Plan Mode 计划模式

Within the Shift + Tab menu is Plan Mode. Plan mode takes your prompt and uses read-only tools to analyze your codebase and research your suggested implementation. It will ask clarifying questions along the way, then return a detailed plan it can execute.

> 在 Shift + Tab 的菜单里还有「计划模式」(Plan Mode)。计划模式会拿到你的提示词后,先只用只读工具分析你的代码库、研究你建议的实现方式。过程中它会提出澄清性问题,最后给出一份可以执行的详细计划。

Plan mode is great for planning complex changes or doing a safe code review. Many times you'll be asking Claude to handle multi-step implementations toward a feature, and this is exactly where Plan Mode excels.

> 计划模式非常适合规划复杂的改动,或者做一次「安全」的代码审查。很多时候你会让 Claude 处理一个功能的多步骤实现,而这正是计划模式的用武之地。

> Claude Code with plan mode on, showing the status bar indicator(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## Example: Add a Dark Mode Toggle 示例:添加深色模式开关

Let's walk through an example. Say you have an application that needs a dark mode toggle. Open the root directory of your project and run claude. Press Shift + Tab a couple of times to enter Plan Mode, then write a prompt like:

> 来看一个例子。假设你的应用需要一个深色模式开关。打开项目的根目录,运行 `claude`。按几次 Shift + Tab 进入计划模式,然后写一条类似这样的提示词:

> "My app needs a dark mode implemented across the entire app. Can you create a toggle switch on the header that allows a user to toggle between light mode and dark mode? I need you to find a good contrast color that works based on my existing light theme."
>
> 「我的应用需要在整个应用范围内实现深色模式。你能在页头创建一个切换开关,让用户在浅色模式和深色模式之间切换吗?我需要你基于我现有的浅色主题,找到一个对比度合适的颜色。」

> Entering the dark mode prompt in Claude Code with plan mode enabled(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

Let Claude plan it out. After reviewing the plan, if it looks good, accept it and let Claude ask you for approval at each step. At the end, you can see exactly what Claude did and how it reached its conclusions.

> 让 Claude 把计划列出来。审阅之后,如果没问题,就接受计划,让 Claude 在每一步都向你征求许可。做完之后,你能清楚看到 Claude 具体做了什么、又是如何得出这些结论的。

## Recap 小结

When using Claude Code, try to be as descriptive as possible with your prompt. If you want to stay in the loop at every step, you can. Use Plan Mode to let Claude dig into the details of what you want to achieve before executing on any code.

> 使用 Claude Code 时,尽量把提示词写得详细具体。如果你希望每一步都参与把关,完全可以做到。用计划模式,可以让 Claude 在动手写代码之前,先深入梳理清楚你想达成的目标细节。

对产品经理来说,可以把审批模式想象成「每一步都要签字的审批流程」,自动接受模式则像「小额支出免签字、大额还是要审批」;而计划模式就像让下属先交一份「需求分析 + 实施方案」,你看过没问题再放行执行——这一步做得越细,后面返工的概率就越低。
