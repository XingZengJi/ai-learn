# Claude with Google Vertex - 77 Parallelization workflows 并行化工作流

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 77
> 课程: Claude with Google Vertex · 第 77 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

做 AI 应用时,你常会遇到看起来简单、但一旦想在单次请求里全部搞定就变复杂的任务。这一课讲一种能拆解复杂任务、从 Claude 拿到更好结果的工作流模式。

## The Problem with Complex Single Requests 复杂的单次请求有什么问题

设想你在做一个材料选型应用: 用户上传零件图片,应用推荐最合适的材料。第一反应可能是把图片发给 Claude,用一句简单提示词让它在金属、聚合物、陶瓷、复合材料、弹性体、木材之间选一个。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621310%2F11_-_002_-_Parallelization_Workflows_00.1748621309724.png)

这么做或许能work,但你是在没有充分引导的情况下让 Claude 做大量分析。自然的改进是把提示词扩充,写上每种材料的详细判断标准。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621310%2F11_-_002_-_Parallelization_Workflows_05.1748621310442.png)

但这带来了新问题: 提示词变得极其庞大,反而会让 Claude 困惑,因为它得同时兼顾多项复杂分析。模型可能因为要一次性权衡各种材料的利弊而分心。

## A Better Approach: Parallelization 更好的办法: 并行化

与其把一切塞进一次请求,不如把任务拆成多个专门的请求并行执行:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621311%2F11_-_002_-_Parallelization_Workflows_08.1748621311079.png)

把同一张图片多次发给 Claude,但配上不同的专门提示词。每次请求只评估这个零件在**一种**材料上的适用性:

- 一个请求分析金属的适用性
- 另一个评估聚合物方案
- 第三个考虑陶瓷材料
- 每种材料依此类推

每个提示词都可以为它那种材料做高度专门化的定制,写上强度要求、耐温性、制造约束等相关标准。

## Aggregating the Results 汇总结果

拿到全部单项分析结果后,再发一次请求给 Claude,让它充当**汇总者**。这次请求把所有专门分析交给它,让它对比并给出最终推荐。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621311%2F11_-_002_-_Parallelization_Workflows_11.1748621311687.png)

现在 Claude 不用从零开始比较材料了,只需评估已有的分析结果,从中挑出最有希望的那个。

## The Parallelization Pattern 并行化模式

这个做法遵循一个通用模式,叫**并行化工作流**:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621312%2F11_-_002_-_Parallelization_Workflows_14.1748621312246.png)

1. 把一个复杂任务拆成多个专门的子任务
2. 并行(同时)执行这些子任务
3. 在最后一步把结果汇总起来

关键认知是: **并行的子任务不必彼此相同**。每个都可以有专门的提示词、不同的工具,或为其特定目的量身定制的方法。

## Benefits of Parallelization 并行化的好处

- **注意力集中**: Claude 每次只专注一项具体分析,不用同时兼顾多重复杂考量
- **优化更容易**: 每个子任务的提示词可以独立改进和测试
- **扩展性更好**: 新增材料类型或标准不会把现有子任务搞复杂
- **执行更快**: 子任务并行跑,总耗时通常比顺序执行少

## When to Use This Pattern 什么时候用

并行化适合那些能拆成**互相独立**的子问题的复杂任务。当你在让 Claude 考虑多个选项、执行几类分析、或同时处理同一问题的不同方面时,就该想到它。

当每个子任务都能从专门的提示词中受益,或你想在不把模型压垮的前提下确保覆盖到各种可能性时,这个模式尤其有用。

对产品经理来说: 「提示词越长效果越好」在某个点之后会反转,这一课给出了那个反转点的处理办法。可以记住一个判断信号: 如果一个提示词里出现了「以下 N 种情况分别怎么处理」这样的结构,而且 N 个分支互不依赖,那它大概率该被拆成 N 个并行请求。这个改动通常同时改善质量**和**速度,是少见的双赢。
