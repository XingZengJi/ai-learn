# Claude with AWS Bedrock - 42 Reranking results 重排序检索结果

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 42
> 课程: Claude with AWS Bedrock · 第 42 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

The hybrid retrieval approach we've built works well, but there are still some rough edges. When you search for specific terms or use abbreviations, the results might not be perfectly ordered. For example, asking "What did the eng team do with INC-2023-Q4-011?" might return the cybersecurity section first, even though the software engineering section is more relevant to that specific query.

> 我们搭出来的混合检索方案已经不错了,但还有些粗糙的地方。当你搜特定词项或使用缩写时,结果的排序可能不够完美。比如问「eng 团队针对 INC-2023-Q4-011 做了什么?」,返回的第一条可能是网络安全那节——尽管对这个具体问题来说,软件工程那节才更相关。

## LLM-Based Re-ranking 基于大模型的重排序

Re-ranking adds another post-processing step after merging results from your vector index and BM25 index. The concept is straightforward: take your search results and ask Claude to reorder them based on relevance to the user's question.

> 重排序(re-ranking)是在合并向量索引与 BM25 索引的结果之后,再加一道后处理。思路很直白: 把搜索结果拿给 Claude,让它按与用户问题的相关性重新排一遍。

Here's how the process works:

> 流程如下:

1. Run your hybrid search (vector + BM25) as usual. 照常跑混合搜索(向量 + BM25)。
2. Merge the results like before. 像之前一样合并结果。
3. Pass the merged results to a re-ranker function. 把合并后的结果交给重排序函数。
4. The re-ranker sends everything to Claude with a specific prompt. 重排序函数带着一条特定的提示词把所有内容发给 Claude。
5. Claude returns a reordered list of the most relevant documents. Claude 返回一份重新排序过的、最相关文档的列表。

对产品经理来说: 前面的搜索像是初筛简历(靠关键词和相似度快速过一遍),重排序则像是让资深面试官把这十几份初筛结果再读一遍、按真正契合度重新排名。准得多,但也慢得多、贵一些。

## System Prompts 提示词写法

The re-ranking prompt is designed to be clear and specific. You provide Claude with the user's question and all the documents that seem relevant, then ask for a simple task: return the most relevant documents in order of decreasing relevance.

> 重排序的提示词要写得清晰、具体。你把用户的问题和所有看起来相关的文档提供给 Claude,然后交给它一个简单任务: 按相关性从高到低返回最相关的文档。

A typical prompt structure looks like this:

> 典型的提示词结构是这样:

```
You are tasked with finding the documents most relevant to a user's question.

<user_question>
What happened with INC-2023-Q4-011?
</user_question>

Here are documents that may be relevant:
<documents>
<document>Section 10...</document>
<document>Section 2...</document>
<document>Section 7...</document>
<document>Section 6...</document>
</documents>

Return the 3 most relevant docs, in order of decreasing relevance.
```

> 翻译: 「你的任务是找出与用户问题最相关的文档。<用户问题>INC-2023-Q4-011 发生了什么?</用户问题> 以下是可能相关的文档: ……请返回最相关的 3 篇文档,按相关性从高到低排列。」注意这里又用上了前面课程讲过的 XML 标签结构化技巧。

## Efficiency Considerations 效率方面的考虑

Asking Claude to return full text chunks would be inefficient - you'd be waiting for Claude to copy large amounts of text. Instead, assign each text chunk a unique ID ahead of time. Then ask Claude to return just those IDs in the correct order.

> 让 Claude 返回完整的文本块效率很低——你得等它把大段文字重新抄一遍。更好的做法是: 提前给每个文本块分配一个唯一 ID,然后只让 Claude 按正确顺序返回这些 ID。

This approach is much faster because Claude only needs to return a simple list like `["1p5g", "51n3", "ab83"]` instead of copying entire document sections.

> 这样快得多,因为 Claude 只需要返回像 `["1p5g", "51n3", "ab83"]` 这样一个简单列表,而不用把整节文档复制出来。

## Implementation 实现

The re-ranker function gets called automatically by your retriever after the initial hybrid search. Here's the basic structure:

> 重排序函数会在初次混合搜索之后由检索器自动调用。基本结构如下:

```python
def reranker_fn(docs, query_text, k):
    # Format documents with IDs
    joined_docs = "\n".join([
        f"<document><document_id>{doc['id']}</document_id>"
        f"<document_content>{doc['content']}</document_content></document>"
        for doc in docs
    ])

    # Create prompt with user question and documents
    prompt = f"""You are about to be given a set of documents...
    {query_text}
    {joined_docs}
    """

    # Get Claude's response and parse the document IDs
    result = chat(messages, stop_sequences=["```"])
    return json.loads(result["text"])["document_ids"]
```

> 代码在做什么: 先把每篇文档连同它的 ID 包进 XML 标签拼成一段字符串; 再把用户问题和这段文档串组装成提示词发给 Claude; 最后把 Claude 返回的 JSON 解析出来,取出排好序的 `document_ids`。`stop_sequences=["```"]` 是让 Claude 在代码块结束处停下,方便解析。

## Results 效果

When you test the re-ranker with queries like "What did the eng team do with INC-2023-Q4-011?", you should see more relevant results at the top. Claude understands the context and can identify that a query about the engineering team should prioritize the software engineering section over other sections that merely mention the incident.

> 用「eng 团队针对 INC-2023-Q4-011 做了什么?」这类查询测试重排序器,你会看到更相关的结果排到了前面。Claude 能理解语境,判断出一个关于工程团队的问题应该优先给出软件工程那节,而不是那些只是顺带提到该事故的章节。

The trade-off is clear: re-ranking increases latency because you need to wait for Claude's response, but it significantly improves search accuracy by leveraging Claude's understanding of context and relevance.

> 取舍很清楚: 重排序会增加延迟(因为你得等 Claude 回复),但它借助 Claude 对语境和相关性的理解,显著提升了搜索准确率。
