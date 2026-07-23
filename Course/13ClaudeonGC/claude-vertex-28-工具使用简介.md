# Claude with Google Vertex - 28 Introducing tool use 工具使用简介

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 28
> 课程: Claude with Google Vertex · 第 28 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

工具(tools)让 Claude 能获取外部世界的信息,把能力扩展到训练数据之外。默认情况下,Claude 只知道训练数据里的信息,拿不到时事、实时数据或外部系统的内容。工具使用通过一套结构化的方式,让 Claude 能请求并接收新鲜信息,从而解决这个限制。

## The Problem Without Tools 没有工具时的问题

用户向 Claude 询问当前信息时,它会撞墙。比如有人问 "What's the weather in San Francisco, California?",Claude 只能回答「抱歉,我拿不到最新的天气信息」。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619646%2F06_-_001_-_Introducing_Tool_Use_05.1748619646201.png)

当用户需要的实时数据其实是 Claude「只要拿得到就能帮上忙」的东西时,这种体验相当挫败。

## How Tool Use Works 工具使用怎么工作

工具使用在你的应用与 Claude 之间遵循一种特定的来回模式。完整流程:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619646%2F06_-_001_-_Introducing_Tool_Use_07.1748619646784.png)

1. **初始请求** —— 你把问题连同「如何从外部来源获取额外数据」的说明一起发给 Claude
2. **工具请求** —— Claude 分析问题,判断需要额外信息,然后明确说出它要什么数据
3. **数据获取** —— 你的服务器执行代码,从外部 API 或数据库取回所需信息
4. **最终回复** —— 你把取到的数据发回给 Claude,它结合原始问题和新鲜数据生成完整回复

## Weather Example in Practice 天气例子的实际过程

用天气这个问题走一遍,过程会具体很多:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619647%2F06_-_001_-_Introducing_Tool_Use_14.1748619647322.png)

用户询问当前天气时,你在提示词里附上「如何获取天气数据」的说明。Claude 意识到自己需要当前信息,于是请求某个具体地点的天气数据。你的服务器调用天气 API 拿到实时状况,把数据发回给 Claude。最后,Claude 把新鲜的天气数据与用户的问题结合,给出准确的、当下的回答。

## Key Benefits 主要收益

- **实时信息** —— 访问 Claude 训练时不存在的当前数据
- **外部系统集成** —— 把 Claude 连到数据库、API 和其他服务
- **动态回复** —— 基于能拿到的最新信息作答
- **结构化交互** —— Claude 明确知道自己需要什么信息、该怎么开口要

工具使用把 Claude 从一个静态知识库变成了能处理实时数据、能对接外部系统的动态助手。这为「既需要 AI 推理、又需要当前信息」的应用打开了空间。

对产品经理来说: 有一个流程细节值得注意——**执行工具的是你的服务器,不是 Claude**。Claude 只是发出「我要旧金山的天气」这个请求,真正去调 API 的是你的代码。这意味着权限、限流、审计、数据脱敏这些控制点全都在你手里。谈 AI 功能的安全边界时,这是最重要的一句话。
