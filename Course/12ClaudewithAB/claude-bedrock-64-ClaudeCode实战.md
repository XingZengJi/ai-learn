# Claude with AWS Bedrock - 64 Claude Code in action Claude Code 实战

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 64
> 课程: Claude with AWS Bedrock · 第 64 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

Claude Code 不只是个写代码的工具,它被设计成贯穿整个项目生命周期的编程搭档——从初始搭建到部署维护,软件开发的每一步它都能帮上忙。

## The /init Command /init 命令

开始一个新项目时,`/init` 是你的第一步。Claude Code 会扫描代码库,记录项目结构、依赖、常用命令和编码风格,把结果汇总进一个 `CLAUDE.md` 文件,以后每次对话它都会自动读取。

`CLAUDE.md` 可以按作用范围分成多个:

- **Project(项目级)** —— 提交进 git,团队工程师共享
- **Local(本地级)** —— 不提交 git,你个人给 Claude 的备注
- **User(用户级)** —— 在你所有项目间通用

运行 `/init` 时可以额外指明希望 Claude 重点关注的方面。还可以用 `#` 快捷方式随手加备注,内容会追加进 `CLAUDE.md`。

## Common Workflows 常见工作流

Claude 最擅长做「效果放大器」——你给的上下文和结构越多,产出越好。两种有效的做法:

### Planning-First Workflow 先规划再动手

适合复杂功能的三步法:

1. **喂上下文** —— 找出与该功能相关的文件,让 Claude 读一遍
2. **让 Claude 规划方案** —— 描述你想要什么,但**明确要求它先别写代码**
3. **让 Claude 实现方案** —— 有了扎实的计划后,Claude 基于已有上下文和规划来写代码

比如做一个文档转换工具,可以先让 Claude 看看已有的工具示例和辅助函数,再让它规划实现步骤,最后才要求写实际代码。

### Test-Driven Development Workflow 测试驱动开发

前期投入更多,但对 Claude 效果的提升非常明显:

1. **喂上下文** —— 分享功能相关文件
2. **让 Claude 想测试用例** —— 明确要求此时**不要写任何代码**
3. **让 Claude 实现这些测试** —— 只挑与你的功能真正相关的那些
4. **让 Claude 写出能通过测试的代码** —— Claude 会反复迭代直到测试全过

这套流程能保证代码健壮,覆盖到你原本可能没想到的边界情况。

## Practical Tips 实用技巧

除了写代码,Claude 还能处理这些日常开发杂务:

- 搭建项目环境、安装依赖
- 暂存改动并写出说明清楚的提交信息
- 运行测试套件并解读结果
- 用 `/clear` 清空对话历史、重置上下文

记住 Claude Code 会自动读取 `CLAUDE.md`,所以你写进去的编码规范、项目备注、架构决策,都会影响之后所有的交互。项目模式和要求记录得越多,Claude 就越好用。

对产品经理来说: 两个工作流的共同点都是「**先别写代码**」。这和带人是一个道理——直接派活儿,拿回来的东西经常跑偏; 先让对方复述一遍理解、给个方案,你确认后再开工,返工率会大幅下降。多花的那五分钟是最划算的投入。
