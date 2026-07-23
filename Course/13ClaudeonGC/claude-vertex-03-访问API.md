# Claude with Google Vertex - 03 Accessing the API 访问 API

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 03
> 课程: Claude with Google Vertex · 第 03 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

用 Claude 做应用时,搞清楚一次请求的完整生命周期,能帮你把系统架构设计得更好,排查问题也更快。下面就走一遍: 当用户在你的 AI 聊天应用里发出一条消息后,到底发生了什么。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619446%2F03_-_001_-_Accessing_the_API_01.1748619446474.png)

## The Complete Request Flow 完整的请求流程

从用户输入到 AI 回复,中间有五个明确的步骤: 请求发到你的服务器、服务器请求 Vertex、模型处理、响应回到服务器、响应回到客户端。每一步都是那个「像变魔术一样」的回复得以出现的必要环节。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619447%2F03_-_001_-_Accessing_the_API_03.1748619446886.png)

## Why You Need a Server 为什么必须有自己的服务器

**永远不要**从客户端代码直接发 API 请求。原因:

- API 请求需要携带必须保密的凭据
- 凭据一旦写进客户端代码,任何人都能看到
- 你的服务器充当应用与 Vertex 之间的安全中间层

请求一律走你自己可控、可加固的服务器。

## Making the API Request 发起 API 请求

你的服务器可以用 Anthropic 官方 SDK,也可以用 Google 官方的 Vertex SDK 与 Vertex 通信。Anthropic 提供 Python、TypeScript、Go、Ruby 四种官方 SDK。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619447%2F03_-_001_-_Accessing_the_API_05.1748619447285.png)

每个请求都必须包含这几个关键字段:

- **API Key** —— 标识这个请求来自谁
- **Model** —— 具体要用哪个模型的名字
- **Messages** —— 包含用户输入文本的列表
- **Max Tokens** —— 限制模型最多能生成多少 token

用户的输入会被放进一条 "user" 消息里,这条消息再放进发给 API 的消息列表。

## Inside Claude: Text Generation Process Claude 内部: 文本是怎么生成的

Vertex 收到请求后,Claude 会经过四个阶段处理它: 分词(Tokenization)、嵌入(Embedding)、上下文化(Contextualization)、生成(Generation)。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619448%2F03_-_001_-_Accessing_the_API_07.1748619448446.png)

### Tokenization 分词

Claude 先把输入文本切成更小的块,叫 token。一个 token 可能是完整单词、单词的一部分、空格或符号。简单起见,可以先把「一个词 = 一个 token」当作近似理解。

### Embedding 嵌入

每个 token 会被转换成一个 embedding —— 一长串数字,代表这个词所有可能的含义。可以把 embedding 理解成「用数字写成的词典释义」。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619449%2F03_-_001_-_Accessing_the_API_09.1748619448923.png)

### Contextualization 上下文化

因为一个词可以有多个意思,Claude 要靠上下文判断该取哪一个。"quantum" 可能指物理、指计算,也可能只是表示「极小」——周围的词决定了它在这里的实际含义。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619449%2F03_-_001_-_Accessing_the_API_10.1748619449353.png)

在上下文化阶段,每个 embedding 会根据它的邻居被调整,把最合理的那层含义凸显出来。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619450%2F03_-_001_-_Accessing_the_API_11.1748619449882.png)

### Generation 生成

带上下文的 embedding 经过输出层,产出「下一个词各是什么」的概率分布。Claude **并不总是选概率最高的那个词**——它混合了概率与随机性,好让回复更自然、更有变化。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619450%2F03_-_001_-_Accessing_the_API_13.1748619450513.png)

选定一个词之后,Claude 把它接到序列末尾,然后为下一个词把整个过程再走一遍。

## When Generation Stops 什么时候停止生成

每生成一个 token,Claude 都会检查几个条件,决定要不要继续:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619451%2F03_-_001_-_Accessing_the_API_15.1748619451060.png)

- **达到 max tokens** —— 是否碰到了你设的上限?
- **自然结束** —— 是否生成了序列结束 token?
- **停止序列** —— 是否遇到了你预先定义的停止短语?

序列结束 token 是一个特殊信号(不是可见文字),Claude 用它表示「话说完了」。

## The Response 响应

生成结束后,Vertex 把响应发回你的服务器,内容包括:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619451%2F03_-_001_-_Accessing_the_API_17.1748619451445.png)

- **Message** —— 生成的文本
- **Usage** —— 输入和输出的 token 数
- **Stop Reason** —— 模型为什么停下来

你的服务器再把生成的文本转发给客户端,呈现在聊天界面上。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619452%2F03_-_001_-_Accessing_the_API_18.1748619452060.png)

## The Complete Picture 全景

整个过程——从用户输入,经过分词、嵌入、上下文化、生成,再回到用户——在几秒内完成。理解这条链路能让你的应用更健壮,出问题时也知道该往哪查。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619452%2F03_-_001_-_Accessing_the_API_19.1748619452534.png)

核心要点: 一定要用服务器做中间层; 理解文本生成是一个逐词迭代的过程; 关注响应里的元数据,用它来监控用量、理解模型行为。

对产品经理来说: 「Claude 不总是选概率最高的词」这一点,解释了为什么同一个提示词两次运行结果不一样。这不是 bug,是设计。所以做验收标准时,不能写「输出必须等于这段文字」,得写成「输出必须包含这几个要素」——评判方式要从字符串比对改成语义检查,这个思维转换是后面评估那几课的基础。
