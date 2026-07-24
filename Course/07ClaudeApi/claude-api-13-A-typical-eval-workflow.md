# Building with the Claude API - 13 A typical eval workflow 典型的评估工作流

> Course: Building with the Claude API · Lesson 13
> 课程: Building with the Claude API · 第 13 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

A typical prompt evaluation workflow follows five key steps that help you systematically improve your prompts through objective measurement. While there are many different ways to assemble these workflows and various open source and paid tools available, understanding the core process helps you start small and scale up as needed.

> 一套典型的提示词评估工作流通常包含五个关键步骤,帮你通过客观度量系统性地改进提示词。虽然搭建这类工作流的方式五花八门,也有各种开源和付费工具可用,但理解这个核心流程能让你从小处起步,再按需扩展。

## Step 1: Draft a Prompt 第一步:起草一个提示词

Start by writing an initial prompt that you want to improve. For this example, we'll use a simple prompt:

> 先写一个你想要改进的初始提示词。这个例子里,我们用一个简单的提示词:

```python
prompt = f"""
Please answer the user's question:

{question}
"""
```

This basic prompt will serve as our baseline for testing and improvement.

> 这个基础提示词会作为我们测试和改进的基准线(baseline)。

## Step 2: Create an Eval Dataset 第二步:创建评估数据集

Your evaluation dataset contains sample inputs that represent the types of questions or requests your prompt will handle in production. The dataset should include questions that will be interpolated into your prompt template.

> 评估数据集包含一批样本输入,代表这个提示词在生产环境中会处理的各类问题或请求。数据集里的问题会被插入到你的提示词模板中。

For this example, our dataset includes three questions:

- "What's 2+2?"
- "How do I make oatmeal?"
- "How far away is the Moon?"

  这个例子里,我们的数据集包含三个问题:「2+2 等于几?」「怎么煮燕麦片?」「月球有多远?」

In real-world evaluations, you might have tens, hundreds, or even thousands of records. You can assemble these datasets by hand or use Claude to generate them for you.

> 在真实的评估场景中,你可能会有几十、几百甚至几千条记录。这些数据集既可以手工整理,也可以用 Claude 帮你生成。

## Step 3: Feed Through Claude 第三步:喂给 Claude

Take each question from your dataset and merge it with your prompt template to create complete prompts. Then send each one to Claude to get responses.

> 把数据集里的每个问题和提示词模板合并,组成完整的提示词,再逐一发送给 Claude 获取响应。

For example, the first question becomes:

> 比如,第一个问题会变成:

```
Please answer the user's question:
What's 2+2?
```

Claude might respond with "2 + 2 = 4" for the math question, provide oatmeal cooking instructions for the second question, and give the distance to the Moon for the third.

> 对于这道数学题,Claude 可能会回答「2 + 2 = 4」;对第二个问题给出煮燕麦片的步骤;对第三个问题给出月球的距离。

## Step 4: Feed Through a Grader 第四步:交给评分器

The grader evaluates the quality of Claude's responses by examining both the original question and Claude's answer. This step provides objective scoring, typically on a scale from 1 to 10, where 10 represents a perfect answer and lower scores indicate room for improvement.

> 评分器(grader)会同时查看原始问题和 Claude 的回答,来评估回答质量。这一步会给出客观打分,通常用 1 到 10 分——10 分代表完美答案,分数越低代表还有改进空间。

In our example, the grader might assign:

- Math question: 10 (perfect answer)
- Oatmeal question: 4 (needs improvement)
- Moon question: 9 (very good answer)

  在这个例子里,评分器可能会给出:数学题 10 分(完美答案);燕麦片问题 4 分(需要改进);月球问题 9 分(非常好的答案)。

The average score across all questions gives you an objective measurement: (10 + 4 + 9) ÷ 3 = 7.66

> 所有问题的平均分,给了你一个客观的度量指标:(10 + 4 + 9) ÷ 3 = 7.66。

## Step 5: Change Prompt and Repeat 第五步:修改提示词,重复流程

Now that you have a baseline score, you can modify your prompt and run the entire process again to see if your changes improve performance.

> 有了这个基准分数之后,你就可以修改提示词,再把整个流程跑一遍,看看改动是否提升了效果。

For example, you might add more guidance to your prompt:

> 比如,你可以在提示词里加入更多指引:

```python
prompt = f"""
Please answer the user's question:

{question}

Answer the question with ample detail
"""
```

After running this improved prompt through the same evaluation process, you might get a higher average score of 8.7, indicating that the additional instruction helped Claude provide better responses.

> 把这个改进后的提示词跑一遍同样的评估流程,你可能会得到更高的平均分,比如 8.7——说明新增的这句指引确实帮助 Claude 给出了更好的回答。

## Prompt Scoring 提示词打分

The key benefit of this workflow is getting objective measurements of prompt performance. You can:

- Compare different prompt versions numerically
- Use the version with the best score
- Continue iterating to find even better approaches

  这套工作流最大的价值,就是能获得提示词表现的客观量化指标。你可以:用具体数字对比不同版本的提示词;采用分数最高的那个版本;持续迭代,寻找更好的方案。

This systematic approach removes guesswork from prompt engineering and gives you confidence that your changes are actually improvements rather than just different variations.

> 这套系统化的方法,把提示词工程里的「拍脑袋猜测」去掉了,让你能确信自己所做的改动是真正的改进,而不只是换了个写法而已。

对产品经理来说,这五步和「A/B 测试 + 打分复盘」的产品迭代逻辑几乎一模一样:先出一版方案(草稿提示词)→ 准备一批有代表性的用户场景(评估数据集)→ 让方案跑一遍这些场景(喂给 Claude)→ 找人(或规则)打分(评分器)→ 看平均分决定改哪儿、要不要换新版本。区别只是这里的「产品」是提示词,「用户测试」全部自动化跑批完成。
