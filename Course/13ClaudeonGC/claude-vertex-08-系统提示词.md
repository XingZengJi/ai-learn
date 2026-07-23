# Claude with Google Vertex - 08 System prompts 系统提示词

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 08
> 课程: Claude with Google Vertex · 第 08 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

系统提示词(system prompt)是定制 Claude 回应方式的有力手段。有了它,你拿到的就不再是泛泛的通用回答,而是语气、风格、处理思路都贴合你具体场景的回答。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619444%2F03_-_006_-_System_Prompts_00.1748619444467.png)

## Why System Prompts Matter 为什么系统提示词重要

设想你在做一个数学辅导聊天机器人。学生问 "How do I solve 5x + 2 = 3 for x?" 时,你希望 Claude 表现得像一位真正的辅导老师,而不是直接把答案吐出来。好的数学辅导老师应该:

- 一开始给提示,而不是给完整解法
- 有耐心地一步步引导学生
- 用同类题目的解法作为示例

你显然**不希望** Claude:

- 上来就给出直接答案
- 让学生「自己拿计算器算」

## How System Prompts Work 系统提示词怎么工作

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619445%2F03_-_006_-_System_Prompts_05.1748619444941.png)

系统提示词为 Claude 提供「该怎么回应」的指引。你把它定义成普通字符串,传进 `create` 调用即可。关键收益:

- 给 Claude 关于回应方式的指引
- Claude 会尽量按你指定的那个角色该有的方式来回应
- 有助于让 Claude 不跑题

基本结构:

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

不加系统提示词时,Claude 会立刻给出完整的分步解法。这或许有用,但它没有促使学生自己去想。

加上「数学辅导老师」这个系统提示词后,回应变化非常明显。Claude 不再给完整解法,而是抛出引导性问题,比如「你觉得第一步该怎么做才能把 x 分离出来?想一想我们要在等式两边做什么运算,才能开始移项?」

## Building a Flexible Chat Function 写一个灵活的 chat 函数

与其把系统提示词写死,不如让 `chat` 函数把它作为参数接收,复用性更好:

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

这个写法处理了一个重要细节: Claude 的 API **不接受** `system=None`,所以只有在真的传了系统提示词时,才把 `system` 参数加进去。

现在带不带系统提示词都能调:

```python
# 不带系统提示词
answer = chat(messages)

# 带系统提示词
system = """
You are a patient math tutor.
Do not directly answer a student's questions.
Guide them to a solution step by step.
"""
answer = chat(messages, system=system)
```

系统提示词是做出「行为稳定、符合用途」的 AI 应用的必备工具。它把泛泛的 AI 回答变成有专业角色感的交互。

对产品经理来说: 系统提示词其实就是**产品定义写进代码的那一层**。「不要直接给答案」这句话,本质上是一条产品规则,只不过写成了自然语言而不是 if-else。这意味着你可以直接参与调这一层——不需要工程师翻译,但也意味着这层规则的严谨程度全靠措辞,所以后面「提示词工程」那几课值得认真看。
