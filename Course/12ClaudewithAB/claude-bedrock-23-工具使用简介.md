# Claude with AWS Bedrock - 23 Introducing Tool Use 工具使用简介

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 23
> 课程: Claude with AWS Bedrock · 第 23 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Tools allow Claude to access information from the outside world, solving one of its key limitations. By default, Claude only has access to information it was trained on, which means it can't provide current information like today's weather or recent news.

> 工具(tools)让 Claude 能够访问外部世界的信息,解决了它的一项关键局限。默认情况下,Claude 只能访问它训练时所用的数据,这意味着它没法提供像今天的天气、最新新闻这类实时信息。

When a user asks "What's the weather in San Francisco, California?" Claude will typically respond with "I'm sorry, but I don't have access to up-to-date weather information." Tools fix this problem by creating a bridge between Claude and external data sources.

> 当用户问「旧金山今天天气怎么样?」时,Claude 通常会回答「抱歉,我无法获取最新的天气信息」。工具正是通过在 Claude 和外部数据源之间搭建一座桥梁,解决了这个问题。

对产品经理来说,工具就像给一位知识渊博但「与世隔绝」的顾问配了一部能随时打出去的电话——顾问自己脑子里的知识足够丰富,但遇到需要查「今天」「刚刚」这种实时信息的问题时,得靠这部电话联系外部渠道帮他查,查完再告诉他,他才能给你一个准确的答案。

## How Tool Use Works 工具使用的运作原理

The tool use process follows a specific flow that involves multiple back-and-forth communications between your server and Claude:

> 工具使用的过程遵循一套特定的流程,需要你的服务器和 Claude 之间进行多次往返通信:

1. **Initial Request:** You send Claude a question along with instructions on how to get extra data. **初始请求:** 你把问题连同「如何获取额外数据」的说明,一起发给 Claude。
2. **Tool Request:** Claude analyzes the question and asks for specific external data it needs. **工具请求:** Claude 分析这个问题,并请求它所需要的具体外部数据。
3. **Data Retrieval:** Your server runs code to fetch the requested information. **数据获取:** 你的服务器运行代码,取回被请求的信息。
4. **Final Response:** Claude uses the external data to provide a complete, informed answer. **最终响应:** Claude 利用这份外部数据,给出一个完整、有依据的答案。

## Weather Example in Practice 天气示例实践

Here's how the tool use flow works for a weather query:

> 以下是天气查询场景下,工具使用流程的具体运作方式:

When a user asks about weather, you include details on how to retrieve current weather data in your initial request to Claude. Claude recognizes it needs current weather information and asks your server to get it. Your server calls a weather API, retrieves the live data, and sends it back to Claude. Finally, Claude combines the original question with the fresh weather data to provide an accurate, current response.

> 当用户询问天气时,你在发给 Claude 的初始请求中,附上「如何获取实时天气数据」的说明。Claude 识别出自己需要实时天气信息,于是请求你的服务器去获取。你的服务器调用一个天气 API,取回实时数据,再把它发回给 Claude。最后,Claude 把原始问题和这份最新的天气数据结合起来,给出一个准确、及时的响应。

## Implementation Challenges 实现上的挑战

Tool use can feel confusing because there's a disconnect between the logical flow and how you actually write the code. The implementation doesn't follow the same order as the conceptual steps:

> 工具使用容易让人感到困惑,因为「逻辑流程」和「你实际写代码的方式」之间存在一种脱节。具体实现的顺序,并不完全遵循概念上那几个步骤的先后次序:

In practice, you often need to:

> 实践中,你通常需要:

1. Write the tool function first. 先写出工具函数。
2. Create a JSON schema specification. 创建 JSON schema 规格说明。
3. Handle the ToolUse and ToolResult parts. 处理 ToolUse(工具使用)和 ToolResult(工具结果)这两个部分。
4. Include the schema with your request. 把这份 schema 附带在你的请求里。

This jumping around between different parts of the implementation is why tool use initially seems complex. The key is understanding that each step in the logical flow requires specific code components that you'll build in a different order than they execute.

> 正是这种在实现的不同部分之间来回跳跃,让工具使用一开始显得很复杂。关键在于要理解:逻辑流程中的每一步,都需要特定的代码组件来支撑,而你构建这些组件的顺序,和它们实际执行的顺序是不一样的。

In the following videos, we'll implement tool use step by step, frequently referencing this flow diagram to keep track of which piece we're currently building.

> 在接下来的视频中,我们会一步步实现工具使用,并频繁参照这张流程图,来清楚知道自己目前正在构建哪一部分。
