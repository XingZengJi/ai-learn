# Claude with Google Vertex - 39 The text edit tool 文本编辑器工具

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 39
> 课程: Claude with Google Vertex · 第 39 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

> **重要提示**: 各模型版本对应的工具版本串见 <https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/text-editor-tool>

Claude 自带一个不需要你从零编写的内置工具: **文本编辑器工具**。它让 Claude 能像你在普通文本编辑器里那样操作文件和目录。

## What the Text Editor Tool Can Do 这个工具能做什么

文本编辑器工具给 Claude 提供了一整套文件操作能力:

- 查看文件或目录内容
- 查看文件中指定的行范围
- 替换文件中的文本
- 创建新文件
- 在文件的指定行插入文本
- 撤销最近的文件编辑

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620032%2F06_-_012_-_The_Text_Edit_Tool_00.1748620032281.png)

这大幅扩展了 Claude 的能力,基本上让它开箱即可扮演一名软件工程师。

## Understanding the Implementation Requirements 理解实现要求

这里容易让人困惑: **工具 schema 是内置的,但实际实现还得你自己写**。可以这样理解——Claude 知道怎么提出文件操作请求,但真正执行这些操作的代码要由你来写。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620033%2F06_-_012_-_The_Text_Edit_Tool_04.1748620032972.png)

用自定义工具时,你要写 JSON schema 和函数实现两部分。用文本编辑器工具时,schema 那部分的知识由 Claude 提供,但你必须写出处理它「创建文件、读目录、替换文本」等请求的函数。

## Schema Versions schema 版本

使用文本编辑器工具时仍需带上一小段 schema 存根,具体内容取决于你用的 Claude 模型:

```python
def get_text_edit_schema(model):
    if model.startswith("claude-3-7-sonnet"):
        return {
            "type": "text_editor_20250124",
            "name": "str_replace_editor",
        }
    elif model.startswith("claude-3-5-sonnet"):
        return {
            "type": "text_editor_20241022", 
            "name": "str_replace_editor",
        }
```

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748620033%2F06_-_012_-_The_Text_Edit_Tool_11.1748620033628.png)

Claude 会自动把这个精简 schema 展开成一份包含全部可用参数和操作的详细规格。

## Practical Example 实际例子

看看它怎么用。你让 Claude 处理文件时,它会按需用这个工具读取、修改、创建文件。

比如你说 "Open the ./main.py file and summarize its contents",Claude 会:

1. 用文本编辑器工具查看该文件
2. 读取内容
3. 给你一份摘要

还可以更进一步,让它改文件。比如: "Open the ./main.py file and write out a function to calculate pi to the 5th digit. Then create a ./test.py file to test your implementation."

Claude 会:

1. 查看现有的 `main.py`
2. 把内容替换成含圆周率计算函数的新实现
3. 新建一个 `test.py`,写上相应的单元测试

## Why Use the Text Editor Tool? 为什么要用它

现在的代码编辑器都内置 AI 助手了,你可能会问这个工具存在的意义。它在这些场景下有价值:

- 你在做需要以程序方式编辑文件的应用
- 你的工作环境里没有功能完整的代码编辑器
- 你想把文件编辑能力直接集成进自己的 Claude 应用

本质上,这个工具让你能在自己的应用里复刻出一个「AI 代码编辑器」的大部分功能,让 Claude 成为真正能读写、修改文件系统的编程助手。

对产品经理来说: 「schema 内置、实现自备」这个设计有个重要的安全含义——**文件访问的边界完全由你的实现决定**。Claude 请求「读 /etc/passwd」时,能不能读取决于你写的那个函数允不允许。做这类功能时,路径白名单和沙箱是必须在方案里写明的部分,不能默认它安全。
