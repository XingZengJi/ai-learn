# Claude Platform 101 - 01 What is the Claude Platform? 什么是 Claude 平台

> Course: Claude Platform 101 · Lesson 1 · 章节: What is the Claude Platform?
> 课程: Claude Platform 101(Claude 开发者平台入门)· 第 1 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文整理翻译,2026-07-24

## 平台是什么

Claude Platform 是 Anthropic 提供的**以编程方式使用 Claude** 的基础设施。区别于在浏览器里聊天,你从代码里发出**结构化请求**、拿回**结构化响应**,并且对每个细节都有控制权: **用哪个模型、花多少 token、Claude 能用哪些工具、遵循什么系统指令。**

平台由几块组成:

- **REST API** —— 任何语言都能调
- **各语言的 SDK**
- **命令行工具(CLI)**
- **Console 控制台** —— 管理 API 密钥、监控用量、部署托管智能体、测试提示词

## 平台的三层结构

![平台三层结构](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966774%2F01-what-is-the-claude-developer-platform_07.1780966773806.png)

把平台想象成叠起来的三层:

| 层 | 是什么 | 包含 |
|---|---|---|
| **Primitives 原语** | 针对 Claude 调优的 API 积木,**你代码里实际调用的东西** | Messages API、工具使用、文件、网络搜索、代码执行、MCP 服务器、Skills |
| **Infrastructure 基础设施** | 把智能体系统**从原型推到规模化**所需要的东西 | 托管智能体、重试、队列、可观测性 |
| **Controls 控制** | 系统上线后**运营用的旋钮** | 仪表盘、评估(evals) |

> **一句话记法: build with primitives, scale on infrastructure, run with control**(用原语构建,在基础设施上扩展,用控制层运营)。

这个结构在 Claude Console 里能直接看到——控制台正是基础设施层与控制层所在的地方,分别有构建、管理智能体、分析几块。

## 一个真实例子: 帮客服工单起草回复

![客服工单场景](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966774%2F01-what-is-the-claude-developer-platform_08.1780966774521.png)

假设你维护一个客服工单系统,现在要加一个功能: **根据工单内容起草回复,并遵循团队的语气与规范**,挂在界面的一个按钮上。

这是 **Messages API** 的典型场景,流程是:

1. 定义一个 client
2. 取出对话所指的那张工单
3. 调用 `messages.create`
4. 把响应返回给按钮去渲染

```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-haiku-4-5",   # Haiku:适合这种简单的起草任务
    max_tokens=1024,
    system=TONE_AND_GUIDELINES,
    messages=[
        {"role": "user", "content": ticket_content}
    ],
)

draft = response.content
```

每个参数各司其职:

- **`model`** —— 谁来处理这个请求。这里用 **Haiku**,因为起草回复是件简单事
- **`max_tokens`** —— 限制 Claude 回复的长度上限
- **`system`** —— 系统提示词,**定义 Claude 扮演的角色**,团队的语气与规范放这里
- **`messages`** —— 对象数组,`user` 角色表示这是用户输入,工单内容放在这里

![调用结果](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966775%2F01-what-is-the-claude-developer-platform_13.1780966774955.png)

## 从「问 Claude 一个问题」到「Claude 是我产品的一部分」

注意上面例子里发生了什么: **你不是从零做一个聊天机器人,而是把 Claude 加进一个已经存在的产品里**,而 API 就是接线的方式。

这就是核心思想。**当你的产品需要智能体时,平台不只是把模型交给你——通过托管智能体,它还替你把智能体跑起来。**

## Recap 本课要点

- Claude Platform 是以编程方式使用 Claude 的基础设施: **REST API、SDK、CLI,加一个管密钥/用量/托管智能体/提示词测试的控制台**
- 三层: **原语**(Messages API、工具使用、文件、网络搜索、代码执行、MCP、Skills)、**基础设施**(托管智能体、重试、队列、可观测性)、**控制**(仪表盘、评估)
- **一次 `messages.create` 调用**就给了你对模型、响应长度、系统提示词、用户输入的完整控制,足以把 Claude 接进一个已有功能

## 对产品经理来说

**「三层」这个划分对做技术选型判断很有用**,因为它把「用 AI」这件事拆成了三个不同性质的决策:

- **原语层是功能问题** —— 我这个需求要用哪几块积木
- **基础设施层是规模问题** —— 一次调用变一千次时会怎样
- **控制层是运营问题** —— 上线后我怎么知道它还好用

**大多数团队只在第一层做决策就开工了**,结果在第二层撞墙(没有重试、没有队列、没有可观测性)。这门课把托管智能体放在很靠后的位置,但从第 1 课就开始铺垫,正是因为**第二层的问题不是可选项,只是被推迟了。**

另一处值得留意: 例子里选的是 **Haiku 而不是最强的模型**,并且明确写了理由「起草回复是件简单事」。**这个默认姿态贯穿全课**——第 3 课会把它变成一套方法。

---

*原课程 © Anthropic,本篇为中文整理存档,供个人学习使用。*
