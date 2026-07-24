# Building with the Claude API - 17 Code based grading 基于代码的评分

> Course: Building with the Claude API · Lesson 17
> 课程: Building with the Claude API · 第 17 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

When evaluating AI models that generate code, you need more than just checking if the response makes sense. You also need to verify that the generated code actually has valid syntax and follows the correct format. This is where code-based grading comes in.

> 评估一个生成代码的 AI 模型时,光检查回答「看起来是不是靠谱」还不够,你还需要验证生成的代码是不是语法有效、格式是否正确。这正是「基于代码的评分(code-based grading)」要解决的问题。

## How Code Grading Works 代码评分是如何运作的

Code grading validates two key aspects of AI-generated responses:

- Format - The response should return only the requested code type (Python, JSON, or Regex) without explanations
- Valid Syntax - The generated code should actually parse correctly as the intended language
- Task Following - The response should directly address what was asked and be accurate

  代码评分校验 AI 生成回答的两个关键方面:格式(Format)——回答应该只返回所要求的代码类型(Python、JSON 或正则表达式),不带解释;语法有效性(Valid Syntax)——生成的代码应该能作为对应语言正确解析。此外还有第三项标准「任务遵循度(Task Following)」——回答应该准确地直接解决所提的要求。

The first two criteria are handled by the code grader, while task following is evaluated by the model grader. Together, they provide a comprehensive evaluation.

> 前两项标准由代码评分器负责,任务遵循度则交给模型评分器评估。两者结合起来,就构成了一套全面的评估。

## Syntax Validation Functions 语法校验函数

To check if generated code has valid syntax, you can create three helper functions that attempt to parse the output:

> 要检查生成的代码语法是否有效,你可以写三个辅助函数,分别尝试解析输出内容:

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

Each function tries to parse the text as its respective format. If parsing succeeds, it returns a perfect score of 10. If it fails with an error, the syntax is invalid and returns 0.

> 每个函数都会尝试把文本按对应格式解析。解析成功就返回满分 10 分;解析报错,说明语法无效,返回 0 分。

## Dataset Format Requirements 数据集的格式要求

For the code grader to know which validator to use, your test cases need to specify the expected output format:

> 为了让代码评分器知道该用哪个校验函数,你的测试用例需要注明预期的输出格式:

```json
{
    "task": "Create a Python function to validate an AWS IAM username",
    "format": "python"
}
```

You can update your dataset generation prompt to automatically include this format field by adding it to the example output structure.

> 你可以更新数据集生成提示词,把这个 format 字段加进示例输出结构里,让它自动包含这一项。

## Improving Prompt Clarity 提升提示词的清晰度

To get better results from your AI model, make your prompt instructions more specific about the expected output format:

> 为了让 AI 模型给出更好的结果,把提示词里关于预期输出格式的指令写得更具体:

```
* Respond only with Python, JSON, or a plain Regex
* Do not add any comments or commentary or explanation
```

You can also use a pre-filled assistant message with code blocks to encourage the model to return just the raw code:

> 你还可以用「预填充的助手消息 + 代码块」这个技巧,引导模型只返回原始代码:

```python
add_assistant_message(messages, "```code")
```

This tells Claude to start generating code content without having to specify whether it's Python, JSON, or Regex ahead of time.

> 这样告诉 Claude:直接开始生成代码内容,不需要提前指明到底是 Python、JSON 还是正则表达式。

## Combining Scores 合并分数

The final step is merging the model grader score with the code grader score. A simple approach is to take the average:

> 最后一步是把模型评分器的分数和代码评分器的分数合并。一种简单的方法是取平均值:

```python
model_grade = grade_by_model(test_case, output)
model_score = model_grade["score"]
syntax_score = grade_syntax(output, test_case)

score = (model_score + syntax_score) / 2
```

This gives equal weight to both content quality and technical correctness. You might adjust these weights based on what matters more for your specific use case.

> 这样内容质量和技术正确性各占一半权重。你可以根据自己场景里哪个更重要,来调整这个权重比例。

## Testing Your Implementation 测试你的实现

Once you've implemented code grading, run your evaluation to get a baseline score. The score itself isn't inherently good or bad - what matters is whether you can improve it by refining your prompts. This gives you a quantitative way to measure prompt engineering progress rather than relying on subjective assessment.

> 实现代码评分之后,跑一次评估,拿到一个基准分数。这个分数本身没有绝对的好坏之分——真正重要的是,你能不能通过打磨提示词把它提高。这给了你一个量化的方式来衡量提示词工程的进展,而不用依赖主观判断。

对产品经理来说,代码评分器和模型评分器是「机器质检」和「人工质检」的组合拳:格式对不对、语法能不能跑通,这种有标准答案的事交给代码去卡(便宜、快、100% 一致);而「这段代码是不是真的解决了用户的问题」这种需要理解语义的事,才交给 AI 模型去判断。两者按权重合并,既省成本又不失准头。
