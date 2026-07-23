# Claude with AWS Bedrock - 27 Running Tool Functions 运行工具函数

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 27
> 课程: Claude with AWS Bedrock · 第 27 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When Claude responds with a tool use request, your server needs to actually run the requested tool and send the results back. This step involves extracting tool use parts from Claude's response, executing the appropriate functions, and formatting the results properly.

> 当 Claude 返回一个工具调用请求时,你的服务器需要真正运行被请求的工具,并把结果发回去。这一步包括:从 Claude 的响应中提取工具调用部分、执行对应的函数,并把结果正确地格式化。

## Handling Multiple Tool Requests 处理多个工具请求

Claude can send multiple tool use parts in a single response. Your code needs to handle this possibility defensively. An assistant message might contain a text part followed by one, two, or even more tool use parts.

> Claude 可能在单次响应里发送多个工具调用部分。你的代码需要对这种可能性做防御性处理。一条助手消息可能包含一个文本部分,后面跟着一个、两个甚至更多个工具调用部分。

The flow works like this: Claude sends a request with JSON schema, receives a tool use part, then your server runs the tool and sends back a tool result part for Claude to provide a final response.

> 整个流程是这样的:Claude 带着 JSON schema 发送请求,得到一个工具调用部分,然后你的服务器运行这个工具,把工具结果部分发回去,供 Claude 给出最终响应。

## Extracting Tool Use Parts 提取工具调用部分

First, create a function to process all the parts returned from a chat request:

> 首先,创建一个函数来处理一次 chat 请求返回的所有 parts:

```python
def run_tools(parts):
    tool_requests = [part for part in parts if "toolUse" in part]
    tool_result_parts = []
    
    for tool_request in tool_requests:
        tool_use_id = tool_request["toolUse"]["toolUseId"]
        tool_name = tool_request["toolUse"]["name"]
        tool_input = tool_request["toolUse"]["input"]
```

This comprehension filters the parts list to only include dictionaries that contain a "toolUse" key, ignoring text parts.

> 这个列表推导式会从 parts 列表里筛选出只包含 `toolUse` 键的字典,忽略掉文本部分。

## Running the Actual Tools 运行真正的工具

Create a helper function to execute the requested tool:

> 创建一个辅助函数来执行被请求的工具:

```python
def run_tool(tool_name, tool_input):
    if tool_name == "get_current_datetime":
        return get_current_datetime(**tool_input)
    else:
        raise Exception(f"Unknown tool name: {tool_name}")
```

The key detail here is using `**tool_input` to splat the dictionary of arguments into your tool function. Claude always returns arguments as a dictionary object, so you need to unpack it properly.

> 这里的关键细节是用 `**tool_input` 把参数字典「展开」传给你的工具函数。Claude 返回的参数始终是一个字典对象,所以你需要正确地把它解包。

## Creating Tool Result Parts 创建工具结果部分

After running a tool, you need to format the response as a tool result part:

> 运行完工具之后,你需要把响应格式化成一个工具结果部分:

Tool result parts require three key properties:

> 工具结果部分需要三个关键属性:

- **toolUseId** - Must match the original tool use part's ID. **toolUseId** - 必须和原始工具调用部分的 ID 一致。
- **content** - The output from your tool, serialized as a string. **content** - 你工具的输出结果,序列化成字符串。
- **status** - Either "success" or "error". **status** - 「success(成功)」或「error(失败)」。

## Understanding Tool Use IDs 理解工具调用 ID

The tool use ID system becomes important when Claude requests multiple tools in parallel. For example, if Claude wants to run a calculator tool twice:

> 当 Claude 并行请求多个工具时,这套「工具调用 ID」体系就变得很重要。举例来说,如果 Claude 想运行两次计算器工具:

Each tool use gets a unique ID (like "ab3" and "po9"), and your tool results must include the matching IDs so Claude knows which result corresponds to which request.

> 每次工具调用都会拿到一个唯一的 ID(比如「ab3」和「po9」),你的工具结果必须带上对应匹配的 ID,这样 Claude 才知道哪个结果对应哪个请求。

## Error Handling 错误处理

Wrap your tool execution in try-catch blocks. Claude is intelligent about tool errors and might adjust its approach if you return proper error information:

> 把工具的执行过程包在 try-catch 代码块里。Claude 对工具错误有一定的应变能力,如果你返回了恰当的错误信息,它可能会调整自己的处理方式:

```python
try:
    tool_output = run_tool(tool_name, tool_input)
    tool_result_part = {
        "toolResult": {
            "toolUseId": tool_use_id,
            "content": [{"text": json.dumps(tool_output)}],
            "status": "success"
        }
    }
except Exception as e:
    tool_result_part = {
        "toolResult": {
            "toolUseId": tool_use_id,
            "content": [{"text": f"Error: {e}"}],
            "status": "error"
        }
    }
```

## Complete Implementation 完整实现

Here's the full function that processes tool requests and returns formatted results:

> 以下是处理工具请求、返回格式化结果的完整函数:

```python
def run_tools(parts):
    tool_requests = [part for part in parts if "toolUse" in part]
    tool_result_parts = []
    
    for tool_request in tool_requests:
        tool_use_id = tool_request["toolUse"]["toolUseId"]
        tool_name = tool_request["toolUse"]["name"]
        tool_input = tool_request["toolUse"]["input"]
        
        try:
            tool_output = run_tool(tool_name, tool_input)
            tool_result_part = {
                "toolResult": {
                    "toolUseId": tool_use_id,
                    "content": [{"text": json.dumps(tool_output)}],
                    "status": "success"
                }
            }
        except Exception as e:
            tool_result_part = {
                "toolResult": {
                    "toolUseId": tool_use_id,
                    "content": [{"text": f"Error: {e}"}],
                    "status": "error"
                }
            }
        
        tool_result_parts.append(tool_result_part)
    
    return tool_result_parts
```

Once you have the tool result parts, you can send them back to Claude in your next chat request, completing the tool use cycle.

> 有了这些工具结果部分之后,你就可以在下一次 chat 请求中把它们发回给 Claude,完成整个工具调用的闭环。
