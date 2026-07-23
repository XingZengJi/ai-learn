# Claude with Google Vertex - 49 Contextual retrieval 上下文检索

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 49
> 课程: Claude with Google Vertex · 第 49 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

上下文检索(contextual retrieval)是一种提升 RAG 准确性的技术,它解决的是一个根本问题: **文档被切成块之后,每个块就失去了与整份文档的联系。**

## The Problem with Standard Chunking 标准分块的问题

把源文档切成块存进向量数据库时,每个单独的块都不再知道自己从哪来、与文档其余部分是什么关系。这会损害检索准确性,因为这些块缺失了重要的上下文信息。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620944%2F07_-_009_-_Contextual_Retrieval_00.1748620943971.png)

## How Contextual Retrieval Works 上下文检索怎么工作

它在把块存进检索数据库之前加了一个预处理步骤:

1. 取出单个块和原始源文档
2. 把两者一起发给 Claude,用特定提示词让它补上下文
3. Claude 生成一小段文字,把这个块「定位」在整份文档中
4. 把这段上下文与原始块拼在一起,形成「带上下文的块」
5. 把带上下文的块存入向量索引和 BM25 索引

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620945%2F07_-_009_-_Contextual_Retrieval_04.1748620945450.png)

举例: 一个讲软件工程、提到 2023 年某起事故的章节,Claude 可能生成这样的上下文: "This section is from a larger report about a cross-discipline group. It includes mention of INC-2023-04-011, which is also mentioned in the Cybersecurity Analysis section."

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620947%2F07_-_009_-_Contextual_Retrieval_05.1748620946965.png)

## Handling Large Documents 处理超大文档

常见问题是: 源文档太大,塞不进 Claude 的上下文窗口。这种情况下仍然可以用上下文检索,只要提供一份精简的上下文:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620947%2F07_-_009_-_Contextual_Retrieval_07.1748620947609.png)

不放整份文档,而是提供:

- 文档开头的几个块(通常含摘要或概述)
- 当前待处理块**之前**的那几个块

这既让 Claude 掌握了文档结构和紧邻的上下文,又不至于把提示词撑爆。

## Implementation Example 实现示例

给块添加上下文的基础函数:

```python
def add_context(text_chunk, source_text):
    prompt = """
Write a short and succinct snippet of text to situate this chunk within the
overall source document for the purposes of improving search retrieval of the chunk.

Here is the original source document:
<document>
{source_text}
</document>

Here is the chunk we want to situate within the whole document:
<chunk>
{text_chunk}
</chunk>

Answer only with the succinct context and nothing else.
"""
    
    messages = []
    add_user_message(messages, prompt)
    result = chat(messages)
    
    return result["text"] + "\n" + text_chunk
```

处理大文档时,可以实现一个挑选相关上下文块的策略:

```python
# 给每个块补上下文,再加入 retriever
num_start_chunks = 2
num_prev_chunks = 2

for i, chunk in enumerate(chunks):
    context_parts = []
    
    # 文档开头的若干块
    context_parts.extend(chunks[: min(num_start_chunks, len(chunks))])
    
    # 当前待处理块之前的若干块
    start_idx = max(0, i - num_prev_chunks)
    context_parts.extend(chunks[start_idx:i])
    
    context = "\n".join(context_parts)
    
    contextualized_chunk = add_context(chunk, context)
    retriever.add_document({"content": contextualized_chunk})
```

## When to Use Contextual Retrieval 什么时候用

这个技术在以下情况最有价值:

- 文档各章节之间有复杂的内部关联
- 块里引用了文档别处定义的概念
- 理解文档结构对准确检索很重要
- 你处理的是技术文档、报告或学术论文

上下文检索会增加处理时间和成本(因为要多做 API 调用),但对那些上下文很关键的复杂文档,它能显著提升检索准确性。

对产品经理来说: 这一课的成本结构值得留意——**它是「每个块一次 API 调用」的预处理**。一份切成 500 块的文档,入库就要 500 次调用。这是一次性成本(除非文档更新),但在评估「要不要索引全部历史文档」时,这笔账必须先算清楚。常见的折中是: 只对高频查询涉及的核心文档做上下文化处理。
