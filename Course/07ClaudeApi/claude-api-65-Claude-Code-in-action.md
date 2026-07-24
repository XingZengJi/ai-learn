# Building with the Claude API - 65 Claude Code in action Claude Code 实战

> Course: Building with the Claude API · Lesson 65
> 课程: Building with the Claude API · 第 65 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

Claude Code 不只是一个写代码的工具——它被设计成能陪你走过软件项目的每一个阶段,从最初的搭建到部署、再到后续支持。可以把它想象成团队里的另一位工程师,什么都能帮上忙。

## /init 命令

开始在一个项目里使用 Claude Code 时,你要做的第一件事就是运行 `/init` 命令。这会让 Claude 扫描你整个代码库,理解项目的结构、依赖、代码风格和架构。

Claude 会把学到的一切,总结进一个叫 `CLAUDE.md` 的特殊文件里。这个文件会自动作为上下文,包含在之后所有的对话里,所以 Claude 会记住关于你项目的重要细节。

你可以为不同的范围建多个 `CLAUDE.md` 文件:

- **项目级(Project)** —— 项目里所有工程师共享
- **本地级(Local)** —— 你个人的笔记,不提交进 git
- **用户级(User)** —— 在你所有项目里通用

运行 `/init` 时,你可以加上特别的指示,说明希望 Claude 重点关注的方面。生成的文件里会包含构建命令、编码规范,以及 Claude 应该遵循的项目专属模式。

你也可以用 `#` 命令,快速给 `CLAUDE.md` 文件加笔记。比如,输入「# 始终使用有描述性的变量名」,系统会提示你把这条准则加进项目、本地或用户级的记忆里。

## 常见工作流程

把 Claude 当成一个「效率倍增器」来用,效果最好。你提供的上下文和结构越多,得到的结果就越好。以下是最有效的工作流程:

### 第一步:给 Claude 提供上下文

在让 Claude 搭建某个功能之前,先找出代码库里和你要做的功能相关的文件。让 Claude 先读一遍、分析这些文件。这能给 Claude 提供你代码风格的范例,以及它可以在其基础上继续搭建的现有功能。

### 第二步:让 Claude 规划解决方案

不要直接跳到实现阶段,而是让 Claude 先把问题想清楚、拿出一份计划。明确告诉 Claude 现在先不要写任何代码——只专注于思路和需要的步骤。

### 第三步:让 Claude 实现方案

有了一份靠谱的计划之后,再让 Claude 去实现它。Claude 会基于你们之前已经完成的上下文准备和规划工作来写代码。

## 测试驱动开发工作流

想要更好的结果,可以用测试驱动的方式:

1. **给 Claude 提供上下文** —— 和之前一样,给 Claude 看相关文件
2. **让 Claude 构思测试用例** —— 让 Claude 头脑风暴一下,哪些测试能验证你的新功能
3. **让 Claude 实现这些测试** —— 挑出最相关的测试,让 Claude 把它们写出来
4. **让 Claude 写出能通过测试的代码** —— Claude 会不断迭代实现,直到所有测试都通过

这种方式往往能产出更健壮的代码,因为 Claude 有明确的成功标准可以努力达成。

## 实际案例

来看看这些工作流程在实践中是什么样的。假设你想给一个现有项目加一个文档转换工具:

```
// 首先,让 Claude 读相关文件
> Read the math.py and document.py files

// 然后要求规划(而不是实现)
> Plan to implement document_path_to_markdown tool:
1. Create a function that:
   - Takes a file path parameter
   - Validates the file exists  
   - Determines file type from extension
   - Reads binary data from file
   - Leverages existing binary_document_to_markdown function
   - Returns markdown string
2. Add appropriate documentation
3. Register the tool with MCP server
4. Add tests

// 最后,要求实现
> Implement the plan
```

Claude 接下来会创建这个函数、更新必要的文件、写测试,甚至运行测试套件来验证一切是否正常工作。

## 其他常用命令

Claude Code 还包含几个有用的命令:

- `/clear` —— 清空对话历史,重置上下文
- `/init` —— 扫描代码库,创建 `CLAUDE.md` 文档
- `#` —— 给你的 `CLAUDE.md` 文件添加笔记

Claude 还能处理日常的开发任务,比如把改动加入 git 暂存区并提交、运行测试、管理依赖。你不需要在编辑器和终端之间来回切换,而是可以让 Claude 来处理这些事务性工作,自己专注在更宏观的问题上。

用好 Claude Code 的关键,是记住它被设计成一个协作伙伴,而不只是一个「代码生成器」。你提供的上下文和结构越多,Claude 能帮你搭建和维护项目的效果就越好。

---

对产品经理来说,「先给上下文、再要计划、最后才要实现」这套三步工作流,和带新人做项目的方法论几乎一模一样:让 ta 先熟悉现有代码/文档,再让 ta 讲讲打算怎么做(而不是直接动手),确认思路没问题了再放手去做——每一步都给出反馈检查点,比「一股脑丢给 ta 一个任务、等最后交付」要靠谱得多。这个道理同样适用于怎么给 Claude Code(或任何 AI 助手)提需求。
