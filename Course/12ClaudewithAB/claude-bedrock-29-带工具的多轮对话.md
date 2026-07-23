# Claude with AWS Bedrock - 29 Multi-Turn Conversations with Tools 带工具的多轮对话

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 29
> 课程: Claude with AWS Bedrock · 第 29 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Building multi-turn conversations with tool use requires handling different response types from Claude. When Claude responds, it might need to use a tool, or it might provide a direct answer. Your code needs to handle both scenarios gracefully.

> 构建带工具调用的多轮对话,需要处理 Claude 返回的不同类型的响应。Claude 的响应,有可能是需要使用工具,也有可能是直接给出答案。你的代码需要优雅地处理这两种情况。

## The Problem with Simple Tool Integration 简单工具集成存在的问题

If you just add tool results to every conversation, you'll run into issues. When Claude answers a simple question like "What is 1+1?", it doesn't need any tools. But if your code always tries to process tool results, you'll end up adding empty messages to your conversation history.

> 如果你在每一段对话里都无脑加入工具结果处理,就会遇到问题。当 Claude 回答像「1+1 等于几?」这样的简单问题时,它根本不需要任何工具。但如果你的代码总是试图处理工具结果,最后就会往对话历史里加入一堆空消息。

The solution is to check the `stop_reason` that comes back with every Claude response. This tells you why Claude stopped generating - whether it finished naturally or because it wants to use a tool.

> 解决办法是检查每次 Claude 响应中返回的 `stop_reason`(停止原因)。它会告诉你 Claude 为什么停止了生成——是自然地完成了回答,还是因为它想使用一个工具。

## Stop Reasons 停止原因

Claude can stop for several reasons:

> Claude 可能因为以下几种原因而停止:

- **"tool_use"** - The model wants to call a tool. **"tool_use"** - 模型想调用一个工具。
- **"end_turn"** - Model finished generating its response. **"end_turn"** - 模型完成了响应的生成。
- **"max_tokens"** - Hit the output limit. **"max_tokens"** - 达到了输出长度上限。
- **"stop_sequence"** - Encountered a stop sequence you provided. **"stop_sequence"** - 遇到了你提供的停止序列。

## Improving the Chat Function 改进 Chat 函数

First, update your chat function to return more information. Instead of just returning text and parts separately, return a dictionary with everything you need:

> 首先,更新你的 chat 函数,让它返回更多信息。不要只是分别返回文本和 parts,而是返回一个包含你所需一切信息的字典:

```python
def chat(messages, tools=None, system=None, **kwargs):
    # ... existing code ...
    
    return {
        "parts": parts,
        "stop_reason": response["stopReason"],
        "text": "\n".join([p["text"] for p in parts if "text" in p])
    }
```

This approach extracts all text content from the response parts, which is more robust than assuming the first part is always text.

> 这种做法会提取响应 parts 里所有的文本内容,比「假设第一个部分总是文本」这种做法更稳健。

## Building a Conversation Loop 构建对话循环

Create a function that handles the full conversation flow:

> 创建一个函数,处理完整的对话流程:

```python
def run_conversation(messages):
    while True:
        result = chat(messages, tools=[get_current_datetime_schema])
        
        add_assistant_message(messages, result["parts"])
        print(result["text"])
        
        if result["stop_reason"] != "tool_use":
            break
            
        tool_result_parts = run_tools(result["parts"])
        add_user_message(messages, tool_result_parts)
    
    return messages
```

This loop continues until Claude stops for a reason other than tool use. Each iteration:

> 这个循环会一直持续,直到 Claude 因为「工具调用」以外的原因而停止。每一轮迭代都会:

1. Sends the current messages to Claude. 把当前的消息列表发送给 Claude。
2. Adds Claude's response to the message history. 把 Claude 的响应加入消息历史。
3. Checks if Claude wants to use a tool. 检查 Claude 是否想使用工具。
4. If so, runs the tools and adds results back to the conversation. 如果是,运行工具,把结果加回对话中。
5. If not, exits the loop. 如果不是,退出循环。

## Testing the Implementation 测试这个实现

This approach handles both tool-requiring and simple questions:

> 这种做法既能处理需要工具的问题,也能处理简单的问题:

```python
# Tool-requiring question
messages = []
add_user_message(messages, "What time is it?")
run_conversation(messages)

# Simple question  
messages = []
add_user_message(messages, "What is 1+1?")
run_conversation(messages)
```

For time questions, Claude will use the datetime tool. For math questions, it responds directly without any tool calls. The conversation loop adapts automatically based on Claude's stop reason.

> 对于时间类的问题,Claude 会使用日期时间工具。对于数学类的问题,它会直接给出回答,不调用任何工具。这个对话循环会根据 Claude 的停止原因自动调整。

This pattern scales well when you add more tools - the same loop handles any combination of tool use and direct responses, making your conversational AI more robust and natural.

> 当你加入更多工具时,这套模式依然能很好地扩展——同一个循环能处理「工具调用」和「直接响应」的任意组合,让你的对话式 AI 变得更健壮、更自然。
