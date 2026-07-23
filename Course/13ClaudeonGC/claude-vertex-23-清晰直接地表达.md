# Claude with Google Vertex - 23 Being clear and direct 清晰直接地表达

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 23
> 课程: Claude with Google Vertex · 第 23 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

提示词的**第一行**是整个请求里最重要的部分。它为后面所有内容定调,写对了能显著改善结果。

## Being Clear and Direct 清晰且直接

写这关键的第一行时,盯住两个原则: **清晰(clarity)** 和 **直接(directness)**。也就是用简单的措辞,不给「你到底要 Claude 做什么」留下任何歧义空间。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619590%2F05_-_002_-_Being_Clear_and_Direct_02.1748619589874.png)

## Clear Communication 清晰的表达

「清晰」意味着:

- 用任何人都能看懂的简单语言
- 直说你要什么,不要绕弯子
- 开门见山地陈述 Claude 的任务

与其写「我想了解一下那种人们装在屋顶上、利用太阳的东西——好像叫太阳能板吧」这种含混的说法,不如直接写: **"Write three paragraphs about how solar panels work."**

## Direct Instructions 直接的指令

「直接」关注的是你怎么组织这个请求:

- **用指令,不用疑问句**
- 以直接的动作动词开头,如 "Write"、"Create"、"Generate"

与其问「我最近在看可再生能源,地热能好像挺有意思。哪些国家在用?」,不如写: **"Identify three countries that use geothermal energy. Include generation stats for each."**

## Putting It Into Practice 实战应用

看看这个技巧的效果。从那个只写了 "What should this person eat?" 的弱提示词开始,施加「清晰直接」的原则。

改进后的版本是: **Generate a one-day meal plan for an athlete that meets their dietary restrictions.**

这一版立刻告诉了 Claude:

- 要执行什么动作(generate 生成)
- 要产出什么(一份餐食计划)
- 关键约束(一天、给运动员、满足饮食限制)

## Results Matter 结果说话

这么一个简单的改动就能带来明显的质量差异。在这个例子里,评估分数从 **2.32 涨到了 3.92**——仅仅重写了开头那一行。

核心要点: 开头就要强——用一句清晰、直接、带动作动词的话明确定义任务。这让 Claude 一开始就走在正确方向上,结果自然好得多。

对产品经理来说: 这一课其实就是「写需求」的老功课。「用户体验要更好」和「把结算页从 3 步减到 1 步」的差别,跟这里 2.32 分和 3.92 分的差别是同一回事。你已经会的这项能力可以直接迁移过来——写提示词的第一行,就当在写一条验收标准。
