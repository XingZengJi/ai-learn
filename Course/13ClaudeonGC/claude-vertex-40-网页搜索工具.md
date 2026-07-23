# Claude with Google Vertex - 40 The web search tool 网页搜索工具

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 40
> 课程: Claude with Google Vertex · 第 40 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

Claude 内置了一个网页搜索工具,能上网检索当前或专业信息来回答用户问题。和其他工具不同,**这个工具的实现不需要你写**——整个搜索过程由 Claude 自动完成,你只要提供一份简单的 schema 把它打开。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620026%2F06_-_013_-_The_Web_Search_Tool_00.1748620026281.png)

## Setting Up the Web Search Tool 配置网页搜索工具

要使用它,创建一个带这些必填字段的 schema 对象:

```python
web_search_schema = {
    "type": "web_search_20250305",
    "name": "web_search", 
    "max_uses": 5
}
```

`max_uses` 限制 Claude 能执行多少次搜索。它可能会基于初次结果做追加搜索,这个字段防止 API 调用过多。

## How It Works 工作方式

把网页搜索 schema 放进 tools 列表后,Claude 会根据你的问题自动决定何时搜索。比如问 "What's the best exercise for gaining leg muscle?",可能就会触发一次关于最新健身研究的搜索。

响应里包含几类块:

- **TextBlock** —— Claude 对自己正在做什么的说明
- **ServerToolUseBlock** —— 显示 Claude 实际用的搜索查询词
- **WebSearchToolResultBlock** —— 装着搜索结果
- **WebSearchResultBlock** —— 单条搜索结果,含标题和 URL
- **CitationsWebSearchResultLocation** —— 支撑 Claude 说法的具体文本引用

## Restricting Search Domains 限制搜索域名

可以用 `allowed_domains` 字段把搜索限制在特定域名。想要权威来源时特别有用:

```python
web_search_schema = {
    "type": "web_search_20250305",
    "name": "web_search",
    "max_uses": 5,
    "allowed_domains": ["nih.gov"]
}
```

这样 Claude 只会搜索政府卫生网站这类可信域名,而不是随便哪个信息可能不靠谱的健身博客。

## Rendering Search Results 渲染搜索结果

响应结构是为丰富的 UI 呈现设计的。通常这么做:

- 把文本块作为正文内容显示
- 把网页搜索结果作为参考文献列表放在顶部
- 把引用内联渲染,并链接回原始材料
- 高亮被引用的文本,展示 Claude 的说法是怎么被支撑的

这营造出一种透明的体验: 用户可以核实 Claude 的来源,理解它是怎么得出结论的。**引用系统通过展示证据来建立信任。**

对产品经理来说: `allowed_domains` 这个字段值得特别注意——它把「AI 会不会引用不靠谱的来源」从一个概率问题变成了确定性约束。在医疗、法律、金融这类高信任度要求的场景,这一条往往是功能能否上线的前提。另外,引用与高亮不只是好看,它把「用户能否自行核实」变成了产品能力,这在 AI 功能的信任设计里是最实在的一环。
