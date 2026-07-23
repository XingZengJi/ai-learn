# Claude with Google Vertex - 22 Prompt engineering 提示词工程

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 22
> 课程: Claude with Google Vertex · 第 22 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

提示词工程,就是把你已经写出来的提示词进一步改进,以获得更可靠、更高质量的输出。这个过程是迭代式的: 先写一个基础版本,评估它的表现,然后系统性地施加工程技巧来提升它。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619608%2F05_-_001_-_Prompt_Engineering_00.1748619608702.png)

## The Iterative Improvement Process 迭代改进的流程

这套方法是一个可以反复跑的循环,直到达到你想要的效果:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619609%2F05_-_001_-_Prompt_Engineering_01.1748619609168.png)

1. **设定目标** —— 明确你要这个提示词达成什么
2. **写初始提示词** —— 做一个基础的第一版
3. **评估提示词** —— 按你的标准测试它
4. **施加提示词工程技巧** —— 用具体方法提升表现
5. **重新评估** —— 验证改动是否真的带来了提升

最后两步反复循环,直到你对表现满意。每一轮迭代都应该在评估分数上体现出可测量的改进。

## Example: Meal Planning for Athletes 例子: 给运动员做餐食计划

走一个实际例子。目标是做一个提示词,根据运动员的身体特征和需求生成一天的餐食计划。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619609%2F05_-_001_-_Prompt_Engineering_04.1748619609611.png)

提示词接收这些输入,应产出一份完整的餐食计划,包括总热量、宏量营养素拆分,以及每餐的具体内容、分量和时间。

## Setting Up the Evaluation Framework 搭建评估框架

要系统性地衡量改进,需要一套可靠的评估配置,包括:

- **数据集生成** —— 造出代表真实场景的测试用例
- **自动打分** —— 用一致的标准评估输出
- **表现追踪** —— 监控各轮迭代之间的改进

配置评估器时留意 API 速率限制。**从低并发起步(1–3 个并发请求)**,只有在没碰到限流报错时才往上加。

## Creating Your Initial Prompt 写初始提示词

从简单的开始,哪怕你明知道它不怎么样。一个基础的第一版:

```
What should this person eat?

- Height: {prompt_inputs["height"]}
- Weight: {prompt_inputs["weight"]}  
- Goal: {prompt_inputs["goal"]}
- Dietary restrictions: {prompt_inputs["restrictions"]}
```

这个提示词是**故意**写得很基础的,大概率产出很差的结果。而这正是你要的——一条清晰的、有充分改进空间的基线。

## Establishing Evaluation Criteria 确立评估标准

定义提示词该满足的具体标准。餐食计划这个例子里,好的输出应包含:

- 每日总热量
- 宏量营养素拆分
- 每餐的确切食物、分量和时间

这些标准帮助评估模型稳定地打分,也给你明确的改进目标。

## Measuring Baseline Performance 测量基线表现

把初始提示词跑一遍评估框架。**分数低不必沮丧**——10 分制里拿 2.3 分作为起点其实非常理想,它给你留下了充分的改进演示空间。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619610%2F05_-_001_-_Prompt_Engineering_18.1748619610284.png)

## Analyzing Results 分析结果

多数评估框架会生成详细报告,展示每个测试用例的表现。这类报告通常包括:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619611%2F05_-_001_-_Prompt_Engineering_19.1748619611159.png)

- **单条测试用例结果** —— 具体看模型产出了什么
- **分数拆解** —— 理解某些输出为什么分低
- **评分理由** —— 得到「缺了什么、错在哪」的反馈

用这些详细反馈定位提示词需要改进的具体地方。**要看多条用例之间的共性模式**,以识别系统性问题,而不是被个别偶发问题带偏。

## Next Steps 下一步

基线有了、评估框架就位,就可以开始施加具体的提示词工程技巧了。每施加一个技巧,评估分数都应该有可测量的提升,一步步逼近你理想的输出质量。

关键在于: **一次只改一处**,评估影响,再决定保留还是换个方向。这个系统性的过程能让你搞清楚哪些技巧对你的具体场景最管用。

对产品经理来说: 「一次只改一处」这条纪律,和做 A/B 实验时不能同时改多个变量是同一个道理。提示词很容易一口气改五处然后分数涨了,但你不知道是哪一处起的作用——下次遇到类似问题就没法复用经验。慢一点反而快。
