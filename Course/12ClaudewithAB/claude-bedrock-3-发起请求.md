# Claude with AWS Bedrock - 3 Making a Request 发起请求

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 3
> 课程: Claude with AWS Bedrock · 第 3 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Making your first API request to AWS Bedrock requires three essential components: a Bedrock Runtime Client to connect to the service, a Model ID to specify which model you want to run, and a User Message containing the text you want to feed into the model.

> 向 AWS Bedrock 发起你的第一次 API 请求,需要三个基本组件:一个用于连接服务的 Bedrock Runtime 客户端、一个用于指定你想运行哪个模型的 Model ID(模型 ID),以及一条包含你想喂给模型的文本的 User Message(用户消息)。

## Setting Up the Bedrock Client 设置 Bedrock 客户端

Start by creating a client using boto3 to connect to the Bedrock runtime service:

> 首先,用 boto3 创建一个客户端,连接到 Bedrock 运行时服务:

```python
import boto3

client = boto3.client("bedrock-runtime", region_name="us-west-2")
```

## Understanding Model IDs and Regional Availability 理解模型 ID 与区域可用性

Here's where things get tricky. Not every model is available in every AWS region. If you try to run a model that doesn't exist in your chosen region, you'll get a cryptic error message saying the model doesn't exist.

> 这里有个容易踩坑的地方。并不是每个模型在每个 AWS 区域都可用。如果你试图运行一个在你所选区域并不存在的模型,你会收到一条晦涩难懂的错误信息,说这个模型不存在。

For example, if Claude Sonnet is available in `us-west-2` but you're making requests from `us-east-1`, your request will fail.

> 举个例子,如果 Claude Sonnet 在 `us-west-2` 区域可用,但你是从 `us-east-1` 区域发起请求的,你的请求就会失败。

## Using Inference Profiles 使用推理配置文件(Inference Profiles)

Inference profiles solve the regional availability problem by automatically routing your requests to a region where your chosen model is actually hosted.

> 推理配置文件(inference profile)解决了区域可用性的问题——它会自动把你的请求路由到你所选模型实际托管的那个区域。

Instead of tracking which models are in which regions, you can use an inference profile that knows the model is available in multiple regions like `us-west-2` and `us-east-2`.

> 你不需要自己去追踪「哪个模型在哪个区域」,而是可以使用一个推理配置文件——它知道这个模型在 `us-west-2`、`us-east-2` 等多个区域都是可用的。

When you make a request using an inference profile, AWS automatically routes it to the correct region where your model exists, even if you're connecting from a different region.

> 当你用推理配置文件发起请求时,AWS 会自动把请求路由到你的模型真正存在的那个正确区域——即便你是从另一个区域连接过去的。

To find inference profile IDs, go to the AWS Bedrock console and look under "Cross-region inference" rather than using the model ID from the main model catalog page.

> 要查找推理配置文件的 ID,请前往 AWS Bedrock 控制台,在「Cross-region inference(跨区域推理)」部分查找,而不是直接用主模型目录页面上的模型 ID。

Copy the inference profile ID for your chosen model.

> 复制你所选模型对应的推理配置文件 ID。

## Creating User Messages 创建用户消息

User messages have a specific structure that might look overly complex at first, but there's a good reason for it:

> 用户消息有一种特定的结构,乍一看可能显得过于复杂,但这么设计是有道理的:

```python
user_message = {
    "role": "user",
    "content": [
        {"text": "What's 1+1?"}
    ]
}
```

The content is a list because a single message can contain different types of content - text, images, or other media types. This structure allows you to send multimodal requests.

> `content` 之所以是一个列表,是因为单条消息可以包含不同类型的内容——文本、图片,或者其他媒体类型。这种结构让你能够发送多模态请求。

## Making the Request 发起请求

Now you can make your API call using the `converse` method:

> 现在你可以用 `converse` 方法来发起 API 调用了:

```python
response = client.converse(
    modelId=model_id,
    messages=[user_message]
)
```

The response contains a lot of metadata, but to get just the generated text, you need to navigate through the response structure:

> 响应中包含大量元数据,但如果你只想拿到生成的文本,需要按照响应结构一层层取值:

```python
response["output"]["message"]["content"][0]["text"]
```

## Understanding Message Types 理解消息类型

There are two main message types you'll work with:

> 你会用到两种主要的消息类型:

- **User messages** - Content you want to feed into the model (role: "user"). **用户消息** - 你想喂给模型的内容(role 为 "user")。
- **Assistant messages** - Content the model has produced (role: "assistant"). **助手消息** - 模型生成的内容(role 为 "assistant")。

Both message types follow the same structure with a role and content list. This consistency makes it easy to build conversations by alternating between user and assistant messages.

> 这两种消息类型都遵循相同的结构——一个 role 字段加一个 content 列表。这种一致性让你可以很方便地通过「用户消息、助手消息交替出现」来构建对话。

The assistant message you get back from Bedrock follows the exact same format as your user message, just with a different role. This standardized structure makes it straightforward to chain multiple requests together for longer conversations.

> Bedrock 返回给你的助手消息,格式和你的用户消息完全一致,只是 role 不同。这种标准化的结构,让你能够很直接地把多次请求串联起来,构建更长的对话。

## Downloads 课程配套文件

- `001_Api_Requests.ipynb`(在新标签页打开)
- `001_Api_Requests_complete.ipynb`(在新标签页打开)
