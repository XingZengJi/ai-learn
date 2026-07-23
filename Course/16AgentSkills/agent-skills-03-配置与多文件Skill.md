# Introduction to Agent Skills - 03 Configuration and multi-file skills 配置与多文件 Skill

> Course: Introduction to Agent Skills(Agent Skills 入门)· Lesson 3
> 课程: Introduction to Agent Skills · 第 3 课 · 建议用时 20 分钟
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## What You'll Learn 本课目标

- 配置进阶元数据字段,包括 `allowed-tools` 和 `model`
- 写出能可靠触发的 Skill 描述
- 用 `allowed-tools` 限制 Skill 激活时 Claude 能做什么
- 用**渐进式披露**和多文件结构组织复杂 Skill

## 元数据字段

Agent Skills 开放标准支持的 frontmatter 字段,两个必填、其余可选:

| 字段 | 必填 | 说明 |
|---|---|---|
| `name` | ✅ | 标识 Skill。只用小写字母、数字、连字符,**最长 64 字符**,应与目录名一致 |
| `description` | ✅ | 告诉 Claude 何时使用,**最长 1024 字符**。最重要的字段,因为它是匹配依据 |
| `allowed-tools` | — | 限制 Skill 激活时 Claude 能用哪些工具 |
| `model` | — | 指定这个 Skill 用哪个 Claude 模型 |

## 怎么写好 description

课程给的类比很直白: **如果有人跟你说「你的工作是帮忙处理文档」,你也不知道该干什么——Claude 也一样。**

一个好的描述要回答两个问题:

1. **这个 Skill 做什么?**
2. **Claude 什么时候该用它?**

**如果 Skill 该触发的时候没触发,就往描述里加更多关键词**,加那些你实际会用来提要求的说法。描述是 Claude 判断相关性的唯一依据,措辞很要紧。

## 用 allowed-tools 加护栏

有时你想要一个**只能读、不能改**的 Skill。这对安全敏感的流程、只读任务,或任何你想加护栏的场景都有用。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1771527264%2FSkills3_17.1771527264166.png)

```markdown
---
name: codebase-onboarding
description: Helps new developers understand the system works.
allowed-tools: Read, Grep, Glob, Bash
model: sonnet
---
```

这个例子里 `allowed-tools` 设成了 `Read, Grep, Glob, Bash`。Skill 激活期间,Claude **只能**用这几个工具而无需再申请权限——不能编辑、不能写入。

**如果完全省略 `allowed-tools`,就不做任何限制**,Claude 走它正常的权限模型。

## 渐进式披露 Progressive Disclosure

Skills 与你的对话**共享同一个上下文窗口**。Skill 激活时,`SKILL.md` 的内容会被载入上下文。但有时你需要参考资料、示例或工具脚本。

把一切塞进一个 2000 行的文件有两个问题: **占大量上下文窗口**,以及**维护起来很难受**。

渐进式披露的解法是: **核心指令留在 `SKILL.md`,详细参考资料放进单独文件,Claude 只在需要时才读。**

开放标准建议的目录结构:

- `scripts/` —— 可执行代码
- `references/` —— 补充文档
- `assets/` —— 图片、模板或其他数据文件

然后在 `SKILL.md` 里链接这些文件,并**写清楚什么时候该加载它们**:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1771527265%2FSkills3_13.1771527265100.png)

这个例子里,只有当有人问系统设计时,Claude 才读 `architecture-guide.md`;如果问的是「组件该加在哪」,那个文件永远不会被载入。**这就像在上下文窗口里放一份目录,而不是整本书。**

> **经验法则: `SKILL.md` 控制在 500 行以内。** 超了就该考虑拆成独立的参考文件。

## 高效使用脚本

Skill 目录里的脚本**可以执行而不把内容载入上下文**。脚本跑完,**只有输出消耗 token**。

关键是在 `SKILL.md` 里明确告诉 Claude: **运行这个脚本,不要读它**。

这在这几种情况下特别有用:

- 环境校验
- 需要保持一致的数据转换
- 那些「用测试过的代码比让 AI 现写更可靠」的操作

## Key Takeaways 核心要点

- `name` 和 `description` 必填,`allowed-tools` 和 `model` 可选但很有用
- 好描述回答两个问题: **做什么**、**何时用**
- `allowed-tools` 限制 Skill 激活期间可用的工具——只读或安全敏感场景的护栏
- **渐进式披露**: `SKILL.md` 控制在 500 行内,其余链接到按需读取的支撑文件
- **脚本执行不载入内容,只有输出耗 token**

## Lesson Reflection 本课反思

- 设想一个你想做的多文件 Skill,`SKILL.md` 和参考文件该怎么分?
- 团队里有哪些流程,用 `allowed-tools` 限制工具能增加一层重要的安全性?

## 对产品经理来说

**渐进式披露是这一课最值得带走的概念**,而且它远不止是个技术技巧——它是一种信息架构思路: **把索引放在手边,把详情放在一跳之外。**

这跟写产品文档的道理完全相同。一份好的需求文档首页应该是目录和结论,而不是把所有背景调研、竞品分析、异常流程平铺开。读的人(和 AI)先看到全貌,需要细节时再点进去。**500 行**这个阈值可以直接借用——你的文档主体超过这个量级,大概率该拆了。

「**脚本执行不载入内容,只有输出耗 token**」这条有个隐含建议值得注意: **对于要求结果稳定一致的操作,写成脚本比让 AI 每次现推更可靠。** 这划出了一条很实用的界线——**确定性的活交给代码,判断性的活交给模型**。很多 AI 方案不稳定,原因就是把本该是脚本的东西交给了模型去每次重新生成。

---

*本课程为 Anthropic Academy 官方课程,笔记为学习用途的中文整理。*
