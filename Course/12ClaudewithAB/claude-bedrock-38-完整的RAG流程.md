# Claude with AWS Bedrock - 38 The full RAG flow 完整的 RAG 流程

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 38
> 课程: Claude with AWS Bedrock · 第 38 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Now that we've covered the basics of RAG, text chunking, and embeddings, let's walk through the complete RAG pipeline step by step. This detailed example will show you exactly how all the pieces fit together in a real implementation.

> 我们已经讲过 RAG 基础、文本分块和嵌入,现在来一步步走完整条 RAG 流水线。这个详细的例子会让你清楚地看到,在真实实现里各个零件是怎么拼在一起的。

## Step 1: Chunk Your Source Text 第一步: 把源文本分块

First, we take our source document and break it into manageable chunks. For this example, we'll use two simple text sections:

> 首先,把源文档切成大小合适的块。在这个例子里,我们用两段简单的文本:

- **Section 1: Medical Research** - "This year saw significant strides in our understanding of XDR-47, a 'bug' we have not seen before."
  > 第 1 节: 医学研究 —— 「今年我们在理解 XDR-47 这种前所未见的『bug(病菌)』方面取得了重大进展。」
- **Section 2: Software Engineering** - "This division dedicated significant effort to studying various infection vectors in our distributed systems"
  > 第 2 节: 软件工程 —— 「本部门投入了大量精力研究分布式系统中的各类『感染途径(infection vectors)』。」

> 注意这两段刻意用了容易互相混淆的词: 医学那节出现了 "bug",软件那节出现了 "infection vectors"。这正是用来检验检索准不准的陷阱。

## Step 2: Generate Embeddings 第二步: 生成嵌入

Next, we convert each text chunk into numerical embeddings. To make this concept clear, let's imagine we have a perfect embedding model that always returns exactly two numbers, and we know what each number represents:

> 接下来,把每个文本块转换成数值嵌入。为了把概念讲清楚,我们假想有一个完美的嵌入模型,它每次只返回两个数字,而且我们知道每个数字代表什么:

In our imaginary model:

> 在这个假想模型里:

- **First number**: How much the text talks about the medical field. 第一个数字: 这段文字有多少在讲医学领域。
- **Second number**: How much the text talks about software engineering. 第二个数字: 这段文字有多少在讲软件工程。

So our medical research section gets an embedding of `[0.97, 0.34]` - very medical, somewhat software-related due to the word "bug". The software engineering section gets `[0.30, 0.97]` - very software-focused, but "infection vectors" has medical connotations.

> 于是医学研究那节的嵌入是 `[0.97, 0.34]`——非常医学,又因为 "bug" 这个词而带上了一点软件味。软件工程那节是 `[0.30, 0.97]`——高度偏软件,但 "infection vectors" 又让它沾了点医学色彩。

### Normalization 归一化

Before storing these embeddings, they go through a normalization process that scales each vector to have a magnitude of 1.0. This is typically handled automatically by your embedding API, but it's important to understand that it happens.

> 在存储这些嵌入之前,它们会经过一个归一化过程: 把每个向量缩放到长度为 1.0。这一步通常由嵌入 API 自动完成,但你有必要知道它确实发生了。

After normalization, our embeddings become `[0.944, 0.331]` and `[0.295, 0.955]`. We can visualize these on a unit circle where each point lies exactly on the circle's edge.

> 归一化之后,两个嵌入变成 `[0.944, 0.331]` 和 `[0.295, 0.955]`。可以把它们画在一个单位圆上,每个点都恰好落在圆周上。

> 为什么要归一化: 长度统一之后,比较两个向量就只剩下「方向」的差别了——也就是只比语义方向,不受文本长短之类因素干扰。

## Step 3: Store in Vector Database 第三步: 存入向量数据库

The normalized embeddings get stored in a vector database - a specialized database optimized for storing, comparing, and searching through long lists of numbers like our embeddings.

> 归一化后的嵌入会被存入向量数据库——这是一种专门优化过的数据库,擅长存储、比较和搜索像嵌入这样的长数字列表。

At this point, we pause. All the work so far has been preprocessing that happens ahead of time. Now we wait for a user to submit a query.

> 到这里我们暂停一下。到目前为止所有的工作都是**提前完成的预处理**。接下来就是等用户来提问了。

## Step 4: Process User Query 第四步: 处理用户查询

When a user asks a question like "I'm curious about the company. In particular, what did the software engineering dept do this year?", we run their query through the same embedding model.

> 当用户提出「我想了解一下这家公司,特别是软件工程部门今年做了什么?」这样的问题时,我们把这个查询也送进**同一个**嵌入模型。

This query gets embedded as `[0.1, 0.89]` - low medical score, high software engineering score. After normalization, it becomes `[0.112, 0.993]`.

> 这个查询被嵌入为 `[0.1, 0.89]`——医学分很低,软件工程分很高。归一化之后变成 `[0.112, 0.993]`。

## Step 5: Find Similar Embeddings 第五步: 找出相似的嵌入

Now we ask the vector database: "Find the stored embedding that's closest to this user query embedding." The database returns the software engineering section because it's the most similar.

> 现在我们问向量数据库: 「找出与这个用户查询嵌入最接近的已存嵌入。」数据库返回了软件工程那一节,因为它最相似。

### How Similarity Works: Cosine Similarity 相似度是怎么算的: 余弦相似度

The vector database uses cosine similarity to determine which embeddings are most similar. This measures the cosine of the angle between two vectors.

> 向量数据库用余弦相似度(cosine similarity)来判断哪些嵌入最相似。它测的是两个向量之间夹角的余弦值。

Key points about cosine similarity:

> 关于余弦相似度的要点:

- Results range from -1 to 1. 取值范围是 -1 到 1。
- Values close to 1 mean very similar. 接近 1 表示非常相似。
- Values close to 0 mean perpendicular (unrelated). 接近 0 表示两者垂直(不相关)。
- Values close to -1 mean completely opposite. 接近 -1 表示完全相反。

The calculation uses the dot product formula: `cos(a) = (A · B) / (||A|| · ||B||)`

> 计算用的是点积公式: `cos(a) = (A · B) / (||A|| · ||B||)`

In our example, the user query has a cosine similarity of 0.983 with the software engineering chunk and only 0.398 with the medical research chunk. The software engineering chunk is clearly the better match.

> 在我们的例子里,用户查询与软件工程块的余弦相似度是 0.983,与医学研究块只有 0.398。显然软件工程块才是更好的匹配。

### Cosine Distance 余弦距离

You'll often see "cosine distance" in vector database documentation. This is simply `1 - cosine similarity`, which gives us an easier-to-interpret number where:

> 你在向量数据库文档里经常会看到「余弦距离」。它就是 `1 - 余弦相似度`,换成了一个更好理解的数字:

- Values close to 0 mean high similarity. 接近 0 表示高度相似。
- Larger values mean less similarity. 数值越大表示越不相似。

## Step 6: Build the Final Prompt 第六步: 组装最终的提示词

Finally, we take the user's question and the most relevant text chunk we found, then combine them into a prompt for Claude:

> 最后,把用户的问题和我们找到的最相关文本块合在一起,组成给 Claude 的提示词:

The prompt includes both the user's question and the relevant context from our document, allowing Claude to provide an informed answer based on the specific information in our knowledge base.

> 这条提示词同时包含用户的问题和来自文档的相关上下文,让 Claude 能基于我们知识库里的具体信息给出有依据的回答。

## The Complete Flow 完整流程回顾

That's the entire RAG pipeline from start to finish:

> 这就是从头到尾完整的 RAG 流水线:

1. Chunk source documents. 把源文档分块。
2. Generate embeddings for each chunk. 为每个块生成嵌入。
3. Store embeddings in a vector database. 把嵌入存进向量数据库。
4. When a user asks a question, embed their query. 用户提问时,把查询也做嵌入。
5. Find the most similar stored embeddings using cosine similarity. 用余弦相似度找出最相似的已存嵌入。
6. Add the relevant chunks to a prompt with the user's question. 把相关的块和用户问题一起放进提示词。
7. Send the enhanced prompt to Claude for a response. 把这条增强后的提示词发给 Claude,拿到回答。

Understanding this process and the math behind it will help you work effectively with vector databases and debug issues when your RAG system isn't returning the results you expect.

> 理解这个流程以及背后的数学,能帮你更高效地使用向量数据库,也能在 RAG 系统返回结果不符合预期时定位问题。

> 记住前 3 步是「离线预处理」、后 4 步是「用户提问时实时发生」——这条分界线是理解 RAG 成本和延迟结构的关键。
