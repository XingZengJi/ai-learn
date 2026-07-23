# Claude with AWS Bedrock - 36 Text chunking strategies 文本分块策略

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 36
> 课程: Claude with AWS Bedrock · 第 36 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Text chunking is one of the most critical steps in building a RAG (Retrieval Augmented Generation) pipeline. How you break up your documents directly impacts the quality of your entire system. A poor chunking strategy can lead to irrelevant context being inserted into your prompts, causing your AI to give completely wrong answers.

> 文本分块是搭建 RAG(检索增强生成)流水线时最关键的步骤之一。你怎么切分文档,直接决定整个系统的质量。糟糕的分块策略会让不相关的上下文被塞进提示词,导致你的 AI 给出完全错误的答案。

Consider this example: you have a document with sections on medical research and software engineering. If you chunk poorly, a user asking "How many bugs did engineers fix this year?" might get information about medical research instead of software engineering, simply because the medical section happened to contain the word "bug" in a different context.

> 看这个例子: 你的文档里既有医学研究章节,也有软件工程章节。如果分块分得不好,用户问「工程师今年修了多少个 bug?」时,拿到的可能是医学研究的内容而不是软件工程的——原因仅仅是医学那节里恰好出现了 "bug"(在英文里也有「虫子/病菌」的意思)这个词,只不过语境完全不同。

This demonstrates why chunking strategy matters so much. The goal is to create chunks that maintain semantic coherence and provide useful context when retrieved.

> 这说明了分块策略为什么如此重要。目标是切出既能保持语义连贯、被检索出来时又能提供有用上下文的块。

## Three Main Chunking Strategies 三种主要的分块策略

There are three primary approaches to dividing text into chunks:

> 把文本切成块主要有三条路子:

- **Size-based** 按大小: Divide text into strings of equal length. 把文本切成等长的字符串。
- **Structure-based** 按结构: Split based on document structure (headers, paragraphs, sections). 依据文档结构切分(标题、段落、章节)。
- **Semantic-based** 按语义: Group related sentences or sections using NLP techniques. 用 NLP 技术把相关的句子或章节归到一组。

## Size-Based Chunking 按大小分块

Size-based chunking is the most straightforward approach. You simply divide your document into chunks of roughly equal character or word count. It's easy to implement and works reliably across different document types.

> 按大小分块是最直白的做法: 把文档切成字符数或词数大致相等的块。实现简单,而且在各种类型的文档上都能稳定工作。

However, this approach has clear downsides:

> 但这种做法有明显的缺点:

- Words get cut off mid-sentence. 句子会被从中间截断,词也可能被切开。
- Chunks lose important context from surrounding text. 块会丢失来自上下文的重要信息。
- Related content might be split across multiple chunks. 相关内容可能被拆散到多个块里。

### Adding Overlap 加入重叠

To address the context problem, you can implement an overlap strategy. Each chunk includes some characters from neighboring chunks, providing additional context and ensuring important information isn't lost at chunk boundaries.

> 为了解决上下文丢失的问题,你可以采用「重叠」策略: 每个块都包含一些来自相邻块的字符,这样能补充上下文,确保重要信息不会在块的边界处丢失。

While this creates some duplication, the trade-off is usually worth it for the improved context each chunk receives.

> 虽然这会造成一些内容重复,但换来每个块更完整的上下文,这笔买卖通常是划算的。

## Structure-Based Chunking 按结构分块

When your documents have consistent formatting (like markdown with clear headers), structure-based chunking can produce excellent results. You split on structural elements like headers, creating chunks that align with the document's natural organization.

> 如果你的文档格式统一(比如带清晰标题的 markdown),按结构分块能产生非常好的结果。你按标题这类结构元素来切,切出来的块正好对应文档天然的组织方式。

This works beautifully for well-formatted documents but requires guarantees about document structure. It won't work reliably with plain text files or inconsistently formatted documents.

> 这对格式良好的文档效果极佳,但前提是你能保证文档确实有这样的结构。面对纯文本文件或格式混乱的文档,它就不可靠了。

## Implementation Examples 实现示例

Here are three practical chunking functions you can implement:

> 下面是三个可以直接用的分块函数:

### Character-Based Chunking 按字符分块

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

> 代码在做什么: 从头开始,每次截取 150 个字符作为一块; 下一块的起点往回退 20 个字符(这就是「重叠」),保证跨越边界的信息不丢。到文本末尾时收尾退出。

### Sentence-Based Chunking 按句子分块

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

> 代码在做什么: 先用正则按句号、问号、感叹号把文本拆成句子,然后每 5 句打包成一块,块与块之间重叠 1 句。好处是不会把句子从中间切断。

### Section-Based Chunking 按章节分块

```python
def chunk_by_section(document_text):
    pattern = r"\n## "
    return re.split(pattern, document_text)
```

> 代码在做什么: 直接按 markdown 的二级标题 `## ` 切分,一节就是一块。非常简单,但完全依赖文档真的有这种标题结构。

## Choosing the Right Strategy 如何选择合适的策略

Your choice of chunking strategy depends entirely on your specific use case:

> 选哪种分块策略,完全取决于你的具体场景:

- **Character-based** 按字符: Most reliable fallback, works with any document type. 最可靠的兜底方案,任何类型的文档都能用。
- **Sentence-based** 按句子: Good balance of context and meaning for prose. 对散文类文本来说,是上下文与语义之间不错的平衡。
- **Section-based** 按章节: Excellent results when you have structured documents. 面对结构化文档时效果极佳。

For user-uploaded documents with no formatting guarantees, character-based chunking is often your safest bet. For well-structured internal documents, section-based chunking can provide superior results. Sentence-based chunking works well for most prose but can struggle with code or technical documents that use periods in unexpected ways.

> 对于用户上传、格式无法保证的文档,按字符分块通常是最保险的选择。对于结构规整的内部文档,按章节分块能给出更好的结果。按句子分块适合大多数散文类内容,但遇到代码或技术文档(里面的句点用法很不寻常)就容易出问题。

Remember that chunking is often an iterative process. Start with a simple approach, test it with your specific documents and use cases, then refine based on the quality of results you're getting from your RAG system.

> 记住,分块往往是一个迭代过程。先从简单方案开始,拿你自己的文档和场景去测,再根据 RAG 系统实际返回的结果质量去调优。

对产品经理来说,这跟做信息架构很像: 你可以按固定长度切页(简单粗暴但可能拆散一句话)、按目录章节切(整齐但要求原文有目录)、按主题语义切(最贴近用户心智但最费工)。没有绝对正确的答案,只有跟你手上内容形态匹配的答案。
