# Claude with Google Vertex - 80 Agents and tools 智能体与工具

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 80
> 课程: Claude with Google Vertex · 第 80 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

智能体代表着与前面那些结构化工作流不同的思路。工作流在「你知道确切步骤」时最出色,智能体则在「前路不明」时才发光。你不再定义一套僵硬的顺序,而是给 Claude 一个目标和一套工具,让它自己想清楚怎么组合这些工具达成目标。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621361%2F11_-_005_-_Agents_and_Tools_00.1748621361086.png)

这种灵活性对开发者很有吸引力: 做一次智能体,确保它表现尚可,就能部署去处理各种各样的任务。但这条路在**可靠性和成本**上有明显的代价,后面会展开。

## How Tools Make the Agent 工具塑造智能体

智能体真正的威力在于它能以意想不到的方式组合简单工具。回看课程前面那套基础的日期时间工具:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621362%2F11_-_005_-_Agents_and_Tools_04.1748621362779.png)

- `get_current_datetime` —— 返回当前日期和时间
- `add_duration_to_datetime` —— 给某个日期加上一段时间
- `set_reminder` —— 为特定时间创建提醒

每个工具单看都很简单,但 Claude 能把它们组合起来应对各类请求:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621363%2F11_-_005_-_Agents_and_Tools_05.1748621363424.png)

问「现在几点?」,它只调 `get_current_datetime`。问「11 天后是星期几?」,它把 `get_current_datetime` 和 `add_duration_to_datetime` 串起来。更复杂的「下周三提醒我去健身房」则要按顺序用上全部三个工具。

Claude 甚至能意识到自己缺信息。被问「我的 90 天保修什么时候到期?」时,它会**先反问用户是什么时候获得保修的**,再用这个信息配合 `add_duration_to_datetime` 算出到期日。

## Tools Should Be Abstract 工具应当是抽象的

做出好用智能体的关键认知是: **提供适度抽象的工具,而不是高度专门化的工具**。Claude Code 把这个原则演绎得很到位。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621364%2F11_-_005_-_Agents_and_Tools_11.1748621364257.png)

Claude Code 拥有的是通用、灵活的工具:

- `bash` —— 执行命令
- `glob` —— 查找文件
- `grep` —— 搜索文件内容
- `read` —— 读文件
- `write` —— 建文件
- `edit` —— 改文件
- `webfetch` —— 抓取 URL

注意 Claude Code **没有**什么: 没有「重构」「跑测试」「装依赖」这类专门工具。它是靠组合这些基础工具来完成这些任务的。要装依赖,它先读项目文件搞清楚配置,再用 `bash` 跑对应的安装命令。

## Best Practice: Provide Reasonably Abstract Tools 最佳实践: 提供适度抽象的工具

做智能体时,重点放在「Claude 能创造性组合」的工具上,而不是「只解决一个具体问题」的工具。以一个社媒视频创作智能体为例:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621365%2F11_-_005_-_Agents_and_Tools_16.1748621364899.png)

有效的工具集可能是:

- `bash` —— 借此使用 FFMPEG 做视频处理
- `generate_image` —— 从文字提示生成图片
- `text_to_speech` —— 把文字转成语音
- `post_media` —— 发布内容到社交媒体

这套工具既能应付简单交互,也能应付复杂交互。用户可能说「做一个关于 Python 编程的视频并发布」,智能体全自动搞定。也可以是更协作的方式:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621366%2F11_-_005_-_Agents_and_Tools_19.1748621365896.png)

用户可能说「我想做个 Python 的视频,但先让我挑一张开场图」。智能体可以先生成一张样图给用户确认,通过后再继续做视频。

这种灵活性自然来自于**工具抽象层次拿捏得当**: 每个工具都要通用到能在多种场景下有用,又要具体到与其他工具组合时能完成有意义的工作。

对产品经理来说: 「Claude Code 没有『跑测试』这个工具」是个很反直觉但很重要的观察。产品直觉往往是「用户要做什么,就给什么按钮」,但对智能体恰恰相反——**给的能力越具体,它能做的事反而越少**。做智能体的能力设计时,该问的不是「用户要哪些功能」,而是「这些功能可以由哪几个基础动作组合出来」。
