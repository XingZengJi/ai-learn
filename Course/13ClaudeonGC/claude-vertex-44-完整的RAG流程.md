# Claude with Google Vertex - 44 The full RAG flow 完整的 RAG 流程

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 44
> 课程: Claude with Google Vertex · 第 44 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

RAG 基础、文本分块、嵌入都讲过了,现在把完整的 RAG 流水线一步步走一遍。这个详细例子会让你看清所有零件在真实实现里是怎么拼起来的。

## Step 1: Chunk Your Source Text 第一步: 切分源文本

先把源文档切成可管理的块。本例用两个简单的文本段落:

- **Section 1: Medical Research** —— "This year saw significant strides in our understanding of XDR-47, a 'bug' we have not seen before."
- **Section 2: Software Engineering** —— "This division dedicated significant effort to studying various infection vectors in our distributed systems"

## Step 2: Generate Embeddings 第二步: 生成嵌入

接着把每个文本块转成数值嵌入。为便于理解,假想我们有一个完美的嵌入模型,永远只返回两个数字,而且我们知道每个数字代表什么:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620811%2F07_-_004_-_The_Full_RAG_Flow_02.1748620811676.png)

在这个假想模型里:

- 第一个数字: 文本谈医学的程度
- 第二个数字: 文本谈软件工程的程度

于是医学研究那段得到 `[0.97, 0.34]`——非常医学,又因为出现了 "bug" 一词而稍微沾点软件。软件工程那段得到 `[0.30, 0.97]`——高度软件相关,但 "infection vectors"(感染载体)带有医学意味。

## Normalization 归一化

存储之前,这些嵌入会经过归一化处理,把每个向量缩放到模长为 1.0。这一步通常由嵌入 API 自动完成,但了解它的存在很重要。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620812%2F07_-_004_-_The_Full_RAG_Flow_07.1748620812576.png)

归一化后,嵌入变成 `[0.944, 0.331]` 和 `[0.295, 0.955]`。可以把它们画在单位圆上——两个点都恰好落在圆周上。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620813%2F07_-_004_-_The_Full_RAG_Flow_08.1748620813144.png)

## Step 3: Store in Vector Database 第三步: 存入向量数据库

归一化后的嵌入存进**向量数据库**——一种专为存储、比较、搜索这类长数字列表而优化的数据库。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620814%2F07_-_004_-_The_Full_RAG_Flow_09.1748620813871.png)

到这里先暂停。**以上全部工作都是提前完成的预处理**,现在等用户提交查询。

## Step 4: Process User Query 第四步: 处理用户查询

用户提问,比如 "I'm curious about the company. In particular, what did the software engineering dept do this year?",我们把这个查询也过一遍**同一个**嵌入模型。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620814%2F07_-_004_-_The_Full_RAG_Flow_10.1748620814524.png)

这个查询被嵌入为 `[0.1, 0.89]`——医学分低、软件工程分高。归一化后是 `[0.112, 0.993]`。

## Step 5: Find Similar Embeddings 第五步: 找出相似的嵌入

现在问向量数据库:「找出与这个用户查询嵌入最接近的那个存储嵌入。」数据库返回软件工程那一段,因为它最相似。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620816%2F07_-_004_-_The_Full_RAG_Flow_12.1748620815972.png)

但数据库怎么判定「最接近」?靠**余弦相似度(cosine similarity)**。

## Cosine Similarity 余弦相似度

向量数据库计算两个向量夹角的余弦值来衡量相似度,结果是 -1 到 1 之间的数:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620816%2F07_-_004_-_The_Full_RAG_Flow_15.1748620816527.png)

- **1.0** = 两个向量方向完全一致(非常相似)
- **0.0** = 两个向量垂直(不相关)
- **-1.0** = 两个向量方向相反(非常不同)

本例中:

- 用户查询 vs 软件工程: 余弦相似度 = **0.983**(非常相似!)
- 用户查询 vs 医学研究: 余弦相似度 = **0.398**(相似度较低)

## Cosine Distance 余弦距离

向量数据库文档里经常出现「余弦距离」,它就是 `1 - 余弦相似度`,把刻度翻转过来,**数字越小表示越相似**:

- 0.0 = 非常相似
- 1.0 = 垂直
- 2.0 = 完全相反

## Step 6: Build the Final Prompt 第六步: 构建最终提示词

最后,把用户问题和最相关的文本块(软件工程那段)组合成给 Claude 的提示词:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620817%2F07_-_004_-_The_Full_RAG_Flow_19.1748620817301.png)

```
Answer the user's question about the financial document.

<user_question>
How many bugs did engineers fix this year?
</user_question>

<report>
## Section 2: Software Engineering
This division dedicated significant effort to studying various infection vectors in our distributed systems
</report>
```

这就是完整的 RAG 流水线! 系统成功为用户关于软件工程的问题找到了最相关的上下文,并交给 Claude 生成有依据的回答。

每次用户提交查询,这个过程都会自动跑一遍,让 Claude 能基于**你的**具体文档而不只是它的通用训练知识来作答。

对产品经理来说: 注意第三步之后那句「以上全部是提前完成的预处理」。这意味着 RAG 系统有一个隐性的运维成本——**文档更新时必须重跑预处理**。文档改了但索引没更新,系统就会拿旧内容自信作答,而且从外部完全看不出来。做这类产品时,「索引更新机制」和「索引新鲜度」应该是明确的需求项,不是工程实现细节。
