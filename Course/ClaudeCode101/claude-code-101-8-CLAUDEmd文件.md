# Claude Code 101 - 8 The CLAUDE.md File CLAUDE.md 文件

> Course: Claude Code 101 · Lesson 8
> 课程: Claude Code 101 · 第 8 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 整理翻译存档

One of the most useful features in Claude Code is the CLAUDE.md file. It gives Claude Code persistent memory about your project.

> Claude Code 最实用的功能之一,就是 CLAUDE.md 文件。它让 Claude Code 对你的项目拥有持久的记忆。

## The Problem It Solves 它解决了什么问题

When you open Claude Code without a CLAUDE.md file, it starts fresh every time. It has to re-explore your codebase, figure out what dependencies are needed, and understand what features are already implemented. Sometimes it makes assumptions, which makes it harder to steer Claude in the right direction.

> 如果没有 CLAUDE.md 文件,每次打开 Claude Code 它都是从零开始。它得重新探索你的代码库、搞清楚需要哪些依赖、了解哪些功能已经实现了。有时它还会做出一些假设,这就更难把它引导到正确的方向上。

CLAUDE.md solves this. It's a Markdown file you add to the root of your project, and Claude Code reads it automatically every time you start a session. Think of it as an onboarding script for your codebase. The contents of the CLAUDE.md file are appended to your prompt.

> CLAUDE.md 解决了这个问题。它是一个你添加到项目根目录的 Markdown 文件,Claude Code 每次开始会话时都会自动读取它。可以把它想象成你代码库的「新人入职手册」。CLAUDE.md 文件的内容会被附加到你的提示词后面。

## An Example 一个例子

Here's what a typical CLAUDE.md file looks like:

> 下面是一个典型的 CLAUDE.md 文件长什么样:

```
# Project

This is a Next.js 15 app using the App Router, Tailwind, and Drizzle ORM.

# Commands
- Dev server: `pnpm dev`
- Run tests: `pnpm test`
- Lint: `pnpm lint`

# Code Style
- Use 2-space indentation
- Prefer named exports
- All API routes go in app/api/
- Use server actions instead of API routes where possible
```

It's straightforward. Now if you ask Claude Code to create a React component, it already knows to use Tailwind for styling and to follow your code conventions.

> 就这么直白。现在如果你让 Claude Code 创建一个 React 组件,它已经知道要用 Tailwind 来写样式,并且遵循你的代码约定。

> A CLAUDE.md file open in VS Code showing project info, commands, and code style rules(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## CLAUDE.md is for Teams CLAUDE.md 是给团队用的

You can (and should) commit your CLAUDE.md to version control so your team benefits from it. There's actually a hierarchy of memory files depending on who they're for:

> 你可以(而且应该)把 CLAUDE.md 提交进版本控制,让整个团队都能受益。记忆文件其实有一套层级结构,取决于它是给谁用的:

- **Project-level CLAUDE.md** lives in the root directory of your project. Shared with the team.

  **项目级 CLAUDE.md** 放在项目根目录,团队共享。

- **User-level CLAUDE.md** lives in your configuration folder. This one is just for you and applies across all your projects. Put your personal preferences here.

  **用户级 CLAUDE.md** 放在你的配置文件夹里。这一份只属于你,适用于你所有的项目。把你的个人偏好写在这里。

## Tips 小贴士

**Save corrections to memory.** If you find yourself correcting Claude repeatedly — like telling it to always use server actions instead of API routes — explicitly ask Claude to save that rule to memory. Next time you open the project, it'll know.

> **把修正意见存进记忆。** 如果你发现自己反复纠正 Claude 同一件事——比如一直告诉它要用 server actions 而不是 API routes——就明确让 Claude 把这条规则存进记忆。下次打开项目时,它就会记得。

> Asking Claude to save a rule to the CLAUDE.md file — always use server actions instead of API routes(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

**Reference project docs.** If you have documentation in your project that you want Claude to reference, use the @ symbol with the file path:

> **引用项目文档。** 如果项目里有你希望 Claude 参考的文档,用 @ 符号加文件路径:

```
## README.md

Please read if you need more info: @README.md
```

**Start without one.** We recommend starting a project without a CLAUDE.md file so you can see where you constantly have to course-correct the model. This keeps your CLAUDE.md compact and focused on only the necessary information. When you're ready, run /init to have Claude generate one for you.

> **先不写,让子弹飞一会儿。** 我们建议一开始不带 CLAUDE.md 文件启动项目,这样你能看清自己到底在哪些地方反复纠正模型。这能让你的 CLAUDE.md 保持精简,只聚焦于真正必要的信息。等准备好了,运行 `/init`,让 Claude 帮你生成一份。

## Recap 小结

The difference between a frustrating Claude Code session and a productive one often comes down to context — and the CLAUDE.md file is how you provide that context. Start with your stack, your preferences, and your commands, then build from there as you go.

> 一次让人抓狂的 Claude Code 会话,和一次高效的会话,区别往往就在于上下文——而 CLAUDE.md 文件正是你提供这些上下文的方式。先写清楚你的技术栈、偏好和常用命令,然后随着使用逐步完善它。

对产品经理来说,CLAUDE.md 就像新员工入职时的「团队手册」:项目背景、常用工具命令、写作/编码规范都写在里面,新人(或者每次「失忆」重新开始的 Claude)一进来就照着手册干活,不用你每次都从头交代一遍。而团队共享的项目级手册,和只给自己用的个人偏好清单,分开放才不会互相干扰。
