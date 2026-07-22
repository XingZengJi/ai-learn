# Building with the Claude API - 51 Code execution and the Files API 代码执行与 Files API

> Course: Building with the Claude API · Lesson 51
> 课程: Building with the Claude API · 第 51 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

Anthropic API 提供了两项配合起来格外好用的强大功能:Files API 和代码执行(Code Execution)。乍看之下它们像是两个独立的功能,但把它们结合起来,能为「把复杂任务委托给 Claude 处理」打开一些非常有意思的可能性。

## Files API

Files API 提供了另一种处理文件上传的方式。你不需要把图像或 PDF 直接以 base64 数据的形式编码进消息里,而是可以提前把文件上传好,之后再引用它。

具体运作方式是这样的:

1. 用一次单独的 API 调用,把你的文件(图像、PDF、文本等)上传给 Claude
2. 收到一个包含唯一文件 ID 的文件元数据对象
3. 在之后的消息里引用这个文件 ID,而不用每次都带上原始文件数据

当你想多次引用同一个文件,或者处理的是那种「每次请求都塞进去会很笨重」的大文件时,这种方式特别有用。

## 代码执行工具

代码执行是一个基于服务器的工具,不需要你自己提供实现。你只需要在请求里带上一个预定义好的工具 schema,Claude 就可以按需在一个隔离的 Docker 容器里执行 Python 代码。

代码执行环境的几个关键特点:

- 运行在一个隔离的 Docker 容器里
- 没有网络访问权限(不能发起外部 API 调用)
- 在一次对话里,Claude 可以多次执行代码
- 执行结果会被 Claude 捕获、解读,融入最终回答

## 把 Files API 和代码执行结合起来

真正的威力来自于把这两项功能结合起来使用。由于 Docker 容器没有网络访问权限,Files API 就成了往执行环境「送数据进去、把结果取出来」的主要方式。

典型的工作流程是这样的:

1. 用 Files API 上传你的数据文件(比如一份 CSV)
2. 在消息里带上一个 `container_upload` 块,附带这个文件 ID
3. 让 Claude 分析这份数据
4. Claude 编写并执行代码来处理你的文件
5. Claude 能生成输出(比如图表),供你下载

## 实际案例

来看一个用流媒体服务数据做的真实例子。这份 CSV 文件包含用户信息,包括订阅等级、观看习惯,以及他们是否流失(取消了订阅)。

首先,用一个辅助函数上传文件:

```python
file_metadata = upload('streaming.csv')
```

然后创建一条消息,同时包含已上传的文件和分析请求:

```python
messages = []
add_user_message(
    messages,
    [
        {
            "type": "text",
            "text": """Run a detailed analysis to determine major drivers of churn.
            Your final output should include at least one detailed plot summarizing your findings."""
        },
        {"type": "container_upload", "file_id": file_metadata.id},
    ],
)

chat(
    messages,
    tools=[{"type": "code_execution_20250522", "name": "code_execution"}]
)
```

## 理解响应结构

当 Claude 使用代码执行工具时,响应里会包含多种类型的块:

- **文本块** —— Claude 的分析说明
- **服务器工具使用块** —— Claude 实际决定运行的代码
- **代码执行结果块** —— 运行代码后得到的输出

在一次响应过程中,Claude 可能会多次执行代码,逐步迭代地构建它的分析。每一轮执行都包含代码本身和对应的结果。

## 下载生成的文件

最强大的功能之一,是 Claude 能生成文件(比如图表或报告),并让你能够下载它们。当 Claude 创建一个可视化图表时,它会被存进容器里,你可以用 Files API 把它下载下来。

在响应里找 `type: "code_execution_output"` 的块——这些块里包含着生成内容对应的文件 ID:

```python
download_file("file_id_from_response")
```

最终得到的是一份包含专业可视化图表的完整分析报告,这原本需要大量手动编码才能做出来。

## 不止于数据分析

虽然数据分析是最自然的应用场景,但 Files API 和代码执行的结合,还打开了许多其他可能性:

- 图像处理和编辑
- 文档解析与转换
- 数学计算与建模
- 带自定义格式的报告生成

核心在于:你可以把复杂的计算类任务委托给 Claude 处理,同时通过 Files API 保持对输入和输出的掌控。这打造出一套强大的工作流——Claude 变成了一个真正能执行代码、迭代打磨解决方案的编程助手。

---

对产品经理来说,「代码执行 + Files API」的组合相当于给 Claude 配了一个「带隔离沙箱的数据分析师工位」——你把数据文件递进去,它就能自己写代码、跑代码、出图表,而且这个工位没有对外网络权限,不用担心数据泄露到外部。这个能力最适合的场景是「用户上传一份数据,想要专业分析报告」这类需求,能省掉团队自己搭建数据分析流水线的大量工程投入。
