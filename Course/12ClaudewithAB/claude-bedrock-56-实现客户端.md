# Claude with AWS Bedrock - 56 Implementing a client 实现客户端

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 56
> 课程: Claude with AWS Bedrock · 第 56 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

MCP 服务器跑通之后,该做客户端这一侧了。客户端是让你的应用能与 MCP 服务器通信、用上它功能的那一层。

## Understanding the Client Architecture 理解客户端架构

再强调一次: 正常情况下你只会实现 MCP 客户端或服务器中的一个。本项目两个都做,只是为了让你看清它们如何配合。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559696%2F11_-_006_-_Implementing_a_Client_01.1748559696012.png)

MCP 客户端由两部分协同组成:

- **MCP Client** —— 我们自己写的一个类,用来更方便地使用会话
- **Client Session** —— 与服务器的实际连接(属于 MCP Python SDK)

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559696%2F11_-_006_-_Implementing_a_Client_02.1748559696435.png)

会话(session)负责底层通信,但程序退出时需要小心地清理资源。所以我们用自己的类把它包一层,自动管理清理工作。

## How the Client Fits Into Our Application 客户端在应用中的位置

CLI 代码在两个关键时刻用到客户端:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559697%2F11_-_006_-_Implementing_a_Client_05.1748559696986.png)

- 取一份可用工具清单发给 Claude
- 在 Claude 请求调用工具时执行工具

## Implementing Core Client Functions 实现核心函数

两个必需函数是 `list_tools` 和 `call_tool`。

`list_tools` 连上会话、请求可用工具:

```python
async def list_tools(self) -> list[types.Tool]:
    result = await self.session().list_tools()
    return result.tools
```

`call_tool` 把工具名和输入参数传给服务器:

```python
async def call_tool(
    self, tool_name: str, tool_input: dict
) -> types.CallToolResult | None:
    return await self.session().call_tool(tool_name, tool_input)
```

就这么多——复杂的通信细节全由会话处理了。

## Testing the Client 测试客户端

客户端文件底部有个简单的测试入口,可以直接运行来验证:

```bash
uv run mcp_client.py
```

它会连上你的 MCP 服务器并打印可用工具,你应该能看到工具定义的输出,包含名称、描述和输入 schema。

## Important Schema Differences 一个 schema 差异的坑

这里有个必须知道的坑: **MCP 的工具定义和 Claude 期望的格式并不完全一致**。MCP 规范有自己的一套工具 schema 格式,与 Bedrock 要求的略有不同。

不用担心——项目里已经有代码自动做这个转换。`core/bedrock.py` 里的 `to_bedrock_tools` 函数负责把 MCP 工具定义翻译成 Claude 能理解的格式。

## Testing with Claude 与 Claude 联调

服务器和客户端都通了之后,可以测完整流程。运行主程序:

```bash
uv run main.py
```

然后提问: "What is the contents of the report.pdf document?"

Claude 会:

1. 从你的客户端收到可用工具清单
2. 决定使用 `read_doc_contents` 工具
3. 由你的客户端在 MCP 服务器上执行该工具
4. 拿到文档内容并作出回答

客户端就是应用代码与 MCP 服务器之间的桥梁,让你能方便地把服务器功能开放给 Claude 和系统其他部分。

对产品经理来说: 留意那个 schema 差异的坑——它说明 MCP 作为「标准」还没有做到完全无缝,中间仍需要一层适配。评估任何号称「即插即用」的协议时,这类适配层的存在与维护成本都要算进去。
