# Building with the Claude API - 14 Generating test datasets 生成测试数据集

> Course: Building with the Claude API · Lesson 14
> 课程: Building with the Claude API · 第 14 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

Building a custom prompt evaluation workflow starts with creating a solid prompt and then generating test data to see how well it performs. Let's walk through setting up an evaluation system for a prompt that helps users write AWS-specific code.

> 搭建一套自定义的提示词评估工作流,先要写一个扎实的提示词,再生成测试数据来看它的表现。下面我们来搭建一套评估系统,针对的是一个「帮用户写 AWS 相关代码」的提示词。

## Setting Up the Goal 明确目标

Our prompt needs to assist users in writing three specific types of output for AWS use cases:

- Python code
- JSON configuration files
- Regular expressions

  我们的提示词需要帮用户针对 AWS 场景写出三种特定类型的输出:Python 代码;JSON 配置文件;正则表达式。

The key requirement is that when a user requests help with a task, we return clean output in one of these formats without any extra explanations, headers, or footers.

> 关键要求是:当用户请求帮助完成某项任务时,我们要返回这三种格式之一的干净输出,不带任何多余的解释、开场白或结尾语。

Here's our starting prompt (version 1):

> 我们的起始提示词(第一版)是这样的:

```python
prompt = f"""
Please provide a solution to the following task:
{task}
"""
```

## Creating an Evaluation Dataset 创建评估数据集

An evaluation dataset contains inputs that we'll feed into our prompt. For each combination of prompt and input, we'll run the prompt and analyze the results.

> 评估数据集包含我们要喂给提示词的输入。对于每一组「提示词 + 输入」的组合,我们都会跑一次并分析结果。

Our dataset will be an array of JSON objects, where each object contains a "task" property describing what we want Claude to accomplish. We can either create this dataset by hand or generate it automatically using Claude.

> 我们的数据集会是一个 JSON 对象数组,每个对象包含一个 "task" 字段,描述我们希望 Claude 完成的任务。这个数据集既可以手工编写,也可以用 Claude 自动生成。

Since we're generating test data, this is a perfect opportunity to use a faster model like Haiku instead of the full Claude model.

> 由于我们只是要生成测试数据,这正好是使用 Haiku 这类更快的模型、而不是完整版 Claude 模型的好机会。

## Generating Test Data with Code 用代码生成测试数据

Let's create a function that automatically generates our test dataset. First, we'll need our helper functions for working with Claude:

> 我们来写一个函数,自动生成测试数据集。首先需要之前用过的那几个 Claude 辅助函数:

```python
def add_user_message(messages, text):
    user_message = {"role": "user", "content": text}
    messages.append(user_message)

def add_assistant_message(messages, text):
    assistant_message = {"role": "assistant", "content": text}
    messages.append(assistant_message)

def chat(messages, system=None, temperature=1.0, stop_sequences=[]):
    params = {
        "model": model,
        "max_tokens": 1000,
        "messages": messages,
        "temperature": temperature
    }
    if system:
        params["system"] = system
    if stop_sequences:
        params["stop_sequences"] = stop_sequences
    
    response = client.messages.create(**params)
    return response.content[0].text
```

Now we'll create our dataset generation function:

> 接下来创建生成数据集的函数:

```python
def generate_dataset():
    prompt = """
Generate an evaluation dataset for a prompt evaluation. The dataset will be used to evaluate prompts that generate Python, JSON, or Regex specifically for AWS-related tasks. Generate an array of JSON objects, each representing task that requires Python, JSON, or a Regex to complete.

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

To properly parse the JSON response, we'll use prefilling and stop sequences:

> 为了能正确解析返回的 JSON,我们会用上「预填充 + 停止序列」这个技巧(第 10 课讲过):

```python
    messages = []
    add_user_message(messages, prompt)
    add_assistant_message(messages, "```json")
    text = chat(messages, stop_sequences=["```"])
    return json.loads(text)
```

## Testing the Dataset Generation 测试数据集生成效果

Let's run our function and see what kind of test cases we get:

> 运行这个函数,看看会生成什么样的测试用例:

```python
dataset = generate_dataset()
print(dataset)
```

This should return three different test cases covering our target outputs - Python functions, JSON configurations, and regular expressions for AWS-specific tasks.

> 这应该会返回三个不同的测试用例,分别覆盖我们的目标输出类型——针对 AWS 场景的 Python 函数、JSON 配置和正则表达式。

## Saving the Dataset 保存数据集

Once we have our dataset, we'll save it to a file so we can easily load it later during evaluation:

> 有了数据集之后,我们把它保存到文件里,方便之后评估时直接加载:

```python
with open('dataset.json', 'w') as f:
    json.dump(dataset, f, indent=2)
```

This creates a dataset.json file in the same directory as your notebook, containing your list of tasks ready for prompt evaluation.

> 这会在你的 notebook 同一目录下生成一个 `dataset.json` 文件,里面是一份可以直接拿去做提示词评估的任务清单。

With this foundation in place, you now have a systematic way to generate test data for evaluating how well your prompts perform across different types of AWS-related coding tasks.

> 有了这套基础,你现在就有了一种系统化的方式,来生成测试数据,评估提示词在各类 AWS 相关编码任务上的表现如何。

对产品经理来说,这一课干的事就是「用 AI 生成测试用例,而不是自己拍脑袋想」——就像做用户调研时,与其自己瞎猜用户会问什么,不如先让 Claude(用便宜快的小模型即可)批量「扮演」不同用户,生成一批有代表性的问题清单,存起来留作后面「验收考卷」用。
