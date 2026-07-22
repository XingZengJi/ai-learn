# Claude Code 101 - 11 MCP

> Course: Claude Code 101 · Lesson 11
> 课程: Claude Code 101 · 第 11 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 整理翻译存档

Model Context Protocol (MCP) is an open standard that lets Claude Code connect to external tools and data sources. When you ask a question, Claude automatically understands when it should use those tools to better handle your query.

> 模型上下文协议(Model Context Protocol,简称 MCP)是一套开放标准,让 Claude Code 能连接外部工具和数据源。当你提出问题时,Claude 会自动判断什么时候该用这些工具来更好地处理你的请求。

A lot of your context lives outside your codebase — in databases, productivity apps, or public repositories. MCP bridges that gap.

> 你需要的很多上下文其实并不在你的代码库里——而是在数据库、效率工具或公开仓库中。MCP 就是用来打通这个缺口的。

## What Can You Do With It? 它能做什么?

First, it's important to understand the concept of "tools" in agentic AI. Tools give agents like Claude Code the ability to perform actions that help them complete tasks more effectively. This is different from typical AI, where you just get a text response back.

> 首先,理解智能体式 AI(agentic AI)里「工具」这个概念很重要。工具赋予 Claude Code 这样的智能体执行动作的能力,帮它更有效地完成任务。这和普通 AI 不一样——普通 AI 通常只给你返回一段文字回复。

For example, if your team uses Linear for project management, you can add a Linear MCP server to bring in the details of your specific issues. If you need up-to-date documentation for a dependency, a docs MCP server like Context7 can provide that to Claude Code.

> 举例来说,如果你的团队用 Linear 做项目管理,你可以添加一个 Linear MCP 服务器,把具体 issue 的详细信息带进来。如果你需要某个依赖包的最新文档,像 Context7 这样的文档类 MCP 服务器就能把这些信息提供给 Claude Code。

> Claude Code querying a Linear MCP server to retrieve issue details for ticket MEN-12(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)
> Claude Code using the Context7 MCP server to look up the latest shadcn/ui documentation(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## Adding an MCP Server 添加 MCP 服务器

You can add MCP servers with the claude mcp add command. There are two main types:

> 你可以用 `claude mcp add` 命令添加 MCP 服务器。主要有两种类型:

> Running claude mcp add to add an HTTP Linear MCP server from the terminal(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

- **HTTP servers** are for remote services. These are hosted by the service provider and connect over the network.

  **HTTP 服务器**用于远程服务。这类服务由服务提供方托管,通过网络连接。

- **Stdio servers** are for local processes that run on your machine.

  **Stdio 服务器**用于运行在你自己机器上的本地进程。

> Running claude mcp add to add a local stdio MCP server with a Python script(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

You can manage your servers with /mcp inside a Claude Code session to see what's connected, check status, and disable servers you don't need.

> 你可以在 Claude Code 会话里用 `/mcp` 管理你的服务器,查看已连接哪些服务、检查状态,并禁用你不需要的服务器。

> The /mcp command showing connected MCP servers and their status(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## Scoping Servers 服务器的作用范围

MCP servers can be scoped in three ways:

> MCP 服务器的作用范围有三种:

- **Local** — only available in the current project, just for you.

  **Local(本地)**——只在当前项目里可用,只对你自己生效。

- **User** — available across all your projects.

  **User(用户)**——在你所有的项目里都可用。

- **Project** — uses a .mcp.json file that you check into version control so anyone on the codebase gets the exact same servers automatically.

  **Project(项目)**——使用一个 `.mcp.json` 文件,你把它提交进版本控制,这样任何接触这个代码库的人都会自动获得完全相同的服务器配置。

## Context Costs 上下文开销

MCP servers add tool definitions to your context window — even when you're not actively using them. If you have a lot of servers configured, this eats into your available context. Run /mcp to see what's connected and disable anything you're not actively using.

> MCP 服务器会把工具定义加进你的上下文窗口——即便你并没有在实际使用它们。如果你配置了很多服务器,这会不断蚕食你可用的上下文空间。运行 `/mcp` 查看已连接的服务,把没在用的都禁用掉。

> The /mcp server detail view with options to view tools, reconnect, or disable a server(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

If a tool has a CLI equivalent (like gh for GitHub or aws for AWS), the CLI is more context-efficient because it doesn't add persistent tool definitions.

> 如果某个工具有对应的命令行(CLI)版本(比如 GitHub 的 `gh`、AWS 的 `aws`),用 CLI 会更省上下文,因为它不会往上下文里添加持久化的工具定义。

You might also benefit from using a Skill instead. A Skill has a name and description loaded into context, and Claude only loads the full skill contents when it determines it needs to use it.

> 用 Skill(技能)代替 MCP 服务器有时也更划算。技能只会把名称和描述加载进上下文,只有当 Claude 判断确实需要用到它时,才会加载完整的技能内容。

If your MCP tools exceed 10% of your context window, Claude Code automatically switches to tool search mode, which discovers the right tools on demand — though this may not work as reliably.

> 如果你的 MCP 工具占用超过上下文窗口的 10%,Claude Code 会自动切换到「工具搜索模式」(tool search mode),按需发现合适的工具——不过这种模式的可靠性可能不如直接加载稳定。

## Recap 小结

MCP connects Claude Code to your external tools and data sources. Add servers with claude mcp add. Scope them to your project with .mcp.json so your team gets them automatically. And keep an eye on context usage by disabling servers you're not actively using.

> MCP 把 Claude Code 和你的外部工具、数据源连接起来。用 `claude mcp add` 添加服务器。用 `.mcp.json` 把服务器的作用范围设为项目级,让团队自动获得同样的配置。同时留意上下文占用情况,及时禁用不常用的服务器。

对产品经理来说,MCP 服务器就像给 Claude Code 接入的一个个「外部系统账号」——接了 Linear 账号,它就能查工单;接了文档服务,它就能查最新 API。但每接入一个账号,都相当于在它随身携带的「工具说明书」里多加一页,不管用不用都要占地方。所以像整理工具箱一样,不常用的连接该关就关。
