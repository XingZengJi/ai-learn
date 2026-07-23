# Claude with Google Vertex - 29 Project overview 项目概览

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 29
> 课程: Claude with Google Vertex · 第 29 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

接下来要做一个实际项目: 教 Claude 为未来的日期设置提醒。听起来简单,但它暴露出好几个有意思的难题,我们会用自定义工具来解决。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619691%2F06_-_002_-_Project_Overview_00.1748619691746.png)

目标是实现这样的对话: 你说 "Set a reminder for my doctor's appointment. It's a week from Thursday",Claude 回 "OK, I will remind you."。要做到这一点,先得搞清楚为什么这件事比看上去难。

## Why This Is Challenging 难在哪里

Claude 对日期和时间有一些内建知识,但也有明显的局限:

- Claude 可能知道当前日期,但**不知道确切时间**
- Claude 并不总能正确处理时间加减,尤其是往后推很多天时
- **Claude 根本不会设置提醒!**

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619692%2F06_-_002_-_Project_Overview_08.1748619692245.png)

这些局限意味着,连「设一个 24 小时后的提醒」这么简单的请求都会出问题。不知道当前时间,Claude 就不知道「24 小时后」到底指哪一刻; 就算它能算对日期,它也没有任何机制去真正创建一个提醒。

## Tools We Need 我们需要的工具

为解决这些问题,我们要做三个协同工作的自定义工具:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619693%2F06_-_002_-_Project_Overview_17.1748619693561.png)

### Get the Current Date Time 获取当前日期时间

这是我们的起点工具——让 Claude 能拿到当前日期和确切时间,解决「它不知道『现在』是什么时候」的问题。

### Add Duration to Date Time 给日期时间加上时长

这个工具负责「日期加上一段时间」的计算。与其指望 Claude 正确算出「1973 年 1 月 13 日往后 379 天是哪天」,不如给它一个能准确完成这类计算的可靠工具。

### Set a Reminder 设置提醒

最后,得让 Claude 有办法真正创建提醒。这个工具提供 Claude 所缺失的、设置未来通知的机制。

我们会一个一个地实现这些工具,先从日期时间工具入手来理解工具调用是怎么运作的,再逐步搭建更复杂的功能。做完之后,Claude 就能处理关于设置提醒的自然语言请求,并把它转换成真正的定时通知。

对产品经理来说: 这个项目挑得很妙——它把「模型不擅长什么」拆成了三类,而每一类的解法都是同一个: **给它工具,而不是给它更多提示词**。当你发现某个 AI 功能反复出错时,先判断错误属于哪一类: 是「不知道」(缺信息)、「算不准」(缺确定性计算)、还是「做不到」(缺执行能力)。这三类都不是靠改提示词能解决的,识别出来就能少走很多弯路。
