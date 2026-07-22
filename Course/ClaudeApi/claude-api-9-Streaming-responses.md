# Building with the Claude API - 9 Streaming responses 流式响应

> Course: Building with the Claude API · Lesson 9
> 课程: Building with the Claude API · 第 9 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

When building chat applications with Claude, there's a significant user experience challenge: responses can take 10-30 seconds to generate, leaving users staring at a loading spinner. The solution is response streaming, which lets users see text appear chunk by chunk as Claude generates it, creating a much more responsive feel.

> 用 Claude 构建聊天应用时,有一个明显的体验难题:生成一次回复可能需要 10 到 30 秒,期间用户只能盯着加载动画干等。解决办法是「流式响应(streaming)」——让用户看到文本随 Claude 生成而一块一块地出现,体验会顺畅得多。

## The Problem with Standard Responses 标准响应方式的问题

In a typical chat setup, your server sends a user message to Claude and waits for the complete response before sending anything back to the client. This creates an awkward delay where users have no feedback that anything is happening.

> 在典型的聊天架构里,你的服务器把用户消息发给 Claude 后,要等到完整响应生成完毕才会给客户端返回任何内容。这会造成一段尴尬的等待——用户完全感知不到系统正在处理。

## How Streaming Works 流式响应的工作方式

With streaming enabled, Claude immediately sends back an initial response indicating it has received your request and is starting to generate text. Then you receive a series of events, each containing a small piece of the overall response.

> 开启流式响应后,Claude 会立刻返回一个初始信号,表明它已收到请求、正在开始生成文本。随后你会陆续收到一连串「事件(event)」,每个事件包含完整响应中的一小块内容。

Your server can forward these text chunks to your client application as they arrive, allowing users to see the response building up word by word. All of these events are part of a single request to Claude.

> 你的服务器可以把这些文本片段随到随转发给客户端应用,让用户看到回复一个词一个词地「长」出来。这些事件全部属于同一次对 Claude 的请求。

## Understanding Stream Events 理解流事件

When you enable streaming, Claude sends back several types of events:

- MessageStart - A new message is being sent
- ContentBlockStart - Start of a new block containing text, tool use, or other content
- ContentBlockDelta - Chunks of the actual generated text
- ContentBlockStop - The current content block has been completed
- MessageDelta - The current message is complete
- MessageStop - End of information about the current message

  开启流式响应后,Claude 会返回几种类型的事件:MessageStart(一条新消息开始发送)、ContentBlockStart(一个新内容块开始,内容可以是文本、工具调用或其他类型)、ContentBlockDelta(实际生成文本的片段)、ContentBlockStop(当前内容块已完成)、MessageDelta(当前消息已完成)、MessageStop(当前消息相关信息结束)。

The ContentBlockDelta events contain the actual generated text that you'll want to display to users.

> 你真正要展示给用户看的生成文本,就藏在 ContentBlockDelta 这类事件里。

## Basic Streaming Implementation 基础实现方式

To enable streaming, add stream=True to your messages.create call:

> 要开启流式响应,只需在 `messages.create` 调用里加上 `stream=True`:

```python
messages = []
add_user_message(messages, "Write a 1 sentence description of a fake database")

stream = client.messages.create(
    model=model,
    max_tokens=1000,
    messages=messages,
    stream=True
)

for event in stream:
    print(event)
```

## Simplified Text Streaming 简化的文本流式接口

Rather than manually parsing events, you can use the SDK's simplified streaming interface that extracts just the text content:

> 与其手动解析各种事件,你可以用 SDK 提供的简化流式接口,它会直接帮你抽取出文本内容:

```python
with client.messages.stream(
    model=model,
    max_tokens=1000,
    messages=messages
) as stream:
    for text in stream.text_stream:
        print(text, end="")
```

This approach automatically filters out everything except the actual text content, which is usually what you need for displaying responses to users.

> 这种方式会自动过滤掉除文本内容以外的一切,而这通常正是你在给用户展示回复时所需要的。

## Getting the Complete Message 获取完整消息

While streaming individual chunks is great for user experience, you often need the complete message for storage or further processing. After streaming completes, you can get the assembled final message:

> 逐块流式输出虽然对用户体验很好,但你往往还需要一份完整消息用于存储或后续处理。流式传输结束后,你可以拿到拼装好的最终消息:

```python
with client.messages.stream(
    model=model,
    max_tokens=1000,
    messages=messages
) as stream:
    for text in stream.text_stream:
        # Send each chunk to your client
        pass
    
    # Get the complete message for database storage
    final_message = stream.get_final_message()
```

This gives you the best of both worlds: real-time streaming for users and a complete message object for your application logic.

> 这样你就能两头兼顾:给用户提供实时的流式体验,同时又能拿到完整的消息对象供应用逻辑使用。

对产品经理来说,流式响应解决的是「等待感」这个纯体验问题——内容生成的总耗时并没有变短,但用户看到文字一点点冒出来,和盯着一个转圈圈的加载动画相比,主观感受天差地别,这也是几乎所有 AI 聊天产品都要做流式输出的原因。
