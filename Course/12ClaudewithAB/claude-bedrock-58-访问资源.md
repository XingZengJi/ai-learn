# Claude with AWS Bedrock - 58 Accessing resources 访问资源

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 58
> 课程: Claude with AWS Bedrock · 第 58 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

MCP 的资源让服务器暴露的数据可以**直接放进提示词**,而不必通过工具调用去取。这是给模型提供上下文的一种更高效的方式。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559733%2F11_-_008_-_Accessing_Resources_00.1748559733698.png)

## Understanding the Resource Flow 理解资源流程

当用户在应用里输入类似 "What's in the @..." 时,系统需要拉取一份可用资源清单来做自动补全。MCP 客户端向服务器发送 `ReadResourceRequest`,服务器返回可供引用的文档名列表。

## Implementing Resource Reading 实现资源读取

核心逻辑在 MCP 客户端的 `read_resource` 方法里,它接收一个 URI 参数,标识要从服务器取哪个资源。

先补上处理 JSON 解析和 URL 校验所需的导入:

```python
import json
from pydantic import AnyUrl
```

主体实现向 MCP 服务器发请求并处理响应:

```python
async def read_resource(self, uri: str) -> Any:
    result = await self.session().read_resource(AnyUrl(uri))
    resource = result.contents[0]
```

## Handling Different Content Types 处理不同的内容类型

资源可能返回不同类型的内容,所以要检查 MIME 类型来决定怎么处理:

```python
if isinstance(resource, types.TextResourceContents):
    if resource.mimeType == "application/json":
        return json.loads(resource.text)

return resource.text
```

> 代码在做什么: 先判断返回的是不是文本类资源; 如果 MIME 类型标的是 JSON,就解析成 Python 对象再返回; 否则原样返回文本。这样 JSON 资源能被正确解析,纯文本资源保持不变。

## Testing the Implementation 测试实现

实现完成后,运行 CLI 应用就能测试。当你输入 `@` 加资源名时,系统会:

1. 在自动补全列表里显示可用资源
2. 允许你用方向键和空格选中某个资源
3. 把该资源的内容**直接放进**发给 Claude 的提示词里

这意味着 Claude 立刻就拿到了文档内容,不需要额外的工具调用,交互效率高得多。

## Key Benefits 主要好处

相比用工具去取静态信息,资源有这些优势:

- 内容直接进提示词,降低延迟
- 对话过程中不需要额外的 API 调用
- 自动补全带来更好的用户体验
- 静态数据与动态操作之间界限更清晰

资源最适合那些相对静态、你希望模型方便取用的信息,比如文档、报告或参考资料。

对产品经理来说: 这一课的价值在于量化了「工具 vs 资源」的差别。走工具要多一次完整的模型往返(Claude 判断→调工具→拿结果→再回答); 走资源则在发第一条消息前就把内容塞好了。对延迟敏感的场景,这一来一回的差距很直观。
