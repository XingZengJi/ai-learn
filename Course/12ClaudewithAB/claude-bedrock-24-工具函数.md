# Claude with AWS Bedrock - 24 Tool Functions 工具函数

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 24
> 课程: Claude with AWS Bedrock · 第 24 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Building tools for Claude requires solving several challenges that aren't immediately obvious. When you want Claude to set reminders for future dates, you quickly discover that while Claude knows the current date, it doesn't always know the exact time, struggles with complex date arithmetic, and has no built-in way to actually set reminders.

> 为 Claude 构建工具,需要解决几个不那么显而易见的挑战。当你想让 Claude 为未来的日期设置提醒时,你会很快发现:虽然 Claude 知道当前的日期,但它并不总是知道确切的时间,在复杂的日期运算上也容易出错,而且它本身也没有内置的方式来真正「设置」一条提醒。

The solution is to create custom tools that handle these specific tasks. For a reminder system, you'll need three separate tools: one to get the current date and time, another to add durations to dates, and a third to actually set the reminder.

> 解决办法是创建自定义工具,来专门处理这几项任务。对于一个提醒系统,你需要三个独立的工具:一个用来获取当前日期和时间,一个用来给日期加上时长,还有一个用来真正设置提醒。

## Why This Is Challenging 为什么这有挑战性

Claude has some limitations when it comes to time-based tasks:

> 在处理与时间相关的任务时,Claude 存在一些局限:

- Claude might know the current date, but not the exact time. Claude 可能知道当前日期,但不知道确切的时间。
- Claude doesn't always handle time-based addition well, especially when looking many days into the future. Claude 并不总能很好地处理基于时间的加法运算,尤其是要往未来推算很多天的时候。
- Claude doesn't know how to set a reminder. Claude 不知道该怎么「设置」一条提醒。

## The Tools You Need 你需要的工具

To solve these problems, you'll create three dedicated tools:

> 要解决这些问题,你需要创建三个专用工具:

1. **Get the current date time** - Claude needs to know the current date and time. **获取当前日期时间** - Claude 需要知道当前的日期和时间。
2. **Add duration to date time** - Claude isn't perfect with date time addition. **给日期时间加上时长** - Claude 在日期时间加法上并不完美。
3. **Set a reminder** - Need a way to set a reminder. **设置提醒** - 需要一种真正设置提醒的方式。

## How Tool Functions Work 工具函数是如何运作的

The tool system follows a specific flow between your server and Claude. You write functions that Claude can call when it needs additional information, and Claude receives the results to help formulate its response.

> 这套工具系统在你的服务器和 Claude 之间遵循一套特定的流程。你编写的函数,是 Claude 在需要额外信息时可以调用的;Claude 拿到函数执行的结果后,再据此来组织它的响应。

The process involves several steps: writing the tool function, creating a JSON schema specification, calling Claude with that schema, running the tool when Claude requests it, and providing the results back to Claude.

> 整个过程包括几个步骤:编写工具函数、创建 JSON schema 规格说明、带着这份 schema 调用 Claude、在 Claude 发出请求时运行对应的工具,再把结果提供回给 Claude。

## Writing Tool Functions 编写工具函数

Tool functions are plain Python functions that get executed when Claude decides it needs additional information to help the user. Here's how to write them effectively:

> 工具函数就是普通的 Python 函数,当 Claude 判断自己需要额外信息来帮助用户时,就会执行它们。以下是有效编写它们的方法:

### Best Practices 最佳实践

- Use well-named, descriptive arguments (this becomes important later). 使用命名清晰、描述性强的参数(这一点在后面会变得很重要)。
- Validate the inputs, raising an error if they fail validation. 校验输入,如果校验失败就抛出错误。
- Return meaningful errors - Claude will try to call your function a second time if it gets an error. 返回有意义的错误信息 - 如果 Claude 收到一个错误,它会尝试再调用一次你的函数。

## Creating Your First Tool 创建你的第一个工具

Let's start with the simplest tool - getting the current date and time. This function takes a date format parameter and returns the current timestamp:

> 我们从最简单的工具开始——获取当前日期和时间。这个函数接收一个日期格式参数,返回当前的时间戳:

```python
from datetime import datetime, timedelta

def get_current_datetime(date_format="%Y-%m-%d %H:%M:%S"):
    return datetime.now().strftime(date_format)
```

This function is straightforward but follows the key principles: it has a descriptive name, takes a well-named parameter with a sensible default, and returns exactly what it promises.

> 这个函数很直接,但遵循了几个关键原则:它有一个描述性的名字,接收一个命名清晰、带有合理默认值的参数,并且准确返回它承诺要返回的内容。

## JSON Schema Specification JSON Schema 规格说明

Once you have your function, you need to write a JSON Schema that describes it to Claude. This schema tells Claude what arguments the function requires and helps it understand when and how to use the tool.

> 有了函数之后,你需要写一份 JSON Schema,向 Claude 描述这个函数。这份 schema 会告诉 Claude 这个函数需要哪些参数,并帮它理解应该在什么时候、以什么方式使用这个工具。

The JSON Schema serves two purposes: it helps Claude understand what arguments your function requires, and it's not just an LLM concept - JSON Schema is commonly used for data validation across many programming contexts. There are plenty of online tools to help you generate schemas.

> JSON Schema 有两个作用:它能帮 Claude 理解你的函数需要哪些参数;而且它并不是专为大语言模型发明的概念——JSON Schema 在许多编程场景中都被广泛用于数据校验。网上有大量在线工具可以帮你生成 schema。

### Schema Best Practices Schema 最佳实践

- Explain what the tool does, when to use it, and what it returns. 说明这个工具是做什么的、什么时候该用它、它会返回什么。
- Aim for 3 to 4 sentences in your descriptions. 描述文字力求控制在 3 到 4 句话左右。
- Provide detailed descriptions for parameters. 给每个参数提供详细的说明。

With your tool function written and schema defined, you're ready to integrate it with Claude and start building more sophisticated AI interactions that can handle real-world tasks like setting reminders.

> 写好工具函数、定义好 schema 之后,你就可以把它整合进 Claude 里,开始构建更精细的 AI 交互了——比如设置提醒这样的真实任务。
