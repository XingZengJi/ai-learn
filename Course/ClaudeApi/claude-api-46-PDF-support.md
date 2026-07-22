# Building with the Claude API - 46 PDF support PDF 支持

> Course: Building with the Claude API · Lesson 46
> 课程: Building with the Claude API · 第 46 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

Claude 能直接读取和分析 PDF 文件,这让它成为一个强大的文档处理工具。这个能力和图像处理的方式很相似,但代码结构上有几个关键区别。

## 搭建 PDF 处理流程

用 Claude 处理 PDF 文件,代码和处理图像时几乎一模一样。主要区别在于文件类型的指定,以及为了清晰起见改用的变量名。

下面是如何把你现有的图像处理代码改造成适用于 PDF 的版本:

```python
with open("earth.pdf", "rb") as f:
    file_bytes = base64.standard_b64encode(f.read()).decode("utf-8")

messages = []

add_user_message(
    messages,
    [
        {
            "type": "document",
            "source": {
                "type": "base64",
                "media_type": "application/pdf",
                "data": file_bytes,
            },
        },
        {"type": "text", "text": "Summarize the document in one sentence"},
    ],
)

chat(messages)
```

## 相比图像处理的关键改动

把图像处理代码改造成适用于 PDF 时,需要更新以下几点:

- 文件扩展名从 `.png` 改成 `.pdf`
- 变量名从 `image_bytes` 改成 `file_bytes`,让含义更清楚
- `type` 字段设为 `"document"` 而不是 `"image"`
- 媒体类型改成 `"application/pdf"` 而不是 `"image/png"`

## Claude 能从 PDF 里提取什么

Claude 处理 PDF 的能力不止于简单的文本提取,它还能分析和理解:

- 文档全文的文字内容
- PDF 中嵌入的图像和图表
- 表格及其中的数据关系
- 文档的结构和排版

这使得 Claude 基本上成了一个「一站式」方案,能从 PDF 文档里提取任何类型的信息,无论你需要的是摘要、数据分析,还是特定内容的提取。

上面的例子展示了 Claude 成功处理了一篇保存为 PDF 的关于地球的维基百科文章,用一句话就概括出了这份复杂文档的内容——这说明它能理解和总结相当复杂的文档内容。

---

对产品经理来说,PDF 支持这件事最值得记住的是:代码层面几乎不需要重新学——把「图像块」换成「文档块」、扩展名和媒体类型对应改一下就行,底层的消息结构、对话逻辑完全复用。这对评估「加一个新文档类型支持的开发成本」很有参考价值:往往比想象中要小很多,因为核心架构是通用的。
