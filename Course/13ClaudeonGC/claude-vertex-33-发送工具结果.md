# Claude with Google Vertex - 33 Sending tool results 发送工具结果

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 33
> 课程: Claude with Google Vertex · 第 33 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

Claude 发出工具调用请求之后,你需要执行函数并把结果发回去。这一步完成整个工具使用工作流,把它要的信息交给它。

## Running the Tool Function 执行工具函数

Claude 返回工具使用块后,你从中取出输入参数并调用你的函数。取参数的方式:

```python
# 取到工具使用块
tool_use_block = response.content[1]

# 取出输入参数
input_params = tool_use_block.input

# 用这些参数调用你的函数
result = get_current_datetime(**input_params)
```

双星号 `**` 把字典展开成函数所需的关键字参数。

## Tool Result Block 工具结果块

执行完工具后,用一个**工具结果块**把结果发回给 Claude。这个块有几个重要属性:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619950%2F06_-_006_-_Sending_Tool_Results_05.1748619949924.png)

- **tool_use_id** —— 必须与原始工具使用块的 ID 一致
- **content** —— 你的工具函数的输出,转成字符串
- **is_error** —— 执行过程中出错时设为 `true`

## Handling Multiple Tool Calls 处理多个工具调用

Claude 可以在一次响应里请求多个工具调用。比如用户问 "What's 10 + 10 and what's 30 + 30?",Claude 可能发回两个独立的工具使用块:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619951%2F06_-_006_-_Sending_Tool_Results_07.1748619950833.png)

每个工具使用块有唯一的 ID,回传结果时必须对上这些 ID:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619951%2F06_-_006_-_Sending_Tool_Results_08.1748619951478.png)

这套 ID 机制保证 Claude 能把每个结果与对应的请求正确配对,**即使结果到达的顺序与请求顺序不同**。

## Sending the Follow-up Request 发出后续请求

后续请求必须包含完整的对话历史,外加新的工具结果:

```python
messages.append({
    "role": "user",
    "content": [{
        "type": "tool_result",
        "tool_use_id": response.content[1].id,
        "content": result,
        "is_error": False
    }]
})
```

对话流程是这样的:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619952%2F06_-_006_-_Sending_Tool_Results_04.1748619952295.png)

**记得在后续请求里也带上工具 schema**,即便 Claude 大概率不需要再调工具了——它需要这份 schema 才能理解对话历史里那些工具引用。

## Complete Workflow 完整流程

全过程:

1. 用户提出需要用工具的问题
2. Claude 返回工具使用块
3. 你执行被请求的工具函数
4. 你发出带工具结果的后续请求
5. Claude 利用工具输出给出最终答案

最后这个请求包含完整消息历史、工具结果块和工具 schema。Claude 随后返回一条普通文本消息,把你工具执行得到的信息融合进去。

对产品经理来说: 「结果到达顺序可以不同」这个设计细节,意味着多个工具调用**可以并行执行**。用户问一句话触发三次数据查询时,三次查询可以同时发出,总耗时按最慢那个算而不是三个相加。这是 AI 功能延迟优化里最直接的一招,值得在评审技术方案时确认工程实现有没有用上。
