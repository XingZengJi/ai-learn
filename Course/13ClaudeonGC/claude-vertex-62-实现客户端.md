# Claude with Google Vertex - 62 Implementing a client 实现客户端

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 62
> 课程: Claude with Google Vertex · 第 62 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

MCP 服务器跑通了,现在来做客户端。客户端让我们的应用能与 MCP 服务器通信、使用它的功能。

## Understanding the Client Architecture 理解客户端架构

写代码之前先澄清一点: 通常你只会实现 MCP 客户端**或** MCP 服务器,不会两个都做。本项目两端都做只是为了让你看清它们如何配合。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621199%2F09_-_006_-_Implementing_a_Client_01.1748621199062.png)

MCP 客户端由两个主要部分组成:

- **MCP Client** —— 我们自己写的一个类,让 session 用起来更方便
- **Client Session** —— 与服务器的实际连接(属于 MCP Python SDK)

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621199%2F09_-_006_-_Implementing_a_Client_02.1748621199655.png)

client session 用完之后需要清理资源,所以我们把它包进自定义类里,由它自动处理连接管理和清理。

## How the Client Fits Into Our Application 客户端在应用里的位置

还记得应用流程吗?我们的 CLI 代码需要以两种关键方式与 Claude 交互:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621201%2F09_-_006_-_Implementing_a_Client_06.1748621201283.png)

客户端把服务器的功能暴露给我们的代码库,从而支撑起这两种交互。

## Implementing Core Client Functions 实现核心客户端函数

需要实现两个必备函数: `list_tools` 和 `call_tool`。

### List Tools Function

这个函数从服务器取回全部可用工具:

```python
async def list_tools(self) -> list[types.Tool]:
    result = await self.session().list_tools()
    return result.tools
```

很直接——访问 session(与 MCP 服务器的连接),调用内置的 `list_tools`,把结果里的工具返回。

### Call Tool Function

这个函数在服务器上执行指定工具:

```python
async def call_tool(
    self, tool_name: str, tool_input: dict
) -> types.CallToolResult | None:
    return await self.session().call_tool(tool_name, tool_input)
```

我们把工具名和输入参数(由 Claude 提供)传给服务器,返回结果。

## Testing the Client 测试客户端

要验证实现是否正确,可以直接测试。客户端文件里带了一个测试脚手架,能连上 MCP 服务器并对它执行命令。

运行 `uv run mcp_client.py` 应该返回一份可用工具列表,含描述和输入 schema。你会看到我们在服务器里定义的 `read_doc_contents` 和 `edit_document`。

## End-to-End Testing 端到端测试

客户端和服务器都能工作了,现在测完整流程。运行主应用,问 Claude "What is the contents of the report.pdf document?",应该会:

1. 把可用工具列表发给 Claude
2. Claude 决定使用 `read_doc_contents` 工具
3. 我们的客户端在服务器上调用该工具
4. 服务器返回文档内容
5. Claude 基于这些信息作答

客户端充当应用代码与 MCP 服务器之间的桥梁,让你能方便地使用服务器功能,而不必直接处理底层连接细节。
