# Building with the Claude API - 58 Defining resources 定义资源

> Course: Building with the Claude API · Lesson 58
> 课程: Building with the Claude API · 第 58 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

MCP 服务器里的资源(resources),让你能向客户端暴露数据,类似于普通 HTTP 服务器里的 GET 请求处理函数。它们特别适合「你需要获取信息,而不是执行某个操作」的场景。

## 通过一个例子理解资源

假设你想搭建一个「文档提及」功能,用户可以输入 `@文档名` 来引用文件。这需要两个操作:

1. 获取所有可用文档的列表(用于自动补全)
2. 获取某个具体文档的内容(当它被提及时)

当用户输入 `@` 时,你需要展示可用的文档列表。当他们提交一条带提及的消息时,你要自动把那份文档的内容注入到发给 Claude 的提示词里。

## 资源是如何运作的

资源遵循「请求-响应」模式。你的客户端发送一个带 URI 的 `ReadResourceRequest`,MCP 服务器返回对应的数据。这个 URI 就像是你想访问的资源的地址。

## 资源的类型

资源分两种类型:

- **直接资源(Direct Resources)**:静态的、不会变化的 URI,比如 `docs://documents`
- **模板化资源(Templated Resources)**:带参数的 URI,比如 `docs://documents/{doc_id}`

对于模板化资源,Python SDK 会自动从 URI 里解析出参数,把它们作为关键字参数传给你的函数。

## 实现资源

资源是用 `@mcp.resource()` 装饰器来定义的。下面是两种类型各自的实现方式:

### 直接资源(列出文档)

```python
@mcp.resource(
    "docs://documents",
    mime_type="application/json"
)
def list_docs() -> list[str]:
    return list(docs.keys())
```

### 模板化资源(获取文档)

```python
@mcp.resource(
    "docs://documents/{doc_id}",
    mime_type="text/plain"
)
def fetch_doc(doc_id: str) -> str:
    if doc_id not in docs:
        raise ValueError(f"Doc with id {doc_id} not found")
    return docs[doc_id]
```

## MIME 类型

资源可以返回任意类型的数据——字符串、JSON、二进制等等。`mime_type` 参数给客户端一个提示,让它知道你返回的是什么类型的数据:

- `application/json` —— 结构化的 JSON 数据
- `text/plain` —— 纯文本内容
- 其他任意合法的 MIME 类型,对应不同的数据格式

Python MCP SDK 会自动序列化你的返回值,你不需要手动转换成 JSON 字符串。

## 测试资源

你可以用 MCP Inspector 来测试你的资源。用这个命令运行服务器:

```bash
uv run mcp dev mcp_server.py
```

然后在浏览器里连接检查器,你会看到:

- **Resources**:列出你的直接/静态资源
- **Resource Templates**:展示接受参数的模板化资源

点击任意一个资源来测试它,查看客户端将会收到的确切响应结构。

## 关键要点

- 资源用来暴露数据,工具用来执行操作
- 静态数据用直接资源,需要参数的查询用模板化资源
- MIME 类型帮助客户端理解响应的格式
- SDK 自动处理序列化
- 模板化 URI 里的参数名,会变成函数的参数

资源提供了一种干净的方式,让数据能被 MCP 客户端获取到——无论是「文档提及」功能、文件浏览,还是任何「需要从服务器取数据」的场景。

---

对产品经理来说,「资源」和「工具」的区别,对应产品设计里「查询」和「操作」的区别——就像一个 API 里 GET 请求(查数据,没有副作用)和 POST/PUT 请求(改数据,有副作用)不是一回事。理清这个区分,能帮你更准确地跟工程团队沟通需求:「这个功能是要展示信息」还是「要执行一个动作」,决定了它该被建模成资源还是工具。
