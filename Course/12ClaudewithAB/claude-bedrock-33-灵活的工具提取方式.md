# Claude with AWS Bedrock - 33 Flexible Tool Extraction 灵活的工具提取方式

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 33
> 课程: Claude with AWS Bedrock · 第 33 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Writing detailed JSON schemas for structured data extraction can be a real pain point when working with AI tools. There's a clever workaround that lets you specify your desired data structure directly in your prompt instead of creating complex schemas.

> 在使用 AI 工具做结构化数据提取时,写详细的 JSON schema 常常是个真正的痛点。有一种巧妙的变通方案,能让你直接在提示词里指定想要的数据结构,而不用去创建复杂的 schema。

## The Flexible Schema Approach 灵活 Schema 方案

Instead of writing a detailed schema for every data extraction task, you can create one generic tool called `to_json` that accepts any object structure. The key is setting the input schema to allow additional properties, then specifying your exact requirements in the prompt itself.

> 你不需要为每个数据提取任务都写一份详细的 schema,而是可以创建一个通用的工具,叫 `to_json`,它能接受任意的对象结构。关键在于把输入 schema 设置成允许附加属性,然后在提示词本身里说明你确切的要求。

This approach removes a major pain point - constantly writing and managing large JSON schemas. The results won't be quite as good as a dedicated schema, but you'll still get high-quality JSON output with much less setup work.

> 这种做法消除了一个主要的痛点——不用再一直写、一直维护那些庞大的 JSON schema。效果虽然比不上专门定制的 schema,但你依然能以少得多的搭建工作,获得高质量的 JSON 输出。

对产品经理来说,这就像用一张「万能申请表」代替为每种业务单独设计的表单:万能表单没那么精细,但省去了每次都要重新设计表单的工作量,大多数场景下够用了。

## How It Works 运作原理

The process is straightforward:

> 整个过程很直接:

1. Create a single flexible schema that accepts any object structure. 创建一个能接受任意对象结构的通用 schema。
2. In your prompt, specify exactly what data structure you want. 在提示词里,准确说明你想要的数据结构。
3. Tell Claude to call the `to_json` tool with your specified structure. 告诉 Claude 按你指定的结构调用 `to_json` 工具。
4. Use `tool_choice` to force Claude to use your tool. 用 `tool_choice` 强制 Claude 使用你的工具。

## Setting Up the Prompt 设置提示词

When writing your prompt, be very explicit about the structure you want. Here's an example of how to structure your request:

> 撰写提示词时,要非常明确地说明你想要的结构。以下是一个组织请求的示例:

```
Analyze the article below and extract key data. Then call the to_json tool.

<article_text>
{result["text"]}
</article_text>

When you call to_json, pass in the following structure:
{{
    "title": str # title of the article,
    "author": str # author of the article,
    "topics": List[str] # List of topics mentioned in the article
}}
```

## Making the API Call 发起 API 调用

The API call uses the flexible schema and forces tool usage:

> 这次 API 调用使用这份灵活的 schema,并强制使用工具:

```python
flexible_result = chat(messages, tools=[to_json_schema], tool_choice="to_json")
```

## Easy Structure Changes 轻松修改结构

The real advantage becomes clear when you need to modify your data structure. Instead of rewriting an entire schema, you simply update your prompt. Want to add a field for the number of topics? Just add one line:

> 当你需要修改数据结构时,这种方法真正的优势就体现出来了。你不需要重写整份 schema,只需要更新提示词即可。想加一个「主题数量」字段?只需要加一行:

```
"num_topics": int # Number of topics mentioned
```

That's it - no schema modifications needed.

> 就这么简单——不需要修改任何 schema。

## When to Use Each Approach 什么时候该用哪种方法

The flexible schema approach works great for:

> 灵活 schema 方案很适合以下场景:

- Rapid prototyping and experimentation. 快速原型验证和实验。
- Simple data extraction tasks. 简单的数据提取任务。
- Situations where you frequently change data requirements. 数据需求经常变动的场合。

Stick with dedicated schemas for:

> 以下场景则应该坚持使用专门定制的 schema:

- Critical production data extraction tasks. 关键的生产环境数据提取任务。
- Complex nested data structures. 复杂的嵌套数据结构。
- When you need the highest possible accuracy. 需要尽可能高的准确性时。

The flexible approach gives you about 90% of the quality with 10% of the setup work, making it perfect for most use cases where you need structured data extraction without the schema management overhead.

> 灵活方案能让你用 10% 的搭建工作量,获得大约 90% 的质量水平——对于大多数「需要结构化数据提取、但又不想承担 schema 维护负担」的使用场景来说,这非常合适。
