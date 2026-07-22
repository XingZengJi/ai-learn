# Building with the Claude API - 64 Claude Code setup Claude Code 搭建

> Course: Building with the Claude API · Lesson 64
> 课程: Building with the Claude API · 第 64 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

Claude Code 是一个基于终端的编程助手,直接运行在你的命令行里。可以把它想象成:Claude 就在你的终端里待命,帮你处理任何正在做的编程任务。

## Claude Code 能做什么

Claude Code 自带一整套全面的工具,协助你的开发工作流程:

- **文件操作** —— 在你的项目里搜索、读取、编辑文件
- **终端访问** —— 直接在对话里运行命令
- **网络访问** —— 搜索文档、获取代码示例等
- **MCP 服务器支持** —— 通过连接 MCP 服务器来添加更多工具

MCP 集成尤其强大,因为这意味着你可以通过接入数据库、API 或其他任何你要用到的服务的专用工具,来扩展 Claude Code 的能力。

Claude Code 支持 macOS、Windows WSL 和 Linux,所以不管你用的是什么开发环境,都能使用它。

## 安装步骤

搭建 Claude Code 只需要三步:

1. 从 nodejs.org/en/download 安装 Node.js(可以先在终端运行 `npm help` 检查是否已经安装过)
2. 用命令安装 Claude Code:`npm install -g @anthropic-ai/claude-code`
3. 在终端运行 `claude` 来启动并登录

第一次运行 `claude` 命令时,系统会提示你登录 Anthropic 账号。如果需要更详细的说明,完整的搭建指南可以在 docs.anthropic.com 上找到。

搭建完成后,Claude 就会直接出现在你的终端里,随时准备协助你正在进行的任何编程项目或任务。

---

对产品经理来说,「装个终端工具」听起来是工程师专属的事,但了解 Claude Code 的定位很有价值:它把 AI 助手从「网页聊天窗口」搬进了「实际的开发环境」,能直接读写文件、跑命令、接入公司内部工具——这和让员工用「浏览器里的问答助手」查资料、再手动照抄进系统,是完全不同量级的效率工具。评估团队要不要引入这类工具时,理解这个本质区别很关键。
