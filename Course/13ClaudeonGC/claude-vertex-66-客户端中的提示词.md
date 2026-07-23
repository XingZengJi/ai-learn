# Claude with Google Vertex - 66 Prompts in the client 客户端中的提示词

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 66
> 课程: Claude with Google Vertex · 第 66 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

搭建 MCP 客户端的最后一步是实现提示词功能: 列出服务器上全部可用的提示词,以及取回带变量插值的具体提示词。

## Implementing List Prompts 实现 list_prompts

这个方法很直接,调用 session 的 list prompts 方法并返回结果:

```python
async def list_prompts(self) -> list[types.Prompt]:
    result = await self.session().list_prompts()
    return result.prompts
```

## Getting Individual Prompts 取回单个提示词

`get_prompt` 方法更有意思,因为它要处理参数插值。请求某个提示词时,我们传入的参数会被注入提示词函数。比如服务器上有个 "format" 提示词需要 `doc_id` 参数,我们就在参数字典里提供这个值:

```python
async def get_prompt(self, prompt_name, args: dict[str, str]):
    result = await self.session().get_prompt(prompt_name, args)
    return result.messages
```

这个方法返回的消息构成一段可以直接喂给 Claude 的对话。

## How Prompt Arguments Work 提示词参数怎么工作

在 MCP 服务器里定义提示词函数时,它的任何参数都会变成可插值的变量。你传给 `get_prompt` 的参数字典为这些参数提供值,服务器随后生成把你的值代入相应位置后的完整提示词。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621239%2F09_-_010_-_Prompts_in_the_Client_04.1748621239421.png)

## Testing the Implementation 测试实现

实现完成后可以在 CLI 里测试。输入一个斜杠,可用的提示词会作为命令出现。选中 "format" 这类提示词后,系统会让你为必需参数选值(比如选一份要格式化的文档)。之后系统会:

1. 取回参数已插值的提示词
2. 把完整提示词发给 Claude
3. Claude 执行必要的工具调用来完成请求
4. 返回格式化后的结果

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621240%2F09_-_010_-_Prompts_in_the_Client_17.1748621240459.png)

## Prompts in Practice 实践中的提示词

提示词定义了一组可复用的 user 和 assistant 消息,供客户端调用。它们应当高质量、经过充分测试、与你 MCP 服务器的用途相关。可以把它们理解成**预制的工作流**,把服务器的工具和资源组合起来完成特定任务。

这套提示词机制在**提示词逻辑(定义在服务器上)** 与**执行(由客户端和 Claude 负责)** 之间划出了清晰的界线,让你能轻松创建用户一条简单命令即可触发的、复杂的多步工作流。
