# Claude with AWS Bedrock - 20 Being Specific 具体明确地表达

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 20
> 课程: Claude with AWS Bedrock · 第 20 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When working with Claude, one of the most effective ways to improve your results is to be specific about what you want. Instead of leaving everything up to the model's interpretation, you can provide clear guidelines or steps that direct Claude toward the kind of output you're looking for.

> 使用 Claude 时,提升结果质量最有效的方法之一,就是把你想要什么说得具体明确。你不需要把一切都交给模型自己去揣摩,而是可以提供清晰的准则或步骤,把 Claude 引向你想要的那种输出。

Think about it this way: if you ask Claude to "write a short story about a character who discovers a hidden talent," the model could go in countless directions. It might write 200 words or 2,000 words. It could focus on one character or introduce five. The story structure could vary wildly.

> 可以这样理解:如果你只是让 Claude「写一个短篇故事,讲一个角色发现了自己隐藏天赋」,模型可能会往无数个方向发展。它可能写 200 字,也可能写 2000 字;可能只聚焦一个角色,也可能一下子引入五个角色;故事结构也可能千差万别。

But if you add specific guidelines, you can shape the output to match your needs much more closely.

> 但如果你加入具体的准则,就能把输出塑造得更贴合你的需求。

对产品经理来说,这就像给设计师提需求:只说「帮我做个banner,要好看」,对方交回来的东西大概率和你想的不一样;但如果你说清楚「尺寸多大、主色调是什么、必须包含哪些元素、文案放在哪个位置」,交付结果的一致性就会高很多。给 Claude 提要求也是同样的道理。

## Two Types of Guidelines 两种准则

There are two main approaches to being specific in your prompts, and you'll often see both used together in professional applications.

> 让提示词变得具体明确,主要有两种方法,在专业应用中你经常会看到这两者被结合起来使用。

### Quality Guidelines 质量准则

The first type focuses on listing qualities that your output should have. These guidelines control attributes like:

> 第一种方法,重点是列出你希望输出具备的各种特质。这类准则控制的是这样一些属性:

- Length constraints (keep under 1,000 words). 长度限制(控制在 1000 字以内)。
- Structural requirements (include a clear action that reveals the character's talent). 结构性要求(要有一个能清楚展现角色天赋的具体情节)。
- Content specifications (include at least one supporting character). 内容规格(至少要有一个配角)。

### Process Steps 流程步骤

The second type provides specific steps for the model to follow. This approach makes Claude think through the problem systematically:

> 第二种方法,是为模型提供具体的执行步骤。这种做法能让 Claude 系统化地把问题想清楚:

1. Brainstorm 3 talents that would create dramatic tension. 头脑风暴 3 种能制造戏剧张力的天赋。
2. Pick the most interesting talent. 挑出其中最有意思的一种天赋。
3. Outline a pivotal scene that reveals the talent. 勾勒出揭示这个天赋的关键场景。
4. Brainstorm 3 supporting character types that could increase the impact of this discovery. 头脑风暴 3 种能放大这一发现冲击力的配角类型。

Quality guidelines control what the output looks like, while process steps control how Claude arrives at that output.

> 质量准则控制的是「输出长什么样」,而流程步骤控制的是「Claude 是怎么一步步得到这个输出的」。

## Real-World Testing 实际测试

Let's look at how this works in practice. Here's a prompt for generating meal plans that incorporates specific guidelines:

> 我们来看看这在实践中是怎么运作的。下面是一个用于生成饮食计划、并加入了具体准则的提示词:

```
Generate a one-day meal plan for an athlete that meets their dietary restrictions.

- Height: {prompt_inputs["height"]}
- Weight: {prompt_inputs["weight"]}
- Goal: {prompt_inputs["goal"]}
- Dietary restrictions: {prompt_inputs["restrictions"]}

Guidelines:
1. Include accurate daily calorie amount
2. Show protein, fat, and carb amounts
3. Specify when to eat each meal
4. Use only foods that fit restrictions
5. List all portion sizes in grams
6. Keep budget-friendly if mentioned
```

When tested against a baseline prompt without guidelines, this approach improved the evaluation score from 3.92 to 7.86 - more than doubling the quality.

> 与不带任何准则的基准提示词相比,这种做法把评估分数从 3.92 提升到了 7.86——质量翻了不止一倍。

Testing the process steps approach (telling Claude to calculate calories first, then figure out macros, then plan timing, etc.) also showed significant improvement, scoring 7.3.

> 测试「流程步骤」这种做法(告诉 Claude 先算热量、再算三大营养素、再安排用餐时间等等)同样带来了显著的提升,得分为 7.3。

## When to Provide Steps 什么时候该提供步骤

While quality guidelines work well for most prompts, you should consider adding process steps when you're dealing with:

> 虽然质量准则对大多数提示词都很有效,但在处理以下情况时,应该考虑加入流程步骤:

- Troubleshooting hard problems 排查复杂的疑难问题
- Decision making 决策判断
- Critical thinking 批判性思考
- Anytime you want to force Claude to consider a "wider" view 任何你想强制 Claude 从更「宽广」的视角去考虑问题的场合

For example, if you're asking Claude to analyze why a sales team's numbers dropped 30% last quarter, you might want to provide steps that ensure it considers multiple angles - market conditions, individual performance, organizational changes, and customer feedback - rather than jumping to the first obvious explanation.

> 举个例子,如果你让 Claude 分析为什么销售团队上个季度的业绩下滑了 30%,你可能会想提供一套步骤,确保它从多个角度去考虑——市场状况、个人业绩、组织架构变动、客户反馈——而不是一下子就跳到第一个看起来显而易见的解释上。

The key insight is that being specific helps you get consistent, high-quality results instead of leaving everything to chance. Whether you use quality guidelines, process steps, or both, you're giving Claude a clear framework to work within.

> 核心的洞察在于:具体明确能帮你获得一致、高质量的结果,而不是把一切都交给运气。无论你用的是质量准则、流程步骤,还是两者结合,你都是在给 Claude 一个清晰的框架,让它在其中工作。
