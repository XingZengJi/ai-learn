# Building with the Claude API - 1 Accessing the API 访问 API

> Course: Building with the Claude API · Lesson 1
> 课程: Building with the Claude API · 第 1 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

When building applications with Claude, understanding the complete request lifecycle helps you make better architectural decisions and debug issues more effectively. Let's walk through what happens from the moment a user clicks "send" in your chat interface to when Claude's response appears on screen.

> 用 Claude 构建应用时,理解一次请求的完整生命周期,能帮你做出更好的架构决策,也能更高效地排查问题。下面我们来梳理:从用户在聊天界面点击「发送」的那一刻,到 Claude 的回复出现在屏幕上,中间到底发生了什么。

## The Five-Step Request Flow 五步请求流程

Every interaction with Claude follows a predictable pattern with five distinct phases: request to server, request to Anthropic API, model processing, response to server, and response to client.

> 每一次与 Claude 的交互都遵循一套可预测的模式,分为五个明确的阶段:请求发到你的服务器 → 服务器请求发到 Anthropic API → 模型处理 → 响应返回服务器 → 响应返回客户端。

### Why You Need a Server 为什么你需要一台服务器

You should never make requests to the Anthropic API directly from client-side code. Here's why:

> 你绝不应该直接从客户端代码向 Anthropic API 发起请求。原因如下:

- API requests require a secret API key for authentication
- Exposing this key in client code creates a serious security vulnerability
- Anyone could extract the key and make unauthorized requests

  API 请求需要一个密钥(API key)来做身份验证;把这个密钥暴露在客户端代码里会造成严重的安全漏洞;任何人都能提取出这个密钥,冒用你的身份发起请求。

Instead, your web or mobile app sends requests to your own server, which then communicates with the Anthropic API using the securely stored key.

> 正确的做法是:你的网页或移动应用把请求发给你自己的服务器,再由服务器用安全保存的密钥去和 Anthropic API 通信。

对产品经理来说,这里的逻辑和「不要把公司金库钥匙印在门口的宣传单上」是一回事——API key 就是钥匙,客户端代码(浏览器、手机 App)相当于任何人都能翻看的宣传单,而你自己的服务器才是保险柜,钥匙只能放在保险柜里用。

### Making API Requests 发起 API 请求

When your server contacts the Anthropic API, you can use either an official SDK or make plain HTTP requests. Anthropic provides SDKs for Python, TypeScript, JavaScript, Go, and Ruby.

> 当你的服务器联系 Anthropic API 时,既可以使用官方 SDK,也可以直接发 HTTP 请求。Anthropic 提供 Python、TypeScript、JavaScript、Go 和 Ruby 的官方 SDK。

Every request must include these essential fields:

- API Key - Identifies your request to Anthropic
- Model - Name of the model to use (like "claude-3-sonnet")
- Messages - List containing the user's input text
- Max Tokens - Limit for how many tokens Claude can generate

  每次请求都必须包含以下几个必要字段:API Key(向 Anthropic 表明请求方身份)、Model(要使用的模型名称,比如 "claude-3-sonnet")、Messages(包含用户输入文本的列表)、Max Tokens(限制 Claude 最多能生成多少个 token)。

## Inside Claude's Processing Claude 内部的处理过程

Once Anthropic receives your request, Claude processes it through four main stages: tokenization, embedding, contextualization, and generation.

> Anthropic 收到你的请求后,Claude 会经过四个主要阶段来处理它:分词(tokenization)、嵌入(embedding)、语境化(contextualization)和生成(generation)。

### Tokenization 分词

Claude first breaks your input text into smaller chunks called tokens. These can be whole words, parts of words, spaces, or symbols. For simplicity, think of each word as one token.

> Claude 首先会把你输入的文本切成更小的片段,称为 token(词元)。这些片段可能是完整的单词、单词的一部分、空格,或者符号。为了方便理解,可以简单把每个单词当作一个 token。

### Embedding 嵌入

Each token gets converted into an embedding - a long list of numbers that represents all possible meanings of that word. Think of embeddings as numerical definitions that capture semantic relationships.

> 每个 token 都会被转换成一个「嵌入(embedding)」——一长串数字,代表这个词所有可能的含义。可以把嵌入理解成「用数字写成的词典释义」,它捕捉的是词与词之间的语义关系。

Words often have multiple meanings. For example, "quantum" could refer to:

- A discrete unit of physical quantity (physics)
- Quantum mechanics or quantum physics concepts
- Something extremely small or subatomic
- Quantum computing applications

  一个词往往有多重含义。比如 "quantum"(量子)可以指:物理学中的「离散物理量单位」;量子力学或量子物理的概念;极其微小、亚原子尺度的事物;量子计算相关的应用。

### Contextualization 语境化

Claude refines each embedding based on surrounding words to determine the most likely meaning in context. This process adjusts the numerical representations to highlight the appropriate definition.

> Claude 会根据周围的词,对每个嵌入做进一步调整,判断在当前语境下最可能的含义是什么。这个过程会调整数字表示,让「正确的那个释义」被凸显出来。

### Generation 生成

The contextualized embeddings pass through an output layer that calculates probabilities for each possible next word. Claude doesn't always pick the highest probability word - it uses a mix of probability and controlled randomness to create natural, varied responses.

> 完成语境化的嵌入会经过一个输出层,为每个可能的「下一个词」计算概率。Claude 并不总是选择概率最高的词——它会把概率和受控的随机性结合起来,让回复更自然、更有变化。

After selecting each word, Claude adds it to the sequence and repeats the entire process for the next word.

> 每选出一个词,Claude 就把它加入已生成的序列,然后为下一个词重复整个过程。

对产品经理来说,这四步可以类比成「翻译官现场同传」:先把话拆成词(分词),再给每个词准备好所有可能的释义卡片(嵌入),接着根据上下文抽出最合适的那张卡片(语境化),最后一个词一个词地组织出通顺又不死板的句子(生成)——而不是提前背好一整段稿子照着念。

## When Claude Stops Generating Claude 何时停止生成

After each token, Claude checks several conditions to decide whether to continue:

> 每生成一个 token 之后,Claude 都会检查几个条件,来决定是否继续生成:

- Max tokens reached - Has it hit the limit you specified?
- Natural ending - Did it generate an end-of-sequence token?
- Stop sequence - Did it encounter a predefined stop phrase?

  达到最大 token 数——是否已经触及你设定的上限?自然结束——是否生成了「序列结束」标记?遇到停止序列——是否碰到了预先定义好的停止短语?

## The API Response API 的响应

When generation completes, the API sends back a structured response containing:

- Message - The generated text
- Usage - Count of input and output tokens
- Stop Reason - Why generation ended

  生成完成后,API 会返回一个结构化的响应,其中包含:Message(生成的文本)、Usage(输入和输出的 token 计数)、Stop Reason(生成结束的原因)。

Your server receives this response and forwards the generated text back to your client application, where it appears in the user interface.

> 你的服务器收到这个响应后,会把生成的文本转发回客户端应用,呈现在用户界面上。

## Key Takeaways 关键要点

Understanding this flow helps you:

- Design secure architectures that protect your API keys
- Set appropriate token limits for your use case
- Handle different stop reasons in your application logic
- Debug issues by understanding where they might occur in the pipeline

  理解这套流程能帮你:设计能保护好 API 密钥的安全架构;为你的使用场景设定合适的 token 上限;在应用逻辑里妥善处理不同的停止原因;排查问题时更清楚故障可能出现在流程的哪个环节。

Don't worry about memorizing every detail - the goal is familiarizing yourself with the terminology and overall process you'll encounter when working with Claude's API.

> 不必强求记住每一个细节——这一课的目标是让你熟悉这些术语,以及使用 Claude API 时会遇到的整体流程。
