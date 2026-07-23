# Introduction to Subagents - 03 Designing effective subagents 设计有效的子智能体

> Course: Introduction to Subagents(Subagents 入门)· Lesson 3
> 课程: Introduction to Subagents · 第 3 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

配置糟糕的子智能体会**跑偏、跑太久,或产出主智能体用不上的东西**。这一课讲怎么修,归结为四件事: **写好描述、定义输出格式、汇报障碍、限制工具权限**。

## 配置数据是怎么被用的

当你给主上下文智能体发消息时,**所有可用子智能体的 name 和 description 都会被放进系统提示词**。主智能体就是靠这个决定启动哪个、什么时候启动。想更好地控制自动触发的时机,就该调这两个字段。

**描述还有第二个作用**: 主智能体启动子智能体时,要写一段输入提示词来发起任务,而**它是拿描述当写作指引的**。

所以描述不只控制**什么时候**跑子智能体——**它还塑造了子智能体被告知要做什么**。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1773975083%2Fvid3redone-v2_02.1773975083694.png)

## 写能塑造输入提示词的描述

以代码评审子智能体为例。

- **描述写得笼统** → 主智能体可能写出「用 get diff 找出当前改动」这样的输入提示词。**这太含糊了**,子智能体得自己去猜哪些文件才是重点
- **描述里加上**「你必须准确告诉这个 agent 你想让它评审哪些文件」 → 主智能体就会写出**具体列出待评审文件**的输入提示词

同样的技巧适用于各类子智能体。比如给一个网页搜索子智能体的描述里加上「返回可供引用的来源」,主智能体在委派时就会把这条指令一并带上。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1773975124%2Fvid3redone-v2_03.1773975124367.png)

## 定义输出格式(最重要的一条)

> **你能对一个子智能体做出的最重要改进,是在它的系统提示词里定义输出格式。**

这么做有两个效果:

1. **创造了自然的停止点** —— 每个小节都填完了,子智能体就知道自己干完了
2. **防止它跑太久** —— 没有定义好的输出时,子智能体很难判断「研究到什么程度算够」,往往会跑得比必要的时间长得多

代码评审子智能体的结构化输出格式示例:

```
Provide your review in a structured format:

1. Summary: Brief overview of what you reviewed and overall assessment
2. Critical Issues: Any security vulnerabilities, data integrity risks,
   or logic errors that must be fixed immediately
3. Major Issues: Quality problems, architecture misalignment, or
   significant performance concerns
4. Minor Issues: Style inconsistencies, documentation gaps, or
   minor optimizations
5. Recommendations: Suggestions for improvement, refactoring
   opportunities, or best practices to apply
6. Approval Status: Clear statement of whether the code is ready
   to merge/deploy or requires changes
```

这个格式给了子智能体**一份清晰的待办清单**。每一节都填好了,它就知道可以停了。

## 汇报障碍

子智能体在工作中如果发现了某个变通办法——比如解决了一个依赖问题、或发现某条命令需要特定参数——**这些细节必须出现在它交回的摘要里**。否则主线程就得自己把同样的解法重新发现一遍,**浪费时间也浪费 token**。

需要被浮现出来的信息包括:

- 环境搭建问题或环境的怪癖
- 任务过程中发现的变通办法
- 需要特殊参数或配置才能跑的命令
- 引发问题的依赖或 import

**拿到这些信息的方法是在输出格式里显式要求它。** 在输出模板里加一个「遇到的障碍」小节,就能可靠地把这些浮现出来:

```
7. Obstacles Encountered: Report any obstacles encountered during the
   review process. This can be: setup issues, workarounds discovered or
   environment quirks. Report commands that needed a special flag or
   configuration. Report dependencies or imports that caused problems.
```

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1773975160%2Fvid3redone-v2_11.1773975160096.png)

## 限制工具权限

不是每个子智能体都需要所有工具。想清楚它实际要做什么,**只给完成这份工作所需的工具**。这有两个好处: **防止意外的副作用**,以及在你有好几个子智能体时**让各自的角色更清晰**。

常见类型的工具配置思路:

| 类型 | 需要的工具 | 说明 |
|---|---|---|
| **研究 / 只读** | `Glob`、`Grep`、`Read` | 不可能误改文件 |
| **代码评审员** | 加上 `Bash` | 需要跑 `git diff` 看改动,但仍然**不需要** `Edit` 或 `Write` |
| **样式 / 改代码** | 加上 `Edit`、`Write` | 它的职责就是真的改你的代码 |

## 四条特征总结

有效的子智能体共享四个特征:

- **具体的描述** —— 描述同时控制**何时启动**和**收到什么指令**,写的时候要兼顾这两件事
- **结构化输出** —— 在系统提示词里定义输出格式,让它知道什么时候算干完、并交回主线程用得上的信息
- **障碍汇报** —— 在输出格式里留一节给变通办法、怪癖和问题,免得主线程重新踩一遍
- **受限的工具权限** —— 只给它真正需要的工具

每一条单看都很简单,但合起来能把一个「含糊地试图帮忙」的子智能体,变成**一个聚焦、可预测、按时收工、汇报清楚的工作者**。

## 对产品经理来说

**「定义输出格式」是这一课最值得带走的东西**,而它的作用机制很值得琢磨: **输出格式其实是一份完成定义(Definition of Done)。**

没有它,子智能体不知道什么时候算完,于是倾向于一直做下去——课程原话是"跑得比必要的时间长得多"。这个现象在人身上一模一样: **没有明确交付标准的任务,要么无限延期,要么草草收场**,因为执行者只能自己猜什么叫够。给一份带小节的模板,就等于给了一份可勾选的清单。

「**障碍汇报**」这一节是我觉得最有洞察的设计。它解决的是**委派中最典型的知识损耗**: 执行者踩过的坑、想出的绕法,如果不主动要求,就随着任务结束一起消失了,下一个人(或下一次)再踩一遍。**解法不是指望对方自觉,而是把它做成交付模板的一个必填项。**

这条完全可以直接搬进你的工作: 任何委派出去的任务,验收模板里加一栏「过程中遇到的坑与解法」。成本几乎为零,但它把一次性的经验变成了可积累的资产。

---

*本课程为 Anthropic Academy 官方课程,笔记为学习用途的中文整理。*
