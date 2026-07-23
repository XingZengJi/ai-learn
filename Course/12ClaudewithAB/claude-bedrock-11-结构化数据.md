# Claude with AWS Bedrock - 11 Structured Data 结构化数据

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 11
> 课程: Claude with AWS Bedrock · 第 11 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When you need Claude to generate structured data like JSON, Python code, or bulleted lists, you'll often run into a common problem: Claude wants to be helpful and add explanatory text, headers, or markdown formatting around your content. This extra commentary breaks the user experience when you just need the raw data.

> 当你需要 Claude 生成 JSON、Python 代码或项目符号列表这类结构化数据时,经常会遇到一个常见的问题:Claude 出于「想帮上忙」的天性,总喜欢在你的内容外面加上解释性文字、标题或 Markdown 格式。而当你只需要原始数据时,这些额外的说明反而会破坏用户体验。

Consider building a web app that generates AWS EventBridge rules. Users enter a description, click generate, and expect to see clean JSON they can immediately copy and use. If Claude returns the JSON wrapped in markdown code blocks with explanatory text, users can't simply copy the entire response - they have to manually select just the JSON portion.

> 假设你正在构建一个能生成 AWS EventBridge 规则的网页应用。用户输入一段描述,点击生成,期待看到一份干净的 JSON,能直接复制去用。如果 Claude 返回的 JSON 被包在 Markdown 代码块里、外面还带着解释性文字,用户就没法直接复制整段响应——他们得手动挑出 JSON 那部分。

对产品经理来说,这就像你让实习生「只要一份 Excel 数据文件」,对方却在邮件正文里写了一大段说明,还把文件粘贴在正文中间——你想要的是能直接下载使用的干净文件,而不是夹带了解释的「半成品」。这一课就是教你怎么让 Claude 也养成「只交干净成品」的习惯。

## The Problem with Default Responses 默认响应存在的问题

By default, Claude tends to format structured output like this:

> 默认情况下,Claude 倾向于把结构化输出格式化成这样:

```
# EventBridge Rule
```json
{
  "source": ["aws.ec2"],
  "detail-type": ["EC2 Instance State-change Notification"],
  "detail": {"state": ["running"]}
}
```
This rule captures EC2 instance state changes when instances start running or stop.
```

While this is great for documentation, it's problematic when you need just the JSON for programmatic use.

> 这种格式对写文档来说很不错,但当你只是想在程序里直接使用这份 JSON 时,就会造成麻烦。

## The Solution: Assistant Message Prefilling + Stop Sequences 解决方案:助手消息预填充 + 停止序列

You can combine assistant message prefilling with stop sequences to get exactly the content you want. Here's how it works:

> 你可以把助手消息预填充和停止序列结合起来,精确拿到你想要的内容。具体做法如下:

```python
messages = []
add_user_message(messages, "Generate a very short event bridge rule as json")
add_assistant_message(messages, "```json")

text = chat(messages, stop_sequences=["```"])
```

This technique works by:

> 这项技巧的运作方式是:

- Prefilling the assistant message with the opening markdown delimiter. 用 Markdown 的起始分隔符来预填充助手消息。
- Setting a stop sequence to halt generation when Claude tries to close the code block. 设置一个停止序列,当 Claude 试图闭合代码块时立刻停止生成。
- Capturing only the content between these delimiters. 只截取这两个分隔符之间的内容。

## How It Works Behind the Scenes 幕后运作原理

When Claude receives your request, it sees the prefilled assistant message and assumes it already started writing the JSON code block. Instead of adding its own header and opening delimiter, Claude jumps straight to generating the actual JSON content.

> 当 Claude 收到你的请求时,它看到了这条预填充的助手消息,于是「以为」自己已经开始在写 JSON 代码块了。它不会再自己加标题和起始分隔符,而是直接跳到生成真正的 JSON 内容。

When Claude finishes the JSON and naturally wants to close the markdown code block with ` ``` `, the stop sequence immediately halts generation and returns the response. You get just the JSON content with no extra formatting.

> 当 Claude 写完 JSON、准备用 ` ``` ` 自然地闭合这个 Markdown 代码块时,停止序列会立刻中断生成,并返回结果。你得到的就只是纯粹的 JSON 内容,没有任何多余的格式。

## Processing the Results 处理返回结果

The returned text might contain some newline characters, but you can easily clean this up:

> 返回的文本可能会带有一些换行符,不过很容易清理:

```python
import json

# Parse as JSON to validate and format
parsed_data = json.loads(text.strip())

# Or just strip whitespace for other data types
clean_text = text.strip()
```

## Beyond JSON 不只限于 JSON

This technique isn't limited to JSON generation. You can use it for any structured data where you want just the content without Claude's natural tendency to add explanatory text:

> 这项技巧并不局限于生成 JSON。任何你只想要纯内容、不想被 Claude「自带解释文字」的结构化数据场景,都可以用上它:

- Python code snippets Python 代码片段
- Bulleted lists 项目符号列表
- CSV data CSV 数据
- Configuration files 配置文件
- Any format where clean, copyable output matters 任何看重「干净、可直接复制」输出的格式

The key is identifying what delimiters Claude would naturally use around your content type, then prefilling the opening delimiter and stopping at the closing one. This gives you precise control over the output format while leveraging Claude's natural formatting instincts.

> 关键在于:先弄清楚 Claude 通常会用什么分隔符来包裹你这类内容,然后预填充起始分隔符、在闭合分隔符处停止。这样你既能精确控制输出格式,又能顺势利用 Claude 天生的格式化本能。
