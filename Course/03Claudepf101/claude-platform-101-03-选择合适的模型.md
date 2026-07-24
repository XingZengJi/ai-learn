# Claude Platform 101 - 03 Choosing the right model 选择合适的模型

> Course: Claude Platform 101 · Lesson 3 · 章节: What is the Claude Platform?
> 课程: Claude Platform 101(Claude 开发者平台入门)· 第 3 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文整理翻译,2026-07-24

**默认选最聪明的,账单会吓到你;选最便宜的,输出可能撑不住。** 每个模型有不同的取舍,选对了同时影响**质量与成本**。

## 模型分档

![模型分档](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966775%2F03-choosing-the-right-model_03.1780966775553.png)

用 API 调用里的 `model` 参数在各档之间选择:

| 档位 | 定位 | 适合什么 |
|---|---|---|
| **Claude Fable** | **迄今最强,位于 Opus 之上的新档位** | 最难的挑战。**成本显著高于 Opus,只在额外能力值这个价时才用** |
| **Claude Opus** | 三大核心系列里最强,**也最慢最贵** | 深度推理、复杂分析、多步编码、精细写作 |
| **Claude Sonnet** | **平衡点**: 智能、速度、成本的均衡组合 | **大多数生产工作** |
| **Claude Haiku** | **最快最便宜**,为速度与成本效率优化 | 高吞吐、低复杂度的活: **分类、抽取、路由** |

> 课程说明: 录制时 Claude Fable 尚未正式发布,视频中未体现。

## 先做一个简单的评估(eval)

**在写生产代码之前**,先搭一个简单的评估: 一组示例输入,分别跑过各个模型,按「对你的场景什么算好输出」打分。

**不需要多复杂——从你真实工作负载里取 20 到 30 个有代表性的例子就够起步。**

然后**自下而上**逐档试:

1. **先用 Haiku 跑一遍。质量撑得住,就结束了——你刚省下一大笔钱**
2. 撑不住,**升到 Sonnet**
3. **只在任务确实需要时才动用 Opus**

## 并排比较各档

```python
models = ["claude-haiku-4-5", "claude-sonnet-4-6", "claude-opus-4-7"]

for model in models:
    response = client.messages.create(
        model=model,
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    print(model, response.usage)
```

两件事在发生:

- 循环**只换 `model` 字段**,同样的提示词、同样的 token 上限
- **`response.usage` 直接给你输入与输出的 token 数——账单就是按这个算的**

![比较结果](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966776%2F03-choosing-the-right-model_11.1780966776430.png)

跑出来会看到三个模型、三组数字。**Opus 耗时最长、读起来最精致——但对一个两句话的定义,这份精致是浪费的。** Sonnet 把文字收紧了一点。而 Haiku 常常一秒内就返回一个相当称职的两句话答案。

**这就是全部要点: 正确的模型,是「输出你真的愿意发出去」的那些里面最便宜的一个。** 定义类的活 Haiku 足够;起草监管回复,你会跑同样的比较,大概率落在 Opus 上。**评估的形状每次都一样。**

## 把不同的活路由给不同的模型

真实应用里,**你会在同一个接口内部把不同类型的活分给不同模型**。比如一个运营仪表盘的文档处理路由:

- 每份进来的文件**先用 Haiku 分类**
- 客户更新**用 Sonnet 起草**
- **只有 RFP 回复才动用 Opus**

**一个队列,三个模型,按任务挑选。**

## Recap 本课要点

- 模型分档: **Opus 攻难题、Sonnet 干日常、Haiku 走量**(之上还有 Fable)
- **写生产代码前先搭评估**——从真实负载取 20–30 个有代表性的例子
- **从 Haiku 往上跑,停在「输出你真的愿意发出去」的最便宜那一档**
- **`response.usage` 报告输入输出 token,那是计费依据**
- 生产环境里**在同一个接口内按任务路由到不同模型**,而不是一个模型包打天下

## 对产品经理来说

**「正确的模型 = 输出你真的愿意发出去的那些里最便宜的一个」——这句是可以直接拿去做决策的判据。** 它把一个容易陷入玄学的问题(哪个模型更好)变成了一个有明确终止条件的搜索: **从最便宜的开始,达标即停。**

**「20–30 个有代表性的例子」这个量级值得记。** 它低到一个下午就能凑齐,却高到足以看出差异——**这条建议的价值在于反驳「做评估太重了以后再说」,而「以后」通常意味着你永远在凭感觉选模型。**

**路由那一节是最具体的成本杠杆。** 大多数产品的请求分布是极度不均的: 大量简单请求 + 少量困难请求。**按最难的那部分选模型,等于让 90% 的流量为 10% 的需求付费。** 这个道理不新鲜,但很多团队直到收到账单才想起来。

顺带一个对 PM 有用的细节: **`response.usage` 让成本可观测。** 你可以在功能上线第一天就知道单次调用的实际 token 消耗,而不是等月底账单——**这是把「AI 成本」从财务问题变成产品指标的关键一步。**

---

*原课程 © Anthropic,本篇为中文整理存档,供个人学习使用。*
