# Building with the Claude API - 30 Sending tool results 发送工具执行结果

> Course: Building with the Claude API · Lesson 30
> 课程: Building with the Claude API · 第 30 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

Claude 请求调用某个工具之后,你需要真正执行这个函数,再把结果发回去。这一步补上了工具使用流程的最后一环,把 Claude 想要的信息交还给它。

## 运行工具函数

当 Claude 返回一个工具使用块(ToolUse Block)时,你需要提取其中的输入参数,再调用对应的函数。获取工具参数的方式是:

```python
response.content[1].input
```

这会给你一个字典,里面是 Claude 想传给你函数的参数。由于你的函数期望的是关键字参数(keyword arguments)而不是一个字典,所以要用 Python 的解包语法:

```python
get_current_datetime(**response.content[1].input)
```

## 工具结果块

运行完工具函数后,你需要用一个「工具结果块(Tool Result Block)」把结果发回给 Claude。这个块要放在一条 `user` 消息里,告诉 Claude 执行这个工具后发生了什么。

工具结果块有几个重要属性:

- **tool_use_id** —— 必须和这条工具结果所对应的 ToolUse 块的 `id` 一致
- **content** —— 工具运行的输出,序列化成字符串
- **is_error** —— 如果执行过程中出错,设为 `True`

## 处理多个工具调用

Claude 可能在一次回复里请求多个工具调用。比如,如果用户问「10 加 10 是多少,30 加 30 又是多少?」,Claude 可能会返回两个独立的 ToolUse 块。

每次工具调用都有一个唯一的 ID,发回结果时你必须让这些 ID 对应上。这能确保即便结果的返回顺序和请求顺序不一致,Claude 也清楚地知道「这个结果对应的是哪个请求」。

## 搭建后续请求

你发给 Claude 的后续请求,必须包含完整的对话历史,再加上新的工具结果。结构如下:

```python
messages.append({
    "role": "user",
    "content": [{
        "type": "tool_result",
        "tool_use_id": response.content[1].id,
        "content": "15:04:22",
        "is_error": False
    }]
})
```

此时完整的消息历史包含:

1. 最初的用户消息
2. 带工具使用块的 assistant 消息
3. 带工具结果块的 user 消息

## 发起最终请求

发送这个后续请求时,即便你并不期望 Claude 再发起一次工具调用,也仍然必须带上工具 schema。因为 Claude 需要这份 schema,才能理解你对话历史里那些「工具引用」到底是什么意思。

```python
client.messages.create(
    model=model,
    max_tokens=1000,
    messages=messages,
    tools=[get_current_datetime_schema]
)
```

接下来,Claude 会返回一条最终消息,把工具执行结果自然地融入到给用户的回答里。至此,整个工具使用流程就完整走通了——你已经成功让 Claude 通过你的自定义函数获取到了实时信息。

---

对产品经理来说,「工具结果块」和「tool_use_id 对应」这套机制,本质上就是客服系统里「工单号」的作用:后台处理完一个请求后,回复时必须带上原始工单号,系统才知道这条结果是回应哪个请求的——尤其是同时有好几个请求在并行处理、返回顺序还可能打乱的时候,没有这个编号对应,系统就会张冠李戴。
