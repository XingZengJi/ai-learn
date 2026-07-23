# Claude with Google Vertex - 45 Implementing the RAG flow 实现 RAG 流程

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 45
> 课程: Claude with Google Vertex · 第 45 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

概念上理解了 RAG 流程,现在用一个实际例子一步步实现它。我们会走完 RAG 的全部五个阶段: 从切分文本到为用户查询找出相关文档。

## Setting Up the Vector Database 搭建向量数据库

本次实现用一个自定义的 `VectorIndex` 类,它提供存储和搜索嵌入所需的基础功能: 向量存储、距离计算(用余弦相似度)、文档检索。

## The Five-Step RAG Implementation 五步实现

### Step 1: Chunk the Text by Section 第一步: 按章节切分文本

先把源文档切成可管理的块,沿用前面基于章节的分块方式:

```python
chunks = chunk_by_section(text)
```

这会把 `report.md` 切成一个个可以独立处理的逻辑章节。

### Step 2: Generate Embeddings for Each Chunk 第二步: 为每个块生成嵌入

把每个文本块转成能捕捉其语义的数值嵌入:

```python
embeddings = generate_embedding(chunks)
```

有了嵌入,不同文本之间就能做数学比较。

### Step 3: Store Embeddings in the Vector Database 第三步: 把嵌入存进向量数据库

创建向量存储,把嵌入和对应文本填进去:

```python
store = VectorIndex()

for embedding, chunk in zip(embeddings, chunks):
    store.add_vector(embedding, {"content": chunk})
```

注意我们**同时存了嵌入和原始文本内容**。这一点很关键: 后面检索到相似嵌入时,我们需要的是实际文本,而不只是那串数字向量。光有嵌入对开发者毫无用处,我们要的是它所代表的、人能读懂的内容。

### Step 4: Generate an Embedding for the User Query 第四步: 为用户查询生成嵌入

用户提问时,要把查询转换到与存储文档相同的嵌入空间:

```python
user_embedding = generate_embedding("What did the software engineering dept do last year?")
```

### Step 5: Search for Relevant Documents 第五步: 搜索相关文档

最后在向量存储里搜出最相关的块:

```python
results = store.search(user_embedding, 2)

for doc, distance in results:
    print(distance, "\n", doc["content"][0:200], "\n")
```

这会返回最相似的两个块及其余弦距离分数。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620875%2F07_-_005_-_Implementing_the_Rag_Flow_10.1748620875517.png)

上图展示了向量数据库怎么处理用户查询: 问题被转成嵌入向量,数据库在高维空间里找出「距离最近」的那些存储向量。

## Understanding the Results 理解结果

用关于软件工程部门的查询跑这个例子,会返回两个相关章节:

- Section 2: Software Engineering - Project Phoenix Stability Enhancements(距离 0.71)
- Methodology 章节(距离 0.72)

**距离分数越低,内容与查询越相似。** 这两个结果都与「软件工程部门做了什么」这个问题相关。

## Why Store Content with Embeddings 为什么要把内容和嵌入存在一起

你可能会问,为什么要在每个嵌入旁边存原始文本。原因很实际: **嵌入只是一串对人毫无意义的数字**。当搜索返回最相似的嵌入时,我们需要实际文本内容才能知道找到了什么,才能用它来生成回答。

有些实现只存一个指向原文的 ID,这里为了简单,直接把内容和向量存在一起。

## What's Next 下一步

这个实现覆盖了 RAG 的核心工作流,但仍有改进空间。真实应用中你会遇到这个基础方案不奏效的场景,后面几节会探讨那些改进手段。

对产品经理来说: 注意那两个返回结果的距离——0.71 和 0.72,几乎没有区别。这暴露了 RAG 一个很现实的难题: **相似度分数往往区分度很低,没有一个天然的「相关/不相关」分界线**。所以「取前 N 条」几乎总比「取分数高于某阈值的」更实用。如果有人在方案里提出用固定阈值来过滤,值得追问一句这个阈值是怎么定的。
