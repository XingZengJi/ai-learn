# Claude Code 101 - 7 Code Review 代码审查

> Course: Claude Code 101 · Lesson 7
> 课程: Claude Code 101 · 第 7 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 整理翻译存档

Claude Code has a few built-in features that make your git workflow faster. Let's go through them.

> Claude Code 内置了几项功能,能让你的 git 工作流更快。我们逐一来看。

## Review with a Subagent 用子智能体做审查

Before you push a PR, ask Claude to use a subagent to review your changes. The subagent runs in its own context window with fresh eyes — it doesn't carry the bias of the main agent that just spent the session writing the code.

> 在推送 PR(Pull Request)之前,让 Claude 用一个子智能体来审查你的改动。子智能体在自己独立的上下文窗口里运行,带着一双「没有成见的新眼睛」——它不会带着主智能体这次会话里写代码时积累下来的思维定势。

When creating a code-reviewer subagent, restrict it to read-only tools. A reviewer should flag issues, not edit files. Check the subagent configuration into your repo so your whole team uses the same reviewer.

> 创建一个代码审查员(code-reviewer)子智能体时,把它限制成只能使用只读工具。审查员的职责是标出问题,而不是直接改文件。把子智能体的配置提交进仓库,这样团队里每个人用的都是同一个审查员。

## The /commit-push-pr Skill /commit-push-pr 技能

The /commit-push-pr skill handles the commit, push, and PR creation all in one step. Instead of doing each manually, just run the skill and Claude takes care of it.

> `/commit-push-pr` 这个技能(Skill)能一步完成提交、推送和创建 PR。你不用手动一步步操作,直接运行这个技能,Claude 就会全部搞定。

If you have a Slack MCP server configured with channels listed in your CLAUDE.md, it will automatically post the PR link to your team's channel.

> 如果你配置了 Slack 的 MCP 服务器,并在 CLAUDE.md 里列出了频道,它会自动把 PR 链接发到你团队的频道里。

## Session Linking with --from-pr 用 --from-pr 关联会话

When Claude creates a PR through gh pr create, the session gets linked to that PR automatically. If you need to come back to it later — maybe to address review comments or fix a failing build — run:

> 当 Claude 通过 `gh pr create` 创建 PR 时,这次会话会自动和这个 PR 关联起来。如果你之后需要回来处理——比如回应审查意见,或者修复失败的构建——运行:

```
claude --from-pr <PR_NUMBER>
```

This picks up right where you left off.

> 这样就能从上次停下的地方继续接着做。

## Recap 小结

Use a subagent for an unbiased code review before pushing. Use /commit-push-pr to handle the full commit-to-PR flow in one step. And use --from-pr to resume work on a PR later. These are small features, but they remove a lot of friction from your daily workflow.

> 推送之前,用子智能体做一次没有偏见的代码审查。用 `/commit-push-pr` 一步完成从提交到 PR 的整个流程。用 `--from-pr` 在之后继续处理某个 PR。这些都是不起眼的小功能,但能大大减少日常工作流里的摩擦。

对产品经理来说,子智能体审查员就像请一位没参与过这次开发、纯粹「外部视角」的评审来把关,不会被开发过程中的思路惯性带偏;`/commit-push-pr` 相当于把「提交 - 推送 - 发起评审」这一串审批流程打包成一键提交;`--from-pr` 则像是给每个 PR 配了一份可以随时续上的工作记录,评审提了意见回来改,不用从头对齐上下文。
