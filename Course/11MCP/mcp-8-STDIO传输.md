# MCP - 8 The STDIO Transport STDIO 传输方式

> Course: MCP(Model Context Protocol,模型上下文协议)深入课程 · Lesson 8
> 课程: MCP 深入课程 · 第 8 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

MCP clients and servers communicate by exchanging JSON messages, but how do these messages actually get transmitted? The communication channel used is called a transport, and there are several ways to implement this - from HTTP requests to WebSockets to even writing JSON on a postcard (though that last one isn't recommended for production use).

> MCP 客户端和服务器通过交换 JSON 消息来通信,但这些消息实际上是怎么传输的呢?这个通信通道被称为「传输方式」(transport),实现方式有很多种——从 HTTP 请求、WebSocket,甚至到把 JSON 写在明信片上寄过去(当然最后这种方式并不建议用在生产环境)。

### The Stdio Transport Stdio 传输方式

When you're first developing an MCP server or client, the most commonly used transport is the stdio transport. This approach is straightforward: the client launches the MCP server as a subprocess and communicates through standard input and output streams.

> 在你刚开始开发 MCP 服务器或客户端时,最常用的传输方式就是 stdio 传输。这种方式很直接:客户端把 MCP 服务器当作一个子进程启动,然后通过标准输入(stdin)和标准输出(stdout)流来通信。

Here's how it works:

> 具体的运作方式是:

- Client sends messages to the server using the server's stdin. 客户端通过服务器的 stdin,把消息发给服务器。
- Server responds by writing to stdout. 服务器通过写入 stdout 来响应。
- Either the server or client can send a message at any time. 服务器和客户端都可以在任何时候发送消息。
- Only works when client and server run on the same machine. 只有当客户端和服务器运行在同一台机器上时才有效。

对产品经理来说,stdio 传输很像两个人面对面用纸条传话——你写一张纸条递给我,我写一张纸条递给你,谁都能随时递纸条给对方,但前提是两人必须坐在同一张桌子旁(同一台机器上),没法隔着城市传纸条。

### Seeing Stdio in Action 亲眼看看 Stdio 的运作

You can actually test an MCP server directly from your terminal without writing a separate client. When you run a server with `uv run server.py`, it listens to stdin and writes responses to stdout. This means you can paste JSON messages directly into your terminal and see the server's responses immediately.

> 你其实可以直接在终端里测试一个 MCP 服务器,不需要另外写一个客户端。当你用 `uv run server.py` 运行服务器时,它会监听 stdin,并把响应写到 stdout。这意味着你可以直接把 JSON 消息粘贴进终端,立刻看到服务器的响应。

The terminal output shows the complete message exchange, including example messages for initialization and tool calls.

> 终端输出会展示完整的消息交换过程,包括初始化和工具调用的示例消息。

## MCP Connection Sequence MCP 连接建立顺序

Every MCP connection must start with a specific three-message handshake:

> 每一次 MCP 连接,都必须以一套特定的「三消息握手」开始:

1. **Initialize Request** - Client sends this first. **初始化请求** - 由客户端率先发出。
2. **Initialize Result** - Server responds with capabilities. **初始化结果** - 服务器以自己的能力清单作为响应。
3. **Initialized Notification** - Client confirms (no response expected). **已初始化通知** - 客户端确认(不需要对方回应)。

Only after this handshake can you send other requests like tool calls or prompt listings.

> 只有完成这套握手之后,你才能发送其他请求,比如调用工具或列出提示词。

## Message Types and Flow 消息类型与流向

MCP supports various message types that flow in both directions:

> MCP 支持多种消息类型,并且可以双向流动:

The key insight is that some messages require responses (requests → results) while others don't (notifications). Both client and server can initiate communication at any time.

> 关键在于:有些消息需要对方响应(请求 → 结果),而有些则不需要(通知)。客户端和服务器都可以在任何时候主动发起通信。

## Four Communication Scenarios 四种通信场景

With any transport, you need to handle four different communication patterns:

> 无论用哪种传输方式,你都需要处理四种不同的通信模式:

1. **Client → Server request:** Client writes to stdin. **客户端 → 服务器请求:** 客户端写入 stdin。
2. **Server → Client response:** Server writes to stdout. **服务器 → 客户端响应:** 服务器写入 stdout。
3. **Server → Client request:** Server writes to stdout. **服务器 → 客户端请求:** 服务器写入 stdout。
4. **Client → Server response:** Client writes to stdin. **客户端 → 服务器响应:** 客户端写入 stdin。

The beauty of stdio transport is its simplicity - either party can initiate communication at any time using these two channels.

> stdio 传输的精妙之处就在于它的简单——凭借这两条通道,任何一方都可以随时主动发起通信。

## Why This Matters 为什么这很重要

Understanding stdio transport is crucial because it represents the "ideal" case where bidirectional communication is seamless. When we move to other transports like HTTP, we'll encounter limitations where the server cannot always initiate requests to the client. The stdio transport serves as our baseline for understanding what full MCP communication looks like before we tackle the constraints of other transport methods.

> 理解 stdio 传输之所以重要,是因为它代表了「双向通信毫无障碍」的理想情况。当我们转向 HTTP 等其他传输方式时,会遇到一些限制——服务器并不总是能够主动向客户端发起请求。stdio 传输为我们提供了一个基准,让我们先理解「完整的 MCP 通信」应该是什么样子,再去应对其他传输方式所带来的种种限制。

For development and testing, stdio transport is perfect. For production deployments where client and server need to run on different machines, you'll need to consider other transport options with their own trade-offs.

> 对于开发和测试来说,stdio 传输非常合适。但如果是生产环境部署、客户端和服务器需要运行在不同机器上,你就需要考虑其他传输方式了——每种方式都有自己的取舍。
