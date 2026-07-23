# Claude with Google Vertex - 43 Text embeddings 文本嵌入

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 43
> 课程: Claude with Google Vertex · 第 43 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

从文档里切出文本块之后,RAG 流水线的下一步是找出哪些块与用户问题最相关。这本质上是个搜索问题——你要在所有块里找出与用户所问相关的那些。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620795%2F07_-_003_-_Text_Embeddings_00.1748620795671.png)

## Semantic Search 语义搜索

找相关块最常用的方式是**语义搜索**。与传统的关键词搜索不同,语义搜索用文本嵌入来理解用户问题和每个文本块的**实际含义**。这让系统即便在用词不完全一致时,也能找到概念上相关的内容。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620796%2F07_-_003_-_Text_Embeddings_04.1748620796821.png)

## What Are Text Embeddings? 什么是文本嵌入

文本嵌入(embedding)是某段文本所含语义的数值表示。可以理解为: 把词句转换成计算机能做数学运算的形式。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620797%2F07_-_003_-_Text_Embeddings_06.1748620797380.png)

过程是这样的:

- 你把文本喂给一个嵌入模型
- 模型输出一长串数字(即 embedding)
- 每个数字的取值范围是 -1 到 +1
- 这些数字代表输入文本的不同特质或特征

## Understanding the Numbers 理解那些数字

嵌入里的每个数字本质上是输入文本某种特质的「打分」。但有个重要的提醒: **我们并不知道每个具体数字代表什么**。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620798%2F07_-_003_-_Text_Embeddings_08.1748620798019.png)

想象「某个数字代表文本有多欢快」「另一个代表文本多大程度上在谈海洋」有助于理解,但这些只是概念性的举例。嵌入模型在训练中学到了这些特征,可它们并没有被显式标注,我们也无法解读。

尽管不透明,嵌入依然极其有用,因为它以一种**允许对不同文本做数学比较**的方式捕捉了语义。

## Embeddings on Vertex AI 在 Vertex AI 上生成嵌入

**Claude 不能直接生成嵌入**,你需要用一个专门的嵌入模型。在 Vertex AI 上,我们用的模型叫 `text-embedding-005`。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620799%2F07_-_003_-_Text_Embeddings_13.1748620799354.png)

## Implementation 实现

在 Vertex AI 上使用嵌入,需要安装 Google GenAI SDK:

```bash
pip install google-genai
```

生成嵌入的基础配置:

```python
from google import genai

client = genai.Client(
    project="YOUR_PROJECT_ID", 
    location="global", 
    vertexai=True
)

def generate_embedding(text):
    response = client.models.embed_content(
        model="text-embedding-005", 
        contents=text
    )
    
    if not response.embeddings:
        return []
    
    return [e.values for e in response.embeddings]
```

把一个文本块传进这个函数,你会拿到一串浮点数,代表这段文本的语义。这些嵌入就是在 RAG 系统里实现语义搜索的基础。

下一步是理解怎么用这些嵌入真正找出与用户问题最相关的块,这涉及用数学方式比较嵌入来判定相似度。

对产品经理来说: 注意这一课是 Vertex 版与 Bedrock 版差异最大的技术点之一——**嵌入模型来自 Google(`text-embedding-005`),不是 Anthropic**。这意味着一个 RAG 系统里其实混用了两家的模型: Google 负责检索,Claude 负责生成。做技术选型和成本核算时,这两部分是分开计费、分别限流的,别当成一笔账算。
