# Building with the Claude API - 4 Multi-Turn conversations 多轮对话

> Course: Building with the Claude API · Lesson 4
> 课程: Building with the Claude API · 第 4 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

When working with the Anthropic API and Claude, there's a crucial concept you need to understand: Claude doesn't store any of your conversation history. Each request you make is completely independent, with no memory of previous exchanges.

> 使用 Anthropic API 和 Claude 时,有一个关键概念必须先搞清楚:Claude 不会保存你的任何对话历史。你发出的每一次请求都是完全独立的,它对之前的交流没有任何记忆。

This means if you want to have a multi-turn conversation where Claude remembers context from earlier messages, you need to handle the conversation state yourself.

> 这意味着,如果你想让 Claude 记住前面消息的上下文、进行多轮对话,你需要自己维护对话状态。

## The Problem with Stateless Conversations 无状态对话带来的问题

Let's say you ask Claude "What is quantum computing?" and get a good response. Then you follow up with "Write another sentence" - Claude has no idea what you're referring to. It will write a sentence about something completely random because it has no memory of the quantum computing discussion.

> 假设你问 Claude 「什么是量子计算?」,得到了一个不错的回答。接着你追问「再写一句」——Claude 完全不知道你在说什么。因为它对之前关于量子计算的讨论毫无记忆,它会随便写出一句和量子计算毫不相关的话。

对产品经理来说,这就像每次找客服都是一个全新的客服接待你,ta 看不到你上一通电话说了什么——你得自己把之前聊过的内容再完整复述一遍,ta 才能接着往下聊。

## How Multi-Turn Conversations Work 多轮对话是如何运作的

To maintain conversation context, you need to do two things:

- Manually maintain a list of all messages in your code
- Send the complete message history with every request

  要维持对话上下文,你需要做两件事:在代码里手动维护一份完整的消息列表;每次请求都把完整的消息历史一并发送出去。

Here's the flow that actually works:

- Send your initial user message to Claude
- Take Claude's response and add it to your message list as an assistant message
- Add your follow-up question as another user message
- Send the entire conversation history to Claude

  真正可行的流程是:把你最初的用户消息发给 Claude;把 Claude 的回复作为一条「assistant 消息」加入你的消息列表;把你的追问作为新的一条「user 消息」加进去;把整个对话历史一起发给 Claude。

## Building Helper Functions 构建辅助函数

To make conversation management easier, you can create three helper functions:

> 为了让对话管理更方便,你可以写三个辅助函数:

```python
def add_user_message(messages, text):
    user_message = {"role": "user", "content": text}
    messages.append(user_message)

def add_assistant_message(messages, text):
    assistant_message = {"role": "assistant", "content": text}
    messages.append(assistant_message)

def chat(messages):
    message = client.messages.create(
        model=model,
        max_tokens=1000,
        messages=messages,
    )
    return message.content[0].text
```

## Putting It All Together 组合起来使用

Here's how you use these functions to maintain a conversation:

> 下面是如何用这几个函数来维持一段对话:

```python
# Start with an empty message list
messages = []

# Add the initial user question
add_user_message(messages, "Define quantum computing in one sentence")

# Get Claude's response
answer = chat(messages)

# Add Claude's response to the conversation history
add_assistant_message(messages, answer)

# Add a follow-up question
add_user_message(messages, "Write another sentence")

# Get the follow-up response with full context
final_answer = chat(messages)
```

Now Claude will understand that "Write another sentence" refers to expanding on the quantum computing definition, because you've provided the complete conversation context.

> 这时 Claude 就能明白「再写一句」指的是接着展开量子计算的定义,因为你已经把完整的对话上下文提供给了它。

These helper functions will be useful throughout your work with Claude, making it much easier to build applications that can maintain meaningful conversations over multiple exchanges.

> 这几个辅助函数在你之后使用 Claude 的过程中会一直很有用,能大大简化「构建能进行多轮、有意义对话的应用」这件事。

对产品经理来说,`messages` 这个列表本质上就是「聊天记录」——你负责当那个「记性好的助理」,每次找 Claude 之前先把完整聊天记录递给它,它才能接着上文往下说,而不是每次都得从头解释一遍。
