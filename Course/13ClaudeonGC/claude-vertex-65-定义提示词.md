# Claude with Google Vertex - 65 Defining prompts 定义提示词

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 65
> 课程: Claude with Google Vertex · 第 65 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

MCP 服务器里的**提示词(prompts)** 让你能定义预先做好的、高质量的指令,客户端直接拿来用,不必自己从零写。可以把它们看作精心打磨过的模板,效果比用户自己临场想的要好。

## Why Use Prompts? 为什么要用它

假设你想让 Claude 把一份文档重排成 markdown。用户可以直接输入 "convert report.pdf to markdown",结果也还行。但如果用的是你专为文档格式化设计、经过充分测试的专用提示词,输出会好得多。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621250%2F09_-_009_-_Defining_Prompts_07.1748621249977.png)

关键认知是: 用户当然能自己完成这些任务,但用上 MCP 服务器作者精心设计和测试过的提示词,结果会明显更好。

## How Prompts Work 提示词怎么工作

提示词定义一组 user 和 assistant 消息,客户端可以直接使用。客户端请求某个提示词时,你的服务器返回一份可以直接发给 Claude 的消息列表。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621251%2F09_-_009_-_Defining_Prompts_09.1748621251776.png)

基本结构:

```python
@mcp.prompt(
    name="format",
    description="Rewrites the contents of a document in Markdown format",
)
def format_document(
    doc_id: str = Field(description="Id of the document to format"),
) -> list[base.Message]:
    # 返回一个消息列表
```

## Building a Format Command 做一个 format 命令

一个实际例子。我们做一个 format 命令,用户输入 `/format doc_id` 就能把任意文档重排成 markdown 语法。

提示词实现里包含给 Claude 的详细指令:

```python
def format_document(
    doc_id: str = Field(description="Id of the document to format"),
) -> list[base.Message]:
    prompt = f"""
Your goal is to reformat a document to be written with markdown syntax.

The id of the document you need to reformat is:

{doc_id}

Add in headers, bullet points, tables, etc as necessary. Feel free to add in structure.
Use the 'edit_document' tool to edit the document. After the document has been reformatted...
"""
    
    return [
        base.UserMessage(prompt)
    ]
```

## Testing Your Prompts 测试提示词

用 MCP Inspector 测试即可。切到 Prompts 标签页,选中你的提示词,填入所需参数。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621253%2F09_-_009_-_Defining_Prompts_18.1748621252474.png)

检查器会准确展示将要发给 Claude 的消息,包括参数是怎么被插值进提示词文本的。

## Key Benefits 主要收益

- **质量可控** —— 你可以在用户看到之前先测试和打磨提示词
- **一致性** —— 用户每次都能得到可靠的结果
- **专业化** —— 提示词可以针对你服务器的特定领域量身定制
- **可复用** —— 多个客户端可以共用同一批打磨好的提示词

## Implementation Details 实现细节

别忘了导入消息类型所需的 base 模块:

```python
from mcp.server.fastmcp import FastMCP
from mcp.server.fastmcp.prompts import base
```

提示词应当高质量、经过充分测试,并且与你 MCP 服务器的整体用途相关。在这个文档管理的例子里,格式化提示词非常合适,因为这台服务器本就专注于文档操作。

对产品经理来说: MCP 的 prompts 本质上是**把提示词工程的成果产品化**。你团队里调了两周的那个提示词,不必只留在自家应用里,可以随 MCP 服务器分发出去,让所有接入方直接受益。这也提示了一种能力封装方式: 你的领域知识可以打包成 prompts,成为服务的一部分,而不只是内部资产。
