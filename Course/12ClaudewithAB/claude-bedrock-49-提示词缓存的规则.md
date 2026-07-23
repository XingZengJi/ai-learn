# Claude with AWS Bedrock - 49 Rules of prompt caching 提示词缓存的规则

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 49
> 课程: Claude with AWS Bedrock · 第 49 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Prompt caching in Claude works by storing the computational work done on messages so it can be reused in follow-up requests. This makes subsequent requests both cheaper and faster to execute, but only when you're repeatedly sending the same content.

> Claude 的提示词缓存,原理是把处理消息时做的计算工作存下来,供后续请求复用。这让后续请求既更便宜也更快——但前提是你在反复发送相同的内容。

The process follows a two-phase pattern: the initial request writes to the cache, and follow-up requests can read from it. The cache only lives for 5 minutes, so this feature is most useful when you're sending the same content repeatedly within a short timeframe.

> 整个过程是「两阶段」模式: 首次请求写入缓存,后续请求读取缓存。缓存只存活 5 分钟,所以这项功能在「短时间内反复发送相同内容」的场景下最有用。

## Cache Points 缓存点

Prompt caching isn't enabled automatically - you need to manually add cache point message parts to control what gets cached. Cache points tell Claude to cache all the work done for everything before that point in your message.

> 提示词缓存**不会自动启用**——你需要手动加入「缓存点(cache point)」消息部分,来控制哪些内容被缓存。缓存点告诉 Claude: 把这个点之前所有内容的处理成果都缓存起来。

Here's how you add a cache point to a user message:

> 给用户消息加缓存点的写法:

```python
user_message = {
  "role": "user",
  "content": [
    {"text": ""},
    {"cachePoint": {"type": "default"}}
  ]
}
```

The key rule is that work done for everything before the cache point will be cached, but anything after the cache point won't be stored in the cache.

> 核心规则是: 缓存点**之前**的所有内容的处理成果会被缓存,缓存点**之后**的任何内容都不会进缓存。

> 可以把缓存点想象成一条分界线: 线以上是「不变的部分」(存起来重复用),线以下是「每次都变的部分」(每次重新算)。

## How Cache Points Work 缓存点如何生效

When you make an initial request with a cache point, Claude processes all the content and stores the work done up to that cache point. On follow-up requests, if the content before the cache point is identical, Claude reads the previously processed work from cache instead of reprocessing it.

> 当你带着缓存点发起首次请求时,Claude 处理全部内容,并把缓存点之前那部分的成果存起来。后续请求时,如果缓存点之前的内容完全一致,Claude 就直接从缓存读取之前处理好的成果,而不再重新处理。

The cache will only be used if the content before the cache point is completely identical. Even small changes like adding "Please" to the beginning of your prompt will prevent cache usage, forcing Claude to process everything from scratch.

> **只有在缓存点之前的内容完全一模一样时,缓存才会被命中。** 哪怕是在提示词开头加一个「Please」这样的小改动,都会导致缓存失效,逼着 Claude 从头把所有内容重新处理一遍。

> 这条是最容易踩坑的地方: 任何在系统提示词里插入时间戳、随机 ID、用户名之类的动态内容,都会让缓存彻底作废。要放这类变量,就放到缓存点之后。

## Caching Across Messages 跨消息缓存

Cache points can span multiple messages and even include assistant messages. This means you can cache entire conversation histories up to a certain point.

> 缓存点可以横跨多条消息,甚至可以把助手的回复也包含进来。这意味着你可以把某个时间点之前的整段对话历史都缓存下来。

For example, you might have a conversation with a user message, assistant response, and another user message, with a cache point at the end. All the processing work for that entire conversation thread gets cached and can be reused.

> 举例来说,你的对话里有一条用户消息、一条助手回复、再一条用户消息,然后在末尾放一个缓存点。整条对话线程的处理成果都会被缓存下来供复用。

## Minimum Content Length 最小内容长度

Content must be at least 1024 tokens long to be cached. This is the sum of all messages and parts you're trying to cache before the cache point.

> 内容必须至少有 1024 个 token 才会被缓存。这个数量是缓存点之前你想缓存的所有消息和部分加起来的总和。

A simple "Hi there!" message won't meet the 1024 token minimum, so nothing gets cached. But if you repeat "Hi there!" 500 times, that would exceed 1024 tokens and qualify for caching.

> 一条简单的「Hi there!」达不到 1024 token 的最低门槛,所以什么都不会被缓存。但如果你把「Hi there!」重复 500 遍,就会超过 1024 token,符合缓存条件了。

## Cache Point Locations 缓存点的位置

Cache points aren't restricted to user messages. You can add them to system prompts and tool definitions, which are actually the most common caching opportunities.

> 缓存点不限于用户消息。你也可以把它加到系统提示词和工具定义里——而这两处其实才是最常见的缓存机会。

For tool definitions:

> 工具定义中的写法:

```python
tools = [
  {"toolSpec": add_duration_to_datetime_schema},
  {"toolSpec": get_current_datetime_schema},
  {"cachePoint": {"type": "default"}}
]
```

For system prompts:

> 系统提示词中的写法:

```python
system = [
  {"text": "You are a senior software..."},
  {"cachePoint": {"type": "default"}}
]
```

These are the most valuable caching opportunities because system prompts and tool lists rarely change between requests, making them perfect candidates for caching.

> 这两处是最有价值的缓存机会,因为系统提示词和工具列表在多次请求之间几乎不变,是天然的缓存对象。

对产品经理来说,可以这样排优先级: 先把**长且不变**的东西放进缓存点之前——系统提示词、工具定义、大文档、对话历史; 把**每次都变**的东西留在缓存点之后——用户这一轮的新问题。两个条件缺一不可: 够长(≥1024 token)且完全不变,缓存才划得来。
