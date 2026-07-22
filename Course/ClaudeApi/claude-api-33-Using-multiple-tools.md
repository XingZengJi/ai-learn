# Building with the Claude API - 33 Using multiple tools 使用多个工具

> Course: Building with the Claude API · Lesson 33
> 课程: Building with the Claude API · 第 33 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

一旦你搭好了核心的工具处理基础设施,再往 Claude 的实现里加更多工具就会变得很简单。这节课演示如何按照一个简单的模式集成新工具。

## 我们要加的工具

我们的提醒系统需要三个核心能力:

1. **获取当前日期时间** —— Claude 需要知道当前的日期和时间
2. **给日期时间加上一段时长** —— Claude 在日期时间加法上表现不够完美
3. **设置提醒** —— 需要一种方式能真正设置提醒

好消息是,大部分实现工作已经完成了。`add_duration_to_datetime` 函数和 `set_reminder` 函数,连同它们对应的 schema,都已经提供好了。

## 把工具加入对话

首先,更新 `run_conversation` 函数,把新工具的 schema 加进 `tools` 列表:

```python
response = chat(messages, tools=[
    get_current_datetime_schema,
    add_duration_to_datetime_schema,
    set_reminder_schema
])
```

这样就告诉了 Claude,在这次对话里有这三个工具可供它使用。

## 更新工具路由

接下来,修改 `run_tool` 函数来处理新的工具调用。为每个新工具加一个 `elif` 分支:

```python
def run_tool(tool_name, tool_input):
    if tool_name == "get_current_datetime":
        return get_current_datetime(**tool_input)
    elif tool_name == "add_duration_to_datetime":
        return add_duration_to_datetime(**tool_input)
    elif tool_name == "set_reminder":
        return set_reminder(**tool_input)
```

这个模式很简单:检查工具名,用传入的参数调用对应的函数,返回结果。

## 测试多工具协同工作

要测试这套系统,可以试试一个需要多个工具配合的请求:「帮我设个提醒,提醒我去看医生。时间是 2050 年 1 月 1 日之后的第 177 天。」

这个请求会迫使 Claude:

1. 计算出具体日期(用 `add_duration_to_datetime`)
2. 设置提醒(用 `set_reminder`)

Claude 会先说明自己接下来要做什么,再依次发起对应的工具调用。整个对话过程里,Claude 先算出目标日期是 2050 年 6 月 27 日,再针对这个日期设置提醒。

## 理解消息流转

查看对话历史时,你会看到完整的消息结构:

1. 带有请求内容的用户消息
2. 同时包含文本和工具使用块的 assistant 消息
3. 工具结果消息
4. 后续的 assistant 消息

这展示了 Claude 是如何在一条消息里同时包含多个块的——把说明性文字和工具使用请求组合在一起。

## 添加新工具的简单模式

一旦你有了核心的工具基础设施,添加新工具就遵循这样一套固定模式:

1. 写好工具函数的实现
2. 定义工具 schema
3. 把 schema 加入 `run_conversation` 里的 `tools` 列表
4. 在 `run_tool` 里加一个对应的分支

这种模块化的方式,让你能轻松扩展 AI 助手的能力,而不需要重新组织已有的代码。每个新工具都能顺畅地融入现有的对话流程和工具处理逻辑。

---

对产品经理来说,这一课演示的正是「可插拔式功能扩展」——一旦底层框架(路由表 + 对话循环)搭好了,加一个新功能就是「写实现 + 注册一下」这种标准化的四步动作,不需要每次都动核心逻辑。这和给一个 SaaS 产品加新的自动化规则很像:核心引擎不变,业务规则按同一套接口往里插。
