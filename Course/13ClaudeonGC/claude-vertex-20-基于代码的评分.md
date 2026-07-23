# Claude with Google Vertex - 20 Code based grading 基于代码的评分

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 20
> 课程: Claude with Google Vertex · 第 20 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

评估生成代码的 AI 时,光看回复合不合理是不够的,你还得确认生成的代码语法真的有效、格式真的符合要求。这就是基于代码的评分要解决的问题。

## How Code Grading Works 代码评分怎么工作

代码评分校验 AI 回复的两个关键方面:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619603%2F04_-_006_-_Code_Based_Grading_00.1748619603473.png)

- **Format 格式** —— 回复应只返回要求的代码类型(Python、JSON 或正则),不带解释
- **Valid Syntax 语法有效** —— 生成的代码应能作为目标语言正确解析
- **Task Following 遵循任务** —— 回复应直接针对所问的问题,且准确

前两条由代码评分器负责,「遵循任务」由模型评分器评估。两者合起来构成完整评估。

## Syntax Validation Functions 语法校验函数

要检查生成代码的语法是否有效,可以写三个尝试解析输出的辅助函数:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619604%2F04_-_006_-_Code_Based_Grading_02.1748619604039.png)

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

每个函数尝试把文本按对应格式解析。解析成功返回满分 10,失败报错说明语法无效,返回 0。

## Dataset Format Requirements 数据集的格式要求

为了让代码评分器知道该用哪个校验器,测试用例里要标明期望的输出格式:

```json
{
    "task": "Create a Python function to validate an AWS IAM username",
    "format": "python"
}
```

你可以更新数据集生成提示词,把这个 `format` 字段加进示例输出结构里,让它自动带上。

## Improving Prompt Clarity 让提示词更明确

想从模型拿到更好的结果,就把对输出格式的要求写得更具体:

```
* Respond only with Python, JSON, or a plain Regex
* Do not add any comments or commentary or explanation
```

还可以用预填 assistant 消息配合代码块,促使模型只返回裸代码:

```python
add_assistant_message(messages, "```code")
```

这样告诉 Claude 直接开始写代码内容,而不必事先声明是 Python、JSON 还是正则。

## Combining Scores 合并分数

最后一步是把模型评分器的分数与代码评分器的分数合并。最简单的做法是取平均:

```python
model_grade = grade_by_model(test_case, output)
model_score = model_grade["score"]
syntax_score = grade_syntax(output, test_case)

score = (model_score + syntax_score) / 2
```

这给了内容质量与技术正确性同等权重。你可以根据自己场景里哪个更重要来调整权重。

## Testing Your Implementation 测试你的实现

实现代码评分后,跑一次评估拿到基线分数。**分数本身无所谓好坏**——重要的是你能不能通过打磨提示词把它提上去。这让你有了一个量化的方式来衡量提示词工程的进展,而不再依赖主观判断。

对产品经理来说: 这一课体现了一个很实用的分工原则——**能用代码判定的,绝不交给模型判定**。语法对不对是 0/1 的确定性问题,用 `json.loads()` 一试便知,又快又免费又不会飘; 而「答案切不切题」这种需要理解语义的判断,才轮到模型评分器上场。设计任何自动化评估时,都先问一遍「这条能不能写成规则」。
