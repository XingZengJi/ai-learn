# Introduction to Agent Skills(Agent Skills 入门)

Anthropic Academy 官方课程 <https://anthropic.skilljar.com/introduction-to-agent-skills> 的中文笔记。

- 命名格式: `agent-skills-NN-中文标题.md`,`NN` 与站点课次顺序一致(从 01 起)
- 站点共 6 个条目,**全部为正课**,无 quiz、无跳过课次
- 每篇含课程正文中文整理 + 原课程配图的远程链接(共 12 张,图片托管在 S3,无签名、不过期)
- 英文原文抓取件在 `_source/`,已 gitignore,仅本地留存供核对
- 对应成就地图课程 ID: **`c04`**

## 课次一览

| 编号 | 标题 | 建议用时 | 配图 |
|---|---|---|---|
| 01 | 什么是 Skills | 15 分钟 | 2 |
| 02 | 创建第一个 Skill | 20 分钟 | 3 |
| 03 | 配置与多文件 Skill | 20 分钟 | 2 |
| 04 | 与其他定制方式的对比 | 15 分钟 | 1 |
| 05 | 分享 Skills | 20 分钟 | 3 |
| 06 | 排错 | 15 分钟 | 1 |

## 课程主线

六节课是一条从「认识」到「上生产」的完整链路:

1. **概念**(01)—— Skills 是带 `name`/`description` frontmatter 的 `SKILL.md`;与 CLAUDE.md、斜杠命令的根本区别是**按需加载**
2. **动手**(02)—— 从零建一个;理解「启动时只加载名称与描述、匹配后才载入全文」的机制;优先级 **企业 → 个人 → 项目 → 插件**
3. **进阶配置**(03)—— `allowed-tools` 加护栏、`model` 指定模型;**渐进式披露**(`SKILL.md` 控制在 500 行内,其余拆到 `scripts/`、`references/`、`assets/`);脚本执行不载入内容,只有输出耗 token
4. **选型**(04)—— Skills / CLAUDE.md / 子智能体 / Hooks / MCP 各自的适用边界,以及如何组合
5. **分发**(05)—— 仓库提交、插件市场、企业托管设置三种方式;**子智能体不会自动继承 Skills**,必须在 agent 的 `skills` 字段显式列出
6. **排错**(06)—— 按症状分类的排查清单;先跑校验器再排查其他

## 几个容易踩的坑

课程中明确点出、值得单独记住的:

- **`SKILL.md` 必须放在具名目录里**,不能直接扔在 skills 根目录;文件名必须精确是 `SKILL.md`("SKILL" 全大写)
- **改动 Skill 后必须重启 Claude Code** 才生效
- **Skill 不触发,原因几乎总是 `description` 写得不好**——Claude 做的是语义匹配,描述里得有你实际会用的说法
- **内置智能体(Explorer、Plan、Verify)完全无法使用 Skills**,只有 `.claude/agents` 里定义的自定义子智能体可以
- **重名时企业级永远赢**,个人 Skill 被无视多半是这个原因,改名通常比找管理员省事

## 与本仓库的关系

本仓库 `shared/skills/` 下已有若干 Claude Code Skills,可对照本课内容检视结构是否规范。`projects/ai-job/` 自带的三个 skills(job-application-assistant、job-scraper、upskill)是项目级 Skills 的实例。
