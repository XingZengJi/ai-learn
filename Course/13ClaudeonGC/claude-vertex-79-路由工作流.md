# Claude with Google Vertex - 79 Routing workflows 路由工作流

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 79
> 课程: Claude with Google Vertex · 第 79 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

做 AI 应用时,不同类型的用户请求往往需要不同的处理方式。**路由工作流**的解法是: 先对用户输入分类,再把它导向专门的处理流水线。

## The Problem with One-Size-Fits-All Prompts 通用提示词的问题

设想一个从用户给的话题生成视频脚本的社媒营销工具。有人输入 "programming",有人输入 "surfing",你想要的输出差别很大:

- **编程话题** —— 教学型脚本: 清晰的定义、示例、结构化讲解
- **冲浪话题** —— 娱乐型脚本: 抓人的开场钩子、潮流化的措辞,而不是技术定义

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621308%2F11_-_004_-_Routing_Workflows_02.1748621308227.png)

两者用同一个通用提示词,只会得到不上不下、跟内容天然风格对不上的结果。

## Setting Up Content Categories 设定内容分类

先定义你的应用可能需要处理的内容类型。做视频脚本的话,分类可以是:

- 娱乐(Entertainment)
- 教学(Educational)
- 喜剧(Comedy)
- 个人 Vlog
- 测评(Reviews)
- 讲故事(Storytelling)

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621309%2F11_-_004_-_Routing_Workflows_07.1748621309328.png)

## Creating Specialized Prompts 为每类写专门的提示词

为每个分类写一个能抓住对应语气和处理方式的专门提示词。教学类和娱乐类的提示词会有明显差异。

## The Two-Step Process 两步流程

路由工作流用两次独立的 Claude 调用:

### Step 1: Categorization 第一步: 分类

把用户话题连同一个分类提示词发给 Claude,让它判断内容类型。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621310%2F11_-_004_-_Routing_Workflows_13.1748621310166.png)

比如 "Python functions" 大概率会被归为 "Educational"。

### Step 2: Specialized Processing 第二步: 专门处理

根据 Claude 给出的分类,用对应的专门提示词生成实际内容。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621311%2F11_-_004_-_Routing_Workflows_15.1748621310784.png)

## Routing Workflow Architecture 路由工作流的架构

通用模式长这样:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621311%2F11_-_004_-_Routing_Workflows_17.1748621311460.png)

1. 用户提供输入
2. 路由器(通常是 Claude)对请求分类
3. 输入被转发到**恰好一条**专门流水线
4. 每条流水线有自己的工作流、提示词或工具

## Key Benefits 主要收益

- **输出质量更好** —— 每个分类用的都是为该场景设计的提示词
- **工具专门化** —— 不同分类可以用不同的 API、数据库或处理步骤
- **易于扩展** —— 加新分类不影响已有分类
- **成本高效** —— 只跑真正需要的那部分处理

## When to Use Routing 什么时候用路由

路由工作流最适合这些情况:

- 你的应用要处理明显不同类型的请求
- 不同类型的请求需要不同的处理方式
- 你愿意为质量牺牲一些简洁性
- 你能清晰地定义出 **3–10 个**有意义的分类

前期搭多条专门流水线是有复杂度成本的,但相比用一个通用方案处理一切,回报是结果质量的显著提升。

对产品经理来说: 注意「3–10 个分类」这个建议区间。少于 3 个说明差异不足以支撑路由,不如直接合并; 多于 10 个则分类本身容易出错,而且**路由错了后面全错**——这是路由工作流最大的失败点。设计分类体系时,宁可粗一点、边界清晰一点,也别追求穷尽。
