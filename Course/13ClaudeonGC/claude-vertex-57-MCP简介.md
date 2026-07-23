# Claude with Google Vertex - 57 Introducing MCP MCP 简介

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 57
> 课程: Claude with Google Vertex · 第 57 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

模型上下文协议(Model Context Protocol, MCP)是一个通信层,它给 Claude 提供上下文和工具,而不需要你写一大堆繁琐的集成代码。你不必自己实现每一个工具函数,MCP 把这份负担转移给了专门的服务器。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621139%2F09_-_001_-_Introducing_MCP_01.1748621139100.png)

初次接触 MCP,你会看到展示基本架构的图: 一个 MCP 客户端(你的服务器)连接到若干 MCP 服务器,后者包含工具、提示词和资源。每个 MCP 服务器充当 GitHub、AWS、数据库等外部服务的接口。

## The Problem MCP Solves MCP 解决的问题

假设你在做一个聊天界面,用户可以问 Claude 关于自己 GitHub 数据的问题,比如「我所有仓库里有哪些待处理的 PR?」。要回答这个,Claude 需要能访问 GitHub API 的工具。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621140%2F09_-_001_-_Introducing_MCP_03.1748621139961.png)

GitHub 的功能极其庞大——仓库、PR、issue、项目等等。要覆盖它的全部特性,你得写出数量惊人的工具 schema 和函数:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621140%2F09_-_001_-_Introducing_MCP_05.1748621140571.png)

意味着要写、要测、要长期维护这一堆函数:

- `get_repos()`
- `list_repos()`
- `create_repos()`
- `search_issues()`
- `update_issue()`
- `create_issue()`
- `get_issue()`
- `create_file()`

## How MCP Changes This MCP 怎么改变这一切

MCP 把工具定义和执行的负担,从**你的服务器**转移到 **MCP 服务器**上。你不用自己写那些 GitHub 集成工具,自然会有人做一个 GitHub 的 MCP 服务器,里面包含全部所需的工具和函数。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621141%2F09_-_001_-_Introducing_MCP_08.1748621141166.png)

MCP 服务器充当外部服务的包装层,提供开箱即用的现成工具。你的服务器则成为连接这些专门服务器的 **MCP 客户端**。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621141%2F09_-_001_-_Introducing_MCP_09.1748621141761.png)

## Who Creates MCP Servers 谁来做 MCP 服务器

任何人都可以做。通常服务提供方自己会做官方实现,比如 AWS 可能会发布覆盖其各项服务的官方 MCP 服务器。

你也可以自己做一个 MCP 服务器,来包装你需要集成的任何服务。

## Common Questions 常见问题

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621143%2F09_-_001_-_Introducing_MCP_12.1748621142800.png)

**用 MCP 服务器和直接调用服务的 API 有什么区别?**

MCP 服务器把工具 schema 和函数都替你定义好了。直接调 API 的话,那些工具定义得你自己写。MCP 省下的正是这部分实现工作。

**MCP 服务器和工具使用不是一回事吗?**

这是个常见误解。两者是**互补但不同**的概念。MCP 服务器提供的是预先做好的工具 schema 和函数; 工具使用讲的是 Claude **如何调用**这些工具。MCP 真正解决的是「谁来创建和维护这些工具实现」的问题。

核心收益是: MCP 服务器让你能用上成熟的集成能力,而不必自己去建设和维护那些代码。你获得了工具使用的全部能力,却省下了大量开发开销。

对产品经理来说: MCP 本质上是把「集成」从一次性定制开发变成了**可复用的生态组件**——类比一下,就像从「每个 App 自己写支付逻辑」到「接入支付 SDK」。这个转变对排期估算影响很大: 一个「接入 GitHub 数据」的需求,过去要按周算,现在可能按天算。做规划时值得先问一句: 这个集成有没有现成的 MCP 服务器?
