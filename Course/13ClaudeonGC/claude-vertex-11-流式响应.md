# Claude with Google Vertex - 11 Response streaming 流式响应

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 11
> 课程: Claude with Google Vertex · 第 11 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

用 Claude 做聊天应用时有一个很实际的体验难题: 生成一次回复要 10–30 秒,这段时间用户只能盯着转圈。解法是**流式响应(streaming)**——让文字随着 Claude 生成一块块地出现,交互感会好很多。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619503%2F03_-_009_-_Response_Streaming_00.1748619503472.png)

## The Problem with Standard Responses 普通响应的问题

典型的聊天架构里,你的服务器把用户消息发给 Claude,然后**一直等到完整回复生成完**才开始往客户端发东西。这就造成一段尴尬的空白期,用户完全得不到「事情正在推进」的反馈。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619504%2F03_-_009_-_Response_Streaming_02.1748619503994.png)

## How Streaming Works 流式响应怎么工作

开启流式后,Claude 会立刻回一个初始响应,表示「已收到请求、开始生成」。接着你会陆续收到一系列事件,每个事件带着整段回复中的一小块。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619504%2F03_-_009_-_Response_Streaming_03.1748619504478.png)

你的服务器可以边收边转发给客户端,用户就能看到回复一个词一个词地浮现出来。这些事件全都属于**同一个**发往 Claude 的请求。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619505%2F03_-_009_-_Response_Streaming_04.1748619504964.png)

## Understanding Stream Events 理解流式事件

开启流式后,Claude 会发回几类事件:

- **MessageStart** —— 一条新消息开始发送
- **ContentBlockStart** —— 一个新内容块开始,可能是文本、工具调用或其他内容
- **ContentBlockDelta** —— 实际生成文本的碎片
- **ContentBlockStop** —— 当前内容块结束
- **MessageDelta** —— 当前消息完成
- **MessageStop** —— 关于当前消息的信息全部结束

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619505%2F03_-_009_-_Response_Streaming_11.1748619505385.png)

其中 **ContentBlockDelta** 事件里装的才是你要展示给用户的实际文本。

## Basic Streaming Implementation 基础实现

开启流式只需给 `messages.create` 加上 `stream=True`:

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

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619506%2F03_-_009_-_Response_Streaming_12.1748619505920.png)

## Simplified Text Streaming 更省事的文本流

不想手动解析事件的话,可以用 SDK 提供的简化接口,它只把文本内容抽出来:

```python
with client.messages.stream(
    model=model,
    max_tokens=1000,
    messages=messages
) as stream:
    for text in stream.text_stream:
        print(text, end="")
```

这个写法自动过滤掉除实际文本以外的一切,而展示给用户时通常也只需要文本。

## Getting the Final Message 拿到完整的最终消息

流式对体验很好,但你往往还需要完整消息用于存储或后续处理。流结束后可以取到拼装好的最终消息:

```python
with client.messages.stream(
    model=model,
    max_tokens=1000,
    messages=messages
) as stream:
    for text in stream.text_stream:
        pass  # 真实应用里在这里发给客户端
    
    final_message = stream.get_final_message()
```

这样既有面向用户体验的流式能力,又有可入库、可作为对话历史的完整消息对象。

## Practical Considerations 实践注意事项

流里的每个文本块可能包含多个词,甚至一整句——**不保证**每个事件正好一个词。块的大小取决于 Claude 生成各段文字的速度。

生产环境里,你通常会通过 WebSocket 或 Server-Sent Events 把这些文本块立刻转发给客户端,让用户实时看到回复出现,同时在服务器上保留完整的对话历史。

对产品经理来说: 流式是「感知性能」的经典案例——总耗时一秒没少,但用户觉得快多了,因为等待被填满了。做需求排期时,这类改动的投入产出比通常高于真正去优化模型延迟。同时注意最后一段: 展示归展示,**入库要用 `get_final_message()` 拿到的完整消息**,别把流里的碎片拼起来当数据源,这是常见的实现坑。
