# Claude with Google Vertex - 56 Prompt caching in action 提示词缓存实战

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 56
> 课程: Claude with Google Vertex · 第 56 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

提示词缓存是一项很有力的优化能力: 当你反复向 Claude 发送相同内容时,请求会更便宜也更快。初次请求写缓存,后续请求读缓存。缓存活 5 分钟——这非常有用,因为很多应用会反复发送一模一样的工具 schema、系统提示词或消息历史。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621082%2F08_-_007_-_Prompt_Caching_in_Action_19.1748621082240.png)

## How Prompt Caching Works 工作机制

把内容标记为可缓存后,Claude 处理它一次并保存结果。后续包含**完全相同内容**的请求可以跳过处理,直接从缓存读取。这只在缓存内容一致时生效——**哪怕改动一个字符,缓存就失效了**。

一次请求里可以设置多个缓存断点。缓存顺序遵循:

1. 工具 schema
2. 系统提示词
3. 消息历史

## Setting Up Tool Schema Caching 配置工具 schema 缓存

要缓存工具 schema,需要给列表中**最后一个**工具加上 `cache_control` 字段。下面是不污染原始 schema 的正确写法:

```python
if tools:
    tools_clone = tools.copy()
    last_tool = tools_clone[-1].copy()
    last_tool["cache_control"] = {"type": "ephemeral"}
    tools_clone[-1] = last_tool
    params["tools"] = tools_clone
```

这个做法在加 cache control 字段前,先把工具列表和最后一个 schema 都复制了一份,避免误改原始工具定义——否则你之后调整工具顺序时会出问题。

## System Prompt Caching 系统提示词缓存

系统提示词需要写成一个列表,里面是带 cache control 字段的文本块:

```python
if system:
    params["system"] = [
        {
            "type": "text",
            "text": system,
            "cache_control": {"type": "ephemeral"}
        }
    ]
```

## Understanding Cache Behavior 理解缓存行为

第一次发出含可缓存内容的请求时,你会在 usage 字段里看到 `cache_creation_input_tokens`,表示 Claude 写入缓存的 token 数。后续发出相同内容的请求时,看到的则是 `cache_read_input_tokens`。

如果同一个请求里既有缓存内容又有新内容,你可能同时看到缓存读和缓存写。比如工具 schema 不变但系统提示词改了,那就是从缓存读工具、把新的系统提示词写进缓存。

## Cache Invalidation 缓存失效

**缓存对变化极其敏感。** 工具 schema 描述、系统提示词或任何被缓存内容里改动一个字符,那条缓存就失效了。这时 Claude 会把它当作全新内容,重新建一条缓存。

正因为这么敏感,你要慎重挑选缓存对象。在多次请求间保持稳定的工具 schema 和系统提示词是理想候选; 频繁变动的动态内容则从缓存中得不到好处。

## Practical Implementation 实践建议

实践中,建议**默认**就把缓存做进 chat 函数里。绝大多数应用在多次请求间用的是同一套工具 schema 和系统提示词,天然适合缓存。当你要发很多内容相似的请求时,性能和成本收益相当可观。

记住: 缓存的价值来自反复发送相同内容。既然这在真实应用中(尤其是工具 schema 和系统提示词)极其频繁,那么**在开发早期就把缓存实现进去**,会随着应用规模扩大而持续带来回报。

对产品经理来说: 「改一个字符,缓存全部失效」这条规则有个容易被低估的运营含义——**改提示词是有成本的,不只是开发成本**。系统提示词改一次,所有正在活跃的缓存立刻作废,那段时间的请求成本会短暂跳升。这不影响改不改的决定,但意味着提示词的调整最好攒批发布,而不是一天改五次。
