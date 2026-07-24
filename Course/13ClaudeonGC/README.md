# Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)

Anthropic Academy 官方课程 <https://anthropic.skilljar.com/claude-with-google-vertex> 的中文笔记。

- 命名格式: `claude-vertex-NN-中文标题.md`,`NN` 与站点课次顺序一致(从 01 起,含 quiz 在内的完整目录里非 quiz 课次的序号)
- 站点共 93 个条目 = 82 个视频课 + 1 个模块课(Vertex AI Setup)+ 10 个 quiz。**quiz 不收录**
- 每篇含课程正文中文翻译 + 原课程配图的远程链接(图片托管在 S3,无签名、不过期)
- 英文原文抓取件在 `_source/`,已 gitignore,仅本地留存供核对
- 对应成就地图课程 ID: **`c15`**

## 未收录的课次

以下 17 课在站点上正文区为空(提示 "This video is still being processed"),纯视频无文字稿,故编号留空位:

| 编号 | 标题 |
|---|---|
| 01 | Welcome to the course |
| 02 | Overview of Claude models |
| 07 | Chat exercise |
| 09 | System prompts exercise |
| 14 | Structured data exercise |
| 21 | Exercise on prompt evals |
| 27 | Exercise on prompting |
| 52 | PDF support |
| 68 | Anthropic apps |
| 69 | Claude Code setup |
| 70 | Claude Code in action |
| 71 | Enhancements with MCP servers |
| 72 | Parallelizing Claude Code |
| 73 | Automated debugging |
| 74 | Computer use |
| 75 | How computer use works |
| 83 | Course Wrap Up |

其中 68–75 的内容与 `Course/12ClaudewithAB/` 的第 64–70 课基本重合(Claude Code、Computer Use 部分),可直接看那边的笔记。

## 与 Bedrock 版课程的关系

本课与 `Course/12ClaudewithAB/`(Claude with AWS Bedrock)是同一套教材的两个云平台版本,绝大部分内容一致。**实质差异集中在两处**:

- 第 04 课 Vertex AI 环境配置 —— Google Cloud 项目 + `gcloud` 凭据,对应 Bedrock 的 AWS profile
- 第 43 课 文本嵌入 —— 用 Google 的 `text-embedding-005` + `google-genai` SDK 生成嵌入

此外 Vertex 版比 Bedrock 版多出一整个「智能体与工作流」章节(第 76–82 课: 并行化、链式、路由三种工作流模式,以及智能体与工具、环境检查、二者取舍)。
