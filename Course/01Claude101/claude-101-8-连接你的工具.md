# Claude 101 - 8 Connecting Your Tools 连接你的工具

> 课程: Claude 101 · 第三章「扩展 Claude 的覆盖范围」第 1 课(全课程第 8 课)
> 预计用时: 20 分钟
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 翻译存档

## 学习目标

学完本课后,你将能够:

- 解释什么是连接器(connectors),以及它们对你使用 Claude 的工作为何重要
- 浏览连接器目录,并设置你的第一个连接
- 在与 Claude 的对话中有效使用已连接的工具

## 什么是连接器?

### 关键要点

- 连接器让 Claude 从一个助手转变为真正了解情况的协作者,让 Claude 能够访问你每天使用的那些工具、数据和背景信息。Claude 不必每次对话都从零开始,而是可以直接调用你真实的信息。
- 连接器让 Claude 能够读取信息,并代表你执行操作。根据你连接的连接器和授予的权限,Claude 可以在你已连接的应用中搜索文件、检索文档、分析数据、创建新内容、更新记录、执行任务——这一切都可以在对话内完成。
- 连接器背后由 **Model Context Protocol(MCP)** 驱动。可以把 MCP 想象成"AI 的 USB-C 接口"——一套通用标准,让 Claude 能通过单一、一致的接口连接到许多不同的应用。这个开放标准意味着开发者可以为任何工具构建连接器,而这些连接器都能与 Claude 无缝配合。
- 连接器分为两类:**网页连接器(web connectors)**和**桌面扩展(desktop extensions)**。网页连接器把 Claude 连接到 Google Drive、Notion、Slack、Asana 等云服务;桌面扩展通过 Claude 桌面应用在你本机上运行,让 Claude 能访问本地文件和原生应用。

## 查找并连接工具

Anthropic 在 claude.ai/directory 维护了一份推荐连接器目录,分为两个标签页:

- **Web(网页)**:云服务与应用(Gmail、Notion、Slack、Asana、Linear、Stripe 等等)
- **Desktop extensions(桌面扩展)**:通过 Claude 桌面应用在你电脑上运行的本地工具

你也可以点击聊天窗口左下角的 + 按钮,选择「Connectors(连接器)」来浏览可用的连接器。

## 设置一个网页连接器

连接一项云服务的步骤:

1. **找到连接器**:访问 claude.ai/directory,或在任意对话中点击「+ > Connectors」
2. **点击 Connect**:选择你想添加的连接器
3. **完成身份验证**:系统会跳转到该服务的登录页面,用你现有的账号密码登录
4. **授予权限**:查看 Claude 请求的具体权限,然后授权访问
5. **测试连接**:回到 Claude,试着提一个简单请求,比如"你能访问我的 [工具名] 吗?"

连接完成后,Claude 就能在该服务范围内搜索、读取,在你授予相应权限的情况下,甚至可以执行某些操作。

## 桌面扩展

桌面扩展需要 Claude 桌面应用,而不是网页界面。这些扩展让 Claude 能与本地应用、你的文件系统,以及 macOS 或 Windows 上的原生功能进行交互。

一些桌面扩展的例子:

- 本地文件访问,用于读取和整理文档
- 浏览器控制,用于自动化网页任务
- 原生应用集成(比如用于设计工作的 Figma)

安装桌面扩展的步骤:

1. 下载并安装 Claude 桌面应用
2. 打开应用,进入「设置 > Extensions(扩展)」
3. 浏览可用扩展,点击 Install(安装)
4. 按该扩展的具体说明完成后续设置

## 在工作中使用连接器

连接好工具后,Claude 在回复你的请求时会参考这些工具中的信息。以下是一些实用场景:

**项目管理(Asana、Linear、Jira)**

> "What are my highest priority tasks due this week?"(我这周到期的最高优先级任务有哪些?)
> "Create a new task for reviewing the Q4 budget proposal"(创建一个审查 Q4 预算提案的新任务)
> "Summarize the status of our product launch project"(总结一下我们产品发布项目的现状)

**沟通协作(Slack、Gmail)**

> "Find the email thread where we discussed the vendor contract"(找到我们讨论供应商合同的那封邮件串)
> "Draft a reply to the latest message in the #marketing channel"(为 #marketing 频道里最新的消息起草一条回复)
> "What did the team decide about the timeline in yesterday's discussion?"(团队昨天讨论中对时间线做了什么决定?)

**文档管理(Notion、Google Drive、Confluence)**

> "Search our documentation for our brand voice guidelines"(在我们的文档中搜索品牌调性指南)
> "Summarize the meeting notes from last week's product review"(总结上周产品评审会议的记录)
> "What does our style guide say about using contractions?"(我们的风格指南对使用缩写形式有什么规定?)

**业务工具(Stripe、PayPal、Salesforce)**

> "Show me revenue trends for the past quarter"(给我看看上个季度的营收趋势)
> "What's the status of the Acme Corp opportunity?"(Acme Corp 这个商机目前状态如何?)
> "List recent transactions over $1,000"(列出近期金额超过 1000 美元的交易)

## 安全与权限

当你把 Claude 连接到外部服务时,你其实是在授权它读取——有时也包括修改——这些服务中的数据。以下几点值得注意:

- **权限范围受限(Scoped access)**:权限只针对该连接器所需的具体范围,你可以在每个应用的菜单中单独开关各项权限。
- **Claude 只能看到你能看到的**:Claude 只能访问你本人有权限访问的数据。连接你的工作邮箱,并不会让 Claude 拿到你 CEO 邮箱的访问权限——只能访问你自己的。
- **随时可撤销**:你可以通过 Claude 的设置,或第三方服务自身的安全设置来断开连接。和 Skills 一样,你也可以找到或构建自定义连接器——同样需要保持谨慎,只从可信来源安装连接器。

## 课程反思

在进入下一课之前,不妨思考:

- 你日常工作中用的哪些工具,连接到 Claude 后价值最大?
- 目前有哪些任务需要你手动复制粘贴信息,而这些其实可以交给连接器自动完成?
- 有没有某些工作流程,把多个已连接的信息源结合起来会明显节省时间?

## 接下来是什么

在下一课中,你将学习 Enterprise Search(企业搜索)——这是面向 Claude for Work 用户的专属功能,能把 Claude 连接到你组织的知识来源,并配有针对你公司具体情境优化的自定义提示词。

想了解更多关于连接器和 Model Context Protocol 的信息,可以访问 Anthropic 帮助中心,或浏览 claude.ai/directory 上的连接器目录。

## 反馈

随着课程学习的深入,Anthropic 期待听到你如何将课程中的概念应用到工作中,以及你可能有的任何反馈。可通过课程页面内的反馈链接分享意见。
