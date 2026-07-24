# Claude Platform 101 - 04 The agent loop explained 智能体循环详解

> Course: Claude Platform 101 · Lesson 4 · 章节: Teaching your Agent
> 课程: Claude Platform 101(Claude 开发者平台入门)· 第 4 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文整理翻译,2026-07-24

单次调用只返回一个响应。**要自动化一整套流程,Claude 需要「行动 → 看结果 → 决定下一步 → 继续」**——这个模式就是人们说的**智能体工作流(agentic workflow)**。

## 智能体到底是什么

**智能体是自主版的 Claude,在没有人类居中的情况下跑完消息循环的两端。** 它接到任务、挑选工具、循环执行,直到 Claude 认为任务完成。

最简单的实现形态:

1. 给 Claude 发消息,**同时告诉它有哪些工具可用**
2. Claude 回复: **要么是最终答案,要么是一个使用工具的请求**
3. **你的代码执行那个工具**
4. 你把结果发回给 Claude
5. **重复,直到 stop reason 是 `end_turn`**

可以把它想成一场轮流发言的对话: 用户起头,智能体调工具,工具返回结果,智能体继续,直到有了答案。

## 一个最小可运行的例子

为了不牵扯数据库和界面,用一个假的 `get_weather` 工具,问 Claude「今天在 Austin 该穿什么」。**Claude 自己不可能知道天气,所以它必须调用工具、读结果,然后才能回答。**

```python
import anthropic

client = anthropic.Anthropic()

# tools 数组告诉 Claude 有什么可用：
# 一个名字、一段描述、以及输入的 JSON schema。
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "The city to get weather for",
                }
            },
            "required": ["city"],
        },
    }
]

# run_tool 只是一个写死的查表。
# 真实应用里，这里会去查你的数据库、某个 API，等等。
def run_tool(name, tool_input):
    if name == "get_weather":
        return f"Weather in {tool_input['city']}: 95F, sunny"
    raise ValueError(f"Unknown tool: {name}")

messages = [
    {"role": "user", "content": "What should I wear in Austin today?"}
]

# 智能体循环。每一轮把 messages 发给 Claude，
# 然后根据响应的 stop reason 分支。
while True:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        tools=tools,
        messages=messages,
    )

    if response.stop_reason == "end_turn":
        # Claude 结束了。打印最终文本并跳出。
        for block in response.content:
            if block.type == "text":
                print(block.text)
        break

    if response.stop_reason == "tool_use":
        # 找出响应里的 tool_use 块，逐个执行。
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = run_tool(block.name, block.input)
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    }
                )

        # 把助手的响应和我们的工具结果都推回 messages，
        # 然后再循环一次，让 Claude 作答。
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})
```

**三块值得注意:**

- **`tools` 数组**告诉 Claude 有什么可用: 名字、描述、输入的 JSON schema
- **`run_tool` 只是写死的查表**,真实应用里它会去打数据库或 API
- **那个 `while` 就是智能体循环**: 每轮发消息、按 stop reason 分支。`end_turn` 就打印并跳出;`tool_use` 就执行工具、把助手响应与工具结果推回 `messages`,再循环

## 跑起来会看到什么

![运行结果](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1781017785%2F04-the-agent-loop-explained_11.1781017785032.png)

**两轮:**

- **第一轮**: stop reason 是 `tool_use`。Claude 请求对 Austin 调用 `get_weather`,你的代码返回温度与天气
- **第二轮**: stop reason 是 `end_turn`,Claude 告诉你穿轻薄透气的

**两次 API 调用、一次工具执行、一个最终答案。这就是整个循环——你用 Claude API 构建的一切都跟这个类似。**

## 同一个循环在生产环境

![生产环境](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1781017785%2F04-the-agent-loop-explained_12.1781017785606.png)

同样的循环可以驱动一个「自动审查」接口: 一个合规智能体读取结构报告、**通过工具查阅相关建筑规范**、然后把风险发现逐条写回数据库。

**循环的形状和你刚跑的一模一样**,差别只在:

- **真实工具**,而不是假的天气查询
- 结果以 **server-sent events** 流式回传给界面
- **发现被持久化**到风险表里

![持久化](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1781017786%2F04-the-agent-loop-explained_13.1781017786389.png)

## Recap 本课要点

- **智能体就是「循环中的 Claude」**: 观察、决定、行动、重复
- 循环很简单: **带工具发消息 → 执行 Claude 请求的工具 → 把结果喂回去 → stop reason 为 `end_turn` 时停止**
- **循环和工具归你,推理归 Claude**
- **同一个循环形状,从假天气 demo 一路扩展到生产合规智能体**——变的只有工具和周边管道
- **当你不想自己拥有这个循环时,托管智能体会在 Anthropic 的基础设施上替你跑同样的循环**

## 对产品经理来说

**「你拥有循环和工具,Claude 拥有推理」——这句话划清了责任边界**,也解释了为什么智能体产品的可靠性主要取决于你而不是模型: **工具写得对不对、结果喂回去准不准、什么时候该停,全是你的代码在决定。**

**这一课最值钱的认知是「循环的形状不变」。** demo 和生产系统的差别不在 AI 逻辑,而在: 真实工具、流式传输、持久化。这意味着**智能体功能的工作量估算,大头在集成而非 AI**——和第 2 课那句「同一个调用,只是包在路由里」是同一个观察在更复杂场景下的重现。

另外注意 **`stop_reason` 这个概念**: 它是整个循环的分支依据。对 PM 来说不必记语法,但要理解**「Claude 主动请求调用工具」和「Claude 给出最终答案」是两种不同的返回状态**——很多智能体故障(卡住、无限循环、该调工具时不调)都能追溯到这里的处理。

---

*原课程 © Anthropic,本篇为中文整理存档,供个人学习使用。*
