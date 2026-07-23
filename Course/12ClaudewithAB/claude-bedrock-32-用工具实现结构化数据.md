# Claude with AWS Bedrock - 32 Structured Data with Tools 用工具实现结构化数据

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 32
> 课程: Claude with AWS Bedrock · 第 32 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Earlier in this course, we covered how to get structured output from Claude using message pre-fills and stop sequences. While that approach works well and is easy to set up, we can get more reliable output using tools. This method is more complex to implement, but it provides better consistency when extracting structured data like JSON.

> 在本课程前面的部分,我们讲过如何用消息预填充和停止序列,从 Claude 那里获得结构化的输出。虽然那种做法效果不错、也容易搭建,但用工具能获得更可靠的输出。这种方法实现起来更复杂,但在提取像 JSON 这样的结构化数据时,一致性更好。

## Why Learn Both Approaches? 为什么要学两种方法?

You might wonder why we didn't just start with tools if they're more reliable. The answer is simple: tools require significantly more setup and complexity. Having both techniques available gives you flexibility - sometimes you'll want the quick prompt-based approach, other times you'll need the reliability that tools provide.

> 你可能会好奇,既然工具更可靠,为什么不一开始就用它。答案很简单:工具需要的搭建工作和复杂度要高得多。同时掌握这两种技巧,能给你灵活性——有时你想要那种基于提示词的快捷做法,有时你则需要工具所提供的可靠性。

对产品经理来说,这就像「快速调研」和「严谨的用户研究」之间的取舍:前者(提示词预填充)成本低、上手快,适合日常验证一个想法;后者(工具)投入更大,但结论更可靠、更经得起推敲,适合真正要做重要决策的场合。

## How Tool-Based Structured Output Works 基于工具的结构化输出是如何运作的

The core concept is straightforward: instead of asking Claude to format its response as JSON, you create a tool whose input parameters match the exact structure of data you want to extract. Claude then "calls" this tool with the extracted data as arguments.

> 核心概念很直接:你不需要让 Claude 把响应格式化成 JSON,而是创建一个工具,它的输入参数恰好对应你想提取的数据结构。然后 Claude 会「调用」这个工具,把提取出来的数据作为参数传进去。

Here's the process:

> 具体流程是:

1. Write a JSON schema that describes the structure of data you want. 写一份 JSON schema,描述你想要的数据结构。
2. Create a tool with that schema as its input specification. 创建一个工具,把这份 schema 作为它的输入规格说明。
3. Send your data and the tool schema to Claude. 把你的数据和这份工具 schema 一起发送给 Claude。
4. Force Claude to use the tool with the `toolChoice` parameter. 用 `toolChoice` 参数强制 Claude 使用这个工具。
5. Extract the structured data from the tool call arguments. 从工具调用的参数里提取出结构化数据。

The flow looks like this: your server sends a prompt asking Claude to analyze data and call a specific tool. Claude responds with a tool use message containing the extracted JSON data. At that point, you simply take the data and end the conversation - no follow-up needed.

> 流程是这样的:你的服务器发送一段提示词,让 Claude 分析数据并调用一个指定的工具。Claude 会返回一条工具调用消息,其中包含提取出来的 JSON 数据。到这一步,你只需要拿走这份数据,结束对话即可——不需要任何后续往来。

## Controlling Tool Usage 控制工具的使用方式

When using tools for structured output, you want to guarantee that Claude uses your extraction tool. The `toolChoice` parameter gives you three options:

> 用工具来获取结构化输出时,你需要确保 Claude 一定会用你的提取工具。`toolChoice` 参数给了你三个选项:

- `{"toolChoice": {"auto": {}}}` - Model decides if it needs to use a tool (default). 模型自己决定要不要用工具(默认行为)。
- `{"toolChoice": {"any": {}}}` - Model must use a tool, but can choose which one. 模型必须使用某个工具,但可以自己选择用哪个。
- `{"toolChoice": {"tool": {"name": "tool-name"}}}` - Model must use the specified tool. 模型必须使用指定的那个工具。

For structured output, you'll almost always want the third option to ensure Claude uses your extraction tool.

> 对于结构化输出来说,你几乎总是会想用第三个选项,以确保 Claude 使用你的提取工具。

## Practical Example 实际示例

Let's say you want to extract the title, author, and key topics from an article. First, you'd create a tool schema:

> 假设你想从一篇文章中提取标题、作者和关键主题。首先,你需要创建一份工具 schema:

```python
article_details_schema = {
    "toolSpec": {
        "name": "article_details",
        "description": "Extracts key information from an article",
        "inputSchema": {
            "json": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title of the article"
                    },
                    "author": {
                        "type": "string", 
                        "description": "The author's name"
                    },
                    "topics": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of key topics mentioned"
                    }
                },
                "required": ["title", "author", "topics"]
            }
        }
    }
}
```

Then you'd call Claude with your data and force it to use the tool:

> 然后,你带着数据调用 Claude,并强制它使用这个工具:

```python
messages = []
add_user_message(messages, f"""
Analyze the article below and extract key data. Then call the article_details tool.

<article_text>
{article_text}
</article_text>
""")

result = chat(messages, tools=[article_details_schema], tool_choice="article_details")
```

Claude will respond with a tool use message containing the extracted data in the exact format you specified. The tool call arguments will contain your structured JSON data, ready to use in your application.

> Claude 会返回一条工具调用消息,其中包含按你指定的确切格式提取出来的数据。这次工具调用的参数里,就是你要的结构化 JSON 数据,可以直接在你的应用里使用。

## Key Benefits 核心优势

- More reliable than prompt-based extraction. 比基于提示词的提取方式更可靠。
- Guaranteed structure matching your schema. 保证结构与你的 schema 完全匹配。
- No need for message pre-fills or stop sequences. 不需要消息预填充或停止序列。
- Built-in validation through the tool schema. 通过工具 schema 自带校验能力。

The main tradeoff is complexity - you need to write detailed schemas and handle tool responses. But when you need consistent, reliable structured output, tools are the way to go.

> 主要的代价是复杂度——你需要编写详细的 schema、处理工具响应。但当你需要一致、可靠的结构化输出时,工具就是正确的选择。
