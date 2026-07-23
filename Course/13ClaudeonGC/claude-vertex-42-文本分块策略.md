# Claude with Google Vertex - 42 Text chunking strategies 文本分块策略

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 42
> 课程: Claude with Google Vertex · 第 42 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

文本分块是搭建 RAG 流水线里最关键的步骤之一。**你怎么切分文档,直接决定整个系统的质量。** 糟糕的分块策略会把不相关的内容塞进提示词,导致 AI 给出完全错误的答案。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620820%2F07_-_002_-_Text_Chunking_Strategies_01.1748620819902.png)

看这个例子: 一份文档里既有医学研究也有软件工程的章节。分块分得不好的话,用户问「工程师今年修了多少个 bug?」可能拿到医学研究的内容——只因为医学那一节里恰好在另一个语境下出现了 "bug" 这个词(虫子)。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620820%2F07_-_002_-_Text_Chunking_Strategies_03.1748620820757.png)

这说明了分块策略为什么如此重要。目标是切出**语义上自洽、被检索到时能提供有意义上下文**的块。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620821%2F07_-_002_-_Text_Chunking_Strategies_04.1748620821630.png)

## Three Main Chunking Strategies 三大分块策略

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620822%2F07_-_002_-_Text_Chunking_Strategies_05.1748620822407.png)

切分文本主要有三种方式,各有优劣:

- **基于大小(Size-based)**: 把文本切成等长的字符串
- **基于结构(Structure-based)**: 按文档结构切分(标题、段落、章节)
- **基于语义(Semantic-based)**: 用 NLP 技术把相关的句子或段落归组

## Size-Based Chunking 基于大小的分块

这是最直接的做法: 把文档切成字符数或词数大致相等的块。实现简单,对各类文档都能稳定工作。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620823%2F07_-_002_-_Text_Chunking_Strategies_06.1748620823143.png)

但缺点也明显: 词会在句子中间被切断,块会丢失重要上下文。比如某个块里可能不含那个能解释「这段内容到底在说什么」的章节标题。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620824%2F07_-_002_-_Text_Chunking_Strategies_07.1748620823862.png)

解法是让块之间**重叠**。每个块包含一部分相邻块的字符,更好地保住上下文,也避免生硬的截断。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620824%2F07_-_002_-_Text_Chunking_Strategies_08.1748620824409.png)

带重叠的字符分块的基础实现:

```python
def chunk_by_char(text, chunk_size=150, chunk_overlap=20):
    chunks = []
    start_idx = 0
    
    while start_idx < len(text):
        end_idx = min(start_idx + chunk_size, len(text))
        chunk_text = text[start_idx:end_idx]
        chunks.append(chunk_text)
        
        start_idx = (
            end_idx - chunk_overlap if end_idx < len(text) else len(text)
        )
    
    return chunks
```

## Structure-Based Chunking 基于结构的分块

这种方式利用文档天然的组织形式。如果处理的是 markdown 文件,可以按标题切; 其他格式可以按段落或别的结构元素切。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620825%2F07_-_002_-_Text_Chunking_Strategies_09.1748620825351.png)

在文档结构有保证的情况下,这个做法效果极好。markdown 文档可以按章节标题切:

```python
def chunk_by_section(document_text):
    pattern = r'\n## '
    return re.split(pattern, document_text)
```

主要局限在于: **很多文档并没有一致的结构**。纯文本文件、PDF、用户上传的文档,未必有清晰的结构标记可供切分。

## Semantic-Based Chunking 基于语义的分块

这是最精细的做法。它分析句子之间的含义与关联,把相关内容归到一起。通常包括:

- 把文本切成句子
- 用 NLP 技术衡量语义相似度
- 把相关的句子归成自洽的块

这种方式能切出质量最高的块,但计算开销大、实现更复杂。对多数应用来说,更简单的方式已经够用了。

## Practical Implementation 实用实现

下面这个基于句子的分块函数是个不错的折中:

```python
def chunk_by_sentence(text, max_sentences_per_chunk=5, overlap_sentences=1):
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    start_idx = 0
    
    while start_idx < len(sentences):
        end_idx = min(start_idx + max_sentences_per_chunk, len(sentences))
        current_chunk = sentences[start_idx:end_idx]
        chunks.append(' '.join(current_chunk))
        
        start_idx += max_sentences_per_chunk - overlap_sentences
        
        if start_idx < 0:
            start_idx = 0
    
    return chunks
```

## Choosing the Right Strategy 怎么选

选哪种策略完全取决于你的具体场景:

- **文档结构一致**: 用基于结构的分块,结果最干净
- **文档类型混杂**: 基于句子的分块通常表现不错
- **代码或技术内容**: 基于字符的分块最可靠
- **格式未知的文档**: 基于字符的分块是最稳妥的选择

记住分块往往是个迭代过程。**先用简单方案起步,拿你自己的文档和场景测一遍,再根据结果改进。** 所谓「最好」的分块策略,就是对你的数据和需求最稳定可靠的那个。

对产品经理来说: 「bug 一词歧义」那个例子很值得记住,因为它揭示了 RAG 错误的典型形态——**不是模型答错了,而是检索给错了材料**。这类问题在演示时几乎不会暴露(测试问题往往和文档匹配得很好),却在真实使用中频繁发生。验收 RAG 功能时,一定要用「跨领域词汇」的问题去压测。
