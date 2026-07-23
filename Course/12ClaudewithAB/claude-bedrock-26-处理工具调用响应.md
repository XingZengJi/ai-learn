# Claude with AWS Bedrock - 26 Handling Tool Use Responses 处理工具调用响应

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 26
> 课程: Claude with AWS Bedrock · 第 26 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When Claude decides to use a tool, it returns a special response structure that requires careful handling. Understanding this response format and implementing proper conversation management is crucial for building robust tool-enabled applications.

> 当 Claude 决定使用一个工具时,它会返回一种特殊的响应结构,需要小心处理。理解这种响应格式、正确实现对话管理,对于构建健壮的、支持工具调用的应用至关重要。

## Tool Choice Configuration 工具选择配置

Before diving into responses, it's worth understanding how to control when Claude uses tools. The `toolChoice` parameter gives you three options:

> 在深入了解响应结构之前,值得先理解如何控制「Claude 什么时候使用工具」。`toolChoice` 参数给了你三个选项:

- **auto** - Claude decides whether to use a tool (default behavior). **auto** - 由 Claude 自己决定是否使用工具(默认行为)。
- **any** - Claude must use a tool but can choose which one. **any** - Claude 必须使用某个工具,但可以自己选择用哪一个。
- **specific tool** - Force Claude to use a particular tool by name. **指定工具** - 强制 Claude 按名称使用某个特定的工具。

The third option is especially useful for testing when you want to ensure Claude calls a specific function.

> 第三个选项在测试时特别有用——当你想确保 Claude 一定会调用某个特定函数的时候。

## Multi-Part Message Structure 多部分消息结构

When Claude wants to use a tool, it returns an assistant message with multiple content parts instead of just text:

> 当 Claude 想使用工具时,它返回的助手消息会包含多个内容部分,而不只是纯文本:

The response contains two parts:

> 这个响应包含两个部分:

- **Text Part** - Human-readable explanation like "I can help you find out the current time. Let me find that information for you." **文本部分** - 一段人类可读的说明,比如「我可以帮你查一下现在的时间,让我来查一下这个信息」。
- **ToolUse Part** - Structured data telling you which tool to run and with what arguments. **ToolUse(工具使用)部分** - 结构化数据,告诉你该运行哪个工具、带什么参数运行。

## Understanding the ToolUse Part 理解 ToolUse 部分

The ToolUse part contains three key pieces of information:

> ToolUse 部分包含三项关键信息:

- **toolUseId** - A unique identifier you'll need when sending back the tool result. **toolUseId** - 一个唯一标识符,你在回传工具结果时会需要用到它。
- **name** - The exact tool name from your JSON schema that Claude wants to call. **name** - Claude 想要调用的工具名称,与你 JSON schema 中的名称完全一致。
- **input** - A dictionary of arguments Claude wants to pass to your tool function. **input** - 一个字典,包含 Claude 想传给你工具函数的参数。

## Conversation Flow with Tools 带工具调用的对话流程

Tool usage follows a specific conversation pattern that requires maintaining complete message history:

> 工具调用遵循一套特定的对话模式,需要维护完整的消息历史:

When you receive a tool use request, you need to:

> 当你收到一个工具调用请求时,你需要:

1. Extract the tool information from the ToolUse part. 从 ToolUse 部分提取工具信息。
2. Run your actual tool function. 运行你真正的工具函数。
3. Send back a ToolResult message along with the complete conversation history. 把 ToolResult(工具结果)消息连同完整的对话历史一起发回去。
4. Include the original user message and the assistant's tool use message in your next request. 在下一次请求中,包含原始的用户消息和助手的工具调用消息。

## Updating Helper Functions 更新辅助函数

To handle multi-part messages properly, you'll need to update your message handling functions. Here's how to make your functions flexible enough to handle both simple text and complex multi-part content:

> 要正确处理多部分消息,你需要更新消息处理函数。以下是如何让这些函数足够灵活,既能处理简单文本,也能处理复杂的多部分内容:

```python
def add_user_message(messages, content):
    if isinstance(content, str):
        user_message = {"role": "user", "content": [{"text": content}]}
    else:
        user_message = {"role": "user", "content": content}
    messages.append(user_message)

def add_assistant_message(messages, content):
    if isinstance(content, str):
        assistant_message = {"role": "assistant", "content": [{"text": content}]}
    else:
        assistant_message = {"role": "assistant", "content": content}
    messages.append(assistant_message)
```

You'll also want to update your chat function to return both the text and the full parts list:

> 你还需要更新你的 chat 函数,让它同时返回文本内容和完整的 parts 列表:

```python
def chat(messages, system=None, temperature=1.0, stop_sequences=[], tools=None):
    # ... existing setup code ...
    
    response = client.converse(**params)
    
    text = response["output"]["message"]["content"][0]["text"]
    parts = response["output"]["message"]["content"]
    
    return text, parts
```

## Checking the Stop Reason 检查停止原因

Always check the `stopReason` field in Claude's response. When it equals `"tool_use"`, you know Claude wants to call a tool rather than just providing a text response. This is your signal to extract the tool information and execute the requested function.

> 始终检查 Claude 响应中的 `stopReason` 字段。当它等于 `"tool_use"` 时,你就知道 Claude 是想调用一个工具,而不只是给出一段文本响应。这是你该提取工具信息、执行被请求的函数的信号。

With these patterns in place, you're ready to handle Claude's tool use requests and maintain proper conversation flow throughout multi-turn tool interactions.

> 有了这些模式,你就能处理 Claude 的工具调用请求,并在多轮的工具交互过程中,维持正确的对话流程了。
