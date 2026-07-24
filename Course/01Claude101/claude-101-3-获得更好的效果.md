# Claude 101 - 3 Getting Better Results 获得更好的效果

> Course: Claude 101 · Section "Meet Claude" · Lesson 3
> 课程: Claude 101 · 第一章「认识 Claude」第 3 课
> Estimated time: 15 minutes 预计用时: 15 分钟
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-11 翻译存档

## Learning objectives 学习目标

By the end of this lesson, you will be able to:

学完本课后,你将能够:

- Recognize common challenges when starting out with AI and use troubleshooting techniques to overcome them.

  识别刚开始使用 AI 时常见的挑战,并运用排查技巧加以解决。

- Define AI Fluency and know where to go to learn more about working with AI in a fluent way.

  定义什么是「AI 流畅度」(AI Fluency),并了解去哪里可以进一步学习如何更熟练地使用 AI。

- Explain how you might set up evals to better understand how Claude might perform with your unique workflows.

  说明如何设置评估(evals),以便更好地了解 Claude 在你独特的工作流程中可能有怎样的表现。

## Common challenges and how to fix them 常见挑战及应对方法

As you start working with Claude, you'll likely encounter moments where the response isn't quite what you expected. This is normal—and it's an opportunity to refine your approach. Here are some of the most common challenges and how to address them.

> 当你开始与 Claude 协作时,很可能会遇到回复不太符合预期的情况。这很正常——也正是你优化提问方式的机会。以下是一些最常见的挑战及应对方法。

**English**

| Challenge | What's happening | Try this |
|---|---|---|
| Claude's response is too generic | Your prompt didn't include enough context about your specific situation | Add details about your audience, role, or constraints. Instead of "Write an email about the project delay," try "Write an email to our enterprise client explaining that the software integration will be delayed by two weeks. They've been patient so far but this is the second delay. Keep it professional but apologetic." |
| The response is too long (or too short) | Claude is guessing at appropriate length | Be explicit: "Give me a two-paragraph summary" or "Keep this under 100 words" or "I need a comprehensive analysis—length isn't a concern." |
| Claude didn't follow my format | Claude understood what you want but not how you want it presented | Show, don't just tell. Provide an example of the format, or describe the structure explicitly: "Use bullet points with bold headers for each section." |
| I got confident-sounding information that turned out to be wrong | Claude occasionally generates plausible but incorrect information, especially with specific facts or niche topics | For high-stakes work, verify key facts independently. Ask Claude to cite sources or indicate confidence level. Enable web search to ground responses in current information. |
| The tone isn't right | Claude defaults to helpful and professional, which may not match your needs | Describe the tone in plain language: "Make this more conversational" or "This should sound authoritative and formal." Provide an example of writing in the style you want. |

**中文**

| 挑战 | 原因 | 建议做法 |
|---|---|---|
| Claude 的回复太笼统、千篇一律 | 你的提示词没有包含足够的具体情境信息 | 补充关于受众、角色或限制条件的细节。与其说「写一封关于项目延期的邮件」,不如说「给我们的企业客户写一封邮件,说明软件集成将延迟两周。他们此前一直很有耐心,但这已经是第二次延期了。语气要专业但带有歉意。」 |
| 回复太长(或太短) | Claude 在猜测合适的篇幅 | 明确说明:「给我一个两段式摘要」或「控制在 100 字以内」或「我需要一份全面的分析——篇幅不是问题」。 |
| Claude 没有按我要求的格式输出 | Claude 理解了你想要的内容,但不清楚你希望如何呈现 | 用示例说明,而不只是口头描述。提供格式范例,或明确描述结构:「每个部分用要点列表呈现,并加粗标题。」 |
| 我得到了听起来很可信、但其实是错的信息 | Claude 偶尔会生成看似合理但实际不准确的信息,尤其是在具体事实或小众话题上 | 对于高风险的工作,请独立核实关键事实。让 Claude 注明信息来源或标注可信度。开启网络搜索功能,让回复基于最新信息。 |
| 语气不对 | Claude 默认使用乐于助人且专业的语气,这可能不符合你的需求 | 用直白的语言描述你想要的语气:「让它更口语化一些」或「这应该听起来权威而正式」。提供一段你想要的写作风格范例。 |

## The iteration mindset 迭代式思维

One of the most important shifts when working with Claude is recognizing that your first prompt rarely produces a perfect result—and that's okay. Think of your initial prompt as the start of a conversation, not a one-shot request.

> 与 Claude 协作时,最重要的思维转变之一,就是认识到你的第一个提示词很少能一次就产生完美结果——这很正常。把你最初的提示词看作一段对话的开始,而不是一次性的请求。

Effective Claude users:

高效使用 Claude 的用户会:

- Treat first drafts as starting points. Review what Claude produces, identify what's working and what isn't, then refine.

  把初稿当作起点。审视 Claude 生成的内容,找出哪些有效、哪些无效,然后加以完善。

- Give specific feedback. "Make it shorter" is fine, but "Cut the first two paragraphs and make the conclusion more action-oriented" is better.

  给出具体的反馈。「简短一点」这样说可以,但「删掉前两段,让结论更有行动导向」会更好。

- Know when to start fresh. If a conversation has gone off track, sometimes it's faster to open a new chat with a clearer prompt than to try to redirect.

  懂得何时重新开始。如果对话已经跑偏,有时候开一个新对话、用更清晰的提示词重新开始,会比试图把原对话拉回正轨更快。

## What is AI Fluency? 什么是 AI 流畅度?

AI Fluency is the ability to collaborate effectively with AI tools—not just knowing which buttons to click, but developing the judgment to use AI well across different situations.

> AI 流畅度(AI Fluency)是指与 AI 工具高效协作的能力——不仅仅是知道该点哪个按钮,而是培养出在不同情境下都能善用 AI 的判断力。

The 4D Framework for AI Fluency, developed through research collaboration between Professor Rick Dakan (Ringling College of Art and Design) and Professor Joseph Feller (University College Cork), identifies four core competencies that, when combined, can help you make the most of your AI interactions:

> AI 流畅度的 4D 框架,由瑞格林艺术与设计学院(Ringling College of Art and Design)的 Rick Dakan 教授与科克大学学院(University College Cork)的 Joseph Feller 教授通过合作研究共同开发。该框架确定了四项核心能力,将它们结合起来,能帮助你充分发挥与 AI 互动的价值:

- **Delegation**: Deciding on what work should be done by humans, what work should be done by AI, and how to distribute tasks between them. Includes understanding your goals, AI capabilities, and making strategic choices about collaboration.

  **委派(Delegation)**:决定哪些工作应由人类完成、哪些应交给 AI,以及如何在两者之间分配任务。包括理解自己的目标、AI 的能力,并就协作方式做出策略性选择。

- **Description**: Effectively communicating with AI systems. Includes clearly defining outputs, guiding AI processes, and specifying desired AI behaviors and interactions.

  **描述(Description)**:与 AI 系统进行有效沟通。包括清晰地定义期望的输出、引导 AI 的处理过程,以及明确指定希望 AI 表现出的行为与互动方式。

- **Discernment**: Thoughtfully and critically evaluating AI outputs, processes, behaviors and interactions. Includes assessing quality, accuracy, appropriateness, and determining areas for improvement.

  **辨别(Discernment)**:审慎且批判性地评估 AI 的输出、处理过程、行为与互动。包括评估质量、准确性、适宜性,并找出可以改进的地方。

- **Diligence**: Using AI responsibly and ethically. Includes making thoughtful choices about AI systems and interactions, maintaining transparency, and taking accountability for AI-assisted work.

  **勤勉(Diligence)**:以负责任且合乎道德的方式使用 AI。包括审慎选择 AI 系统与互动方式、保持透明,并对 AI 辅助完成的工作承担责任。

You've already been practicing these skills throughout this course. The prompt framework from Lesson 2 (setting the stage, defining the task, specifying rules) is rooted in Description. The troubleshooting techniques above draw on Discernment and Diligence.

> 其实你在本课程中已经在练习这些能力了。第 2 课中的提示词框架(设定场景、明确任务、指定规则)正是植根于「描述」这项能力。上文的排查技巧则运用了「辨别」与「勤勉」。

To learn more, check out the free AI Fluency course that explores all four competencies in depth, with practical exercises and real-world applications.

> 想深入了解,可以学习 Anthropic 的免费 AI Fluency 课程,该课程深入探讨了这四项能力,并配有实践练习与真实应用案例。

## Evaluating Claude for your workflows 为你的工作流程评估 Claude

As you start integrating Claude into more of your work, you might wonder: how do I know if Claude is actually good at this particular task?

> 当你开始把 Claude 融入更多工作场景时,你可能会想:我怎么知道 Claude 是否真的擅长这项具体任务?

This is where Discernment becomes essential. Evals (short for evaluations) are a way to develop intuition for assessing Claude's outputs on the tasks that matter to you. They're systematic ways to test how well Claude performs on specific types of tasks that matter to you.

> 这正是「辨别」能力变得至关重要的地方。评估(evals,evaluations 的缩写)是一种培养直觉的方法,帮助你判断 Claude 在你所关心的任务上表现如何。它是一种系统性的方式,用来测试 Claude 在特定类型任务上的表现水平。

### Why evals matter 为什么评估很重要

Your work is unique. Claude might excel at drafting marketing copy but need more guidance for technical documentation in your specific domain. Running simple evals helps you:

> 你的工作是独一无二的。Claude 或许很擅长撰写营销文案,但在你所在领域的技术文档上可能需要更多指导。运行简单的评估可以帮助你:

- Understand where Claude adds the most value in your workflow

  了解 Claude 在你的工作流程中最能创造价值的环节

- Identify tasks where you'll need to provide more context or examples

  找出哪些任务需要你提供更多背景信息或示例

- Build confidence in Claude's outputs for recurring tasks

  对 Claude 在重复性任务上的输出建立信心

### A simple eval approach 一种简单的评估方法

You don't need complex infrastructure to evaluate Claude. Here's a practical approach:

> 评估 Claude 并不需要复杂的基础设施。以下是一种实用的方法:

1. **Gather examples.** Collect 5-10 examples of a task you do regularly—emails you've written, reports you've created, analyses you've done.

   **收集样本。** 收集 5-10 个你经常做的任务的样本——比如你写过的邮件、做过的报告、完成过的分析。

2. **Create test prompts.** Write prompts that would generate similar outputs. Include the context you'd naturally have when doing this work.

   **创建测试提示词。** 编写能生成类似输出的提示词,并包含你在实际完成这项工作时自然会具备的背景信息。

3. **Compare outputs.** Run your prompts and compare Claude's responses to your examples. Ask yourself:
   - Does Claude capture the key information?
   - Is the tone and style appropriate?
   - What's missing or could be improved?

   **对比输出。** 运行你的提示词,把 Claude 的回复与你的样本进行对比,并问自己:
   - Claude 是否抓住了关键信息?
   - 语气和风格是否合适?
   - 还缺少什么,或者有哪些可以改进的地方?

4. **Refine your approach.** Based on what you learn, adjust your prompts, add examples to show Claude what good looks like, or identify where human review is essential.

   **优化你的方法。** 根据学到的经验,调整提示词、添加示例向 Claude 展示什么是「好」的标准,或者找出哪些环节必须由人工审核。

### Example: Using Claude for data analysis 示例:用 Claude 做数据分析

> 原文提到课程页面内嵌了一段视频,节选自 Anthropic《非营利组织 AI 流畅度》(AI Fluency for nonprofits)课程,展示了用 Claude 做数据分析的示例;该视频本身未随文字内容一并提供,此处仅保留文字说明。

The example is relevant for anyone working with data in AI. To evaluate how Claude might work with your data:

> 这个示例对任何需要用 AI 处理数据的人都适用。要评估 Claude 处理你的数据的效果,可以:

- Find a dataset you've manually analyzed

  找一份你曾经手动分析过的数据集

- Create prompts that request Claude to do the analysis on your behalf

  编写提示词,让 Claude 代替你完成同样的分析

- Compare Claude's results to your originals

  将 Claude 的分析结果与你原本的分析进行对比

- Note patterns and refine your prompt accordingly: Maybe Claude gets the right numbers but misses the overall patterns

  记录规律并据此优化提示词:也许 Claude 能算对具体数字,却漏掉了整体趋势

This kind of lightweight evaluation helps you develop intuition for how to work with Claude on tasks that matter to you—and where to focus your review and refinement energy.

> 这种轻量级的评估方式,能帮助你培养出如何在你关心的任务上与 Claude 协作的直觉——以及应该把审核和优化的精力集中在哪里。

## Lesson reflection 课程反思

Before moving on, consider:

在进入下一课之前,不妨思考:

- Which of the common challenges have you already encountered? What techniques might you try next time?

  你已经遇到过上述哪些常见挑战?下次你会尝试哪些应对技巧?

- Where in your work would a simple eval help you understand if Claude is a good fit for a recurring task?

  在你的工作中,哪个环节适合用一次简单的评估,来判断 Claude 是否适合处理某项重复性任务?

- How might the 4D Framework help you think about your collaboration with Claude?

  4D 框架可以如何帮助你思考自己与 Claude 的协作方式?

## What's next 接下来是什么

In the next lesson, you'll explore the Claude desktop app and its three interaction modes: Chat, Cowork, and Code.

> 在下一课中,你将了解 Claude 桌面应用及其三种交互模式:Chat(对话)、Cowork(协作)和 Code(编程)。

## Feedback 反馈

As you progress through the course, Anthropic would love to hear how you are using concepts from the course in your work and any feedback you may have. Share your feedback via the link on the course page.

> 随着课程学习的深入,Anthropic 期待听到你如何将课程中的概念应用到工作中。可通过课程页面内的反馈链接分享意见。
