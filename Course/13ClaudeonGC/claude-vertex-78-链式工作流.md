# Claude with Google Vertex - 78 Chaining workflows 链式工作流

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 78
> 课程: Claude with Google Vertex · 第 78 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

链式(chaining)工作流初看似乎理所当然,但它其实是你用 Claude 时最有用的模式之一。在处理复杂任务、或者 Claude 没能稳定遵守你全部约束时,它尤其有价值。

## What is Chaining? 什么是链式

链式工作流把一个大任务拆成更小的、**按顺序**执行的子任务。你不再让 Claude 一次性搞定一切,而是把工作分摊到多次聚焦的请求上。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621308%2F11_-_003_-_Chaining_Workflows_03.1748621308227.png)

一个实际例子: 做一个自动创建并发布视频的社媒营销工具。与其写一个巨型提示词,不如把这些步骤串起来:

1. 在 Twitter 上找相关的热门话题
2. 选出最有意思的话题(用 Claude)
3. 研究这个话题(用 Claude)
4. 写一个短视频脚本(用 Claude)
5. 用 AI 数字人和文字转语音生成视频
6. 把视频发布到社交媒体

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621309%2F11_-_003_-_Chaining_Workflows_08.1748621309224.png)

这个做法的关键好处:

- 把大任务拆成更小的、**无法并行**的子任务
- 可以在各步骤之间插入非 LLM 的处理
- 让 Claude 每次只专注于整体任务的一个侧面

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621310%2F11_-_003_-_Chaining_Workflows_09.1748621309887.png)

## The Real-World Problem Chaining Solves 链式真正解决的现实问题

链式的价值在这个场景里体现得最明显: **复杂提示词里的约束被违反**。

设想你在用 Claude 写技术文章。一开始提示词很简单,但输出不太对——Claude 可能会提到自己是 AI、用太多 emoji、或者语气很尬。于是你往提示词里加约束。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621310%2F11_-_003_-_Chaining_Workflows_11.1748621310668.png)

久而久之,你的提示词长成了一份「不许做什么」的清单。但无论加多少条约束,Claude 有时还是会违反——照样用 emoji、照样提自己是 AI、照样保持那种不专业的语气。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621311%2F11_-_003_-_Chaining_Workflows_12.1748621311247.png)

## The Chaining Solution 链式的解法

与其在一个庞大提示词里死磕,不如用两步链式:

1. **第一次请求**: 发出带全部约束的原始提示词,接受拿到一篇不完美的文章
2. **第二次请求**: 用具体、聚焦的指令让 Claude 修订这篇文章

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621312%2F11_-_003_-_Chaining_Workflows_17.1748621312004.png)

这个方法之所以有效,是因为它让 Claude 每次只专注一个具体方面。即便首次回复没能满足全部要求,后续那次请求给了它一个清晰、聚焦的改进任务。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621312%2F11_-_003_-_Chaining_Workflows_19.1748621312694.png)

## When to Use Chaining 什么时候用链式

链式工作流在这些情况下特别有用:

- 任务复杂、约束很多
- Claude 没能稳定遵守你的全部要求
- 你想在步骤之间处理或校验输出
- 你需要让注意力集中在大任务的某个具体方面

看起来是多做了工作,但链式往往比「把一切塞进一个复杂提示词」得到的结果更可靠。随着你构建更复杂的 Claude 应用,你会经常回头用到这个模式。

对产品经理来说: 「提示词长成一份不许做什么的清单」这个现象太常见了——而且它有个隐蔽的副作用: **约束越多,每条约束被遵守的概率越低**。这一课给的解法很务实: 别指望一次做对,分两步——先生成,再按单一标准检查修订。这个思路和人的工作方式其实一样,写稿和校对本来就该分开做。
