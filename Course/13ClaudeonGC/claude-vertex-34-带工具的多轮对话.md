# Claude with Google Vertex - 34 Multi-turn conversations with tools 带工具的多轮对话

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 34
> 课程: Claude with Google Vertex · 第 34 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

当应用里有多个工具时,你得处理这样的场景: Claude 为了回答一个问题,需要**连续调用好几个工具**。比如用户问 "What day is 103 days from today?",Claude 得先拿到当前日期,再加上 103 天。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619954%2F06_-_007_-_Multi-Turn_Conversations_with_Tools_02.1748619954762.png)

这形成一种多轮对话模式: Claude 在给出最终答案前发出多次工具请求。你的应用需要自动处理这个过程。

## The Multi-Turn Tool Pattern 多轮工具调用模式

Claude 需要多个工具时,幕后发生的事:

1. 用户问: "What day is 103 days from today?"
2. Claude 返回一个工具使用块,请求 `get_current_datetime`
3. 你的服务器调用函数并返回结果
4. Claude 意识到还需要更多信息,请求 `add_duration_to_datetime`
5. 你的服务器调用那个函数并返回结果
6. Claude 现在信息足够了,给出最终答案

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619955%2F06_-_007_-_Multi-Turn_Conversations_with_Tools_03.1748619955529.png)

## Building a Conversation Loop 搭一个对话循环

要处理这个模式,你需要一个循环,一直转到 Claude 不再请求工具为止:

```python
def run_conversation(messages):
    while True:
        response = chat(messages)

        add_assistant_message(messages, response)

        # 伪代码
        if response isn't asking for a tool:
            break

        tool_result_blocks = run_tools(response)
        add_user_message(messages, tool_result_blocks)
        
    return messages
```

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619956%2F06_-_007_-_Multi-Turn_Conversations_with_Tools_05.1748619956267.png)

## Refactoring Helper Functions 重构辅助函数

实现这个循环之前,先把辅助函数改造成能正确处理多个消息块。

### Updating Message Handlers 更新消息处理函数

`add_user_message` 和 `add_assistant_message` 目前假定处理的总是纯文本。改成能处理完整消息对象:

```python
from anthropic.types import Message

def add_user_message(messages, message):
    user_message = {
        "role": "user",
        "content": message.content if isinstance(message, Message) else message
    }
    messages.append(user_message)
```

这样你既可以传字符串,也可以传块列表,还可以传完整的消息对象。

### Updating the Chat Function 更新 chat 函数

改造 `chat` 函数,让它接受工具列表,并返回**完整消息**而不只是文本:

```python
def chat(messages, system=None, temperature=1.0, stop_sequences=[], tools=None):
    params = {
        "model": model,
        "max_tokens": 1000,
        "messages": messages,
        "temperature": temperature,
        "stop_sequences": stop_sequences,
    }
    
    if tools:
        params["tools"] = tools
        
    if system:
        params["system"] = system
        
    message = client.messages.create(**params)
    return message
```

### Extracting Text from Messages 从消息中抽取文本

因为 `chat` 现在返回的是完整消息,再加一个需要时抽文本的辅助函数:

```python
def text_from_message(message):
    return "\n".join(
        [block.text for block in message.content if block.type == "text"]
    )
```

它把消息里所有文本块找出来拼在一起,在需要把最终回复展示给用户时很有用。

## Why These Changes Matter 这些改动为什么重要

这些重构让你的代码适应带工具对话的现实:

- **一条消息里有多个块** —— Claude 的回复可能同时含文本和工具使用块
- **灵活的消息处理** —— 函数现在能应对多种消息格式
- **完整保留消息** —— 保住 Claude 给的全部信息,而不只是文本部分
- **支持工具列表** —— `chat` 函数现在能接收并使用多个工具

打好这些基础之后,你就可以实现那个自动处理多次工具调用的完整对话循环,让 Claude 顺畅地用上它需要的任何工具来完整回答用户的问题。

对产品经理来说: 这个 `while True` 循环就是「智能体」最朴素的样子——它和普通问答的唯一区别,就是**模型能决定循环几次**。这也带来一个必须做的产品决策: **循环上限设多少**。没有上限,一次异常的对话可能连转几十轮、烧掉大量 token 又给不出答案。实际项目里这个上限和超时策略,应该是需求文档里写明的东西。
