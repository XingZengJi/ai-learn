# Claude Platform 101 - 07 Built-in tools 内置工具

> Course: Claude Platform 101 · Lesson 7 · 章节: Extending your Agent
> 课程: Claude Platform 101(Claude 开发者平台入门)· 第 7 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文整理翻译,2026-07-24

你可以自建工具,但**有些能力足够通用,Anthropic 直接做好了**。**你不写代码、不托管沙箱,只要声明这个工具,由 Anthropic 来跑。**

## Server tools: 你声明,Anthropic 执行

**Anthropic 提供在他们基础设施上运行的 server tools。你不执行,他们执行。** 这意味着**这类调用不需要智能体循环**——Claude 自己调用工具,**结果在同一个响应里返回。**

主要几个:

- **Web search 网络搜索** —— 搜索互联网并返回带引用来源的结果
- **Code execution 代码执行** —— 在沙箱里编写并运行 Python
- **Web fetch 网页抓取** —— 取回 URL 的完整内容

## 一个文件里用两个 server tool

```python
import anthropic

client = anthropic.Anthropic()

# 调用 1：网络搜索 —— Anthropic 在服务端执行搜索
search_response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    tools=[{"type": "web_search_20260209", "name": "web_search"}],
    messages=[
        {"role": "user", "content": "What is Anthropic's latest model release? Answer in one sentence."}
    ],
)

for block in search_response.content:
    if block.type == "server_tool_use":
        print(f"Tool call: {block.name} — {block.input}")
    elif block.type == "text":
        print(block.text)

# 调用 2：代码执行 —— Claude 在沙箱里编写并运行 Python
code_response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    tools=[{"type": "code_execution_20260120", "name": "code_execution"}],
    messages=[
        {"role": "user", "content": "Calculate the mean and standard deviation of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"}
    ],
)

for block in code_response.content:
    if block.type == "server_tool_use":
        print(f"Tool call: {block.name} — {block.input}")
    elif block.type == "bash_code_execution_tool_result":
        print(f"stdout: {block.content.stdout}")
    elif block.type == "text":
        print(block.text)
```

**两个要点:**

- **这里没有智能体循环。** 不用按 `stop_reason` 分支,不用把工具结果推回去——**Anthropic 在服务端跑完了工具,响应里已经包含结果**
- **响应里出现了新的块类型**: 工具调用是 `server_tool_use` 块,输出是代码执行结果块,外加常规的 `text` 块

**跑起来:** 网络搜索会打印出 Claude 的工具调用,然后是一句带搜索引用的答案;代码执行会显示 Claude 实际写的 Python、沙箱运行的 stdout,以及最终文本答案。

**我们没有搭搜索爬虫,也没有跑 Python 沙箱。声明两个工具,两样能力白拿。**

## 另一类: Client tools

![client tools](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966781%2F07-built-in-tools_10.1780966781037.png)

值得知道还有另一类。**Client tools 在你的代码所在的地方运行**,它们随 Claude SDK 提供,所以**你不必自己定义 schema**。两个例子:

- **Memory 记忆** —— Claude 跨会话读写记忆
- **Bash** —— 一个持久的 bash shell,让 Claude 能执行命令

**它们的形状和自定义工具一样,只是 SDK 替你给了 schema 和一个合理的 runner。**

## 为什么这在生产环境里重要

![生产环境](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966781%2F07-built-in-tools_12.1780966781570.png)

在真实应用里,**这是通往「否则要花几周才能做出的功能」的最短路径。** 网络搜索可以驱动一个事实核查接口,**把草稿里每一处数字与监管声明都对照实时网络验证一遍。**

> ⚠️ **一个提醒: 某样东西在互联网上被验证过,不代表它是真的。永远要复核 Claude 的工作。**

## Recap 本课要点

- **Server tools**(网络搜索、代码执行、网页抓取)在你的 `tools` 数组里声明,**由 Anthropic 执行**
- **结果在同一个响应里返回,不需要智能体循环。** 留意 `server_tool_use` 与工具结果块
- **Client tools**(记忆、bash)在你的代码处运行,**但 SDK 给了你 schema 和 runner**
- **「由 Anthropic 托管」这个思路可以一路放大: 托管智能体把它应用到整个智能体,而不只是一个工具**

## 对产品经理来说

**「不需要智能体循环」是这一课最实在的差别。** 前两课手写的那套 `while` + `stop_reason` 分支,在 server tools 这里完全消失了——**声明即用,结果直接在响应里。** 这意味着「给产品加联网搜索」的工作量,从「搭爬虫 + 处理循环」压缩到了「数组里加一行」。

**那句「几周的功能变成声明一个工具」值得警惕地正确理解**: 省掉的是**基础设施**,不是**产品设计**。搜索回来的结果怎么呈现、引用怎么展示、搜不到时怎么办、用户如何判断可信度——**这些一样都没少,而且现在成了工作量的主体。**

**课程自己给的那句警告尤其该记: 「在互联网上被验证过 ≠ 真的」。** 这和 `Course/20AIforB/` 讲的「辨别」是同一件事——**加了搜索的智能体看起来更权威,但权威感和准确性是两回事**,而用户会因为看到引用链接而降低戒心。**做事实核查类功能时,这是必须在设计层面处理的风险,不能指望模型自己解决。**

---

*原课程 © Anthropic,本篇为中文整理存档,供个人学习使用。*
