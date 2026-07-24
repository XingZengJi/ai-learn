# Claude Platform 101 - 06 What is thinking? 什么是扩展思考

> Course: Claude Platform 101 · Lesson 6 · 章节: Teaching your Agent
> 课程: Claude Platform 101(Claude 开发者平台入门)· 第 6 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文整理翻译,2026-07-24

有些任务不是一句话能答完的。**Claude 可以在回答之前先把问题想一遍**——这个能力叫 **extended thinking(扩展思考)**。

![失败模式](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966780%2F06-what-is-thinking_03.1780966780232.png)

要避免的失败模式是: **问一个多步骤的问题、让模型立刻作答,它可能非常自信地答错。**

## 扩展思考是什么

**开启后,Claude 会先生成内部推理 token(常被称为 chain of thought,思维链),再给出答案。** 推理过程不是藏起来的——**你能在响应里连同最终文本一起看到它。**

## Opus 4.7 上的自适应思考

在 Opus 4.7 上,思考是**自适应(adaptive)** 的: **你不用挑 token 预算,只要打开它,由 Claude 动态决定何时思考、思考多少。**

要控制思考量,用 **`effort` 参数**。

> ⚠️ **一个坑: 它放在 `output_config` 里面,不是挨着 thinking 块。**

档位: `low` / `medium` / **`high`(默认)** / `xhigh` / `max`

## 什么时候用、什么时候跳过

![适用场景](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966780%2F06-what-is-thinking_07.1780966780594.png)

**扩展思考对这些有帮助:**

- 数学与多步逻辑
- 代码调试
- 监管合规分析
- **任何涉及权衡取舍、或需要比较多个选项的事**

**这些场景跳过它:** 简单分类、抽取、样板内容。**对这类任务它只是徒增延迟与成本,并不真的改善结果。**

## 实际跑一下

一个带天气工具的智能体循环,让 Claude 规划一趟从旧金山出发、两个停靠点的自驾游,**要权衡天气与驾驶时间**——这是个真实的取舍问题,正是思考能挣回价值的那类。

```python
import anthropic

client = anthropic.Anthropic()

weather_tool = {
    "name": "get_weather",
    "description": "Get the current weather for a city.",
    "input_schema": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name"}
        },
        "required": ["city"],
    },
}

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},  # low | medium | high | xhigh | max
    tools=[weather_tool],
    messages=[
        {
            "role": "user",
            "content": "Plan a road trip out of San Francisco with two stops, "
                       "weighing weather and drive time.",
        }
    ],
)
```

跑起来的输出比平时有意思: **你会看到 thinking 块——Claude 在里面推敲各种取舍**,接着是查询各城市的工具调用,最后才是带实际建议的 text 块。

**推理过程是可见的,这正是重点。**

## 为什么这在生产环境里重要

![生产环境](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966779%2F06-what-is-thinking_01.1780966779794.png)

在真实应用里,**这是「逐个发现问题的智能体」与「能把问题串起来的智能体」之间的差别。**

以合规审查应用为例: 在自动审查那次调用上打开自适应思考,**让智能体能跨报告章节推理**——比如发现第三节的风荷载规格与文档别处的材料规格互相冲突。

## Recap 本课要点

- **扩展思考给 Claude 在回答前推理的空间,而且推理在响应里可见**
- Opus 4.7 上用 **`thinking: {"type": "adaptive"}`** 打开,**不需要 token 预算**,Claude 自己决定何时思考、思考多少
- 用 **`output_config` 里的 `effort` 参数**调深浅: `low` / `medium` / `high`(默认)/ `xhigh` / `max`
- **用在困难的、充满取舍的问题上;简单问题跳过**——那里它只花延迟和 token

## 对产品经理来说

**「推理是可见的」这一点的产品意义比技术意义大。** 它意味着你可以把 Claude 的思考过程**作为产品的一部分展示给用户**——审查类、诊断类、建议类的功能里,「为什么给出这个结论」往往和结论本身一样重要。

**那条适用性边界值得记成一句话: 有取舍的用,没取舍的不用。** 分类、抽取这类任务只有一个正确答案,思考帮不上忙;而「在天气和车程之间怎么平衡」「这两条规格是否冲突」有多个可行解,需要比较——**这才是思考挣回成本的地方。**

**「逐个发现问题 vs 把问题串起来」这个对比是本课最好的产品语言。** 它描述的是同一个功能的两个质量档位: 一个逐条检查、一个能发现跨章节的矛盾。**后者用户会明显感知到更「聪明」,而实现上只是打开了一个参数**——这类杠杆值得 PM 主动去找。

不过要配套记住成本: **思考消耗 token,`effort` 调高就是调高单次成本。** 结合第 3 课的思路,合理做法是**按任务类型分别设置 effort**,而不是全局开到 max。

---

*原课程 © Anthropic,本篇为中文整理存档,供个人学习使用。*
