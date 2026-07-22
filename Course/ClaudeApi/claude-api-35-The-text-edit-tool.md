# Building with the Claude API - 35 The text edit tool 文本编辑工具

> Course: Building with the Claude API · Lesson 35
> 课程: Building with the Claude API · 第 35 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

重要说明:各模型版本对应的工具版本字符串,可以在这里查到:https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/text-editor-tool

Claude 自带一个不需要你从零搭建的内置工具:文本编辑工具(text editor tool)。这个工具让 Claude 能像使用标准文本编辑器一样操作文件和目录。

## 文本编辑工具能做什么

文本编辑工具为 Claude 提供了一整套全面的文件操作能力:

- 查看文件或目录内容
- 查看文件中特定行数范围的内容
- 替换文件中的文本
- 创建新文件
- 在文件的特定行插入文本
- 撤销最近对文件的编辑

这极大地拓展了 Claude 的能力,基本上让它一上来就具备了软件工程师的操作能力。

## 理解实现要求

这里有个容易搞混的地方:虽然工具的 schema 已经内置在 Claude 里,你仍然需要自己提供实际的实现。可以这样理解——Claude 知道该怎么「请求」文件操作,但真正执行这些操作的代码,得你自己写。

用其他工具时,你既要写 JSON schema,也要写函数实现。而文本编辑工具不一样:Claude 提供了 schema 层面的知识,但你必须写函数来处理 Claude 发来的「创建文件」「读取目录」「替换文本」等请求。

## Schema 版本

虽然主 schema 内置在 Claude 里,但发起请求时你仍需要带上一个小的 schema 桩(stub)。具体的 schema 取决于你用的 Claude 模型:

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

Claude 看到这个小 schema 后,会在幕后自动把它展开成完整的文本编辑工具规格。

## 实操示例

来看看文本编辑工具的实际效果。当你让 Claude 处理文件时,它会按需使用这个工具来读取、修改、创建文件。

比如,如果你让 Claude「打开 ./main.py 文件,概括一下它的内容」,Claude 会:

1. 用文本编辑工具查看这个文件
2. 读取内容
3. 给你一份内容概括

你还可以更进一步,让 Claude 修改文件。比如:「打开 ./main.py 文件,写一个函数计算圆周率到小数点后第 5 位。然后创建一个 ./test.py 文件来测试你的实现。」

Claude 会:

1. 查看现有的 main.py 文件
2. 用一个包含圆周率计算函数的新实现替换其内容
3. 创建一个新的 test.py 文件,写好相应的单元测试

## 为什么要用文本编辑工具

你可能会疑惑:现在很多代码编辑器本身就内置了 AI 助手,为什么还需要这个工具?文本编辑工具在以下场景会很有价值:

- 你在搭建需要以编程方式编辑文件的应用
- 你所处的环境没有功能齐全的代码编辑器可用
- 你想把文件编辑能力直接集成进自己基于 Claude 搭建的应用里

本质上,文本编辑工具让你能在自己的应用里,复刻出那种「高级 AI 代码编辑器」的大部分功能,并且能精细地控制 Claude 与你文件系统的交互方式。

---

对产品经理来说,文本编辑工具就像给 Claude 配了一把「万能钥匙 + 操作手册」——手册(schema)是官方现成的,但真正开门锁门这个动作(函数实现)得你自己的团队来搭。适合的场景是:你要做一个能自动改代码、写文件的产品功能,而不是简单地在聊天窗口里问答。
