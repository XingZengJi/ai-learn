# Claude with AWS Bedrock - 1 Overview of Claude Models Claude 模型概览

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 1
> 课程: Claude with AWS Bedrock · 第 1 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Claude offers three core model families - Opus, Sonnet, and Haiku - each optimized for different priorities, plus Claude Fable 5, a new model tier that sits above Claude Opus. All of these models share Claude's core capabilities - they can handle text generation, coding, image analysis, and other tasks. The key difference is how they balance intelligence, speed, and cost.

> Claude 提供三大核心模型系列——Opus、Sonnet、Haiku——各自针对不同的优先级做了优化,此外还有 Claude Fable 5,这是一个位于 Claude Opus 之上的全新模型层级。所有这些模型都共享 Claude 的核心能力——它们都能处理文本生成、编码、图像分析等各类任务。它们之间的关键区别在于:如何在「智能水平」「速度」「成本」这三者之间做取舍平衡。

对产品经理来说,可以把这几个模型类比成外卖平台上不同档位的骑手:「快送」最快但只能送轻量简单的订单(Haiku),「标准配送」速度和成本都比较均衡、适合大多数场景(Sonnet),「重货专送」能处理复杂大件但速度慢些、费用也高(Opus),而 Fable 5 则是「特种专线」——专门啃最难啃的骨头,费用最高,只有真正值得的订单才会用它。

### Claude Fable 5

Claude Fable 5 is our most capable model yet. It's a new model tier that sits above Claude Opus, built for your toughest challenges. Anthropic launched this new model family in June 2026 — read more in the launch announcement.

> Claude Fable 5 是我们目前能力最强的模型。它是一个位于 Claude Opus 之上的全新模型层级,专为你最棘手的挑战而生。Anthropic 在 2026 年 6 月推出了这个全新的模型系列——详情可参阅发布公告。

Fable 5 isn't a replacement for the core families, and it isn't the default choice for most work. It comes at a significantly higher cost than Opus, so it's best reserved for tasks where that extra capability is worth paying for.

> Fable 5 并不是要取代这三大核心系列,对于大多数工作来说,它也不是默认选项。它的成本比 Opus 高出不少,所以最好把它留给那些「多花的这笔钱确实值得」的任务。

On Amazon Bedrock, Fable 5 is available with the model ID `anthropic.claude-fable-5`.

> 在 Amazon Bedrock 上,Fable 5 对应的模型 ID 是 `anthropic.claude-fable-5`。

### Claude Opus

Opus is the most capable of Claude's three core model families. It's designed for complex scenarios that require sophisticated reasoning and planning capabilities.

> Opus 是 Claude 三大核心模型系列中能力最强的一个。它专为需要复杂推理和规划能力的复杂场景而设计。

Opus excels at working independently on complex projects for extended periods. It can manage multi-step processes and navigate different requirements without much human intervention. The model supports reasoning, meaning it can provide quick responses for simple tasks or spend time thinking through more complex problems.

> Opus 擅长长时间独立处理复杂项目。它能管理多步骤的流程,在不需要太多人工干预的情况下应对各种不同的需求。这个模型支持「推理」(reasoning)能力,也就是说,面对简单任务它可以快速响应,而面对更复杂的问题,它会花时间仔细思考。

The trade-off is moderate latency and higher cost. You're paying more and waiting longer for that extra intelligence.

> 代价是中等程度的延迟和更高的成本。为了换来这份额外的智能水平,你要多付费、多等待。

### Claude Sonnet

Sonnet sits in the sweet spot of Claude's lineup, offering a balanced combination of intelligence, speed, and cost that works well for most practical applications.

> Sonnet 处于 Claude 产品线的「甜蜜点」上,在智能水平、速度和成本之间提供了均衡的组合,适合大多数实际应用场景。

What makes Sonnet particularly valuable is its strong coding ability combined with fast text generation. Many developers appreciate its ability to make precise edits to complex codebases without breaking existing functionality.

> Sonnet 特别有价值的地方在于,它把强大的编码能力和快速的文本生成结合在了一起。许多开发者都很欣赏它这样一种能力:在不破坏现有功能的前提下,对复杂代码库做出精确的修改。

### Claude Haiku

Haiku is Claude's fastest model, built specifically for applications where response time is critical. It's optimized for speed and cost efficiency rather than maximum intelligence.

> Haiku 是 Claude 中速度最快的模型,专为那些响应时间至关重要的应用而打造。它的优化方向是速度和成本效率,而不是追求最强的智能水平。

One important limitation: Haiku doesn't support the reasoning capabilities that Opus and Sonnet offer. This makes it ideal for user-facing applications that need real-time interactions but less suitable for complex problem-solving tasks.

> 有一个重要的限制:Haiku 不支持 Opus 和 Sonnet 所具备的推理能力。这让它非常适合那些需要实时交互的面向用户的应用,但不太适合复杂的问题求解类任务。

## Choosing the Right Model 如何选择合适的模型

Model selection comes down to understanding the trade-offs between intelligence and cost/speed. Here's how to decide:

> 选择模型,归根结底是要理解「智能水平」与「成本/速度」之间的取舍。以下是决策方法:

- **Choose Fable 5 for your toughest challenges.** If a task pushes past what Opus can handle and the outcome justifies the higher cost, Fable 5 is the most capable option available.

  **面对最棘手的挑战,选 Fable 5。** 如果某个任务已经超出了 Opus 能应付的范围,而且这个结果值得为之付出更高的成本,那么 Fable 5 就是能力最强的选择。

- **Choose Opus for complex tasks requiring strong reasoning capabilities.** Among the core families, you're choosing quality over speed and cost.

  **需要强大推理能力的复杂任务,选 Opus。** 在三大核心系列之中,这是「质量优先于速度和成本」的选择。

- **Choose Haiku when speed matters most.** For real-time user interactions or high-volume processing where you need the fastest possible responses.

  **速度最重要时,选 Haiku。** 适用于需要尽可能快响应的实时用户交互,或者大批量处理的场景。

- **Choose Sonnet when you need balance.** Most applications benefit from Sonnet's combination of intelligence, speed, and reasonable cost.

  **需要均衡时,选 Sonnet。** 大多数应用都能从 Sonnet 在智能水平、速度和合理成本之间的组合中受益。

## Using Multiple Models 组合使用多个模型

Many teams don't stick to just one model. Instead, they use different models for different parts of the same application:

> 许多团队并不会只固定用一个模型,而是在同一个应用的不同部分,使用不同的模型:

- Haiku for user-facing interactions where speed is crucial. 面向用户、速度至关重要的交互场景用 Haiku。
- Sonnet for main business logic. 主要业务逻辑用 Sonnet。
- Opus for complex tasks requiring deeper reasoning. 需要更深层推理的复杂任务用 Opus。
- Fable 5, selectively, for the hardest problems where the extra capability justifies the cost. 有选择性地把 Fable 5 用在那些「额外能力值回票价」的最难问题上。

This approach lets you optimize each part of your application for its specific requirements while managing overall costs and performance.

> 这种做法让你可以针对应用中每一部分的具体需求分别做优化,同时把整体的成本和性能控制在合理范围内。
