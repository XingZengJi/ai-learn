# Claude with AWS Bedrock - 43 Contextual retrieval 上下文检索

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 43
> 课程: Claude with AWS Bedrock · 第 43 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Contextual retrieval is a technique that improves RAG pipeline accuracy by solving a fundamental problem: when you split a document into chunks, each chunk loses its connection to the broader document context.

> 上下文检索(contextual retrieval)是一种提升 RAG 流水线准确率的技术,它解决的是一个根本问题: 当你把文档切成块之后,每个块都失去了与整份文档大语境之间的联系。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559588%2F09_-_009_-_Contextual_Retrieval_00.1748559588379.png)

The basic idea is simple. After chunking your source document, you ask Claude to add context to each chunk before storing it in your retriever database. This pre-processing step helps "situate" each chunk within the larger document.

> 基本思路很简单: 把源文档切块之后,先让 Claude 给每个块补上一段上下文说明,再存进检索数据库。这个预处理步骤能帮每个块在整份文档里「定位」自己。

对产品经理来说,这就像给每份被拆开的会议纪要片段贴上一张便签: 「这是 Q3 战略复盘会第 3 部分,承接上一节的预算讨论,涉及的项目在附录 B 里也有提到。」有了这张便签,以后翻到这页的人立刻知道它是干什么的。

## How It Works 运作方式

For each text chunk, you send both the chunk and the original source document to Claude with a prompt like this:

> 对每个文本块,你把这个块和原始源文档一起发给 Claude,提示词大致如下:

```
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
```

> 翻译:「写一小段简洁的文字,把这个块定位在整份源文档中的位置,目的是提升该块被检索到的效果。以下是原始源文档: ……以下是我们想要定位的块: ……只回答这段简洁的上下文说明,不要输出其他任何内容。」

Claude might generate context like: "This section is from a larger report about a cross-discipline group. It includes mention of INC-2023-04-011, which is also mentioned in the Cybersecurity Analysis section."

> Claude 可能会生成这样的上下文:「本节出自一份关于跨学科团队的大型报告。其中提到了 INC-2023-04-011,该编号在『网络安全分析』一节中也有出现。」

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559589%2F09_-_009_-_Contextual_Retrieval_04.1748559589111.png)

You then combine this generated context with the original chunk text to create a "contextualized chunk" that gets stored in your vector and BM25 indexes.

> 然后你把这段生成的上下文和原始块文本拼在一起,形成一个「带上下文的块」,再存进向量索引和 BM25 索引。

## Handling Large Documents 处理大文档

If your source document is too large to fit in a single prompt, you can provide a reduced set of context instead of the entire document.

> 如果源文档太大,一条提示词装不下,你可以只提供一个缩减版的上下文,而不是整份文档。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559589%2F09_-_009_-_Contextual_Retrieval_08.1748559589486.png)

For any given chunk you're contextualizing, include:

> 对于正在处理的某个块,可以包含:

- A few chunks from the start of the document (often containing summaries or abstracts). 文档开头的几个块(通常包含摘要或概述)。
- Chunks immediately preceding the target chunk (providing local context). 紧挨着目标块前面的几个块(提供局部上下文)。

This approach gives Claude enough information to generate meaningful context without overwhelming the prompt with the entire document.

> 这样既能给 Claude 足够的信息去生成有意义的上下文,又不至于用整份文档把提示词撑爆。

## Implementation Example 实现示例

Here's a basic implementation of the contextual retrieval function:

> 下面是上下文检索函数的基础实现:

```python
def add_context(text_chunk, source_text):
    prompt = f"""
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

> 代码在做什么: 组装提示词发给 Claude,拿到生成的上下文说明,然后把「上下文说明 + 换行 + 原始块文本」拼成一整段返回。注意返回的是拼接后的完整内容,而不只是那段上下文。

When processing your document chunks, you'd loop through each one and generate contextualized versions:

> 处理文档块时,你会遍历每个块,生成带上下文的版本:

```python
# Add context to each chunk, then add to the retriever
for i, chunk in enumerate(chunks):
    # Build context from start chunks and preceding chunks
    context_parts = []
    context_parts.extend(chunks[:min(num_start_chunks, len(chunks))])

    start_idx = max(0, i - num_prev_chunks)
    context_parts.extend(chunks[start_idx:i])

    context = "\n".join(context_parts)

    contextualized_chunk = add_context(chunk, context)
    retriever.add_document({"content": contextualized_chunk})
```

> 代码在做什么: 对第 i 个块,先取文档开头的若干块(全局背景),再取它前面紧邻的若干块(局部背景),拼成一份「精简版源文档」交给 `add_context`,最后把带上下文的块存进检索器。

> 成本提醒: 这个方案要为**每个块**都调用一次 Claude,块多的时候预处理成本不低。好在这同样是一次性的离线处理,而且可以配合提示词缓存来降低开销。

## Expected Results 预期效果

The generated context provides valuable information about document structure and relationships. For example, Claude might describe a chunk as "Section 2 of an Annual Interdisciplinary Research Review, detailing software engineering efforts to resolve stability issues in Project Phoenix. It follows the Methodology section and precedes Financial Analysis, forming part of a comprehensive report that covers ten research domains across the organization."

> 生成的上下文提供了关于文档结构和相互关系的宝贵信息。举例来说,Claude 可能会这样描述某个块:「这是《年度跨学科研究评审》的第 2 节,详述了软件工程团队为解决 Phoenix 项目稳定性问题所做的工作。它排在『方法论』一节之后、『财务分析』之前,属于一份覆盖全组织十个研究领域的综合报告的一部分。」

This additional context helps the retrieval system better understand not just what each chunk contains, but how it fits into the larger document structure and relates to other sections. While you might not see dramatic improvements with simple documents, contextual retrieval becomes increasingly valuable as your documents become more complex with intricate cross-references and dependencies between sections.

> 这些额外的上下文让检索系统不仅知道每个块「包含什么」,还知道它「在整份文档结构中处于什么位置、和其他章节是什么关系」。对简单文档来说效果提升可能不明显,但当你的文档越来越复杂、章节之间存在错综的交叉引用和依赖关系时,上下文检索的价值会越来越大。
