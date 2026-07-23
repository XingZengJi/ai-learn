# Claude with AWS Bedrock - 17 Code Based Grading 基于代码的评分

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 17
> 课程: Claude with AWS Bedrock · 第 17 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Code-based grading adds an extra layer of validation to your prompt evaluations by checking whether the model's output follows the correct format and has valid syntax. This is especially useful when you're asking models to generate code, JSON, or regular expressions.

> 基于代码的评分,给你的提示词评估加上了一层额外的校验——检查模型的输出是否遵循了正确的格式、语法是否有效。当你要求模型生成代码、JSON 或正则表达式时,这一点尤其有用。

## How Code Grading Works 代码评分的运作原理

The code grader evaluates two main criteria:

> 代码评分器主要评估两项标准:

- **Format compliance** - Does the output contain only the requested format (Python, JSON, or regex) without explanations? **格式合规性** - 输出是否只包含所要求的格式(Python、JSON 或正则表达式),不带解释?
- **Valid syntax** - Can the output actually be parsed or compiled successfully? **语法有效性** - 这段输出实际上能否被成功解析或编译?

The system uses separate validation functions for each format type. If the code parses successfully, it gets a perfect score of 10. If parsing fails with an error, it gets a score of 0.

> 系统针对每种格式类型使用不同的校验函数。如果代码成功解析,就得到满分 10 分;如果解析报错失败,就得 0 分。

## Setting Up Validation Functions 设置校验函数

You'll need three helper functions to validate different output types:

> 你需要三个辅助函数,分别校验不同类型的输出:

```python
def validate_json(text):
    try:
        json.loads(text.strip())
        return 10
    except json.JSONDecodeError:
        return 0

def validate_python(text):
    try:
        ast.parse(text.strip())
        return 10
    except SyntaxError:
        return 0

def validate_regex(text):
    try:
        re.compile(text.strip())
        return 10
    except re.error:
        return 0
```

These functions use Python's built-in parsing capabilities to check syntax validity. The `json.loads()` function validates JSON, `ast.parse()` creates a Python abstract syntax tree, and `re.compile()` validates regular expressions.

> 这些函数利用 Python 内置的解析能力来检查语法有效性。`json.loads()` 负责校验 JSON,`ast.parse()` 会构造一棵 Python 抽象语法树,`re.compile()` 则用于校验正则表达式。

## Adding Format Information to Test Cases 给测试用例加上格式信息

Your test dataset needs to specify the expected output format for each task. Update your dataset generation prompt to include a format field:

> 你的测试数据集需要为每个任务指明预期的输出格式。更新数据集生成提示词,加入一个 format 字段:

```json
{
    "task": "Description of task",
    "format": "python"
}
```

The format field should contain "json", "python", or "regex" depending on what type of output you expect from that particular task.

> format 字段应该填入 "json"、"python" 或 "regex",具体取决于这个任务预期的输出类型。

## Improving Your Prompt 改进你的提示词

To get better results from the code grader, make your prompt instructions more specific:

> 要让代码评分器给出更好的结果,把提示词的指令写得更具体一些:

```
* Respond only with Python, JSON, or a plain Regex
* Do not add any comments or commentary or explanation
```

You can also use a pre-filled assistant message with code blocks and stop sequences to ensure clean output formatting.

> 你也可以配合使用带代码块的预填充助手消息和停止序列,来确保输出格式干净整洁。

## Combining Scores 合并分数

The final step is merging your model grader score with the syntax grader score. A simple approach is to take the average of both scores:

> 最后一步是把模型评分器的分数和语法评分器的分数合并起来。一种简单的做法是取两者的平均值:

```python
model_grade = grade_by_model(test_case, output)
model_score = model_grade["score"]
syntax_score = grade_syntax(output, test_case)

score = (model_score + syntax_score) / 2
```

This gives equal weight to both content quality (from the model grader) and technical correctness (from the code grader). You can adjust this weighting based on what matters more for your specific use case.

> 这样一来,内容质量(来自模型评分器)和技术正确性(来自代码评分器)就获得了同等的权重。你可以根据自己具体场景中更看重哪一方面,来调整这个权重比例。

## Interpreting Results 解读结果

Once you run your evaluation, you'll get a combined score that reflects both the semantic quality and technical correctness of the generated code. Remember that a single score in isolation doesn't tell you much - the real value comes from comparing scores as you iterate on your prompt design.

> 运行评估之后,你会得到一个综合分数,同时反映了生成代码的语义质量和技术正确性。要记住,孤立地看一个分数说明不了太多问题——真正的价值在于,随着你不断迭代提示词设计,把分数拿来做前后对比。

Use this baseline score to test prompt improvements and see if your changes actually lead to better, more reliable code generation.

> 用这个基准分数来测试提示词的改进效果,看看你所做的修改是否真的带来了更好、更可靠的代码生成结果。
