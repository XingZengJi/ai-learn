# Claude with Google Vertex - 15 Prompt evaluation 提示词评估

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 15
> 课程: Claude with Google Vertex · 第 15 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

用 Claude 时,写出一个好提示词只是开始。要做出可靠的 AI 应用,你还得理解两个关键概念: **提示词工程(prompt engineering)** 和 **提示词评估(prompt evaluation)**。前者给你写好提示词的方法,后者帮你衡量这些提示词实际效果如何。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619540%2F04_-_001_-_Prompt_Evaluation_00.1748619540294.png)

## Prompt Engineering vs Prompt Evaluation 两者的区别

**提示词工程**是你写和改提示词的工具箱,是一套让 Claude 准确理解你要什么、想让它怎么回应的最佳实践。可以把它看作「写提示词这门手艺」——包括多示例提示、用 XML 标签组织结构等等,后面会逐一展开。

**提示词评估**则是关于**测量**。它是自动化测试,给你客观指标来判断提示词是否真的有效。有了评估,你不用靠猜:

- 拿预期答案来对照测试
- 比较同一个提示词的不同版本
- 检查输出里的错误

## The Three Paths After Writing a Prompt 写完提示词之后的三条路

草拟出一个提示词之后,通常有三个选择:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619541%2F04_-_001_-_Prompt_Evaluation_10.1748619541009.png)

**选项 1**: 测一次,觉得「够用了」。这条路在生产环境里风险很大——用户一给出意料之外的输入就会崩。

**选项 2**: 测几次,针对一两个边界情况微调。比选项 1 好,但用户提供的输入往往远超你考虑过的范围。

**选项 3**: 把提示词跑一遍评估流水线打分,再根据客观数据迭代。前期投入的工作量和成本更高,但对提示词可靠性的信心也高得多。

## Why Most Engineers Fall Into Testing Traps 为什么大多数工程师会掉进测试陷阱

选项 1 和 2 是所有工程师都会掉进去的坑——讲师自己也不例外。写完提示词,拿自己想的几个输入试两下,觉得「看起来挺好」,这是很自然的反应。但在做严肃应用时,这种做法经常在生产环境出问题。

根本原因在于: **你无法预测用户会用多少种方式来使用你的提示词**。在你有限的测试里表现完美的东西,面对真实世界的使用模式可能彻底失效。

## The Value of Systematic Evaluation 系统性评估的价值

选项 3——把提示词跑过评估流水线——给你的是关于性能的客观数据。你不再依赖直觉或有限的手工测试,而是拿到可量化的分数,告诉你提示词在各种输入下表现如何。

这让你能有底气地迭代: 改一处提示词,立刻能看到这个改动是让效果变好还是变差。这是「猜测」与「知道」之间的区别。

评估确实需要更多前期时间和资源投入,但当你需要一个在多样化用户输入下都能稳定工作的、可上生产的提示词时,这份投入会连本带利地还回来。

对产品经理来说: 这一课其实在讲一件很熟悉的事——**提示词也需要回归测试**。你不会允许一个功能改了代码不跑测试就上线,但提示词经常就是这么被改上线的。把「评估分数」当成提示词的验收指标,是把 AI 功能纳入正常研发流程的第一步。
