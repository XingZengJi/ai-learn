# Building with the Claude API - 28 Tool schemas 工具 Schema

> Course: Building with the Claude API · Lesson 28
> 课程: Building with the Claude API · 第 28 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

写好工具函数之后,下一步是创建一份 JSON schema,告诉 Claude 这个函数需要什么参数、该怎么使用。这份 schema 相当于说明书,Claude 会读它来理解「什么时候」「怎么」调用你的工具。

## 理解 JSON Schema

JSON Schema 并不是 AI 或工具调用专属的东西——它是一套已经存在多年、被广泛使用的数据校验规范。AI 社区之所以采用它,是因为它是一种描述函数参数、校验数据的便捷方式。

完整的工具规格说明由三个主要部分组成:

- **name** —— 工具的清晰、有描述性的名字(比如 `get_weather`)
- **description** —— 这个工具做什么、什么时候该用它、会返回什么
- **input_schema** —— 描述函数参数的实际 JSON schema

## 写出有效的描述

工具描述(description)对于帮助 Claude 理解「什么时候该用这个函数」至关重要。最佳实践包括:

- 用 3-4 句话说明这个工具是做什么的
- 说明 Claude 什么时候应该用它
- 解释它会返回什么样的数据
- 为每个参数提供详细说明

## 生成 Schema 的简便方法

与其从零手写 JSON schema,你完全可以用 Claude 本身来生成。步骤如下:

1. 复制你的工具函数代码
2. 打开 Claude,让它为工具调用写一份 JSON schema
3. 把 Anthropic 关于工具使用的官方文档作为上下文一并提供
4. 让 Claude 按最佳实践生成一份格式规范的 schema

提示词大致可以这样写:「请为这个函数写一份用于工具调用的有效 JSON schema 规范,遵循附带文档中列出的最佳实践。」

## 在代码中实现 Schema

Claude 生成 schema 之后,把它复制进你的代码文件。推荐遵循这样的命名模式:

```python
def get_current_datetime(date_format="%Y-%m-%d %H:%M:%S"):
    if not date_format:
        raise ValueError("date_format cannot be empty")
    return datetime.now().strftime(date_format)

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

用「函数名」加「函数名_schema」这样的命名模式,能让你的 schema 保持整洁、方便和对应的函数一一对应。

## 加上类型安全

为了获得更好的类型检查,可以引入并使用 Anthropic 库里的 `ToolParam` 类型:

```python
from anthropic.types import ToolParam

get_current_datetime_schema = ToolParam({
    "name": "get_current_datetime",
    "description": "Returns the current date and time formatted according to the specified format",
    # ... 其余 schema 内容
})
```

虽然这对功能本身不是必需的,但它能在你把这份 schema 用于 Claude API 时避免类型错误,让代码更健壮。

---

对产品经理来说,工具 schema 就是那份「接口文档」——不只是告诉团队(这里是 Claude)有这么个工具存在,还要写清楚它是干什么的、什么时候该用、每个入参是什么含义。而「让 Claude 帮你写这份文档」这件事本身也值得记住:很多结构化的技术文档,与其自己从零憋,不如把上下文喂给 Claude,让它按标准模板产出草稿,你再核对。
