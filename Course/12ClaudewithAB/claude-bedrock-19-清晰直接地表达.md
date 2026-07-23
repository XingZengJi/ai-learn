# Claude with AWS Bedrock - 19 Being Clear and Direct 清晰直接地表达

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 19
> 课程: Claude with AWS Bedrock · 第 19 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

The first line of your prompt is the most important part of your entire request. This is where you set the stage for everything that follows, and getting it right can dramatically improve your results.

> 提示词的第一句话,是整个请求中最重要的部分。这句话为后面所有内容定下了基调,把它写对了,能大幅提升你的结果质量。

## Being Clear and Direct 清晰且直接

When crafting that crucial first line, you want to focus on two key principles: clarity and directness. This means using simple language that leaves no room for ambiguity about what you want Claude to do.

> 在打磨这至关重要的第一句话时,你要聚焦两个关键原则:清晰(clarity)和直接(directness)。也就是说,用简单明了的语言,不给「你到底想让 Claude 做什么」留下任何模糊空间。

### Clear Communication 清晰的表达

Being "clear" means:

> 「清晰」意味着:

- Use simple language that anyone can understand. 使用任何人都能看懂的简单语言。
- State exactly what you want without beating around the bush. 直接说出你想要什么,不绕弯子。
- Lead with a straightforward statement of Claude's task. 开门见山地说明 Claude 要完成的任务。

Instead of writing something vague like "I need to know about those things people put on their roofs that use sun - those solar panel things, I think they're called," be direct and write: "Write three paragraphs about how solar panels work."

> 与其写「我想了解一下人们装在屋顶上、利用太阳的那个东西——好像叫太阳能板之类的」这种含糊的话,不如直接写:「写三段话,介绍太阳能板是如何工作的。」

### Direct Instructions 直接的指令

Being "direct" focuses on how you structure your request:

> 「直接」关注的是你如何组织这个请求的结构:

- Use instructions, not questions. 用指令句,而不是疑问句。
- Start with direct action verbs like "Write," "Create," or "Generate." 以「写」「创建」「生成」这类直接的动作动词开头。

Rather than asking "I was reading about renewable energy and geothermal energy sounds neat. What countries use it?" try: "Identify three countries that use geothermal energy. Include generation stats for each."

> 与其问「我最近在读一些关于可再生能源的东西,地热能听起来挺有意思的。哪些国家在用它?」,不如试试:「列出三个使用地热能的国家,并附上各自的发电数据。」

对产品经理来说,这个道理很像写需求文档:与其写「我们是不是可以考虑一下,看看能不能优化一下这个流程」,不如直接写「把这个流程的步骤从 5 步精简到 3 步」——目标越明确,执行的人(不管是同事还是 Claude)越不容易走偏。

## Putting It Into Practice 实践应用

Let's see this technique in action. Starting with a weak prompt that simply asked "What should this person eat?" we can apply our clear and direct approach.

> 我们来看看这项技巧的实际效果。从一个较弱的提示词开始——它只是简单地问「这个人该吃什么?」——我们可以应用「清晰且直接」的方法来改进它。

The improved version becomes: "Generate a one-day meal plan for an athlete that meets their dietary restrictions."

> 改进后的版本变成:「为一名运动员生成一份符合其饮食限制的一日饮食计划。」

This revision immediately tells Claude:

> 这个修改版本立刻告诉了 Claude:

- What action to take (generate). 该采取什么行动(生成)。
- What to create (a meal plan). 要创建什么(一份饮食计划)。
- Key constraints (one day, for an athlete, considering restrictions). 关键的限制条件(一天、面向运动员、要考虑饮食限制)。

## Results Matter 结果说明一切

This simple change can make a significant difference in output quality. In our example, the evaluation score jumped from 2.32 to 3.92 - a substantial improvement from just restructuring that opening line.

> 这个简单的改动能给输出质量带来显著的差异。在我们的例子里,评估分数从 2.32 跃升到 3.92——仅仅是重新组织了这句开场白,就带来了这么大的提升。

The key takeaway is that Claude responds best when you treat it like a capable assistant who needs clear direction rather than someone who has to guess what you want. Start strong with a direct action verb, be specific about the task, and you'll see better results right away.

> 核心要点是:如果你把 Claude 当作一个能力很强、但需要清晰方向指引的助手来对待,而不是一个得自己猜你想要什么的人,它的表现会最好。用一个直接的动作动词强势开头,把任务说具体,你会立刻看到更好的结果。
