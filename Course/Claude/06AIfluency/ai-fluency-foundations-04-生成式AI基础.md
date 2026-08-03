# AI Fluency: Framework & Foundations - 04 Generative AI fundamentals 生成式 AI 基础(Deep Dive 1 · 上)

> Course: AI Fluency: Framework & Foundations · Lesson 4
> 课程: AI Fluency: Framework & Foundations · 第 4 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文整理翻译,2026-07-24
> 许可: 原课程 © 2025 Rick Dakan、Joseph Feller、Anthropic 共同开发,基于 Dakan 与 Feller 的 AI Fluency Framework,爱尔兰高等教育局 National Forum for the Enhancement of Teaching and Learning 部分资助,以 CC BY-NC-SA 4.0 发布;本篇为中文译述,同样以 CC BY-NC-SA 4.0 提供

## 生成式 AI 是"创造",不是"分析"

生成式 AI 的核心能力是**创造新内容**,而不只是分析已有的东西。像 Claude 这样的大语言模型(LLM)之所以能做到这一点,靠的是三个层面的技术积累:

- **算法与架构上的突破**,尤其是 **transformer 架构**
- **海量的数字化训练数据**
- **计算能力的大幅提升**

这些系统通过两个阶段学习:**预训练(pre-training)**——从数十亿个例子中分析模式;**微调(fine-tuning)**——学习遵循指令、给出有帮助的回应。课程也介绍了"上下文窗口(context window)"和"涌现能力(emergent capabilities)"这两个概念。

## 对产品经理来说

理解"预训练 + 微调"这两段式的学习过程,对判断一个 AI 产品能力边界很有帮助:**预训练决定了模型"知道什么"(取决于训练数据的广度和截止时间),微调决定了模型"怎么听话"(能不能按你的指令、格式、语气给出回应)**。遇到"这个模型为什么不按我说的做"这类问题时,这个区分能帮你判断是知识欠缺(预训练层面)还是指令遵循欠缺(微调层面)——两者的解法完全不同。

---

*原课程 © 2025 Rick Dakan、Joseph Feller、Anthropic,基于 The AI Fluency Framework,以 CC BY-NC-SA 4.0 发布。本篇为中文译述存档,同样以 CC BY-NC-SA 4.0 提供,供个人学习使用。*
