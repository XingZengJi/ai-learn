# Claude with AWS Bedrock - 40 BM25 lexical search BM25 词法搜索

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 40
> 课程: Claude with AWS Bedrock · 第 40 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When building a RAG pipeline, you'll quickly discover that semantic search alone doesn't always return the best results. Sometimes you need exact keyword matches that semantic search might miss. The solution is to combine semantic search with lexical search using a technique called BM25.

> 搭 RAG 流水线时你很快会发现: 光靠语义搜索并不总能给出最好的结果。有时候你需要的是精确的关键词匹配,而这恰恰是语义搜索容易漏掉的。解法是用一种叫 BM25 的技术,把语义搜索和词法搜索(lexical search)结合起来。

## The Problem with Semantic Search Alone 只用语义搜索的问题

Let's say you're searching for a specific incident ID like "INC-2023-Q4-011" in a document. While this exact term appears multiple times in relevant sections, semantic search might return unrelated sections that seem semantically similar but don't actually contain the specific information you need.

> 假设你要在文档里查一个具体的事故编号,比如 "INC-2023-Q4-011"。这个编号在相关章节里出现了好几次,但语义搜索可能返回一些看起来语义相近、实际上根本不包含你要的信息的无关章节。

This happens because semantic search focuses on meaning rather than exact text matches. When you need precise keyword matching, you need a different approach.

> 这是因为语义搜索关注的是「含义」而不是「字面精确匹配」。当你需要精准的关键词匹配时,就得换一种方法。

对产品经理来说,这就像在公司文档系统里搜一个工单号: 语义搜索会给你「所有关于线上事故的文档」,而你其实只想要那份**编号完全对得上**的。这两种需求都真实存在,所以两种搜索都得有。

## Hybrid Search Strategy 混合搜索策略

The solution is to run both semantic and lexical searches in parallel, then merge the results. This gives you the best of both worlds:

> 解法是同时跑语义搜索和词法搜索,然后把结果合并。这样两边的长处你都能拿到:

- **Semantic search** 语义搜索 - Finds conceptually related content using embeddings. 用嵌入找出概念上相关的内容。
- **Lexical search** 词法搜索 - Finds exact keyword matches using classic text search. 用经典文本搜索找出精确的关键词匹配。
- **Merged results** 合并结果 - Combines both approaches for better overall relevance. 把两种方法结合起来,整体相关性更好。

## How BM25 Works BM25 的工作原理

BM25 (Best Match 25) is a popular algorithm for lexical search in RAG pipelines. Here's how it processes a search query:

> BM25(Best Match 25)是 RAG 流水线里做词法搜索的常用算法。它处理一个查询的过程如下:

The algorithm follows these key steps:

> 算法的关键步骤:

1. **Tokenize the query** 把查询分词 - Break the user's question into individual terms. 把用户的问题拆成一个个词项。
2. **Count term frequency** 统计词频 - See how often each term appears across all documents. 看每个词项在所有文档中出现的频率。
3. **Weight terms by rarity** 按稀有度加权 - Terms used less frequently get higher importance scores. 越少见的词项,重要性得分越高。
4. **Score documents** 给文档打分 - Find text chunks that contain more instances of the higher-weighted terms. 找出高权重词项出现次数更多的文本块。

The key insight is that rare terms like "INC-2023-Q4-011" are much more important for search relevance than common words like "a" or "the".

> 核心洞察是: 像 "INC-2023-Q4-011" 这样罕见的词项,对搜索相关性的意义远大于 "a"、"the" 这类常见词。

## Implementing BM25 Search 实现 BM25 搜索

Here's how to set up a BM25 search system:

> 搭建 BM25 搜索系统的方式如下:

```python
# Create a BM25 store
store = BM25Index()

# Add documents to the store
for chunk in chunks:
    store.add_document({"content": chunk})

# Search the store
results = store.search("What happened with INC-2023-Q4-011?", 3)
```

The BM25 implementation maintains a similar API to your vector store, with `add_document()` and `search()` methods. This consistency makes it easy to use both systems together.

> BM25 的实现保持了和向量存储相似的 API,同样有 `add_document()` 和 `search()` 两个方法。这种一致性让两套系统很容易一起使用。

> 这个「接口保持一致」的设计不是随手为之——下一课要把两者合并成统一的检索器,靠的就是它们长得一样。

## Better Search Results 更好的搜索结果

When you run the same query through BM25 that failed with semantic search alone, you get much better results. The algorithm correctly prioritizes sections that contain the exact incident ID, ranking them higher than sections that might be semantically related but don't contain the specific term you're looking for.

> 把之前语义搜索没搞定的那个查询交给 BM25,结果好得多。算法正确地把包含精确事故编号的章节排在前面,高于那些语义可能相关、但并不包含你要找的具体词项的章节。

The search results now properly surface the Software Engineering section and Cybersecurity section that actually discuss the incident, rather than returning unrelated content like Financial Analysis.

> 现在搜索结果会正确地把真正讨论该事故的「软件工程」和「网络安全」两节浮上来,而不是返回「财务分析」这类不相关的内容。

## Next Steps 下一步

Now that you have both semantic and lexical search systems working independently, the next step is to merge their results. This hybrid approach will give you the semantic understanding of embeddings combined with the precision of keyword matching, creating a more robust search experience for your RAG pipeline.

> 现在语义搜索和词法搜索两套系统都能独立工作了,下一步是把它们的结果合并。这种混合方式能把嵌入的语义理解能力和关键词匹配的精准度结合起来,让你的 RAG 流水线拥有更稳健的搜索体验。
