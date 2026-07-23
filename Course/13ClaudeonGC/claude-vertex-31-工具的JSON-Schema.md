# Claude with Google Vertex - 31 Tool schemas 工具的 JSON Schema

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 31
> 课程: Claude with Google Vertex · 第 31 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

写完工具函数,下一步是写一份 JSON schema,告诉 Claude 这个函数需要什么参数、该怎么用。这份 schema 就是 Claude 用来理解「何时调用、如何调用」的说明书。

## Understanding JSON Schema 理解 JSON Schema

JSON Schema 不是 AI 或工具调用专属的东西——它是一个存在多年、被广泛使用的数据校验规范。AI 社区采用它,是因为它恰好很适合描述函数参数并校验数据。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619697%2F06_-_004_-_Tool_Schemas_01.1748619697769.png)

一份完整的工具规格有三个主要部分:

- **name** —— 函数名(如 `"get_weather"`)
- **description** —— 这个工具做什么、什么时候用
- **input_schema** —— 描述参数的实际 JSON schema

## Writing Effective Descriptions 写好 description

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619698%2F06_-_004_-_Tool_Schemas_02.1748619698251.png)

`description` 字段对 Claude 理解你的工具至关重要。遵循这几条:

- 说清楚工具做什么、什么时候用、返回什么
- 目标篇幅 3–4 句话
- **每个参数也要写详细描述**

`input_schema` 部分用标准 JSON Schema 格式描述函数参数,包括类型信息和每个参数的详细说明。

## The Easy Way: Let Claude Write Your Schema 省事的办法: 让 Claude 帮你写

与其从零手写 JSON schema,不如让 Claude 自己生成。流程:

1. 复制你的工具函数
2. 打开 Claude,让它为工具调用写一份 JSON schema
3. 把 Anthropic 关于工具使用的官方文档作为上下文一并附上
4. 让 Claude 按最佳实践生成格式正确的 schema

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619699%2F06_-_004_-_Tool_Schemas_13.1748619699594.png)

提示词大致这么写: "Write a valid JSON schema spec for the purposes of tool calling for this function. Follow the best practices listed in the attached documentation."

## Implementing the Schema in Code 把 schema 写进代码

Claude 生成好之后,复制进你的代码文件。用统一的命名模式(如 `函数名_schema`)保持条理:

```python
get_current_datetime_schema = {
    "name": "get_current_datetime",
    "description": "Returns the current date and time formatted according to the specified format",
    "input_schema": {
        "type": "object",
        "properties": {
            "date_format": {
                "type": "string",
                "description": "A string specifying the format of the returned datetime. Uses Python's strftime format codes.",
                "default": "%Y-%m-%d %H:%M:%S"
            }
        },
        "required": []
    }
}
```

## Adding Type Safety 加上类型安全

想要更好的类型检查,可以从 Anthropic 库里导入并使用 `ToolParam` 类型:

```python
from anthropic.types import ToolParam

get_current_datetime_schema = ToolParam({
    # 你的 schema 字典
})
```

功能上这不是必需的,但它能避免你后续在代码里用这份 schema 时出现类型错误。

一个写得好的工具函数,加上一份详尽的 JSON schema,就给了 Claude 在对话中理解并正确使用工具所需的全部信息。

对产品经理来说: 注意 `description` 才是决定「Claude 会不会在对的时机调用这个工具」的关键,而不是函数名或代码质量。这意味着**工具的描述文案本身就是产品设计的一部分**——它是写给模型看的产品说明书。工具没被调用或被误调用时,先去看这段文案,而不是先去查代码。
