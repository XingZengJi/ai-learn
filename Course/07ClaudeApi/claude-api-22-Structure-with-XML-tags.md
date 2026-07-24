# Building with the Claude API - 22 Structure with XML tags 用 XML 标签组织结构

> Course: Building with the Claude API · Lesson 22
> 课程: Building with the Claude API · 第 22 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

当你搭建的提示词包含大量内容时,Claude 有时会分不清哪些文本是一体的、哪些不同段落各自代表什么。XML 标签提供了一种简单的方式,能给提示词加上结构和清晰度,尤其是在你要插入大量数据的时候。

## 为什么结构很重要

设想一个场景:你需要分析 20 页销售记录。如果没有清晰的边界,Claude 可能很难分清哪些是你的指令、哪些是需要分析的实际数据。

边界不清会让 Claude 难以准确理解你的意图。而只要把销售记录包在 `<sales_records>` 和 `</sales_records>` 这样的 XML 标签里,就能创造出清晰的分隔符,帮助 Claude 理解提示词的结构。

## 实例:代码与文档

这里有一个更能说明问题的例子。如果你让 Claude 依据提供的文档来调试代码,把所有内容混在一起会造成混乱:

「不太好」的写法,几乎没办法分清哪部分是代码、哪部分是文档。「更好」的写法用 `<my_code>` 和 `<docs>` 标签划出了清晰的边界。

## 自定义标签名

你不需要用「官方」的 XML 标签,完全可以按内容含义自己起名:

- `<sales_records>` 比 `<data>` 更清楚
- `<athlete_information>` 能明确标出用户信息
- `<my_code>` 和 `<docs>` 把不同类型的内容分开

标签名越具体、越有描述性,Claude 就越能理解每个部分的用途。

## 什么时候该用 XML 标签

XML 标签在以下场景最有用:

- 包含大量上下文或数据时
- 混合不同类型的内容(代码、文档、数据)时
- 你想让内容边界格外清楚时
- 提示词很复杂、需要插入多个变量时

即使内容不长,XML 标签也能起到分隔符的作用,让提示词结构对 Claude 来说更一目了然。

## 实际应用

实践中,你可能会这样组织提示词:

```
<athlete_information>
- Height: 6'2"
- Weight: 180 lbs
- Goal: Build muscle
- Dietary restrictions: Vegetarian
</athlete_information>

Generate a meal plan based on the athlete information above.
```

这样就非常清楚地表明:身高、体重、目标、饮食限制这些信息是相关联的一整块,生成饮食计划时应该一起考虑。

对于简单的提示词,你可能看不出 XML 标签带来的明显提升;但随着提示词变得越来越复杂、包含的内容种类越来越多,XML 标签的价值会越来越大。

---

对产品经理来说,XML 标签的作用就像需求文档里的分节标题和代码块引用——把「背景信息」「用户原话」「验收标准」分块框起来,而不是一段话糊在一起。文档短的时候感觉不出差别,但一旦信息量上去了,清晰的分区能大幅降低「执行方看错、理解错」的概率。
