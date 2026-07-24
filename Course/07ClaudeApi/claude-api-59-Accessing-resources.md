# Building with the Claude API - 59 Accessing resources 访问资源

> Course: Building with the Claude API · Lesson 59
> 课程: Building with the Claude API · 第 59 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

MCP 里的资源,让你的服务器能暴露一些可以直接放进提示词里的数据,而不需要通过工具调用来获取信息。这为给 AI 模型(比如 Claude)提供上下文,创造了一种更高效的方式。

## 理解资源请求

当你在 MCP 服务器上定义好资源后,客户端需要一种方式来请求并使用它们。客户端充当你的应用和 MCP 服务器之间的桥梁,自动处理通信和数据解析。

流程很直接:当用户想引用一份文档时(比如输入「@report.pdf」),你的应用会用 MCP 客户端从服务器获取这份资源,再把它的内容直接包含进发给 Claude 的提示词里。

## 实现资源读取

核心功能需要在你的 MCP 客户端里实现一个 `read_resource` 函数。这个函数接收一个 URI 参数,标明要获取哪个资源:

```python
async def read_resource(self, uri: str) -> Any:
    result = await self.session().read_resource(AnyUrl(uri))
    resource = result.contents[0]
```

MCP 服务器返回的响应里包含一个 `contents` 列表。你通常只需要第一个元素,它包含了实际的资源数据,以及像 MIME 类型这样的元数据。

## 处理不同的内容类型

资源可以返回不同类型的内容,所以你的客户端需要相应地解析它们。MIME 类型会告诉你该如何处理这份数据:

```python
if isinstance(resource, types.TextResourceContents):
    if resource.mimeType == "application/json":
        return json.loads(resource.text)
    
    return resource.text
```

这样一来,JSON 资源会被正确地解析成 Python 对象,而纯文本资源则会以字符串形式返回。MIME 类型就是你用来判断「该用哪种解析策略」的提示。

## 所需的导入

要让这一切正常运作,你需要在 MCP 客户端里加上这些导入:

```python
import json
from pydantic import AnyUrl
```

`json` 模块负责解析 JSON 响应,`AnyUrl` 则确保 URI 参数得到正确的类型处理。

## 测试资源访问

实现完成后,你可以通过 CLI 应用来测试这个功能。当你输入类似「@report.pdf 文档里写了什么?」这样的内容时,系统应该会:

1. 在自动补全列表里展示可用的资源
2. 让你能够选择一个资源
3. 自动获取该资源的内容
4. 把这份内容包含进发给 Claude 的提示词里

关键的优势在于,Claude 直接在提示词里就拿到了文档内容,不需要再发起一次工具调用来获取信息。这让交互变得更快、更高效。

## 和你应用的集成

记住,你写的 MCP 客户端代码,会被你应用的其他部分使用。`read_resource` 函数会成为一个基础构件,供其他组件调用,来获取文档内容、列出可用资源,或者把资源数据整合进提示词。

这种关注点分离让你的代码保持清晰:MCP 客户端负责和服务器通信,而你的应用逻辑专注于「如何有效地使用这些数据」。

---

对产品经理来说,「资源直接放进提示词」和「工具调用取数据」的效率差异,类似「提前把资料准备好放在会议桌上」和「开会开到一半临时叫人去查资料」的区别——前者省了一轮来回,响应更快。这也是为什么设计功能时,「这是用户主动明确要引用的数据(适合做成资源)」和「AI 需要自己判断是否要去查的数据(适合做成工具)」,应该被区分对待。
