# Claude with AWS Bedrock - 2 Accessing the API 访问 API

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 2
> 课程: Claude with AWS Bedrock · 第 2 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When building applications with AI models, you need to understand the flow of data from user input to AI-generated response. Let's walk through how this works with AWS Bedrock and see what happens behind the scenes of a typical chat application.

> 在用 AI 模型构建应用时,你需要理解数据是如何从「用户输入」流转到「AI 生成的响应」的。我们来看看这在 AWS Bedrock 上是怎么运作的,了解一个典型聊天应用背后到底发生了什么。

### How Chat Applications Work 聊天应用是如何运作的

Imagine you're building a web app with a simple chat interface. A user types "Define quantum computing" and clicks send. Here's what actually happens:

> 假设你正在构建一个带有简单聊天界面的网页应用。用户输入「解释一下量子计算」,点击发送。实际发生的事情是这样的:

The user sees a clean interface, but there's a whole system working behind the scenes to generate that response.

> 用户看到的是一个简洁的界面,但界面背后有一整套系统在运转,才生成了那条响应。

对产品经理来说,这就像你在外卖 App 里点一杯咖啡:你看到的只是「下单 - 收到咖啡」两个动作,但背后有下单系统、门店接单、咖啡师制作、骑手配送一整条链路在运转。这一课要讲的,就是「用户提问 - 收到回答」背后这条链路具体长什么样。

### The Request Flow 请求的流转过程

When a user submits text, here's the journey that message takes:

> 当用户提交一段文本时,这条消息会经历以下旅程:

1. User submits their message through your web interface. 用户通过你的网页界面提交消息。
2. Your server receives the request containing that text. 你的服务器接收到包含这段文本的请求。
3. Your server uses the Bedrock client to make a request to AWS Bedrock. 你的服务器用 Bedrock 客户端向 AWS Bedrock 发起请求。
4. The request includes the user message and a model ID (like Claude Haiku or Claude Sonnet). 这个请求包含用户消息和一个模型 ID(比如 Claude Haiku 或 Claude Sonnet)。
5. The chosen model processes the request and generates text. 被选中的模型处理这个请求,生成文本。
6. AWS Bedrock sends back an assistant message containing the generated response. AWS Bedrock 把生成的响应,以一条「assistant(助手)消息」的形式发送回来。
7. Your server forwards this response back to the user's browser. 你的服务器把这条响应转发回用户的浏览器。
