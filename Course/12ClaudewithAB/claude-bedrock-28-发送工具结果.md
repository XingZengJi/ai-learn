# Claude with AWS Bedrock - 28 Sending Tool Results 发送工具结果

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 28
> 课程: Claude with AWS Bedrock · 第 28 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Now we're at the final step of the tool use workflow. After running our tools and getting the results, we need to send everything back to Claude so it can provide a complete response to the user.

> 现在我们来到了工具调用工作流的最后一步。运行完工具、拿到结果之后,我们需要把这一切都发回给 Claude,让它能给用户提供一个完整的响应。

The process is straightforward: take all the tool result parts we generated, package them into a user message, and send the entire conversation history back to Claude along with the original tool schemas.

> 这个过程很直接:取出我们生成的所有工具结果部分,把它们打包成一条用户消息,连同原始的工具 schema,把整个对话历史一起发回给 Claude。

## Adding the Assistant Message 添加助手消息

First, we need to make sure our conversation history is complete. After Claude's initial response with the tool use request, we need to add that response to our message history using `add_assistant_message()`.

> 首先,我们需要确保对话历史是完整的。在 Claude 最初返回带工具调用请求的响应之后,我们需要用 `add_assistant_message()` 把这条响应加入到我们的消息历史中。

This ensures we have the complete conversation flow: user question → assistant tool request → tool results → final assistant response.

> 这确保了我们拥有完整的对话流程:用户提问 → 助手的工具请求 → 工具结果 → 助手的最终响应。

## Running Tools and Creating Tool Results 运行工具并创建工具结果

The `run_tools()` function processes all the tool use requests from Claude's response and creates properly formatted tool result parts. Each tool result includes:

> `run_tools()` 函数会处理 Claude 响应中所有的工具调用请求,并创建格式正确的工具结果部分。每个工具结果都包含:

- The tool use ID (matching the original request). 工具调用 ID(与原始请求匹配)。
- The actual output from running the tool. 运行工具后的实际输出。
- A status indicating success or error. 表示成功或失败的状态。

The function handles both successful tool executions and errors gracefully, wrapping everything in the correct JSON structure that Claude expects.

> 这个函数能优雅地处理工具执行成功和出错这两种情况,把一切都包装成 Claude 所期望的正确 JSON 结构。

## Adding Tool Results to the Conversation 把工具结果加入对话

Once we have our tool results, we add them to the conversation using `add_user_message()`:

> 拿到工具结果之后,我们用 `add_user_message()` 把它们加入对话:

```python
add_user_message(messages, run_tools(parts))
```

This creates a user message containing all the tool result parts. The conversation now has the complete back-and-forth needed for Claude to provide a final response.

> 这会创建一条包含所有工具结果部分的用户消息。现在这段对话已经具备了 Claude 给出最终响应所需要的完整往来。

## Final Call to Claude 最后一次调用 Claude

The last step is sending everything back to Claude. This requires two important elements:

> 最后一步是把这一切都发回给 Claude。这需要两个重要的元素:

- The complete message history (user → assistant → user). 完整的消息历史(用户 → 助手 → 用户)。
- The original tool schemas. 原始的工具 schema。

```python
text, parts = chat(messages, tools=[get_current_datetime_schema])
```

Including the tool schemas is crucial. Without them, Claude would be confused about the tool references in the conversation history and wouldn't understand what `get_current_datetime` actually does.

> 附带工具 schema 至关重要。如果没有它们,Claude 会对对话历史中的工具引用感到困惑,也不会理解 `get_current_datetime` 到底是做什么的。

## Success 成功

When everything works correctly, Claude receives the tool results and can provide a complete, informed response. In our example, Claude successfully retrieved the current time and formatted it in a natural response: "The current date and time is 2025-04-03, 12:54:00."

> 当一切运作正常时,Claude 会收到工具结果,并能给出一个完整、有依据的响应。在我们的例子里,Claude 成功获取了当前时间,并以一种自然的方式表达出来:「当前的日期和时间是 2025-04-03, 12:54:00」。

This demonstrates that our tool integration is working properly. While Claude knows the current date, it doesn't have access to real-time information like the exact current time - which is exactly what our tool provided.

> 这证明了我们的工具集成运作正常。虽然 Claude 知道当前日期,但它没法获取像确切当前时间这样的实时信息——而这正是我们的工具所提供的。

The complete tool use cycle is now working: Claude requests a tool, we execute it, return the results, and Claude incorporates that information into its final response to the user.

> 现在完整的工具调用闭环已经跑通了:Claude 请求一个工具,我们执行它,返回结果,Claude 把这份信息整合进它给用户的最终响应里。
