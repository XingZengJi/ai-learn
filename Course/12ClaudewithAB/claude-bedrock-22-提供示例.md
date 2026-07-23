# Claude with AWS Bedrock - 22 Providing Examples 提供示例

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 22
> 课程: Claude with AWS Bedrock · 第 22 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Providing examples in your prompts is one of the most effective prompt engineering techniques you'll use. This approach, known as "one-shot" or "multi-shot" prompting, involves giving Claude sample input/output pairs to guide its responses.

> 在提示词中提供示例,是你会用到的最有效的提示词工程技巧之一。这种方法被称为「单样本」(one-shot)或「多样本」(multi-shot)提示,做法是给 Claude 提供一些「输入/输出」的样本对,来引导它的响应。

## How Examples Work 示例是如何起作用的

Let's look at a sentiment analysis example. Say you want Claude to categorize whether a tweet is positive or negative:

> 我们来看一个情感分析的例子。假设你想让 Claude 判断一条推文是正面还是负面的:

The challenge here is sarcasm. A tweet like "Yeah, sure, that was the best movie I've seen since 'Plan 9 from Outer Space'" appears positive on the surface, but it's actually sarcastic and negative (Plan 9 from Outer Space is famously terrible).

> 这里的难点在于讽刺语气。像「是啊没错,这是我看过的最好的电影,自《外太空计划 9 号》以来最好的」这样一条推文,表面上看是正面的,但其实是讽刺、负面的意思(《外太空计划 9 号》是出了名的烂片)。

对产品经理来说,这就像判断客服工单里的「阴阳怪气」:客户说「哦真的太『棒』了,又等了三小时」,字面看着像夸奖,实际是抱怨。人能一下子听出弦外之音,但让 AI 也「听懂」这种言外之意,就需要给它看几个类似的例子,它才能学会识别这种模式。

## Adding Examples to Your Prompt 在提示词中加入示例

To handle this, you can add examples that show Claude exactly how to respond:

> 要处理这种情况,你可以加入示例,准确展示 Claude 该如何响应:

The key elements are:

> 关键要素包括:

- **Clear introduction:** "Here is a example input with an ideal response." **清晰的引导语:** 「这是一个示例输入,以及对应的理想响应。」
- **XML tags for structure:** `<sample_input>` and `<ideal_output>`. **用 XML 标签来构建结构:** `<sample_input>` 和 `<ideal_output>`。
- **Concrete examples** that demonstrate the desired behavior. **具体的示例**,展示你期望的行为方式。

## Handling Corner Cases 处理边界情况

For tricky scenarios like sarcasm, you can provide multiple examples (multi-shot prompting). Add context to highlight what Claude should watch for:

> 对于像讽刺语气这样棘手的场景,你可以提供多个示例(多样本提示)。加入上下文,提醒 Claude 需要特别留意什么:

```
Be especially careful with tweets that contain sarcasm.
For example:
<sample_input>
Oh yeah, I really needed a flight delay tonight! Excellent!
</sample_input>
<ideal_output>
Negative
</ideal_output>
```

## When to Use Examples 什么时候该用示例

Examples are particularly useful for:

> 示例特别适用于以下场景:

- Capturing corner cases or edge scenarios. 捕捉边界情况或特殊场景。
- Defining complex output formats (like specific JSON structures). 定义复杂的输出格式(比如特定的 JSON 结构)。
- Showing Claude exactly what "good" output looks like. 准确展示「好」的输出应该长什么样。

## Finding Good Examples from Evaluations 从评估结果中找出好的示例

When running prompt evaluations, look for your highest-scoring outputs in the HTML report. These make excellent examples to include in your prompt.

> 在运行提示词评估时,留意 HTML 报告中得分最高的那些输出结果。这些正是可以放进提示词里的绝佳示例。

Find a response that scored well (ideally a 10, or your highest score), then copy both the input and output to use as your example.

> 找到一条得分很高的响应(最好是满分 10 分,或者你评估中的最高分),把输入和输出都复制下来,作为你的示例使用。

## Adding Context to Examples 给示例加上背景说明

You can make examples even more effective by explaining why they're good. After your example output, add a brief explanation:

> 通过解释「这个示例为什么好」,能让示例发挥更大的效果。在示例输出之后,加上一段简短的说明:

```
<ideal_output>
[Your example output here]
</ideal_output>

This example meal plan is well-structured, provides detailed information on food choices and quantities, and aligns with the athlete's goals and restrictions.
```

This helps Claude understand not just what to produce, but why that output is considered ideal.

> 这能帮 Claude 不仅理解「该产出什么」,还能理解「为什么这个输出被认为是理想的」。

## Best Practices 最佳实践

- Use XML tags to clearly structure your examples. 用 XML 标签清晰地组织你的示例结构。
- Be explicit about what you're showing Claude. 明确说明你在向 Claude 展示什么。
- Choose representative examples that cover your most important use cases. 挑选有代表性的示例,覆盖你最重要的使用场景。
- Include corner cases that might trip up the model. 加入可能会让模型出错的边界情况。
- Explain why examples are good when it's not obvious. 当「为什么这个示例好」不是很明显时,加以解释说明。

One-shot and multi-shot prompting will quickly become essential tools in your prompt engineering toolkit, especially when you need consistent, well-formatted outputs or want to handle tricky edge cases reliably.

> 单样本和多样本提示很快就会成为你提示词工程工具箱里不可或缺的工具——尤其是当你需要一致、格式规范的输出,或者想可靠地处理棘手的边界情况时。
