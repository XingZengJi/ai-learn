# Building with the Claude API - 12 Prompt evaluation 提示词评估

> Course: Building with the Claude API · Lesson 12
> 课程: Building with the Claude API · 第 12 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

When working with Claude, writing a good prompt is just the beginning. To build reliable AI applications, you need to understand two critical concepts: prompt engineering and prompt evaluation. Prompt engineering gives you techniques for writing better prompts, while prompt evaluation helps you measure how well those prompts actually work.

> 使用 Claude 时,写出一个好提示词只是第一步。要打造可靠的 AI 应用,你需要理解两个关键概念:提示词工程(prompt engineering)和提示词评估(prompt evaluation)。提示词工程给你一套写出更好提示词的技巧,而提示词评估帮你衡量这些提示词实际效果究竟如何。

## Prompt Engineering vs Prompt Evaluation 提示词工程 vs 提示词评估

Prompt engineering is your toolkit for crafting effective prompts. It includes techniques like:

- Multishot prompting
- Structuring with XML tags
- Many other best practices

  提示词工程是你打磨提示词的工具箱,包括这些技巧:多样本提示(multishot prompting);用 XML 标签做结构化;以及许多其他最佳实践。

These techniques help Claude understand exactly what you're asking for and how you want it to respond.

> 这些技巧能帮助 Claude 准确理解你到底在要求什么、希望它如何回应。

Prompt evaluation takes a different approach. Instead of focusing on how to write prompts, it's about measuring their effectiveness through automated testing. You can:

- Test against expected answers
- Compare different versions of the same prompt
- Review outputs for errors

  提示词评估走的是另一条路。它不关注「怎么写提示词」,而是通过自动化测试来衡量提示词的实际效果。你可以:拿输出和预期答案做比对;对比同一个提示词的不同版本;检查输出里的错误。

## Three Paths After Writing a Prompt 写完提示词之后的三条路

Once you've drafted a prompt, you typically face three options for what to do next:

> 提示词草稿写完之后,接下来通常有三条路可选:

Option 1: Test the prompt once and decide it's good enough. This carries a significant risk of breaking in production when users provide unexpected inputs.

> 选项一:只测一次,觉得「差不多了」就上线。这样做的风险很大——一旦用户输入了意料之外的内容,上线后很可能就会出问题。

Option 2: Test the prompt a few times and tweak it to handle a corner case or two. While better than option 1, users will often provide very unexpected outputs that you haven't considered.

> 选项二:测几次,针对一两个边界情况做些微调。这比选项一好一些,但真实用户给出的输入,往往会超出你能想到的范围。

Option 3: Run the prompt through an evaluation pipeline to score it, then iterate on the prompt based on objective metrics. This approach requires more work and cost, but gives you much more confidence in your prompt's reliability.

> 选项三:把提示词跑一遍评估流水线,给它打分,再基于客观指标去迭代。这种做法需要投入更多精力和成本,但能让你对提示词的可靠性有更大的信心。

## Why Most Engineers Fall Into Testing Traps 为什么大多数工程师都会掉进测试陷阱

Options 1 and 2 are common traps that all engineers fall into, myself included. It's natural to write a prompt for a serious application and not test it thoroughly enough. We tend to underestimate how many edge cases real users will encounter.

> 选项一和选项二是几乎所有工程师(包括我自己)都会踩的常见陷阱。给一个正经应用写提示词,却测得不够充分,这是很自然会发生的事——我们往往低估了真实用户会撞见多少边界情况。

The reality is that when you deploy a prompt to production, users will interact with it in ways you never anticipated. What seemed like a solid prompt during your limited testing can quickly break down when faced with the full variety of real-world inputs.

> 现实是:提示词一旦上线,用户和它交互的方式会超出你的想象。一个在有限测试中看起来很扎实的提示词,一旦面对现实世界五花八门的输入,很快就可能失效。

## The Evaluation-First Approach 「评估优先」的方法

Option 3 represents a more systematic approach to prompt development. By running your prompt through an evaluation pipeline, you get objective metrics about its performance across a broader range of test cases. This data-driven approach lets you:

- Identify weaknesses before they become production issues
- Compare different prompt versions objectively
- Iterate with confidence based on measurable improvements
- Build more reliable AI applications

  选项三代表了一套更系统化的提示词开发方法。把提示词跑一遍评估流水线,你就能拿到它在更广泛测试用例上的客观表现指标。这种数据驱动的方式能让你:在问题变成线上事故之前先发现薄弱点;客观地对比不同版本的提示词;基于可量化的改进有底气地持续迭代;打造更可靠的 AI 应用。

While this approach requires more upfront investment in time and testing infrastructure, it pays dividends in the reliability and robustness of your final application. The goal is to catch problems during development rather than after your users encounter them.

> 这种方法虽然需要在时间和测试基础设施上先多投入一些,但换来的是最终应用更高的可靠性和健壮性。目标是在开发阶段就把问题揪出来,而不是等用户先撞上了才知道。

对产品经理来说,这三条路和「需求验收」的逻辑是相通的:选项一像是「自己看一眼原型觉得没问题就发布」;选项二像是「找两个同事顺手点点,发现的小问题改一改」;选项三则是「拉一批真实场景用例做完整验收测试,量化打分,达标才上线」。第三种路径成本更高,但省下的是上线后被用户和线上事故反复打脸的代价。
