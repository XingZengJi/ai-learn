# Building with the Claude API - 61 Prompts in the client 客户端里的提示词

> Course: Building with the Claude API · Lesson 61
> 课程: Building with the Claude API · 第 61 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

MCP 里的提示词,定义了一组能被客户端使用的用户消息和 assistant 消息。这些提示词应该是高质量、经过充分测试、并且和 MCP 服务器的整体目的相关的。

## 实现 List Prompts

第一步,是在你的 MCP 客户端里实现 `list_prompts` 方法。这个方法从服务器获取所有可用的提示词:

```python
async def list_prompts(self) -> list[types.Prompt]:
    result = await self.session().list_prompts()
    return result.prompts
```

这个实现很简单——调用会话的 `list_prompts` 方法,再从结果里返回 prompts 数组。

## 获取单个提示词

`get_prompt` 方法获取一个特定的提示词,并把参数插值进去。当你请求一个提示词时,你提供的参数会作为关键字参数传给提示词函数:

```python
async def get_prompt(self, prompt_name, args: dict[str, str]):
    result = await self.session().get_prompt(prompt_name, args)
    return result.messages
```

这个方法返回结果里的 `messages`,它们构成了一段可以直接喂给 Claude 的对话。

## 提示词参数是如何运作的

当你在服务器端定义一个提示词函数时,它可以接受参数。比如,一个文档格式化的提示词可能会期望一个 `doc_id` 参数:

```python
def format_document(doc_id: str):
    # doc_id 会被插值进提示词里
```

当客户端调用 `get_prompt` 时,传入的 `args` 字典应该包含预期的键。MCP 服务器会把这些参数作为关键字参数传给提示词函数,从而让动态内容能被插入到提示词模板里。

## 在 CLI 里测试提示词

实现完成后,你可以通过命令行界面来测试提示词。输入一个斜杠(`/`)时,可用的提示词会作为命令出现。选择一个提示词后,系统可能会让你从可用选项里选(比如选择文档 ID),然后完整的提示词就会被发给 Claude。

整个流程是这样的:

1. 用户选择一个提示词(比如「format」)
2. 系统提示用户输入所需的参数(比如要格式化哪份文档)
3. 提示词连同插值后的内容一起发给 Claude
4. Claude 接着可以用工具去获取更多数据,完成任务

## 提示词最佳实践

搭建 MCP 服务器的提示词时:

- 确保它们和你服务器的目的相关
- 部署前要充分测试
- 用清晰、具体的指令
- 设计时要考虑和你现有工具的配合
- 想清楚用户需要提供哪些参数

提示词功能在「预先定义好的功能」和「用户动态变化的需求」之间架起了一座桥梁——它给 Claude 提供了处理复杂任务的结构化起点,同时通过参数化保留了足够的灵活性。

---

对产品经理来说,MCP 提示词功能里「参数化」这个设计很值得留意:它既不是「完全固定死的模板」(没有灵活性),也不是「让用户从零现写」(没有质量保证),而是介于两者之间——固定住经过验证的「好方法」,只留出真正需要因场景而变的「变量」(比如具体是哪份文档)让用户填。这是设计任何「半自动化工具」时都通用的一条思路。
