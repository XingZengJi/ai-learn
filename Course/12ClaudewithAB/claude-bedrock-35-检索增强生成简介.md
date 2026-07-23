# Claude with AWS Bedrock - 35 Introducing Retrieval Augmented Generation 检索增强生成(RAG)简介

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 35
> 课程: Claude with AWS Bedrock · 第 35 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Retrieval Augmented Generation (RAG) is a technique that helps you work with large documents by breaking them into smaller pieces and only feeding Claude the most relevant chunks for each question. Instead of overwhelming the model with an entire 800-page financial report, RAG lets you extract just the sections that matter for answering specific queries.

> 检索增强生成(Retrieval Augmented Generation,简称 RAG)是一种处理大型文档的技术: 把文档拆成小块,针对每个问题只把最相关的块喂给 Claude。这样你就不必用一份 800 页的财报把模型「淹没」,而是只抽取出回答该问题真正用得上的那几节。

## The Problem with Large Documents 大文档带来的问题

When you have a massive document and want to ask Claude specific questions about it, you face a fundamental challenge: how do you get the right information to Claude without hitting limits or degrading performance?

> 当你手上有一份体量巨大的文档,又想就它问 Claude 一些具体问题时,你会碰到一个根本性的难题: 怎样才能把正确的信息送到 Claude 面前,同时又不撞上限制、不拖垮效果?

Consider asking "What risk factors does this company have?" about a lengthy financial document. The document contains the answer, but Claude needs access to the relevant content to help you.

> 设想你就一份冗长的财务文档问「这家公司有哪些风险因素?」。答案就在文档里,但 Claude 必须拿到相关内容才能帮到你。

## Option 1: Include Everything in the Prompt 方案一: 把所有内容都塞进提示词

The straightforward approach is extracting all text from the document and stuffing it into a single prompt:

> 最直接的做法是把文档里的全部文本抽出来,一股脑塞进同一条提示词:

This method has serious limitations:

> 这个方法有严重的局限:

- Hard token limits mean very long documents simply won't fit. 硬性的 token 上限意味着超长文档根本放不下。
- Claude becomes less effective with extremely long prompts. 提示词极长时,Claude 的表现会变差。
- Larger prompts cost more money and take longer to process. 提示词越大,花的钱越多、处理时间越长。
- Performance degrades when there's too much information to sift through. 需要筛选的信息太多时,效果会下降。

对产品经理来说,这就像给新同事交接工作时,直接把整个部门五年来的所有文件扔给他,让他自己找答案——他不是找不到,而是找得慢、容易找错,而且你还得付他更多的工时。

## Option 2: Break Documents into Chunks 方案二: 把文档切成块

RAG takes a smarter approach by preprocessing documents into manageable pieces, then retrieving only the relevant chunks for each question.

> RAG 采用了更聪明的思路: 先把文档预处理成大小合适的片段,然后针对每个问题只检索出相关的那些块。

Here's how it works:

> 具体流程是:

1. Split the document into smaller chunks (Strategy Outlook, Risk Factors, Balance Sheet, etc.). 把文档切成较小的块(战略展望、风险因素、资产负债表等)。
2. When a user asks a question, analyze what they're looking for. 当用户提问时,分析他们到底在找什么。
3. Find the chunks most relevant to their question. 找出与问题最相关的那些块。
4. Include only those relevant chunks in the prompt to Claude. 只把这些相关的块放进给 Claude 的提示词里。

For a question about company risks, the system would identify and retrieve the "Risk Factors" chunk, giving Claude focused, relevant context instead of the entire document.

> 对于一个关于公司风险的问题,系统会识别并取出「风险因素」这一块,给 Claude 的是聚焦、相关的上下文,而不是整份文档。

## Benefits of RAG RAG 的好处

- Claude can focus on only the most relevant content. Claude 可以只专注于最相关的内容。
- Scales to very large documents and multiple documents. 能扩展到超大文档以及多份文档的场景。
- Works across document collections, not just single files. 适用于整个文档集合,而不只是单个文件。
- Smaller prompts mean faster processing and lower costs. 提示词更小,意味着处理更快、成本更低。

## Challenges with RAG RAG 的挑战

RAG introduces complexity that you need to manage:

> RAG 也会引入你必须管理的复杂度:

- Requires a preprocessing step to chunk documents. 需要一个预处理步骤来给文档分块。
- Need a search mechanism to find relevant chunks. 需要一套搜索机制来找出相关的块。
- Retrieved chunks might not contain all necessary context. 检索到的块未必包含全部必要的上下文。
- Many different ways to chunk text - which approach works best? 切分文本的方式有很多种——到底哪种最好?

You can chunk documents by equal portions, by headers and sections, by semantic meaning, or other strategies. Each approach has tradeoffs you'll need to evaluate for your specific use case.

> 你可以按等长切分、按标题和章节切分、按语义切分,或者用其他策略。每种方式都有取舍,你得结合自己的具体场景来评估。

## When to Use RAG 什么时候该用 RAG

RAG shines when you're working with large documents or document collections where users ask specific questions that only require portions of the content. The preprocessing complexity pays off when you need to scale beyond what fits in a single prompt, when you want faster responses, or when you're managing costs across many queries.

> 当你面对的是大文档或文档集合,而用户提的是只需要其中一部分内容就能回答的具体问题时,RAG 最能发挥价值。如果你需要突破「单条提示词装得下的量」这个天花板、想要更快的响应,或者要控制大量查询累计起来的成本,那么这些预处理的复杂度就是值得付出的。

The key is analyzing whether the technical overhead of implementing chunking, search, and retrieval makes sense for your particular application. Sometimes the simple "dump everything in a prompt" approach works fine - other times, RAG becomes essential for making your system practical and performant.

> 关键在于判断: 实现分块、搜索、检索这一整套东西的技术开销,对你这个具体应用来说值不值。有时候「全都塞进提示词」这种简单做法就够用了; 另一些时候,RAG 则是让系统真正可用、跑得动的必需品。
