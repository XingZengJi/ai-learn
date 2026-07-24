# Claude Platform 101 - 09 MCP

> Course: Claude Platform 101 · Lesson 9 · 章节: Extending your Agent
> 课程: Claude Platform 101(Claude 开发者平台入门)· 第 9 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文整理翻译,2026-07-24

已经有了 tools、skills 和连接器,**那 MCP 为什么还要存在?** 乍看像是在 API 上又叠了一层 API。**答案归结为一件事: 集成代码由谁来维护。**

## 维护问题

假设你的智能体要一次性从 Asana 拉任务、查 Google 日历、搜 Slack。用自定义工具,你得写三个集成——**这部分还算可做。痛的是之后**: 每当其中某个服务改了 API(这事经常发生),你都得跟着维护。**恭喜,你现在在维护一堆第三方 API 封装。**

**MCP 把这份维护责任转移给了服务提供方。** Asana 发布一个 MCP 服务器,Slack 发一个,Google 发一个。**每个服务器通过标准协议暴露自己的工具**——带描述、schema 和认证。**他们的 API 变了,他们更新自己的服务器,你什么都不用改。**

## Tools / Skills / MCP 三者的分工

![三者分工](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966784%2F09-mcp_06.1780966784250.png)

- **Tools 把 Claude 连到你的内部系统**——你的数据库、你的项目跟踪器、你的专有 API。**代码归你,维护也归你**
- **Skills 教 Claude 一套流程**——你的报告模板、评审清单。**Skills 是指令,不一定是集成**
- **MCP 把 Claude 连到第三方服务**,**集成由服务提供方维护**。你不用写 Asana 封装——Asana 写好了

> **短版本: tools 管你自己的东西,skills 管你的流程,MCP 管别人的东西。**

## 连接一个 MCP 服务器

体会 MCP 最直接的方式,是把 Claude 指向任意一个 MCP 服务器,**让它自己去发现那里有什么。** 下面用 Linear 的 MCP 服务器,连接信息与认证令牌存在 `.env` 里。

请求里有两块协同工作:

- **`mcp_servers`** 声明连接——类型、URL、引用时用的名字,以及可选的认证令牌
- **`tools` 里一个 `mcp_toolset` 类型的条目**配置 Claude 能用该服务器的哪些工具。**默认是全部**,想收窄就在这里改

```python
import os
import anthropic

client = anthropic.Anthropic()

response = client.beta.messages.create(
    model="claude-opus-4-8",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "What tools do you have available?"}
    ],
    mcp_servers=[
        {
            "type": "url",
            "url": "https://mcp.linear.app/mcp",
            "name": "linear",
            "authorization_token": os.environ["LINEAR_MCP_TOKEN"],
        }
    ],
    tools=[
        {
            "type": "mcp_toolset",
            "mcp_server_name": "linear",
        }
    ],
    betas=["mcp-client-2025-11-20"],
)

print(response)
```

**注意我们一个工具 schema 都没写。Claude 会自省(introspect)那个服务器,拿回工具清单与它们的 schema,再为提示词挑出正确的那个。** 录制时 MCP 连接器仍是 beta,注意请求里的 beta header。

![运行结果](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966784%2F09-mcp_12.1780966784792.png)

跑起来,Claude 会列出 Linear 的工具然后调用其中一个。**基本上任何合规的服务器都能这么用。我们没定义任何工具,也没写 Linear 客户端——那是 Linear 在维护。**

## 限制 Claude 能用哪些工具

**MCP 服务器常常暴露非常多的工具,你未必希望 Claude 全都能用。** 可能你不想给它写权限,或者不想让那么多工具定义占用上下文。

**办法: 默认全部关闭,再逐个打开你要的。** 以 Slack MCP 服务器为例:

```python
tools=[
    {
        "type": "mcp_toolset",
        "mcp_server_name": "slack",
        "default_config": {
            "enabled": False,
        },
        "configs": {
            "search_messages": {"enabled": True},
            "list_channels": {"enabled": True},
        },
    }
]
```

**现在 Claude 能搜 Slack、能列频道,但不能发帖或删除。** 当你信任某个服务的读取、却不想让 Claude 代你写入时,这很有用。

## Recap 本课要点

- **MCP 存在的意义,是让你不必维护别人已经建好的集成。** 服务提供方发布 MCP 服务器并保持更新,**他们的 API 变了,你什么都不用改**
- **按活儿选特性: tools 管你的数据,skills 管你的流程,MCP 管第三方服务**
- 在 **`mcp_servers`** 里声明连接,在 `tools` 里用 **`mcp_toolset`** 授予访问。**Claude 自己自省服务器发现工具,不用写 schema**
- **用 `default_config: {"enabled": False}` 收窄权限**,再在 `configs` 里逐个开启——**适合把某个服务器保持为只读**
- MCP 连接器目前是 beta,请求要带 beta header
- 服务器清单与协议详情见 modelcontextprotocol.io

## 对产品经理来说

**这一课把 MCP 的价值主张讲得比大多数介绍都清楚: 它不是技术能力问题,是维护责任的归属问题。** 自定义工具和 MCP 在功能上可以做同一件事,差别在于**三年后谁在改代码**。

**这个判断标准可以直接用于技术选型讨论:**

| 要接的东西 | 用什么 | 理由 |
|---|---|---|
| 自家数据库、内部 API | **Tools** | 只有你有,也只能你维护 |
| 团队的流程规范 | **Skills** | 是指令不是集成 |
| Slack / Asana / Linear 等第三方 | **MCP** | **让服务方去维护** |

**「默认关闭、逐个开启」那个模式值得单独记。** 它同时解决两个问题——**权限**(别让 AI 代你发消息)和**上下文占用**(工具定义也吃 token)。前者是风险控制,后者是成本控制,**一个配置解决两件事,这类杠杆不多。**

对 PM 特别实际的一点: **MCP 让「接入某个 SaaS」从排期项变成配置项。** 但要注意前提是**对方发布了 MCP 服务器**——所以在做集成规划时,先查一下 modelcontextprotocol.io 上有没有现成的,比直接排开发工时更划算。

本仓库的 `Course/11MCP/`(**c09**)是 MCP 进阶专门课程,讲协议本身的进阶能力与传输层;`Course/07ClaudeApi/` 第 52–62 课教你从零实现 MCP 服务器与客户端。

---

*原课程 © Anthropic,本篇为中文整理存档,供个人学习使用。*
