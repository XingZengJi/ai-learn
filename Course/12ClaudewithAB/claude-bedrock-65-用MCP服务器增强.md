# Claude with AWS Bedrock - 65 Enhancements with MCP servers 用 MCP 服务器增强

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 65
> 课程: Claude with AWS Bedrock · 第 65 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

Claude Code 内置了一个 MCP 客户端,这意味着你可以接入 MCP 服务器来大幅扩展它的功能,由此定制出适合自己的开发工作流。

## How MCP Integration Works 集成方式

MCP 让 Claude Code 能通过 MCP 服务器连接外部服务。每个服务器都可以提供工具、提示词和资源,扩展 Claude 能做的事。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559780%2F12_-_004_-_Enhancements_with_MCP_Servers_01.1748559780029.png)

本例中我们把 Claude Code 接到一个自定义 MCP 服务器上,它提供文档转换工具,让 Claude 能读取 PDF 和 Word 文档并转成 markdown。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559780%2F12_-_004_-_Enhancements_with_MCP_Servers_02.1748559780526.png)

## Adding an MCP Server to Claude Code 添加 MCP 服务器

配置很简单。先停掉正在运行的 Claude Code 会话,然后执行:

```bash
claude mcp add documents uv run main.py
```

这条命令接两个参数:

- 服务器名称(随便起,这里叫 `documents`)
- 启动 MCP 服务器的命令

添加完重启 Claude Code,它会自动连上你的 MCP 服务器。

连接成功后,Claude 就能使用该服务器提供的工具。在这个例子里,你可以让 Claude 把文档转成 markdown,它会自动调用我们做的那个文档转换工具。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559781%2F12_-_004_-_Enhancements_with_MCP_Servers_13.1748559780991.png)

## Popular MCP Servers for Development 开发常用的 MCP 服务器

已有不少现成的 MCP 服务器可以增强开发工作流:

| 服务器 | 作用 |
|---|---|
| `sentry-mcp` | 自动发现并修复 Sentry 里记录的 bug |
| `playwright-mcp` | 赋予 Claude 浏览器自动化能力,用于测试和排障 |
| `figma-context-mcp` | 把 Figma 设计稿开放给 Claude |
| `mcp-atlassian` | 让 Claude 能访问 Confluence 和 Jira |
| `firecrawl-mcp-server` | 给 Claude 加上网页抓取能力 |
| `slack-mcp` | 让 Claude 能发消息或回复指定话题串 |

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559781%2F12_-_004_-_Enhancements_with_MCP_Servers_16.1748559781522.png)

## Building Your Custom Workflow 组合出自己的工作流

真正的威力来自把多个 MCP 服务器组合起来匹配你的具体需求。比如可以配成:

- 一个 Sentry 服务器,取生产环境的报错详情
- 一个 Jira 服务器,读需求工单
- 一个 Slack 服务器,活儿干完了通知团队
- 若干自定义服务器,对接你自己的工具和流程

这种灵活性让 Claude Code 能适应各种不同的开发环境和工作流。花点时间想想你日常在用哪些外部服务和工具——很可能已经有现成的 MCP 服务器可以把它们接进来。

对产品经理来说: 上面那条 Sentry → Jira → Slack 的组合,描述的其实是一条完整的「发现问题→查需求背景→修复→通知」链路。价值不在于单个服务器多强,而在于**这些原本割裂的系统第一次能被同一个执行者串起来**。评估要不要接某个 MCP 服务器时,问的应该是「它能补上我这条链路的哪一环」,而不是「它功能多不多」。
