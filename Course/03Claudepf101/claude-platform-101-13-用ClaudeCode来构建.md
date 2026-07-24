# Claude Platform 101 - 13 Building with Claude Code 用 Claude Code 来构建

> Course: Claude Platform 101 · Lesson 13 · 章节: Building with Claude Code
> 课程: Claude Platform 101(Claude 开发者平台入门)· 第 13 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文整理翻译,2026-07-24

手写调用 Claude API 的代码没问题,**但还有更快的路: 让 Claude 替你写。** 本课用 Claude Code,**从一个留了空壳的文件出发,补全一个 API 集成**——用的正是全课学过的那些原语。

## 从空壳开始

项目很简单: 一个取天气的 TypeScript 文件,里面有两个待填的空壳:

- **`getWeather`** —— 接受城市,返回温度与天气状况
- **`run`** —— 应当使用 **tool runner** 和 Claude 的 TypeScript SDK

**tool runner 就是那个替你处理工具调用与智能体循环的部件**(见第 5 课),这样你不必手工接线。

## Claude API 这个 skill

![Claude API skill](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966792%2F12-building-with-claude-code_07.1780966791793.png)

Claude Code 自带一个叫 **Claude API** 的内置 skill。**可以用 `/claude-api` 直接调用,或者当 Claude Code 检测到你在用 TypeScript SDK 时它会自动调用。**

如果没看到这个 skill,可以从市场添加:

```
/plugin marketplace add AnthropicsSkills
```

> ⚠️ **注意 `Anthropics` 结尾有个 `s`,很容易看漏。**

## 一个提示词,可运行的代码

在终端里打开项目文件夹、启动 Claude Code。**接下来只需要一个提示词。一个好的提示词做三件事:**

1. **点名你要改的文件**
2. **点名你要用的模式**
3. **点名你期望的最终状态**

![运行过程](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966792%2F12-building-with-claude-code_09.1780966792395.png)

Claude Code 随后**按类型定义补全 `getWeather` 和 `run`,在文件末尾追加一次调用,执行脚本,并报告输出。如果报错,它会读错误信息、就地修补代码。**

## Claude Code 产出了什么

![产出结果](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966793%2F12-building-with-claude-code_13.1780966792920.png)

这一次运行里,Claude Code 创建了一个 **Zod 工具**来解析输入、按城市类型返回输出,**也创建了我们要的 tool runner 与 `run` 函数,并打印出智能体循环的最终结果。**

## 要记住的模式

**你针对 Claude API 写的大部分东西,形状都很熟悉:**

1. **定义一个工具**
2. **把它交给一个 runner**
3. **返回结果**

> **你不需要每次都凭记忆把这些敲出来。把文件留成空壳、交给 Claude Code,然后审查 diff 就行。**

## Recap 本课要点

- **Claude Code 是一个能在你终端里编辑文件、运行命令的智能体**
- **内置的 Claude API skill 在 Claude Code 检测到 TypeScript SDK 时自动加载**,也可以用 `/claude-api` 手动调用
- **给它一个点明「文件、模式、最终状态」的提示词**——它会写代码、运行、并就地修错
- **Claude API 代码的固定形状: 定义工具 → 交给 runner → 返回结果。留空壳、委派、审 diff**

## 对产品经理来说

**这门课用最后一课把自己的内容「元」了一次: 前十二课教你 API 怎么用,最后一课告诉你不用背——让 Claude Code 写,你审 diff。**

**但注意它没有说「所以前面白学了」。** 恰恰相反,**能审查 diff 的前提是你理解那三步形状**(定义工具 → 交给 runner → 返回结果)。这正是本仓库 CLAUDE.md 里那条原则的具体版本: **Claude 写代码,你读懂代码。**

**「好提示词做三件事: 点名文件、点名模式、点名最终状态」——这条可以直接用。** 它和第 5 课「工具描述要具体」、`Course/20AIforB/` 的「描述链」是同一个主题的第三次出现: **含糊的描述换来含糊的产出,而具体化的成本远低于返工的成本。**

对 PM 最实际的一点: **这一课重新定义了「会用 API」的门槛。** 门槛不再是能默写 SDK 调用,**而是能判断产出对不对**——知道该用 tool runner 而不是手写循环、知道 Haiku 够用不必上 Opus、知道该开缓存。**这些判断力恰好就是前十二课教的东西,也恰好是 Claude Code 替不了你的部分。**

---

*原课程 © Anthropic,本篇为中文整理存档,供个人学习使用。*
