# Codex / OpenAI Academy 课程笔记

[OpenAI Academy](https://academy.openai.com/) 课程的中文学习笔记。

> **和 `Course/Claude/` 最大的不同：这里放的是「我自己写的学习笔记」，不是原文译述。**
> 原因见下面的「为什么不做译述」一节 —— 这不是偷懒，是这批课程的形态和授权决定的。

- 对应成就地图厂商：**openai**（`docs/data/openai/`），与站点右上角切到 OpenAI 版时看到的是同一套数据
- 课程文件夹命名沿用全仓约定：**两位序号 + 简称**，序号是收录顺序，**不等于成就地图课程 ID**
- 每个课程文件夹各自一套文件名前缀，见各自 README
- 每课笔记照 [`笔记模板.md`](笔记模板.md) 起头，注意引用块与 `Course/Claude/` 的不一样

## 现有课程

| 文件夹 | 课程 | 成就地图 ID | 状态 |
|---|---|---|---|
| [`01AIFound/`](01AIFound/) | AI Foundations（AI 基础） | `c01` | 骨架已建，待学习后填笔记 |
| [`02AppliedAIF/`](02AppliedAIF/) | Applied AI Foundations（应用 AI 基础） | `c02` | 骨架已建，待学习后填笔记 |
| [`03AgentsWF/`](03AgentsWF/) | Agents and Workflows（智能体与工作流） | `c03` | 骨架已建，待学习后填笔记 |

三门课是一条有先后的路径：`c01` → `c02` → `c03`，后一门的 `prereq` 指向前一门。题库已经补好（26 个知识点、87 道题），**先学、再写笔记、最后回来校订题目**。

## 为什么不做译述

`Course/Claude/` 那 21 门课是抓取英文原文后逐课中文译述的。这批课不能照搬同一套做法，三个原因：

1. **课次本体是 SCORM 互动课件。** 页面正文不在 HTML 里，走 `/api/courses/<slug>/scorm-proxy` 代理，配套还有专门记进度的 `SetCourseScormLessonValue`。抓下来是分屏卡片、翻牌、拖拽这类碎片，转成 markdown 会把结构全丢掉
2. **站内拿不到文字稿。** 内容经 GraphQL 客户端渲染，`__NEXT_DATA__` 里只有站点配置和 i18n；`/api/graphql` 的 POST 一律 403（不带 cookie 发同样 403，所以不是登录问题），GET 只收 Automatic Persisted Queries 而注册新 query 必须走 POST
3. **授权性质不同，而本仓是公开仓。** Anthropic 那批多为 CC BY-NC-SA 4.0，署名 + 同许可即可合法改编。OpenAI Academy 走的是 [openai.com 通用条款](https://openai.com/policies/)，**没有 CC 授权** —— 把课件全文译述推到 GitHub Pages 上，性质和之前不一样

**所以这里的做法是：学完一课，用自己的话写要点。** 这本来也是 `notes/` 一直在用的费曼输出法，而且对 Codex 这类编码智能体来说，动手跑一遍本来就比读文字稿有价值。

## 写笔记时的两条纪律

沿用全仓的「两类拿不到的内容如实标注，不要编补」：

- **拿不准的就标「待确认」**，不要凭印象补细节。这批课没有原文可核，编补一旦进了笔记，后面出题、复盘都会跟着错
- **引用块用 [`笔记模板.md`](笔记模板.md) 里那一套**，不要复制 `Course/Claude/` 的 —— 那边声明的是「本篇为中文译述，同样以 CC BY-NC-SA 4.0 提供」，用在这里是错误的授权声明

## 关于 `_source/`

`Course/*/*/_source/` 已 gitignore。这批课抓不到英文原文，该目录多半用不上；若你自己整理了摘录或截图想留档，放这里，不会进公开仓。

## 许可

原课程 © OpenAI，依 [openai.com 使用条款](https://openai.com/policies/) 提供，**未以 CC 许可发布**。

本目录下的内容是学习者本人在学习该课程后用自己的话写成的笔记与总结，属独立创作，引用课程名称与模块结构仅作出处标注之用；不包含课程原文的翻译或实质性复制。
