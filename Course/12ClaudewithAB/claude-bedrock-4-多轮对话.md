# Claude with AWS Bedrock - 4 Multi-Turn Conversations 多轮对话

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 4
> 课程: Claude with AWS Bedrock · 第 4 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

The code we've written so far simulates a very simple exchange with Claude. But what happens when you want to continue a conversation? When you ask a follow-up question like "And 3 more?" after asking "What's 1+1?", you might expect Claude to understand you're asking about adding 3 to the previous result of 2.

> 我们目前写的代码,只模拟了与 Claude 之间一次非常简单的往来。但如果你想继续这段对话,会发生什么呢?比如,在问了「1+1 等于几?」之后,又追问一句「再加 3 呢?」,你可能会期待 Claude 明白你是在问「把 3 加到上一次结果 2 上面」。

However, there's something critical you need to understand about the Bedrock API and Claude itself.

> 然而,关于 Bedrock API 和 Claude 本身,有一件至关重要的事情你需要理解。

## No Message Storage 不存储任何消息

Bedrock and Claude do not store any messages. None of the messages you send get stored, and none of the responses you receive are stored either. Each API call is completely independent.

> Bedrock 和 Claude 都不会存储任何消息。你发送的消息不会被存储,你收到的响应也不会被存储。每一次 API 调用都是完全独立的。

对产品经理来说,这一点特别反直觉:很多人会以为「AI 记得我们之前聊过什么」,但实际上 Claude 更像一个「每次都失忆」的顾问——它不会主动记住上一轮说了什么,每次你都得把完整的聊天记录重新递给它看,它才「记得」。

To have a conversation with multiple messages that maintain context, you need to:

> 要进行一段能保持上下文的多消息对话,你需要:

1. Manually maintain a list of all messages in your code. 在你的代码里手动维护一份包含所有消息的列表。
2. Provide that entire list of messages with each follow-up request. 每次发起后续请求时,都把这份完整的消息列表一起提供给模型。

## Why Context Matters 为什么上下文很重要

Let's see what happens without proper context. If you send just "And 3 more?" as a standalone message, Claude has no idea what you're referring to. It will do its best to respond, but the answer won't make sense because it lacks the context of your previous conversation.

> 我们来看看如果没有正确的上下文会发生什么。如果你只发送「再加 3 呢?」这样一条孤立的消息,Claude 完全不知道你在说什么。它会尽力作答,但答案不会有意义,因为它缺少你之前对话的上下文。

When you send only the follow-up question, Claude sees just that isolated message and tries to respond without knowing about the previous "What's 1+1?" exchange.

> 当你只发送这句追问时,Claude 看到的只是这一条孤立的消息,它会在完全不知道之前「1+1 等于几?」这段对话的情况下,尝试给出回答。

## Building Conversation Context 构建对话上下文

To maintain context, you need to include the full conversation history in each request. Here's how it works:

> 要维持上下文,你需要在每次请求中都包含完整的对话历史。具体是这样运作的:

Your message list should contain all previous exchanges - both user messages and assistant responses. When you send this complete context, Claude can understand that "And 3 more?" refers to adding 3 to the previous result of 2.

> 你的消息列表应该包含之前所有的往来内容——既有用户消息,也有助手的回复。当你发送这份完整的上下文时,Claude 就能理解「再加 3 呢?」指的是把 3 加到之前结果 2 的基础上。

## Helper Functions for Message Management 用于管理消息的辅助函数

To make conversation management easier, you can create helper functions:

> 为了让对话管理更轻松,你可以创建一些辅助函数:

```python
def add_user_message(messages, text):
    user_message = {
        "role": "user",
        "content": [
            {"text": text}
        ]
    }
    messages.append(user_message)

def add_assistant_message(messages, text):
    assistant_message = {
        "role": "assistant", 
        "content": [
            {"text": text}
        ]
    }
    messages.append(assistant_message)

def chat(messages):
    response = client.converse(
        modelId=model_id,
        messages=messages
    )
    return response["output"]["message"]["content"][0]["text"]
```

## Implementing Multi-Turn Conversations 实现多轮对话

Here's how to build a conversation step by step:

> 下面是如何一步步构建一段对话:

```python
# Make a starting list of messages
messages = []

# Add in the initial user question of "What's 1+1?"
add_user_message(messages, "What's 1+1?")

# Pass the list of messages into chat to get an answer
answer = chat(messages)

# Take the answer and add it as an assistant message into our list
add_assistant_message(messages, answer)

# Add in the user's followup question
add_user_message(messages, "And 3 more added to that?")

# Call chat again with the list of messages to get a final answer
answer = chat(messages)
print(answer)
```

This approach ensures Claude has the full context and can respond appropriately: "Starting with the result of 1+1 = 2, if we add 3 more to that, we get: 2 + 3 = 5"

> 这种做法确保了 Claude 拥有完整的上下文,能够给出恰当的回答:「从 1+1=2 这个结果出发,再加 3,我们得到:2 + 3 = 5」

## Message Role Alternation 消息角色的交替出现

When building your message list, always ensure that message roles alternate properly:

> 在构建消息列表时,一定要确保消息角色正确地交替出现:

Your conversation should follow the pattern: user → assistant → user → assistant. Never have two user messages in a row or two assistant messages in a row. This alternating pattern is required by the API and reflects natural conversation flow.

> 你的对话应该遵循这样的模式:用户 → 助手 → 用户 → 助手。绝不能连续出现两条用户消息,也不能连续出现两条助手消息。这种交替模式是 API 所要求的,也反映了自然对话本来的流程。

While this manual message management might seem tedious at first, you'll quickly get used to it. This pattern is fundamental to building any application that needs to maintain conversational context with Claude.

> 虽然这种手动的消息管理一开始可能显得有点繁琐,但你很快就会习惯。这个模式是构建任何需要与 Claude 保持对话上下文的应用的基础。
