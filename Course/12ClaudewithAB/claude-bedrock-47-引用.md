# Claude with AWS Bedrock - 47 Citations 引用

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 47
> 课程: Claude with AWS Bedrock · 第 47 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When working with PDFs in Claude, one of the biggest challenges is trust. Users often have to take it on faith that the AI is correctly interpreting the document contents. Claude's citations feature directly addresses this problem by showing exactly where information comes from in your source documents.

> 在 Claude 里处理 PDF 时,最大的挑战之一是**信任**。用户往往只能凭信心相信 AI 正确理解了文档内容。Claude 的引用(citations)功能正面解决了这个问题: 它会明确指出信息来自源文档的哪个位置。

## Enabling Citations 启用引用

To enable citations in your PDF processing, you need to add a single parameter to your document configuration:

> 要在 PDF 处理中启用引用,你只需要往文档配置里加一个参数:

```python
with open("./earth.pdf", "rb") as f:
    file_bytes = f.read()

messages = []

add_user_message(
    messages,
    [
        {
            "document": {
                "format": "pdf",
                "name": "earth",
                "source": {"bytes": file_bytes},
                "citations": {"enabled": True}
            }
        },
        {"text": "How were Earth's atmosphere and oceans formed?"},
    ]
)

response = chat(messages)
```

The key addition is `"citations": {"enabled": True}` in the document dictionary. This tells Claude to track where it finds information and include citation data in its response.

> 关键的新增内容就是文档字典里的 `"citations": {"enabled": True}`。它告诉 Claude: 记录下你是在哪里找到这些信息的,并把引用数据一并放进回复里。

## Understanding Citation Responses 理解带引用的回复

When citations are enabled, Claude's response structure changes significantly. Instead of just returning text, you get multiple parts:

> 启用引用后,Claude 的回复结构会有明显变化。它不再只返回文本,而是返回多个部分:

1. **Text parts** 文本部分 - The regular response content you're familiar with. 你熟悉的常规回复内容。
2. **Citations content parts** 引用内容部分 - New structured data that maps statements back to source locations. 新增的结构化数据,把每句陈述映射回源文档中的位置。

The citations content includes detailed information about where Claude found supporting evidence for each statement, including the specific document, page numbers, and even the exact text that influenced its response.

> 引用内容包含了详细信息: Claude 为每句陈述找到的支撑证据在哪里,包括具体是哪份文档、第几页,甚至是影响了这段回答的原文原句。

> 实现提醒: 开启引用后,你解析响应的代码需要能处理这种多部分结构,不能再假设「回复里只有一段文本」。

## Why Citations Matter 引用为什么重要

Citations provide several key benefits for PDF-based applications:

> 对基于 PDF 的应用来说,引用带来几项关键收益:

- **Verification** 可验证 - Users can check Claude's work by going back to the source. 用户可以回到原文核对 Claude 的工作。
- **Confidence** 可信任 - Knowing where information comes from builds trust in AI responses. 知道信息出处,才会对 AI 的回答建立信心。
- **Transparency** 透明 - The AI's reasoning process becomes visible and auditable. AI 的推理过程变得可见、可审计。
- **Accuracy** 更准确 - Citations encourage more careful information extraction. 引用机制本身会促使信息提取更加严谨。

This feature is particularly valuable in professional, academic, or research contexts where accuracy and source attribution are critical. Instead of treating Claude as a black box, citations turn it into a transparent research assistant that shows its work.

> 在专业、学术或研究场景下——准确性和出处标注至关重要的地方——这项功能尤其有价值。有了引用,Claude 就不再是一个黑盒,而变成一个会「展示解题过程」的透明研究助理。

对产品经理来说,这是一个典型的「用产品设计消解 AI 信任问题」的例子: 你没法让模型永不出错,但你可以让每一句结论都能一键跳回原文。用户不需要相信模型,他们只需要能核查——这往往比提升几个百分点的准确率更能推动落地。
