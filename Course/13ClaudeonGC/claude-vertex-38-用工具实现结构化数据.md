# Claude with Google Vertex - 38 Tools for structured data 用工具实现结构化数据

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 38
> 课程: Claude with Google Vertex · 第 38 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

需要从 Claude 拿结构化数据时,主要有两条路: 基于提示词的技巧(消息预填 + 停止序列),或者更稳健的做法——用工具。前者搭起来更简单,后者输出更可靠,代价是多一些复杂度。

## Tools for Structured Data 用工具拿结构化数据

工具方案的原理是: 写一份 JSON schema,精确定义你想抽取的数据结构。你不再是「祈祷 Claude 把格式写对」,而是给了它一个函数去调用,函数的参数正好就是你想要的输出结构。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620028%2F06_-_011_-_Tools_for_Structured_Data_03.1748620028103.png)

流程:

1. 写一份描述目标数据结构的 schema
2. 用 `tool_choice` 参数**强制** Claude 使用工具
3. 从工具使用响应里取出结构化数据
4. **不需要**再发后续响应——拿到数据就结束了

比如你想从一份财报里抽取余额和关键洞察,schema 就把它们分别定义成整数和字符串数组。

## Controlling Tool Use 控制工具使用

这个技巧的关键一环是**确保 Claude 真的调用了你的工具**。用 `tool_choice` 参数来控制:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620029%2F06_-_011_-_Tools_for_Structured_Data_09.1748620028978.png)

- `{"type": "auto"}` —— 模型自己决定要不要用工具(默认)
- `{"type": "any"}` —— 模型必须用工具,但可以自己选用哪个
- `{"type": "tool", "name": "TOOL_NAME"}` —— 模型必须用指定的那个工具

做结构化数据抽取时,通常用第三种,以保证 Claude 一定调用你那个 schema 工具。

## Implementation Example 实现示例

假设你要从一篇文章里抽取标题、作者和关键洞察。先建工具 schema:

```python
article_summary_schema = {
    "name": "article_summary",
    "description": "Extracts structured data from articles",
    "input_schema": {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "author": {"type": "string"},
            "key_insights": {
                "type": "array",
                "items": {"type": "string"}
            }
        }
    }
}
```

然后带上工具并强制使用:

```python
response = chat(
    messages,
    tools=[article_summary_schema],
    tool_choice={"type": "tool", "name": "article_summary"}
)
```

响应里会有一个工具使用块,你要的结构化数据就在它的 `input` 字段里,直接取:

```python
structured_data = response.content[0].input
```

## When to Use Each Approach 什么时候用哪种

需要**快速简单**时用基于提示词的结构化输出; 需要**有保障的可靠性**、且能承受额外配置复杂度时用工具。两种技巧都有价值,取决于你的具体场景和要求。

对产品经理来说: 这里有个很值得记住的巧思——**工具被当成了"输出格式约束器"来用,而不是真的去执行什么动作**。Claude 调用这个工具,你的代码根本不需要实现它,拿到参数就完事了。这个模式对「文档信息抽取」类需求特别合适: 想要什么字段,就在 schema 里定义什么字段,可靠性远高于让模型自由输出 JSON 再去解析。
