# Claude with Google Vertex - 55 Rules of prompt caching 提示词缓存的规则

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 55
> 课程: Claude with Google Vertex · 第 55 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

Claude 的提示词缓存把在消息上做的计算成果存起来,以便后续请求复用,让用上缓存的请求既便宜又快。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621081%2F08_-_006_-_Rules_of_Prompt_Caching_00.1748621080824.png)

模式很简单: 初次请求**写**缓存,后续请求可以**读**缓存。缓存活 5 分钟,所以只有在反复发送相同内容时才有用——而这在真实应用中极其频繁。

## Cache Breakpoints 缓存断点

**消息上的计算成果不会自动缓存**,必须由你手动给某个块加上「缓存断点」。断点之前的所有内容会被缓存,而且只有当后续请求中「直到断点为止(含断点)」的内容完全一致时,缓存才会被使用。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621081%2F08_-_006_-_Rules_of_Prompt_Caching_03.1748621081646.png)

要加缓存断点,文本块必须写成**完整形式**,不能用简写形式。区别如下:

```python
# 简写形式 —— 无法添加缓存断点
user_message = {
  "role": "user",
  "content": "Hi there!"
}

# 完整形式 —— 加缓存断点必须这么写
user_message = {
  "role": "user", 
  "content": [
    {
      "type": "text",
      "text": "Hi there!",
      "cache_control": {
        "type": "ephemeral"
      }
    }
  ]
}
```

## How Cache Breakpoints Work 缓存断点怎么工作

缓存断点可以**跨消息**,也可以缓存 assistant 消息。放置断点后,直到该位置的一切都会被缓存。记住: 内容必须完全一致才能命中缓存!

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621082%2F08_-_006_-_Rules_of_Prompt_Caching_09.1748621082421.png)

在后续请求中,Claude 从缓存读取此前处理好的成果,而不是重新处理:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621083%2F08_-_006_-_Rules_of_Prompt_Caching_11.1748621083185.png)

## Breakpoint Location 断点的位置

断点不限于文本块! 你还可以把缓存断点加在**系统提示词**和**工具定义**上。实际上这两处才是最常见的缓存机会,因为它们在各次请求之间很少变化。

```python
# 带缓存断点的工具定义
tools = [
  add_duration_to_datetime_schema,
  get_current_datetime_schema,
  {
    "name": "set_reminder",
    "description": "Sets a reminder...",
    "input_schema": { ... },
    "cache_control": {"type": "ephemeral"}
  }
]

# 带缓存断点的系统提示词
system = [
  {
    "type": "text",
    "text": "You are a senior software...",
    "cache_control": {"type": "ephemeral"}
  }
]
```

## Cache Ordering 缓存的顺序

在幕后,工具、系统提示词、消息会按**这个特定顺序**拼接后送进 Claude。这会影响你的缓存断点如何生效。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621084%2F08_-_006_-_Rules_of_Prompt_Caching_14.1748621083854.png)

**最多可以加 4 个缓存断点**。如果你把断点放在最后一个工具上,那么直到该工具为止的内容会被缓存,而系统提示词和消息不会。这让你能基于「应用里什么会变」来精细控制缓存范围。

## Minimum Content Length 最小内容长度

内容至少要 **1024 个 token** 才能被缓存(指你想缓存的所有消息/块的总和)。一句 "Hi there!" 达不到这个门槛,但把这段文字重复 500 次,token 数就够了。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621084%2F08_-_006_-_Rules_of_Prompt_Caching_19.1748621084576.png)

高效缓存的关键在于: **找出请求中那些保持不变的部分**——通常是系统提示词和工具定义——把断点放在恰当的位置,最大化缓存命中、最小化重复处理。

对产品经理来说: 「工具 → 系统提示词 → 消息」这个固定顺序有个很实用的推论: **越不变的东西越应该放前面**。这和缓存断点只能覆盖「断点之前」的规则一起,决定了一个原则——把动态内容(用户输入、当前时间、个性化信息)尽量往后放。如果有人把「今天是 X 月 X 日」写进系统提示词开头,那整个缓存每天都会失效一次,这是个隐蔽但代价不小的设计失误。
