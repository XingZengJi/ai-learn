# MCP - 11 State and the StreamableHTTP Transport 状态管理与 StreamableHTTP 传输

> Course: MCP(Model Context Protocol,模型上下文协议)深入课程 · Lesson 11
> 课程: MCP 深入课程 · 第 11 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

The `stateless_http` and `json_response` flags in MCP servers control fundamental aspects of how your server behaves. Understanding when and why to use them is crucial, especially if you're planning to scale your server or deploy it in production.

> MCP 服务器中的 `stateless_http` 和 `json_response` 这两个标志位,控制着服务器行为方式中一些根本性的方面。理解什么时候该用、为什么要用它们至关重要——尤其是当你计划扩展服务器规模、或把它部署到生产环境时。

## When You Need Stateless HTTP 什么时候需要无状态 HTTP

Imagine you build an MCP server that becomes popular. Initially, you might have just a few clients connecting to a single server instance.

> 假设你搭建的 MCP 服务器变得很受欢迎。一开始,可能只有少数几个客户端连接到单个服务器实例上。

As your server grows, you might have thousands of clients trying to connect. Running a single server instance won't scale to handle all that traffic.

> 随着服务器规模增长,可能会有成千上万个客户端尝试连接。单个服务器实例已经没办法承载这么大的流量了。

The typical solution is horizontal scaling - running multiple server instances behind a load balancer.

> 典型的解决方案是「水平扩展」(horizontal scaling)——在一个负载均衡器背后运行多个服务器实例。

But here's where things get complicated. Remember that MCP clients need two separate connections:

> 但复杂的地方就在这里。别忘了,MCP 客户端需要两条独立的连接:

- A GET SSE connection for receiving server-to-client requests. 一条用于接收「服务器到客户端」请求的 GET SSE 连接。
- POST requests for calling tools and receiving responses. 用于调用工具、接收响应的 POST 请求。

With a load balancer, these requests might get routed to different server instances. If your tool needs to use Claude (through sampling), the server handling the POST request would need to coordinate with the server handling the GET SSE connection. This creates a complex coordination problem between servers.

> 有了负载均衡器之后,这些请求可能会被路由到不同的服务器实例上。如果你的工具需要用到 Claude(通过采样),那么处理 POST 请求的那台服务器,就需要和处理 GET SSE 连接的那台服务器进行协调——这就在多个服务器之间产生了一个复杂的协调难题。

对产品经理来说,这就像客服团队分了两条线:你打电话进来的「投诉热线」和客服主动回拨你的「回访专线」被分到了不同的坐席小组。如果处理投诉的坐席需要联系回访小组才能继续跟进,两边就得实时对齐信息——这中间的协调成本,就是这里说的「复杂协调问题」。

## How Stateless HTTP Solves This 无状态 HTTP 如何解决这个问题

Setting `stateless_http=True` eliminates this coordination problem, but with significant trade-offs:

> 把 `stateless_http` 设为 `True`,能消除这个协调难题,但代价也不小:

When stateless HTTP is enabled:

> 启用无状态 HTTP 后:

- **Clients don't get session IDs** - the server can't track individual clients. **客户端不会拿到会话 ID** - 服务器无法追踪单个客户端。
- **No server-to-client requests** - the GET SSE pathway becomes unavailable. **没有「服务器到客户端」的请求** - GET SSE 通道不再可用。
- **No sampling** - can't use Claude or other AI models. **无法采样** - 没法使用 Claude 或其他 AI 模型。
- **No progress reports** - can't send progress updates during long operations. **没有进度报告** - 没法在耗时操作中发送进度更新。
- **No subscriptions** - can't notify clients about resource updates. **没有订阅** - 没法通知客户端资源发生了更新。

However, there's one benefit: client initialization is no longer required. Clients can make requests directly without the initial handshake process.

> 不过也有一个好处:客户端不再需要经过初始化流程。客户端可以直接发起请求,不用先走那套握手流程。

## Understanding JSON Response 理解 JSON 响应模式

The `json_response=True` flag is simpler - it just disables streaming for POST request responses. Instead of getting multiple SSE messages as a tool executes, you get only the final result as plain JSON.

> `json_response=True` 这个标志位相对简单——它只是禁用了 POST 请求响应的流式传输。工具执行过程中,你不会再收到一连串的 SSE 消息,而只会拿到一份纯 JSON 格式的最终结果。

With streaming disabled:

> 禁用流式传输后:

- No intermediate progress messages. 没有中间的进度消息。
- No log statements during execution. 执行过程中没有日志输出。
- Just the final tool result. 只有最终的工具结果。

## When to Use These Flags 什么时候该用这些标志位

**Use stateless HTTP when:**

> **在以下情况下使用无状态 HTTP:**

- You need horizontal scaling with load balancers. 你需要借助负载均衡器做水平扩展。
- You don't need server-to-client communication. 你不需要「服务器到客户端」的通信。
- Your tools don't require AI model sampling. 你的工具不需要对 AI 模型做采样。
- You want to minimize connection overhead. 你想尽量降低连接开销。

**Use JSON response when:**

> **在以下情况下使用 JSON 响应模式:**

- You don't need streaming responses. 你不需要流式响应。
- You prefer simpler, non-streaming HTTP responses. 你更偏好简单、非流式的 HTTP 响应。
- You're integrating with systems that expect plain JSON. 你要对接的系统只接受纯 JSON 格式。

## Development vs Production 开发环境与生产环境

If you're developing locally with standard I/O transport but planning to deploy with HTTP transport, test with the same transport you'll use in production. The behavior differences between stateful and stateless modes can be significant, and it's better to catch any issues during development rather than after deployment.

> 如果你在本地开发时用的是标准 I/O 传输,但计划部署时用 HTTP 传输,那就应该用生产环境将要使用的那种传输方式来测试。有状态模式和无状态模式之间的行为差异可能很显著,最好在开发阶段就发现问题,而不是等部署之后才发现。

These flags fundamentally change how your MCP server operates, so choose them based on your specific scaling and functionality requirements.

> 这些标志位从根本上改变了你 MCP 服务器的运作方式,所以要根据你具体的扩展需求和功能需求来做选择。
