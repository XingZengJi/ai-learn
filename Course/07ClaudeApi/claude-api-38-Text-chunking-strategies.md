# Building with the Claude API - 38 Text chunking strategies 文本分块策略

> Course: Building with the Claude API · Lesson 38
> 课程: Building with the Claude API · 第 38 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

文本分块(chunking)是搭建 RAG(检索增强生成)流水线时最关键的步骤之一。你怎么拆分文档,会直接影响整个系统的质量。糟糕的分块策略,会导致不相关的内容被塞进提示词,让 AI 给出完全错误的答案。

来看这个例子:你有一份文档,里面既有医学研究部分,也有软件工程部分。如果分块分得不好,用户问「今年工程师修复了多少个 bug?」,得到的可能反而是医学研究的信息——只因为医学部分恰好在别的语境下也出现了「bug」这个词。

这就是为什么选对分块策略这么重要。我们来看三种主要方法。

## 按大小分块(Size-Based Chunking)

按大小分块是最简单的做法——把文本切成等长的字符串。如果你有一份 325 字符的文档,你可能会把它切成三块,每块大约 108 个字符。

这种方法容易实现,适用于任何类型的文档,但缺点也很明显:

- 词语可能被从句子中间切断
- 小块会丢失前后文的重要上下文
- 章节标题可能和它对应的内容被分开

为了解决这些问题,可以在小块之间加上「重叠(overlap)」。也就是说,每个块都包含相邻块的一部分字符,这样能提供更好的上下文,也能确保完整的词和句子不被切断。

下面是一个基础实现:

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

## 按结构分块(Structure-Based Chunking)

按结构分块,是依据文档天然的结构——标题、段落、章节——来拆分文本。当你手头是格式规整的文档(比如 Markdown 文件)时,这种方法效果很好。

对一份 Markdown 文档,你可以按标题标记来拆分:

```python
def chunk_by_section(document_text):
    pattern = r"\n## "
    return re.split(pattern, document_text)
```

这种方法能给你最干净、最有意义的小块,因为每一块都代表一个完整的章节。不过,它只在你对文档结构有把握的时候才管用。现实中很多文档是纯文本或 PDF,没有清晰的结构标记。

## 按语义分块(Semantic-Based Chunking)

按语义分块是最复杂精细的方法。你先把文本拆成一个个句子,再用自然语言处理来判断相邻句子之间的关联程度,然后把相关联的句子组合成小块。

这种方法计算成本高,但产出的小块相关性最强。它需要理解每个句子的含义,实现起来比其他策略都要复杂。

## 按句子分块(Sentence-Based Chunking)

一个实用的折中方案,是按句子来分块。用正则表达式把文本拆成一个个独立句子,再把它们分组成块,可选地加上重叠:

```python
def chunk_by_sentence(text, max_sentences_per_chunk=5, overlap_sentences=1):
    sentences = re.split(r"(?<=[.!?])\s+", text)
    
    chunks = []
    start_idx = 0
    
    while start_idx < len(sentences):
        end_idx = min(start_idx + max_sentences_per_chunk, len(sentences))
        current_chunk = sentences[start_idx:end_idx]
        chunks.append(" ".join(current_chunk))
        
        start_idx += max_sentences_per_chunk - overlap_sentences
        
        if start_idx < 0:
            start_idx = 0
    
    return chunks
```

## 如何选择策略

选哪种策略,完全取决于你的使用场景和文档的规整程度:

- **按结构分块**:当你能把控文档格式时(比如公司内部报告),效果最好
- **按句子分块**:对大多数文本文档来说,是不错的折中方案
- **按大小分块**:最可靠的兜底方案,适用于任何内容类型,包括代码

带重叠的「按大小分块」,在生产环境里往往是首选,因为它简单、可靠,适用于任何文档类型。虽然它给出的结果未必完美,但能持续稳定地产出「过得去」的小块,不会把你的整条流水线搞崩。

记住:没有哪种分块策略是「万能最佳解」。正确的做法取决于你具体的文档、使用场景,以及你愿意在「实现复杂度」和「分块质量」之间做出怎样的取舍。

---

对产品经理来说,「分块策略选型」很像内容管理系统里「按什么粒度拆分知识库文章」的决策:是按固定字数机械切分(简单粗暴但可靠)、按标题/段落自然拆分(整洁但依赖内容规范)、还是按语义相关性智能聚合(效果最好但成本最高)?没有标准答案,取决于你的内容源本身有多规整、团队愿意为「质量」投入多少工程成本。
