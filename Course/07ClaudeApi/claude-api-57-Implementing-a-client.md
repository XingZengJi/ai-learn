# Building with the Claude API - 57 Implementing a client 实现客户端

> Course: Building with the Claude API · Lesson 57
> 课程: Building with the Claude API · 第 57 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

现在我们的 MCP 服务器已经能正常工作了,是时候搭建客户端那一侧了。客户端负责让我们的应用能和 MCP 服务器通信,访问它提供的功能。

## 理解客户端架构

在大多数真实项目里,你会实现 MCP 客户端「或者」MCP 服务器,而不是两个都做。我们在这个项目里两个都做,纯粹是为了让你看清楚它们是如何协同工作的。

MCP 客户端由两个主要部分组成:

- **MCP Client** —— 我们自己创建的一个自定义类,让使用会话变得更简单
- **Client Session** —— 与服务器的实际连接(属于 MCP Python SDK 的一部分)

这个客户端会话,在用完之后需要正确地清理资源。这正是我们要把它包装进自定义的 `MCP Client` 类里的原因——让它自动处理所有的清理工作。

## 客户端在我们应用里的位置

还记得我们的应用流程吗?我们的 CLI 代码需要用 MCP 服务器做两件主要的事:

1. 获取一份可用工具的列表,发给 Claude
2. 当 Claude 请求使用工具时,执行相应的工具

MCP 客户端通过一些简单的方法调用,把这些能力提供给我们的应用代码使用。

## 实现核心方法

我们需要在客户端里实现两个关键方法:`list_tools()` 和 `call_tool()`。

### List Tools 方法

这个方法从服务器获取所有可用工具:

```python
async def list_tools(self) -> list[types.Tool]:
    result = await self.session().list_tools()
    return result.tools
```

很直接——我们访问自己的会话(和服务器的连接),调用内置的 `list_tools()` 函数,再从结果里返回工具列表。

### Call Tool 方法

这个方法在服务器上执行一个特定的工具:

```python
async def call_tool(
    self, tool_name: str, tool_input: dict
) -> types.CallToolResult | None:
    return await self.session().call_tool(tool_name, tool_input)
```

我们把工具名和输入参数(由 Claude 提供)传给服务器,再返回结果。

## 测试客户端

要测试我们的实现,可以直接运行客户端。这个文件里包含一个测试用的辅助代码,它会连接我们的 MCP 服务器,调用我们的方法:

```python
async with MCPClient(
    command="uv", args=["run", "mcp_server.py"]
) as client:
    result = await client.list_tools()
    print(result)
```

运行这段测试代码,我们应该能看到之前创建的工具定义被打印出来,包括 `read_doc_contents` 和 `edit_document` 这两个工具。

## 把这一切整合起来

现在我们的客户端既能列出工具、又能调用工具了,可以测试完整的流程了。当我们运行主应用,问 Claude 关于某份文档的问题时:

1. 我们的代码用客户端获取可用工具列表
2. 这些工具连同用户的问题一起发给 Claude
3. Claude 判断需要用 `read_doc_contents` 工具
4. 我们的代码用客户端执行这个工具
5. 结果被发回给 Claude,Claude 再回答用户

比如,问「report.pdf 这份文档的内容是什么?」,会触发 Claude 使用我们的文档读取工具,我们会拿回关于「20 米冷凝塔」这份文档的信息——正是我们在服务器里设置好的内容。

客户端在我们的应用逻辑和 MCP 服务器之间架起了一座桥梁,让我们能轻松访问服务器的功能,而不用操心底层连接的细节。

---

对产品经理来说,「把连接细节封装进一个自定义类里」这个做法,体现了软件工程里很基本但很重要的一条原则:把「繁琐但必须做对的底层工作」(比如资源清理、连接管理)藏在一层简单的接口后面,让上层业务代码(问文档内容这类逻辑)只需要调用简单的方法,不用操心底层怎么实现。这也是为什么好的技术架构往往能让后续新功能的开发速度大幅提升。
