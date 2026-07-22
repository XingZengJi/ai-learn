# Claude Code 101 - 12 Hooks 钩子

> Course: Claude Code 101 · Lesson 12
> 课程: Claude Code 101 · 第 12 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 整理翻译存档

Hooks let you run commands at specific points in Claude Code's lifecycle. The key difference between hooks and everything else covered in this course is that hooks are deterministic — they always run.

> 钩子(Hooks)让你能在 Claude Code 生命周期的特定节点上运行命令。钩子和这门课讲过的其他机制最关键的区别在于:钩子是确定性的(deterministic)——它们总会执行。

## Why Use Hooks 为什么要用钩子

You can tell Claude in your CLAUDE.md to run Prettier after every file edit. Most of the time it will. But sometimes it won't. A hook makes it happen every single time, no exceptions.

> 你可以在 CLAUDE.md 里告诉 Claude,每次编辑完文件都跑一遍 Prettier。大多数时候它会照做,但有时候不会。而钩子能保证这件事每次都发生,没有例外。

Common use cases include:

> 常见的使用场景包括:

- Auto-formatting after file edits

  文件编辑后自动格式化

- Logging all executed commands for compliance

  出于合规需要,记录所有执行过的命令

- Blocking dangerous operations like modifying production files

  阻止危险操作,比如修改生产环境的文件

- Sending yourself notifications when Claude finishes a task

  Claude 完成任务时,给自己发通知

## How They Work 工作原理

Hooks are configured in your settings.json. You pick an event, optionally set a matcher for which tools it applies to, and provide a command to run. The available events are:

> 钩子在 `settings.json` 里配置。你选定一个事件(event),可以选择设置一个「匹配器」(matcher)来指定它作用于哪些工具,再提供要运行的命令。可用的事件有:

- **PreToolUse** — runs before a tool call

  **PreToolUse** —— 在工具调用之前运行

- **PostToolUse** — runs after a tool call completes

  **PostToolUse** —— 在工具调用完成之后运行

- **UserPromptSubmit** — runs when you submit a prompt, before Claude processes it

  **UserPromptSubmit** —— 在你提交提示词、Claude 处理之前运行

- **Stop** — runs when Claude finishes responding

  **Stop** —— 在 Claude 完成回复时运行

- **Notification** — runs when Claude sends a notification

  **Notification** —— 在 Claude 发送通知时运行

You configure them through the /hooks command inside Claude Code, or by editing settings.json directly.

> 你可以在 Claude Code 里用 `/hooks` 命令来配置钩子,也可以直接编辑 `settings.json`。

> The settings.json file inside the .claude directory with hooks configuration(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## A Practical Example 一个实际例子

The most common hook: auto-formatting after edits. Set a PostToolUse hook with a matcher of "Edit|MultiEdit|Write" so it fires whenever Claude modifies a file. The command checks the file extension and runs the appropriate formatter — Prettier for TypeScript, gofmt for Go, whatever your project uses.

> 最常见的钩子:编辑后自动格式化。设置一个 `PostToolUse` 钩子,匹配器设为 `"Edit|MultiEdit|Write"`,这样只要 Claude 修改了文件就会触发。命令会检查文件扩展名,并运行对应的格式化工具——TypeScript 用 Prettier,Go 用 gofmt,视你项目所用的工具而定。

## Blocking with PreToolUse 用 PreToolUse 阻止操作

PreToolUse hooks can block tool calls before they execute. Your hook receives the tool name and input as JSON on stdin. The exit code determines the behavior:

> `PreToolUse` 钩子可以在工具调用执行之前将其阻止。你的钩子会通过 stdin 接收到 JSON 格式的工具名称和输入内容。退出码(exit code)决定了具体行为:

- **Exit code 0** — proceed normally.

  **退出码 0** —— 正常放行。

- **Exit code 2** — block the action. The stderr message gets fed back to Claude as feedback so it knows why it was blocked and can adjust.

  **退出码 2** —— 阻止这次操作。stderr 里的消息会作为反馈返回给 Claude,让它知道自己为什么被拦下,并据此调整。

- **Any other exit code** — a non-blocking error that gets shown to you but doesn't stop anything.

  **其他退出码** —— 属于非阻断性错误,会显示给你看,但不会真正拦下任何操作。

This is how you enforce hard rules. Block writes to a production config directory. Block bash commands that contain rm -rf. Block commits to main. Whatever your team needs to be guaranteed, not suggested.

> 这就是你用来强制执行「硬规则」的方式:阻止对生产环境配置目录的写入,阻止包含 `rm -rf` 的 bash 命令,阻止直接向 main 分支提交。凡是你团队需要「必须保证」而不是「仅仅建议」的规则,都可以用钩子来落实。

> A settings.json file showing PreToolUse and PostToolUse hooks with matchers and commands(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## Sharing Hooks with Your Team 和团队共享钩子

Hooks configured in .claude/settings.json are project-level and can be checked into your repo. This means your entire team gets the same hooks automatically. Use the CLAUDE_PROJECT_DIR environment variable in your commands to reference scripts stored in your project, so they work regardless of Claude's current working directory.

> 配置在 `.claude/settings.json` 里的钩子属于项目级配置,可以提交进仓库。这意味着你整个团队都会自动获得同一套钩子。在命令里使用 `CLAUDE_PROJECT_DIR` 环境变量来引用项目里存放的脚本,这样无论 Claude 当前的工作目录是什么,脚本都能正常工作。

## Recap 小结

Hooks give you deterministic control over Claude Code's behavior. Use PostToolUse for auto-formatting and logging. Use PreToolUse to block dangerous operations. Configure them with /hooks or in settings.json. And check them into your repo so your team gets them too.

> 钩子让你能对 Claude Code 的行为进行确定性的把控。用 `PostToolUse` 做自动格式化和日志记录,用 `PreToolUse` 阻止危险操作。通过 `/hooks` 或直接编辑 `settings.json` 来配置它们,并把它们提交进仓库,让团队也能一起获得这些保障。

If something needs to happen every time without fail, don't put it in a prompt. Put it in a hook.

> 如果有件事必须每次都发生、不能有例外,就不要把它写进提示词里,而要把它写进钩子里。

对产品经理来说,CLAUDE.md 里的规则更像是「员工手册上的建议」,大部分时候会被遵守,但员工状态不好时可能会漏掉;而钩子更像是系统里「强制生效的审批卡点」——比如「未走审批流程的支出单据系统直接拒绝提交」,不给「万一忘了」留任何空间。真正不能妥协的硬规矩,交给钩子,不要只靠提示词去「拜托」模型记得做。
