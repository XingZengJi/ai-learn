# Claude with Google Vertex - 46 BM25 lexical search BM25 词法搜索

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 46
> 课程: Claude with Google Vertex · 第 46 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

搭 RAG 流水线时你很快会发现,光靠语义搜索并不总能返回最好的结果。有时你需要的是**精确的词项匹配**,而这恰恰是语义搜索容易漏掉的。解法是把语义搜索与词法搜索结合起来,后者用的技术叫 BM25。

## The Problem with Semantic Search Alone 只用语义搜索的问题

假设你要在文档里搜一个具体的事故编号 "INC-2023-Q4-011"。这个词在相关章节里出现了好几次,但语义搜索可能返回一些语义上相似、却根本不含这个词的无关章节。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620882%2F07_-_006_-_BM25_Lexical_Search_04.1748620882308.png)

原因在于语义搜索关注的是**含义**而不是精确匹配。当你需要精准的词项匹配时,得换一种方式。

## Hybrid Search Strategy 混合搜索策略

解法是并行跑两种搜索,再合并结果:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620883%2F07_-_006_-_BM25_Lexical_Search_05.1748620883219.png)

- **语义搜索** —— 用嵌入和向量数据库做基于含义的匹配
- **词法搜索** —— 用经典文本搜索做精确词项匹配
- **合并结果** —— 把两组结果结合,得到更好的覆盖

## How BM25 Works BM25 怎么工作

BM25(Best Match 25)是 RAG 流水线里做词法搜索的常用算法。它处理搜索查询的方式:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620884%2F07_-_006_-_BM25_Lexical_Search_07.1748620884013.png)

算法的关键步骤:

1. **切分查询** —— 把用户问题拆成一个个词项
2. **统计词频** —— 看每个词项在所有文档中出现的频率
3. **按稀有度加权** —— 出现频率越低的词项,重要性得分越高
4. **找最佳匹配** —— 返回含更多高权重词项的块

核心洞察是: 像 "INC-2023-Q4-011" 这样的**稀有词项**,对搜索的价值远高于 "a" 或 "the" 这类常见词。

## Implementing BM25 Search 实现 BM25 搜索

搭一套 BM25 搜索系统:

```python
# 创建 BM25 存储
store = BM25Index()

# 把文档加进去
for chunk in chunks:
    store.add_document({"content": chunk})

# 搜索
results = store.search("What happened with INC-2023-Q4-011?", 3)
```

BM25 实现提供了与语义搜索系统**相同的 API**——两者都有 `add_document()` 和 `search()` 方法,便于一起使用。

## Better Search Results 更好的搜索结果

把之前语义搜索搞砸的那个查询交给 BM25,结果好得多。它不再返回无关章节,而是优先返回真正包含你搜索词的那些。

算法正确地识别出 "INC-2023-Q4-011" 是稀有且重要的词项,把含有它的文档排在只含查询中常见词的文档之前。

## Next Steps 下一步

现在语义搜索和词法搜索都能独立工作了,下一步是合并它们的结果。这种混合方案兼取两者之长——语义搜索的上下文理解能力,加上词法搜索精确匹配的准确性。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620884%2F07_-_006_-_BM25_Lexical_Search_19.1748620884731.png)

两套搜索系统使用相似的 API,可以很直接地并行查询,再把结果合并成一个更全面的结果集。

对产品经理来说: 这一课其实在纠正一个很常见的误解——「有了语义搜索,关键词搜索就过时了」。事实恰恰相反: 编号、型号、人名、专有名词这些最需要精确命中的东西,正是语义搜索最弱的地方。如果你的场景涉及工单号、SKU、合同编号,混合搜索不是优化项,是必选项。
