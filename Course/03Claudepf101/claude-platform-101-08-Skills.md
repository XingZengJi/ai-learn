# Claude Platform 101 - 08 Skills

> Course: Claude Platform 101 · Lesson 8 · 章节: Extending your Agent
> 课程: Claude Platform 101(Claude 开发者平台入门)· 第 8 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文整理翻译,2026-07-24

**Skills 是一个个文件夹,装着指令、脚本和资源,由 Claude 动态加载,用来提升特定任务上的表现。** 每个 Skill 的核心是一份 **`SKILL.md`** —— 一套打包好的指令,**上传一次,之后可以挂到任何 `messages.create` 调用上。**

你在教 Claude **你是怎么做某件事的**: 你的状态报告格式、你的评审清单、你的发布说明。**Claude 读这个 Skill、照着流程做,产出你要的形状。**

## Skills 与 tools 的区别

![Skills vs Tools](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966782%2F08-skills_05.1780966782476.png)

这两者解决的是不同问题:

- **Tools 把 Claude 连到数据与行动上。** 「查一下这条规范」「发这封邮件」——Claude 调用工具,由别的东西去执行
- **Skills 教 Claude 一套流程。** 「按这个模板生成每日状态报告」——**这是一份 Claude 读了照做的操作手册**,有时也包括它自己运行打包在里面的脚本

> **一句话记法: tools 关乎 Claude 能做什么,Skills 关乎你希望它怎么做。**

还有一点值得知道: **Skills 不会在启动时整个加载进上下文。一开始只加载 name 和 description**,当智能体判断某个 Skill 相关时,**才把完整内容载入上下文**。这样即使可用的 Skill 很多,上下文也能保持精简。

## 上传一个 Skill

Skills **上传一次到你的工作区,之后按 ID 引用。** 可以在 Claude Platform 上直接传,也可以用代码:

```python
skill = client.beta.skills.create(
    display_title="Status Report Generator",
    files=files_from_dir("status-report-skill"),  # 包含 SKILL.md 的文件夹
)

print(skill.id)  # 之后的请求引用这个 ID
```

例子里做的是一个**状态报告生成器**。什么算好的状态报告——分几节、什么语气、怎么做摘要、怎么处理阻塞项——**这些规则全都事先打包在 Skill 里**,而活动日志本身只是请求时传进来的一个字符串。

## 把 Skill 挂到请求上

Skill 通过 **container 配置**挂到请求上——container 里的一个 `skills` 数组,每项指定 `skill_id` 和 `version`:

```python
response = client.beta.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=4096,
    betas=["skills-2025-10-02", "code-execution-2025-08-25"],
    container={
        "skills": [
            {
                "type": "custom",
                "skill_id": skill.id,
                "version": "latest",
            }
        ]
    },
    tools=[
        {
            "type": "code_execution_20250825",
            "name": "code_execution",
        }
    ],
    messages=[
        {
            "role": "user",
            "content": f"Generate the daily status report from this activity log:\n\n{activity_log}",
        }
    ],
)
```

几处值得指出:

- 调用的是 **`client.beta.messages.create`**,不是标准那个,并通过 **beta header** 传入 skills 特性(录制时 Skills 仍是 beta)
- **`container.skills` 是挂载点,它是个列表**,所以可以在一次调用上叠加多个 Skill
- 这里同时打开了**代码执行**。**Skills 常常和代码执行配合得很好**,因为 Skill 的流程可能需要真的干活——比如在终端里跑脚本

## 运行结果

![运行结果](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966783%2F08-skills_12.1780966783105.png)

输出是一份**完全按 Skill 规定格式排布**的状态报告。分节、语气、阻塞项处理,全部来自你上传的 `SKILL.md`。**用户提示词只有一行;流程住在 Skill 里。**

![生产环境](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1780966783%2F08-skills_13.1780966783632.png)

在真实应用里,**这是一个团队把整个功能的输出标准化的方式。** 有了这个每日状态报告接口,**每位 PM 拿到的结构、语气、章节顺序都一样——不需要任何人把模板复制粘贴进提示词。**

## Recap 本课要点

- **Skills 打包你的流程。** 一份 `SKILL.md`(加上脚本与资源)教会 Claude 你希望某件事怎么做
- **Tools vs Skills: tools 关乎 Claude 能做什么,Skills 关乎你希望它怎么做**
- **Skills 是渐进加载的**: 启动时只载入 name 和 description,智能体决定要用时才载入完整内容
- 用 `client.beta.skills.create` **上传一次**,再用 `container.skills` 挂到任何 `messages.create` 上——**是列表,可叠加多个**
- **Skill 的流程需要真干活时,配合代码执行**
- **当「怎么做」和「做什么」同样重要时,就该用 Skill**

## 对产品经理来说

**「tools 关乎能做什么,Skills 关乎希望怎么做」——这个区分对 PM 特别友好,因为后者正是 PM 日常在生产的东西。** 评审清单、报告模板、发布流程规范、需求文档结构——**这些原本躺在 Confluence 里没人看的文档,现在有了一个可执行的载体。**

**最后那句「不需要任何人把模板复制粘贴进提示词」点出了真正的价值。** 没有 Skills 时,团队标准化 AI 输出的办法是共享一份提示词,而共享提示词的实际结局是: 每个人存了一份、各自改过、慢慢分叉。**Skill 把它变成了一个有版本、有 ID、集中更新的东西**——注意代码里那个 `version: "latest"`。

**「渐进加载」这个设计也值得理解**: 只有名称和描述常驻,完整内容按需加载。这意味着**你可以给一个智能体挂很多 Skill 而不炸上下文**,但也意味着——**和工具描述一样——Skill 的名称与描述写得好不好,直接决定它会不会被用上。** 这条在第 5 课出现过一次,在这里又出现一次,是这门课反复强调的同一件事。

本仓库的 `Course/16AgentSkills/`(**c04**)是 Skills 的专门课程,想深入可以看那门。

---

*原课程 © Anthropic,本篇为中文整理存档,供个人学习使用。*
