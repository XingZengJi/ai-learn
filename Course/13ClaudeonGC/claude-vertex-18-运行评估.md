# Claude with Google Vertex - 18 Running the eval 运行评估

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 18
> 课程: Claude with Google Vertex · 第 18 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

评估数据集准备好了,现在来搭核心的评估流水线。要做的是: 取出每个测试用例、与提示词拼合、发给 Claude、再给结果打分。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619554%2F04_-_004_-_Running_the_Eval_00.1748619554019.png)

评估流程很清晰: 拿到测试用例数据集,把每一条与提示词模板组合,发给 Claude 处理,然后用评分系统评估输出。

## Building the Core Functions 搭核心函数

评估流水线由三个主要函数组成,各司其职。先从最简单的那个开始——处理单个提示词的函数。

## The run_prompt Function run_prompt 函数

这个函数把测试用例与提示词模板拼合:

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

现在提示词写得极简,没有任何格式要求,所以 Claude 很可能返回比我们需要的更啰嗦的内容。后面迭代提示词设计时再改进。

## The run_test_case Function run_test_case 函数

这个函数负责跑一个测试用例并给结果打分:

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

目前分数写死成 10。评分逻辑是后面几节要重点投入的部分,这个占位值让我们先把整条流水线跑通。

## The run_eval Function run_eval 函数

这个函数统筹整个评估过程:

```python
def run_eval(dataset):
    """Loads the dataset and calls run_test_case with each case"""
    results = []
    
    for test_case in dataset:
        result = run_test_case(test_case)
        results.append(result)
    
    return results
```

它遍历数据集里每个测试用例,把所有结果收集成一个列表。

## Running the Evaluation 跑起来

加载数据集并跑通流水线:

```python
with open("dataset.json", "r") as f:
    dataset = json.load(f)

results = run_eval(dataset)
```

第一次运行会比较慢——即便用 Claude Haiku,跑完一个完整数据集也可能要 30 秒左右。优化技巧后面会讲。

## Examining the Results 查看结果

评估返回一个结构化的 JSON 数组,每个对象代表一个测试用例的结果:

```python
print(json.dumps(results, indent=2))
```

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619554%2F04_-_004_-_Running_the_Eval_18.1748619554611.png)

每条结果包含三项关键信息:

- `output`: Claude 的完整回复
- `test_case`: 被处理的原始测试用例
- `score`: 评估分数(目前是写死的)

从输出可以看到,因为还没给出具体的格式要求,Claude 生成的内容相当啰嗦。这正是后面精修提示词时要解决的问题。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619555%2F04_-_004_-_Running_the_Eval_01.1748619555038.png)

## What We've Accomplished 阶段成果

到这里,核心评估流水线已经搭好了: 能取数据集、过 Claude、收集结构化结果。缺的最大一块是评分系统——那个写死的 10 分需要换成真正的评估逻辑。

这条流水线是绝大多数 AI 评估系统的基础。看起来简单,但你其实已经把一个 eval 流水线该做的事做了大半。复杂度都在细节里: 更好的提示词、更成熟的评分、以及性能优化。

接下来会深入评分器这个关键话题,把写死的分数变成对 Claude 表现的有意义评估。
