# Claude with AWS Bedrock - 67 Automated debugging 自动化调试

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 67
> 课程: Claude with AWS Bedrock · 第 67 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

Claude 不只能在编辑器里写代码,还能监控你的生产环境应用并自动修复出现的错误,形成一套自动化调试工作流,在问题影响用户之前就把它抓住并解决掉。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559783%2F12_-_006_-_Automated_Debugging_00.1748559782853.png)

## The Problem: Production-Only Errors 问题: 只在生产环境出现的错误

最让人头疼的调试场景之一,就是应用在开发环境好好的,一上生产就出问题。本地全测过、满怀信心部署,结果发现线上某些功能不工作。

课程里的例子是一个聊天机器人应用: 本地测试一切正常,能提问、能生成带假数据的表格。但把同样的代码部署到 AWS Amplify、跑同样的测试,表格生成却**静默失败**——请求发出去了,却没有数据出来。

## Traditional Debugging Approach 传统调试方式

通常你得:

1. 在 CloudWatch 日志里翻找错误信息
2. 解析复杂的错误详情和调用栈
3. 手动排查为什么代码在生产环境行为不同
4. 修复并重新部署

这个过程很费时间,尤其当错误信息晦涩难懂(比如 "The provided model identifier is invalid")又埋在海量日志里的时候。

## Automated Error Detection and Fixing 自动化的错误发现与修复

与其手动调试,不如做一个每天自动运行的 GitHub Action 来监控生产环境,把整个调试过程交给 Claude。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559783%2F12_-_006_-_Automated_Debugging_13.1748559783322.png)

自动化工作流的运作方式:

1. **准备** —— GitHub Action 检出仓库、安装依赖、配置好 Claude
2. **日志分析** —— 用 AWS CLI 取过去 24 小时的 CloudWatch 日志
3. **错误处理** —— Claude 分析日志,去重,识别出各个独立的错误
4. **实施修复** —— Claude 尝试修改相应代码来修复每个错误
5. **创建 PR** —— 提交修复并自动开一个 Pull Request 供人审查

## Real-World Example 实际案例

在那个聊天机器人的例子里,Claude 发现生产环境用了一个无效的模型标识符——起因是只在生产配置里出现的一个模型 ID 拼写错误。

Claude 定位到问题、找到正确的模型 ID 格式、更新了配置文件,并在提交信息里清楚说明了错在哪、怎么修的。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559784%2F12_-_006_-_Automated_Debugging_17.1748559783816.png)

## Benefits 好处

- **主动监控** —— 在你还没意识到有错误时就抓到了
- **节省时间** —— 省掉手动翻日志和调试的过程
- **文档清晰** —— 每个修复都附带详细说明
- **保留审查环节** —— 走 PR 流程,合并前你可以核实
- **持续改进** —— 自动运行,新问题出现就能捕获

## Implementation Considerations 实施注意事项

搭建这类自动化调试工作流时:

- 为 CloudWatch 访问配置好合适的 AWS 权限
- 给单次处理的错误数量设个合理上限,避免超出上下文窗口
- 加入相似错误的去重逻辑
- 确保工作流有创建 PR 所需的仓库写权限
- 考虑安排在业务低峰时段运行

这种自动化把调试从被动的手工活,变成了主动的自动化系统,只需极少人工介入就能让应用保持平稳运行。

对产品经理来说: 注意这套流程**没有跳过人工审查**——Claude 的终点是开一个 PR,不是直接改生产代码。这是自动化程度与风险控制之间的一个刻意取舍,也是值得照搬的设计原则: 让 AI 承担耗时的分析和起草工作,把「是否采纳」的决定权留在人手里。
