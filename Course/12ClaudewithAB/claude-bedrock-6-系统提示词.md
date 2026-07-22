# Claude with AWS Bedrock - 6 System Prompts 系统提示词

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 6
> 课程: Claude with AWS Bedrock · 第 6 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When building AI chatbots for specific use cases, you need a way to control how the AI responds. System prompts are the key to transforming a general-purpose AI into a specialized assistant that follows specific guidelines and stays on topic.

> 当你为特定用途构建 AI 聊天机器人时,需要一种方法来控制 AI 的响应方式。系统提示词(system prompt)正是把一个通用型 AI,转变为遵循特定准则、始终围绕主题的专业助手的关键。

## The Problem with User-Level Instructions 用户层级指令存在的问题

You might think the solution is to include all your requirements in the user message itself. For example, telling the AI in each conversation to "mention AWS services" and "don't mention competitors." This approach has serious limitations:

> 你可能会觉得,解决办法就是把所有要求都塞进用户消息本身。比如,在每次对话中都告诉 AI「要提到 AWS 服务」「不要提到竞争对手」。但这种做法存在严重的局限性:

- You'd need to anticipate every possible question and edge case. 你得预先想到每一个可能的问题和边界情况。
- The instruction list becomes unwieldy and repetitive. 指令清单会变得又长又重复,难以维护。
- Users see all the internal instructions, making conversations cluttered. 用户会看到所有这些内部指令,让对话变得杂乱。
- Requirements change based on the specific question being asked. 要求还会随着具体问题的不同而变化。

## System Prompts: A Better Approach 系统提示词:更好的方案

System prompts solve this problem by giving Claude a role to play. Instead of listing specific do's and don'ts, you tell Claude to act like a particular type of professional. The AI then responds as that person would naturally respond.

> 系统提示词通过给 Claude 分配一个「角色」来解决这个问题。你不需要罗列具体的「该做什么、不该做什么」,而是直接告诉 Claude 扮演某一类专业人士。这样一来,AI 就会像那个角色本来会做的那样自然地回应。

对产品经理来说,这就像给新入职的客服写「岗位说明」和只写「话术禁忌清单」的区别:后者永远列不完,新场景一来就露怯;前者只需要说清楚「你是谁、你的职责是什么」,对方自己就能在各种场景下做出得体的反应。系统提示词就是在给 Claude 写这份「岗位说明」。

System prompts provide several key benefits:

> 系统提示词能带来以下几个关键好处:

- Claude gets guidance on how to respond consistently. Claude 会得到关于「如何保持响应一致性」的指引。
- The AI adopts the mindset and constraints of the specified role. AI 会采纳所指定角色的思维方式和限制条件。
- Responses stay focused and on-brand automatically. 响应会自动保持聚焦、符合品牌调性。
- You don't need to anticipate every possible scenario. 你不需要预先想到每一种可能的场景。

## Implementing System Prompts 实现系统提示词

To add a system prompt to your Claude conversation, you pass it as a parameter to the `converse` function:

> 要给你与 Claude 的对话加上系统提示词,把它作为参数传给 `converse` 函数即可:

```python
system_prompt = """
You are an AWS cloud support specialist. Your job is to answer user queries related 
to cloud hosting services on AWS.
"""

response = client.converse(
    modelId=model_id, 
    messages=messages, 
    system=[{"text": system_prompt}]
)
```

The system prompt gets passed as a list containing a dictionary with a "text" key. This tells Claude what role to adopt before it sees any user messages.

> 系统提示词是以「一个包含 `text` 键的字典所构成的列表」这种形式传入的。这会在 Claude 看到任何用户消息之前,就告诉它应该采用什么角色。

## Building a Flexible Chat Function 构建一个灵活的聊天函数

Here's a reusable chat function that handles system prompts elegantly:

> 下面是一个可复用的聊天函数,它能优雅地处理系统提示词:

```python
def chat(messages, system=None):
    params = {"modelId": model_id, "messages": messages}
    
    if system:
        params["system"] = [{"text": system}]
    
    response = client.converse(**params)
    
    return response["output"]["message"]["content"][0]["text"]
```

This approach lets you optionally include a system prompt. When no system prompt is provided, Claude responds as its default self. When you include one, Claude adopts that specific role.

> 这种写法让系统提示词变成了可选参数。不提供系统提示词时,Claude 就以它默认的样子来回应;提供了系统提示词,Claude 就会采纳那个特定的角色。

## System Prompts in Action 系统提示词的实际效果

The difference is immediately apparent when you test the same question with and without a system prompt. Ask "How do I host a Postgres database?" without a system prompt, and you'll get a comprehensive answer covering multiple cloud providers and self-hosting options.

> 用同一个问题分别在「有系统提示词」和「没有系统提示词」两种情况下测试,差异立刻就能看出来。在没有系统提示词的情况下问「我该如何托管一个 Postgres 数据库?」,你会得到一个覆盖多个云服务商和自托管选项的全面回答。

With an AWS support specialist system prompt, the response focuses exclusively on AWS solutions like RDS, Aurora, and EC2-based deployments. No competitors mentioned, and the answer includes AWS-specific setup steps.

> 而有了「AWS 支持专家」这个系统提示词,回答就会完全聚焦在 RDS、Aurora、基于 EC2 的部署等 AWS 方案上。不会提到任何竞争对手,而且答案会包含 AWS 特有的设置步骤。

Even more impressive is how system prompts handle off-topic questions. Ask for a bread recipe with the AWS specialist prompt active, and Claude politely declines while staying in character:

> 更让人印象深刻的是,系统提示词处理「跑题」问题的方式。在「AWS 专家」系统提示词生效的情况下问一个面包食谱,Claude 会礼貌地拒绝,同时始终保持在角色设定之内:

## Important Technical Details 需要注意的技术细节

When working with system prompts, keep these requirements in mind:

> 使用系统提示词时,请牢记以下要求:

- System prompts cannot be empty strings - they must contain at least one character. 系统提示词不能是空字符串——必须至少包含一个字符。
- The system parameter expects a list of dictionaries with "text" keys. `system` 参数需要的是一个由带 `text` 键的字典组成的列表。
- System prompts are processed before any user messages in the conversation. 系统提示词会在对话中的任何用户消息之前被处理。
- You can update the system prompt between conversations, but not mid-conversation. 你可以在不同的对话之间更新系统提示词,但不能在同一段对话进行到一半时更新它。

System prompts give you powerful control over AI behavior without complex rule systems. By assigning Claude a specific professional role, you get consistent, appropriate responses that naturally follow the constraints and expertise of that role.

> 系统提示词让你无需搭建复杂的规则系统,就能对 AI 的行为拥有强大的掌控力。通过给 Claude 分配一个特定的专业角色,你得到的响应会自然而然地遵循那个角色的限制条件和专业范围,保持一致且恰当。

## Downloads 课程配套文件

- `002_System_Messages.ipynb`(在新标签页打开)
- `002_System_Messages_complete.ipynb`(在新标签页打开)
