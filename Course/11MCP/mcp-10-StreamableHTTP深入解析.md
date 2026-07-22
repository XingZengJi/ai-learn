# MCP - 10 StreamableHTTP In Depth StreamableHTTP 深入解析

> Course: MCP(Model Context Protocol,模型上下文协议)深入课程 · Lesson 10
> 课程: MCP 深入课程 · 第 10 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

StreamableHTTP is MCP's solution to a fundamental problem: some MCP functionality requires the server to make requests to the client, but HTTP makes this challenging. Let's explore how StreamableHTTP works around this limitation and when you might need to break that workaround.

> StreamableHTTP 是 MCP 针对一个根本性问题给出的解决方案:有些 MCP 功能需要服务器主动向客户端发起请求,但 HTTP 让这件事变得很棘手。我们来看看 StreamableHTTP 是如何绕开这个限制的,以及什么时候你可能需要打破这套变通方案。

### The Core Problem 核心问题

Some MCP features like sampling, notifications, and logging rely on the server initiating requests to the client. However, HTTP is designed for clients to make requests to servers, not the other way around. StreamableHTTP solves this with a clever workaround using Server-Sent Events (SSE).

> 采样、通知、日志这类 MCP 功能,都依赖于服务器主动向客户端发起请求。然而 HTTP 的设计初衷是让客户端向服务器发起请求,而不是反过来。StreamableHTTP 借助服务器推送事件(Server-Sent Events,SSE)这个巧妙的变通方案,解决了这个问题。

## How StreamableHTTP Works StreamableHTTP 的工作原理

The magic happens through a multi-step process that establishes persistent connections between client and server.

> 这一整套「魔法」是通过一个多步骤的流程实现的,它会在客户端和服务器之间建立起持久化的连接。

### Initial Connection Setup 初始连接建立

The process starts like any MCP connection:

> 这个过程和任何 MCP 连接一样开始:

1. Client sends an Initialize Request to the server. 客户端向服务器发送一个初始化请求(Initialize Request)。
2. Server responds with an Initialize Result that includes a special `mcp-session-id` header. 服务器以一个初始化结果(Initialize Result)作为响应,其中包含一个特殊的 `mcp-session-id` 请求头。
3. Client sends an Initialized Notification with the session ID. 客户端带着这个会话 ID,发送一个已初始化通知(Initialized Notification)。

This session ID is crucial - it uniquely identifies the client and must be included in all future requests.

> 这个会话 ID 至关重要——它唯一标识了这个客户端,后续所有请求都必须带上它。

### The SSE Workaround SSE 变通方案

After initialization, the client can make a GET request to establish a Server-Sent Events connection. This creates a long-lived HTTP response that the server can use to stream messages back to the client at any time.

> 初始化完成之后,客户端可以发起一个 GET 请求,来建立一条服务器推送事件(SSE)连接。这会创建一个长期存活的 HTTP 响应,服务器可以借助它,在任何时候把消息流式传回客户端。

This SSE connection is the key to allowing server-to-client communication. The server can now send requests, notifications, and other messages through this persistent channel.

> 这条 SSE 连接正是实现「服务器到客户端」通信的关键。现在服务器可以通过这条持久化的通道,发送请求、通知和其他各种消息。

### Tool Calls and Dual SSE Connections 工具调用与双 SSE 连接

When the client makes a tool call, things get more complex. The system creates two separate SSE connections:

> 当客户端发起一次工具调用时,情况会变得更复杂一些。系统会创建两条独立的 SSE 连接:

- **Primary SSE Connection:** Used for server-initiated requests and stays open indefinitely.

  **主 SSE 连接:** 用于服务器主动发起的请求,会一直保持开启,没有期限。

- **Tool-Specific SSE Connection:** Created for each tool call and closes automatically when the tool result is sent.

  **工具专属 SSE 连接:** 针对每一次工具调用单独创建,当工具结果发送完毕后会自动关闭。

### Message Routing 消息路由

Different types of messages get routed through different connections:

> 不同类型的消息会被路由到不同的连接上:

- **Progress notifications:** Sent through the primary SSE connection. **进度通知:** 通过主 SSE 连接发送。
- **Logging messages and tool results:** Sent through the tool-specific SSE connection. **日志消息和工具结果:** 通过工具专属的 SSE 连接发送。

## Configuration Flags That Break the Workaround 会打破这套变通方案的配置项

StreamableHTTP includes two important configuration options:

> StreamableHTTP 包含两个重要的配置选项:

- `stateless_http`
- `json_response`

Setting these to `True` can break the SSE workaround mechanism. You might want to enable these flags in certain scenarios, but doing so limits the full MCP functionality that depends on server-to-client communication.

> 把这两项设为 `True`,会打破这套基于 SSE 的变通机制。在某些场景下你可能确实需要启用这些标志位,但这样做会限制那些依赖「服务器到客户端」通信的完整 MCP 功能。

## Key Takeaways 核心要点

StreamableHTTP is more complex than other MCP transports because it has to work around HTTP's limitations. The SSE-based workaround enables full MCP functionality over HTTP, but understanding the dual-connection model is crucial for debugging and optimization.

> StreamableHTTP 比其他 MCP 传输方式更复杂,因为它必须想办法绕开 HTTP 本身的限制。这套基于 SSE 的变通方案,让完整的 MCP 功能得以在 HTTP 上实现,但要做好调试和优化,理解这套「双连接模型」至关重要。

When building MCP applications with StreamableHTTP, remember that session IDs are required for all requests after initialization, and the system automatically manages multiple SSE connections to handle different types of server-to-client communication.

> 用 StreamableHTTP 构建 MCP 应用时要记住:初始化完成后的所有请求都必须带上会话 ID,而系统会自动管理多条 SSE 连接,来处理不同类型的「服务器到客户端」通信。
