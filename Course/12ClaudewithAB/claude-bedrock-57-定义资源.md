# Claude with AWS Bedrock - 57 Defining resources 定义资源

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 57
> 课程: Claude with AWS Bedrock · 第 57 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

MCP 服务器里的资源(resources)用来向客户端暴露数据,作用类似 HTTP 服务器里的 GET 请求处理器。当你要**取信息**而不是**执行动作**时,资源正合适。

## Understanding Resources 理解资源

可以把资源理解为只读端点,返回任意类型的数据——字符串、JSON、二进制文件都行。你通过设置 `mime_type` 告诉客户端返回的是什么类型的数据。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559689%2F11_-_007_-_Defining_Resources_04.1748559689710.png)

资源通过 URI(本质上就是地址)暴露数据。客户端需要数据时,发送一个 `ReadResourceRequest` 带上具体 URI,你的服务器返回对应信息。

## Two Types of Resources 两类资源

- **直接资源(Direct Resources)** —— URI 是静态的,不含参数,比如 `docs://documents`
- **模板资源(Templated Resources)** —— URI 里带参数,比如 `docs://documents/{doc_id}`

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559690%2F11_-_007_-_Defining_Resources_07.1748559690197.png)

对模板资源,Python SDK 会自动从 URI 里解析出参数,并作为关键字参数传给你的函数。**URI 里的参数名就是函数的参数名**。

## Implementing Resources 实现资源

用 `@mcp.resource()` 装饰器创建资源很直接,两类写法如下:

```python
@mcp.resource(
    "docs://documents",
    mime_type="application/json"
)
def list_docs() -> list[str]:
    return list(docs.keys())

@mcp.resource(
    "docs://documents/{doc_id}",
    mime_type="text/plain"
)
def fetch_doc(doc_id: str) -> str:
    if doc_id not in docs:
        raise ValueError(f"Doc with id {doc_id} not found")
    return docs[doc_id]
```

> 代码在做什么: 第一个是直接资源,返回全部文档 ID 的列表,声明为 JSON; 第二个是模板资源,URI 里的 `{doc_id}` 会被解析出来传进函数,返回该文档的纯文本内容。

MCP Python SDK 会自动序列化你返回的东西,不需要手动转成 JSON 字符串——直接返回合适的 Python 数据结构即可。

## Testing Your Resources 测试资源

可以用 MCP 检查器测试资源。用 `uv run mcp dev mcp_server.py` 启动服务器,再打开网页界面。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559690%2F11_-_007_-_Defining_Resources_18.1748559690720.png)

检查器把直接资源和模板资源**分开展示**: 直接资源在主「Resources」区,模板资源在「Resource Templates」下。点任意资源都能测试,看到服务器返回的确切结构。

## Practical Use Cases 实际用途

资源适合这些场景:

- 提供自动补全数据(比如文档列表)
- 获取文件内容或数据库记录
- 暴露配置数据
- 提供客户端需要的任何只读信息

核心优势在于: 资源让客户端能**主动**拉取数据,不必依赖工具调用或复杂交互。这使它非常适合像「文档提及」这类功能——用户一引用,内容就自动注入到提示词里。

对产品经理来说: 工具 vs 资源的分界,本质是「谁来决定要这份数据」。工具是 Claude 自己判断要调; 资源是你的应用代码判断要取。做需求时想清楚这一点,能避免把简单的取数做成一次多余的模型往返(既慢又贵)。
