# Building with the Claude API - 16 Model based grading 基于模型的评分

> Course: Building with the Claude API · Lesson 16
> 课程: Building with the Claude API · 第 16 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

When building prompt evaluation workflows, grading systems provide objective signals about output quality. A grader takes model output and returns some kind of measurable feedback - typically a number between 1 and 10, where 10 represents high quality and 1 represents poor quality.

> 搭建提示词评估工作流时,评分系统能提供关于输出质量的客观信号。评分器(grader)接收模型的输出,返回某种可衡量的反馈——通常是 1 到 10 之间的一个数字,10 代表高质量,1 代表质量差。

## Types of Graders 评分器的类型

There are three main approaches to grading model outputs:

- Code graders - Programmatically evaluate outputs using custom logic
- Model graders - Use another AI model to assess the quality
- Human graders - Have people manually review and score outputs

  评估模型输出主要有三种方式:代码评分器(code graders)——用自定义逻辑以编程方式评估输出;模型评分器(model graders)——用另一个 AI 模型来评估质量;人工评分器(human graders)——由人工审阅并打分。

### Code Graders 代码评分器

Code graders let you implement any programmatic check you can imagine. Common uses include:

- Checking output length
- Verifying output does/doesn't have certain words
- Syntax validation for JSON, Python, or regex
- Readability scores

  代码评分器让你能实现任何你能想到的编程检查,常见用法包括:检查输出长度;验证输出是否包含/不包含某些词;对 JSON、Python 或正则表达式做语法校验;计算可读性分数。

The only requirement is that your code returns some usable signal - usually a number between 1 and 10.

> 唯一的要求是:你的代码要返回一个可用的信号——通常是 1 到 10 之间的数字。

### Model Graders 模型评分器

Model graders feed your original output into another API call for evaluation. This approach offers tremendous flexibility for assessing:

- Response quality
- Quality of instruction following
- Completeness
- Helpfulness
- Safety

  模型评分器会把原始输出喂给另一次 API 调用来做评估。这种方式在评估以下方面时极其灵活:回答质量;指令遵循的质量;完整性;有用程度;安全性。

### Human Graders 人工评分器

Human graders provide the most flexibility but are time-consuming and tedious. They're useful for evaluating:

- General response quality
- Comprehensiveness
- Depth
- Conciseness
- Relevance

  人工评分器最灵活,但耗时且繁琐。适合用来评估:整体回答质量;全面性;深度;简洁度;相关性。

## Defining Evaluation Criteria 定义评估标准

Before implementing any grader, you need clear evaluation criteria. For a code generation prompt, you might focus on:

- Format - Should return only Python, JSON, or Regex without explanation
- Valid Syntax - Produced code should have valid syntax
- Task Following - Response should directly address the user's task with accurate code

  在实现任何评分器之前,你需要先明确评估标准。对于一个代码生成类提示词,你可能会关注:格式(Format)——应该只返回 Python、JSON 或正则表达式,不带解释;语法有效性(Valid Syntax)——生成的代码语法应当有效;任务遵循度(Task Following)——回答应准确地直接解决用户的任务。

The first two criteria work well with code graders, while task following is better suited for model graders due to their flexibility.

> 前两项标准很适合用代码评分器来检查,而「任务遵循度」由于需要更强的灵活性,更适合交给模型评分器。

## Implementing a Model Grader 实现一个模型评分器

Here's how to build a model grader function:

> 下面是构建一个模型评分器函数的方法:

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

> 这里的关键洞察是:除了要分数,还要求模型给出「优点」「缺点」和「打分理由」。如果不要求这些上下文,模型往往会「和稀泥」,默认给出 6 分左右的中庸分数。

## Integrating Grading into Your Workflow 把评分整合进工作流

Update your test case runner to call the grader:

> 更新你的测试用例执行函数,让它调用评分器:

```python
def run_test_case(test_case):
    output = run_prompt(test_case)
    
    # Grade the output
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

Finally, calculate an average score across all test cases:

> 最后,计算所有测试用例的平均分:

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

This gives you an objective metric to track as you iterate on your prompt. While model graders can be somewhat capricious, they provide a consistent baseline for measuring improvements.

> 这样你就有了一个客观指标,可以在迭代提示词时持续追踪。虽然模型评分器有时候「喜怒无常」,但它仍能提供一个相对一致的基准,用来衡量改进效果。

对产品经理来说,模型评分器就像请了一位「AI 审稿人」,而且专门要求 ta 不能只打分、还得写清楚「好在哪、差在哪、为什么给这个分」——这和让团队做同行评审(peer review)时要求写评语而不是只打星级是一个道理:光给星级容易一团和气全打 3 星,写了评语才逼着评审人真去认真判断。
