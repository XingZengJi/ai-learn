# Building with the Claude API - 39 Text embeddings 文本嵌入

> Course: Building with the Claude API · Lesson 39
> 课程: Building with the Claude API · 第 39 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

把文档拆分成小块之后,RAG 流水线的下一步,是找出哪些小块和用户的问题最相关。这本质上是一个搜索问题——你需要在所有的文本小块里查找,找出和用户所问内容相关的那些。

## 语义搜索(Semantic Search)

查找相关小块最常用的方法是语义搜索。和「找精确关键词匹配」的关键词搜索不同,语义搜索用文本嵌入(text embeddings)来理解用户问题和每个文本小块的含义与上下文。

## 文本嵌入

文本嵌入,是某段文本所包含含义的数值化表示。可以把它理解成:把词语和句子转换成一种计算机能用数学方式处理的格式。

具体过程是这样的:

1. 把文本输入一个嵌入模型
2. 模型输出一长串数字(也就是「嵌入向量」)
3. 每个数字的取值范围在 -1 到 +1 之间
4. 这些数字代表了输入文本的不同性质或特征

## 理解这些数字

嵌入向量里的每个数字,本质上都是对输入文本某种性质的「打分」。但这里有个重要的前提:我们其实并不确切知道每个数字具体代表什么。

虽然想象「某个数字代表文本有多『开心』」「另一个数字代表文本有多少和『海洋』相关」有助于理解,但这些只是概念性的举例。每个维度的真实含义,是模型在训练过程中自己学到的,人类无法直接解读。

## 用 VoyageAI 生成嵌入

由于 Anthropic 目前不直接提供嵌入生成服务,推荐使用的服务商是 VoyageAI。你需要:

1. 单独注册一个 VoyageAI 账号
2. 获取一个 API key(免费即可开始使用)
3. 把这个 key 加进环境变量

在你的 `.env` 文件里加上:

```
VOYAGE_API_KEY="your_key_here"
```

## 具体实现

首先,安装 VoyageAI 库:

```python
%pip install voyageai
```

然后配置客户端,写一个生成嵌入的函数:

```python
from dotenv import load_dotenv
import voyageai

load_dotenv()
client = voyageai.Client()

def generate_embedding(text, model="voyage-3-large", input_type="query"):
    result = client.embed([text], model=model, input_type=input_type)
    return result.embeddings[0]
```

对一个文本小块运行这个函数,你会得到一串浮点数,代表这段文本的嵌入向量。这个过程很快、很直接——真正的难点在于,如何在 RAG 流水线里有效地利用这些嵌入向量来找出最相关的内容。

下一步是学习如何比较嵌入向量,判断哪些小块和用户的问题最相似,这正是语义搜索流程的核心所在。

---

对产品经理来说,文本嵌入就像给每段文字打了一份「多维性格标签」——只不过这份标签是机器自己学出来的,不是人为设计的分类维度,所以你没法拿着标签表逐条解释「这个 0.7 是什么意思」。你能确认的是:两段文字的「标签」越接近,它们的语义就越相近。这也是为什么选嵌入模型服务商(比如这里的 VoyageAI)是个独立于 Claude 本身的技术决策,需要单独接入、单独计费。
