# Building with the Claude API - 41 Implementing the RAG flow 实现 RAG 流程

> Course: Building with the Claude API · Lesson 41
> 课程: Building with the Claude API · 第 41 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

现在我们已经在概念上理解了 RAG 流程,接下来一步步动手实现它。我们会走一个完整的例子,演示如何拆分文本、生成嵌入向量、把它们存进向量数据库,并执行相似度搜索。

## 五步实现 RAG

我们的实现遵循之前讨论过的同样五个步骤:

1. 按章节把文本分块
2. 为每个小块生成嵌入向量
3. 创建一个向量存储,把每个嵌入向量加进去
4. 为用户的问题生成嵌入向量
5. 在存储里搜索,找出最相关的小块

## 第一步:文本分块

首先,加载文档,把它拆成好管理的章节:

```python
with open("./report.md", "r") as f:
    text = f.read()

chunks = chunk_by_section(text)
chunks[2]  # 测试一下,看看目录部分
```

我们沿用之前的 `chunk_by_section` 函数,把文档拆成一个个逻辑上的章节。

## 第二步:生成嵌入向量

接下来,一次性给所有小块生成嵌入向量:

```python
embeddings = generate_embedding(chunks)
```

这个嵌入函数已经更新,能同时处理单个字符串和字符串列表,批量处理时效率更高。

## 第三步:存入向量数据库

现在创建向量存储,把嵌入向量和它们对应的文本一起存进去:

```python
store = VectorIndex()

for embedding, chunk in zip(embeddings, chunks):
    store.add_vector(embedding, {"content": chunk})
```

注意,我们把嵌入向量和原始文本内容都存了下来。这一点很关键,因为之后搜索时,我们需要返回的是实际的文本,而不只是一串数字。

### 为什么要存原始文本?

查询向量数据库时,只拿到一串嵌入数字是没有用的。我们需要的是生成这些嵌入向量所用的实际文本。这就是为什么我们要在数据库里,把原始文本小块(或者至少是它的引用)和对应的嵌入向量一起存起来。

## 第四步:处理用户查询

当用户提问时,我们为他们的查询生成一个嵌入向量:

```python
user_embedding = generate_embedding("What did the software engineering dept do last year?")
```

## 第五步:查找相关内容

最后,在向量存储里搜索,找出最相似的小块:

```python
results = store.search(user_embedding, 2)

for doc, distance in results:
    print(distance, "\n", doc["content"][0:200], "\n")
```

这次搜索会返回最相关的两个小块,连同它们的相似度分数(余弦距离)。

搜索结果会告诉我们:文档里的哪些章节和用户的问题最相关,并附上相似度分数。

## 理解搜索结果

运行「软件工程部门做了什么」这个例子查询后,我们得到:

- 「第 2 节:软件工程」,距离为 0.71(最接近的匹配)
- 「研究方法」章节,距离为 0.72(第二接近)

距离值越低,表示相似度越高,所以第 2 节和我们的查询最相关。

## 接下来呢?

这个实现在基础场景下表现不错,但也有一些场景它处理得不够理想。在接下来的部分,我们会探讨如何改进,让 RAG 系统更健壮、更准确。

核心要点是:RAG 本质上就是「把文本转换成数字(嵌入向量)、高效地存储这些数字、再用数学上的相似度计算,在用户提问时找出相关内容」这么一件事。

---

对产品经理来说,「存原始文本 + 嵌入向量」这个细节值得记住:很多团队第一次做检索系统时,容易只关注「怎么算相似度」,却忘了数据库里必须留一份能直接展示给用户(或喂给 AI)的原文——嵌入向量只是用来「找」的索引,不是用来「读」的内容,这和搜索引擎的倒排索引和网页正文是两回事一个道理。
