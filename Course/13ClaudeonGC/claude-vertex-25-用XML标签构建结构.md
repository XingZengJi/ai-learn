# Claude with Google Vertex - 25 Structure with XML tags 用 XML 标签构建结构

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 25
> 课程: Claude with Google Vertex · 第 25 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

当提示词里塞进大量内容时,Claude 有时会分不清哪些文本属于一组、不同段落各自代表什么。XML 标签提供了一种简单的方式给提示词加上结构和清晰度,尤其是在插入大量数据的时候。

## Why Structure Matters 为什么结构重要

设想一个需要分析 20 页销售记录的提示词。没有清晰的边界,Claude 可能很难区分哪些是你的指令、哪些是你要它分析的实际数据。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619655%2F05_-_004_-_Structure_with_XML_Tags_00.1748619655719.png)

上图展示了边界不清会怎样让 Claude 难以解析你的意图。把不同的内容段落用 XML 标签包起来,就相当于给它加了清晰的分隔符,帮它理解提示词的结构。

## Using XML Tags for Clarity 用 XML 标签提升清晰度

XML 标签像容器一样,把提示词里不同的部分隔开。标签名可以自定义,用来描述里面装的是什么:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619656%2F05_-_004_-_Structure_with_XML_Tags_06.1748619656342.png)

这个例子里,把销售数据包进 `<sales_records>` 标签,内容代表什么立刻一目了然。**标签名本身就提供了关于数据类型的上下文**。

## A Practical Example 一个实际例子

再看一个对比更强烈的例子。左边是一个混着代码和文档的调试请求:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619656%2F05_-_004_-_Structure_with_XML_Tags_10.1748619656864.png)

没有清晰边界,Claude 只能猜哪部分是有 bug 的代码、哪部分是文档。右边改进版用 XML 标签把两者分开:

```xml
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

现在 Claude 能轻松分辨出哪个需要调试、哪个只是参考资料。

## Applying Structure to Your Prompts 给你的提示词加结构

即使插入的内容不算多,XML 标签依然能提升清晰度。比如生成餐食计划时,可以把运动员信息归到一组:

```xml
<athlete_information>
- Height: {prompt_inputs["height"]}
- Weight: {prompt_inputs["weight"]}
- Goal: {prompt_inputs["goal"]}
- Dietary restrictions: {prompt_inputs["restrictions"]}
</athlete_information>
```

这明确表示了: 这些值是关于运动员的外部输入,不是你指令的一部分。

## Key Benefits 主要收益

- 在需要放入大量上下文或数据时最有用
- 作为清晰的分隔符,帮 Claude 解析不同类型的内容
- 提升 Claude 理解提示词各部分之间关系的能力
- 让你的提示词更易维护、更好排查

当你的复杂提示词里混着指令、数据、示例和其他内容类型时,XML 标签尤其有价值。**结构越清晰,Claude 越能准确理解并回应你的具体需求。**

对产品经理来说: 这个技巧最大的价值不在效果,而在**可维护性**。一个带标签的提示词,半年后别人接手也能一眼看出哪块是模板、哪块是变量、哪块是示例。提示词一旦进入生产,它就是需要长期维护的资产,别当成一次性的草稿来写。
