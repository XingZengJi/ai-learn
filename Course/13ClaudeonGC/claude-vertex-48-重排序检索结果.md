# Claude with Google Vertex - 48 Reranking results 重排序检索结果

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 48
> 课程: Claude with Google Vertex · 第 48 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

我们搭的混合检索方案效果不错,但仍有毛边。搜索 "what did the eng team do with INC-2023-Q4-011?" 时,我们期望软件工程那一节排更前面,因为它明确提到了工程团队和这起事故。可实际上网络安全那一节还是排在第一。

这就是**重排序(re-ranking)** 派上用场的地方——一种能显著提升检索准确性的后处理技术。

## How Re-ranking Works 重排序怎么工作

重排序在混合搜索之后加一步。不再直接返回向量索引和 BM25 索引的合并结果,而是把这些结果交给一个 LLM 做智能重排。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620879%2F07_-_008_-_Reranking_Results_05.1748620879658.png)

流程很直接:

1. 跑现有的混合搜索(向量 + BM25)
2. 像之前一样合并结果
3. 把合并后的结果连同重排序提示词发给 Claude
4. 拿回一个重新排好序的最相关文档列表

## The Re-ranking Prompt 重排序提示词

提示词结构简单但有效。你把用户问题和全部候选文档给 Claude,让它按相关性从高到低返回最相关的那些。

```
You are about to be given a set of documents, along with an id of each.
Your task is to select the {k} most relevant documents to answer the user's question.

Here is the user's question:
<question>
{query_text}
</question>

Here are the documents to select from:
<documents>
{joined_docs}
</documents>

Respond in the following format:
```json
{
  "document_ids": str[] # List document ids, {k} elements long, sorted in order of decreasing relevance
}
```
```

## Efficiency Considerations 效率考量

一个关键优化是**用文档 ID 而不是让 Claude 返回完整文本块**。如果让它把每份相关文档的全文复述一遍,你会白白浪费大量等待时间。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620880%2F07_-_008_-_Reranking_Results_14.1748620880511.png)

正确做法是提前给每个文本块分配唯一 ID,然后只让 Claude 按偏好顺序返回这些 ID。这让重排序过程快得多,同时你需要的排序结果一个不少。

## Implementation 实现

重排序函数在初次混合搜索完成后自动被调用。基本结构:

```python
def reranker_fn(docs, query_text, k):
    joined_docs = "\n".join([
        f"""
        <document>
        <document_id>{doc["id"]}</document_id>
        <document_content>{doc["content"]}</document_content>
        </document>
        """
        for doc in docs
    ])
    
    # 用用户问题和文档构建提示词
    # 以 JSON 响应格式发给 Claude
    # 解析并返回重排后的文档 ID
```

把重排序函数作为参数传给 retriever 即可接入:

```python
retriever = Retriever(bm25_index, vector_index, reranker_fn=reranker_fn)
```

## Results 效果

重排序带来的改进很明显。用 "what did the eng team do with INC-2023-Q4-011?" 测试时,软件工程那一节现在正确地排到了网络安全之前。Claude 成功识别出用户问的是**工程团队在这起事故中的参与情况**。

## Trade-offs 权衡

重排序需要考虑几项取舍:

- **延迟增加**: 现在要多等一次 LLM 调用
- **准确性提升**: LLM 对上下文和意图的理解优于纯相似度分数
- **成本上升**: 每次搜索都多一次 LLM API 调用

对很多应用来说,准确性的提升值得这份额外的延迟和成本,尤其是精确检索对你的场景至关重要时。

对产品经理来说: 重排序解决的是一类很具体的问题——**「相关」和「切题」不是一回事**。网络安全那一节确实和这起事故相关,但用户问的是工程团队做了什么。相似度算法分不清这个差别,理解意图的模型可以。判断要不要上重排序,可以看你的用户提问是否经常带限定条件(「某某部门的」「某个时间段的」「排除某类的」),带得越多,重排序的价值越大。
