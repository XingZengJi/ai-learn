# Claude with AWS Bedrock - 52 MCP clients MCP 客户端

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 52
> 课程: Claude with AWS Bedrock · 第 52 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

MCP 客户端是你的服务器与 MCP 服务器之间的通信桥梁,可以把它理解为你接入 MCP 服务器全部工具的入口。当你需要用到外部功能时,消息传递和协议细节都由客户端替你处理。

## Transport Agnostic Communication 与传输方式无关

MCP 的一大优点是「传输无关」(transport agnostic)——说白了就是客户端和服务器可以用不同的通信方式对话。最常见的配置是两者跑在同一台机器上,通过标准输入输出(stdio)通信。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559638%2F11_-_002_-_MCP_Clients_01.1748559638305.png)

但不限于此,MCP 客户端与服务器还可以通过这些方式连接:

- HTTP
- WebSockets
- 其他各类网络协议

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559639%2F11_-_002_-_MCP_Clients_03.1748559639617.png)

## Message Types 消息类型

连接建立后,客户端与服务器交换 MCP 规范里定义的几类消息。你主要会打交道的是:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559640%2F11_-_002_-_MCP_Clients_05.1748559640523.png)

- **`ListToolsRequest` / `ListToolsResult`** —— 客户端问服务器「你提供哪些工具?」,拿回一份完整的可用功能清单。

   ![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559641%2F11_-_002_-_MCP_Clients_07.1748559640924.png)
- **`CallToolRequest` / `CallToolResult`** —— 客户端告诉服务器「用这些参数运行这个工具」,并收到执行结果。

## Complete Flow Example 完整流程示例

假设用户问「我有哪些仓库?」,完整的通信流程是这样走的:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559641%2F11_-_002_-_MCP_Clients_09.1748559641405.png)

1. 用户把问题提交到你的服务器。但在向 Claude 求助之前,服务器得先知道有哪些工具可用。

   ![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559642%2F11_-_002_-_MCP_Clients_11.1748559641902.png)
2. 你的服务器向 MCP 客户端索要工具清单。客户端发出 `ListToolsRequest`,拿回 `ListToolsResult`,里面是全部可用工具。

   ![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559642%2F11_-_002_-_MCP_Clients_12.1748559642275.png)
3. 现在服务器凑齐了发给 Claude 的初始请求所需的一切: 用户的问题 + 可用工具清单。

   ![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559642%2F11_-_002_-_MCP_Clients_13.1748559642750.png)
4. Claude 分析这些工具,判断需要调用其中之一才能回答,于是返回一个工具调用请求。

   ![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559643%2F11_-_002_-_MCP_Clients_14.1748559643213.png)
5. 服务器识别出 Claude 想调工具,但**服务器自己不再执行工具**了——那是 MCP 服务器的活儿。于是它让 MCP 客户端按 Claude 指定的参数去运行。

   ![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559643%2F11_-_002_-_MCP_Clients_15.1748559643588.png)
6. MCP 客户端发出 `CallToolRequest` 给 MCP 服务器,后者真正向 GitHub 发请求取用户仓库。

   ![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559644%2F11_-_002_-_MCP_Clients_16.1748559643951.png)
7. GitHub 返回仓库数据,MCP 服务器把它包成 `CallToolResult` 回传给 MCP 客户端。

   ![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559644%2F11_-_002_-_MCP_Clients_17.1748559644448.png)
8. MCP 客户端把工具结果交回你的服务器,服务器再把它作为后续消息发给 Claude。

   ![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559645%2F11_-_002_-_MCP_Clients_18.1748559644856.png)
9. Claude 拿到了全部所需信息,组织出「你的仓库有……」这样的回答,经由你的服务器返回给用户。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559645%2F11_-_002_-_MCP_Clients_19.1748559645252.png)

这个流程步骤确实不少,但每个组件的职责都很清晰。MCP 客户端把与服务器通信的复杂度都抽象掉了,让你能专注于业务逻辑,同时还能用上强大的外部工具和服务。

对产品经理来说: 注意第 5 步是这套架构的分水岭——你的服务器从「工具的执行者」退化成了「调度者」。这是好事: 出问题时排查范围清楚了(是我的编排错了,还是 MCP 服务器实现有 bug),但也意味着你对工具行为的掌控力下降了,依赖对方的实现质量。选用第三方 MCP 服务器时,这一点要提前评估。
