# Claude with Google Vertex - 36 Using multiple tools 使用多个工具

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 36
> 课程: Claude with Google Vertex · 第 36 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

核心的工具处理基础设施搭好之后,给 Claude 加更多工具就变得很简单了。这一课展示如何按一个简单模式接入更多工具。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619943%2F06_-_009_-_Using_Multiple_Tools_00.1748619943580.png)

## The Tools We're Adding 我们要加的工具

提醒系统需要三项主要能力:

- **获取当前日期时间** —— Claude 需要知道当前日期和时间
- **给日期时间加时长** —— Claude 做日期加法不够可靠
- **设置提醒** —— 需要一个真正设置提醒的途径

好消息是大部分实现工作已经做完了。`add_duration_to_datetime` 函数能处理各种时间单位(秒、分、小时、天、周、月),返回格式正确的日期时间字符串。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619944%2F06_-_009_-_Using_Multiple_Tools_03.1748619944451.png)

`set_reminder` 函数是个简单的占位实现,只打印确认信息,并不真的去设置系统提醒。

## Adding Tools to the Conversation 把工具加进对话

流程和前面确立的模式一样。首先更新 `run_conversation`,把新工具的 schema 加进去:

```python
response = chat(messages, tools=[
    get_current_datetime_schema,
    add_duration_to_datetime_schema,
    set_reminder_schema
])
```

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619945%2F06_-_009_-_Using_Multiple_Tools_07.1748619945276.png)

这告诉 Claude 对话中它能用哪些工具。

## Handling Tool Execution 处理工具执行

接着更新 `run_tool` 函数来处理新的工具调用:

```python
def run_tool(tool_name, tool_input):
    if tool_name == "get_current_datetime":
        return get_current_datetime(**tool_input)
    elif tool_name == "add_duration_to_datetime":
        return add_duration_to_datetime(**tool_input)
    elif tool_name == "set_reminder":
        return set_reminder(**tool_input)
```

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619946%2F06_-_009_-_Using_Multiple_Tools_10.1748619945988.png)

模式是一致的: 判断工具名,用给定输入调用对应函数,返回结果。

## Testing Multiple Tool Usage 测试多工具协作

用一个需要多个工具的复杂请求来测: "Set a reminder for my doctors appointment. Its 177 days after Jan 1st, 2050."

这个请求逼着 Claude:

1. 算出 2050 年 1 月 1 日之后 177 天是哪天
2. 为算出来的日期设置提醒

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619946%2F06_-_009_-_Using_Multiple_Tools_15.1748619946641.png)

Claude 的处理方式是: 先说明自己要做什么,然后用 `add_duration_to_datetime` 算出 2050 年 6 月 27 日,最后用正确的日期调用 `set_reminder`。

## Understanding the Message Flow 理解消息流

看对话历史能发现 Claude 是怎么在一次响应里组织多个工具的。assistant 消息里既有说明过程的文本块,也有第一次计算的工具使用块。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619947%2F06_-_009_-_Using_Multiple_Tools_17.1748619947288.png)

收到工具结果后,Claude 继续发出另一条消息,同样含文本和一个用于设置提醒的工具使用块。这展示了 Claude 如何把多次工具调用串起来完成复杂任务。

## Key Takeaways 要点

基础工具设施搭好后,加新工具就是简单的三步:

1. 把工具 schema 加进 `run_conversation` 的 tools 列表
2. 在 `run_tool` 函数里加一个分支
3. 实现真正的工具函数

框架会自动处理所有的消息传递、工具结果格式化和对话流程。这让你能轻松做出可以按序完成多项相关任务的复杂 AI 助手。

对产品经理来说: 「加一个工具 = 三步」这个特性有个很实际的含义——**AI 功能的扩展成本是线性的,而且很低**。这与传统功能开发很不一样: 传统上加一个功能往往要改交互、改导航、加入口。这里加了工具,用户的交互方式一点没变,还是一句自然语言,但能力边界扩大了。做产品规划时,这意味着能力可以增量交付,不必攒成大版本。
