# Claude with Google Vertex - 13 Structured data 结构化数据

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 13
> 课程: Claude with Google Vertex · 第 13 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

当你需要 Claude 生成 JSON、Python 代码、要点列表这类结构化数据时,常会碰到一个问题: Claude 出于「想帮上忙」的本能,会在内容前后加上解释性文字。多数时候这挺好,但有时你只要**裸数据**,别的都不要。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619492%2F03_-_011_-_Structured_Data_02.1748619492360.png)

设想你在做一个生成 AWS EventBridge 规则的 Web 应用。用户输入描述、点击生成,期待看到一段可以直接复制使用的干净 JSON。如果 Claude 返回的 JSON 被 markdown 代码块包着,前后还有说明性的开场白和结语,用户就没法一键「全选复制」——得手动去框选 JSON 那一段。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619493%2F03_-_011_-_Structured_Data_05.1748619492885.png)

只要是生成结构化数据的场景,都会遇到这个模式。Claude 天然想解释自己做了什么,而很多时候你只想要你要的那部分内容,一个字都不多。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619493%2F03_-_011_-_Structured_Data_06.1748619493294.png)

## Combining Stop Sequences with Assistant Message Prefilling 停止序列 + 预填 assistant 消息

解法是把前面学过的两个技巧组合起来。实际写法:

```python
messages = []

add_user_message(messages, "Generate a very short event bridge rule as json")
add_assistant_message(messages, "```json")

text = chat(messages, stop_sequences=["```"])
```

运行后拿到的就是纯 JSON 内容,没有 markdown 格式,也没有额外的解说。

## How It Works Behind the Scenes 背后发生了什么

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619493%2F03_-_011_-_Structured_Data_15.1748619493726.png)

Claude 处理这个请求的过程:

1. 读到你的 user 消息,想「我要写一份完整规则,大概还得描述一下」
2. 看到预填的 assistant 消息,认为自己已经开始写 JSON 代码块了
3. 于是想「哦,JSON 那部分我已经起头了,现在只需要写实际的 JSON 内容」
4. 生成 JSON 内容
5. 当它想用 ``` 收尾关闭代码块时,撞上停止序列,生成立即终止

结果就是: 你拿到的正好是「预填开头」到「停止序列」之间的部分——恰好是你要的内容。

## Cleaning Up the Output 清理输出

返回的文本可能带一些多余换行,很容易处理:

```python
import json

# 解析成 JSON,顺便做校验和格式化
parsed_json = json.loads(text.strip())
```

这个技巧适用于任何结构化数据格式,不限于 JSON。无论是生成 Python 代码、要点列表还是别的特定格式,都可以用预填 assistant 消息来定起点,用停止序列来定终点。

这套做法让你精确控制 Claude 的输出格式,保证应用拿到的是干净可用的数据,不会被多余的格式或解说干扰后续处理。

对产品经理来说: 这一课解决的是一个非常具体的体验问题——「用户能不能一键复制」。值得注意的是解法的形态: 不是让工程师写代码去**清洗**模型输出,而是从源头**约束**模型只输出该输出的部分。后面「工具使用」那几课里还有一个更稳妥的做法(用工具 schema 强制结构),这里的技巧更轻,适合快速搭原型。
