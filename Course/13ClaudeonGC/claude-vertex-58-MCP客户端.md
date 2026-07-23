# Claude with Google Vertex - 58 MCP clients MCP 客户端

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 58
> 课程: Claude with Google Vertex · 第 58 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

MCP 客户端是你的服务器与 MCP 服务器之间的通信桥梁。可以把它看作你访问 MCP 服务器所有工具的入口。需要用外部功能时,客户端替你处理全部的消息传递和协议细节。

## Transport Agnostic Communication 传输层无关的通信

MCP 的一大优势是**传输层无关(transport agnostic)**——说白了就是客户端和服务器可以用不同的通信方式对话。最常见的配置是客户端和服务器都跑在同一台机器上,通过标准输入/输出通信。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621140%2F09_-_002_-_MCP_Clients_01.1748621139846.png)

但你不限于这种方式。MCP 客户端和服务器也可以通过以下方式连接:

- HTTP
- WebSockets
- 其他各种网络协议

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621140%2F09_-_002_-_MCP_Clients_03.1748621140776.png)

## Message Types 消息类型

连上之后,客户端与服务器交换 MCP 规范里定义的特定消息类型。你主要会打交道的是:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621141%2F09_-_002_-_MCP_Clients_04.1748621141280.png)

**ListToolsRequest / ListToolsResult**: 客户端问服务器「你提供哪些工具?」,拿回一份完整的可用功能清单。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621142%2F09_-_002_-_MCP_Clients_05.1748621141878.png)

**CallToolRequest / CallToolResult**: 客户端告诉服务器「用这些参数跑这个工具」,并接收执行结果。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621142%2F09_-_002_-_MCP_Clients_06.1748621142450.png)

## Real-World Example Flow 完整流程示例

走一遍完整例子,看这些部件怎么协同。假设用户问「我有哪些仓库?」,完整的通信链路是:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621143%2F09_-_002_-_MCP_Clients_08.1748621143061.png)

用户把问题提交给你的服务器,流程开始。你的服务器意识到: 发起 AI 请求前,得先给 Claude 提供可用工具。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621143%2F09_-_002_-_MCP_Clients_09.1748621143612.png)

你的服务器向 MCP 客户端要工具列表,触发一次发往 MCP 服务器的 `ListToolsRequest`。服务器返回含全部可用工具的 `ListToolsResult`。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621144%2F09_-_002_-_MCP_Clients_11.1748621144300.png)

现在你的服务器凑齐了发起首次 Claude 请求所需的一切: 用户问题 + 可用工具。Claude 分析这些工具,判断需要调用其中之一才能正确回答。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621145%2F09_-_002_-_MCP_Clients_12.1748621144842.png)

Claude 返回一个工具调用请求。你的服务器识别出来,请 MCP 客户端用 Claude 指定的参数执行该工具。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621145%2F09_-_002_-_MCP_Clients_13.1748621145569.png)

MCP 客户端向 MCP 服务器发出 `CallToolRequest`,后者真正去调 GitHub 的 API 取用户的仓库列表。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621147%2F09_-_002_-_MCP_Clients_15.1748621147033.png)

GitHub 返回仓库数据,MCP 服务器把它包成 `CallToolResult` 沿链路送回。你的服务器收到数据,现在可以向 Claude 发起后续请求了。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621148%2F09_-_002_-_MCP_Clients_16.1748621147911.png)

最后一步把工具结果作为 user 消息的一部分发给 Claude。至此 Claude 掌握了全部信息,可以就用户的仓库给出完整回复。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621148%2F09_-_002_-_MCP_Clients_18.1748621148672.png)

这条链路步骤确实不少,但理解它能为你自己实现 MCP 客户端和服务器打好基础。每个组件角色明确,标准化的消息类型保证了无论底层传输机制是什么,一切都能顺畅协作。

对产品经理来说: 注意这条链路里有**两次网络往返**——一次拿工具列表,一次执行工具,之外还有两次 Claude 调用。这解释了为什么 MCP 类功能的响应通常比纯对话慢不少。做体验设计时,这类操作需要明确的进度反馈,而不能沿用纯聊天那种「等一下就出来」的假设。
