# Building with the Claude API - 15 Running the eval 运行评估

> Course: Building with the Claude API · Lesson 15
> 课程: Building with the Claude API · 第 15 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

Now that we have our evaluation dataset ready, it's time to build the core evaluation pipeline. This involves taking each test case, merging it with our prompt, feeding it to Claude, and then grading the results.

> 有了评估数据集之后,接下来要搭建核心的评估流水线。具体做法是:取出每个测试用例,和提示词合并,喂给 Claude,再对结果打分。

The evaluation process follows a clear workflow: we take our dataset of test cases, combine each one with our prompt template, send it to Claude for processing, and then evaluate the output using a grader system.

> 整个评估流程很清晰:拿到测试用例数据集 → 逐个和提示词模板组合 → 发给 Claude 处理 → 用评分系统评估输出结果。

## Building the Core Functions 构建核心函数

The evaluation pipeline consists of three main functions, each with a specific responsibility. Let's start with the simplest one - the function that handles individual prompts.

> 这套评估流水线由三个主要函数组成,各自分工明确。我们从最简单的一个开始——负责处理单个提示词的函数。

### The run_prompt Function run_prompt 函数

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

Right now, we're keeping the prompt extremely simple. We're not including any formatting instructions, so Claude will likely return more verbose output than we need. We'll refine this later as we iterate on our prompt design.

> 目前我们把提示词写得非常简单,没有加任何格式方面的指令,所以 Claude 很可能会返回比我们需要的更啰嗦的输出。这一点我们会在后面迭代提示词设计时再改进。

### The run_test_case Function run_test_case 函数

This function orchestrates running a single test case and grading the result:

> 这个函数负责协调「跑一个测试用例 + 给结果打分」的整个过程:

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

For now, we're using a hardcoded score of 10. The grading logic is where we'll spend significant time in upcoming sections, but this placeholder lets us test the overall pipeline.

> 目前我们先写死一个 10 分。真正的打分逻辑会在后面几节课花大量篇幅讲解,但这个占位分数已经足够让我们先把整条流水线跑通、测试一遍。

### The run_eval Function run_eval 函数

This function coordinates the entire evaluation process:

> 这个函数统筹整个评估过程:

```python
def run_eval(dataset):
    """Loads the dataset and calls run_test_case with each case"""
    results = []
    
    for test_case in dataset:
        result = run_test_case(test_case)
        results.append(result)
    
    return results
```

This function processes every test case in our dataset and collects all the results into a single list.

> 这个函数会处理数据集里的每一个测试用例,并把所有结果收集到一个列表里。

## Running the Evaluation 运行评估

To execute our evaluation pipeline, we load our dataset and run it through our functions:

> 要执行整套评估流水线,我们先加载数据集,再跑一遍这些函数:

```python
with open("dataset.json", "r") as f:
    dataset = json.load(f)

results = run_eval(dataset)
```

The first time you run this, expect it to take some time - even with Claude Haiku, it can take around 30 seconds to process a full dataset. We'll cover optimization techniques later.

> 第一次运行时要有心理准备,这会花一点时间——即便用的是 Claude Haiku,处理完整个数据集也可能要花上大约 30 秒。优化技巧我们会在后面讲到。

## Examining the Results 查看结果

The evaluation returns a structured JSON array where each object represents one test case result:

> 评估会返回一个结构化的 JSON 数组,每个对象代表一个测试用例的结果:

```python
print(json.dumps(results, indent=2))
```

Each result contains three key pieces of information:

- output: The complete response from Claude
- test_case: The original test case that was processed
- score: The evaluation score (currently hardcoded)

  每条结果包含三个关键信息:output(Claude 返回的完整响应)、test_case(处理的原始测试用例)、score(评估分数,目前是写死的)。

As you can see in the output, Claude generates quite verbose responses since we haven't provided specific formatting instructions yet. This is exactly the kind of issue we'll address as we refine our prompts.

> 从输出结果可以看到,由于我们还没有给出具体的格式指令,Claude 生成的回答相当啰嗦。这正是我们接下来打磨提示词时要解决的问题。

## What We've Accomplished 目前的成果

At this point, we've successfully built the core evaluation pipeline. We can take our dataset, process it through Claude, and collect structured results. The major missing piece is the grading system - that hardcoded score of 10 needs to be replaced with actual evaluation logic.

> 到这里,我们已经成功搭建了核心的评估流水线:能把数据集跑一遍 Claude,并收集到结构化的结果。目前最大的缺口是评分系统——那个写死的 10 分,需要换成真正的评估逻辑。

This pipeline represents the foundation of most AI evaluation systems. While it may seem simple, you've just built the majority of what an eval pipeline actually does. The complexity comes in the details - better prompts, sophisticated grading, and performance optimizations.

> 这套流水线正是大多数 AI 评估系统的基础框架。虽然看起来简单,但你已经搭出了一个评估流水线实际工作内容的大部分。真正的复杂度都藏在细节里——更好的提示词、更精细的评分逻辑,以及性能优化。

Next, we'll dive into the critical topic of graders, which will transform our hardcoded scores into meaningful evaluations of Claude's performance.

> 接下来,我们会深入「评分器(grader)」这个关键话题,把写死的分数,变成对 Claude 表现真正有意义的评估。

对产品经理来说,这三个函数分工很像一次「用户调研」的执行链条:run_prompt 是「拿一个具体问题去问」,run_test_case 是「问完之后打个分(先随手写个满分占位)」,run_eval 是「把整份问卷清单挨个跑一遍、汇总所有打分」。现在流程通了,但「怎么打分」这个最关键的环节还是空的——这也正是下一课要解决的。
