# Claude with AWS Bedrock - 39 Implementing the RAG flow 实现 RAG 流程

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 39
> 课程: Claude with AWS Bedrock · 第 39 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

This walkthrough demonstrates the complete RAG (Retrieval-Augmented Generation) implementation using a practical example. We'll build a vector database from scratch and execute all five steps of the RAG workflow using a sample report document.

> 这一课用一个实际例子演示完整的 RAG(检索增强生成)实现。我们会从零搭一个向量数据库,并拿一份示例报告文档走完 RAG 工作流的全部五个步骤。

## Setting Up the Vector Database 搭建向量数据库

The implementation uses a custom `VectorIndex` class that handles storing embeddings and performing similarity searches. This class provides the core functionality we need for our vector database operations.

> 实现中用了一个自定义的 `VectorIndex` 类,负责存储嵌入和执行相似度搜索。这个类提供了向量数据库操作所需的核心功能。

> 生产环境里你通常会用现成的向量数据库(Pinecone、Chroma、pgvector 等),这里自己写一个只是为了让你看清内部到底发生了什么。

## The Five-Step RAG Implementation 五步实现 RAG

### Step 1: Chunk the Text by Section 第一步: 按章节分块

First, we load and chunk our source document using the same section-based chunking approach from earlier:

> 首先,加载源文档,并用之前讲过的「按章节分块」方法切分:

```python
with open("./report.md", "r") as f:
    text = f.read()

chunks = chunk_by_section(text)
```

This breaks our report into logical sections that can be processed independently.

> 这会把报告切成一个个逻辑章节,每节都能被独立处理。

### Step 2: Generate Embeddings for Each Chunk 第二步: 为每个块生成嵌入

Next, we create embeddings for every chunk using a list comprehension:

> 接下来用一个列表推导式为每个块生成嵌入:

```python
embeddings = [generate_embedding(chunk) for chunk in chunks]
```

This step involves multiple API calls, so it takes some time to complete. Each chunk gets converted into a numerical vector representation.

> 这一步会发起多次 API 调用,所以需要花一些时间。每个块都会被转换成一个数值向量表示。

> 这也是 RAG 的成本所在: 有多少块就要调多少次嵌入接口。好在这是一次性的预处理,不是每次用户提问都要重来。

### Step 3: Store Embeddings in the Vector Database 第三步: 把嵌入存入向量数据库

Now we create our vector store and populate it with both embeddings and their associated text:

> 现在创建向量存储,把嵌入**和它对应的原文**一起放进去:

```python
store = VectorIndex()

for embedding, chunk in zip(embeddings, chunks):
    store.add_vector(embedding, {"content": chunk})
```

The key insight here is that we store both the embedding and the original text. Just getting back a list of numbers isn't useful - we need the actual text content that corresponds to those embeddings. This metadata allows us to retrieve meaningful results later.

> 这里的关键点在于: 我们同时存了嵌入和原文。光拿回一串数字是没用的——我们需要与这些嵌入对应的真实文本内容。正是这些元数据(metadata)让我们后续能取回有意义的结果。

### Step 4: Generate User Query Embedding 第四步: 生成用户查询的嵌入

When a user asks a question, we convert it to the same embedding format:

> 当用户提问时,把问题转换成同样格式的嵌入:

```python
user_embedding = generate_embedding("What did the software engineering dept do last year?")
```

This creates a vector representation of the user's question that can be compared against our stored embeddings.

> 这样就得到了用户问题的向量表示,可以拿去和已存储的嵌入做比较。

### Step 5: Search and Retrieve Relevant Chunks 第五步: 搜索并取回相关的块

Finally, we search our vector store to find the most similar content:

> 最后,在向量存储里搜索最相似的内容:

```python
results = store.search(user_embedding, 2)

for doc, distance in results:
    print(distance, "\n", doc["content"][0:200], "\n")
```

This returns the two most relevant chunks along with their cosine distance scores. Lower distances indicate higher similarity.

> 这会返回最相关的两个块,以及它们的余弦距离分数。距离越小,相似度越高。

## Understanding the Results 理解结果

The search returns results ranked by relevance. In our example, the software engineering section had the lowest distance (0.71), making it the most relevant match. The methodology section came second with a distance of 0.72.

> 搜索返回的结果是按相关性排序的。在我们的例子里,软件工程那节距离最小(0.71),因此是最相关的匹配; 方法论那节以 0.72 的距离排第二。

The distance metric helps you understand how confident the system is about the relevance of each result. Closer distances mean better matches to the user's query.

> 距离这个指标能帮你判断系统对每条结果的相关性有多大把握。距离越近,说明与用户查询匹配得越好。

> 注意 0.71 和 0.72 差距非常小——这说明纯语义搜索有时候区分度并不高,这也是后面几课要引入 BM25 关键词搜索和重排序的原因。

## Why Store Text with Embeddings 为什么要把原文和嵌入一起存

A crucial design decision is storing the original text alongside each embedding. Without this, you'd only get back arrays of numbers, which aren't useful for generating responses. By including the source text, you can immediately use the retrieved chunks to provide context for your language model.

> 一个关键的设计决策是: 把原文和每个嵌入一起存储。否则你检索回来的只是一堆数字数组,对生成回答毫无用处。带上源文本,你才能立刻把检索到的块拿去给语言模型当上下文。

This completes the core RAG workflow, though there are additional optimizations and improvements that can enhance performance in real-world scenarios.

> 到这里核心的 RAG 工作流就完整了,不过在真实场景中还有一些额外的优化和改进能进一步提升效果。
