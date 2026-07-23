# Claude with AWS Bedrock - 48 Prompt caching 提示词缓存

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 48
> 课程: Claude with AWS Bedrock · 第 48 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Prompt caching is a feature that speeds up Claude's responses and reduces the cost of text generation by reusing computational work from previous requests. To understand how this works, let's first look at what normally happens inside Claude during a typical request.

> 提示词缓存(prompt caching)是一项通过复用此前请求的计算成果,来加快 Claude 响应速度、降低文本生成成本的功能。要理解它是怎么做到的,我们先看看一次普通请求中 Claude 内部到底发生了什么。

## How Claude Normally Processes Requests Claude 平时是怎么处理请求的

When you send a message to Claude, a lot happens behind the scenes before you get a response back. Claude doesn't just immediately start generating text - it first does extensive work on your input message.

> 当你给 Claude 发一条消息,在你拿到回复之前,幕后其实发生了很多事。Claude 并不是立刻就开始生成文本——它先要对你的输入消息做大量处理工作。

Here's what Claude does with your message:

> Claude 对你的消息做了这些事:

1. Tokenize the prompt. 把提示词切成 token。
2. Create embeddings for each token. 为每个 token 生成嵌入。
3. Add context based on surrounding text. 依据上下文补充语境信息。
4. Generate output text. 生成输出文本。

All of this preprocessing work happens before Claude generates any actual response. Once Claude finishes processing your request and sends back the response, it throws away all the computational work it just did.

> 上面这些预处理工作,都发生在 Claude 真正开始生成回答之前。而一旦 Claude 处理完你的请求、把回复发回来,它就把刚刚做的全部计算成果**扔掉了**。

## The Problem with Throwing Away Work 「扔掉成果」带来的问题

This creates an inefficiency when you're having conversations with Claude. Let's say you make a follow-up request that includes the same message from earlier, plus Claude's previous response, plus a new message to continue the conversation.

> 在你和 Claude 多轮对话时,这就造成了浪费。设想你发起一次后续请求,里面包含了之前那条一模一样的消息、Claude 上一轮的回复,再加上你新说的一句话。

When Claude sees that original message again, it has to redo all the same computational work it just threw away moments earlier. Claude essentially thinks: "I just processed this exact message and did all this work, then threw it away. Now I have to do it all over again."

> 当 Claude 再次看到那条最初的消息时,它必须把刚刚扔掉的那些计算工作原样重做一遍。Claude 心里基本上是这么想的:「我刚刚才处理过这条一模一样的消息、做完了全部工作,然后把它扔了。现在我又得从头再来一遍。」

对产品经理来说,这就像每次开周会都要花 20 分钟把项目背景重讲一遍给同一批人听。信息没变、听众没变,但成本每周照付。提示词缓存干的事,就是把「背景已经讲过了」这件事记下来。

## How Prompt Caching Solves This 提示词缓存如何解决这个问题

Prompt caching addresses this inefficiency by saving the computational work instead of discarding it. Here's how it works:

> 提示词缓存的解法是: 把计算成果保存下来,而不是丢弃。具体是这样运作的:

When Claude processes your initial request, instead of throwing away all the preprocessing work, it stores that work in a cache. The cache acts like a lookup table that maps specific input messages to their corresponding computational results.

> 当 Claude 处理你的首次请求时,它不再丢弃预处理成果,而是把这些成果存进缓存。缓存的作用就像一张查找表,把特定的输入消息映射到对应的计算结果。

When you make a follow-up request that includes the same content, Claude can check its cache and reuse the previous work instead of starting from scratch.

> 当你发起的后续请求里包含同样的内容时,Claude 就能查一下缓存、直接复用之前的成果,而不必从零开始。

## Key Benefits and Limitations 主要收益与限制

Prompt caching offers several advantages:

> 提示词缓存有这几项优势:

- Requests that use cached content are cheaper and faster to execute. 命中缓存的请求执行起来更便宜、更快。
- Initial request will write to the cache. 首次请求负责**写入**缓存。
- Follow up requests can read from the cache. 后续请求可以**读取**缓存。
- Cache lives for 5 minutes. 缓存的存活时间是 5 分钟。
- Only useful if you're repeatedly sending the same content (but this happens extremely frequently). 只有在你反复发送相同内容时才有用(不过这种情况其实极其常见)。

The cache has a 5-minute lifespan, so it's most beneficial for conversations or workflows where you're making multiple requests with overlapping content within a short timeframe. This pattern is actually very common in real applications - think about chatbots, document analysis tools, or any system that maintains conversation context.

> 缓存只存活 5 分钟,所以它最适合那种「短时间内发起多次、内容有重叠」的对话或工作流。这种模式在真实应用里其实非常普遍——想想聊天机器人、文档分析工具,或者任何需要维持对话上下文的系统。

Prompt caching is particularly valuable because many AI applications do repeatedly send the same content. Whether it's system prompts, conversation history, or large documents being analyzed, the same text often appears across multiple requests in a session.

> 提示词缓存之所以特别有价值,是因为很多 AI 应用确实在反复发送相同内容。无论是系统提示词、对话历史,还是正在分析的大文档,同一段文本常常会在一个会话的多次请求中反复出现。
