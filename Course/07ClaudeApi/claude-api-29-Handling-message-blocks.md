# Building with the Claude API - 29 Handling message blocks 处理消息块

> Course: Building with the Claude API · Lesson 29
> 课程: Building with the Claude API · 第 29 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

用上 Claude 的工具功能后,你会遇到一种新的响应结构,和你之前见过的简单文本回复不一样。Claude 现在返回的不再只是单个文本块,而可能是包含文本和工具使用信息的「多块消息(multi-block message)」。

## 发起支持工具调用的 API 请求

要让 Claude 能使用工具,你需要在 API 请求里加上 `tools` 参数。请求结构如下:

```python
messages = []
messages.append({
    "role": "user",
    "content": "What is the exact time, formatted as HH:MM:SS?"
})

response = client.messages.create(
    model=model,
    max_tokens=1000,
    messages=messages,
    tools=[get_current_datetime_schema],
)
```

`tools` 参数接受一个 JSON schema 列表,描述 Claude 可以调用的可用函数。

## 理解多块消息

当 Claude 决定要用某个工具时,它返回的 assistant 消息的 `content` 列表里会包含多个块。相比你之前接触的纯文本回复,这是一个不小的变化。

一条多块消息通常包含:

- **文本块(Text Block)**——人类可读的文字,说明 Claude 正在做什么(比如「我可以帮你查现在的时间,让我来查一下」)
- **工具使用块(ToolUse Block)**——给你的代码的指令,说明该调用哪个工具、传什么参数

ToolUse 块里包括:

- 一个用于追踪这次工具调用的 ID
- 要调用的函数名(比如 `get_current_datetime`)
- 以字典形式给出的输入参数
- 类型标记 `"tool_use"`

## 用多块消息管理对话历史

记住,Claude 不会自己保存对话历史——你需要手动管理。处理工具响应时,必须把整个 `content` 结构完整保留下来,包括其中所有的块。

把一条多块的 assistant 消息正确地追加进对话历史,应该这样做:

```python
messages.append({
    "role": "assistant",
    "content": response.content
})
```

这样能同时保留文本块和工具使用块——这对于后续 API 调用时保持完整的对话上下文至关重要。

## 完整的工具使用流程

工具使用的流程遵循这样的模式:

1. 把带有工具 schema 的用户消息发给 Claude
2. 收到包含文本块和工具使用块的 assistant 消息
3. 提取工具调用信息,执行实际的函数
4. 把工具执行结果连同完整对话历史一起发回给 Claude
5. 收到 Claude 的最终回答

每一步都需要仔细处理消息结构,确保 Claude 拥有生成准确回答所需的完整上下文。

## 更新辅助函数

如果你之前一直在用 `add_user_message()`、`add_assistant_message()` 这类辅助函数,现在需要更新它们以支持多块内容。目前的版本大概率只支持单一文本块,但现在它们需要能容纳更复杂的内容结构,包括工具使用块在内。

正确处理多块消息,是搭建能顺畅集成 Claude 工具能力、同时保持对话流程完整的健壮应用的关键一环。

---

对产品经理来说,「多块消息」有点像客服工单系统里的一条记录:它既包含给用户看的话术(文本块),又包含给后台系统的操作指令(工具使用块,比如「查一下这个订单的物流状态」)。处理这类记录时,不能只截取「客服说了什么」就存档,必须把「说的话」和「下发的操作指令」一起完整保存,不然下一轮对话时系统会丢失上下文,不知道自己之前已经发起过这个操作。
