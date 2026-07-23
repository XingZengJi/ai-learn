# Claude with AWS Bedrock - 44 Extended thinking 扩展思考

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 44
> 课程: Claude with AWS Bedrock · 第 44 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Extended thinking is Claude's advanced feature that gives the model time to reason through complex problems before generating a final response. Think of it as Claude's internal monologue - you can see how it approaches your problem step by step.

> 扩展思考(Extended thinking)是 Claude 的一项高级功能: 在生成最终回答之前,先给模型一段时间去推理复杂问题。你可以把它理解为 Claude 的内心独白——你能看到它是如何一步步处理你的问题的。

## How Extended Thinking Works 扩展思考的运作方式

When you enable extended thinking, Claude's response includes two parts instead of one:

> 启用扩展思考后,Claude 的回复会从一部分变成两部分:

1. **Reasoning Content Part** 推理内容部分 - Claude's internal thinking process. Claude 的内部思考过程。
2. **Text Part** 文本部分 - The final response you actually wanted. 你真正想要的最终回答。

The reasoning content shows you exactly how Claude breaks down your problem, what it considers, and how it arrives at its final answer. This transparency can be incredibly valuable for understanding and debugging complex tasks.

> 推理内容会明明白白地展示 Claude 如何拆解你的问题、考虑了哪些因素、又是怎么得出最终答案的。这种透明度在理解和调试复杂任务时非常有价值。

## Trade-offs to Consider 需要权衡的取舍

Extended thinking comes with clear benefits and costs:

> 扩展思考的收益和代价都很明确:

- Better accuracy on complex tasks. 复杂任务上的准确率更高。
- Higher cost - you pay for all thinking tokens. 成本更高——所有思考 token 都要付费。
- Increased latency - thinking takes time. 延迟增加——思考是要花时间的。

The key decision point is simple: use your evaluations. If you've already optimized your prompt but still aren't getting the accuracy you need, that's when extended thinking becomes worth considering.

> 决策的关键点很简单: **看你的评估结果**。如果你已经把提示词优化过了,准确率还是达不到要求,这时候才值得考虑上扩展思考。

对产品经理来说,这就像给一个岗位配「先写方案再执行」的流程: 复杂项目上确实少犯错,但每件事都要求先写方案,团队就会又慢又贵。所以先把需求文档(提示词)写清楚,实在还不行,再加这道流程。

## The Signature System 签名机制

One important detail you'll notice immediately is the cryptographic signature attached to reasoning content:

> 有个细节你一眼就会注意到: 推理内容上附带了一个加密签名。

This signature ensures you can't modify the thinking text. If you want to include Claude's previous reasoning in a follow-up conversation, the signature verifies the content hasn't been tampered with. This prevents potential safety issues from modified reasoning text.

> 这个签名保证了思考文本不能被你改动。如果你想在后续对话中带上 Claude 之前的推理内容,签名会验证这段内容没有被篡改过。这样可以避免被修改的推理文本带来的潜在安全问题。

## Redacted Content 被屏蔽的内容

Sometimes Claude's thinking gets flagged by safety systems. When this happens, you'll receive a `redactedContent` field instead of readable thinking text:

> 有时候 Claude 的思考内容会被安全系统标记。这种情况下,你拿到的不是可读的思考文本,而是一个 `redactedContent` 字段。

The redacted content is encrypted but still functional - you can pass it back to Claude in future conversations without losing context. It's just not readable to you as a developer.

> 被屏蔽的内容是加密的,但依然可用——你可以在后续对话中把它原样传回给 Claude,不会丢失上下文。只是作为开发者,你自己读不了它。

## Implementation 实现

To enable extended thinking, you need to modify your API call with two parameters:

> 要启用扩展思考,你需要在 API 调用里加上两个参数:

```python
additional_model_fields["thinking"] = {
    "type": "enabled",
    "budget_tokens": thinking_budget
}
```

The `thinking_budget` controls how many tokens Claude can spend on reasoning. The minimum is 1024 tokens, but you might need more for complex problems. Like everything else with Claude, use your evaluations to find the right budget for your use case.

> `thinking_budget` 控制 Claude 最多能在推理上花多少 token。最小值是 1024 个 token,复杂问题可能需要更多。和 Claude 的其他一切一样: 用你的评估来找出适合自己场景的预算值。

Here's how the updated chat function looks:

> 更新后的 chat 函数长这样:

```python
def chat(
    messages,
    system=None,
    temperature=1.0,
    stop_sequences=[],
    tools=None,
    tool_choice="auto",
    text_editor=None,
    thinking=False,
    thinking_budget=1024
):
```

> 代码在做什么: 在原有的 chat 函数上新增 `thinking`(是否开启)和 `thinking_budget`(思考预算)两个参数,默认关闭、默认预算 1024。这样调用方可以按需开关,不影响原有调用。

## Testing Your Implementation 测试你的实现

When building applications that handle extended thinking, you'll want to test both normal reasoning content and redacted content scenarios. There's actually a special test string that forces Claude to return redacted content - useful for making sure your code handles both cases properly.

> 在构建支持扩展思考的应用时,你需要把「正常推理内容」和「被屏蔽内容」两种情况都测到。实际上有一个专门的测试字符串,可以强制 Claude 返回被屏蔽的内容——用来确认你的代码能正确处理这两种情况。

The most important takeaway about extended thinking is that the decision to use it should always be data-driven. Run your evaluations first, optimize your prompts, and only then consider extended thinking if you need that extra boost in accuracy for complex tasks.

> 关于扩展思考,最重要的一条结论是: 用不用它,永远应该由数据来决定。先跑评估,再优化提示词,只有当复杂任务确实需要那额外一点准确率提升时,才考虑启用扩展思考。
