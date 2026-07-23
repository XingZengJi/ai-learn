# Claude with AWS Bedrock - 21 Structure with XML Tags 用 XML 标签构建结构

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 21
> 课程: Claude with AWS Bedrock · 第 21 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When you're building prompts that include a lot of content, Claude can sometimes struggle to understand which pieces of text belong together or what different sections are supposed to represent. XML tags provide a simple way to add structure and clarity to your prompts, especially when you're interpolating large amounts of data.

> 当你构建的提示词包含大量内容时,Claude 有时会难以判断哪些文本片段应该归为一组,或者各个部分分别代表什么。XML 标签提供了一种简单的方式,能给你的提示词加上结构和清晰度——尤其是当你要插入大量数据时。

## Why Structure Matters 为什么结构很重要

Consider a prompt where you need to analyze 20 pages of sales records. Without clear boundaries, Claude might have trouble distinguishing between your instructions and the actual data you want analyzed.

> 想象一个需要分析 20 页销售记录的提示词。如果没有清晰的边界,Claude 可能很难分清哪些是你的指令、哪些是你想要分析的实际数据。

The example above shows how unclear boundaries can make it difficult for Claude to parse your intent. By wrapping the sales records in XML tags, you create clear separation between different parts of your prompt.

> 上面的例子说明了边界不清晰会让 Claude 难以解析你的意图。把销售记录包在 XML 标签里,就能在提示词的不同部分之间建立清晰的分隔。

对产品经理来说,这就像写会议纪要:如果把「讨论内容」和「待办事项」混在一大段文字里,别人回头很难分清哪句是背景信息、哪句是要执行的任务;但如果你用「【讨论内容】...【待办事项】...」这样的小标题分好块,任何人一眼就能看懂结构。XML 标签在提示词里起的就是这种「小标题分块」的作用。

## Using XML Tags for Clarity 用 XML 标签增强清晰度

XML tags act as delimiters that help Claude understand the structure of your prompt. You can create custom tag names that describe the content they contain:

> XML 标签起到分隔符的作用,帮 Claude 理解你提示词的结构。你可以自己创建描述性的标签名,来说明其中包含的内容:

```
<sales_records>
{sales_records}
</sales_records>
```

The tag names don't need to follow any official XML specification - you're free to create descriptive names like `sales_records`, `data`, or `records`. More specific names generally work better than generic ones.

> 这些标签名不需要遵循任何官方的 XML 规范——你完全可以自由创建像 `sales_records`、`data` 或 `records` 这样的描述性名称。通常来说,越具体的名字效果越好,好过那些泛泛而谈的通用名字。

## A Practical Example 一个实际的例子

Here's a clear example of why XML tags make a difference. In the "Not Great" version, it's unclear what content represents the buggy code versus the documentation:

> 下面这个例子能清楚说明 XML 标签为什么有用。在「不太好」的版本里,根本分不清哪部分是有 bug 的代码,哪部分是参考文档:

The improved version uses XML tags to clearly separate the different types of content:

> 改进后的版本用 XML 标签清晰地把不同类型的内容分隔开:

```
<my_code>
from datavortex import Pipeline, DataSource

def process_data(input_file, output_file):
    pipeline = Pipeline()
    source = DataSource.from_csv(input_file)
</my_code>

<docs>
# Creating a data source from data vortex
csv_source = DataSource.from_csv("data.csv")
</docs>
```

Now Claude can easily distinguish between the code that needs debugging and the documentation that should guide the debugging process.

> 现在 Claude 就能轻松区分出「需要调试的代码」和「用来指导调试的参考文档」了。

## Applying Structure to Your Prompts 把结构应用到你的提示词中

Even when your interpolated content isn't massive, XML tags can still improve clarity. For example, when generating meal plans, you can group athlete information together:

> 即便你插入的内容并不庞大,XML 标签依然能提升清晰度。举例来说,在生成饮食计划时,你可以把运动员的信息归拢在一起:

```
<athlete_information>
- Height: {prompt_inputs["height"]}
- Weight: {prompt_inputs["weight"]}
- Goal: {prompt_inputs["goal"]}
- Dietary restrictions: {prompt_inputs["restrictions"]}
</athlete_information>
```

This makes it crystal clear to Claude that this block contains external input about the athlete that should inform the meal plan generation.

> 这样一来,Claude 就能非常清楚地知道:这个代码块里是关于运动员的外部输入信息,应该据此来生成饮食计划。

## When to Use XML Tags 什么时候该用 XML 标签

XML tags are most useful when:

> XML 标签在以下情况下最有用:

- You're including large amounts of context or data. 你要加入大量的上下文或数据。
- Your prompt contains multiple distinct types of content. 你的提示词包含多种不同类型的内容。
- You want to make the boundaries between different sections obvious. 你想让不同部分之间的边界一目了然。
- You're interpolating content that might be confused with your instructions. 你插入的内容可能会和你的指令混淆。

While you might not see dramatic improvements with simple prompts, XML tags serve as delimiters that help Claude better understand your intent, leading to more consistent and accurate responses.

> 虽然对于简单的提示词,你可能看不到多么显著的提升,但 XML 标签作为分隔符,能帮 Claude 更好地理解你的意图,从而带来更一致、更准确的响应。
