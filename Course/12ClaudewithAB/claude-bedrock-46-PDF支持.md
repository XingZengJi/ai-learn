# Claude with AWS Bedrock - 46 PDF support PDF 支持

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 46
> 课程: Claude with AWS Bedrock · 第 46 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Claude can read and analyze PDF documents just as easily as it handles images. This capability opens up powerful possibilities for document analysis, summarization, and question-answering workflows.

> Claude 读取和分析 PDF 文档就像处理图像一样轻松。这项能力为文档分析、摘要生成和问答类工作流打开了很大的空间。

## Setting Up PDF Processing 配置 PDF 处理

To work with PDFs, you'll need to make a few key changes to the standard message structure. The process is similar to image handling, but with some important differences in the document specification.

> 要处理 PDF,你需要对标准消息结构做几处关键调整。整体流程和处理图像类似,但在文档的写法上有几个重要区别。

First, read your PDF file as binary data:

> 首先,以二进制方式读取 PDF 文件:

```python
with open("./earth.pdf", "rb") as f:
    file_bytes = f.read()
```

## Document Message Structure 文档消息结构

The message structure for PDFs differs from images in several ways. Instead of an `"image"` object, you'll use a `"document"` object with these required fields:

> PDF 的消息结构和图像有几处不同。你用的不是 `"image"` 对象,而是 `"document"` 对象,并且必须带上下面这些字段:

```python
add_user_message(
    messages,
    [
        {"document": {"format": "pdf", "name": "earth", "source": {"bytes": file_bytes}}},
        {"text": "Summarize this document in one sentence"},
    ],
)
```

Key points about the document structure:

> 关于文档结构的要点:

- Use `"document"` instead of `"image"`. 用 `"document"` 而不是 `"image"`。
- Set `"format": "pdf"`. 把 `"format"` 设为 `"pdf"`。
- Include a `"name"` field with the filename without extension. 加一个 `"name"` 字段,填不带扩展名的文件名。
- The `"source"` contains the file bytes. `"source"` 里放文件的字节数据。

> 比图像多出来的是 `"name"` 字段——这是 PDF 特有的要求,别漏掉。

When you run this code, Claude analyzes the entire PDF content and provides a comprehensive response. In this case, it successfully summarized the Earth Wikipedia article, demonstrating its ability to process multi-page documents with complex layouts, images, and structured information.

> 运行这段代码后,Claude 会分析整份 PDF 的内容并给出完整回答。在这个例子里,它成功总结了维基百科的「地球」词条,展示了它处理多页、复杂排版、含图像和结构化信息的文档的能力。

## What Claude Can Do with PDFs Claude 能用 PDF 做什么

Claude can handle various PDF processing tasks:

> Claude 能应对各类 PDF 处理任务:

- Extract and summarize key information. 提取并总结关键信息。
- Answer specific questions about document content. 回答关于文档内容的具体问题。
- Analyze document structure and formatting. 分析文档结构和排版。
- Process multi-page documents efficiently. 高效处理多页文档。
- Work with PDFs containing both text and images. 处理同时包含文字和图像的 PDF。

The PDF processing capability becomes even more powerful when combined with other features like citations, which allow Claude to reference specific parts of the document in its responses. This makes it particularly useful for research, document analysis, and content extraction workflows.

> 当 PDF 处理能力与「引用(citations)」等其他功能结合时,威力会更大——引用能让 Claude 在回答中指明它依据的是文档的哪些具体部分。这让它在研究、文档分析和内容提取类工作流中特别有用。(引用功能是下一课的内容。)

对产品经理来说: 这一课其实回答了「什么时候不需要上一章那套 RAG」。如果文档不大、装得进单次请求,直接把整份 PDF 丢给 Claude 是最省事的做法; RAG 那一整套分块、嵌入、检索,是文档大到装不下、或者要跨很多份文档搜索时才需要付出的代价。
