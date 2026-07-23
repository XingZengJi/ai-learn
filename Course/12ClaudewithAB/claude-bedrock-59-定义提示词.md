# Claude with AWS Bedrock - 59 Defining prompts 定义提示词

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 59
> 课程: Claude with AWS Bedrock · 第 59 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

MCP 服务器可以定义提示词(prompts)——预先写好的高质量指令,客户端直接拿来用,不用自己从零写。可以把它们理解为精心打磨过的模板,效果比用户自己随手写的要好。

## Why Use Prompts? 为什么要用提示词

假设你想让 Claude 把一份文档重排成 markdown 格式。你直接说「把 report.pdf 转成 markdown」也能work,但如果用一条经过充分测试、覆盖了各种边界情况、给出了具体格式要求的详细提示词,结果会好得多。

思路很简单: 作为 MCP 服务器的开发者,我们花时间打磨和测试出真正好用的提示词,然后开放给所有使用这个服务器的人。用户不必自己成为提示词工程专家,也能拿到好结果。

## Defining a Prompt 定义提示词

提示词和工具、资源一样用装饰器模式,基本结构:

```python
@mcp.prompt(
    name="format",
    description="Rewrites the contents of the document in Markdown format."
)
def format_document(
    doc_id: str = Field(description="Id of the document to format")
) -> list[base.Message]:
    # 返回一个消息列表
```

函数返回的是一个可以直接发给 Claude 的消息列表。这让你能构建包含多轮 user / assistant 消息的复杂提示词。

## Building the Format Prompt 构建格式化提示词

针对我们的文档服务器,要做一个把文档重排成 markdown 的提示词。它需要:

- 接收一个文档 ID 作为输入
- 用 `read_doc_contents` 工具取到文档
- 用恰当的 markdown 语法重新排版
- 把改动保存回文档

实现大致如下:

```python
def format_document(
    doc_id: str = Field(description="Id of the document to format")
) -> list[base.Message]:
    prompt = f"""
Your goal is to reformat a document to be written with markdown syntax.

The id of the document you need to reformat is:
{doc_id}
Add in headers, bullet points, tables, etc as necessary. Feel free to add in structure.
Use the 'edit_document' tool to edit the document. After the document has been reformatted...
"""

    return [
        base.UserMessage(prompt)
    ]
```

> 代码在做什么: 把传进来的 `doc_id` 插进一段预写好的指令模板,再包装成一条 UserMessage 返回。注意提示词里**明确点名了要用哪个工具**(`edit_document`)——这是把服务器自己的工具和提示词串起来的关键。

别忘了导入消息类型所在的模块:

```python
from mcp.server.fastmcp.prompts import base
```

## Testing the Prompt 测试提示词

定义好之后可以用 MCP 检查器测试。切到 Prompts 标签页,选中你的提示词,填入所需参数。

检查器会展示将要发给 Claude 的消息内容,你可以据此确认参数插值是否正确、提示词是否包含了全部必要指令。

## Key Benefits 主要好处

- **质量把控** —— 服务器作者可以在用户看到之前反复测试和打磨提示词
- **一致性** —— 所有人拿到的是同一条高质量提示词,而不是各自即兴发挥
- **专业化** —— 提示词可以针对你服务器的特定领域和能力做定制
- **可复用** —— 多个客户端应用可以共用同一批打磨好的提示词

当你的 MCP 服务器聚焦在某个特定领域时(文档管理、数据分析、代码生成等),提示词尤其有价值——你可以把久经考验、能充分发挥服务器工具的提示词直接交到用户手上。

对产品经理来说: 这其实是把「提示词」当成产品功能来交付,而不是当成用户的负担。类比: 与其给用户一个空白搜索框让他们自己琢磨怎么问,不如提供一排预设好的常用查询按钮。前者灵活但效果参差,后者稳定且可以持续优化。
