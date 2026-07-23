# Claude with Google Vertex - 41 Introducing Retrieval Augmented Generation 检索增强生成简介

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 41
> 课程: Claude with Google Vertex · 第 41 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

检索增强生成(RAG)是一种在用 Claude 处理大文档时很有用的技术。它不需要你把一份 800 页的财报整个塞进提示词,而是能针对每个问题智能地找出并只放入最相关的段落。

## The Problem with Large Documents 大文档的问题

设想你有一份体量巨大的财务文档,想就它问 Claude 具体问题,比如「这家公司有哪些风险因素?」。这里有个根本挑战: **怎么把文档里正确的那部分信息送进 Claude,让它能有效作答?**

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620800%2F07_-_001_-_Introducing_Retrieval_Augmented_Generation_01.1748620800500.png)

## Option 1: Include Everything in the Prompt 方案一: 全部塞进提示词

第一种做法看起来最直接——把文档全文抽出来,连同用户问题一起塞进提示词。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620801%2F07_-_001_-_Introducing_Retrieval_Augmented_Generation_04.1748620801389.png)

这个做法有几个问题:

- Claude 能处理的文本量有硬上限——你的文档可能超了
- 提示词非常长时,Claude 的表现会下降
- 提示词越大,费用越高、处理越慢

## Option 2: Break Documents into Chunks 方案二: 把文档切块

第二种做法更精细。你在预处理阶段把文档切成小块,然后针对每个用户问题,只找出并放入相关的块。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620802%2F07_-_001_-_Introducing_Retrieval_Augmented_Generation_08.1748620802112.png)

运作方式: 用户问「这家公司面临哪些风险?」时,你在自己的块里搜索,找到那块讲「风险因素」的,只把这一段放进给 Claude 的提示词。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620802%2F07_-_001_-_Introducing_Retrieval_Augmented_Generation_09.1748620802784.png)

## Benefits of the Chunking Approach 切块方案的好处

- Claude 只需聚焦最相关的内容
- 可以扩展到超大文档
- 支持多份文档
- 提示词更小,更便宜也更快

## Challenges with Chunking 切块的挑战

- 需要一个预处理步骤来切分文档
- 需要一套搜索机制来找出「相关」的块
- 放进去的块**可能不包含 Claude 需要的全部上下文**
- 切分文本的方式很多——哪种最好?

举例: 如果你只放了「风险因素」那一节,可能就漏掉了「战略展望」那一节里关于公司打算如何应对这些风险的重要上下文。

## This is RAG 这就是 RAG

方案二就是检索增强生成。尽管它复杂一些,但在处理大文档时优势显著,同时也带来了需要仔细权衡的技术挑战。

RAG 的关键组成部分:

- 文档预处理与切块
- 找出相关块的搜索机制
- 智能地选择把哪些块放进提示词

考虑在应用里用 RAG 时,你需要评估: 对你这个具体场景来说,收益是否盖过额外的复杂度。这个技术在「面对大量文档、需要精确且有上下文的答案」时最能发挥价值,但比起直接把整份文档塞进提示词,它需要更多前期工程投入。

对产品经理来说: 这一课最重要的其实是那条挑战——**RAG 会漏掉上下文**。「风险因素」和「战略展望」的例子说明: 一个答案可能因为检索没覆盖到而不完整,而模型不会告诉你它漏了什么,它会照样自信地回答。所以 RAG 类功能的验收,不能只测「答对没有」,还要测「有没有答漏」,后者难得多,也是这类产品最常见的翻车点。
