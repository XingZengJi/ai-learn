# Claude with Google Vertex - 47 A Multi-index RAG pipeline 多路搜索的 RAG 流水线

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 47
> 课程: Claude with Google Vertex · 第 47 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

语义搜索(向量嵌入)和词法搜索(BM25)都能独立工作之后,下一步是把它们合成一条统一的搜索流水线。这种混合方案取两者之长,给出更准确的结果。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620887%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_00.1748620887431.png)

## Creating a Unified Interface 建一个统一接口

两套搜索实现的 API 几乎一模一样——都有 `add_document()` 和 `search()`,用法相同。这种一致性让把它们包进一个 `Retriever` 类变得很简单。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620888%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_01.1748620888208.png)

`Retriever` 充当协调者: 把用户查询转发给两个索引,收集结果,合并成一个统一的排序列表。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620889%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_02.1748620888938.png)

## Reciprocal Rank Fusion 倒数排名融合

难点在于: 两种搜索方法用的评分体系不同。向量搜索返回余弦相似度分数,BM25 返回相关性分数——**这两个数字不能直接相加**。

解法是一种叫**倒数排名融合(Reciprocal Rank Fusion, RRF)** 的技术。它关注的是结果的**排名位置**,而不是原始分数。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620889%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_04.1748620889568.png)

举例说明。假设向量搜索按顺序返回第 2、7、6 节,BM25 返回第 6、2、7 节。合并方式:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620890%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_05.1748620890357.png)

先做一张表,列出每个文本块在两种方法中的排名:

- Section 2: 向量排名 1,BM25 排名 2
- Section 7: 向量排名 2,BM25 排名 3
- Section 6: 向量排名 3,BM25 排名 1

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620891%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_06.1748620890893.png)

然后套用 RRF 公式算出每个块的合并得分:

```
RRF_score(d) = Σ(1 / (k + rank_i(d)))
```

其中 `k` 是常数(通常取 60,这里为了结果更直观取 1),`rank_i(d)` 是文档 d 在第 i 个搜索结果中的排名。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620891%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_07.1748620891653.png)

本例计算:

- Section 2: 1.0/(1+1) + 1.0/(1+2) = **0.833**
- Section 7: 1.0/(1+2) + 1.0/(1+3) = **0.583**
- Section 6: 1.0/(1+3) + 1.0/(1+1) = **0.75**

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620893%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_08.1748620893017.png)

最终排名是: Section 2(0.833)、Section 6(0.75)、Section 7(0.583)。这符合直觉——Section 2 在两种搜索里表现都好,Section 6 一好一差,Section 7 整体偏低。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620894%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_09.1748620894616.png)

## Implementation 实现

`Retriever` 类的实现很直接:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620895%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_11.1748620895209.png)

```python
class Retriever:
    def __init__(self, *indexes):
        self._indexes = list(indexes)
    
    def add_document(self, document):
        for index in self._indexes:
            index.add_document(document)
    
    def search(self, query_text, k=1, k_rrf=60):
        # 从所有索引取结果
        all_results = [index.search(query_text, k) for index in self._indexes]
        
        # 应用倒数排名融合
        # ... 合并逻辑 ...
```

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620896%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_12.1748620895862.png)

合并逻辑追踪各搜索结果中文档的排名,计算 RRF 分数,按合并分数返回前 k 个文档。

## Testing the Hybrid Approach 测试混合方案

用 "what happened with INC-2023-Q4-011?" 这个查询测试,混合方案的结果比单用向量搜索好得多:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620897%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_14.1748620896778.png)

结果现在能正确地优先返回:

- Section 10: Cybersecurity Analysis(真正的事故报告)
- Section 2: Software Engineering(相关上下文)
- Section 5: Legal Developments(相关性较低但仍有关联)

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620897%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_16.1748620897641.png)

## Benefits of the Hybrid Architecture 混合架构的好处

- **模块化设计**: 每个搜索索引独立实现,共享同一套 API
- **易于扩展**: 只要实现同样的 `search()` 和 `add_document()` 接口,就能加入新的搜索方式
- **准确性更好**: 结合了语义理解与精确关键词匹配
- **融合方式灵活**: RRF 算法不限于两路,合并多少个索引都适用

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620898%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_18.1748620898355.png)

一致的 API 意味着你可以轻松加入第三个搜索索引——比如专做命名实体识别的,或处理特定文档类型的——`Retriever` 会自动把它的结果纳入最终排名。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620899%2F07_-_007_-_A_Multi-Index_Rag_Pipeline_17.1748620899059.png)

这套混合搜索基础比单用任何一种方法都要稳健得多,能让你的 RAG 流水线在更广的查询类型上表现更好。

对产品经理来说: RRF 用「名次」而不是「分数」来融合,这个思路在很多产品场景里都能借用——比如把「销量排名」和「好评率排名」合成一个综合榜单。原始分数的量纲不一致时,转成名次再加权,是个既简单又不容易出错的办法。
