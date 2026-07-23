# Claude with AWS Bedrock - 37 Text embeddings 文本嵌入(Embeddings)

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 37
> 课程: Claude with AWS Bedrock · 第 37 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

After breaking a document into chunks, the next step in a RAG pipeline is finding which chunks are most relevant to a user's question. This is fundamentally a search problem - you need to look through all your text chunks and identify the ones that relate to what the user is asking about.

> 把文档切成块之后,RAG 流水线的下一步是: 找出哪些块和用户的问题最相关。这本质上是一个搜索问题——你需要在所有文本块里翻找,挑出与用户所问内容相关的那些。

## Finding Relevant Chunks 找到相关的块

The challenge is determining which chunks are "related" to a user's question. This isn't as simple as keyword matching - you need to understand the meaning and context of both the question and the chunks.

> 难点在于判断哪些块和用户的问题「相关」。这可不像关键词匹配那么简单——你需要理解问题和块两边的含义与语境。

The most common solution is semantic search, which uses text embeddings to understand what each piece of text is actually about, rather than just looking for exact word matches.

> 最常见的解法是语义搜索(semantic search): 用文本嵌入来理解每段文字究竟在讲什么,而不是只找字面上完全一致的词。

## What Are Text Embeddings? 什么是文本嵌入?

A text embedding is a numerical representation of the meaning contained in some text. Think of it as converting words and sentences into a format that computers can work with mathematically.

> 文本嵌入是「某段文字所含含义」的数值化表示。你可以把它理解为: 把词句转换成计算机能用数学方式处理的格式。

Here's how it works:

> 运作方式如下:

1. You feed text into an embedding model. 你把文本喂给嵌入模型。
2. The model outputs a long list of numbers (typically 1024 numbers). 模型输出一长串数字(通常是 1024 个)。
3. Each number represents a "score" for some quality of the input text. 每个数字代表输入文本在某种特质上的「得分」。
4. The numbers range from -1 to +1. 这些数字的取值范围是 -1 到 +1。

## Understanding the Numbers 理解这些数字

Each number in an embedding is like a score for some aspect of the text. While we don't know exactly what each position represents, it's helpful to think of them as measuring different qualities.

> 嵌入里的每个数字,都像是文本在某个侧面上的得分。虽然我们并不确切知道每个位置具体代表什么,但把它们想象成在衡量不同的特质,有助于理解。

For example, one number might score "how happy the text is" while another might measure "how much the text talks about oceans." The key point is that we don't actually know what each number represents - the embedding model learns these patterns during training, and they're not human-interpretable.

> 举例来说,某个数字可能在打分「这段文字有多快乐」,另一个可能在衡量「这段文字有多少在谈海洋」。但关键在于: 我们其实并不知道每个数字到底代表什么——这些模式是嵌入模型在训练过程中自己学到的,人类无法直接解读。

对产品经理来说,这有点像给每篇文章打一套「用户画像标签分」,只不过这套标签有 1024 个维度、而且没有名字。你看不懂单个维度,但两篇文章的这 1024 个分数很接近,就说明它们讲的是相似的事。

## Generating Embeddings with Code 用代码生成嵌入

Creating embeddings is straightforward. Here's the basic process:

> 生成嵌入很直接,基本流程如下:

```python
def generate_embedding(
    text,
    embedding_model_id="amazon.titan-embed-text-v2:0",
    dimensions=1024,
    normalize=True,
):
    request_body = {
        "inputText": text,
        "dimensions": dimensions,
        "normalize": normalize,
    }

    request_json = json.dumps(request_body)
    response = client.invoke_model(
        modelId=embedding_model_id,
        body=request_json,
        accept="application/json",
        contentType="application/json",
    )

    response_body = json.loads(response.get("body").read())
    return response_body["embedding"]
```

> 代码在做什么: 把要转换的文本、想要的维度数(1024)、是否归一化打包成请求体,调用 Bedrock 的嵌入模型(这里用的是 Amazon Titan 嵌入模型,不是 Claude),然后从返回结果里取出 `embedding` 字段——那就是那串数字。

When you run this function on a text chunk, you get back a list of 1024 numbers that represent the semantic meaning of that text.

> 对一个文本块运行这个函数,你会得到一个包含 1024 个数字的列表,它代表这段文本的语义。

Note that you might need to request access to the Titan embedding model in the AWS Bedrock console. If version 2 isn't available, version 1 works just as well for learning purposes.

> 注意: 你可能需要先在 AWS Bedrock 控制台申请开通 Titan 嵌入模型的访问权限。如果第 2 版不可用,用第 1 版做学习练习效果也一样。

## Why Embeddings Matter for RAG 嵌入对 RAG 为什么重要

The power of embeddings becomes clear when you realize that similar texts will have similar embedding values. This means you can mathematically compare a user's question to your document chunks and find the most semantically similar ones - even if they don't share the exact same words.

> 当你意识到「相似的文本会有相似的嵌入数值」时,嵌入的威力就显现出来了。这意味着你可以用数学方式把用户的问题和文档块做比较,找出语义上最相近的那些——哪怕它们用的词并不完全一样。

This numerical representation is what makes semantic search possible and much more effective than simple keyword matching for finding relevant context in RAG systems.

> 正是这种数值化表示,让语义搜索成为可能; 在 RAG 系统里寻找相关上下文时,它比简单的关键词匹配要有效得多。
