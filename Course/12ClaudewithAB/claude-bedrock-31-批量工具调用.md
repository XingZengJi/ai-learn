# Claude with AWS Bedrock - 31 Batch Tool Use 批量工具调用

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 31
> 课程: Claude with AWS Bedrock · 第 31 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Claude can natively run multiple tools at the same time, but some versions don't take advantage of this as much as you might wish. You can greatly increase the chances of Claude making multiple tool calls in a single message by implementing a batch tool.

> Claude 原生就能同时运行多个工具,但有些版本并不像你期望的那样充分利用这一点。通过实现一个「批量工具」(batch tool),你可以大幅提高 Claude 在单条消息里进行多次工具调用的概率。

When Claude sends back tool use parts in a message, there can be more than one tool request in a single response. For example, if you ask "What is March 12th, 2025 + 50 days? Also, what is March 12th, 2025 + 100 days?", Claude could theoretically send back two separate tool use parts - one for each calculation. These operations are completely parallelizable since they don't depend on each other.

> 当 Claude 在一条消息里返回工具调用部分时,单次响应中可能包含不止一个工具请求。举例来说,如果你问「2025 年 3 月 12 日加 50 天是几号?另外,2025 年 3 月 12 日加 100 天又是几号?」,Claude 理论上可以返回两个独立的工具调用部分——每个计算一个。由于这两个计算互不依赖,它们完全可以并行处理。

However, Claude doesn't always try to parallelize tool calls as much as you'd expect. Instead of making both calls simultaneously, it often makes them sequentially, which is less efficient.

> 然而,Claude 并不总是像你期望的那样,尽力把工具调用并行化。它经常是依次发起这两次调用,而不是同时进行,这样效率较低。

对产品经理来说,这就像一个员工明明可以同时给两个客户打电话确认信息,却习惯一个打完再打下一个——「批量工具」相当于给他一个「群呼」按钮,一次性把两个电话都打出去,而不是让他自己一个个来。

## How the Batch Tool Works 批量工具的运作原理

The batch tool is implemented just like any other tool - you need a tool specification and a function to handle when it gets called. The key idea is to create a tool that can invoke multiple other tools simultaneously.

> 批量工具的实现方式和其他工具没什么两样——你需要一份工具规格说明,以及一个在它被调用时负责处理的函数。核心思路是创建一个能同时调用多个其他工具的工具。

Here's the basic structure of the batch tool specification:

> 以下是批量工具规格说明的基本结构:

```json
{
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
              "type": "string", 
              "description": "The arguments to the tool, encoded as a JSON string"
            }
          },
          "required": ["name", "arguments"]
        }
      }
    },
    "required": ["invocations"]
  }
}
```

The tool takes a list of invocations, where each invocation contains the name of a tool to call and its arguments (encoded as a JSON string).

> 这个工具接收一份「调用列表」(invocations),其中每一项调用都包含要调用的工具名称,以及它的参数(以 JSON 字符串编码)。

## Implementation 实现方式

The batch tool implementation involves two main functions:

> 批量工具的实现涉及两个主要函数:

### The `run_batch` Function `run_batch` 函数

```python
def run_batch(tool_input):
    batch_output = []
    for invocation in tool_input["invocations"]:
        tool_name = invocation["name"]
        args = json.loads(invocation["arguments"])
        
        tool_output = run_tool(tool_name, args)
        batch_output.append({"tool_name": tool_name, "output": tool_output})
    
    return batch_output
```

This function loops through each invocation, extracts the tool name and arguments, calls the appropriate tool using the existing `run_tool` function, and collects all the results.

> 这个函数会遍历每一项调用,提取出工具名称和参数,用已有的 `run_tool` 函数调用对应的工具,并收集所有结果。

### Adding to `run_tool` 加入到 `run_tool` 里

You also need to add a case to your main `run_tool` function:

> 你还需要在主 `run_tool` 函数里加入一个分支:

```python
elif tool_name == "batch_tool":
    return run_batch(tool_input)
```

Note that unlike other tools, you pass `tool_input` directly without using the splat operator (`**`), since the batch tool needs to handle the raw input structure.

> 注意,和其他工具不同,这里是直接传入 `tool_input`,不使用展开操作符(`**`),因为批量工具需要处理原始的输入结构。

## Results 结果

When you implement the batch tool and run the same date calculation query, instead of seeing two separate tool calls in the message log, you'll see a single call to the batch tool. This single call contains both date calculations as sub-invocations, effectively parallelizing the operations.

> 当你实现了批量工具,再运行同样的日期计算查询时,你在消息日志里看到的不再是两次独立的工具调用,而是一次对批量工具的调用。这一次调用里包含了两个日期计算作为子调用,有效地实现了操作的并行化。

The batch tool is particularly useful when you have multiple independent operations that can be executed simultaneously. By "tricking" Claude into using this pattern, you can significantly improve the efficiency of your tool-calling workflows.

> 当你有多个可以同时执行的独立操作时,批量工具特别有用。通过「引导」Claude 使用这种模式,你可以显著提升工具调用工作流的效率。
