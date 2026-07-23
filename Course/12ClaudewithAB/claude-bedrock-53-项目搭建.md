# Claude with AWS Bedrock - 53 Project setup 项目搭建

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 53
> 课程: Claude with AWS Bedrock · 第 53 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

接下来要自己动手做一个基于命令行的聊天机器人,借此理解 MCP 客户端与服务器是怎么协同工作的。这个实操项目会让你同时体验 MCP 架构的两侧。

## What We're Building 要做的东西

这个聊天机器人是一个命令行界面,允许用户与一批文档对话。系统包含:

- 一个 CLI 聊天机器人界面
- 让 Claude 具备读取和编辑文档的能力
- 用 `@doc_name` 语法「提及」文档的功能
- 用 `/command_name` 语法执行命令
- 一批存在内存里的假文档

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559636%2F11_-_003_-_Project_Setup_00.1748559636228.png)

## System Architecture 系统架构

项目由三个主要部分组成:

- **我们的 MCP 客户端** —— 处理用户交互和聊天界面
- **我们的 MCP 服务器** —— 提供文档操作类工具
- **文档存储** —— 内存中的一批不同类型文件

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559636%2F11_-_003_-_Project_Setup_04.1748559636686.png)

MCP 服务器会实现两个核心工具: 一个读取文档内容,一个更新文档内容。

所有文档(PDF、表格、文本文件、markdown 文件)都存在内存里而不落盘,这样项目更简单,注意力可以集中在 MCP 概念本身上。

## Important Architecture Note 一个重要的架构提示

在真实项目里,你通常只会实现 MCP 客户端**或**服务器中的一个,而不是两个都做。常见的两种情况:

- 做一个 MCP 服务器,把某项服务分发给其他开发者用
- 做一个 MCP 客户端,去连接已有的第三方 MCP 服务器

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559637%2F11_-_003_-_Project_Setup_06.1748559637087.png)

本项目在同一个代码库里同时实现两侧,纯粹是出于教学目的,好让你看清客户端与服务器是怎么互动的。

对产品经理来说: 这条提示值得记住。真实工作中判断「我们该做哪一侧」,取决于你是在**提供能力**还是**消费能力**: 如果公司有独特的内部系统想开放给用 Claude 的团队用,那是做服务器; 如果只是想让自家产品用上现成的 GitHub / Jira 能力,那是做客户端。两边都做通常意味着需求没想清楚。
