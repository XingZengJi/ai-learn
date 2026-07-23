# Introduction to Agent Skills - 05 Sharing skills 分享 Skills

> Course: Introduction to Agent Skills(Agent Skills 入门)· Lesson 5
> 课程: Introduction to Agent Skills · 第 5 课 · 建议用时 20 分钟
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## What You'll Learn 本课目标

- 把 Skills 提交到 Git 仓库,与团队共享
- 通过插件和市场跨项目分发 Skills
- 用企业托管设置在全组织部署 Skills
- 配置自定义子智能体使用指定 Skills

一个只有你自己用的 PR 评审 Skill 是有帮助的,但同一个 Skill 分享给整个团队,就**统一了代码评审标准**。

## 方式一: 提交到仓库

最简单的分享方式。放进 `.claude/skills`,**任何人克隆仓库就自动获得**,无需额外安装。你推送更新,大家下次 pull 就拿到。

适合: 团队编码标准、项目特定工作流、需要引用代码库结构的 Skills。

`.claude` 目录装着你的 agents、hooks、skills 和 settings——**全部进版本控制,通过正常 Git 流程与团队共享**。

## 方式二: 通过插件分发

插件是用来给 Claude Code 扩展自定义功能的机制,设计目标就是跨团队、跨项目分享。在插件项目里建一个 `skills` 目录,结构与 `.claude` 目录类似——**每个 Skill 一个文件夹,里面放 `SKILL.md`**。

把插件发布到市场后,其他用户就能发现并安装。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1771527270%2FSkills5_07.1771527270067.png)

适合: **Skills 不太项目特定,对你团队之外的社区成员也有用**的情况。

## 方式三: 企业托管设置

管理员可以通过托管设置在全组织部署 Skills。**企业 Skills 优先级最高**——同名时覆盖个人、项目和插件 Skills。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1771527270%2FSkills5_08.1771527270381.png)

托管设置文件支持 `strictKnownMarketplaces` 之类的能力,用来控制插件只能从哪些来源安装:

```json
"strictKnownMarketplaces": [
  {
    "source": "github",
    "repo": "acme-corp/approved-plugins"
  },
  {
    "source": "npm",
    "package": "@acme-corp/compliance-plugins"
  }
]
```

适合: 强制标准、安全要求、合规流程,以及必须全组织统一的编码实践。**关键词是「必须」。**

## Skills 与子智能体: 一个容易踩的坑

**子智能体不会自动看到你的 Skills。** 委派任务给子智能体时,它是从一个干净的新上下文开始的。

三条重要区别:

- **内置智能体(Explorer、Plan、Verify 等)完全无法访问 Skills**
- **自定义子智能体可以用 Skills,但必须显式列出**
- **Skills 是在子智能体启动时加载的**,不像主对话那样按需加载

要创建带 Skills 的自定义子智能体,在 `.claude/agents` 里加一个 agent markdown 文件。也可以用 `/agents` 命令交互式创建:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1771527270%2FSkills5_13.1771527270779.png)

生成的 agent 文件里有一个 `skills` 字段,列出要加载哪些 Skills:

```markdown
---
name: frontend-security-accessibility-reviewer
description: "Use this agent when you need to review frontend code for accessibility..."
tools: Bash, Glob, Grep, Read, WebFetch, WebSearch, Skill...
model: sonnet
color: blue
skills: accessibility-audit, performance-check
---
```

委派给这个子智能体时,它会带着两个 Skills,并在每次评审中应用它们。**做法是: 先确认这些 Skills 存在于 `.claude/skills`,然后新建子智能体或给现有 agent 文件加上 `skills` 字段。**

这个模式在这几种情况下很好用:

- 想要带特定专业知识的隔离任务委派
- 不同子智能体需要不同 Skills(前端评审员 vs 后端评审员)
- **想在委派的工作里强制标准,而不是靠提示词去叮嘱**

## Key Takeaways 核心要点

- `.claude/skills` 里的项目 Skills **通过 Git 自动共享**
- **插件**让你跨仓库分发 Skills,可供更广的社区使用
- **企业托管设置**全组织下发、优先级最高,适合强制标准与合规
- **子智能体不会自动看到 Skills**——必须在自定义 agent 的 `skills` 字段里显式列出
- **内置智能体完全用不了 Skills**,只有 `.claude/agents` 里定义的自定义子智能体可以

## Lesson Reflection 本课反思

- 你想做的那些 Skills,用哪种分享方式(仓库 / 插件 / 企业)最合适?
- 你有哪些流程,用「带特定 Skills 的自定义子智能体」能提升委派工作的一致性?

## 对产品经理来说

三种分发方式其实对应三种不同的**治理强度**:仓库级是"约定",插件是"可选安装",企业托管是"强制"。课程那句提示很准——**企业级的关键词是「必须」**。把只是"最好这么做"的东西放进强制层,会带来不必要的摩擦和绕过行为;反过来,把合规要求只放在仓库里靠自觉,也迟早出事。**治理强度要和事情的性质匹配**,这个判断在任何规范落地时都成立。

「**子智能体不会自动继承 Skills**」是这一课最实际的一个坑。它的普遍意义是: **隔离是有代价的**。你把工作委派到一个干净的独立环境,换来了不污染主上下文,但同时也失去了主环境里积累的所有约定——这两件事是同一个机制的两面。任何做过跨团队委派的人都熟悉这个感觉:**换个人做,他不知道那些没写下来的规矩。** 解法也一样——**把规矩显式地交接过去**,在这里就是 `skills` 字段。

最后那句「**在委派的工作里强制标准,而不是靠提示词去叮嘱**」值得单独记。配置化的约束比每次口头提醒可靠,因为前者不依赖人(或 AI)记得。

---

*本课程为 Anthropic Academy 官方课程,笔记为学习用途的中文整理。*
