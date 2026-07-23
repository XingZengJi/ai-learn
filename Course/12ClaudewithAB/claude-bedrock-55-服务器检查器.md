# Claude with AWS Bedrock - 55 The server inspector 服务器检查器

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 55
> 课程: Claude with AWS Bedrock · 第 55 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

搭建 MCP 服务器时,你需要一种不接完整应用就能测试功能的办法。Python MCP SDK 自带一个基于浏览器的检查器(inspector),可以实时调试和测试你的服务器。

## Starting the Inspector 启动检查器

先确认 Python 环境已激活(具体命令看项目的 README),然后运行:

```bash
mcp dev mcp_server.py
```

这会启动一个开发服务器,并给出一个本地 URL(通常在 6277 端口),在浏览器里打开就是检查器界面。

## Using the Inspector Interface 使用检查器界面

MCP 检查器仍在活跃开发中,等你用到时界面可能已经变样了,但核心功能是稳定的。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559685%2F11_-_005_-_The_Server_Inspector_05.1748559685073.png)

首次打开检查器,左侧会有一个「Connect」按钮。点它启动你的 MCP 服务器并加载工具。

## Testing Your Tools 测试你的工具

连接成功后,找到含有 Resources、Prompts、Tools 等分区的导航栏,点进 Tools 就能看到可用工具。

点「List Tools」列出服务器提供的全部工具。选中某个具体工具后,右侧面板会变成一个可以测试该工具的表单。

测试读取文档工具的步骤:

1. 选择 `read_doc_contents` 工具
2. 输入一个文档 ID(比如 `deposition.md`)
3. 点「Run Tool」

检查器会执行工具并展示结果,包括是否成功以及返回的数据。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559687%2F11_-_005_-_The_Server_Inspector_17.1748559687825.png)

编辑类工具也能测: 切到 `edit_document`,填入文档 ID、要替换的旧文本和新文本,运行看是否成功,再用读取工具确认改动确实生效了。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559689%2F11_-_005_-_The_Server_Inspector_16.1748559688815.png)

## Development Workflow 开发工作流

检查器会在左侧显示历次工具调用的历史,方便你追踪测过什么、重复之前的操作。由此形成一个高效的开发循环:

1. 改服务器代码
2. 重启检查器
3. 立即测试工具
4. 验证结果

随着 MCP 服务器越做越复杂,这个检查器会变得不可或缺——它省掉了「为了测个基础功能而把服务器接进完整应用」的麻烦,让开发既快又可靠。

对产品经理来说: 这相当于给后端接口配了个 Postman。价值不在于它能做什么新鲜事,而在于把「验证一个改动」的成本从几分钟压到几秒——开发循环的每一环都快一点,累积起来就是能不能高频迭代的差别。
