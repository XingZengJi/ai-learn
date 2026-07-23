# Claude with AWS Bedrock - 30 Adding Multiple Tools 添加多个工具

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 30
> 课程: Claude with AWS Bedrock · 第 30 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Now that we have one tool working, it's time to add the remaining two tools to complete our project: `add_duration_to_datetime` and `set_reminder`. The good news is that once you have the foundation in place, adding new tools is straightforward.

> 现在我们已经跑通了一个工具,是时候加入剩下两个工具,来完成整个项目了:`add_duration_to_datetime` 和 `set_reminder`。好消息是,一旦基础打好了,添加新工具就很直接。

## Pre-built Functions and Schemas 预先写好的函数与 Schema

To save time, the implementations for both additional functions are already provided, along with their JSON schema specifications. You can find these in the earlier code cells:

> 为了节省时间,这两个额外函数的实现以及对应的 JSON schema 规格说明都已经提供好了。你可以在之前的代码单元格里找到它们:

- `add_duration_to_datetime` - Handles date arithmetic for various time units. 处理各种时间单位的日期运算。
- `set_reminder` - Creates reminders (currently just prints output, but could be extended to integrate with actual reminder systems). 创建提醒(目前只是打印输出,但可以扩展成对接真正的提醒系统)。

Each function comes with a corresponding JSON schema that defines the expected parameters and their types.

> 每个函数都配有一份对应的 JSON schema,定义了预期的参数及其类型。

## Adding Tools to the Conversation 把工具加入对话

The first step is to include the new tool schemas in your conversation function. In the `run_conversation` function, add the additional schemas to the tools array:

> 第一步是把新工具的 schema 加入你的对话函数。在 `run_conversation` 函数里,把额外的 schema 加进 tools 数组:

```python
tools=[
    get_current_datetime_schema,
    add_duration_to_datetime_schema,
    set_reminder_schema
]
```

## Wiring Up the Tool Functions 接通工具函数

Next, you need to update the `run_tool` function to handle the new tool names. Add two additional conditional branches:

> 接下来,你需要更新 `run_tool` 函数,让它能处理新的工具名称。加入两个额外的条件分支:

```python
def run_tool(tool_name, tool_input):
    if tool_name == "get_current_datetime":
        return get_current_datetime(**tool_input)
    elif tool_name == "set_reminder":
        return set_reminder(**tool_input)
    elif tool_name == "add_duration_to_datetime":
        return add_duration_to_datetime(**tool_input)
    else:
        raise Exception(f"Unknown tool name: {tool_name}")
```

## Testing the Complete System 测试完整系统

With all tools connected, you can now test complex workflows that require multiple tool calls. For example, asking Claude to "Set a reminder to go to the doctor. The appointment is in 100 days" will trigger a sequence of operations:

> 接通所有工具之后,你现在可以测试需要多次工具调用的复杂工作流了。举例来说,让 Claude「设置一个去看医生的提醒,预约是在 100 天之后」,会触发一连串操作:

1. Get today's date using `get_current_datetime`. 用 `get_current_datetime` 获取今天的日期。
2. Add 100 days to that date using `add_duration_to_datetime`. 用 `add_duration_to_datetime` 给这个日期加上 100 天。
3. Create the reminder using `set_reminder`. 用 `set_reminder` 创建这条提醒。

Claude automatically breaks down the request into logical steps and explains its plan before executing each tool call. The output shows the complete workflow, including the calculated future date and confirmation of the reminder being set.

> Claude 会自动把这个请求拆解成一步步的逻辑步骤,并在执行每次工具调用之前说明自己的计划。输出结果展示了完整的工作流,包括计算出的未来日期,以及提醒已设置成功的确认信息。

## Key Takeaway 核心要点

Once you have the foundational tool use infrastructure in place, adding new tools requires just two simple steps: including the schema in your tools array and adding a case to handle the tool name in your routing function. The initial setup might feel complex, but scaling to multiple tools becomes very manageable.

> 一旦你把工具调用的基础设施搭好,添加新工具就只需要两个简单的步骤:把 schema 加进 tools 数组,再在你的路由函数里加一个处理这个工具名称的分支。最初的搭建可能会觉得有些复杂,但扩展到多个工具之后,会变得非常好管理。
