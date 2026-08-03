# AI Capabilities and Limitations - 02 What We Mean by AI 我们说的 AI 是什么

> Course: AI Capabilities and Limitations(AI 的能力与局限)· Lesson 2
> 课程: AI Capabilities and Limitations · 第 2 课 · 建议用时 20 分钟
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23
> 许可: 原课程 © 2026 Anthropic,以 CC BY-NC-SA 4.0 发布;本篇为中文译述,同样以 CC BY-NC-SA 4.0 提供

## What You'll Learn 本课目标

- 把生成式 AI 与你每天已经在接触的**分类型、预测型 AI** 区分开
- 理解生成式 AI 的属性是**从能力到局限的连续谱**
- 预览四个核心属性

## 先划一条界线

**世界上大多数 AI(垃圾邮件过滤、推荐、欺诈检测)都不是生成式的。** 这门课讲的是生成式的那一类: **基于 transformer 的文本模型,一次产出一个词元的新内容。**

区别的核心: **生成式 AI 产出新内容,而不是对已有内容做分类。**

## 四个属性,四个问题

课程把四个属性对应成四个提问,每个都是一条**从能力到局限的连续谱**——**越往右,你越需要核实和补偿**。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6rh0oaxpxl8bv3641a1ejj76o%2Fpublic%2F1774568560%2FpictoInference.1774568559957.png)

**下一个词元预测 Next Token Prediction** —— AI 的回答从哪里来?

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6rh0oaxpxl8bv3641a1ejj76o%2Fpublic%2F1774568560%2FpictoGlobe.1774568560630.png)

**知识 Knowledge** —— AI 实际知道些什么?

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6rh0oaxpxl8bv3641a1ejj76o%2Fpublic%2F1774568561%2FpictoChip.1774568561218.png)

**工作记忆 Working Memory** —— AI 此刻在关注什么?

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6rh0oaxpxl8bv3641a1ejj76o%2Fpublic%2F1774568561%2FpictoKnobs.1774568561703.png)

**可引导性 Steerability** —— 我有多大的控制权?

## Key Takeaways 核心要点

- 生成式 AI **产出新内容**,而非对已有内容分类
- **AI 不是"整体可靠"或"整体不可靠"**——它沿着四条**可预测的轴**各有强弱
- 每个属性都是**连续谱**。**同一个机制,既给了你能力,也给了你局限**
- **校准的信任(calibrated trust)** 意味着把你的任务定位在连续谱上的某个点,而不是整体地给予或收回信任

## Exercise 练习: 是不是生成式?

1. **列出这周你接触过的五个 AI 功能。** 撒开网想: 自动补全、照片打标、垃圾邮件过滤、聊天机器人、翻译、商品推荐、语音助手
2. **对每一个做判断**: 它是在**产出新内容**,还是在**排序、排名、分类已有内容**?
3. **把清单交给 AI 核对你的判断。** 判断错的(或拿不准的),让它用一句话解释区别。然后问:「这五个里面,哪一个最可能出现这门课能帮我理解的失败模式?」
4. 试着给每个任务贴上属性标签: 回答从哪来(下一个词元预测)/ 它知道什么(知识)/ 它在关注什么(工作记忆)/ 我有多大控制权(可引导性)

> **课程明说: 你不必答对。你是在做出预测,好在接下来四课里检验它们。**

## Lesson Reflection 本课反思

- 生成式 / 分类式的区分,有没有改变你对某个常用工具的看法?
- 看看你贴的标签,有没有哪个任务**同时属于多个属性**?

## 对产品经理来说

「**校准的信任**」这个概念是这一课的核心,它反对的是一种很常见的思维方式: **把 AI 当作一个整体来判断可不可信。** 现实中你会听到两种极端——"AI 老胡说八道,不能用"和"AI 现在很强了,基本没问题"——**这两句都是在整体地给予或收回信任,而它们都不对**。

正确的问法是: **这个具体任务,落在四条轴的什么位置上?** 让 AI 总结一份你手上的报告,和让它给出三个带日期的引用来源,是完全不同的可靠性场景,虽然用的是同一个模型。

「**同一个机制,既给了你能力,也给了你局限**」这句话值得反复琢磨。它意味着**你不能只要好的那一半**——流畅和幻觉来自同一个生成过程,你不可能保留流畅而消除幻觉。这对做 AI 产品的预期管理很重要: **有些问题不是 bug,是这个技术路线的固有特性**,能做的是把边界推远、加验证层,而不是期待它消失。

---

*基于 Rick Dakan 与 Joseph Feller 开发的 AI Fluency Framework。*
