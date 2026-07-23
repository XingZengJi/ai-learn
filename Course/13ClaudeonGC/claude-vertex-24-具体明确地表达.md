# Claude with Google Vertex - 24 Being specific 具体明确地表达

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 24
> 课程: Claude with Google Vertex · 第 24 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

用 Claude 时,改善结果最有效的手段之一就是**把要求说具体**。与其把一切交给模型自行揣摩,不如给出清晰的准则或步骤,把它导向你想要的那种输出。

换个角度想: 你让 Claude「写一个关于某人发现隐藏天赋的短篇故事」,它可以往无数个方向发展。可能 200 字,也可能 2000 字; 可能一个角色,也可能五个; 可能走喜剧,也可能走正剧。没有指引,你拿到什么全靠掷骰子。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619654%2F05_-_003_-_Being_Specific_00.1748619653960.png)

## Two Types of Guidelines 两类准则

把提示词写具体主要有两种方式,在专业应用里经常同时使用。

### Quality Guidelines 质量准则

第一类是列出输出应具备的特质。这类准则控制的是这些属性:

- 长度约束(控制在 1000 字以内)
- 结构要求(必须包含一个揭示角色天赋的明确情节)
- 内容规格(至少包含一个配角)

### Process Steps 过程步骤

第二类是给模型具体的执行步骤。这种方式促使 Claude 在生成最终回复之前,先把不同选项和考量想一遍。例如:

1. 头脑风暴 3 种能制造戏剧张力的天赋
2. 挑出最有意思的那个
3. 勾勒一个揭示该天赋的关键场景
4. 头脑风暴 3 类能放大这一发现之冲击力的配角

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619654%2F05_-_003_-_Being_Specific_05.1748619654657.png)

## Real-World Results 实际效果

把要求写具体带来的提升可能非常大。在餐食计划提示词的测试里,加上准则后评估分数从 **3.92 提升到 7.86**——输出质量翻了一倍还多。实际写法:

```
Generate a one-day meal plan for an athlete that meets their dietary restrictions.

- Height: {prompt_inputs["height"]}
- Weight: {prompt_inputs["weight"]}
- Goal: {prompt_inputs["goal"]}
- Dietary restrictions: {prompt_inputs["restrictions"]}

Guidelines:
1. Include accurate daily calorie amount
2. Show protein, fat, and carb amounts
3. Specify when to eat each meal
4. Use only foods that fit restrictions
5. List all portion sizes in grams
6. Keep budget-friendly if mentioned
```

## When to Use Each Approach 两种方式各自的适用场景

**质量准则**几乎适用于你写的任何提示词,是保证输出稳定可用的基本盘。

**过程步骤**在这些情况下尤其有价值:

- 排查复杂问题
- 决策场景
- 需要批判性思考的任务
- 你希望 Claude 从多个视角考虑问题的场合

举例: 让 Claude 分析某销售团队上季度业绩为什么下滑 30%,你可能希望强制它把市场环境、个人表现、组织变动、客户反馈都过一遍——如果不明确要求,它未必会主动去看这些方面。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619655%2F05_-_003_-_Being_Specific_18.1748619655213.png)

关键在于认识到: Claude 和任何工具一样,你把「要什么」和「怎么做到」都讲清楚,它才能干得更好。把要求写具体不是在微观管理 AI,而是在为成功创造条件。

对产品经理来说: 「过程步骤」这一类准则本质上是把**你的方法论**注入模型。上面那个销售下滑的例子,四个考察维度其实是一位资深分析师的思考框架。这提示了一个很实际的用法: 团队里那些「老同事才懂」的分析套路,可以直接写成提示词里的步骤清单,让它成为可复用的资产,而不是留在某个人脑子里。
