# Claude Code 101 - 6 Context Management 上下文管理

> Course: Claude Code 101 · Lesson 6
> 课程: Claude Code 101 · 第 6 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 整理翻译存档

Context is Claude's working memory. Every file it reads, every command it runs, every message you send — it all takes up space in the context window.

> 上下文是 Claude 的工作记忆。它读的每一个文件、运行的每一条命令、你发的每一条消息——都会占用上下文窗口的空间。

## What is the Context Window? 什么是上下文窗口?

Think of the context window as the amount of space Claude can hold in its memory. Whenever you enter a prompt, Claude reads a file, runs a tool call, or receives a tool call result, it's all adding to the context window. Since there's a finite amount of space, it becomes important to optimize how you use it.

> 把上下文窗口想象成 Claude 记忆里能容纳的空间大小。你输入一条提示词、Claude 读一个文件、执行一次工具调用,或者拿到工具调用的结果,这些都会持续占用上下文窗口。由于空间有限,如何用好这部分空间就变得很重要。

> Diagram showing the context window as a grid of tokens — some taken, most available(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## What Happens When Context Fills Up 上下文占满后会发生什么

When you approach the limit, the context window is automatically compacted. Compaction summarizes important details and removes unnecessary tool call results to free up space. Note that this process can potentially lose details.

> 当接近上限时,上下文窗口会被自动「压缩」(compact)。压缩会保留重要细节的摘要,并移除不必要的工具调用结果,以腾出空间。请注意,这个过程可能会丢失一些细节。

> Claude Code showing 'Compacting conversation...' as it summarizes the context(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)
> Claude Code displaying a compact summary of the previous conversation including key technical concepts and files(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## Commands 常用命令

You can run compaction manually with the /compact command. This compacts everything up to that point. It's handy when you want to free up context space while keeping a memory of what you previously worked on.

> 你可以用 `/compact` 命令手动触发压缩,它会把当前为止的所有内容压缩起来。当你想腾出上下文空间、同时又想保留之前工作的记忆时,这个命令很好用。

> The /compact command in Claude Code's autocomplete menu(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

If you want to completely start from scratch with no memory of the previous session, run /clear. This removes everything.

> 如果你想彻底从零开始、不保留上一次会话的任何记忆,运行 `/clear`。这会清空所有内容。

> Running /clear in Claude Code to start a fresh session(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

To check the state of your context, run the /context command. You'll get a high-level overview of your context size, the categories taking up the most space, and a visual graphic showing the breakdown.

> 想查看当前上下文的状态,运行 `/context` 命令。你会看到上下文大小的整体概览、占用空间最多的几个类别,以及一张展示明细分布的可视化图表。

> Output of the /context command showing context usage breakdown with a visual bar chart(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## When to Use Which 该用哪个命令

A general rule of thumb:

> 一个大致的判断原则:

- Use /compact when you're working on a specific feature and running up against the context limit but need to continue. Keeping the context relevant to your current feature is important.

  当你正在开发某个具体功能、快撞到上下文上限但还需要继续时,用 `/compact`。让上下文始终围绕当前这个功能保持相关性,这一点很重要。

- Use /clear when you want to start a new feature. You don't want the previous conversation to introduce bias into something new. For things you want Claude to remember across sessions, put them in your CLAUDE.md file so it doesn't have to rediscover things from scratch.

  当你想开始一个新功能时,用 `/clear`。你不希望之前的对话给全新的任务带来偏见。如果有些内容你希望 Claude 跨会话记住,就把它们写进 CLAUDE.md 文件,这样它就不用每次都从零摸索。

> A CLAUDE.md file with commands, important notes, and architecture sections(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## Tips for Saving Context Space 节省上下文空间的技巧

Be specific. A vague prompt might seem smaller, but it actually costs more context in the long run. Without clear instructions, Claude is forced to explore your codebase more and do its own reasoning — which takes up far more context space than a detailed prompt would.

> **说清楚需求。** 一条模糊的提示词看起来更「短」,但从长远看反而更费上下文。指令不清楚时,Claude 就得花更多力气去探索你的代码库、自己推理——这比一条详细的提示词占用的上下文要多得多。

Manage your MCP servers. MCP servers load all of their available tools into context by default, even when you're not using them. If you have servers configured for things unrelated to the current project, consider turning them off. You can also try "Skills," which work similarly to MCP servers but don't load everything into context upfront.

> **管理好你的 MCP 服务器。** MCP 服务器默认会把它所有可用的工具都加载进上下文,哪怕你根本用不上。如果你配置了一些和当前项目无关的服务器,可以考虑关掉它们。你也可以试试「Skills」(技能),它的作用和 MCP 服务器类似,但不会一开始就把所有内容都塞进上下文。

Use subagents. Subagents run in parallel with your main agent but have a completely separate context window. For tasks where you only need the answer — like "where are the authentication endpoints located?" — a subagent does the work and returns just a summary to your main agent, keeping your primary context clean.

> **善用子智能体(subagents)。** 子智能体和主智能体并行运行,但拥有完全独立的上下文窗口。对于那些你只需要「结果」的任务——比如「认证相关的接口在哪里?」——子智能体会去完成这项工作,只把摘要返回给主智能体,让你的主上下文保持干净。

## Recap 小结

Managing context within Claude Code is crucial. Use /compact to summarize long sessions and /clear to start fresh. To use your context window effectively: be specific with your prompts, check what's consuming your current context, and use subagents to delegate tasks where you only need the result.

> 在 Claude Code 里管理好上下文至关重要。用 `/compact` 总结长会话,用 `/clear` 重新开始。想用好上下文窗口,记住三点:提示词要具体、时常检查当前上下文都花在哪里了、把「只要结果」的任务交给子智能体去做。

对产品经理来说,上下文窗口很像团队的「会议纪要空间」——开会记的东西越多,能记住的细节就越丰富,但空间总会用满。用满了就得「归纳总结」(/compact)或者「另起一个新会」(/clear)。而子智能体就像是派一个人出去单独调研、只带回一份结论摘要,不占用主会议室的讨论空间。
