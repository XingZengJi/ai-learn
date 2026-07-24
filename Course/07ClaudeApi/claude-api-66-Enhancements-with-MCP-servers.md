# Building with the Claude API - 66 Enhancements with MCP servers 用 MCP 服务器增强能力

> Course: Building with the Claude API · Lesson 66
> 课程: Building with the Claude API · 第 66 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

Claude Code 内置了一个 MCP 客户端,这意味着你可以连接 MCP 服务器,大幅扩展 Claude 能做的事情。这为定制你的开发工作流程,打开了一些非常强大的可能性。

## MCP 是如何扩展 Claude 的

Model Context Protocol 让 Claude Code 能通过 MCP 服务器,连接到外部服务和工具。你不再局限于 Claude 内置的能力,而是可以通过接入提供特定工具、资源或集成的服务器,来添加自定义功能。

每个 MCP 服务器,都可以通过三个主要组件向 Claude 暴露不同类型的功能:工具(Tools,用来执行操作)、提示词(Prompts,用作模板)、资源(Resources,用来获取数据)。

## 搭建一个 MCP 服务器

给 Claude Code 加一个 MCP 服务器很简单,用命令行注册你的服务器即可:

```bash
claude mcp add [server-name] [command-to-start-server]
```

举个例子,如果你有一个用 `uv run main.py` 启动的文档处理服务器,你可以运行:

```bash
claude mcp add documents uv run main.py
```

注册之后,Claude Code 启动时会自动连接你的服务器。

## 示例:文档处理

一个实际的例子,是搭建一个能让 Claude 读取 PDF 和 Word 文档的工具。通过用一个「document_path_to_markdown」工具搭建一个 MCP 服务器,你就可以让 Claude 把文档内容转换成 markdown 格式。

当你让 Claude「把 tests/fixtures/mcp_docs.docx 这份文件转换成 markdown」时,它会自动使用你的自定义工具读取文档,返回转换后的内容。

## 常见的 MCP 集成

MCP 生态里已经有很多针对常见开发工具和服务的服务器:

- **sentry-mcp** —— 自动发现并修复 Sentry 里记录的 bug
- **playwright-mcp** —— 让 Claude 具备浏览器自动化能力,用于测试和排错
- **figma-context-mcp** —— 把 Figma 设计稿暴露给 Claude
- **mcp-atlassian** —— 让 Claude 能访问 Confluence 和 Jira
- **firecrawl-mcp-server** —— 给 Claude 加上网页抓取能力
- **slack-mcp** —— 让 Claude 能发消息或回复特定的话题串

## 搭建你的开发工作流

真正的威力,来自于把多个符合你具体开发流程的 MCP 服务器组合起来使用。你可能会搭建:

- 一个 Sentry 服务器,用来获取生产环境的错误详情
- 一个 Jira 服务器,用来读取工单需求
- 一个 Slack 服务器,任务完成时通知团队
- 针对你内部工具和 API 的自定义服务器

这就打造出了一个开发环境:Claude 能无缝地和你已经在用的所有工具、服务协同工作,让它成为一个远比通用助手更强大、更贴合你具体工作流程的编程伙伴。

---

对产品经理来说,这一课展示的是「把一个通用工具改造成贴合你团队实际工作流程的专属助手」的具体方法:不是干等 Anthropic 官方支持你用的每一个工具,而是通过 MCP 这套标准协议,把 Sentry、Jira、Slack 这些你团队日常在用的系统接进来,让 AI 助手真正嵌入到你现有的工作流里,而不是又一个「需要额外打开、额外维护」的独立工具。
