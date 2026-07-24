# Claude Platform 101 - 02 Your first API call 你的第一次 API 调用

> Course: Claude Platform 101 · Lesson 2 · 章节: What is the Claude Platform?
> 课程: Claude Platform 101(Claude 开发者平台入门)· 第 2 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文整理翻译,2026-07-24

本课不做「跟 Claude 打招呼」这种没用的事,而是**给它一份真东西、拿回结构化的洞察**——总共不到 20 行代码。

## 准备工作

![获取 API 密钥](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1781017781%2F02-your-first-api-call_01.1781017781720.png)

1. 到 platform.claude.com 拿一个 **API 密钥**(需要先购买额度)
2. **把密钥存进 `.env.local` 文件**,让它不进版本控制

> ⚠️ **把密钥硬编码在源码里,正是它们最终泄漏到 GitHub 上的原因。** 放环境文件里。

3. 装 SDK:

```bash
npm install @anthropic-ai/sdk
```

## 一次请求的构造

每次 API 调用都走 `messages.create`,你要指定三样东西:

- **model** —— 哪个 Claude 模型来处理
- **max tokens** —— 响应长度的上限
- **messages 列表** —— 带 `user` 或 `assistant` 角色的对象,结构与你平时和 Claude 对话的形态类似

最基础的形态:

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const msg = await client.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: "Hello, Claude",
  }],
});
```

## 真实例子: 评审一段有 bug 的代码

给 Claude 一段有问题的代码让它评审,整个程序一个文件、约 20 行:

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const buggyCode = `
function add(a, b) {
  return a - b;
}
`;

const response = await client.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 1024,
  system: "You are a terse senior code reviewer. Give feedback in one paragraph.",
  messages: [
    { role: "user", content: `Review this code:\n${buggyCode}` },
  ],
});

for (const block of response.content) {
  if (block.type === "text") {
    console.log(block.text);
  }
}
```

**两个要注意的点:**

- **系统提示词是塑造人设的地方。** 想要一个简洁的资深评审者而不是话痨,直接说就行
- **响应里的 `content` 是一个「块(block)」数组,不是字符串。** 纯文本回复通常只有一个 `text` 类型的块,但 **Claude 可以返回多个块——文本、工具调用、思考**——所以永远要遍历并检查 `type`

![运行结果](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1781017782%2F02-your-first-api-call_11.1781017782545.png)

跑起来,Claude 会指出 `add` 实际在做减法,并用一段话告诉你。**这就是全部。**

## 从脚本到产品

![从脚本到产品](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1781017783%2F02-your-first-api-call_12.1781017783276.png)

在真实产品里,**同样形状的 `messages.create` 就是某个「摘要」接口背后的引擎**: 从数据库取出会议记录,配一句「提取洞察与风险」的系统提示词交给 Claude,把结果写回那一行,再返回给界面。

**同一个调用,只是包在了一个路由处理函数里。**

## Recap 本课要点

- 第一次 API 调用就是一个 `messages.create`,带 **model、token 上限、messages** 三样
- **API 密钥存 `.env.local`**,别进版本控制
- 加**系统提示词**来塑造 Claude 的行为
- **响应的 content 是块数组**——遍历并检查每块的 `type`
- **后面的一切都建立在这个模式上**

## 对产品经理来说

**「响应是块数组而不是字符串」这一点值得记住**,它解释了后面几课的很多设计。Claude 的一次回复里可能同时包含**思考过程、工具调用请求、文本**,所以接口必须是数组。**你在第 4 课看到的智能体循环,本质就是在这个数组里找特定类型的块然后做出反应。**

这一课真正的教学点在最后那句: **同一个调用,只是包在了路由处理函数里。** 从 demo 到产品,变的不是 AI 调用本身,而是**周围的工程**——数据从哪来、结果存到哪、怎么返回给前端。**对 PM 来说这是个有用的估算基准: AI 那部分通常是最小的一块。**

---

*原课程 © Anthropic,本篇为中文整理存档,供个人学习使用。*
