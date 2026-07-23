# Claude with AWS Bedrock - 16 Model Based Grading 基于模型的评分

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 16
> 课程: Claude with AWS Bedrock · 第 16 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When building prompt evaluation workflows, graders provide objective signals about output quality. A grader takes model output and returns some kind of measurable feedback - typically a number between 1-10, where 10 represents high quality and 1 represents poor quality.

> 在构建提示词评估工作流时,评分器(grader)负责提供关于输出质量的客观信号。评分器接收模型的输出,返回某种可衡量的反馈——通常是一个 1-10 之间的数字,10 代表高质量,1 代表质量差。

## Types of Graders 评分器的类型

There are three main approaches to grading model outputs:

> 给模型输出打分主要有三种方法:

- **Code graders** - Programmatically evaluate outputs using custom logic. **代码评分器** - 用自定义逻辑,以编程方式评估输出。
- **Model graders** - Use another AI model to assess quality. **模型评分器** - 用另一个 AI 模型来评估质量。
- **Human graders** - Have people manually review and score outputs. **人工评分器** - 由人来手动审阅并打分。

### Code Graders 代码评分器

Code graders let you implement any programmatic check you can imagine. Common uses include:

> 代码评分器让你能实现任何你能想到的程序化检查。常见用途包括:

- Checking output length 检查输出长度
- Verifying output does/doesn't have certain words 验证输出是否包含/不包含某些词
- Syntax validation for JSON, Python, or regex 校验 JSON、Python 或正则表达式的语法
- Readability scores 可读性评分

The only requirement is that your code returns some measurable signal when it runs.

> 唯一的要求是,你的代码运行后要能返回某种可衡量的信号。

### Model Graders 模型评分器

Model graders make an additional API request to evaluate the original output. This approach offers tremendous flexibility for assessing:

> 模型评分器会额外发起一次 API 请求,来评估原始输出。这种做法在评估以下方面时,提供了极大的灵活性:

- Response quality 响应质量
- Quality of instruction following 指令遵循的质量
- Completeness 完整性
- Helpfulness 有用程度
- Safety 安全性

### Human Graders 人工评分器

Human graders provide the most flexibility but are time-intensive and tedious. They're useful for evaluating:

> 人工评分器提供最大的灵活性,但耗时且繁琐。它们适用于评估:

- General response quality 整体响应质量
- Comprehensiveness 全面性
- Depth 深度
- Conciseness 简洁性
- Relevance 相关性

对产品经理来说,这三种评分器很像团队里不同层级的质检方式:代码评分器是「自动化流水线检测」(快、便宜,但只能查规则明确的东西,比如长度、格式);模型评分器是「让另一位同事帮忙审稿」(能理解语义,但成本比自动化检测高);人工评分器则是「请资深专家人工把关」(质量最有保障,但费时费力,不可能每次都用)。

## Defining Evaluation Criteria 明确评估标准

Before implementing any grader, you need clear evaluation criteria. For a code generation prompt, you might focus on:

> 在实现任何评分器之前,你需要先明确清晰的评估标准。对于一个代码生成类的提示词,你可能会关注:

- **Format** - Should return only Python, JSON, or Regex without explanation. **格式** - 应该只返回 Python、JSON 或正则表达式,不带解释。
- **Valid Syntax** - Produced code should have valid syntax. **语法有效性** - 生成的代码应该具备有效的语法。
- **Task Following** - Response should directly address the user's task with accurate code. **任务遵循度** - 响应应该用准确的代码,直接解决用户提出的任务。

The first two criteria work well with code graders, while task following is better suited for model graders due to their flexibility.

> 前两项标准很适合用代码评分器来检查,而「任务遵循度」由于需要更强的灵活性,更适合用模型评分器。

## Implementing a Model Grader 实现一个模型评分器

Here's how to build a model grader function:

> 构建模型评分器函数的方式如下:

```python
def grade_by_model(test_case, output):
    # Create evaluation prompt
    eval_prompt = """
    You are an expert code reviewer. Evaluate this AI-generated solution.
    
    Task: {task}
    Solution: {solution}
    
    Provide your evaluation as a structured JSON object with:
    - "strengths": An array of 1-3 key strengths
    - "weaknesses": An array of 1-3 key areas for improvement  
    - "reasoning": A concise explanation of your assessment
    - "score": A number between 1-10
    """
    
    messages = []
    add_user_message(messages, eval_prompt)
    add_assistant_message(messages, "```json")
    
    eval_text = chat(messages, stop_sequences=["```"])
    return json.loads(eval_text)
```

The key insight is asking for strengths, weaknesses, and reasoning alongside the score. Without this context, models tend to default to middling scores around 6.

> 这里的关键洞察在于:除了分数之外,还要求模型给出优点、缺点和评分理由。如果没有这些上下文,模型往往会默认给出偏中等的分数,比如 6 分左右。

## Integrating the Grader 整合评分器

Update your test case function to use the model grader:

> 更新你的测试用例函数,让它使用这个模型评分器:

```python
def run_test_case(test_case):
    output = run_prompt(test_case)
    
    # Get model evaluation
    model_grade = grade_by_model(test_case, output)
    score = model_grade["score"]
    reasoning = model_grade["reasoning"]
    
    return {
        "output": output, 
        "test_case": test_case, 
        "score": score,
        "reasoning": reasoning
    }
```

## Calculating Average Scores 计算平均分

To get an overall performance metric, calculate the average score across all test cases:

> 要得到一个整体的表现指标,可以计算所有测试用例的平均分:

```python
from statistics import mean

def run_eval(dataset):
    results = []
    
    for test_case in dataset:
        result = run_test_case(test_case)
        results.append(result)
    
    average_score = mean([result["score"] for result in results])
    print(f"Average score: {average_score}")
    
    return results
```

This gives you a concrete, objective metric to track prompt performance over time. While model graders can be somewhat inconsistent, they provide a starting point for measuring and improving your prompts systematically.

> 这给了你一个具体、客观的指标,可以随着时间推移持续追踪提示词的表现。虽然模型评分器的打分有时不太稳定,但它们为系统化地衡量和改进提示词,提供了一个起点。
