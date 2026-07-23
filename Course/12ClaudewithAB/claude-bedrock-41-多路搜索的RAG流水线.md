# Claude with AWS Bedrock - 41 A multi-search RAG pipeline 多路搜索的 RAG 流水线

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 41
> 课程: Claude with AWS Bedrock · 第 41 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When you have both semantic search (vector embeddings) and lexical search (BM25) working independently, the next step is combining them into a unified search pipeline. This hybrid approach leverages the strengths of both methods to deliver more accurate results.

> 当语义搜索(向量嵌入)和词法搜索(BM25)都能独立跑通之后,下一步就是把它们合并成一条统一的搜索流水线。这种混合方式能同时发挥两种方法的长处,给出更准确的结果。

## Building a Unified Interface 构建统一接口

Both search implementations share nearly identical APIs - they both have `add_document()` and `search()` methods. This consistency makes it straightforward to wrap them in a single `Retriever` class that coordinates between the two approaches.

> 两套搜索实现的 API 几乎完全一样——都有 `add_document()` 和 `search()` 方法。正因如此,把它们包进一个 `Retriever` 类里统一协调就变得很简单。

The `Retriever` acts as a coordinator that:

> `Retriever` 扮演的是协调者的角色:

1. Receives a user's question. 接收用户的问题。
2. Forwards it to both the `VectorIndex` and `BM25Index`. 把问题同时转发给 `VectorIndex` 和 `BM25Index`。
3. Collects results from both systems. 收集两套系统返回的结果。
4. Merges the results using a ranking algorithm. 用一种排序算法把结果合并。

## Reciprocal Rank Fusion 倒数排名融合(RRF)

The challenge lies in merging results from different search methods. Each system returns results with different scoring mechanisms, so you can't simply combine scores directly. Instead, we use a technique called Reciprocal Rank Fusion (RRF).

> 难点在于如何合并来自不同搜索方法的结果。两套系统的打分机制不同,所以你没法直接把分数加在一起。于是我们用一种叫「倒数排名融合」(Reciprocal Rank Fusion,RRF)的技术。

> 关键思路: 既然分数不可比,那就**不比分数,只比名次**。名次是两边都有、且可比的。

Here's how RRF works with a practical example. Suppose your `VectorIndex` returns results ranked as: Section 2, Section 7, Section 6. Meanwhile, your `BM25Index` returns: Section 6, Section 2, Section 7.

> 来看一个具体例子。假设 `VectorIndex` 返回的排序是: 第 2 节、第 7 节、第 6 节; 而 `BM25Index` 返回的是: 第 6 节、第 2 节、第 7 节。

To merge these results, you create a combined table showing each text chunk's rank from both systems:

> 要合并这些结果,你先做一张合并表,列出每个文本块在两套系统里各自的名次:

The RRF formula calculates a score for each document:

> RRF 公式为每个文档算出一个分数:

```
RRF_score(d) = Σ(1 / (k + rank_i(d)))
```

Where `k` is a constant (typically 60, though 1 works well for clearer results) and `rank_i(d)` is the rank of document `d` in the i-th ranking system.

> 其中 `k` 是一个常数(通常取 60,不过取 1 能让结果差异更明显、更好理解),`rank_i(d)` 是文档 `d` 在第 i 套排序系统里的名次。

For each text chunk, you calculate:

> 对每个文本块的计算(下面用 k=1、名次从 1 开始):

- Section 2: `1.0/(1+1) + 1.0/(1+2) = 0.833` 第 2 节
- Section 7: `1.0/(1+2) + 1.0/(1+3) = 0.583` 第 7 节
- Section 6: `1.0/(1+3) + 1.0/(1+1) = 0.75` 第 6 节

After sorting by score, the final ranking becomes: Section 2 (first), Section 6 (second), Section 7 (third).

> 按分数排序后,最终排名是: 第 2 节(第一)、第 6 节(第二)、第 7 节(第三)。

> 直觉解释: 在任何一套系统里排得越靠前,贡献的分数越高(因为是取倒数); 在两套系统里都排得靠前的文档,累加起来分数最高,自然胜出。

## Implementation 实现

The `Retriever` class implementation is straightforward:

> `Retriever` 类的实现很直接:

```python
class Retriever:
    def __init__(self, *indexes):
        self._indexes = list(indexes)

    def add_document(self, document):
        for index in self._indexes:
            index.add_document(document)

    def search(self, query_text, k=1, k_rrf=60):
        # Get results from all indexes
        all_results = []
        for idx, results in enumerate(all_results):
            for rank, (doc, _) in enumerate(results):
                # Track document ranks across systems
                # Apply RRF formula
                # Return merged, sorted results
```

> 代码在做什么: 构造时接收任意多个索引; `add_document` 把同一份文档写进所有索引; `search` 向所有索引发出查询,记录每个文档在各索引中的名次,套用 RRF 公式算分,最后返回合并排序后的结果。

The key insight is that the RRF algorithm creates a unified ranking by considering how well each document performs across all search systems, rather than relying on any single scoring method.

> 核心洞察是: RRF 算法通过考察每个文档在**所有**搜索系统里的整体表现来生成统一排名,而不是依赖任何单一的打分方式。

## Testing the Hybrid Approach 测试混合方案

When testing with a query like "what happened with INC-2023-Q4-011?", the hybrid approach delivers significantly better results than either method alone. Instead of getting unexpected results from pure vector search, you now get the most relevant cybersecurity incident report first, followed by related software engineering content.

> 用「INC-2023-Q4-011 发生了什么?」这样的查询来测试,混合方案的结果明显优于任何单一方法。不再是纯向量搜索给出的那些意外结果,现在排在最前面的是最相关的网络安全事故报告,紧接着是相关的软件工程内容。

## Extensibility 可扩展性

The beauty of this design is its modularity. Since each search index implements the same interface (`add_document()` and `search()`), you can easily add new search methodologies to the system. Whether it's a different embedding model, a specialized domain search, or any other retrieval technique, as long as it follows the established API, it integrates seamlessly into the hybrid pipeline.

> 这个设计的漂亮之处在于它的模块化。由于每个搜索索引都实现了相同的接口(`add_document()` 和 `search()`),你可以很容易地往系统里加入新的搜索方法。不管是换一个嵌入模型、加一个特定领域的专用搜索,还是任何其他检索技术,只要遵循既定的 API,就能无缝接入这条混合流水线。

This hybrid search approach represents a significant improvement in retrieval accuracy by combining the semantic understanding of vector search with the precise keyword matching of lexical search, all unified through the mathematically sound RRF ranking algorithm.

> 这种混合搜索方式把向量搜索的语义理解与词法搜索的精确关键词匹配结合起来,并通过数学上站得住脚的 RRF 排序算法统一起来,在检索准确率上是一次显著提升。
