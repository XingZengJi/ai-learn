# Building with the Claude API - 36 The web search tool 网络搜索工具

> Course: Building with the Claude API · Lesson 36
> 课程: Building with the Claude API · 第 36 课(原课程页面编号与第 35 课重复,疑为官方页面编号笔误,此处按实际顺序续编为 36)
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

重要说明:使用前,你所在的组织必须先在设置控制台里启用「Web Search」工具。设置入口在这里:https://console.anthropic.com/settings/privacy

Claude 内置了一个网络搜索工具,能让它上网搜索最新或专业信息,来回答用户的问题。和其他需要你自己提供实现的工具不同,整个搜索过程都由 Claude 自动完成——你只需要提供一份简单的 schema 来启用它。

## 配置网络搜索工具

要使用网络搜索工具,创建一个包含以下必填字段的 schema 对象:

```python
web_search_schema = {
    "type": "web_search_20250305",
    "name": "web_search", 
    "max_uses": 5
}
```

`max_uses` 字段限制了 Claude 最多能执行多少次搜索。Claude 可能会根据初次搜索结果发起后续搜索,这个字段能防止 API 调用次数失控。单次搜索会返回多条结果,但 Claude 可能会判断还需要再搜一次。

## 响应结构是怎样的

当 Claude 使用网络搜索工具时,响应里会包含好几种类型的块:

- **文本块** —— Claude 对自己在做什么的说明
- **ServerToolUseBlock** —— 显示 Claude 实际使用的搜索关键词
- **WebSearchToolResultBlock** —— 包含搜索结果
- **WebSearchResultBlock** —— 单条搜索结果,带标题和 URL
- **引用块(Citation blocks)** —— 支撑 Claude 论述的具体文字

这个响应结构让你能清楚看到 Claude 到底搜了什么、找到了哪些来源。引用信息里包含 Claude 用来支撑其回答的具体文字片段,以及对应的来源 URL。

## 限制搜索的域名范围

你可以用 `allowed_domains` 字段把搜索限制在特定域名内。当你想确保信息来自可靠、权威的来源时,这个功能特别有用:

```python
web_search_schema = {
    "type": "web_search_20250305",
    "name": "web_search",
    "max_uses": 5,
    "allowed_domains": ["nih.gov"]
}
```

比如,当询问医疗或运动相关的建议时,把搜索限制在 PubMed(nih.gov)这类域名,能确保你拿到的是有循证依据的信息,而不是随便什么博客文章。

## 渲染搜索结果

响应里的不同类型的块,是为特定的 UI 渲染场景设计的:

- 把文本块渲染成普通内容
- 把网络搜索结果作为「来源列表」展示在顶部
- 把引用内容嵌在文字中内联展示,包括来源域名、页面标题、URL 和引用的原文

这种结构能帮助用户理解 Claude 是如何得出答案的,也为所使用的信息来源提供了透明度。引用的格式能清楚说明「哪条具体信息来自哪个来源」,增强用户对 AI 回答的信任。

## 实际应用场景

网络搜索工具最适合用于:

- 时事和最新进展
- Claude 训练数据里没有的专业信息
- 事实核查、寻找权威来源
- 需要最新信息的研究类任务

在 API 调用的 `tools` 数组里加入这份 schema 即可,Claude 会自动判断「什么时候发起一次网络搜索能帮到用户」。

## 课程资料下载

- 006_web_search.ipynb
- 006_web_search_complete.ipynb

---

对产品经理来说,网络搜索工具的引用机制(citation)本质上是「信息可追溯」——就像做竞品分析报告时,每条结论后面都标注数据来源和链接,而不是甩出一个没有出处的结论。`allowed_domains` 这个设置则相当于「只信白名单信源」:比如做医疗、法律相关的产品功能时,限定只从权威站点取材,能大幅降低「AI 一本正经地胡说八道」的风险。
