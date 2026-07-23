# Claude with AWS Bedrock - 14 Generating Test Datasets 生成测试数据集

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 14
> 课程: Claude with AWS Bedrock · 第 14 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Building a custom prompt evaluation workflow starts with creating a clear goal and generating test data. In this case, we're building a prompt that helps users write AWS-specific code - either Python functions, JSON configurations, or regular expressions - with no extra explanations or formatting.

> 构建一套自定义的提示词评估工作流,首先要确立清晰的目标,并生成测试数据。在这个案例中,我们要构建一个提示词,帮用户编写 AWS 相关的代码——可能是 Python 函数、JSON 配置,或者正则表达式——并且不带任何额外的解释或格式。

## Setting Up the Goal 确立目标

The prompt should take a user's task description and return one of three output types:

> 这个提示词应该接收用户的任务描述,并返回以下三种输出类型之一:

- Python code Python 代码
- JSON configuration JSON 配置
- Regular expressions 正则表达式

The key requirement is that responses should contain only the requested code without headers, footers, or explanations.

> 关键要求是:响应中应该只包含所请求的代码,不带标题、结尾说明或解释性文字。

Starting with a simple first version keeps things manageable. The initial prompt template is straightforward: "Please provide a solution to the following task: {task}"

> 从简单的第一版开始,能让事情保持可控。初始的提示词模板很直接:「请针对以下任务提供解决方案:{task}」

## Creating Evaluation Datasets 创建评估数据集

An evaluation dataset contains input examples that you'll feed into your prompt. Each test case gets combined with your prompt and sent to Claude, letting you see how well the prompt performs across different scenarios.

> 评估数据集包含一批你会喂给提示词的输入样本。每个测试用例都会和提示词合并,发送给 Claude,让你看到这个提示词在不同场景下的表现如何。

You can create datasets in two ways:

> 你可以用两种方式创建数据集:

- Manually write test cases by hand. 手动编写测试用例。
- Generate them automatically using Claude. 用 Claude 自动生成。

For automatic generation, using a faster model like Haiku makes sense since you're generating multiple test cases.

> 对于自动生成来说,由于你要生成多条测试用例,用 Haiku 这样速度更快的模型是合理的选择。

## Generating Test Data with Code 用代码生成测试数据

The dataset generation function uses Claude to create realistic test scenarios. Here's the basic structure:

> 这个数据集生成函数用 Claude 来创建贴近真实情况的测试场景。基本结构如下:

```python
def generate_dataset():
    prompt = """
    Generate 3 AWS-related tasks that require Python, JSON, or Regex solutions.
    
    Focus on tasks that can be solved by writing a single Python function, 
    a single JSON object, or tasks that do not require writing much code.
    
    Example output:
    [
        {
            "task": "Description of task"
        },
        ...additional
    ]
    
    Please generate 3 objects.
    """
    
    messages = []
    add_user_message(messages, prompt)
    add_assistant_message(messages, "```json")
    text = chat(messages, stop_sequences=["```"])
    return json.loads(text)
```

This approach uses the pre-filled assistant message technique with stop sequences to extract clean JSON responses. The assistant message starts with "```json" and stops at the closing "```", ensuring you get properly formatted data.

> 这个做法用到了「预填充助手消息 + 停止序列」的技巧,来提取干净的 JSON 响应。助手消息以 "```json" 开头,在闭合的 "```" 处停止,确保拿到格式正确的数据。

## Saving Your Dataset 保存你的数据集

Once generated, save the dataset to avoid regenerating it constantly:

> 生成之后,把数据集保存下来,避免每次都要重新生成:

```python
dataset = generate_dataset()
with open("dataset.json", "w") as f:
    json.dump(dataset, f, indent=2)
```

The generated dataset creates realistic AWS tasks like extracting account IDs from ARNs, writing JSON schemas for EC2 configurations, and creating regex patterns for S3 bucket names. While three test cases work for initial development, production evaluation would need significantly more examples with greater variety.

> 生成出来的数据集会包含一些贴近真实的 AWS 任务,比如从 ARN 中提取账户 ID、为 EC2 配置编写 JSON schema、为 S3 桶名编写正则表达式模式。虽然三条测试用例足够用于初期开发,但生产环境的评估需要更多、更多样化的样本。

This foundation gives you a repeatable process for creating evaluation datasets that match your specific use case, setting up the next steps of running evaluations and measuring prompt performance.

> 这套基础方法,给了你一套可重复使用的流程,用来创建符合你具体使用场景的评估数据集,为接下来「运行评估、衡量提示词表现」的步骤打好基础。
