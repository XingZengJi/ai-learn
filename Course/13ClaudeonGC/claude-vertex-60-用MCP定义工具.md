# Claude with Google Vertex - 60 Defining tools with MCP 用 MCP 定义工具

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 60
> 课程: Claude with Google Vertex · 第 60 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

用官方 Python SDK 来做 MCP 服务器会简单很多。你不必手写复杂的 JSON schema,用装饰器定义工具即可,剩下的重活交给 SDK。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621145%2F09_-_004_-_Defining_Tools_with_MCP_00.1748621145257.png)

本例要做一个文档管理服务器,含两个核心工具: 读文档、改文档。所有文档以一个简单字典的形式存在内存里,键是文档 ID,值是内容。

## Setting Up the MCP Server 搭建 MCP 服务器

Python MCP SDK 让建服务器变得直截了当,一行就能初始化:

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("DocumentMCP", log_level="ERROR")
```

这就创建了一个功能完整的 MCP 服务器,能处理工具定义、客户端连接和消息路由。

## Tool Definition with Decorators 用装饰器定义工具

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621146%2F09_-_004_-_Defining_Tools_with_MCP_05.1748621146306.png)

SDK 的装饰器方式免去了手写 JSON schema。定义一个简单工具:

```python
@mcp.tool(
    name="add_ints",
    description="Add two integers together",
)
def tool_fn(
    a=Field(description="First number to add"),
    b=Field(description="Second number to add"),
) -> int:
    return a + b
```

在幕后,MCP 会生成 Claude 理解「何时用、怎么用」这个工具所需的完整 schema。

## Building the Document Reader Tool 做读取文档的工具

第一个工具按 ID 读取文档内容: 接收文档标识符,从内存字典里返回对应内容:

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

函数里带了基础错误处理,拦住对不存在文档的请求。Claude 用合法的文档 ID 调用它时,会拿到文档全文字符串。

## Creating the Document Editor Tool 做编辑文档的工具

第二个工具做简单的查找替换,需要三个参数: 文档 ID、要查找的文本、替换后的文本:

```python
@mcp.tool(
    name="edit_document",
    description="Edit a document by replacing a string in the documents content with a new string."
)
def edit_document(
    doc_id: str = Field(description="Id of the document that will be edited"),
    old_str: str = Field(description="The text to replace. Must match exactly, including white space."),
    new_str: str = Field(description="The new text to insert in place of the old text.")
):
    if doc_id not in docs:
        raise ValueError(f"Doc with id {doc_id} not found")
    
    docs[doc_id] = docs[doc_id].replace(old_str, new_str)
```

这个实现用 Python 内置的字符串 `replace` 方法,要求**包括空白在内的精确匹配**。工具直接在字典里原地修改文档。

## Key Benefits of the SDK Approach SDK 方式的主要好处

- 不用手写 JSON schema
- 类型注解自动提供参数校验
- Field 描述帮助 Claude 理解工具用法
- 错误处理与 Python 异常天然衔接
- 装饰器自动完成工具注册

MCP Python SDK 把工具创建从一件复杂的写 schema 的活,变成了直白的 Python 函数定义。你的工具更好维护、更易测试,同时 Claude 拿到了有效使用它们所需的全部元数据。

对产品经理来说: 注意 `edit_document` 那个「必须精确匹配,包括空白」的约束。这是个典型的**用工具设计来控制风险**的例子: 相比「让 AI 重写整份文档」,「让它指明替换哪一段」出错时的破坏面小得多,也更容易审计。设计任何让 AI 修改数据的功能时,这个「最小改动粒度」的取舍值得先想清楚。
