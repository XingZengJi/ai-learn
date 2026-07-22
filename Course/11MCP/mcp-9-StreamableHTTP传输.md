# MCP - 9 The StreamableHTTP Transport StreamableHTTP 传输方式

> Course: MCP(Model Context Protocol,模型上下文协议)深入课程 · Lesson 9
> 课程: MCP 深入课程 · 第 9 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

The streamable HTTP transport enables MCP clients to connect to remotely hosted servers over HTTP connections. Unlike the standard I/O transport that requires both client and server on the same machine, this transport opens up possibilities for public MCP servers that anyone can access.

> 可流式传输的 HTTP(streamable HTTP)传输方式,让 MCP 客户端能够通过 HTTP 连接,连接到远程托管的服务器。与要求客户端和服务器必须运行在同一台机器上的标准 I/O 传输不同,这种传输方式为「任何人都能访问的公开 MCP 服务器」打开了可能性。

However, there's an important caveat: some configuration settings can significantly limit your MCP server's functionality. If your application works perfectly with standard I/O transport locally but breaks when deployed with HTTP transport, this is likely the culprit.

> 不过,有一点很重要的注意事项:有些配置项会显著限制你 MCP 服务器的功能。如果你的应用在本地用标准 I/O 传输时运行完美,但换成 HTTP 传输部署后就出问题了,很可能就是这里出的岔子。

### Configuration Settings That Matter 需要留意的关键配置项

Two key settings control how the streamable HTTP transport behaves:

> 有两个关键配置项,控制着可流式传输 HTTP 的行为方式:

- `stateless_http` - Controls connection state management. **控制连接状态的管理方式。**
- `json_response` - Controls response format handling. **控制响应格式的处理方式。**

By default, both settings are false, but certain deployment scenarios may force you to set them to true. When enabled, these settings can break core functionality like progress notifications, logging, and server-initiated requests.

> 默认情况下,这两项配置都是 false,但某些部署场景可能会迫使你把它们设为 true。一旦启用,这些设置可能会破坏一些核心功能,比如进度通知、日志记录,以及服务器主动发起的请求。

## The HTTP Communication Challenge HTTP 通信面临的挑战

To understand why these limitations exist, we need to review how HTTP communication works. In standard HTTP:

> 要理解这些限制为什么存在,我们需要先回顾一下 HTTP 通信的运作方式。在标准 HTTP 中:

- Clients can easily initiate requests to servers (the server has a known URL). 客户端可以轻松地向服务器发起请求(服务器有一个已知的 URL)。
- Servers can easily respond to these requests. 服务器可以轻松地响应这些请求。
- Servers cannot easily initiate requests to clients (clients don't have known URLs). 服务器却无法轻松地主动向客户端发起请求(客户端没有一个已知的 URL)。
- Response patterns from client back to server become problematic. 从客户端回传给服务器的响应模式,也会变得棘手。

对产品经理来说,这就像打电话和收快递的区别:客户端「打电话给」服务器很容易,因为服务器号码是公开的(有固定 URL);但服务器想「主动打电话给」客户端就很难,因为客户端根本没有一个公开的、固定的「号码」可以被回拨。

## MCP Message Types Affected 受影响的 MCP 消息类型

This HTTP limitation impacts specific MCP communication patterns. The following message types become difficult to implement with plain HTTP:

> 这个 HTTP 的固有限制,会影响到特定的 MCP 通信模式。以下消息类型,用纯 HTTP 实现起来会很困难:

- **Server-initiated requests:** Create Message requests, List Roots requests. **服务器主动发起的请求:** 创建消息(Create Message)请求、列出根目录(List Roots)请求。
- **Notifications:** Progress notifications, Logging notifications, Initialized notifications, Cancelled notifications. **通知类消息:** 进度通知、日志通知、已初始化通知、已取消通知。

These are exactly the features that break when you enable the restrictive HTTP settings. Progress bars disappear, logging stops working, and server-initiated sampling requests fail.

> 而这些恰恰就是当你启用那些限制性 HTTP 设置后会失效的功能。进度条会消失,日志记录会失效,服务器主动发起的采样请求也会失败。

## The Streamable HTTP Solution Streamable HTTP 的解决方案

The streamable HTTP transport does provide a clever solution to work around HTTP's limitations, but it comes with trade-offs. When you're forced to use `stateless_http=True` or `json_response=True`, you're essentially telling the transport to operate within HTTP's constraints rather than working around them.

> 可流式传输的 HTTP 确实提供了一个巧妙的方案,来绕开 HTTP 本身的限制,但这是有代价的。当你被迫使用 `stateless_http=True` 或 `json_response=True` 时,本质上是在告诉这套传输机制:在 HTTP 的限制范围内老老实实运行,而不是想办法绕开这些限制。

Understanding these limitations helps you make informed decisions about:

> 理解这些限制,能帮你在以下方面做出明智的决策:

- Which transport to use for different deployment scenarios. 针对不同的部署场景,该选用哪种传输方式。
- How to design your MCP server to gracefully handle HTTP constraints. 如何设计你的 MCP 服务器,才能优雅地应对 HTTP 的限制。
- When to accept reduced functionality for the benefits of remote hosting. 什么时候该为了远程托管的好处,而接受功能上的削减。

The key is knowing that these restrictions exist and planning your MCP server architecture accordingly. If your application heavily relies on server-initiated requests or real-time notifications, you may need to reconsider your transport choice or implement alternative communication patterns.

> 关键在于要清楚这些限制的存在,并据此规划你 MCP 服务器的架构。如果你的应用高度依赖服务器主动发起的请求或实时通知,你可能就需要重新考虑传输方式的选择,或者实现其他的通信模式。
