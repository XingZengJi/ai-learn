# Claude with Google Vertex - 54 Prompt caching 提示词缓存

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 54
> 课程: Claude with Google Vertex · 第 54 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

提示词缓存(prompt caching)通过复用此前请求的计算成果,来加快 Claude 的响应、降低文本生成成本。它不再在每次请求后把处理成果全丢掉,而是保存下来,下次发送相似内容时再用。

## How Claude Normally Processes Requests Claude 平时怎么处理请求

先看看不开缓存时,一次典型请求发生了什么。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621075%2F08_-_005_-_Prompt_Caching_01.1748621075646.png)

你把消息发给 Claude 后,它并不会立刻开始生成回复,而是先对输入做大量预处理:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621077%2F08_-_005_-_Prompt_Caching_04.1748621077221.png)

1. 对提示词分词(把文本切成更小单位)
2. 为每个 token 创建嵌入(数学表示)
3. 根据周围文本补充上下文
4. 这之后才开始生成实际的输出文本

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621078%2F08_-_005_-_Prompt_Caching_06.1748621078185.png)

把响应发给你之后,Claude 会**丢弃全部这些计算成果**,一切归零,准备接收下一个请求。

## The Problem with Repeated Content 重复内容带来的浪费

低效之处就在这里。设想你正在和 Claude 对话,那么你的后续请求会包含:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621079%2F08_-_005_-_Prompt_Caching_08.1748621078850.png)

- 之前那条一模一样的用户消息
- Claude 上一次的回复
- 你新的追问

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621079%2F08_-_005_-_Prompt_Caching_10.1748621079419.png)

Claude 不得不把最初那条消息**从头再处理一遍**,尽管它片刻之前刚分析过完全相同的内容。用 Claude 的口吻说就是:「这条消息我刚处理过,却把成果全扔了。本来是可以复用的!」

## How Prompt Caching Solves This 提示词缓存如何解决

提示词缓存改变了这种浪费。Claude 不再丢弃预处理成果,而是把它存进缓存。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621080%2F08_-_005_-_Prompt_Caching_14.1748621079978.png)

工作方式:

- **初次请求**: Claude 处理你的消息,并把计算成果写入缓存
- **后续请求**: 再看到相同内容时,直接从缓存读取此前处理好的成果,而不是从头再来

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621080%2F08_-_005_-_Prompt_Caching_16.1748621080605.png)

缓存就像一张查找表:「以后再看到这条消息,我就复用已经做过的这份工作。」

## Key Benefits and Limitations 收益与限制

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621081%2F08_-_005_-_Prompt_Caching_18.1748621081213.png)

优势:

- **响应更快**: 用上缓存内容的请求执行更快
- **成本更低**: 复用缓存的那部分处理更便宜
- **自动优化**: 初次请求写缓存,后续请求读缓存

需要注意的限制:

- **存活时间短**: 缓存只活 **5 分钟**
- **必须完全一致**: 只有在反复发送**相同内容**时才有用
- **常见场景**: 这在对话式应用和文档分析工作流中极其频繁

对那些用户频繁引用同一批文档、持续对话、或在短时间内反复迭代相似提示词的应用,提示词缓存价值尤其大。

对产品经理来说: 把这一课和第 06 课「多轮对话」连起来看,一条产品逻辑就清楚了——对话越长成本越高,而缓存正是对冲这个成本的手段。但注意那个 **5 分钟**的限制: 它意味着缓存只对「用户连续操作」有效,用户离开去开个会再回来,缓存就没了。所以「AI 助手的会话保持时长」这类设计,背后是有真实成本含义的。
