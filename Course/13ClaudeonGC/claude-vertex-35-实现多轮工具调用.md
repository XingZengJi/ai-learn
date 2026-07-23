# Claude with Google Vertex - 35 Implementing multiple turns 实现多轮工具调用

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 35
> 课程: Claude with Google Vertex · 第 35 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

搭一个带工具的对话系统,需要实现一个循环: 不断调用 Claude,直到它不再请求使用工具。Claude 不再要工具了,就说明它已经准备好给用户最终答案了。

## Detecting Tool Requests 判断它是否想用工具

判断 Claude 是否想用工具,关键在响应消息的 `stop_reason` 字段。当 Claude 决定要调用工具时,这个字段会被设成 `"tool_use"`。这给了我们一个干净的判断方式:

```python
if response.stop_reason != "tool_use":
    break  # Claude 说完了,不需要更多工具
```

## The Conversation Loop 对话循环

主对话函数的模式很简单:

```python
def run_conversation(messages):
    while True:
        response = chat(messages, tools=[get_current_datetime_schema])
        add_assistant_message(messages, response)
        print(text_from_message(response))
        
        if response.stop_reason != "tool_use":
            break
            
        tool_results = run_tools(response)
        add_user_message(messages, tool_results)
    
    return messages
```

循环一直转,直到 Claude 给出不带任何工具请求的最终答案。

## Handling Multiple Tool Calls 处理多个工具调用

Claude 可以在一次响应里请求多个工具。消息 content 里是一个块列表,我们要逐个处理每个工具使用块:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619959%2F06_-_008_-_Implementing_Multiple_Turns_05.1748619959308.png)

`run_tools` 函数先筛出工具使用块,再逐个处理:

```python
def run_tools(message):
    tool_requests = [
        block for block in message.content if block.type == "tool_use"
    ]
    tool_result_blocks = []
    
    for tool_request in tool_requests:
        # 处理每个工具请求...
```

## Tool Result Blocks 工具结果块

每个工具使用块,都要对应生成一个工具结果块。这些块有明确的必填字段:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619960%2F06_-_008_-_Implementing_Multiple_Turns_10.1748619960197.png)

工具结果块必须带上与原始工具使用块相同的 ID,放在 `tool_use_id` 字段里:

```python
tool_result_block = {
    "type": "tool_result",
    "tool_use_id": tool_request.id,
    "content": json.dumps(tool_output),
    "is_error": False
}
```

## Error Handling 错误处理

稳健的工具执行需要处理可能的错误。工具失败时,**仍然要返回一个工具结果块**,只是带上错误信息:

```python
try:
    tool_output = run_tool(tool_request.name, tool_request.input)
    tool_result_block = {
        "type": "tool_result",
        "tool_use_id": tool_request.id,
        "content": json.dumps(tool_output),
        "is_error": False
    }
except Exception as e:
    tool_result_block = {
        "type": "tool_result", 
        "tool_use_id": tool_request.id,
        "content": f"Error: {e}",
        "is_error": True
    }
```

## Scalable Tool Routing 可扩展的工具路由

要支持多个工具,把工具名的判断抽成一个独立的路由函数,而不是硬编码:

```python
def run_tool(tool_name, tool_input):
    if tool_name == "get_current_datetime":
        return get_current_datetime(**tool_input)
    elif tool_name == "other_tool":
        return other_tool_function(**tool_input)
    # 按需继续添加
```

这样加新工具时不用动核心对话逻辑。

## Complete Workflow 完整流程

完整的多轮对话是这样运作的:

1. 把用户消息连同可用工具发给 Claude
2. Claude 返回文本和/或工具使用块
3. 执行被请求的工具,生成工具结果块
4. 把工具结果作为一条 user 消息发回给 Claude
5. 重复,直到 Claude 给出不带工具请求的最终回复

这就形成了顺畅的体验: Claude 可以跨多个对话轮次做多次工具调用,收集齐所需信息后,再给用户一个完整的最终答案。

对产品经理来说: 注意错误处理那一段——工具失败时**不是抛异常中断,而是把错误当作一个正常的工具结果发回给模型**。这是智能体系统一个很不一样的容错思路: 失败信息本身也是上下文,模型看到「日期格式无效」后可能换个参数重试并成功。设计这类功能时,「失败」不必然等于「这一轮结束」。
