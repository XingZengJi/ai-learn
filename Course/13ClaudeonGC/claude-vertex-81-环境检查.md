# Claude with Google Vertex - 81 Environment inspection 环境检查

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 81
> 课程: Claude with Google Vertex · 第 81 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

Claude 是**盲着操作**的——它需要能观察周围环境,才能理解自己动作的结果。这个概念叫**环境检查(environment inspection)**,是做出有效 AI 智能体的关键。

## Why Environment Inspection Matters 为什么它重要

想想 Claude 使用电脑工具时的视角。它点了一个按钮或输入了一段文字,界面变了,但它本身并不知道变成了什么样。点一下按钮可能是跳转到新页面,也可能是打开一个菜单。**看不到发生了什么,它就无法判断动作是否成功,也无法有效规划下一步。**

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621358%2F11_-_006_-_Environment_Inspection_00.1748621357911.png)

这就是为什么 Computer Use 工具在每次动作后都自动返回一张截图。Claude 用这些视觉快照理解环境的新状态,并评估自己完成任务的进度。

## Reading Before Writing 先读后写

同样的原则适用于文件操作。Claude 修改代码之前,得先了解文件里现有的内容。这看似显而易见,却是很多开发者做智能体时忽略的关键一步。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621359%2F11_-_006_-_Environment_Inspection_08.1748621359036.png)

这个例子里,Claude 先读了 `main.py` 的内容,理解当前结构之后,才安全地添加新路由。这一步检查避免了错误,也保证改动能和现有代码正确衔接。

## Practical Applications 实际应用

环境检查在复杂工作流中尤其有价值。设想一个做视频并发布到社交媒体的智能体,它可能需要:

- 用各种工具生成视频内容
- 验证输出质量和时长
- 检查音频与画面是否对齐
- 确认已成功发布到社交平台

## System Prompts for Inspection 用系统提示词引导检查

你可以通过系统提示词引导 Claude 去检查环境。对一个视频创作智能体,可以写上这类指令:

- 用 bash 工具运行 whisper.cpp 生成带时间戳的字幕文件,以验证对白位置
- 用 FFmpeg 按固定间隔从视频中抽取截图,确认画面质量
- 上传前检查文件大小和格式

这些检查步骤帮 Claude 尽早发现错误,确保最终输出符合预期。把环境检查内建进你的智能体,就能得到更可靠、能自我纠错、能从容处理意外结果的系统。

记住: **智能体的每一个动作,都应该跟上某种形式的验证或检查,来确认预期结果确实达成了。**

对产品经理来说: 「每个动作后都要验证」这条原则,直接决定了智能体功能的成本模型——**验证步骤会让工具调用次数大致翻倍**。这不是浪费,是可靠性的必要开销。评审技术方案时,如果看到一个智能体设计里只有「执行」没有「确认」,那它多半会在真实环境里频繁地「以为自己成功了」——这是智能体最难排查也最伤用户信任的一类故障。
