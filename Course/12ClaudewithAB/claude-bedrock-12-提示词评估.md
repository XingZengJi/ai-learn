# Claude with AWS Bedrock - 12 Prompt Evaluation 提示词评估

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 12
> 课程: Claude with AWS Bedrock · 第 12 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

When working with Claude, writing a good prompt is just the beginning. To build reliable AI applications, you need to understand two critical concepts: prompt engineering and prompt evaluation. Prompt engineering gives you techniques for crafting better prompts, while prompt evaluation helps you measure how well those prompts actually work.

> 使用 Claude 时,写出一个好的提示词只是个开始。要构建可靠的 AI 应用,你需要理解两个至关重要的概念:提示词工程(prompt engineering)和提示词评估(prompt evaluation)。提示词工程为你提供打磨提示词的技巧,而提示词评估则帮你衡量这些提示词到底效果如何。

对产品经理来说,这个区别很像「写产品文案」和「做 A/B 测试」的区别:文案技巧(提示词工程)能帮你把话写得更打动人,但只有数据测试(提示词评估)才能告诉你这段文案是不是真的有效——光凭「我觉得写得不错」是靠不住的。

## Prompt Engineering vs Prompt Evaluation 提示词工程 与 提示词评估

Prompt engineering is your toolkit for writing and improving prompts. It's a set of best practices that help Claude understand exactly what you're asking for and how you want it to respond. Think of it as the craft of prompt writing - techniques like multishot prompting, structuring with XML tags, and many other approaches we'll explore.

> 提示词工程是你写好、改好提示词的工具箱。它是一套最佳实践,能帮 Claude 准确理解你到底想要什么、希望它怎么回应。可以把它理解成「撰写提示词」这门手艺——比如多样本提示(multishot prompting)、用 XML 标签做结构化,以及我们接下来会探讨的其他各种方法。

Prompt evaluation, on the other hand, is about measurement. It's automated testing that gives you objective metrics on whether your prompts are actually effective. Instead of guessing if your prompt works well, evaluation lets you:

> 而提示词评估关乎「衡量」。它是一套自动化测试,能给出关于你的提示词是否真正有效的客观指标。有了评估,你不再需要凭猜测判断提示词好不好用,而是可以:

- Test against expected answers. 用预期答案来做比对测试。
- Compare different versions of the same prompt. 比较同一个提示词的不同版本。
- Review outputs for errors. 检查输出中的错误。

## The Three Paths After Writing a Prompt 写完提示词之后的三条路

Once you've drafted a prompt, you typically face three options for what to do next:

> 一旦你草拟出一个提示词,接下来通常有三种选择:

**Option 1:** Test the prompt once and decide it's good enough. This carries a significant risk of breaking in production when users provide unexpected inputs.

> **选项一:** 测试一次,觉得「够用了」就定下来。这样做的风险很大——一旦用户在生产环境中输入了意料之外的内容,很容易翻车。

**Option 2:** Test the prompt a few times and tweak it to handle a corner case or two. While better than option 1, this approach still leaves you vulnerable because users will often provide very unexpected outputs that you haven't considered.

> **选项二:** 测试几次,针对一两个边界情况做些微调。这比选项一好一些,但仍然存在隐患,因为用户经常会提供你完全没有预料到的输入。

**Option 3:** Run the prompt through an evaluation pipeline to score it, then iterate on the prompt based on objective data. This requires more work and cost upfront, but gives you much more confidence in your prompt's reliability.

> **选项三:** 把提示词跑一遍评估流水线,给它打分,再根据客观数据来迭代改进。这需要更多前期的工作量和成本,但能让你对提示词的可靠性拥有更强的信心。

## Why Most Engineers Fall Into Testing Traps 为什么大多数工程师会掉进测试的陷阱

Options 1 and 2 are traps that all engineers fall into, myself included. It's natural to write a prompt for a serious application and not test it thoroughly enough. We tend to test with inputs that seem obvious to us, but real users will interact with your prompts in ways you never anticipated.

> 选项一和选项二是几乎所有工程师都会掉进去的陷阱,我自己也不例外。给一个正经应用写提示词,却没有充分测试,这种情况太常见了。我们往往只会用「自己觉得很显然」的输入去测试,但真实用户和你的提示词互动的方式,常常超出你的想象。

The solution is to embrace option 3: systematic evaluation. By running your prompts through proper evaluation pipelines, you get objective scores that tell you how well your prompt performs across a wide range of scenarios. This data-driven approach lets you iterate confidently and catch issues before they reach production.

> 解决办法是拥抱选项三:系统化的评估。通过把提示词跑一遍规范的评估流水线,你能拿到客观的分数,了解它在各种场景下的表现如何。这种数据驱动的方式,能让你有信心地迭代改进,并在问题进入生产环境之前就把它们揪出来。

Understanding evaluation first gives you the foundation to measure improvements as you apply prompt engineering techniques. Once you can reliably measure prompt effectiveness, you can experiment with different approaches and know definitively which ones work better.

> 先理解评估这件事,能为你之后运用提示词工程技巧、衡量改进效果打下基础。一旦你能可靠地衡量提示词的有效性,你就可以尝试不同的方法,并明确知道哪一种效果更好。
