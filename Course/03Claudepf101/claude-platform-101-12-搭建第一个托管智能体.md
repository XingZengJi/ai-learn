# Claude Platform 101 - 12 Building your first managed agent 搭建你的第一个托管智能体

> Course: Claude Platform 101 · Lesson 12 · 章节: Managed Agents
> 课程: Claude Platform 101(Claude 开发者平台入门)· 第 12 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文整理翻译,2026-07-24

手写过智能体循环的人都熟悉那套流程: `while` 循环、stop reason 分支、执行工具。**这没问题,对很多功能来说这就是对的形态。**

**但有时候那个循环会跑很久**——几分钟、甚至几小时——**跨越很多工具,有状态要保持、有文件要写、断网之后还要能续上。** 到那个程度,你不会想在自己服务器上跑这个循环,**你想把它委派出去。这就是托管智能体。**

## 托管智能体是什么

**一个跑在 Anthropic 基础设施上、而非你自己机器上的智能体循环。** 你描述一次智能体,给它一个运行环境,启动一个会话。**Anthropic 跑循环,你只管把事件流读出来。**

> **托管智能体对每个 API 账户默认开启,不需要特殊权限。**

## 四个原语

**它们是有顺序的:**

| 原语 | 是什么 |
|---|---|
| **Agent** | **人设**: 模型、系统提示词、工具集。**可跨多次运行复用** |
| **Environment** | **运行地点**: 云端或本地、网络配置等 |
| **Session** | 某个智能体在某个环境里的**单次运行。会话是工作的单位** |
| **Events** | 进出的消息: 智能体的动作、工具调用、结果、回复 |

![四个原语](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966789%2F11-building-your-first-managed-agent_05.1780966789700.png)

各部分怎么拼: **你的应用与 session 对话,session 在 environment 里驱动工作,发生的一切通过事件流回传。**

> **注意这里的转变: 你不再跑 `while` 循环,而是在发送事件、读取事件。**

## 最小的托管智能体

做一个最小但有用的: **在临时目录建一个文件、数它有多少行、报告回来。**

工具方面用 **agent toolset** —— Anthropic 打包好的文件、bash 与网络工具。**够用,所以我们一个工具都不用自己定义。**

### 第 1 步: 创建 agent

注意 `tools` 数组里直接写的就是那个打包工具集:

```python
import anthropic

client = anthropic.Anthropic()

agent = client.beta.agents.create(
    name="Line Counter",
    model="claude-opus-4-8",
    system="You are a helpful agent that completes small file tasks.",
    tools=[
        {"type": "agent_toolset_20260401", "default_config": {"enabled": True}}
    ],
)
```

> **记住: agent 是可复用的。创建一次,可以在很多 session 里反复跑。**

### 第 2 步: 创建 environment

这一步拉起容器模板——云端、网络不受限。**文件实际就写在这个沙箱里:**

```python
environment = client.beta.environments.create(
    name="line-counter-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)
```

### 第 3 步: 创建 session

用我们的 agent 和 environment 建一个会话,标题可选。**session 是工作的单位:**

```python
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    title="Count lines demo",
)
```

### 第 4 步: 先开流,再发起始消息

> ⚠️ **注意顺序: 先开事件流。流只会投递「打开之后」发生的事件,所以永远先开流、再发起始消息。**

```python
with client.beta.sessions.events.stream(session_id=session.id) as stream:
    # 流已打开 —— 现在发送起始消息
    client.beta.sessions.events.send(
        session_id=session.id,
        events=[
            {
                "type": "user.message",
                "content": [
                    {
                        "type": "text",
                        "text": "Create a file in the temp directory, "
                                "count its lines, and report back.",
                    }
                ],
            }
        ],
    )
```

注意是 **`events`——复数。事件是这套 API 里一切流动的方式。**

### 第 5 步: 消费事件流

这个 demo 里有三种事件类型要紧:

- **`agent.message`** —— Claude 的文本
- **`agent.tool_use`** —— Claude 挑了哪个工具
- **`session.status_idle`** —— 智能体干完了

```python
for event in stream:
        if event.type == "agent.message":
            for block in event.content:
                if block.type == "text":
                    print(block.text, end="", flush=True)
        elif event.type == "agent.tool_use":
            print(f"\n[tool] {event.name}")
        elif event.type == "session.status_idle":
            print("\n--- Agent done ---")
            break
```

![运行结果](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966790%2F11-building-your-first-managed-agent_11.1780966790265.png)

跑起来,输出是智能体一边推理一边说话——实际文本、它挑的工具、最终答案。**全都跑在 Anthropic 的容器里,不是你的。**

## 这笔交换

**平时写智能体,循环是我们自己的,什么都得自己控制。用托管智能体,你把循环、沙箱、可恢复性一并委派出去,只管消费进来的事件流。**

![生产场景](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966791%2F11-building-your-first-managed-agent_13.1780966790724.png)

在真实应用里,**这是「长时运行、要碰文件、『去帮我把这个整理一下』」这类任务的形态。** 比如一次文件共享目录清理: 智能体读取目标目录结构规范、走一遍杂乱的收件夹、把文件移进正确的项目文件夹、归档重复项与零字节垃圾、**并把它不能确信归类的东西标记出来**——整个会话可以针对几千个文件跑上几分钟。

## Recap 本课要点

- **托管智能体就是那个智能体循环,只是替你跑——在 Anthropic 的基础设施上而非你的服务器上**
- 流程是: **创建 agent → 创建 environment → 创建 session → 发送事件进去 → 把事件流读出来**
- **agent(模型、系统提示词、工具集)可跨运行复用;session 是单次运行;events 是一切流动的方式**
- **先开事件流,再发起始消息**——它只投递打开之后发生的事件
- 盯三个事件: **`agent.message`(文本)、`agent.tool_use`(工具选择)、`session.status_idle`(完成)**
- **循环太长、干得太多、或需要扛住中断时,用托管智能体。想完全控制时,用手写循环**

## 对产品经理来说

**最后那条 Recap 就是这门课给的决策依据,值得单独抄出来:**

| 用手写循环 | 用托管智能体 |
|---|---|
| 循环短、几轮就结束 | **要跑几分钟到几小时** |
| 要完全控制每一步 | 跨很多工具、要保持状态 |
| 跑在你自己的基础设施上 | **要能写文件、断了能续上** |

**「你不再跑 while 循环,而是在发送事件、读取事件」——这个转变的产品含义很大。** 事件流意味着**进度天然是可展示的**: 上一课看板那个例子里,用户能实时看着智能体干活。**对于要跑几分钟的任务,「能看见它在做什么」不是锦上添花,而是这个功能可不可用的前提**——否则用户面对的就是一个转了五分钟的加载圈。

**「agent 可复用、session 是单次运行」这个划分对应到产品上很清楚**: agent 是你定义一次的能力(相当于一个功能),session 是每个用户每次的调用。**这也意味着改进 agent 的定义,所有后续 session 立刻受益**——和第 8 课 Skills 的集中更新是同一个好处。

**那个「先开流再发消息」的坑值得记住**,因为它属于典型的「本地测试可能碰巧不出问题、上线后偶发丢事件」的类型。

最后,文件清理那个例子里有个容易略过但很好的设计: **「把不能确信归类的东西标记出来」。** 智能体不是非得全自动——**主动暴露不确定项、把它们交还给人,通常比强行做完更有产品价值。**

---

*原课程 © Anthropic,本篇为中文整理存档,供个人学习使用。*
