# Building with the Claude API - 32 Implementing multiple turns 实现多轮对话

> Course: Building with the Claude API · Lesson 32
> 课程: Building with the Claude API · 第 32 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

搭建一个带工具的对话系统,需要实现一个循环:不断调用 Claude,直到它不再请求使用工具为止。当 Claude 不再请求工具时,就说明它已经准备好给用户最终答案了。

## 判断 Claude 是否请求了工具

判断 Claude 是否想用工具的关键,在于响应消息的 `stop_reason` 字段。当 Claude 判断自己需要调用工具时,这个字段会被设为 `"tool_use"`。这给了我们一种简单明确的方式来判断是否需要继续对话循环:

```python
if response.stop_reason != "tool_use":
    break  # Claude 已经给出结论,不再需要工具了
```

## 对话循环主体

主对话函数遵循一个简单的模式:

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

这个循环会一直运行,直到 Claude 给出一个不再请求任何工具的最终答案为止。

## 处理多个工具调用

Claude 可以在一次响应里请求多个工具。消息的 `content` 是一个块的列表,我们需要分别处理每一个工具使用块。

`run_tools` 函数的做法是,先筛选出所有工具使用块,再逐一处理:

```python
def run_tools(message):
    tool_requests = [
        block for block in message.content if block.type == "tool_use"
    ]
    tool_result_blocks = []
    
    for tool_request in tool_requests:
        # 处理每一个工具请求...
```

## 工具结果块

每一个工具使用块,都必须对应一个工具结果块来回应。两者之间靠匹配的 ID 关联起来。

工具结果块的结构是这样的:

```python
tool_result_block = {
    "type": "tool_result",
    "tool_use_id": tool_request.id,
    "content": json.dumps(tool_output),
    "is_error": False
}
```

## 错误处理

健壮的工具执行需要处理可能出现的错误。即使工具调用失败,你也仍然需要给 Claude 提供一个结果块:

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

## 可扩展的工具路由

要支持多个工具,创建一个路由函数,把工具名映射到对应的实现:

```python
def run_tool(tool_name, tool_input):
    if tool_name == "get_current_datetime":
        return get_current_datetime(**tool_input)
    elif tool_name == "another_tool":
        return another_tool(**tool_input)
    # 按需添加更多工具
```

这种方式让你能轻松添加新工具,而不需要改动核心的对话逻辑。

## 完整流程

完整的多轮对话是这样运作的:

1. 把用户消息连同可用工具一起发给 Claude
2. Claude 返回文本和/或工具请求
3. 执行所有被请求的工具,创建结果块
4. 把工具结果作为一条用户消息发回去
5. 重复以上步骤,直到 Claude 给出最终答案

这样就能打造出一种流畅的体验:Claude 可以在多个回合中使用多个工具,完整地回答复杂的用户请求。对话历史会保留完整的上下文,让 Claude 能在之前的工具结果基础上,给出全面的回答。

---

对产品经理来说,`stop_reason` 这个字段就像审批系统里的「流程状态位」:等于「待补充材料」就继续走流程、还不能给用户答复;等于「已完结」才能推送最终结果。而「错误也要有结果块」这一条,对应的是「审批环节出错也要留痕、不能直接卡死流程」——出错了要把错误信息传回去,让流程能继续往下走或者优雅终止,而不是整个系统卡住不动。
