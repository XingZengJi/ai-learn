# Building with the Claude API - 3 Making a request 发起一次请求

> Course: Building with the Claude API · Lesson 3
> 课程: Building with the Claude API · 第 3 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

Making your first request to the Anthropic API is straightforward once you understand the basic setup and structure. This guide walks through the essential steps to get Claude responding to your prompts using Python.

> 一旦理解了基本的搭建方式和结构,向 Anthropic API 发起第一次请求其实很简单。这份指南会带你走一遍必要的步骤,用 Python 让 Claude 对你的提示词做出回应。

## Setting Up Your Environment 搭建环境

Before making any API calls, you need to install the required packages and configure your API key securely.

> 在发起任何 API 调用之前,你需要先安装必要的依赖包,并安全地配置好你的 API 密钥。

First, install the necessary dependencies in your Jupyter notebook:

> 首先,在你的 Jupyter notebook 里安装必要的依赖:

```
%pip install anthropic python-dotenv
```

Next, create a .env file in the same directory as your notebook to store your API key securely:

> 接下来,在 notebook 所在目录下创建一个 `.env` 文件,用来安全存放你的 API 密钥:

```
ANTHROPIC_API_KEY="your-api-key-here"
```

This approach keeps your API key out of your code and prevents accidentally committing it to version control. Always add .env to your .gitignore file.

> 这种做法能让 API 密钥不出现在你的代码里,避免不小心把它提交进版本控制系统。务必把 `.env` 加进 `.gitignore` 文件。

Load the environment variables and create your API client:

> 加载环境变量,并创建你的 API 客户端:

```python
from dotenv import load_dotenv
load_dotenv()

from anthropic import Anthropic

client = Anthropic()
model = "claude-sonnet-4-0"
```

## The Create Function create 函数

The core of making API requests is the client.messages.create() function. This function requires three key parameters:

> 发起 API 请求的核心是 `client.messages.create()` 这个函数。它需要三个关键参数:

- model - The name of the Claude model you want to use
- max_tokens - A safety limit on response length (not a target)
- messages - The conversation history you're sending to Claude

  model(你想使用的 Claude 模型名称)、max_tokens(对回复长度的安全上限,不是一个「目标值」)、messages(你发给 Claude 的对话历史)。

The max_tokens parameter acts as a safety mechanism. If you set it to 1000, Claude will stop generating after 1000 tokens even if it has more to say. Claude doesn't try to reach this limit - it just writes what it thinks is appropriate and stops if it hits the maximum.

> `max_tokens` 参数的作用是一道安全阀。如果你把它设为 1000,即便 Claude 还有话没说完,它也会在生成满 1000 个 token 后停下来。Claude 并不会刻意去凑够这个上限——它只是写它认为合适的内容,一旦碰到上限就停止。

## Understanding Messages 理解 Messages

Messages represent the conversation between you and Claude, similar to a chat application. There are two types of messages:

> Messages(消息)代表你和 Claude 之间的对话,和聊天应用的逻辑类似。消息分两种类型:

- User messages - Content you want to send to Claude (written by humans)
- Assistant messages - Responses that Claude has generated

  User messages(用户消息)——你想发给 Claude 的内容(由人类撰写);Assistant messages(助手消息)——Claude 生成的回复。

Each message is a dictionary with a role (either "user" or "assistant") and content (the actual text).

> 每条消息都是一个字典,包含 role(角色,"user" 或 "assistant")和 content(实际的文本内容)。

## Making Your First Request 发起你的第一次请求

Here's a complete example of making a request to Claude:

> 下面是一个向 Claude 发起请求的完整示例:

```python
message = client.messages.create(
    model=model,
    max_tokens=1000,
    messages=[
        {
            "role": "user",
            "content": "What is quantum computing? Answer in one sentence"
        }
    ]
)
```

When you run this code, Claude will process your request and return a response object containing the generated text along with metadata about the request.

> 运行这段代码时,Claude 会处理你的请求,并返回一个响应对象,里面包含生成的文本,以及这次请求的相关元数据。

## Extracting the Response 提取响应内容

The response object contains a lot of information, but you usually just want the generated text. Access it using:

> 响应对象里包含很多信息,但你通常只需要生成的文本,可以这样获取:

```python
message.content[0].text
```

This gives you clean, readable output like: "Quantum computing is a type of computation that leverages quantum mechanics principles like superposition and entanglement to process information using quantum bits (qubits), potentially solving certain complex problems exponentially faster than classical computers."

> 这样就能拿到干净、可读的输出内容,比如:「量子计算是一种利用量子力学原理(如叠加态和纠缠)、通过量子比特(qubit)处理信息的计算方式,在某些复杂问题上有潜力比经典计算机快指数级地求解。」

With these basics in place, you can start experimenting with different prompts and building more complex interactions with Claude.

> 掌握了这些基础之后,你就可以开始尝试不同的提示词,构建和 Claude 之间更复杂的交互了。

对产品经理来说,`client.messages.create()` 这一整套用法就像填一张标准化的「工单」:model 是「找哪个师傅」,max_tokens 是「这次最多干多久」,messages 是「工单上写的需求和历史沟通记录」——填好工单交上去,系统就会按这个规格给你返工结果,你再从返回结果里取出你真正要的那部分(生成的文本)。
