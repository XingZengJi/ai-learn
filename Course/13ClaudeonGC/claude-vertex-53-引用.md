# Claude with Google Vertex - 53 Citations 引用

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 53
> 课程: Claude with Google Vertex · 第 53 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

当 Claude 基于你提供的文档回答问题时,用户可能以为它只是在调用训练数据里的知识。但如果 Claude 其实是在**引用具体来源**呢?引用(citations)功能让你能向用户展示 Claude 的信息究竟出自哪里,把信任和透明度做进你的 AI 应用。

## Why Citations Matter 为什么引用重要

没有引用,用户会觉得 Claude 的回复是「凭记忆说的」。他们无从核实信息,也不知道这些内容其实基于你提供的具体文档。引用解决了这个问题——它把 Claude 生成每一部分回复所依据的原始材料摆出来。

## Enabling Citations 开启引用

在文档消息里加两个字段即可:

```python
{
  "type": "document",
  "source": {
    "type": "base64",
    "media_type": "application/pdf",
    "data": file_bytes,
  },
  "title": "earth.pdf",
  "citations": { "enabled": True }
}
```

`title` 字段给文档一个名字,会出现在引用里。`citations` 设为 `enabled: True` 告诉 Claude 记录它在哪里找到了信息。

## Citation Structure 引用的结构

开启引用后,Claude 的响应会变复杂。你拿到的不再是简单文本,而是带引用信息的结构化内容:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621005%2F08_-_004_-_Citations_09.1748621004785.png)

每条引用包含:

- **cited_text** —— Claude 引用的、文档中的确切文本
- **document_index** —— 是哪一份文档(如果你提供了多份)
- **document_title** —— 你给这份文档起的标题
- **start_page_number** —— 被引文本的起始页
- **end_page_number** —— 被引文本的结束页

## Building Citation Interfaces 构建引用界面

引用真正的威力在于把它做成界面。你可以在正文里生成带编号的引用标记,链接到详细的引用信息:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621005%2F08_-_004_-_Citations_12.1748621005614.png)

用户悬停或点击引用编号时,能看到 Claude 参考的具体是哪份文档、哪几页。这种透明度帮助用户核实信息,也建立起对 Claude 回复的信心。

## Citations with Plain Text 纯文本的引用

引用不限于 PDF,纯文本文档同样可用:

```python
{
  "type": "document", 
  "source": {
    "type": "text",
    "media_type": "text/plain",
    "data": article_text,
  },
  "title": "earth article",
  "citations": { "enabled": True }
}
```

纯文本场景下,你拿到的是 `CitationCharLocation` 对象而不是页码位置。它给出文本中的字符位置,让你能高亮 Claude 引用的确切句子或段落。

## When to Use Citations 什么时候用引用

引用在这些场景是必需的:

- 用户需要核实信息准确性
- 你处理的是敏感或重要的文档
- 来源透明度能建立用户对应用的信任
- 用户可能想读原始材料

实现引用后,Claude 就从一个「只给答案的黑箱」变成了一个「会展示依据的透明系统」,让你的 AI 应用更可信、更可验证。

对产品经理来说: 引用的价值不只在建立信任,更在**降低你的责任风险**。一个不带引用的 AI 回答,如果出错,责任是你的产品的; 一个带引用、用户点得进原文的回答,出错时用户能自己发现「这个结论和原文对不上」。在合规敏感的行业,这个差别有时决定了功能能不能上线。
