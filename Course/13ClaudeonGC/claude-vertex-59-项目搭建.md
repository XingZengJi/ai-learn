# Claude with Google Vertex - 59 Project setup 项目搭建

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 59
> 课程: Claude with Google Vertex · 第 59 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

我们要做一个基于命令行的聊天机器人,演示 MCP 客户端与服务器如何协同。这个动手项目会让你对 MCP 架构的两端都有实际体感。

## What We're Building 我们要做什么

这个聊天机器人让用户能用自然语言与一批文档交互。系统由两个主要部分组成:

- 一个 **MCP 客户端**,处理用户交互并与 Claude 通信
- 一个 **MCP 服务器**,提供读取和更新文档的工具

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621130%2F09_-_003_-_Project_Setup_04.1748621130536.png)

服务器会向 Claude 暴露两个工具:

- 读取某份文档内容的工具
- 更新某份文档内容的工具

为简单起见,所有文档都存在内存里——包括 `document.pdf`、`spreadsheet.xlsx`、`report.txt`、`spec.md` 等。

## Important Architecture Note 重要的架构提示

在真实项目里,你通常**只实现其中一端**,不会两边都做。可能是:

- 只做一个 MCP 服务器,把你自己服务的能力暴露给 AI 模型
- 只做一个 MCP 客户端,连接别人已经做好的 MCP 服务器

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621131%2F09_-_003_-_Project_Setup_07.1748621131329.png)

本项目两端都做,**纯粹是为了教学**——为了理解它们如何通信、如何配合。

## Project Setup 项目配置

下载本课视频附带的 `CLI_project.zip`,解压到你惯用的开发目录,然后在项目文件夹里打开代码编辑器。

## Configuration 配置

项目里的 `README.md` 有详细配置说明。你需要:

- 把你的 Anthropic API key 填进 `.env` 文件
- 用 UV(推荐)或 pip 安装依赖

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621132%2F09_-_003_-_Project_Setup_14.1748621131900.png)

`.env` 文件内容:

```
ANTHROPIC_API_KEY="your-api-key-here"
```

## Running the Project 运行项目

配置完成后,在终端进入项目目录运行:

```bash
# 用 UV(推荐)
uv run main.py

# 用标准 Python
python main.py
```

你应该看到一个聊天提示符出现。随便问个简单问题(比如 "what's 1+1?")验证一切正常。

初始项目已经包含了与 Claude 对话的基础能力。后面几课会加上 MCP 服务器能力和文档管理功能,做成一个完整可用的、能理解文档的聊天机器人。
