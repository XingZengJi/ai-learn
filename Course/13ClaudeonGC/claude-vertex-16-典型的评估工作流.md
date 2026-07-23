# Claude with Google Vertex - 16 A typical eval workflow 典型的评估工作流

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 16
> 课程: Claude with Google Vertex · 第 16 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

典型的提示词评估工作流有五个关键步骤,通过客观测量来系统性地改进提示词。组装这类流程的方式很多,开源和商业工具也不少,但理解这套核心流程能让你从小规模起步、按需扩展。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619547%2F04_-_002_-_A_Typical_Eval_Workflow_00.1748619547713.png)

## Step 1: Draft a Prompt 第一步: 起草提示词

先写一个你想改进的初始提示词。本例用一个很简单的:

```python
prompt = f"""
Please answer the user's question:

{question}
"""
```

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619548%2F04_-_002_-_A_Typical_Eval_Workflow_04.1748619548527.png)

这个基础提示词作为测试和改进的基线。

## Step 2: Create an Evaluation Dataset 第二步: 建评估数据集

评估数据集装的是要喂进提示词的样本输入。我们的提示词只有一个输入(用户的问题),所以需要一批不同的问题来测。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619549%2F04_-_002_-_A_Typical_Eval_Workflow_06.1748619549029.png)

数据集里是要与提示词拼合的问题。你可以手工整理,也可以用 Claude 生成。真实的评估里可能有几十、几百甚至上千条记录,本例先用三个问题:

- What's 2+2?
- How do I make oatmeal?
- How far away is the Moon?

## Step 3: Feed Through Claude 第三步: 喂给 Claude

把数据集里的每个问题与提示词模板拼成完整提示词,逐个发给 Claude 并收集回复。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619549%2F04_-_002_-_A_Typical_Eval_Workflow_08.1748619549492.png)

比如第一个问题拼成完整提示词后,Claude 处理并返回 "2 + 2 = 4"。数据集里所有问题都这么走一遍,得到一组「问题—答案」对。

## Step 4: Feed Through a Grader 第四步: 喂给评分器

接下来是关键一步: 客观衡量 Claude 回复的质量。把每一对「问题—答案」送进评分器打分。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619550%2F04_-_002_-_A_Typical_Eval_Workflow_11.1748619549867.png)

评分器按答案质量给分(通常 1–10):

- **10** = 完美答案,没有改进空间
- **4** = 勉强够用,但明显有改进空间
- 更低的分数表示回复质量差

给所有回复打完分后取平均。本例中 10、4、9 三个分数平均是 7.66,这就是你这版提示词表现的客观测量值。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619550%2F04_-_002_-_A_Typical_Eval_Workflow_14.1748619550433.png)

## Step 5: Change Prompt and Repeat 第五步: 改提示词,重跑

有了基线分数,就可以改提示词,再把整个流程跑一遍,看改动是否提升了表现。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619551%2F04_-_002_-_A_Typical_Eval_Workflow_15.1748619550921.png)

比如给原提示词加上更具体的指令:

```python
prompt = f"""
Please answer the user's question:

{question}

Answer the question with ample detail
"""
```

## Prompt Scoring 提示词打分

这套工作流的威力在于拿到客观的性能测量值。你可以对比不同版本的分数,判断哪一版更好。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619551%2F04_-_002_-_A_Typical_Eval_Workflow_17.1748619551452.png)

本例中:

- 提示词 v1 得分 7.66
- 提示词 v2 得分 8.7

v2 分数更高,这是「加上 Answer the question with ample detail 确实改善了表现」的客观证据。之后你可以采用表现更好的版本,或者继续迭代追求更高分。

这套系统性方法把提示词改进从猜谜变成了有据可依的优化框架。虽然实现好的评分器有其复杂之处,但这套工作流是搭建自有评估系统的坚实基础。

对产品经理来说: 注意这里的分数是**相对指标**,不是绝对指标。7.66 分本身没有意义,「v2 比 v1 高 1 分」才有意义。所以别去追求「达到 9 分」这种目标,应该把它用于「这次改动值不值得上线」的 A/B 判断——它更像转化率而不是 NPS。
