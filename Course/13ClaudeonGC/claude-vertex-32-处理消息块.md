# Claude with Google Vertex - 32 Handling message blocks 处理消息块

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 32
> 课程: Claude with Google Vertex · 第 32 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

开始用 Claude 的工具功能后,你会遇到一种新的响应结构,跟之前那种简单的纯文本响应不同。Claude 不再只返回一个文本块,而是可能返回**多块消息**,里面既有文本也有工具使用信息。

## Making Tool-Enabled API Calls 发起带工具的 API 调用

要让 Claude 能用工具,在 API 调用里加上 `tools` 参数:

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

`tools` 参数接收一个 JSON schema 列表,描述 Claude 可以调用的函数。

## Understanding Multi-Block Messages 理解多块消息

当 Claude 决定使用工具时,它返回的 assistant 消息的 `content` 列表里会有多个块。这跟你之前接触的纯文本响应有很大区别。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619699%2F06_-_005_-_Handling_Message_Blocks_08.1748619699629.png)

一条多块消息通常包含:

- **Text Block 文本块** —— 给人看的、说明 Claude 正在做什么的文字(比如「我可以帮你查当前时间,让我去查一下」)
- **ToolUse Block 工具使用块** —— 给你代码看的指令: 调哪个工具、用什么参数

ToolUse 块包含:

- 一个用于追踪这次工具调用的 **ID**
- 要调用的函数名(如 `"get_current_datetime"`)
- 按你的 JSON schema 组织的输入参数
- 类型标记 `"tool_use"`

## Handling Message History with Multi-Block Content 多块内容下的消息历史管理

这里是关键: Claude 不保存对话历史,所以必须由你手动管理。处理工具响应时,你需要**保留完整的 content 结构,包括全部块**。

不能只把文本抽出来,要把完整的响应内容原样追加进去:

```python
messages.append({
    "role": "assistant",
    "content": response.content
})
```

这样文本块和工具使用块都保留下来了,后续 API 调用才有完整的对话上下文。

## The Complete Flow 完整流程

工具使用过程遵循这个模式:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619700%2F06_-_005_-_Handling_Message_Blocks_15.1748619700334.png)

1. 把用户消息连同工具 schema 发给 Claude
2. 收到多块 assistant 消息(文本 + 工具使用)
3. 提取工具调用信息并执行函数
4. 把工具结果连同完整消息历史发回给 Claude
5. 收到 Claude 的最终回复

每一步都需要小心处理消息结构以维持对话连续性。核心认知是: 带工具的对话消息格式更复杂了,但「必须维护完整消息历史」这个根本原则没变。

## Updating Helper Functions 更新辅助函数

如果你一直在用 `add_user_message` / `add_assistant_message` 这类辅助函数,现在得改造它们来处理多块内容。现有版本大概只支持单个文本块,而现在需要能容纳包含工具使用块的复杂内容结构。

对产品经理来说: 这一课有一个容易被忽略的运维影响——**存储成本**。以前一轮对话存一段文本就够了,现在每一轮可能包含文本块、工具调用块、工具结果块。真实的智能体对话,消息历史体积会比纯聊天大出一个数量级。做数据库容量和上下文窗口预估时,不能拿纯聊天的经验值去套。
