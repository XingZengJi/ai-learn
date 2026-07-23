# Claude with AWS Bedrock - 15 Running the Eval 运行评估

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 15
> 课程: Claude with AWS Bedrock · 第 15 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Now that we have our evaluation dataset ready, it's time to build the core evaluation pipeline. This involves taking each test case, merging it with our prompt, feeding it to Claude, and then grading the results.

> 现在评估数据集已经准备好了,是时候构建核心的评估流水线了。这包括:取出每一个测试用例、把它和提示词合并、喂给 Claude,然后给结果打分。

The evaluation process follows a clear workflow: we take our dataset of test cases, combine each one with our prompt template, send it to Claude for processing, and then evaluate the output using a grader system.

> 整个评估过程遵循一套清晰的工作流:取出测试用例数据集,把每一条都和提示词模板合并,发送给 Claude 处理,然后用评分系统来评估输出结果。

## Building the Core Functions 构建核心函数

The evaluation pipeline consists of three main functions, each with a specific responsibility. Let's start with the simplest one - the function that handles individual prompt execution.

> 这套评估流水线由三个主要函数组成,各自承担特定的职责。我们先从最简单的一个开始——负责执行单个提示词的函数。

### The `run_prompt` Function `run_prompt` 函数

This function takes a test case and merges it with our prompt template:

> 这个函数接收一个测试用例,把它和提示词模板合并:

```python
def run_prompt(test_case):
    """Merges the prompt and test case input, then returns the result"""
    prompt = f"""
Please solve the following task:

{test_case["task"]}
"""
    
    messages = []
    add_user_message(messages, prompt)
    output = chat(messages)
    return output
```

Right now, we're keeping the prompt extremely simple. We're not including any formatting instructions, which means Claude will likely return more verbose output than we need. We'll refine this later as we iterate on our evaluation process.

> 目前,我们把提示词写得非常简单,没有加入任何格式方面的指令,这意味着 Claude 很可能会返回比我们需要的更啰嗦的内容。我们会在后续迭代评估流程时进一步打磨它。

### The `run_test_case` Function `run_test_case` 函数

This function orchestrates running a single test case and grading the result:

> 这个函数负责编排「运行单个测试用例并给结果打分」这个过程:

```python
def run_test_case(test_case):
    """Calls run_prompt, then grades the result"""
    output = run_prompt(test_case)
    
    # TODO - Grading
    score = 10
    
    return {
        "output": output,
        "test_case": test_case,
        "score": score
    }
```

For now, we're using a hardcoded score of 10. The grading logic is where we'll spend significant time in upcoming sections, but this placeholder lets us test the overall pipeline structure.

> 目前我们先用写死的 10 分作为占位。评分逻辑是我们接下来会花大量篇幅讨论的部分,但这个占位版本已经能让我们先测试整体流水线的结构了。

### The `run_eval` Function `run_eval` 函数

This is the main orchestrator that processes the entire dataset:

> 这是处理整个数据集的主编排函数:

```python
def run_eval(dataset):
    """Loads the dataset and calls run_test_case with each case"""
    results = []
    
    for test_case in dataset:
        result = run_test_case(test_case)
        results.append(result)
    
    return results
```

This function loops through every test case in our dataset, processes each one, and collects all the results into a single list.

> 这个函数会遍历数据集里的每一个测试用例,逐一处理,并把所有结果收集到一个列表里。

## Running the Evaluation 运行评估

To execute our evaluation pipeline, we load the dataset and call our main function:

> 要执行这套评估流水线,我们先加载数据集,再调用主函数:

```python
with open("dataset.json", "r") as f:
    dataset = json.load(f)

results = run_eval(dataset)
```

The first time you run this, expect it to take some time - even with Claude Haiku, processing a full dataset can take 30+ seconds. We'll cover optimization techniques later, but for now, patience is key.

> 第一次运行时,预期会花一些时间——即便用的是 Claude Haiku,处理一整个数据集也可能需要 30 秒以上。我们会在后面讲优化技巧,但现在耐心是关键。

## Examining the Results 检查结果

Once the evaluation completes, you can inspect the results with formatted JSON output:

> 评估完成之后,你可以用格式化的 JSON 输出来查看结果:

```python
print(json.dumps(results, indent=2))
```

The results structure contains an array of objects, where each object represents one test case execution. You'll see the Claude output (which tends to be quite verbose without formatting constraints), the original test case definition, and the score.

> 结果结构是一个由对象组成的数组,每个对象代表一次测试用例的执行。你会看到 Claude 的输出(在没有格式限制的情况下往往比较啰嗦)、原始的测试用例定义,以及打分结果。

## What We've Accomplished 目前完成了什么

At this point, we've successfully implemented the core evaluation pipeline. We can:

> 到这里,我们已经成功实现了核心的评估流水线。我们现在能做到:

- Take test cases from our dataset. 从数据集中取出测试用例。
- Merge them with prompt templates. 把它们和提示词模板合并。
- Get responses from Claude. 从 Claude 获取响应。
- Collect and organize all the results. 收集并整理所有结果。

The missing piece is intelligent grading - right now we're just assigning a fixed score to every response. The next step is building graders that can actually evaluate whether Claude's outputs are correct, which is where the real sophistication of evaluation systems comes into play.

> 目前缺失的一环是「智能评分」——现在我们只是给每条响应都打了个固定分数。下一步是构建真正能评估 Claude 输出是否正确的评分器,这正是评估系统真正见功力的地方。

This pipeline structure might seem simple, but it represents the foundation that most AI evaluation systems are built on. The complexity comes in the grading logic and prompt optimization, not in the basic orchestration of running tests.

> 这套流水线结构看起来可能很简单,但它正是大多数 AI 评估系统所依赖的基础。真正的复杂度在于评分逻辑和提示词优化上,而不在于跑测试这个基本的编排流程上。
