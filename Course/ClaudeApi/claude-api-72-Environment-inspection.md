# Building with the Claude API - 72 Environment inspection 环境检视

> Course: Building with the Claude API · Lesson 72
> 课程: Building with the Claude API · 第 72 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

搭建 AI 智能体时,有一个至关重要、却常常被忽视的概念:环境检视(environment inspection)。Claude 本质上是「盲目」地在操作——它需要能够观察并理解自己行动的结果,才能有效地工作。

## 为什么环境检视很重要

想想 Claude 在使用 Computer Use 时是怎么运作的。每次 Claude 执行一个动作,比如输入文字或点击按钮,它会立刻收到一张截图,以此理解发生了什么。这不只是一个「有更好」的附加功能——它是必需的。

从 Claude 的视角看,点击一个按钮可能会跳转到新页面、打开一个菜单,或触发任何数量的变化。如果没办法看到结果,Claude 完全没有办法知道自己的操作是否成功,也不知道环境现在变成了什么状态。

## 写之前先读

同样的原则也适用于文件操作。在 Claude 修改任何文件之前,它需要先理解文件当前的内容。这看起来是显而易见的道理,但这是你搭建智能体时应该始终遵循的模式。

在这个例子里,当被要求给一个 Python 文件添加新的路由时,Claude 会先读取现有代码,理解当前的结构。只有这样,它才能在不破坏现有功能的前提下,安全地做出所要求的改动。

## 用系统提示词引导环境检视

你可以通过系统提示词,引导 Claude 去检视自己所处的环境。对于视频生成这类复杂任务,这一点尤其重要。

设想一个需要做以下事情的视频创作智能体:

- 用 FFmpeg 这类工具生成视频内容
- 验证音频对白是否被正确放置
- 检查视觉元素是否如预期般呈现

你可以在系统提示词里加入这样的指令:

```
Use the bash tool to run whisper.cpp and generate caption files with timestamps to verify dialogue placement
Use FFmpeg to extract screenshots from the video at regular intervals to visually inspect the output
Compare the generated content against the original requirements
```

## 环境检视带来的好处

当 Claude 能够检视自己所处的环境时,几件事会得到改善:

- **更好的进度追踪** —— Claude 能判断自己离完成任务还有多远
- **错误处理** —— 意外的结果能被发现并纠正
- **质量保证** —— 在认定任务完成之前,输出能先被验证
- **自适应行为** —— Claude 能根据观察到的情况调整自己的做法

## 实际实现

设计你自己的智能体时,始终要问自己:「Claude 要如何知道这个动作有没有生效?」不管你处理的是文件、API,还是用户界面,都要提供能让 Claude 观察到自己行动结果的工具和指令。

这可能意味着:

- 在修改之前先读取文件内容
- 在 UI 交互之后截图
- 检查 API 响应是否包含预期的数据
- 对照要求校验生成的内容

环境检视,把 Claude 从一个「盲目执行命令的工具」,转变成了一个真正能理解并适应自己工作环境的智能体。

---

对产品经理来说,「环境检视」这个概念可以类比成给员工「反馈闭环」——一个员工如果做完一件事完全不知道效果好不好(比如发了封邮件却不知道对方有没有收到、看没看),ta 就没办法判断下一步该怎么做、要不要补救。设计任何自动化系统时,「这一步做完之后,系统怎么知道做对了没有」应该是和「这一步该怎么做」同等重要的设计问题,而不是事后才想起来补的。
