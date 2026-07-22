# Claude Code 101 - 9 Subagents 子智能体

> Course: Claude Code 101 · Lesson 9
> 课程: Claude Code 101 · 第 9 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 整理翻译存档

Claude can delegate tasks to subagents that break them down and run component tasks in parallel, improving your context management. Each subagent operates in its own isolated context window.

> Claude 可以把任务委派给子智能体(subagents),由它们拆解任务、并行处理各个子任务,从而改善你的上下文管理。每个子智能体都在自己独立、隔离的上下文窗口里运行。

## How It Works 工作原理

Managing context in Claude Code is important. A lot of the context window gets consumed by things like tool calls exploring your codebase or running web searches for research. What Claude discovers during that exploration isn't always relevant to the main feature you're developing.

> 在 Claude Code 里管理好上下文很重要。上下文窗口有很大一部分,会被诸如「探索代码库」「做研究性的网络搜索」这类工具调用占用。而 Claude 在探索过程中发现的很多内容,并不一定都和你正在开发的主功能相关。

This is where subagents come in. Claude spawns a subagent to handle a task like "explore this codebase for me." The subagent runs in parallel with its own context window, does all the exploration work, and once finished, summarizes its findings and returns that summary back to Claude.

> 这正是子智能体发挥作用的地方。Claude 会派生出一个子智能体去处理类似「帮我探索一下这个代码库」这样的任务。子智能体在自己独立的上下文窗口里并行运行,完成全部探索工作,结束后把发现总结成摘要,再返回给 Claude。

The result: you get the answer you were looking for, without the entire journey it took to get there cluttering your main context.

> 结果就是:你得到了想要的答案,而抵达这个答案所经历的一路探索过程,不会把你的主上下文弄得乱糟糟。

## Creating Your Own Subagent 创建你自己的子智能体

Subagents are defined in Markdown files with YAML frontmatter. The easiest way to get started is to let Claude generate one for you. Run:

> 子智能体是用带 YAML frontmatter 的 Markdown 文件来定义的。最简单的上手方式,是让 Claude 帮你生成一个。运行:

```
/agents
```

Then select "Create new agent." You'll walk through steps including choosing the scope of the agent, defining its purpose, selecting the tools it has access to, and even picking a color for it.

> 然后选择「Create new agent」(创建新智能体)。你会依次完成几个步骤:选择该智能体的作用范围、定义它的用途、选择它能使用哪些工具,甚至还能给它选一个颜色。

Claude will generate a name, description, and prompt for the subagent. This also tells Claude when to call the subagent based on the prompts you give it.

> Claude 会为这个子智能体生成名称、描述和提示词。这份描述同时也告诉 Claude:根据你给出的提示词,什么时候应该调用这个子智能体。

## Further Customization 进一步定制

Subagents can be customized further. Here are some highlights:

> 子智能体还可以进一步定制,以下是几个要点:

- **Persistent memory** lets your subagent retain memory across conversations. This is great if you're using it consistently on the same projects.

  **持久记忆(Persistent memory)** 让你的子智能体能够跨对话保留记忆。如果你一直在同一批项目里反复使用它,这个功能会很有用。

- **Preload skills** into subagents by adding the skill key and listing skills by name. Note that unlike skills in your main conversation, the entire skill is loaded into context here.

  **预加载技能(Preload skills)**:在配置里加上 skill 这个字段,按名称列出要预加载的技能,即可让子智能体预先加载这些技能。注意,和主对话里的技能不同,这里会把整个技能的内容都加载进上下文。

## Recap 小结

Keeping your context window clean is one of the best ways to stay productive with Claude Code. With subagents, you can run an agent in the background to handle the heavy lifting and return just the answer to your main context window.

> 保持上下文窗口干净整洁,是让你在 Claude Code 里保持高效的最佳方式之一。借助子智能体,你可以在后台运行一个智能体来处理繁重的工作,只把答案带回你的主上下文窗口。

对产品经理来说,子智能体很像你派出去做「专项调研」的同事:你不需要知道他翻了多少份资料、走了多少条弯路,只需要他回来给你一份「结论摘要」——这样你自己的会议记录(主上下文)才不会被大量调研细节淹没。
