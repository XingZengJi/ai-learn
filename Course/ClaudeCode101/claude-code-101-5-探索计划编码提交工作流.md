# Claude Code 101 - 5 The Explore → Plan → Code → Commit Workflow 「探索 → 计划 → 编码 → 提交」工作流

> Course: Claude Code 101 · Lesson 5
> 课程: Claude Code 101 · 第 5 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 整理翻译存档

If you take one thing away from this course, let it be this workflow: Explore, Plan, Code, and Commit. Without it, most people jump straight to asking Claude to write code — which means more course-correcting later on.

> 如果这门课你只记住一件事,那就是这套工作流:探索(Explore)、计划(Plan)、编码(Code)、提交(Commit)。不遵循这套流程的话,大多数人会直接让 Claude 写代码——这往往意味着后面要花更多力气纠偏。

## Explore and Plan 探索与计划

The fastest way to handle these first two steps is with Plan Mode. In plan mode, Claude can't edit files — it just reads files to gather information about how it will tackle the implementation.

> 处理前两步最快的方式就是用计划模式。在计划模式下,Claude 不能编辑文件——它只是阅读文件,收集信息,来决定该如何实现。

To enter plan mode, press Shift + Tab until you see "Plan Mode" under the text input. Then write a prompt like:

> 按 Shift + Tab 直到文本输入框下方显示「Plan Mode」,即可进入计划模式。然后写一条类似这样的提示词:

> Claude Code status bar showing plan mode on with shift+tab to cycle(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

> "I need to add WebP conversion to our image upload pipeline. Figure out where in the pipeline it should happen, whether we need new dependencies, and how to approach it."
>
> 「我需要在我们的图片上传流程里加入 WebP 格式转换。请你判断这一步应该加在流程的哪个环节,是否需要新的依赖,以及具体该怎么做。」

Claude will read relevant files, run some web searches, and give you a plan of action. Review it and decide if it meets your criteria. If not, ask it to revise specific areas.

> Claude 会阅读相关文件、做一些网络搜索,然后给你一份行动计划。审阅一下,判断是否符合你的要求。如果不符合,让它针对具体部分修改。

> Claude Code presenting the plan with options to approve, revise areas, or ask questions(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

This is the best place to course-correct because it's before any code is written. You can also run the explore subagent without being in plan mode if you just want a general summary of your codebase without intending to make changes afterward.

> 这是纠偏成本最低的时机,因为此时还没有写任何代码。如果你只是想大致了解一下代码库、之后并不打算真的动手改动,也可以不进入计划模式,直接跑「探索」子智能体(explore subagent)。

## Code 编码

Once the plan looks good, select "approve" to accept it and let Claude work through the list items. You can choose whether Claude auto-accepts file edits or asks you each time.

> 计划没问题后,选择「批准」(approve)来接受它,让 Claude 逐项完成清单里的任务。你可以选择让 Claude 自动接受文件编辑,还是每次都询问你。

Claude will do its best to troubleshoot before considering the plan "finished," but at times you'll need to step in. This is the benefit of working with Plan Mode — after execution, you also have the context of how you got to the results, which helps guide Claude's next decisions.

> 在认定计划「完成」之前,Claude 会尽力自行排查问题,但有时你仍需要介入。这正是用计划模式工作的好处——执行完之后,你手上还留着「是如何一步步得到这个结果」的完整上下文,这有助于指导 Claude 接下来的决策。

A few tips to make the coding phase smoother:

> 让编码阶段更顺利的几个小技巧:

- **Define a success criteria.** For Claude to be confident in its results, it needs to be clear on what "correct" looks like. Make this explicit when writing your plan.

  **明确成功标准。** Claude 要对自己的结果有把握,就需要清楚「正确」长什么样。写计划的时候就把这一点明确写出来。

- **Add tools.** Tools that help Claude complete its goals remove a lot of back and forth. For example, if you're building web UIs, install the Claude in Chrome extension so Claude Code can control a browser tab and test the UI directly.

  **添加工具。** 能帮助 Claude 达成目标的工具,可以省去很多来回沟通。比如,如果你在做网页 UI,可以安装 Claude in Chrome 扩展,让 Claude Code 直接控制浏览器标签页、亲自测试界面效果。

  > The Claude in Chrome extension page in the Chrome Web Store(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

- **Include a test suite.** Give Claude a test suite it can continuously validate against. Claude can even write tests for you. Before handing this off, make sure the tests are a reliable source of truth to avoid false positives.

  **准备一套测试。** 给 Claude 一套可以持续用来验证的测试。Claude 甚至能帮你写测试。在把这个交给它之前,先确保这些测试本身是可靠的「标准答案」,避免出现假阳性(测试通过但实际有问题)。

Quick tip: If you find Claude keeps running into the same issues, ask it to save the solution to its CLAUDE.md file.

> 小贴士:如果你发现 Claude 反复遇到同一个问题,可以让它把解决方案记录到 CLAUDE.md 文件里。

## Commit 提交

Once you've tested the changes yourself and are happy with the results, it's time to push your code. Before you commit, run a subagent code reviewer to look at your work. A subagent gets a fresh pair of eyes on the codebase — it doesn't carry the bias the main agent might have from the session.

> 等你自己测试过改动、对结果满意之后,就可以推送代码了。提交之前,先跑一个子智能体代码审查员(code reviewer)来检查你的成果。子智能体相当于一双「没有成见的新眼睛」——它不会带着主智能体在这次会话里积累下来的思维定势。

> A code-reviewer subagent running in Claude Code, reading files and reviewing recent changes(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

Then get Claude to generate a commit message in your style. Rinse and repeat.

> 然后让 Claude 按照你的风格生成一条提交信息。如此循环往复。

## Recap 小结

To be effective with Claude Code, follow the Explore, Plan, Code, and Commit workflow:

> 想高效使用 Claude Code,请遵循「探索、计划、编码、提交」这套工作流:

- Explore gives Claude the relevant context it needs for your project.

  探索(Explore)让 Claude 获得你项目所需的相关上下文。

- Plan creates a plan of action that Claude uses to measure success.

  计划(Plan)生成一份行动方案,Claude 用它来衡量最终是否成功。

- Code is the back and forth between you and Claude before settling on the final outcome.

  编码(Code)是你和 Claude 之间反复打磨,直到敲定最终成果的过程。

- Commit helps you review and push your code so you can start on your next feature.

  提交(Commit)帮你审阅并推送代码,这样你就能开始下一个功能了。

对产品经理来说,这套工作流很像带团队做一个需求:先让人去「调研」清楚现状(探索),整理出一份「需求方案」让你拍板(计划),照方案「开发」并中途反复对齐(编码),最后「验收上线」并复盘交接(提交)。四步都做到位,返工和翻车的概率就会小很多。
