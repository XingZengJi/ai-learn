# Claude with Google Vertex - 63 Defining resources 定义资源

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 63
> 课程: Claude with Google Vertex · 第 63 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

MCP 服务器里的**资源(resources)** 用来把数据暴露给客户端,类似于普通 HTTP 服务器里的 GET 请求处理器。当你需要的是「取信息」而不是「做动作」时,它是最合适的选择。

## Understanding Resources 理解资源

可以把资源想成只读接口,能返回任意类型的数据——字符串、JSON、二进制文件等。你设置一个 `mime_type` 来提示客户端返回的是什么类型的数据。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621200%2F09_-_007_-_Defining_Resources_04.1748621200061.png)

资源的工作方式是: 定义一个 URI(类似 URL)供客户端请求。客户端需要数据时,发出带特定 URI 的 `ReadResourceRequest`,你的服务器返回含数据的 `ReadResourceResult`。

## Two Types of Resources 两类资源

- **直接资源(Direct Resources)** —— URI 是静态的,不含参数(如 `"docs://documents"`)
- **模板资源(Templated Resources)** —— URI 里含参数,会被解析后传给你的函数(如 `"docs://documents/{doc_id}"`)

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621201%2F09_-_007_-_Defining_Resources_07.1748621201191.png)

对模板资源,Python SDK 会自动从 URI 里解析参数,并作为关键字参数传给你的函数。**URI 里的参数名必须与函数参数名完全一致。**

## Creating Resources 创建资源

两类资源的实现方式:

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

MCP Python SDK 会自动把你返回的东西序列化。你不需要手动把数据转成 JSON 字符串——直接返回 Python 对象,SDK 负责转换。

## Testing Your Resources 测试资源

可以用 MCP Inspector 测试。启动服务器后在浏览器里连接检查器,会看到两个区块:

- **Resources** —— 列出你的直接/静态资源
- **Resource Templates** —— 显示你的模板资源

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621202%2F09_-_007_-_Defining_Resources_18.1748621201948.png)

点击任意资源即可测试。模板资源需要你填入参数值。检查器会展示客户端将收到的确切响应结构,包括 mime type 和序列化后的数据。

## Practical Use Cases 实际用例

资源特别适合实现聊天应用里的「文档提及」这类功能。比如用户输入 `@` 来提及某份文档时,你可以:

- 用**直接资源**取回全部可用文档的列表,做自动补全
- 用**模板资源**在文档被提及时取回它的具体内容

这种做法让你能**预先**把文档内容注入提示词,而不必让 AI 通过工具去取。

对产品经理来说: 「资源 vs 工具」的区别其实是一个产品决策——**谁来决定要不要读这份文档**。用工具,是 AI 判断需要时才去读; 用资源,是用户在界面上明确指定(打了个 `@`)。后者更快、更可预测、成本更低,前者更灵活。用户意图明确的场景,优先用资源。
