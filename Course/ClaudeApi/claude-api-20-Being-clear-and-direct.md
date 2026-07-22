# Building with the Claude API - 20 Being clear and direct 清晰直接地表达

> Course: Building with the Claude API · Lesson 20
> 课程: Building with the Claude API · 第 20 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

The first line of your prompt is the most important part of your entire request. This is where you set the stage for everything that follows, and getting it right can dramatically improve your results.

> 提示词的第一句话,是整个请求里最重要的部分。它为后面所有内容定下基调,写好这一句能大幅提升效果。

## Being Clear and Direct 清晰且直接

When crafting that crucial first line, you want to focus on two key principles: clarity and directness. This means using simple language that leaves no room for ambiguity about what you want Claude to do.

> 打磨这至关重要的第一句话时,要把握两个核心原则:清晰(clarity)和直接(directness)。也就是说,用简单明确的语言,不给「你到底想让 Claude 做什么」留任何模糊空间。

### Clear Communication 清晰的表达

Being "clear" means:

- Use simple language that anyone can understand
- State exactly what you want without beating around the bush
- Lead with a straightforward statement of Claude's task

  「清晰」意味着:用任何人都能看懂的简单语言;直截了当地说出你想要什么,不绕弯子;开头就直接说明 Claude 要做的任务是什么。

Instead of writing something vague like "I need to know about those things people put on their roofs that use sun - those solar panel things, I think they're called," be direct and write: "Write three paragraphs about how solar panels work."

> 与其写一句模糊不清的话,比如「我想了解一下那种装在屋顶上、利用太阳的东西——好像叫太阳能板之类的」,不如直接写:「写三段话,介绍太阳能板的工作原理。」

### Direct Instructions 直接的指令

Being "direct" focuses on how you structure your request:

- Use instructions, not questions
- Start with direct action verbs like "Write," "Create," or "Generate"

  「直接」关注的是你如何组织这个请求:用指令句,而不是疑问句;开头就用「写」「创建」「生成」这类明确的动作动词。

Rather than asking "I was reading about renewable energy and geothermal energy sounds neat. What countries use it?" try: "Identify three countries that use geothermal energy. Include generation stats for each."

> 与其问「我最近在看可再生能源的资料,地热能听起来挺有意思的,有哪些国家在用?」,不如写:「找出三个使用地热能的国家,并附上各自的发电数据。」

## Putting It Into Practice 实践应用

Let's see this technique in action. Starting with a weak prompt that simply asked "What should this person eat?" we can apply our clear and direct approach.

> 我们来看看这个技巧的实际效果。以第 19 课那个薄弱的提示词「这个人该吃什么?」为起点,应用「清晰直接」的原则来改进它。

The improved version becomes: "Generate a one-day meal plan for an athlete that meets their dietary restrictions."

> 改进后的版本变成:「为一名运动员生成一份符合其饮食限制的一日饮食计划。」

This revision immediately tells Claude:

- What action to take (generate)
- What to create (a meal plan)
- Key constraints (one day, for an athlete, meeting dietary restrictions)

  这个改动立刻告诉了 Claude:要做什么动作(生成);要产出什么(一份饮食计划);关键约束条件(一天、面向运动员、符合饮食限制)。

## Results Matter 结果说明一切

This simple change can have a significant impact on performance. In our example, the evaluation score jumped from 2.32 to 3.92 - a substantial improvement from just restructuring that opening line.

> 这样一个简单的改动,能对效果产生显著影响。在我们的例子里,评估分数从 2.32 跳到了 3.92——仅仅是重新组织了开头这一句话,就带来了实实在在的提升。

The key takeaway is that Claude responds best when you treat it like a capable assistant who needs clear direction rather than someone who has to guess what you want. Start strong with a direct action verb, be specific about the task, and you'll see better results right away.

> 核心要点是:把 Claude 当成一个能干、但需要明确指示的助理来对待,而不是让 ta 去猜你到底想要什么,这样它的表现会最好。开头用一个明确的动作动词起势,把任务说具体,你马上就能看到更好的效果。

对产品经理来说,这一课的道理和「写清晰的需求文档」完全一样:把「我想了解一下那种……」换成「写三段话介绍 XX 原理」,就像把一句含糊的需求描述「用户好像想要个啥东西方便查看数据」换成「做一个数据看板,展示近 7 天的日活趋势」——需求主体、动作、约束条件写清楚了,执行方(不管是 Claude 还是团队里的工程师)才不会靠猜来干活。
