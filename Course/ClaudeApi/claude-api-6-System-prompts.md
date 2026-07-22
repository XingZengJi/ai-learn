# Building with the Claude API - 6 System prompts 系统提示词

> Course: Building with the Claude API · Lesson 6
> 课程: Building with the Claude API · 第 6 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

System prompts are a powerful way to customize how Claude responds to user input. Instead of getting generic answers, you can shape Claude's tone, style, and approach to match your specific use case.

> 系统提示词(system prompt)是定制 Claude 如何响应用户输入的有力手段。有了它,你得到的不再是千篇一律的通用回答,而是可以塑造 Claude 的语气、风格和处理方式,让它贴合你的具体使用场景。

## Why System Prompts Matter 系统提示词为什么重要

Consider building a math tutor chatbot. When a student asks "How do I solve 5x + 2 = 3 for x?", you want Claude to act like a real tutor, not just spit out the answer. A good math tutor should:

> 设想你在做一个数学辅导聊天机器人。当学生问「5x + 2 = 3,x 该怎么解?」时,你希望 Claude 表现得像一位真正的辅导老师,而不是直接甩出答案。一位好的数学老师应该:

- Initially give hints rather than complete solutions
- Patiently walk students through problems step by step
- Show solutions for similar problems as examples

  先给提示而不是完整答案;耐心地一步步引导学生解题;用相似题目的解法作为示范。

You definitely don't want Claude to:

- Immediately give direct answers
- Tell students to just use a calculator

  你绝对不希望 Claude:直接给出答案;或者让学生「直接用计算器算算得了」。

## How System Prompts Work 系统提示词如何生效

System prompts provide Claude with guidance on how to respond. You define them as plain strings and pass them into the create function call. The key benefits are:

> 系统提示词为 Claude 提供「该如何回应」的指引。你把它写成一段普通字符串,传入 create 函数调用中。它的关键作用是:

- System prompts provide Claude guidance on how to respond
- Claude will try to respond in the same way someone in the specified role would respond
- Helps keep Claude on task

  为 Claude 的回应方式提供指引;让 Claude 尽量按照指定角色的方式来回应;帮助 Claude 专注在既定任务上,不跑偏。

Here's the basic structure:

> 基本结构如下:

```python
system_prompt = """
You are a patient math tutor.
Do not directly answer a student's questions.
Guide them to a solution step by step.
"""

client.messages.create(
    model=model,
    messages=messages,
    max_tokens=1000,
    system=system_prompt
)
```

## Seeing the Difference 效果对比

Without a system prompt, Claude gives a complete step-by-step solution immediately. This might be helpful, but it doesn't encourage the student to think through the problem themselves.

> 没有系统提示词时,Claude 会立刻给出完整的分步解答。这或许有帮助,但并不能鼓励学生自己动脑思考这道题。

With the math tutor system prompt, Claude's response changes dramatically. Instead of providing the full solution, Claude asks guiding questions like "What do you think would be a good first step to isolate x? Consider what operation we might need to perform on both sides to start moving terms around."

> 加上「数学辅导老师」这个系统提示词后,Claude 的回应会发生显著变化。它不再给出完整答案,而是抛出引导性的问题,比如:「你觉得要把 x 单独分离出来,第一步应该做什么?想一想我们需要对等式两边做什么运算,才能开始移项。」

## Building a Flexible Chat Function 构建更灵活的 chat 函数

Rather than hard-coding system prompts, you can make your chat function more reusable by accepting system prompts as parameters:

> 与其把系统提示词写死在代码里,不如让 chat 函数把系统提示词作为参数接收,这样更具复用性:

```python
def chat(messages, system=None):
    params = {
        "model": model,
        "max_tokens": 1000,
        "messages": messages,
    }
    
    if system:
        params["system"] = system
    
    message = client.messages.create(**params)
    return message.content[0].text
```

This approach handles an important detail: Claude's API doesn't accept system=None, so you need to conditionally include the system parameter only when it's provided.

> 这个写法处理了一个重要的细节:Claude 的 API 不接受 `system=None`,所以你需要有条件地判断——只有在提供了系统提示词时,才把 `system` 这个参数加进去。

Now you can call your chat function with or without a system prompt:

> 现在你可以选择带系统提示词或不带系统提示词来调用 chat 函数:

```python
# Without system prompt
answer = chat(messages)

# With system prompt
system = """
You are a patient math tutor.
Do not directly answer a student's questions.
Guide them to a solution step by step.
"""
answer = chat(messages, system=system)
```

System prompts are essential for creating AI applications that behave consistently and appropriately for their intended purpose. They transform generic AI responses into specialized, role-appropriate interactions.

> 系统提示词对于打造「行为一致、恰好符合预期用途」的 AI 应用至关重要。它能把通用的 AI 回答,转变成贴合特定角色、专业对口的交互。

对产品经理来说,系统提示词相当于给新员工的「岗位说明书」——同一个人(同一个 Claude),拿到「数学老师」的说明书就会耐心引导,拿到「客服专员」的说明书就会换一套语气和边界。写产品需求时,与其反复在每句提示词里重复「请像老师一样」,不如把这份「岗位说明书」定好、复用在每一次调用里。
