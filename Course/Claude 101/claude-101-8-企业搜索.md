# Claude 101 - 8 Enterprise Search 企业搜索

> 课程: Claude 101 · 第三章「扩展 Claude 的覆盖范围」第 2 课(全课程第 8 课)
> 预计用时: 15 分钟
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 翻译存档

## 学习目标

学完本课后,你将能够:

- 解释什么是 Enterprise Search,以及它能回答哪些类型的问题
- 理解管理员和用户各自的设置流程
- 了解安全与权限机制如何保护组织数据

> 套餐可用性:Enterprise Search 面向 Team 和 Enterprise 套餐开放,需要由工作区管理员启用。如果你使用的是免费版、Pro 或 Max 套餐,可以跳过本课。

## 什么是 Enterprise Search?

Enterprise Search 会在你的侧边栏添加一个专属的「Ask {你的组织名}」选项,专门用来查找并整合分散在公司各个工具和数据源中的知识。可以把 Enterprise Search 理解成一个为你整个组织预先搭建好的 Project——你公司的知识库已经提前加载好了,你可以直接开始提问,获得贴合上下文的回答。

与开启了连接器的普通对话不同,Enterprise Search 是专门为信息检索设计的,使用的是 Anthropic 团队配置的自定义指令。

## 你可以问什么?

Enterprise Search 特别适合那些需要跨多个信息源、或需要整合公司内部各处信息才能回答的问题。以下是一些常见用例:

**快速了解近况**

> "What happened yesterday while I was out?"(我请假的这一天公司发生了什么?)
> "Summarize key updates across the business from the last week"(总结上周全公司范围内的重要更新)
> "What are the current blockers on the Platform project?"(Platform 项目目前有哪些卡点?)

**政策与流程问题**

> "What is our company's remote work policy?"(我们公司的远程办公政策是什么?)
> "How do I submit an expense report?"(报销申请该怎么提交?)
> "What's the process for requesting time off?"(请假流程是什么?)

**研究与分析**

> "What are the main reasons customers cite for choosing competitors?"(客户选择竞争对手的主要原因是什么?)
> "Summarize discussions about the Q4 product roadmap"(总结关于 Q4 产品路线图的讨论)
> "Find information about our customer onboarding process"(查找关于客户入职流程的信息)

**新员工入职**

> "How does our authentication system work?"(我们的身份验证系统是如何运作的?)
> "Who should I talk to about learning the billing system?"(想了解计费系统,应该找谁?)
> "What tools does the engineering team use for deployment?"(工程团队部署时用什么工具?)

**绩效与项目追踪**

> "Find discussions and documents related to the marketing campaign"(找出与这次营销活动相关的讨论和文档)
> "What were the key decisions from last week's leadership meetings?"(上周管理层会议做出了哪些关键决定?)
> "Summarize team contributions to the Infrastructure initiative"(总结团队在 Infrastructure 项目中的贡献)

当你提出一个问题时,Claude 会在你已连接的所有工具中搜索——比如 SharePoint 文档、Slack 对话、Gmail 邮件和 Google Drive 文件——并把信息整合成一份统一的回答。而且它总会注明信息来源,方便你查看完整上下文。

## 设置 Enterprise Search

Enterprise Search 需要两步设置流程:先由管理员为整个组织完成配置,再由每位用户用自己的账号完成身份验证。

**管理员(Owner)操作步骤**

对所有 Team 和 Enterprise 组织,Enterprise Search 这个 Project 默认已启用,但所有者(Owner)需要先完成初始设置,团队成员才能使用:

1. 点击左侧边栏的「Ask Your Org」
2. 点击「Set up for your org」继续设置(或点击「Disable」关闭该功能)
3. 连接你组织的工具。系统会要求你为「文档」类别选择一个连接器(如 Google Drive 或 SharePoint),为「聊天」类别选择一个连接器(如 Slack 或 Microsoft Teams)。邮件连接器建议添加,但非必需
4. 点击「+ Add more」设置团队需要的其他工具
5. 自定义 Project 名称。你填写的名称会以「Ask [名称]」的形式出现在每个人的侧边栏中
6. 添加描述,然后点击「Finish set up」完成设置

设置完成后,该 Project 会对组织内所有成员开放。

**普通用户操作步骤**

管理员完成 Enterprise Search 设置后,你会在侧边栏看到已加星标的「Ask {组织名}」Project。使用步骤:

1. 点击侧边栏中的这个 Project
2. 按照引导流程连接推荐的各项服务
3. 对你想纳入搜索范围的每项服务完成身份验证(Slack、Google、Microsoft 365 等)
4. 开始向 Claude 提问,查询组织内部的知识

你启用的连接器越多,搜索结果就越全面。之后你也可以随时在该 Project 的「Instructions」区域点击「Connect」来添加更多连接器。

## 这么多数据……安全吗?

简单来说,是安全的。Enterprise Search 只会显示你在原始工具中本来就有权限访问的内容。而且,你的对话本身是私密的,你连接的数据也不会被单独索引或存储。

## 课程反思

在进入下一课之前,不妨思考:

- 你经常向同事询问的哪些问题,其实可以通过搜索组织的文档和沟通记录得到答案?
- 有没有某些新人培训或入职场景,Enterprise Search 能帮助新同事更快上手?
- 对你的具体岗位来说,连接哪些数据源价值最大?

## 接下来是什么

在下一课中,你将学习 Research 模式——Claude 用于深入、多步骤调查的能力,超越简单查询,进行全面分析。

想了解更多关于 Enterprise Search 的信息,可以访问 Anthropic 帮助中心。

## 反馈

随着课程学习的深入,Anthropic 期待听到你如何将课程中的概念应用到工作中,以及你可能有的任何反馈。可通过课程页面内的反馈链接分享意见。
