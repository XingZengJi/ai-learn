# Building with the Claude API - 31 Multi-turn conversations with tools 带工具的多轮对话

> Course: Building with the Claude API · Lesson 31
> 课程: Building with the Claude API · 第 31 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

搭建带多个工具的应用时,你需要处理这样的场景:Claude 可能需要连续调用好几个工具,才能回答用户的一个问题。比如,如果用户问「从今天起 103 天后是几号?」,Claude 需要先获取当前日期,再给它加上 103 天。

这就形成了一种「多轮」模式:Claude 在给出最终答案之前,会发起多次工具请求。你的应用需要能自动处理这种情况。

## 多轮工具调用模式

当 Claude 需要多个工具时,幕后是这样运作的:

1. 用户问:「从今天起 103 天后是几号?」
2. Claude 返回一个工具使用块,请求调用 `get_current_datetime`
3. 你的服务器调用这个函数,把结果返回
4. Claude 意识到自己还需要更多信息,请求调用 `add_duration_to_datetime`
5. 你的服务器调用这个函数,把结果返回
6. Claude 此时已经有足够信息,给出最终答案

## 搭建对话循环

要处理这种模式,你需要一个对话循环,持续运行直到 Claude 不再请求工具为止:

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

## 重构辅助函数

在实现这个对话循环之前,你需要先更新辅助函数,让它们能正确处理多个消息块。

### 更新消息处理函数

你目前的 `add_user_message` 和 `add_assistant_message` 函数,默认你处理的一直是纯文本。把它们更新成能处理完整消息对象:

```python
from anthropic.types import Message

def add_user_message(messages, message):
    user_message = {
        "role": "user",
        "content": message.content if isinstance(message, Message) else message
    }
    messages.append(user_message)
```

这样一来,你既可以传入一个字符串,也可以传入一个块的列表,或者一个完整的消息对象。

### 更新 chat 函数

修改你的 `chat` 函数,让它能接收工具列表,并返回完整的消息对象而不只是文本:

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

### 从消息中提取文本

既然现在返回的是完整消息对象,你需要一个辅助函数,在需要时把文本提取出来:

```python
def text_from_message(message):
    return "\n".join(
        [block.text for block in message.content if block.type == "text"]
    )
```

这个函数会找出消息里所有的文本块,把它们拼接在一起——当你需要把最终回答展示给用户时,这个函数就很有用。

## 关键改进点

这些重构步骤,为健壮的工具处理做好了准备:

- **灵活的消息处理** —— 辅助函数现在能处理不同格式的消息
- **chat 函数支持工具** —— `chat` 函数能接收并透传工具 schema
- **返回完整消息** —— 你拿到的是完整的消息对象而不只是文本,所有的块都被保留了下来
- **文本提取工具** —— 能方便地从复杂消息中取出可读文本

有了这些基础,你就可以着手实现那个能自动处理多次工具调用的对话循环了,打造出一种顺畅的体验:Claude 可以按需调用任意多次工具,来完整地回答用户的问题。

---

对产品经理来说,这一课其实是在为「多步骤审批流」打地基:用户提一个需求,系统可能要经过好几道内部查询和计算才能给出最终答案,而不是一次调用就搞定。关键不是某一次调用本身,而是「循环 + 判断何时该停」这套机制——就像审批流程需要判断「还差哪个环节没走完」,走完才能给用户最终答复。
