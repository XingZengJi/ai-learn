# Claude with Google Vertex - 26 Providing examples 提供示例

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 26
> 课程: Claude with Google Vertex · 第 26 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

在提示词里提供示例,是你会用到的最有效的提示词工程技巧之一。这种做法叫 **one-shot** 或 **multi-shot** 提示,即给 Claude 一些「输入/输出」样例对来引导它的回复。

## How Examples Work 示例怎么起作用

看一个情感分析的例子。假设你要 Claude 判断一条推文是正面还是负面:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619655%2F05_-_005_-_Providing_Examples_00.1748619655115.png)

难点在于**反讽**。像 "Yeah, sure, that was the best movie I've seen since 'Plan 9 from Outer Space'" 这样的推文,字面上看是正面的,实际上是反讽、是负面的(《Plan 9 from Outer Space》以烂片著称)。

## Adding Examples to Your Prompt 给提示词加示例

要处理这种情况,可以加上示例,展示 Claude 该怎么正确回应:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619655%2F05_-_005_-_Providing_Examples_04.1748619655529.png)

关键要素:

- **清晰的引入语**: "Here is a example input with an ideal response"
- **用 XML 标签构建结构**: `<sample_input>` 和 `<ideal_output>`
- **具体的示例**,直接演示你想要的行为

## Handling Corner Cases 处理边界情况

multi-shot 提示在处理边界情况时特别出色。针对反讽这个问题,可以加上:

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

这给了 Claude 一个明确的模式,让它认出那些原本可能被误分类的反讽内容。

## Complex Output Formats 复杂的输出格式

当你需要 Claude 产出 JSON 对象、详细报告这类结构化输出时,示例尤其有价值。与其用文字描述格式,不如直接**展示**好的输出长什么样。

## Finding Good Examples from Evaluations 从评估结果里找好示例

跑提示词评估时,去 HTML 报告里找得分最高的输出:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619656%2F05_-_005_-_Providing_Examples_12.1748619655959.png)

找出得 10 分(或你的最高分)的那些,把它们的输入/输出对当作示例放进提示词。这能帮 Claude 理解在你这个具体任务上「完美」是什么样。

## Adding Context to Examples 给示例补充说明

想效果更好,可以解释这个示例**为什么**理想。在展示样例输出之后,加一句简短说明:

```
</ideal_output>
This meal plan is well-structured, provides detailed information on food choices and quantities, and aligns with the athlete's goals and restrictions.
```

这会强化那些让输出有价值的具体特质。

## Best Practices 最佳实践

- 用 XML 标签清晰地组织示例结构
- 从简单的 one-shot 起步,不够再逐步加示例
- 重点覆盖 Claude 可能吃力的边界情况
- 有条件时,把「这个示例好在哪」也写上
- 迭代测试——根据评估结果来决定加什么示例

示例之所以特别有力,是因为它**展示**而不是**描述**。与其试图用文字描述你想要的每一处细微差别,不如直接演示出来。这让提示词更可靠,也帮 Claude 理解那些光靠语言难以说清的复杂要求。

对产品经理来说: 「从评估报告里挑高分输出当示例」这条工作流很值得记住——它把评估从「打分工具」变成了「素材来源」,形成一个自我强化的循环。这个套路在做人工标注流程时同样适用: 标注指南里的示例,应该来自实际标注中得分最高的真实案例,而不是编出来的理想样本。
