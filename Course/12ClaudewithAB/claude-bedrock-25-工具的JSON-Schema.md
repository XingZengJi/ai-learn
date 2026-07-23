# Claude with AWS Bedrock - 25 JSON Schema for Tools 工具的 JSON Schema

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 25
> 课程: Claude with AWS Bedrock · 第 25 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

After creating your tool function, the next step is writing a JSON schema to describe it. This schema tells Claude what arguments your function expects and how to use it properly. While the configuration might look intimidating at first, it's actually straightforward once you understand the process.

> 创建好工具函数之后,下一步是写一份 JSON schema 来描述它。这份 schema 会告诉 Claude 你的函数需要什么参数、应该如何正确使用它。虽然这套配置乍一看可能有点吓人,但一旦你理解了这个过程,其实很简单。

## Understanding JSON Schema 理解 JSON Schema

JSON Schema isn't something invented just for AI tools - it's been around for years as a standard way to validate data. The schema has two main parts: the name and description at the top (which help Claude understand when to use the tool), and the actual schema that describes the function's arguments.

> JSON Schema 并不是专为 AI 工具发明的东西——它作为一种数据校验的标准方式,已经存在很多年了。这份 schema 主要有两个部分:顶部的名称和描述(帮 Claude 理解什么时候该用这个工具),以及描述函数参数的实际 schema 部分。

The top section contains the tool's name and description, which helps Claude understand when to use it. The bottom section is the actual schema that describes your function's arguments in detail.

> 顶部部分包含工具的名称和描述,帮 Claude 理解什么时候该用它。底部部分则是详细描述你函数参数的实际 schema。

## Creating a JSON Schema: Step-by-Step 创建 JSON Schema:分步指南

Here's the simplest way to create a JSON schema for any function:

> 以下是为任何函数创建 JSON schema 最简单的方法:

### Step 1: Write a Dictionary with Sample Data 第一步:写一个带示例数据的字典

Take your function and create a dictionary of all keyword arguments with sample data. For example, if you have a function like this:

> 拿出你的函数,为它所有的关键字参数创建一个带示例数据的字典。举例来说,如果你有这样一个函数:

```python
def process_data(ids, profile, primary_id, value):
    pass
```

Create a dictionary with sample values:

> 创建一个带示例值的字典:

### Step 2: Convert to JSON 第二步:转换成 JSON

Convert your Python dictionary to proper JSON format. The main difference is changing Python's `True` to JSON's `true`.

> 把你的 Python 字典转换成正规的 JSON 格式。主要的区别是把 Python 的 `True` 改成 JSON 的 `true`。

### Step 3: Use an Online Converter 第三步:使用在线转换工具

Search for "JSON to JSON Schema converter" and use one of the many free online tools. Paste your JSON data and let it generate the schema automatically.

> 搜索「JSON to JSON Schema converter(JSON 转 JSON Schema 转换器)」,用众多免费在线工具中的任意一个。把你的 JSON 数据粘贴进去,让它自动生成 schema。

The tool will analyze your sample data and create a proper schema structure. Remove any `$schema` declarations from the output - you don't need them.

> 这类工具会分析你的示例数据,生成规范的 schema 结构。把输出结果中任何 `$schema` 声明都删掉——你不需要它们。

### Step 4: Add Descriptions 第四步:加上描述说明

The most important step is adding detailed descriptions to each property. These descriptions help Claude understand exactly what each argument does and how to use it.

> 最重要的一步,是给每个属性加上详细的描述说明。这些描述能帮 Claude 准确理解每个参数是做什么用的、该如何使用它。

## Writing Good Descriptions 撰写优质的描述说明

When writing descriptions for your tools and properties, follow these best practices:

> 为你的工具和属性撰写描述说明时,遵循以下最佳实践:

- Explain what the tool does, when to use it, and what it returns. 说明这个工具是做什么的、什么时候该用它、它会返回什么。
- Aim for 3-4 sentences in your tool description. 工具的描述文字力求控制在 3-4 句话左右。
- Provide super detailed descriptions for each property. 为每个属性提供非常详尽的说明。
- If you're stuck, paste your function into Claude and ask it to write descriptions for you. 如果你卡住了,可以把函数粘贴给 Claude,让它帮你写描述。

Here's an example of a well-described tool schema:

> 下面是一个描述充分的工具 schema 示例:

Notice how the description clearly explains what the weather tool does, when to use it, what data it returns, and provides specific examples of valid location formats.

> 注意这份描述是如何清楚地说明「这个天气工具是做什么的」「什么时候该用它」「它会返回什么数据」,并且给出了有效地点格式的具体示例。

## Putting It All Together 整合到一起

Your final JSON schema should look something like this structure, with the `toolSpec` containing the name, description, and `inputSchema` with the detailed argument specifications:

> 你最终的 JSON schema 大致应该是这样的结构:`toolSpec` 中包含名称、描述,以及带有详细参数规格的 `inputSchema`:

The schema acts as a contract between your code and Claude, ensuring that when Claude decides to use your tool, it knows exactly what information to provide and in what format. This clear communication is what makes tool use reliable and effective.

> 这份 schema 相当于你的代码和 Claude 之间的一份「合同」,确保当 Claude 决定使用你的工具时,它准确知道该提供什么信息、以什么格式提供。正是这种清晰的沟通,让工具使用变得可靠而有效。
