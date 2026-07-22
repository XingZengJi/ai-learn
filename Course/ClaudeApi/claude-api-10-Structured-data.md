# Building with the Claude API - 10 Structured data 结构化数据

> Course: Building with the Claude API · Lesson 10
> 课程: Building with the Claude API · 第 10 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

When you need Claude to generate structured data like JSON, Python code, or bulleted lists, you'll often run into a common problem: Claude wants to be helpful and add explanatory text around your content. While this is usually great, sometimes you need just the raw data with nothing else.

> 当你需要 Claude 生成 JSON、Python 代码、项目符号列表这类结构化数据时,常会遇到一个通病:Claude 出于「想帮上忙」的天性,会在内容前后加一些说明性文字。这种「热心」平时是好事,但有时候你只想要干干净净的原始数据,不要别的。

Consider building a web app that generates AWS EventBridge rules. Users enter a description, click generate, and expect to see clean JSON they can immediately copy and use. If Claude returns the JSON wrapped in markdown code blocks with explanatory text, users can't simply copy the entire response - they have to manually select just the JSON portion.

> 设想你在做一个生成 AWS EventBridge 规则的网页应用。用户输入一段描述、点击生成,期望看到的是能直接复制使用的干净 JSON。如果 Claude 返回的 JSON 被包在 markdown 代码块里、外面还裹着说明文字,用户就没法直接复制整段响应——他们得手动挑出 JSON 那部分。

## The Problem with Default Responses 默认响应方式的问题

By default, when you ask Claude to generate JSON, you might get something like this:

> 默认情况下,当你让 Claude 生成 JSON 时,可能会得到类似这样的结果:

```json
{
  "source": ["aws.ec2"],
  "detail-type": ["EC2 Instance State-change Notification"],
  "detail": {
    "state": ["running"]
  }
}
```

This rule captures EC2 instance state changes when instances start running.

> 这条规则会在 EC2 实例开始运行时,捕获实例的状态变化。

The JSON is correct, but it's wrapped in markdown formatting and includes explanatory text. For a web app where users need to copy the raw JSON, this creates friction in the user experience.

> 这段 JSON 本身没问题,但它被包在 markdown 格式里,还带着说明性文字。对于一个需要用户复制原始 JSON 的网页应用来说,这就制造了体验上的摩擦。

## The Solution: Assistant Message Prefilling + Stop Sequences 解决方案:助手消息预填充 + 停止序列

You can combine assistant message prefilling with stop sequences to get exactly the content you want. Here's how it works:

> 你可以把「助手消息预填充(assistant message prefilling)」和「停止序列(stop sequences)」结合起来,精确拿到你想要的内容。做法如下:

```python
messages = []

add_user_message(messages, "Generate a very short event bridge rule as json")
add_assistant_message(messages, "```json")

text = chat(messages, stop_sequences=["```"])
```

This technique works by:

- The user message tells Claude what to generate
- The prefilled assistant message makes Claude think it already started a markdown code block
- Claude continues by writing just the JSON content
- When Claude tries to close the code block with ```, the stop sequence immediately ends generation

  这个技巧的原理是:用户消息告诉 Claude 要生成什么;预填充的助手消息让 Claude 「以为」自己已经起了一个 markdown 代码块的头;于是 Claude 接下来只需要继续写 JSON 内容本身;当 Claude 打算用 ``` 关闭代码块时,停止序列会立刻终止生成。

The result is clean JSON with no extra formatting:

> 结果就是一段干净的 JSON,没有任何多余的格式:

```json
{
  "source": ["aws.ec2"],
  "detail-type": ["EC2 Instance State-change Notification"],
  "detail": {
    "state": ["running"]
  }
}
```

## Processing the Response 处理响应结果

You might notice some extra newline characters in the response. These are easy to handle:

> 你可能会注意到响应里带有一些多余的换行符,处理起来很简单:

```python
import json

# Clean up and parse the JSON
clean_json = json.loads(text.strip())
```

## Beyond JSON 不只是 JSON

This technique isn't limited to JSON generation. Use it anytime you need structured data without commentary:

- Python code snippets
- Bulleted lists
- CSV data
- Any formatted content where you want just the content, not explanations

  这个技巧不只适用于生成 JSON。任何你需要「只要结构化数据、不要评论」的场景都可以用:Python 代码片段;项目符号列表;CSV 数据;任何你只想要内容本身、不想要额外解释的格式化内容。

The key is identifying what Claude naturally wants to wrap your content in, then using that as your prefill and stop sequence. For code, it's usually markdown code blocks. For lists, it might be different formatting markers.

> 关键在于:先看清 Claude 天生倾向于用什么把你的内容「包起来」,然后就拿那个「包装物」当作你的预填充内容和停止序列。对代码来说,通常是 markdown 代码块;对列表来说,可能是别的格式标记。

This approach gives you precise control over Claude's output format, making it much easier to integrate AI-generated content into applications where clean, structured data is essential.

> 这种方法能让你精确控制 Claude 的输出格式,让「AI 生成的内容」更容易嵌入到那些必须要求干净、结构化数据的应用里。

对产品经理来说,这个技巧相当于「提前帮 Claude 把话头开好」——你先替它说了半句「```json」,它就会顺着这个「已经在写代码块」的语境接着往下写,而不会再客套地加「好的,这是您要的规则:」之类的开场白;等它想收尾时,你设的停止词直接掐断,连结尾的客套话也省了。这样前后端对接时就不用再写一堆「正则提取 JSON」的脏活。
