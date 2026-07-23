# Claude with AWS Bedrock - 9 Streaming 流式响应

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 9
> 课程: Claude with AWS Bedrock · 第 9 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When building chat interfaces with AI models, users expect to see responses appear immediately rather than waiting 10-30 seconds for a complete response. The `converse_stream` function solves this by streaming text as it's generated, creating a much better user experience.

> 在用 AI 模型构建聊天界面时,用户期待的是响应能立刻开始出现,而不是干等 10-30 秒才看到一份完整的回答。`converse_stream` 函数通过「边生成边传输文本」解决了这个问题,大幅改善了用户体验。

对产品经理来说,这就像点外卖和自己在厨房看菜下锅的区别:不用流式传输,你只能盯着一个「加载中」转圈圈,不知道后台在干嘛;有了流式传输,就像厨房透明操作台,你能实时看到菜一点点被端上来——等待感完全不一样。

## How Streaming Works 流式传输的工作原理

Instead of waiting for the entire response to be generated, streaming sends back pieces of text as soon as they're available. Here's how the flow changes:

> 流式传输不需要等整段响应都生成完毕,而是一有文本片段就立刻传回来。流程会变成这样:

When you call `converse_stream`, you immediately get back an initial response that contains a stream object. This stream is a generator that yields events as the model generates text. Each event contains a small chunk of the overall response.

> 当你调用 `converse_stream` 时,会立刻拿到一个包含 stream(流)对象的初始响应。这个 stream 是一个生成器(generator),会随着模型生成文本不断产出事件(event)。每个事件都包含整段响应中的一小块内容。

## Basic Implementation 基础实现

Here's how to use `converse_stream` in your code:

> 在代码中使用 `converse_stream` 的方式如下:

```python
messages = []
add_user_message(messages, "Write a 1 sentence description of a fake database")
response = client.converse_stream(messages=messages, modelId=model_id)

for event in response["stream"]:
    print(event)
```

This will print out all the different events as they arrive. You'll see the response come in chunks rather than all at once.

> 这会把陆续到达的各种事件都打印出来。你会看到响应是分块到来的,而不是一次性全部出现。

## Understanding Stream Events 理解流事件

The stream yields several types of events, each serving a different purpose:

> 这个流会产出好几种类型的事件,各自承担不同的作用:

For basic text generation, you only need to care about `contentBlockDelta` events. These contain the actual generated text chunks that you want to display to users.

> 对于基础的文本生成来说,你只需要关注 `contentBlockDelta` 事件。它们包含的正是你想展示给用户的、实际生成出来的文本片段。

The events always arrive in a predictable order: `messageStart`, multiple `contentBlockDelta` events containing your text, then `contentBlockStop`, `messageStop`, and finally metadata.

> 这些事件总是按照可预测的顺序到达:先是 `messageStart`,接着是多个包含文本内容的 `contentBlockDelta` 事件,然后是 `contentBlockStop`、`messageStop`,最后是元数据(metadata)。

## Extracting the Text 提取文本内容

To get just the generated text from each chunk, filter for `contentBlockDelta` events and extract the text:

> 要从每个数据块中只提取生成的文本,筛选出 `contentBlockDelta` 事件并从中取出文本即可:

```python
text = ""
for event in response["stream"]:
    if "contentBlockDelta" in event:
        chunk = event["contentBlockDelta"]["delta"]["text"]
        print(chunk, end="")
        text += chunk

print("\n\nTotal Message:\n" + text)
```

The `end=""` parameter removes the automatic newline that Python's print function adds, making the streaming text appear more naturally.

> `end=""` 这个参数去掉了 Python `print` 函数自动添加的换行符,让流式文本显示得更自然、更连贯。

## Practical Applications 实际应用场景

In a real application, instead of printing each chunk, you'd typically:

> 在真实的应用中,你通常不会直接把每个数据块打印出来,而是会:

- Send each chunk to your frontend via WebSockets or Server-Sent Events. 通过 WebSocket 或服务器推送事件(SSE),把每个数据块发送给前端。
- Update the UI to display the growing response in real-time. 更新界面,实时展示逐渐增长的响应内容。
- Store the complete message once streaming finishes. 流式传输结束后,存储完整的消息内容。
- Handle any errors that might occur during streaming. 处理流式传输过程中可能出现的各种错误。

This streaming approach transforms the user experience from "submit and wait" to "submit and watch the response appear," making your AI-powered applications feel much more responsive and engaging.

> 这种流式传输的方式,把用户体验从「提交后干等」转变为「提交后看着回答逐渐显现」,让你的 AI 应用感觉响应更迅速、也更能吸引用户。

## Downloads 课程配套文件

- `003_Streaming_complete.ipynb`(在新标签页打开)
- `003_Streaming.ipynb`(在新标签页打开)
