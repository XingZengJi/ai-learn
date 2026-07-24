# Building with the Claude API - 55 Defining tools with MCP 用 MCP 定义工具

> Course: Building with the Claude API · Lesson 55
> 课程: Building with the Claude API · 第 55 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

用官方 Python SDK 搭建 MCP 服务器,会简单得多。你不需要手动为工具编写复杂的 JSON schema——SDK 通过装饰器和类型提示,替你把这些复杂性都处理好了。

在这个例子里,我们要搭建一个管理内存中文档的 MCP 服务器。这个服务器会提供两个核心工具:一个用来读取文档内容,另一个通过「查找并替换」的方式来更新文档。

## 搭建 MCP 服务器

Python MCP SDK 让创建服务器变得非常简单,一行代码就能初始化一个完整的 MCP 服务器:

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("DocumentMCP", log_level="ERROR")
```

在这个实现里,文档存储在一个简单的 Python 字典里,键是文档 ID,值是文档内容:

```python
docs = {
    "deposition.md": "This deposition covers the testimony of Angela Smith, P.E.",
    "report.pdf": "The report details the state of a 20m condenser tower.",
    "financials.docx": "These financials outline the project's budget and expenditure",
    "outlook.pdf": "This document presents the projected future performance of the",
    "plan.md": "The plan outlines the steps for the project's implementation.",
    "spec.txt": "These specifications define the technical requirements for the equipment"
}
```

## 用装饰器定义工具

SDK 把创建工具这件事,从一个冗长的过程变成了简洁易读的代码。你不需要写又长又复杂的 JSON schema,只需要用 Python 的装饰器和类型提示。

### 创建「读文档」工具

第一个工具让 Claude 能通过文档 ID 读取任意文档。完整实现如下:

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

`@mcp.tool` 装饰器会自动生成 Claude 需要的 JSON schema。来自 Pydantic 的 `Field` 类提供了参数说明,帮 Claude 理解每个参数期望的是什么。

### 搭建「编辑文档」工具

第二个工具在文档上执行简单的「查找并替换」操作:

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

这个工具接受三个参数:文档 ID、要查找的文本、替换后的文本。为了简单起见,实现里直接用了 Python 内置的字符串 `replace()` 方法。

## 错误处理

两个工具都包含基础的错误处理,用来应对「Claude 请求了一个不存在的文档」这种情况。当传入的文档 ID 无效时,工具会抛出一个带有描述性信息的 `ValueError`,Claude 能理解这条信息,并据此采取相应行动。

## SDK 方式的关键优势

- 从 Python 类型提示自动生成 JSON schema
- 代码简洁易读,便于维护
- 通过 Pydantic 内置参数校验
- 相比手写 schema,样板代码大幅减少
- 开发时有类型安全和 IDE 支持

Python MCP SDK 把过去那种「手写工具定义」的复杂过程,变成了一种对 Python 开发者来说非常自然的写法。你只需要专注业务逻辑,协议层面的细节都交给 SDK 处理。

---

对产品经理来说,这一课演示了「好的开发者工具」应该长什么样:把繁琐、容易出错的重复劳动(手写 JSON schema)自动化掉,让工程师专注在真正有价值的业务逻辑上(读文档、编辑文档的具体规则)。评估一个新技术栈或 SDK 值不值得团队投入学习成本时,这种「减少多少样板代码」是一个很实际的判断维度。
