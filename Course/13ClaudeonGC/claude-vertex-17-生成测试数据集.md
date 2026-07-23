# Claude with Google Vertex - 17 Generating test datasets 生成测试数据集

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 17
> 课程: Claude with Google Vertex · 第 17 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

搭建自定义的提示词评估工作流,先要有一个像样的提示词,再生成测试数据来看它表现如何。下面为一个「帮用户写 AWS 相关代码」的提示词搭一套评估系统。

## Setting Up the Goal 明确目标

我们的提示词要帮用户产出三类 AWS 场景下的输出:

- Python 代码
- JSON 配置文件
- 正则表达式

关键要求是: 用户提出任务时,返回干净的、上述三种格式之一的内容,**不带任何多余解释、开场白或结语**。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619548%2F04_-_003_-_Generating_Test_Datasets_01.1748619548328.png)

初始提示词模板:

```python
prompt = f"""
Please provide a solution to the following task:
{task}
"""
```

## Creating an Evaluation Dataset 建评估数据集

评估数据集装的是要喂进提示词、用来测性能的输入。本例需要一个 JSON 对象数组,每个对象有一个 `task` 属性,描述我们想让 Claude 完成什么。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619548%2F04_-_003_-_Generating_Test_Datasets_05.1748619548824.png)

建数据集有两种方式:

- 手工整理
- 用 Claude 自动生成

自动生成时,用 Haiku 这类更快的模型是合理的——我们生成的是测试数据,不是生产输出。

## Generating Test Data with Code 用代码生成测试数据

写一个函数,让 Claude 帮我们生成测试用例。这个函数会构造一个完整的提示词,要求生成特定类型的 AWS 相关任务。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619549%2F04_-_003_-_Generating_Test_Datasets_09.1748619549203.png)

核心函数结构:

```python
def generate_dataset():
    prompt = """
    Generate an evaluation dataset for a prompt evaluation. The dataset will be used to evaluate prompts 
    that generate Python, JSON, or Regex specifically for AWS-related tasks. Generate an array of objects, 
    each representing task that requires Python, JSON, or a Regex to complete.
    
    Example output:
    ```json
    [
        {
            "task": "Description of task",
        },
        ...additional
    ]
    ```
    
    * Focus on tasks that can be solved by writing a single Python function, a single JSON object, or a single regex
    * Focus on tasks that do not require writing much code
    
    Please generate 3 objects.
    """
```

## Implementing the Generation Logic 实现生成逻辑

为了从 Claude 拿到干净的 JSON,用前面学过的预填 + 停止序列组合:

```python
messages = []
add_user_message(messages, prompt)
add_assistant_message(messages, "```json")
text = chat(messages, stop_sequences=["```"])
return json.loads(text)
```

这样保证 Claude 直接以合规的 JSON 开头,并在闭合的 markdown 围栏处停下。

## Testing and Saving the Dataset 测试并保存数据集

跑完生成函数,你应该拿到这类真实感的测试用例:

- 写一个 Python 函数从 ARN 中提取 AWS region
- 写一份 AWS Lambda 函数的 JSON 配置
- 写一个校验 AWS S3 桶名的正则表达式

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619549%2F04_-_003_-_Generating_Test_Datasets_16.1748619549748.png)

把生成的数据集存成文件方便复用:

```python
dataset = generate_dataset()

with open('dataset.json', 'w') as f:
    json.dump(dataset, f, indent=2)
```

这会在 notebook 目录下生成一个 `dataset.json`,里面是全部测试用例,可以直接用于工作流后续步骤的提示词评估。

对产品经理来说: 「用 AI 生成测试数据来测 AI」听起来像左脚踩右脚,但这里成立是有前提的——生成的是**输入**(任务描述),不是**答案**。生成输入是低风险的,生成标准答案就有循环论证的问题了。真实项目里更稳的做法是: 让模型生成候选输入扩大覆盖面,再由人挑掉不合适的,并且**务必**混入线上真实用户的输入。
