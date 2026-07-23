# Claude with AWS Bedrock - 69 How Computer Use works 计算机使用的原理

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 69
> 课程: Claude with AWS Bedrock · 第 69 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

Claude 的 Computer Use 和普通的工具使用**完全是同一套机制**,建立在你已经熟悉的基础之上。唯一的区别在于: 这次 Claude 调用的不是天气 API 或数据库函数,而是控制电脑界面的请求。

## Tool Use Refresher 工具使用回顾

先快速复习标准工具使用的流程。你发给 Claude 的请求里同时包含用户消息和工具 schema,后者描述了你想开放给 Claude 的额外功能。

典型流程:

1. 你把问题连同可用的工具 schema 一起发给 Claude
2. Claude 分析请求,判断需要使用某个工具
3. Claude 返回一个工具调用请求,含工具名和所需输入
4. 你的服务器执行该工具函数并拿到结果
5. 你把工具结果发回给 Claude

比如问旧金山的天气,Claude 可能调用 `get_weather` 函数并传入地点参数,你的服务器去取天气数据,再把结果返回给 Claude。

## Computer Use: Same Flow, Different Tool 同样的流程,不同的工具

Computer Use 走的正是这套流程,区别只在于「工具」实际做的事——不是取天气数据,而是模拟鼠标点击、键盘输入之类的电脑操作。

启用 Computer Use 时,你发给 Claude 的是一个特殊的工具 schema,它会在后台**自动展开**。你这边写的是一个简单 schema,展开后变成一份完整的接口说明,告诉 Claude 它可以执行这些动作:

- 鼠标移动和点击
- 键盘输入和组合键
- 截屏
- 滚动及其他界面交互

你发出去的 schema 很精简,但它会自动转换成包含全部电脑交互能力的详细规格。

## The Technical Implementation 技术实现

要让 Computer Use 跑起来,你需要一个能以程序方式执行 Claude 所请求动作的计算环境。官方参考实现用的是一个运行 Firefox 的 Docker 容器,外加能模拟按键和鼠标移动的代码。

当 Claude 决定与电脑交互时,它像调用任何其他工具一样发出工具调用请求。你的服务器收到请求,在容器化环境里执行对应动作——点击按钮、输入文本或者截屏。

**这里有个重要认知**: Claude 并不是在直接控制一台电脑。它只是在发工具请求,由你的基础设施把这些请求翻译成真实的电脑操作。

## Getting Started 上手

这套基础设施不用你从零搭,Anthropic 提供了参考实现,把复杂的部分都处理好了。

配置 Computer Use 需要:

- 系统里装好 Docker 运行时
- 本地配置好 AWS profile(通常是 `default`)
- Anthropic quickstarts 仓库里的参考实现

准备就绪后,一条命令就能启动 Docker 容器,得到演示里那样的界面: 左边是聊天界面,你在这里跟 Claude 对话; 右边是浏览器环境,Claude 在这里操作网页和应用。配置过程很直接,完整指南在 GitHub 上的 Anthropic quickstarts 仓库里。这份参考实现提供了你在安全、隔离的环境中开始实验所需的一切。

对产品经理来说: 「Claude 并不是在直接控制电脑」这句话值得记住。它发出的只是「点击坐标 (300, 450)」这样的请求,真正执行的是你自己的基础设施。这个区分在讨论安全边界时很关键——**能力上限是由你的执行层决定的**,你不给它实现某个动作,它就做不到。控制权始终在你这边。
