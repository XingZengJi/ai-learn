# Claude 101 - 7 Working with Skills 使用 Skills

> 课程: Claude 101 · 第二章「组织你的工作」第 3 课(全课程第 7 课)
> 预计用时: 15 分钟
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 翻译存档

## 学习目标

学完本课后,你将能够:

- 解释什么是 Skills(技能),以及 Claude 如何使用它们
- 识别 Anthropic 内置的文档创建类 Skills
- 在设置中启用和管理 Skills

> 套餐可用性:Skills 目前是 Pro、Max、Team 和 Enterprise 套餐的功能预览版。如果你使用免费版,可以跳过动手操作部分,只了解概念即可。

## 什么是 Skills?

Skills 是一组由指令、脚本和资源构成的文件夹,Claude 会动态加载它们,以提升在专门任务上的表现。可以把它们理解成"专业能力包"——它们教会 Claude 以可重复的方式完成特定任务。

如果你用 Claude 创建过 Excel 表格、PowerPoint 演示文稿、Word 文档或 PDF,那你其实已经见识过 Skills 在幕后发挥作用了——这些文件创建能力正是由 Skills 驱动的。但 Skills 的作用远不止文档创建。自定义 Skills 可以把整套可重复的工作流程固化下来——比如季度差异分析方法论、品牌调性审核流程,或者合规检查清单——这样 Claude 每次都会遵循同样严谨的步骤。

## Skills 的类型

你会遇到两类 Skills:

- **Anthropic Skills**:由 Anthropic 创建并维护,包括针对 Excel、Word、PowerPoint 和 PDF 文件的增强文档创建能力。所有付费用户都能使用 Anthropic Skills,只要场景相关,Claude 会自动调用它们——你不需要做任何额外操作。
- **Custom Skills(自定义 Skills)**:由你或你的组织为特定工作流程和领域任务创建。例如,你可以创建一个把公司品牌规范应用到演示文稿的 Skill,一个按特定格式整理会议记录的 Skill,或者一个执行组织内数据分析流程的 Skill。

## 启用 Skills

Skills 目前面向 Pro、Max、Team 和 Enterprise 套餐用户,以功能预览的形式开放。要使用 Skills,你需要先启用「代码执行与文件创建」(Code execution and file creation),因为 Skills 依赖 Claude 安全的沙盒计算环境才能运行。

启用步骤:

1. 进入「设置(Settings)> 能力(Capabilities)」
2. 确认「代码执行与文件创建(Code execution and file creation)」已开启
3. 滚动到 Skills 区域
4. 按需开关各个具体的 Skill

对于 Enterprise 套餐,组织所有者(Owner)必须先在管理员设置中启用「代码执行」和「Skills」,组织内成员才能使用。
对于 Team 套餐,这项功能在组织层面默认已启用。

启用后,你会在设置中看到可用的 Skills 列表,包括 Anthropic 的内置 Skills,以及你上传的任何自定义 Skills。

## 在实践中使用 Skills

Skills 的巧妙之处在于,你通常根本不需要特意去想它——Claude 会根据你的请求自动判断该调用哪个 Skill。以下是一些会触发 Skills 的提示词示例:

> "Create an Excel spreadsheet tracking monthly expenses with formulas for totals"(创建一个用公式计算总额的月度支出 Excel 表格)
> "Turn this meeting notes document into a PowerPoint presentation"(把这份会议记录文档转换成 PowerPoint 演示文稿)
> "Generate a PDF report summarizing this data"(生成一份总结这些数据的 PDF 报告)
> "Build a financial model in Excel with scenario analysis"(用 Excel 构建一个带情景分析的财务模型)

当 Claude 使用某个 Skill 时,你会在它工作过程中的思维链(chain of thought)里看到相关提示。输出结果会是一个可下载的文件,你可以保存到电脑,或直接存入 Google Drive。

## 文件处理能力

同样的能力也意味着 Claude 可以在一个受限环境内处理你的实际文件,生成更新版本(注意:在 Chat 模式下,Claude 生成的是文档的新版本,而不是直接原地编辑原文件)。上传幻灯片、表格、合同(或任何 .xlsx、.pptx、.docx、.pdf 文件),你就能看到 Claude 制作幻灯片、执行分析、添加修改建议。完成后,你可以下载这些文件,或在 Google Drive 中打开。

> 注意:要使用这些能力,你需要授权 Claude 访问外部数据源。系统提示时,只需打开「允许有限网络访问(Allow limited network access)」开关即可。

## 安全注意事项

由于 Skills 可能包含可执行代码,使用时需要审慎:

- 只从可信来源安装自定义 Skills
- Anthropic 的内置 Skills 经过 Anthropic 测试和维护
- 你上传的自定义 Skills 仅对你个人账号私有
- 如果要从外部来源安装自定义 Skill,使用前请先审查其内容,了解它具体做了什么

## 创建自定义 Skills

虽然 Anthropic 的内置 Skills 已经覆盖了常见的文档创建任务,但 Skills 真正的威力在于创建属于你自己的 Skill。自定义 Skills 让你把自己的具体工作流程、品牌规范和工作方式教给 Claude——这样只要场景相关,Claude 就会自动应用这些知识。

创建自定义 Skill 最简单的方式,就是直接和 Claude 对话。你不需要写代码,也不需要手动创建文件——Claude 会替你处理好底层的技术结构。

通过对话创建 Skill 的步骤:

1. 开启一个新对话,告诉 Claude 你想创建什么。例如:"我想创建一个用来写季度业务回顾的 Skill",或"我需要一个能把我们的品牌规范应用到演示文稿上的 Skill"。
2. 回答 Claude 的提问。Claude 会像做访谈一样了解你的工作流程,询问诸如:这个 Skill 应该做什么?这类工作什么样的产出算好?你能举一些会用到这个 Skill 的例子吗?
3. 上传参考材料(如果有的话)。模板、风格指南、品牌素材,或者你觉得满意的作品案例,都能帮助 Claude 准确理解你想要的效果。
4. 保存你的 Skill。完成后,Claude 会生成一个结构规范的 Skill 文件。你只需要保存它,这个 Skill 就可以供 Claude 使用了。

**查看你的 Skills**。在左侧边栏找到「Customize(自定义)」标签页,在那里你可以看到所有可用的 Skills,还能手动编辑它们,或者通过和 Claude 对话来编辑。

你的自定义 Skill 会出现在 Skills 列表中,和 Anthropic 的内置 Skills 排在一起。此后,只要你处理相关任务,Claude 就会自动调用它——不需要手动触发。你也可以通过迭代来改进 Skill——让 Claude 帮你编辑某个 Skill,它会自动更新对应的文件。

## Skills 与 Projects 的区别

你可能会好奇——既然 Skills 和 Projects 都能为 Claude 提供更多背景信息,那什么时候该用哪个?可以这样理解:**Projects 存放知识,Skills 执行任务**。

Projects 是知识中心。它们存放 Claude 理解你工作所需的参考资料——项目规格说明、会议记录、研究文档。当你把文件上传到某个 Project 后,Claude 会在该 Project 内的每一次对话中调用这些信息。

Skills 是流程机器。它们把 Claude 该如何执行一项任务编码下来——具体的步骤、操作顺序,以及你希望每次都遵循的方法论。当你有希望 Claude 持续一致执行的可重复工作流程时,Skills 最能发挥作用。

这两个功能是互补的。一个 Skill 可以引用存放在某个 Project 里的知识——比如你的"客户电话准备" Skill,可能会从某个 Project 知识库中上传的客户档案里取材。Project 提供"是什么"(信息),Skill 提供"怎么做"(流程)。

**Projects 与 Skills 对比**

| | Projects | Skills |
|---|---|---|
| **用途** | 存放 Claude 会引用的知识 | 定义 Claude 要执行的流程 |
| **最适合** | 长期背景信息、参考资料、团队协作 | 可重复的工作流程、多步骤任务、一致的方法论 |
| **示例** | 客户信息中心、研究助手、反馈生成器 | 流程规范(如品牌或法务)、博客撰写、PDF 创建 |
| **持续性** | 该 Project 内的所有对话都能用到这些知识 | 只在 Skill 被调用时应用相应指令 |

## 课程反思

在进入下一课之前,不妨思考:

- 你经常创建哪些类型的文档,可能受益于 Claude 的内置 Skills?
- 你的工作中是否有重复性的工作流程,适合做成自定义 Skills?
- Skills 可能会如何改变你对文档创建和数据分析的思考方式?

## 接下来是什么

在接下来的一组课程中,你将开始通过连接器(connectors)扩展 Claude 的能力范围。这些强大的工具能让信息获取变得无缝衔接,还能让 Claude 直接在你日常使用的工具内部执行操作。

想了解更多关于 Skills 的信息,包括如何创建自定义 Skills,可以访问 Anthropic 帮助中心。

## 反馈

随着课程学习的深入,Anthropic 期待听到你如何将课程中的概念应用到工作中,以及你可能有的任何反馈。可通过课程页面内的反馈链接分享意见。
