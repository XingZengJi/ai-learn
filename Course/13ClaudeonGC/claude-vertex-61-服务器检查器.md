# Claude with Google Vertex - 61 The server inspector 服务器检查器

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 61
> 课程: Claude with Google Vertex · 第 61 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

开发 MCP 服务器时,你需要一种不接完整应用就能测试功能的办法。Python MCP SDK 内置了一个基于浏览器的检查器(inspector),让你实时调试和测试服务器。

## Starting the Inspector 启动检查器

先确保 Python 环境已激活(具体命令见项目 README),然后运行:

```bash
mcp dev mcp_server.py
```

这会启动一个开发服务器,并给你一个本地 URL(通常在 6277 端口),在浏览器里打开即可访问检查器。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621191%2F09_-_005_-_The_Server_Inspector_04.1748621191338.png)

## Using the Inspector Interface 使用检查器界面

MCP 检查器仍在积极开发中,你看到的界面可能和课程演示不同,但核心功能是一致的。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621192%2F09_-_005_-_The_Server_Inspector_05.1748621192207.png)

点击 "Connect" 启动你的 MCP 服务器后,会看到一个导航栏,分为几个部分:

- Resources(资源)
- Prompts(提示词)
- Tools(工具)
- 其他服务器能力

## Testing Your Tools 测试你的工具

Tools 那一栏是你调试时待得最久的地方。点击 "List Tools" 查看服务器提供的全部工具。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621193%2F09_-_005_-_The_Server_Inspector_09.1748621192855.png)

选中某个工具后,右侧面板显示它的详情并提供输入框供测试。比如测试 `read_doc_contents`:

1. 从列表里选中该工具
2. 输入一个文档 ID(如 `deposition.md`)
3. 点击 "Run Tool"
4. 查看结果是否成功、输出是否符合预期

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621193%2F09_-_005_-_The_Server_Inspector_10.1748621193404.png)

## Testing Tool Interactions 测试工具之间的联动

你可以按顺序测试多个工具,验证它们能正确配合。比如用 `edit_document` 改完内容之后:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621194%2F09_-_005_-_The_Server_Inspector_16.1748621194137.png)

再用同一个文档 ID 跑一次 `read_doc_contents`,确认改动生效了:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621195%2F09_-_005_-_The_Server_Inspector_17.1748621195581.png)

## Development Workflow 开发循环

检查器造就了一个高效的开发循环:

1. 修改 MCP 服务器代码
2. 用各种输入测试单个工具
3. 验证工具间的联动符合预期
4. 不用搭完整应用就能排查问题

这个浏览器测试环境对 MCP 服务器开发是必备的。它让你尽早发现问题,在接入 Claude 或其他应用之前先把功能验证清楚。

对产品经理来说: 这一课其实提供了一个很实用的可能性——**MCP 工具是可以脱离 AI 单独验收的**。你不需要等整条链路跑通、也不需要理解模型行为,就能在这个界面里逐个点开工具,看它的输入输出对不对。这让「工具层是否正确」和「模型是否会正确使用工具」变成两个可以分开验收的阶段,排查问题时能少走很多弯路。
