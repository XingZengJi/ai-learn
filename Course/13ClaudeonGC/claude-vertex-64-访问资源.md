# Claude with Google Vertex - 64 Accessing resources 访问资源

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 64
> 课程: Claude with Google Vertex · 第 64 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

MCP 的资源让服务器能暴露可以**直接放进提示词**的数据,而不必通过工具调用去取。这为给 Claude 这类模型提供上下文创造了一条更高效的路径。

## Understanding the Resource Flow 理解资源流程

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621196%2F09_-_008_-_Accessing_Resources_00.1748621196428.png)

用户想访问资源内容时,流程是这样的:

1. 用户请求关于某个资源的信息(比如输入 `@report.pdf`)
2. 你的代码需要一份文档名列表来做自动补全
3. MCP 客户端向 MCP 服务器发出 `ReadResourceRequest`
4. 服务器返回含资源数据的 `ReadResourceResult`
5. 你的代码把这些数据直接放进提示词

## Implementing Resource Reading 实现资源读取

要在 MCP 客户端里读资源,需要实现一个 `read_resource` 函数。先加上必要的导入:

```python
import json
from pydantic import AnyUrl
```

核心函数向 MCP session 发出请求并处理响应:

```python
async def read_resource(self, uri: str) -> Any:
    result = await self.session().read_resource(AnyUrl(uri))
    resource = result.contents[0]
```

## Handling Different Resource Types 处理不同的资源类型

资源可能返回不同类型的内容,所以要检查 MIME 类型再相应解析:

```python
if isinstance(resource, types.TextResourceContents):
    if resource.mimeType == "application/json":
        return json.loads(resource.text)
    
    return resource.text
```

这覆盖了两种主要情况:

- 需要解析的 JSON 资源
- 可以原样返回的纯文本资源

## Testing Resource Access 测试资源访问

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621197%2F09_-_008_-_Accessing_Resources_09.1748621197182.png)

在应用里测试即可验证实现是否正确。输入 `@` 加资源名时,应该看到可用资源的自动补全列表; 选中某一项后,它的内容会直接进入你的提示词。

这种做法的关键优势是**效率**——Claude 立刻拿到文档内容,不需要额外的工具调用去获取信息。

## Resource vs Tool Usage 资源与工具的取舍

资源在这些情况下特别有用:

- 你有静态或半静态、被频繁引用的内容
- 你想减少 API 调用次数
- 内容应该立即出现在提示词上下文里

而工具更适合动态操作,或者需要 AI 根据对话上下文自行判断要不要去取某些信息的场合。
