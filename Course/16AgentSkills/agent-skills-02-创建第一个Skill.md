# Introduction to Agent Skills - 02 Creating your first skill 创建第一个 Skill

> Course: Introduction to Agent Skills(Agent Skills 入门)· Lesson 2
> 课程: Introduction to Agent Skills · 第 2 课 · 建议用时 20 分钟
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## What You'll Learn 本课目标

- 从零创建一个结构正确的 Skill
- 测试并确认 Skill 在 Claude Code 里正确加载
- 说明 Claude Code 如何把请求匹配到可用 Skills
- 描述 Skill 的优先级层次(企业 → 个人 → 项目 → 插件)

## 动手创建一个 Skill

本课的例子是一个**个人** Skill,教 Claude 用统一格式写 PR 描述,因为放在个人目录,所以在所有项目里都能用。

**第一步**: 在 skills 文件夹里建一个目录,**目录名应与 Skill 名一致**:

```bash
mkdir -p ~/.claude/skills/pr-description
```

**第二步**: 在该目录里建 `SKILL.md`。文件由 frontmatter 分隔成两部分:

```markdown
---
name: pr-description
description: Writes pull request descriptions. Use when creating a PR, writing a PR, or when the user asks to summarize changes for a pull request.
---

When writing a PR description:

1. Run `git diff main...HEAD` to see all changes on this branch
2. Write a description following this format:

## What
One sentence explaining what this PR does.

## Why
Brief context on why this change is needed

## Changes
- Bullet points of specific changes made
- Group related changes together
- Mention any files deleted or renamed
```

- **`name`** 标识这个 Skill
- **`description`** 告诉 Claude 什么时候用它——**这就是匹配依据**
- 第二组 `---` 之后的所有内容,是 Skill 被激活后 Claude 遵循的指令

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1771527260%2FSkills2_04.1771527260186.png)

## 测试你的 Skill

**Claude Code 在启动时加载 Skills,所以建完之后要重启会话。** 可以查看可用 Skills 列表来确认它在:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1771527260%2FSkills2_05.1771527260555.png)

看到它之后,在某个分支上改点东西,然后说「给我的改动写个 PR 描述」。Claude 会提示它正在使用这个 Skill、检查你的 diff、按你的模板写出描述——**每次格式都一样**。

## 匹配机制是怎么运作的

Claude Code 启动时会扫描四个位置找 Skills,但**只加载名称和描述,不加载完整内容**。这是个重要细节。

当你发出请求,Claude 把你的话与所有可用 Skill 的描述做比对。这是**语义匹配**——比如「解释一下这个函数在干嘛」会匹配到描述为「用可视化图解释代码」的 Skill,因为意图是重合的。

匹配上之后,**Claude 会先请你确认再加载**。这一步让你清楚它往上下文里塞了什么。确认后它才读取完整的 `SKILL.md` 并遵循其中指令。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1771527261%2FSkills2_17.1771527261842.png)

## 优先级: 重名了谁赢

如果你克隆的仓库里有个 Skill 和你的个人 Skill 同名,谁生效?优先级从高到低:

1. **企业 Enterprise** —— 通过托管设置下发,最高优先级
2. **个人 Personal** —— `~/.claude/skills`
3. **项目 Project** —— 仓库里的 `.claude/skills`
4. **插件 Plugins** —— 已安装的插件,最低

这个设计让机构能通过企业 Skills 强制标准,同时仍允许个人定制。如果公司有个企业级 `code-review`,你又建了个同名的个人 Skill,**企业版永远赢**。

**避免冲突的办法是用描述性的名字**: 别只叫 `review`,叫 `frontend-review` 或 `backend-review`。

## 更新与删除

- **更新**: 编辑它的 `SKILL.md`
- **删除**: 删掉它的目录
- **任何改动之后都要重启 Claude Code 才生效**

## Key Takeaways 核心要点

- 一个 Skill = 一个目录 + 里面的 `SKILL.md`(frontmatter 写元数据,下面写指令)
- Claude **启动时只加载名称与描述**,之后用语义匹配把请求对上描述
- **加载完整内容前会有确认提示**
- 重名优先级: **企业 → 个人 → 项目 → 插件**
- 改完要**重启**才生效

## Lesson Reflection 本课反思

- 你日常工作里哪一件事现在就能变成 Skill?它的 description 该怎么写?
- 优先级层次会如何影响团队的 Skill 管理策略?你会更依赖个人级还是项目级?

## 对产品经理来说

**「只加载名称和描述,匹配上才加载全文」**——这个设计值得理解,因为它解释了为什么 `description` 那么重要。Claude 在决定用不用你的 Skill 时,**看到的只有那一句描述**,看不到里面的内容。所以描述写得含糊,再好的 Skill 也不会被触发。

这跟写文档标题、写 API 命名是同一个问题:**检索层看到的东西,和内容本身是两回事**。你可能写了一份极好的规范,但如果标题是"补充说明",没人会点开——包括 AI。

「用描述性的名字避免冲突」这条也很实际。`review` 这种名字在任何有企业配置的环境里都是雷。这跟给数据库字段、给配置项命名的原则一样:**通用名字是留给平台的,你的东西要带限定词。**

---

*本课程为 Anthropic Academy 官方课程,笔记为学习用途的中文整理。*
