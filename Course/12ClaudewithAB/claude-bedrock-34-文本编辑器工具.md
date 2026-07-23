# Claude with AWS Bedrock - 34 The Text Editor Tool 文本编辑器工具

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 34
> 课程: Claude with AWS Bedrock · 第 34 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

> **重要说明:** 文本编辑器工具最新的工具 ID,请参见 AWS 官方文档:https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages-tool-use.html#model-parameters-anthropic-anthropic-defined-tools

## Lesson Content 课程内容

The Text Editor Tool is Claude's built-in capability that gives it file system access and text editing abilities. Unlike other tools where you write both the schema and implementation, Claude already knows how to request text editor operations - you just need to handle those requests.

> 文本编辑器工具(Text Editor Tool)是 Claude 内置的能力,让它能访问文件系统、具备文本编辑能力。和其他需要你自己写 schema 和实现的工具不同,Claude 已经知道该如何发起文本编辑操作的请求——你只需要负责处理这些请求。

## What the Text Editor Tool Does 文本编辑器工具能做什么

This tool gives Claude the ability to work with files and directories like a software engineer would:

> 这个工具让 Claude 具备了像软件工程师一样处理文件和目录的能力:

- View file or directory contents. 查看文件或目录内容。
- View specific ranges of lines in a file. 查看文件中特定范围的行。
- Replace text in files. 替换文件中的文本。
- Create new files. 创建新文件。
- Insert text at specific line numbers. 在特定行号插入文本。
- Undo recent edits. 撤销最近的编辑。

## How It Works 运作原理

The Text Editor Tool is different from custom tools because only the JSON schema is built into Claude. You still need to provide the actual implementation.

> 文本编辑器工具和自定义工具不同,因为只有 JSON schema 是内置在 Claude 里的,真正的实现还是需要你自己提供。

When you create custom tools, you write both sides - the schema that tells Claude about the tool, and the function that actually does the work. With the Text Editor Tool, Claude already has the schema, but you must write functions to handle Claude's requests to view, edit, or create files.

> 当你创建自定义工具时,你需要写两边——向 Claude 说明工具情况的 schema,以及真正干活的函数。而文本编辑器工具的 schema Claude 已经有了,但你必须自己写函数,来处理 Claude 发来的「查看、编辑或创建文件」的请求。

对产品经理来说,这有点像用现成的报销申请单模板(schema 已经定好),但公司财务系统的对接逻辑(具体怎么真正把钱打出去)还是得你自己接入——表单格式不用你操心,但落地执行的那部分工作还是少不了。

## Setting Up the Tool 设置工具

To use the Text Editor Tool, you need to provide specific tool names that vary by Claude version:

> 要使用文本编辑器工具,你需要提供特定的工具名称,不同 Claude 版本对应的名称不同:

```python
# For Claude 3.7
text_editor = "text_editor_20250124"

# For Claude 3.5  
text_editor = "text_editor_20241022"
```

You'll also need to modify your chat function to accept the text editor parameter and include it in the model configuration.

> 你还需要修改你的 chat 函数,让它能接收文本编辑器参数,并把它包含进模型配置里。

## Tool Commands 工具命令

When Claude wants to use the text editor, it sends back tool use requests with specific commands:

> 当 Claude 想使用文本编辑器时,它会返回带有特定命令的工具调用请求:

Your implementation needs to handle all five commands. Here's the basic structure for processing these requests:

> 你的实现需要处理全部这五种命令。以下是处理这些请求的基本结构:

```python
def run_tool(tool_name, tool_input):
    if tool_name == "str_replace_editor":
        command = tool_input.get("command", "")
        if command == "view":
            path = tool_input.get("path", "")
            return text_editor_tool.view(path)
        elif command == "str_replace":
            path = tool_input.get("path", "")
            old_str = tool_input.get("old_str", "")
            new_str = tool_input.get("new_str", "")
            return text_editor_tool.str_replace(path, old_str, new_str)
        # ... handle other commands
```

## Example: File Analysis 示例:文件分析

Here's how the tool works in practice. When you ask Claude to "Write a one sentence description of the code in the ./main.py file", this happens:

> 我们来看这个工具在实践中是如何运作的。当你让 Claude「用一句话描述 ./main.py 文件里的代码」时,会发生这些事:

Claude sends a tool use request with `{"command": "view", "path": "./main.py"}`. Your server uses the `TextEditorTool` class to read the file and returns the contents. Claude then provides its analysis based on the code it read.

> Claude 发送一个带有 `{"command": "view", "path": "./main.py"}` 的工具调用请求。你的服务器用 `TextEditorTool` 类读取这个文件,并返回其中的内容。然后 Claude 基于它读到的代码,给出自己的分析。

## Practical Applications 实际应用场景

The Text Editor Tool essentially turns Claude into a code assistant that can:

> 文本编辑器工具本质上把 Claude 变成了一个能做到以下事情的代码助手:

- Read existing code and provide analysis. 阅读现有代码并给出分析。
- Create new files and functions. 创建新文件和新函数。
- Modify existing code. 修改现有代码。
- Set up test files. 搭建测试文件。
- Refactor code across multiple files. 跨多个文件重构代码。

For example, you could ask Claude to "write a function to calculate pi to the 5th digit in main.py, then create a test.py file to test it." Claude will read the existing file, add the new function, create the test file, and write comprehensive tests - all automatically using the text editor commands.

> 举例来说,你可以让 Claude「在 main.py 里写一个计算 π 到小数点后 5 位的函数,然后创建一个 test.py 文件来测试它」。Claude 会读取现有文件、加入新函数、创建测试文件,并写出全面的测试——这一切都是通过文本编辑器命令自动完成的。

This makes it possible to build AI-powered development tools similar to modern code editors with integrated AI features, where you can ask for code changes and have them implemented directly in your file system.

> 这使得构建类似「集成了 AI 功能的现代代码编辑器」这样的 AI 驱动开发工具成为可能——你只需要提出想要的代码改动,它们就会被直接落实到你的文件系统里。
