# MCP - 7 JSON Message Types JSON 消息类型

> Course: MCP(Model Context Protocol,模型上下文协议)深入课程 · Lesson 7
> 课程: MCP 深入课程 · 第 7 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

MCP (Model Context Protocol) uses JSON messages to handle communication between clients and servers. Understanding these message types is crucial for working with MCP, especially when dealing with different transport methods like the streamable HTTP transport.

> MCP(Model Context Protocol,模型上下文协议)使用 JSON 消息来处理客户端与服务器之间的通信。理解这些消息类型,对于使用 MCP 至关重要——尤其是在处理像可流式传输的 HTTP(streamable HTTP)这类不同传输方式的时候。

### Message Format 消息格式

All MCP communication happens through JSON messages. Each message type serves a specific purpose - whether it's calling a tool, listing available resources, or sending notifications about system events.

> 所有 MCP 通信都是通过 JSON 消息来进行的。每一种消息类型都有其特定的用途——无论是调用工具、列出可用资源,还是发送关于系统事件的通知。

Here's a typical example: when Claude needs to call a tool provided by an MCP server, the client sends a "Call Tool Request" message. The server processes this request, runs the tool, and responds with a "Call Tool Result" message containing the output.

> 举个典型的例子:当 Claude 需要调用某个 MCP 服务器提供的工具时,客户端会发送一条「Call Tool Request(调用工具请求)」消息。服务器处理这个请求、运行工具,然后用一条包含输出结果的「Call Tool Result(调用工具结果)」消息作出响应。

### MCP Specification MCP 规范

The complete list of message types is defined in the official MCP specification repository on GitHub. This specification is separate from the various SDK repositories (like Python or TypeScript SDKs) and serves as the authoritative source for how MCP should work.

> 完整的消息类型清单,定义在 GitHub 上官方的 MCP 规范(specification)仓库中。这份规范与各种 SDK 仓库(比如 Python 或 TypeScript SDK)是相互独立的,它是「MCP 应该如何工作」的权威依据。

The message types are written in TypeScript for convenience - not because they're executed as TypeScript code, but because TypeScript provides a clear way to describe data structures and types.

> 这些消息类型是用 TypeScript 写的,纯粹是为了方便——不是因为它们会被当作 TypeScript 代码来执行,而是因为 TypeScript 提供了一种清晰的方式来描述数据结构和类型。

## Message Categories 消息分类

MCP messages fall into two main categories:

> MCP 消息分为两大类:

### Request-Result Messages 请求-结果类消息

These messages always come in pairs. You send a request and expect to get a result back:

> 这类消息总是成对出现。你发送一个请求,并期待得到一个结果作为回应:

- Call Tool Request → Call Tool Result 调用工具请求 → 调用工具结果
- List Prompts Request → List Prompts Result 列出提示词请求 → 列出提示词结果
- Read Resource Request → Read Resource Result 读取资源请求 → 读取资源结果
- Initialize Request → Initialize Result 初始化请求 → 初始化结果

### Notification Messages 通知类消息

These are one-way messages that inform about events but don't require a response:

> 这类消息是单向的,用来告知某个事件的发生,不需要对方回应:

- **Progress Notification** - Updates on long-running operations. **进度通知** - 更新耗时操作的进展。
- **Logging Message Notification** - System log messages. **日志消息通知** - 系统日志消息。
- **Tool List Changed Notification** - When available tools change. **工具列表变更通知** - 当可用工具发生变化时。
- **Resource Updated Notification** - When resources are modified. **资源更新通知** - 当资源被修改时。

## Client vs Server Messages 客户端消息与服务器消息

The MCP specification organizes messages by who sends them:

> MCP 规范按照「谁发送」来组织消息:

**Client messages** include requests that clients send to servers (like tool calls) and notifications that clients might send.

> **客户端消息** 包括客户端发给服务器的请求(比如工具调用),以及客户端可能发出的通知。

**Server messages** include requests that servers send to clients and notifications that servers broadcast.

> **服务器消息** 包括服务器发给客户端的请求,以及服务器广播出去的通知。

## Why This Matters 为什么这很重要

Understanding that servers can send messages to clients is particularly important when working with different transport methods. Some transports, like the streamable HTTP transport, have limitations on which types of messages can flow in which directions.

> 理解「服务器也可以向客户端发送消息」这一点,在处理不同传输方式时尤其重要。有些传输方式,比如可流式传输的 HTTP,对「哪类消息能朝哪个方向流动」是有限制的。

The key insight is that MCP is designed as a bidirectional protocol - both clients and servers can initiate communication. This becomes crucial when you need to choose the right transport method for your specific use case.

> 关键的洞察在于:MCP 被设计成一个双向协议——客户端和服务器都可以主动发起通信。当你需要为自己的具体使用场景选择合适的传输方式时,这一点就变得至关重要。
