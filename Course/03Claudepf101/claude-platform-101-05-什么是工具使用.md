# Claude Platform 101 - 05 What is tool use? 什么是工具使用

> Course: Claude Platform 101 · Lesson 5 · 章节: Teaching your Agent
> 课程: Claude Platform 101(Claude 开发者平台入门)· 第 5 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文整理翻译,2026-07-24

你现有的工作流依赖一堆不同的技术——项目管理软件、数据库、文件。**Claude 没法自己去查这些东西**,它依靠**工具(tools)** 来获得外部数据与行动能力。

## 工具是什么

**说白了,工具就是一个由你定义、并暴露给 Claude 的函数。** 你描述它做什么、接受什么输入,**由 Claude 决定何时调用它。**

要内化的关键点: **Claude 不执行工具,你的代码才执行。** 流程是:

1. **Claude 请求**一次工具调用
2. **你的代码执行**那个函数
3. **结果回到 Claude**,它继续往下走

## 工具怎么定义

工具是 JSON schema,三个部分: **name、description、input schema**。你在请求体里以 `tools` 数组的形式传给 Claude。

> ⚠️ **description 是 Claude 用来判断要不要调用这个工具的依据。描述写得含糊,就会得到糟糕的工具使用。这是智能体失灵、或者放着可用工具不去抓的头号原因。要写具体。**

```json
{
  "name": "lookup_building_code",
  "description": "Look up a specific building code section by its identifier. Returns the full text of that code section.",
  "input_schema": {
    "type": "object",
    "properties": {
      "section": {
        "type": "string",
        "description": "The building code section to look up"
      }
    },
    "required": ["section"]
  }
}
```

用起来会发生什么: 给智能体发一份合规报告,第一轮 Claude 返回 `stop_reason: "tool_use"`——**这就是我们的信号。**

![tool_use 响应](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966777%2F05-what-is-tool-use_04.1780966777807.png)

我们的循环用 Claude 请求的参数调用 `lookup_building_code`,再把结果作为 **tool result 喂回去**——一条 user 消息,里面装着与该次工具调用 `id` 绑定的 `tool_result` 块:

![tool_result](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966778%2F05-what-is-tool-use_05.1780966778272.png)

然后 Claude 继续。**可以一直调工具、一直返回结果,直到它拿到所需的一切。**

## 多个工具: 让 Claude 自己挑

一个工具有用,**但有意思的部分是给 Claude 多个工具,看它挑哪个、按什么顺序挑。**

场景: 要去 Denver 出差三天,既想知道今天的天气,也想知道未来几天的预报。于是声明两个工具:

```javascript
const tools = [
  {
    name: "get_weather",
    description: "Get today's current weather for a city.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "The city to check" }
      },
      required: ["city"]
    }
  },
  {
    name: "get_forecast",
    description: "Get the weather forecast for the next few days for a city.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "The city to check" }
      },
      required: ["city"]
    }
  }
];
```

**循环与之前完全一样**,唯一新增的是一个 `runTool` 函数,用 switch 按工具名分派:

```javascript
function runTool(name, input) {
  switch (name) {
    case "get_weather":
      return getWeather(input.city);
    case "get_forecast":
      return getForecast(input.city);
  }
}

while (true) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages,
    tools,
  });

  if (response.stop_reason !== "tool_use") {
    // Claude 完成了 —— 这就是最终答案
    break;
  }

  messages.push({ role: "assistant", content: response.content });

  const toolResults = response.content
    .filter((block) => block.type === "tool_use")
    .map((block) => ({
      type: "tool_result",
      tool_use_id: block.id,
      content: runTool(block.name, block.input),
    }));

  messages.push({ role: "user", content: toolResults });
}
```

**想加第三个工具?数组里加一项、switch 里加一个 case,就完了。**

跑起来会看到 Claude 调用 `get_weather` 然后 `get_forecast`——**有时在同一轮里,有时一前一后。**

**注意它是怎么挑的: 它读了描述**,把你的提示词映射到「今天的天气」和「未来几天」,各自挑对了工具。**这就是为什么你的工具描述真的很要紧。**

## Tool runner: 省掉样板代码

上面的写法有两个明显问题:

- **两个简单查询写了太多代码**
- **真实代码库里,你不会想给每个函数手写 JSON schema——那等于把代码写两遍**

**这就是 tool runner 的用武之地。** 它随 Claude SDK 提供(**TypeScript、Python、Ruby**),**接收你真实的函数,读取类型与文档自动生成 schema,并在内部处理整个「工具调用 / 工具结果」循环。**

你的代码缩减为: 描述工具、发出提示词、等结果。

```typescript
// 还是刚才那两个查询 —— 就是普通的 TypeScript 函数
function getWeather(city: string) {
  // ...existing lookup
}

function getForecast(city: string) {
  // ...existing lookup
}

const runner = client.beta.messages.toolRunner({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content:
        "I'm packing for a three-day trip to Denver. What's the weather today and over the next few days?",
    },
  ],
  tools: [getWeather, getForecast],
});

// 所有工具往返结束后，返回最终的 assistant 消息
const finalMessage = await runner.untilDone();
```

同样的场景,代码量只剩一小部分:

- **没有 `while` 循环、没有 stop reason 分支、不用手动把工具结果推回 messages**——runner 全包了
- **没有 JSON schema**,不用把东西写两遍
- 那两个函数就是刚才手写版里的同一批查询,**普通的 TypeScript 而已**
- **`runner.untilDone()`** 在一切结束后返回最终的 assistant 消息

## 真实的工具是包在你已有代码外面的

![真实工具](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966779%2F05-what-is-tool-use_14.1780966779051.png)

现实中,工具不会是写死的天气数据,而是**包在你应用里已经存在的函数外面的薄薄一层**。

比如合规审查智能体: 它的工具就是代码库里早已存在的 `lookup_building_code` 与 `search_building_code` 的薄封装。**用 tool runner,你把这些函数直接传进去,智能体在写下的每条发现里都会引用具体的规范条款——一行 schema 都不用写。**

## Recap 本课要点

- **工具让 Claude 接触你的系统。工具是你定义并暴露的函数;Claude 决定何时调用,你的代码负责执行**
- 工具是带 **name / description / input schema** 的 JSON schema,在请求里以 `tools` 数组传入
- **描述要写具体。含糊的描述是智能体失灵的头号原因**
- **`stop_reason: "tool_use"` 是你执行工具并把结果喂回去的信号**
- 多工具时按工具名分派。**加工具 = 数组加一项 + switch 加一个 case**
- **SDK 的 tool runner(TS/Python/Ruby)从你真实的函数生成 schema 并接管整个循环**——也可以自己跑循环
- **要么你执行,要么你委派循环。这条光谱的最远端,是把整个智能体委派给 Anthropic 的托管智能体**

## 对产品经理来说

**「描述含糊是智能体失灵的头号原因」——这条要划重点。** 它把一类看起来像模型能力问题的故障(该调工具时不调、调错工具),重新定位成了**文档写作问题**。**工具描述本质上是写给 AI 看的产品说明书**,而写产品说明书恰好是 PM 的本行。

这也和 AI Fluency 课的「描述」能力对上了: **`Course/20AIforB/` 讲的「描述链」在这里有了具体载体**——你对工具的描述,决定了 Claude 能不能把用户意图正确映射到可用能力上。

**tool runner 那一段体现了一个通用的工程演进模式**: 先手写循环理解原理,再用抽象层消除样板。**对 PM 有用的判断是——当团队说「接一个新工具要两天」时,值得问一句是不是还在手写 schema。**

最后那句「你执行,或者你委派循环」提前预告了课程结构: **本课手写循环 → tool runner 委派循环 → 第 11–12 课托管智能体委派整个智能体。同一根轴上的三个刻度。**

---

*原课程 © Anthropic,本篇为中文整理存档,供个人学习使用。*
