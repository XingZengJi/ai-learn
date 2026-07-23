# Claude with Google Vertex - 05 Making a request 发起请求

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 05
> 课程: Claude with Google Vertex · 第 05 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

现在动手用 Anthropic Python SDK,通过 Vertex AI 向 Claude 发出第一个请求。分三步走: 安装 SDK、创建客户端、发起第一次 API 调用。

## Installing the Anthropic Python SDK 安装 Anthropic Python SDK

首先安装带 Vertex AI 支持的 Anthropic SDK。在 Jupyter notebook 里运行这条魔法命令:

```python
%pip install "anthropic[vertex]"
```

`[vertex]` 这部分保证你装上了连接 Google Cloud Vertex AI 所需的特定组件。

## Creating an API Client 创建 API 客户端

接着导入并创建一个专门用于 Vertex AI 的客户端实例:

```python
from anthropic import AnthropicVertex

client = AnthropicVertex(region="global", project_id="your-project-id")
model = "claude-sonnet-4@20250514"
```

把 `"your-project-id"` 换成你实际的 Google Cloud 项目 ID,可以在 Google Cloud Console 的项目选择器里找到。把模型名存成变量,省得在后面的 notebook 里反复手打。

## Understanding the Create Function 理解 create 函数

向 Claude 发请求的核心是 `create` 函数,它需要三个关键参数:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619440%2F03_-_003_-_Making_a_Request_08.1748619440458.png)

- `model` —— 你要用的 Claude 模型名
- `max_tokens` —— 回复长度的安全上限(Claude 不会去凑这个数,只是不会超过它)
- `messages` —— 你要发给 Claude 的对话历史

把 `max_tokens` 理解成**预算**而不是**目标**。设成 1000,Claude 该写多少还写多少,只是超过 1000 token 就会被截断。

## Understanding Messages 理解 messages

messages 表示你和 Claude 之间来回的对话,就像聊天软件里那样:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619441%2F03_-_003_-_Making_a_Request_12.1748619440992.png)

消息有两种类型:

- **User 消息** —— 人写的、你要喂给 Claude 的内容
- **Assistant 消息** —— Claude 生成并返回给你的内容

## Making Your First Request 发出第一个请求

一个基础请求长这样:

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

每条消息都是一个字典,含 `role`(`"user"` 或 `"assistant"`)和 `content`(实际文本)。

## Extracting the Response 取出回复内容

运行后你会拿到一个带大量元数据的复杂响应对象。只想要 Claude 生成的文本的话,用:

```python
message.content[0].text
```

这样得到的是干净可读的输出,而不是塞满技术细节的完整对象。这个写法后面会反复用到。
