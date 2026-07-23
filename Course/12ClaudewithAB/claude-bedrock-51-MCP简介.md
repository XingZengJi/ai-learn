# Claude with AWS Bedrock - 51 Introducing MCP MCP 简介

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 51
> 课程: Claude with AWS Bedrock · 第 51 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

模型上下文协议(Model Context Protocol, MCP)是一个通信层,它给 Claude 提供上下文和工具,而不需要你自己写一大堆繁琐的集成代码。与其把每个工具函数都亲手实现一遍,MCP 把这份负担转移给了专门的服务器,由它们去干重活。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559635%2F11_-_001_-_Introducing_MCP_01.1748559635516.png)

第一次接触 MCP 时,你会看到这样的架构图: 一个 MCP 客户端(也就是你的服务器)连接到若干 MCP 服务器,这些服务器里装着工具(tools)、提示词(prompts)和资源(resources)。每个 MCP 服务器都相当于一个对外服务的接口层,对接的可能是 GitHub、AWS 或者数据库。

## The Problem MCP Solves MCP 解决的问题

假设你要做一个聊天界面,让用户能问 Claude 关于自己 GitHub 数据的问题——比如「我所有仓库里有哪些未合并的 PR?」。如果不用 MCP,你得为每一个想支持的 GitHub 操作单独造一个工具。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559636%2F11_-_001_-_Introducing_MCP_03.1748559636106.png)

GitHub 的功能面极大: 仓库、Pull Request、Issue、Projects,还有一大堆。做一个完整的 GitHub 集成,意味着你要写数量惊人的工具 schema 和工具函数——而这些代码你都得自己写、自己测、自己长期维护。MCP 就是为此而生的。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559636%2F11_-_001_-_Introducing_MCP_05.1748559636704.png)

对产品经理来说: 这就像每接一个新的第三方系统,你的团队都要从零写一遍对接层。MCP 相当于对方厂商把「标准接线盒」做好了直接给你,你插上就能用,不用自己按每个接口重新焊一遍线。

## How MCP Works MCP 的运作方式

MCP 把工具定义和工具执行的负担,从你的服务器转移到了专门的 MCP 服务器上。你不用自己写那一堆 GitHub 工具,而是连上一个已经实现好这些工具的 GitHub MCP 服务器。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559637%2F11_-_001_-_Introducing_MCP_08.1748559637200.png)

MCP 服务器扮演的是外部服务的包装层,提供预先做好的工具供 Claude 调用。你不写一行集成代码,就拿到了这些能力。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559637%2F11_-_001_-_Introducing_MCP_09.1748559637601.png)

## Common Questions 常见问题

**MCP 服务器由谁来写?**

任何人都可以写一个 MCP 服务器实现。通常服务提供方自己就会出官方版本——比如 AWS 可能发布一个官方 MCP 服务器,里面带着他们各项服务的工具。

**这和直接调 API 有什么区别?**

直接调某个服务的 API,你依然要自己写工具 schema 和函数实现。MCP 服务器则是把这些 schema 和函数**都替你定义好了**,省下的是开发时间。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559638%2F11_-_001_-_Introducing_MCP_12.1748559637997.png)

**MCP 是不是就是工具使用(tool use)换个说法?**

这是个常见误解。MCP 服务器和工具使用是**互补但不同**的两个概念: 工具使用讲的是「Claude 调用函数来完成任务」; MCP 讲的是「这些函数由谁提供」——不是你写的,而是别人已经在 MCP 服务器里实现好了。

关键区别在于: MCP 服务器把工具 schema 和函数现成地给你,而直接用工具使用则要你自己从头写全部内容。两者都是 Claude 在用工具,但 MCP 大幅压缩了你这一侧的开发量。
