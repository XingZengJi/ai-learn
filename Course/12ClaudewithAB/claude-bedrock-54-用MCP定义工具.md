# Claude with AWS Bedrock - 54 Defining tools with MCP 用 MCP 定义工具

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 54
> 课程: Claude with AWS Bedrock · 第 54 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

用官方 Python SDK 来搭 MCP 服务器会简单很多。你不必手写复杂的工具 JSON schema,而是用装饰器把工具定义出来,重活交给 SDK。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559694%2F11_-_004_-_Defining_Tools_with_MCP_00.1748559694628.png)

本例要做的是一个管理文档操作的 MCP 服务器,包含两个主要工具: 读文档内容、更新文档内容。所有文档以字典形式存在内存里,键是文档 ID,值是内容字符串。

## MCP Python SDK Benefits Python SDK 的好处

MCP 项目为多种编程语言提供了构建服务器和客户端的官方 SDK。用 Python SDK 的好处包括:

- 用极少的样板代码就能创建 MCP 服务器
- 从 Python 函数签名**自动生成** JSON schema
- 通过装饰器简化工具定义
- 处理类型校验和错误处理

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559695%2F11_-_004_-_Defining_Tools_with_MCP_05.1748559695107.png)

`@mcp.tool` 装饰器配合类型标注和字段描述,会自动生成 Claude 能理解并使用的正确工具 schema。

## Setting Up the Server 搭建服务器

基础服务器只需要几行:

```python
from mcp.server.fastmcp import FastMCP
from pydantic import Field

mcp = FastMCP("DocumentMCP", log_level="ERROR")

docs = {
    "deposition.md": "This deposition covers the testimony of Angela Smith, P.E.",
    "report.pdf": "The report details the state of a 20m condenser tower.",
    "financials.docx": "These financials outline the project's budget and expenditures",
    "outlook.pdf": "This document presents the projected future performance of the system",
    "plan.md": "The plan outlines the steps for the project's implementation.",
    "spec.txt": "These specifications define the technical requirements for the equipment"
}
```

> 代码在做什么: 创建一个名为 `DocumentMCP` 的 MCP 服务器实例,日志级别设为 ERROR(少输出噪音); 然后用一个普通的 Python 字典充当「文档数据库」,六个键就是六份假文档。

## Implementing the Read Tool 实现读取工具

第一个工具让 Claude 通过文档 ID 读取内容:

```python
@mcp.tool(
    name="read_doc_contents",
    description="Read the contents of a document and return it as a string."
)
def read_document(
    doc_id: str = Field(description="Id of the document to read")
):
    if doc_id not in docs:
        raise ValueError(f"Doc with id {doc_id} not found")

    return docs[doc_id]
```

工具定义包含四要素:

- 一个清楚说明动作的名称
- 一段解释该工具做什么的描述
- 带字段描述的、有类型标注的参数
- 针对无效文档 ID 的错误处理

## Implementing the Edit Tool 实现编辑工具

第二个工具对文档内容做简单的查找替换:

```python
@mcp.tool(
    name="edit_document",
    description="Edit a document by replacing a string in the documents content with a new string."
)
def edit_document(
    doc_id: str = Field(description="Id of the document that will be edited"),
    old_str: str = Field(description="The text to replace. Must match exactly, including whitespace."),
    new_str: str = Field(description="The new text to insert in place of the old text.")
):
    if doc_id not in docs:
        raise ValueError(f"Doc with id {doc_id} not found")

    docs[doc_id] = docs[doc_id].replace(old_str, new_str)
```

> 代码在做什么: 接收三个参数——文档 ID、要找的文本、替换成的文本; 实现上直接用 Python 内置的字符串 `replace()` 方法。注意 `old_str` 的描述里特意写明「必须完全匹配,包括空白字符」——这类约束写进描述里,Claude 才会照做。

## Key Implementation Details 关键实现要点

用 MCP SDK 定义工具时记住这几条:

- 从 pydantic 导入 `Field` 来给参数加描述
- 用类型标注指定参数类型
- 为边界情况加上错误处理
- 工具的名称和描述要写得清晰、有说明性
- SDK 会自动把你的函数签名转换成正确的 JSON schema

相比手写 JSON schema,MCP Python SDK 把创建工具的复杂度大幅降低了: 过去要几十行 schema 定义的事,现在只要几行带装饰器的 Python 函数。

对产品经理来说: 这一课其实呼应了第 25 课「工具的 JSON Schema」——那时候要手写的东西,现在 SDK 从函数签名自动推导出来了。但**描述文字仍然要人写**,而且质量直接决定 Claude 用不用得对工具。这部分不是技术活,是产品说明书的活儿。
