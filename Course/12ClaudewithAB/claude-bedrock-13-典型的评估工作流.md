# Claude with AWS Bedrock - 13 A Typical Eval Workflow 典型的评估工作流

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 13
> 课程: Claude with AWS Bedrock · 第 13 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

A typical prompt evaluation workflow follows a systematic approach to objectively measure and improve your prompts. While there are many different ways to assemble these workflows and various open source and paid tools available, understanding the core process helps you start small and scale up as needed.

> 一套典型的提示词评估工作流,遵循一种系统化的方法来客观地衡量和改进你的提示词。虽然搭建这类工作流的方式有很多种,也有各种开源和付费工具可用,但理解其核心流程,能帮你先从小处着手,再按需逐步扩展。

## Step 1: Draft Your Initial Prompt 第一步:草拟初始提示词

Start by writing out a basic prompt that you want to improve. For this example, we'll use a simple prompt structure:

> 先写出一个你想要改进的基础提示词。在这个例子里,我们用一个简单的提示词结构:

```python
prompt = f"""
Please answer the user's question:

{question}
"""
```

This gives us a baseline to work from. We won't know if it's effective until we evaluate it with some objective methodology.

> 这给了我们一个可以继续改进的基准版本。在用某种客观的方法评估它之前,我们并不知道它效果如何。

## Step 2: Create an Evaluation Dataset 第二步:创建评估数据集

Your evaluation dataset contains sample inputs that you'll feed into your prompt. Since our prompt only has one input (the user's question), we need a collection of different questions to test with.

> 你的评估数据集包含一批你会喂给提示词的样本输入。由于我们的提示词只有一个输入项(用户的问题),我们需要准备一批不同的问题来做测试。

The dataset contains questions that we will merge with our prompt. You can assemble these datasets by hand or generate them using Claude. In real-world evaluations, you might have tens, hundreds, or even thousands of different records, but we'll start with just three questions for this example:

> 这个数据集包含一批将与提示词合并使用的问题。你可以手动整理这些数据集,也可以用 Claude 生成。在真实的评估场景中,你可能会有几十条、几百条甚至上千条不同的记录,但在这个例子里,我们先从三个问题开始:

- What's 2+2? 2+2 等于几?
- How do I make oatmeal? 我该怎么做燕麦粥?
- How far away is the Moon? 月球有多远?

## Step 3: Feed Through Claude 第三步:喂给 Claude 处理

Take each question from your dataset and merge it with your prompt template to create complete prompts. Then send each one to Claude and collect the responses.

> 取出数据集中的每一个问题,把它和提示词模板合并,构造出完整的提示词。然后把每一条都发送给 Claude,收集它们的响应。

For example, the first question becomes a complete prompt that Claude can respond to. You'll repeat this process for all records in your dataset, getting back responses like "2 + 2 = 4", detailed oatmeal instructions, and information about the Moon's distance.

> 举例来说,第一个问题会变成一份 Claude 可以直接响应的完整提示词。你会对数据集中的每一条记录重复这个过程,得到诸如「2 + 2 = 4」、详细的燕麦粥做法,以及关于月球距离的信息这样的响应。

## Step 4: Feed Through a Grader 第四步:交给评分器打分

Now comes the crucial step: objectively scoring Claude's responses. Take each question-answer pair and feed them into a grader that will evaluate the quality of Claude's response.

> 接下来是关键的一步:客观地给 Claude 的响应打分。把每一对「问题-答案」交给一个评分器(grader),由它来评估 Claude 响应的质量。

The grader assigns scores (typically 1-10) based on response quality:

> 评分器会根据响应质量给出分数(通常是 1-10 分):

- 10 = Perfect answer, no room for improvement. 10 分 = 完美答案,没有改进空间。
- 4 = Definitely room for improvement. 4 分 = 明显还有改进空间。
- 1 = Poor or incorrect response. 1 分 = 差劲或错误的响应。

In our example, the responses might score 10, 4, and 9 respectively. Average these scores together to get an overall performance metric: 7.66.

> 在我们的例子里,这三条响应可能分别得到 10 分、4 分、9 分。把这些分数取平均,得到一个整体的表现指标:7.66。

## Step 5: Change Prompt and Repeat 第五步:修改提示词并重复流程

With your baseline score established, you can now iterate on your prompt. Try adding more specific instructions to guide Claude's responses:

> 有了基准分数之后,你就可以开始迭代改进提示词了。试着加入更具体的指令,来引导 Claude 的响应:

```python
prompt = f"""
Please answer the user's question:

{question}

Answer the question with ample detail
"""
```

Run this improved prompt through the entire evaluation pipeline again. Compare the scores to see which version performs better.

> 把这个改进后的提示词重新跑一遍整个评估流水线,比较两次的分数,看看哪个版本表现更好。

## Prompt Scoring and Iteration 提示词打分与迭代

The power of this workflow lies in getting objective measurements for each prompt version. You can compare scores across different iterations and use the version with the best performance, or continue iterating to find even better approaches.

> 这套工作流的价值,就在于能为每一个提示词版本拿到客观的衡量结果。你可以比较不同迭代版本之间的分数,采用表现最好的那个版本,或者继续迭代,寻找更好的方法。

In our example:

> 在我们的例子里:

- Prompt v1 scored 7.66. 提示词 v1 得分 7.66。
- Prompt v2 scored 8.7. 提示词 v2 得分 8.7。

The higher score for v2 suggests that adding "Answer the question with ample detail" improved the prompt's performance across our test cases.

> v2 更高的分数说明,加入「请充分详细地回答问题」这句话,提升了提示词在我们测试用例中的整体表现。

This systematic approach gives you an objective way to measure prompt improvements rather than relying on subjective judgment. You can start with a simple implementation and gradually add more sophisticated evaluation criteria as your needs grow.

> 这种系统化的方法,给了你一种客观衡量提示词改进效果的方式,而不用依赖主观判断。你可以从一个简单的实现开始,随着需求的增长,逐步加入更精细的评估标准。
