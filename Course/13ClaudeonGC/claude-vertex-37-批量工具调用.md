# Claude with Google Vertex - 37 The batch tool 批量工具调用

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 37
> 课程: Claude with Google Vertex · 第 37 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

用 Claude 的工具调用能力时你会发现,它可以在一条 assistant 消息里放多个工具使用块,也就是**并行**跑多个工具,而不是每个都单独发一次请求。但实际中,想让 Claude 稳定地这么做并不容易。

## The Problem with Multiple Tool Calls 多工具调用的问题

假设你让 Claude 为同一天设两个提醒。理论上它应该返回一条含两个工具使用块的响应——每个提醒一个。但现实中,Claude 往往会分成两次响应。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620029%2F06_-_010_-_The_Batch_Tool_04.1748620029736.png)

典型情况是: Claude 先发第一个工具调用,等结果回来,再在后续消息里发第二个。明明可以同时做完的操作,却产生了不必要的来回往返。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620031%2F06_-_010_-_The_Batch_Tool_05.1748620030815.png)

## The Batch Tool Solution 批量工具的解法

解法是实现一个「批量工具(batch tool)」——一个特殊的工具,接收一份「要同时执行的其他工具调用」的列表。本质上这是个变通手段,诱导 Claude 一次性发出多个工具调用。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620031%2F06_-_010_-_The_Batch_Tool_06.1748620031536.png)

工作方式:

1. 你定义一个批量工具 schema,告诉 Claude 它可以并行跑多个其他工具
2. Claude 不直接调用工具,而是调用批量工具并传入一份工具调用清单
3. 你的代码处理这份清单,逐个执行
4. 你把合并后的结果返回给 Claude

## Implementing the Batch Tool Schema 实现批量工具 schema

批量工具 schema 定义了 Claude 想跑多个工具时该怎么组织请求:

```python
batch_tool_schema = {
    "name": "batch_tool",
    "description": "Invoke multiple other tool calls simultaneously",
    "input_schema": {
        "type": "object",
        "properties": {
            "invocations": {
                "type": "array",
                "description": "The tool calls to invoke",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "The name of the tool to invoke"
                        },
                        "arguments": {
                            "type": "object",
                            "description": "The arguments to pass to the tool"
                        }
                    }
                }
            }
        }
    }
}
```

## Processing Batch Tool Calls 处理批量工具调用

Claude 用了批量工具后,你需要处理这份调用清单并逐个执行:

```python
def run_batch(invocations=[]):
    batch_output = []
    
    for invocation in invocations:
        name = invocation["name"]
        args = json.loads(invocation["arguments"])
        
        tool_output = run_tool(name, args)
        
        batch_output.append({
            "tool_name": name,
            "output": tool_output
        })
    
    return batch_output
```

同时也要更新主路由函数来处理批量工具调用:

```python
def run_tool(tool_name, tool_input):
    if tool_name == "get_current_datetime":
        return get_current_datetime(**tool_input)
    elif tool_name == "add_duration_to_datetime":
        return add_duration_to_datetime(**tool_input)
    elif tool_name == "set_reminder":
        return set_reminder(**tool_input)
    elif tool_name == "batch_tool":
        return run_batch(**tool_input)
```

## Results 效果

用上批量工具后,Claude 明显更倾向于把相关操作打包在一起。它不再为每个提醒单独发请求,而是用批量工具同时设好两个提醒。

对话流程也干净多了: 用户一次请求、Claude 一次带批量工具调用的响应、一次带全部结果的后续交互。这降低了延迟,让应用更高效。

虽然这看起来像个变通方案(确实是),但批量工具这个模式很有效地促使 Claude 去思考哪些操作可以并行,并更高效地执行它们。

对产品经理来说: 这一课展示了一种很有用的思路——**当模型的行为不符合预期时,除了改提示词,还可以改「它能选择的动作集合」**。这里没有反复叮嘱 Claude「请并行调用」,而是给了它一个天然表达「同时做这几件事」的工具。设计选项本身,往往比劝说更可靠。
