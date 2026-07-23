# Claude with Google Vertex - 50 Extended thinking 扩展思考

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 50
> 课程: Claude with Google Vertex · 第 50 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

扩展思考(extended thinking)是 Claude 的高级推理能力,让模型在生成回复前有时间把复杂问题想清楚。开启后,Claude 会产出一段**可见的**思考过程,用户能查看它是怎么处理这个问题的。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621012%2F08_-_001_-_Extended_Thinking_01.1748621012415.png)

这个能力显著提升 Claude 处理复杂任务的准确性,但也有重要的取舍: **思考阶段生成的所有 token 都要计费**,而且额外的处理时间会增加响应延迟。关键在于判断: 提升的智力值不值这份成本和等待。

## When to Use Extended Thinking 什么时候用

要不要开启扩展思考,应该由**提示词评估结果**来驱动。推荐的做法:

1. 先在不开扩展思考的情况下写好并测试提示词
2. 跑评估来量化准确性
3. 如果在优化提示词之后结果仍达不到标准
4. 再考虑开启扩展思考作为解法

## How Extended Thinking Changes Responses 它如何改变响应结构

不开扩展思考时,流程很直接——你发一条含文本块的 user 消息,收到一条含文本块的 assistant 消息。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621013%2F08_-_001_-_Extended_Thinking_03.1748621013540.png)

开启之后,响应结构变化明显。你会收到一条含**两个不同块**的 assistant 消息:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621014%2F08_-_001_-_Extended_Thinking_04.1748621014052.png)

- 一个 **thinking 块**,装着 Claude 的推理过程
- 一个 **text 块**,装着最终回复

## The Signature System 签名机制

每个 thinking 块都带一个加密签名,用途很重要: 它保证你在后续对话轮次里带上这条消息时,**思考文本没有被篡改过**。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621015%2F08_-_001_-_Extended_Thinking_05.1748621014974.png)

Claude 在生成回复时高度依赖思考内容,所以防篡改对维持安全一致的行为至关重要。如果你改动了思考文本,签名校验会失败。

## Redacted Thinking 被屏蔽的思考

有时 Claude 的思考过程会被内部安全系统标记。这种情况下,你收到的不是原始思考文本,而是一个 **redacted thinking 块**。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621016%2F08_-_001_-_Extended_Thinking_07.1748621015793.png)

被屏蔽的内容里装的是加密形态的实际思考文本。你读不了它,但仍然可以在后续对话轮次里把这个块带上,这样 Claude 不会丢失此前推理的上下文。

## Implementation 实现

要在代码里开启扩展思考,给 chat 函数加两个新参数:

```python
def chat(
    messages,
    system=None,
    temperature=1.0,
    stop_sequences=[],
    tools=None,
    thinking=False,
    thinking_budget=1024
):
```

thinking budget 表示 Claude 用于推理的最大 token 数,**最小允许值是 1024**。重要的是: 你的 `max_tokens` 必须大于 thinking budget——budget 设 1024 的话,`max_tokens` 至少要 1025。

实践中你会想留出更大的余量。比如 budget 为 1024、`max_tokens` 为 4000 时,Claude 最多用 1024 个 token 思考,剩下最多 2976 个用于实际回复。

开启时把 thinking 配置加进 API 参数:

```python
if thinking:
    params["thinking"] = {
        "type": "enabled",
        "budget": thinking_budget
    }
```

## Testing Redacted Responses 测试被屏蔽的响应

开发时你可能想测试应用怎么处理 redacted thinking 块。在消息里加入这个特殊触发串,可以强制 Claude 返回被屏蔽的响应:

```
TRIGGER_REDACTED_THINKING_46C9A13E193C177646C7398A98432ECCCE4C1253D5E2D82641AC0E52CC2876CB
```

这能确保你的错误处理在生产环境遇到被屏蔽内容时正常工作。

对产品经理来说: 「先优化提示词,不行再开扩展思考」这个顺序是有成本原因的——**思考 token 是要计费的,而且往往比回复本身还长**。把它当成最后手段而不是默认开启,这条决策纪律能省下相当可观的支出。另外,那个触发串很有价值: 它意味着「被屏蔽」这个边界情况可以被主动测试,而不是等上线后撞见。要求工程侧覆盖这个用例是合理的。
