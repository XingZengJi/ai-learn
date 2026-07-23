# Claude with AWS Bedrock - 60 Prompts in the client 客户端中的提示词

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 60
> 课程: Claude with AWS Bedrock · 第 60 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

搭建 MCP 客户端的最后一步是实现提示词功能: 列出服务器提供的全部提示词,以及取出某条具体提示词(变量已插值好)。

## Implementing List Prompts 实现列出提示词

`list_prompts` 方法很直接,调用会话的对应方法并返回结果:

```python
async def list_prompts(self) -> list[types.Prompt]:
    result = await self.session().list_prompts()
    return result.prompts
```

## Getting Individual Prompts 取出单条提示词

`get_prompt` 更有意思,因为它要处理参数插值。请求某条提示词时,我们传入的参数会被注入到提示词函数里。比如服务器上有个 `format` 提示词需要 `doc_id` 参数,那这个值就会被传进去、插进实际的提示词文本中。

```python
async def get_prompt(self, prompt_name, args: dict[str, str]):
    result = await self.session().get_prompt(prompt_name, args)
    return result.messages
```

方法返回的是一组消息,构成一段可以直接喂给 Claude 的对话。

## Testing Prompts in Action 实际测试

运行客户端后输入一个斜杠,可用的提示词就会以命令形式列出来。选中像 `format` 这样的提示词后,系统会让你从可用文档中挑一个。随后:

1. 取出插好文档 ID 的提示词
2. 作为 user 消息直接喂给 Claude
3. Claude 同时收到指令和文档 ID
4. Claude 用可用工具去取文档内容
5. Claude 返回重排后的结果

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559732%2F11_-_010_-_Prompts_in_the_Client_10.1748559731797.png)

## How Prompts Work 提示词的运作方式

提示词定义的是一组可供客户端使用的 user 与 assistant 消息。这些提示词应当质量过硬、经过充分测试,并且与你 MCP 服务器的整体用途相关。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559732%2F11_-_010_-_Prompts_in_the_Client_17.1748559732285.png)

完整工作流:

1. 写一条与你 MCP 服务器用途相关的提示词,并做评估
2. 用 `@mcp.prompt` 装饰器把它定义在 MCP 服务器里
3. 客户端可随时请求这条提示词
4. 请求时传入参数,它们会作为关键字参数传给提示词函数
5. 函数用这些参数定制提示词内容

这套机制产出的是可复用、可传参的提示词,能在不同客户端和场景间共享,让 MCP 服务器更通用也更有威力。

对产品经理来说: 注意第 1 步——「写完要做评估」。这和第 12–17 课讲的评估工作流是同一件事。提示词一旦作为服务器功能对外分发,它就不再是某个人的临时输入,而是一个有版本、有质量要求、改动会影响所有下游用户的**产品资产**。
