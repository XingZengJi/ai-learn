# MCP - 1 Sampling 采样

> Course: MCP(Model Context Protocol,模型上下文协议)深入课程 · Lesson 1
> 课程: MCP 深入课程 · 第 1 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Sampling allows a server to access a language model like Claude through a connected MCP client. Instead of the server directly calling Claude, it asks the client to make the call on its behalf. This shifts the responsibility and cost of text generation from the server to the client.

> 采样(Sampling)允许 MCP 服务器通过与之连接的 MCP 客户端,来访问 Claude 这样的大语言模型。服务器不直接调用 Claude,而是请求客户端代替自己发起这次调用。这就把「生成文本」这件事的责任和成本,从服务器转移到了客户端身上。

对产品经理来说,可以把这个关系类比成:服务器是「乙方」,客户端是「甲方」。乙方原本可以自己花钱请一个文案(直接接 Claude API),但更省事的做法是,乙方把写作需求整理好,让甲方(已经有文案资源、也就是已经接了 Claude)去调用文案、把稿子写出来再交回来——这样乙方就不用自己养文案团队,也不用自己出这笔钱。

### The Problem Sampling Solves 采样要解决的问题

Imagine you have an MCP server with a research tool that fetches information from Wikipedia. After gathering all that data, you need to summarize it into a coherent report. You have two options:

> 假设你有一个 MCP 服务器,里面有一个从维基百科抓取信息的调研工具。抓到一堆数据之后,你还需要把它们总结成一份条理清晰的报告。这时你有两个选择:

**Option 1: Give the MCP server direct access to Claude.** The server would need its own API key, handle authentication, manage costs, and implement all the Claude integration code. This works but adds significant complexity.

> **选项一:让 MCP 服务器直接访问 Claude。** 服务器需要拥有自己的 API 密钥,自己处理身份验证、自己管理费用支出,并且要自己实现所有与 Claude 对接的代码。这样做行得通,但会带来相当大的复杂度。

**Option 2: Use sampling.** The server generates a prompt and asks the client "Could you call Claude for me?" The client, which already has a connection to Claude, makes the call and returns the results.

> **选项二:使用采样。** 服务器生成一段提示词,然后问客户端:「能帮我调用一下 Claude 吗?」客户端本来就已经和 Claude 建立了连接,于是替服务器发起调用,并把结果返回给服务器。

### How Sampling Works 采样的工作原理

The flow is straightforward:

> 整个流程很直接:

1. Server completes its work (like fetching Wikipedia articles). 服务器先完成自己的工作(比如抓取维基百科文章)。
2. Server creates a prompt asking for text generation. 服务器生成一段用于文本生成的提示词。
3. Server sends a sampling request to the client. 服务器向客户端发送一个采样请求。
4. Client calls Claude with the provided prompt. 客户端拿着这段提示词去调用 Claude。
5. Client returns the generated text to the server. 客户端把生成的文本返回给服务器。
6. Server uses the generated text in its response. 服务器把生成的文本用在自己的响应结果里。

### Benefits of Sampling 采样的好处

- **Reduces server complexity:** The server doesn't need to integrate with language models directly.

  **降低服务器复杂度:** 服务器不需要直接对接大语言模型。

- **Shifts cost burden:** The client pays for token usage, not the server.

  **转移成本负担:** 为 token 用量付费的是客户端,而不是服务器。

- **No API keys needed:** The server doesn't need credentials for Claude.

  **无需 API 密钥:** 服务器不需要持有 Claude 的访问凭证。

- **Perfect for public servers:** You don't want a public server racking up AI costs for every user.

  **特别适合公开服务器:** 你肯定不希望一个公开服务器要为每一个用户的 AI 调用买单。

## Implementation 实现方式

Setting up sampling requires code on both sides:

> 要搭建起采样机制,客户端和服务器两边都需要写代码:

### Server Side 服务器端

In your tool function, use the `create_message` function to request text generation:

> 在你的工具函数里,使用 `create_message` 函数来发起文本生成请求:

```python
@mcp.tool()
async def summarize(text_to_summarize: str, ctx: Context):
    prompt = f"""
    Please summarize the following text:
    {text_to_summarize}
    """
    
    result = await ctx.session.create_message(
        messages=[
            SamplingMessage(
                role="user",
                content=TextContent(
                    type="text",
                    text=prompt
                )
            )
        ],
        max_tokens=4000,
        system_prompt="You are a helpful research assistant",
    )
    
    if result.content.type == "text":
        return result.content.text
    else:
        raise ValueError("Sampling failed")
```

### Client Side 客户端

Create a sampling callback that handles the server's requests:

> 创建一个采样回调函数,用来处理服务器发来的请求:

```python
async def sampling_callback(
    context: RequestContext, params: CreateMessageRequestParams
):
    # Call Claude using the Anthropic SDK
    text = await chat(params.messages)
    
    return CreateMessageResult(
        role="assistant",
        model=model,
        content=TextContent(type="text", text=text),
    )
```

Then pass this callback when initializing your client session:

> 然后在初始化客户端会话时传入这个回调函数:

```python
async with ClientSession(
    read,
    write,
    sampling_callback=sampling_callback
) as session:
    await session.initialize()
```

## When to Use Sampling 什么时候该用采样

Sampling is most valuable when building publicly accessible MCP servers. You don't want random users generating unlimited text at your expense. By using sampling, each client pays for their own AI usage while still benefiting from your server's functionality.

> 在构建面向公众开放的 MCP 服务器时,采样最有价值。你肯定不希望任何陌生用户都能无限量地生成文本、账单却算在你头上。通过采样,每个客户端为自己的 AI 用量付费,同时仍然能享受到你服务器提供的功能。

The technique essentially moves the AI integration complexity from your server to the client, which often already has the necessary connections and credentials in place.

> 从本质上说,这项技术把「对接 AI」的复杂度从服务器转移到了客户端——而客户端往往已经具备了必要的连接和凭证。
