# Claude with Google Vertex - 67 MCP review MCP 回顾

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 67
> 课程: Claude with Google Vertex · 第 67 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

MCP 服务器搭完了,来回顾三个核心原语,搞清楚各自该用在什么时候。关键认知在于: **谁控制它,以及它在你的应用里承担什么职责**。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621244%2F09_-_011_-_MCP_Review_00.1748621244563.png)

## Tools: Model-Controlled 工具: 模型控制

工具完全由 Claude 控制。是 AI 模型决定何时调用这些函数,结果也由 Claude 直接用来完成任务。

**想给 Claude 增加能力时,用工具。** 比如你让 Claude 用 JavaScript 算 3 的平方根,它会自动决定使用 JavaScript 执行工具来给出准确答案。

## Resources: App-Controlled 资源: 应用控制

资源由**你的应用代码**控制。是你的应用决定何时取资源数据、怎么用它——通常用于 UI 呈现,或给对话补充上下文。

**需要把数据取到应用里时,用资源。** 常见例子:

- 填充 UI 里的自动补全选项
- 在把消息发给 Claude 之前给它补充上下文
- 展示可用文档或文件的列表

在本项目里,我们用资源来取自动补全建议,以及给提示词补充额外上下文。

## Prompts: User-Controlled 提示词: 用户控制

提示词由**用户操作**触发。用户通过点按钮、选菜单、敲斜杠命令这类 UI 交互,决定何时运行这些预定义的工作流。

**想给用户提供按需触发的工作流时,用提示词。** 非常适合:

- 预设的对话开场
- 常见任务的模板
- 针对特定场景优化过的专门工作流

## Real-World Examples 现实中的例子

三个原语在 Claude 官方界面上都能看到。聊天输入框下方的对话开场按钮就是**提示词**——用户控制的、启动预定义交互的工作流。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621245%2F09_-_011_-_MCP_Review_13.1748621245385.png)

"Add from Google Drive" 那个选项展示的是**资源**。点击时,应用去取你的文档列表并显示在界面上——这是服务于界面的、应用控制的行为。

当你让 Claude 做计算或执行代码时,你看到的是**工具**在起作用。Claude 自动决定使用 JavaScript 执行之类的可用工具来给出准确结果。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621246%2F09_-_011_-_MCP_Review_17.1748621245824.png)

## Choosing the Right Primitive 怎么选

一个快速决策指南:

- 需要**扩展 Claude 的能力**? → 用**工具**
- 需要**给应用的 UI 或上下文提供数据**? → 用**资源**
- 想**给用户提供预定义工作流**? → 用**提示词**

记住这些是高层指引,帮你为具体需求挑对方式。三个原语服务于应用生态的不同部分: **工具服务模型,资源服务应用,提示词服务用户。**

对产品经理来说: 「工具服务模型、资源服务应用、提示词服务用户」这句话,是这门课里最值得记住的一句。它给了你一个现成的框架去拆解任何 AI 功能需求: 先问这件事该由谁发起——模型自主判断、应用逻辑决定、还是用户明确点击。这三个答案对应三种截然不同的实现方式、成本结构和体验设计。需求评审时先把这一层问清楚,后面的分歧会少很多。
