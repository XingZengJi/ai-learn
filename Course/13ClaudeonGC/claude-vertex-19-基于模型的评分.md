# Claude with Google Vertex - 19 Model based grading 基于模型的评分

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 19
> 课程: Claude with Google Vertex · 第 19 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

在提示词评估工作流里,评分系统提供关于输出质量的客观信号。一个评分器(grader)接收模型输出,返回某种可测量的反馈——通常是 1 到 10 之间的数字,10 表示高质量,1 表示低质量。

## Types of Graders 评分器的类型

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619610%2F04_-_005_-_Model_Based_Grading_03.1748619610196.png)

评估模型输出主要有三种方式:

- **代码评分器(Code graders)** —— 用自己写的代码以程序方式评估输出
- **模型评分器(Model graders)** —— 用另一个 AI 模型来评判质量
- **人工评分器(Human graders)** —— 由人手工审阅并打分

### Code Graders 代码评分器

代码评分器让你能实现任何你想得到的程序化检查。常见用途:

- 检查输出长度
- 验证输出是否包含/不包含某些词
- 对 JSON、Python 或正则做语法校验
- 可读性评分,确保阅读难度合适

### Model Graders 模型评分器

模型评分器通过额外一次 API 调用来评估输出,灵活性极高。适合评判:

- 回复质量
- 遵循指令的程度
- 完整性
- 有用性
- 安全性

### Human Graders 人工评分器

人工评分灵活性最高,但缺点也很明显。人可以按任何想得到的标准来评判回复,但这个过程既耗时又乏味。

## Defining Evaluation Criteria 定义评估标准

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619610%2F04_-_005_-_Model_Based_Grading_06.1748619610723.png)

实现任何评分器之前,先要有清晰的评估标准。对一个代码生成提示词,可以聚焦这三条:

- **Format 格式** —— 只返回 Python、JSON 或正则,不带解释
- **Valid Syntax 语法有效** —— 产出的代码语法必须合法
- **Task Following 遵循任务** —— 回复要直接针对用户任务,代码要准确

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619611%2F04_-_005_-_Model_Based_Grading_07.1748619611291.png)

前两条适合用代码评分器,「遵循任务」因为需要灵活判断,更适合模型评分器。

## Implementing a Model Grader 实现模型评分器

模型评分器往往是最容易实现的。基本结构:

```python
def grade_by_model(test_case, output):
    messages = []
    add_user_message(messages, eval_prompt)
    add_assistant_message(messages, "```json")
    eval_text = chat(messages, stop_sequences=["```"])
    return json.loads(eval_text)
```

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619612%2F04_-_005_-_Model_Based_Grading_11.1748619611803.png)

评分提示词要写得周全,应包含:

- 对评分者角色的明确定义
- 原始任务
- 待评估的 AI 生成方案
- 具体的输出格式要求

**不要只要一个分数**。同时要求它给出优点、缺点和评分理由。这能防止模型习惯性地打 6 分这种中庸分,逼它做更认真的评估。

## Integrating Graders into Your Workflow 把评分器接入工作流

有了评分函数,把它接进测试用例执行器:

```python
def run_test_case(test_case):
    output = run_prompt(test_case)
    
    # 调用模型评分器
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

所有测试用例跑完后,算平均分,得到提示词表现的客观指标:

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

这样你就有了一个具体的数字可以去改进。模型评分器有时会有点飘,给它更好的指引会更稳,但它提供了一个可以持续迭代改进的客观评估起点。

对产品经理来说: 「不要只要分数,还要理由」这条建议在做人工评审设计时同样成立。只填分数的评审表,填表人会不自觉往中间靠; 要求写一句理由,分数的区分度立刻就出来了。这不是 AI 的特性,是评分这件事本身的规律。
