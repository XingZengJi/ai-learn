# Building with the Claude API - 60 Defining prompts 定义提示词

> Course: Building with the Claude API · Lesson 60
> 课程: Building with the Claude API · 第 60 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

MCP 服务器里的提示词(prompts)功能,让你能定义预先搭建好、经过精心打磨的高质量指令,供客户端直接使用,而不需要用户自己从零开始写提示词。可以把它们理解成精心制作的模板,效果往往比用户自己临时想出来的提示词更好。

## 为什么要用提示词功能

假设你想让 Claude 把一份文档重新排版成 Markdown 格式。用户可以直接输入「把 report.pdf 转换成 markdown」,这样也能用,效果还不错。但如果用一个经过充分测试的提示词——里面包含关于格式、结构、输出要求的具体指令——他们通常会得到好得多的结果。

核心洞察是:虽然用户自己也能完成这些任务,但当他们使用由 MCP 服务器作者精心开发和测试过的提示词时,能得到更一致、更高质量的结果。

## 提示词是如何运作的

提示词定义了一组用户消息和 assistant 消息,客户端可以直接拿来使用。当客户端请求一个提示词时,你的服务器会返回一份消息列表,可以直接发送给 Claude。

基本结构是这样的:

- 用 `@mcp.prompt()` 装饰器来定义提示词
- 为每个提示词加上名字和描述
- 返回一份消息列表,构成完整的提示词
- 这些提示词应该是高质量、经过充分测试、和你 MCP 服务器的目的相关的

## 搭建一个「格式化」命令

下面演示如何实现一个文档格式化的提示词。首先,你需要导入基础消息类型:

```python
from mcp.server.fastmcp import base
```

然后定义你的提示词函数:

```python
@mcp.prompt(
    name="format",
    description="Rewrites the contents of the document in Markdown format."
)
def format_document(
    doc_id: str = Field(description="Id of the document to format")
) -> list[base.Message]:
    prompt = f"""
Your goal is to reformat a document to be written with markdown syntax.

The id of the document you need to reformat is:

{doc_id}


Add in headers, bullet points, tables, etc as necessary. Feel free to add in extra formatting.
Use the 'edit_document' tool to edit the document. After the document has been reformatted...
"""
    
    return [
        base.UserMessage(prompt)
    ]
```

## 测试你的提示词

你可以用 MCP Inspector 来测试提示词。进入 Prompts 板块,选择你的提示词,填入所需的参数。检查器会展示出将要发给 Claude 的完整消息内容。

这能让你在真正投入实际应用之前,验证提示词里的变量插值是否正确、生成的消息结构是否符合预期。

## 最佳实践

搭建 MCP 服务器的提示词时:

- 聚焦于和你服务器核心目的紧密相关的任务
- 写详细、具体的指令,而不是含糊的请求
- 用不同的输入充分测试你的提示词
- 加上清晰的描述,让用户理解每个提示词是做什么的
- 考虑这个提示词会如何和你服务器的工具、资源配合使用

记住,提示词功能的意义,是提供用户自己不容易获得的价值——它们应该代表你在 MCP 服务器所覆盖领域里的专业积累。

---

对产品经理来说,MCP 里的「提示词」功能,本质上是把「怎么问才能得到好结果」这份专业知识产品化——就像客服系统里预设的标准话术模板,不是每个客服都得自己临场组织语言,而是用经过验证、效果最好的话术。把好的提示词沉淀成可复用的模板,是把「个人经验」转化成「团队资产」的一个具体做法。
