# Building with the Claude API - 27 Tool functions 工具函数

> Course: Building with the Claude API · Lesson 27
> 课程: Building with the Claude API · 第 27 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

用 Claude 搭建 AI 应用时,你经常需要让它能获取实时信息、或执行某些操作。这正是「工具函数(tool functions)」的用武之地——它们就是一些普通的 Python 函数,当 Claude 需要额外数据来帮助用户时,可以调用这些函数。

我们要实现三个核心工具:获取当前日期/时间、给日期加上一段时长、设置提醒。先从第一个开始。

## 什么是工具函数

工具函数就是一个普通的 Python 函数,当 Claude 判断自己需要额外信息来帮助用户时,会自动触发执行它。比如,如果有人问「现在几点了?」,Claude 就会调用你的日期/时间工具来获取当前时间。

下面是一个天气工具函数的例子。注意它是如何校验输入、并给出清晰错误信息的——这些都是重要的最佳实践。

## 工具函数的最佳实践

写工具函数时,遵循以下准则:

- **用有描述性的名字**:函数名和参数名都应该清楚地表明各自的用途
- **校验输入**:检查必填参数是否为空或无效,如果有问题就抛出错误
- **给出有意义的错误信息**:Claude 能看到错误信息,并可能据此用修正后的参数重新调用函数

校验之所以特别重要,是因为 Claude 会从错误中学习。如果你抛出一个清晰的错误,比如「Location cannot be empty(地点不能为空)」,Claude 可能会带着一个合法的地点值重新尝试调用这个函数。

## 搭建你的第一个工具函数

我们来写一个获取当前日期时间的函数。这个函数接受一个日期格式参数,这样 Claude 就能按不同的格式请求时间:

```python
def get_current_datetime(date_format="%Y-%m-%d %H:%M:%S"):
    if not date_format:
        raise ValueError("date_format cannot be empty")
    return datetime.now().strftime(date_format)
```

这个函数用 Python 的 `datetime` 模块获取当前时间,并按传入的格式字符串进行格式化。默认格式给出的是「年-月-日 时:分:秒」。

你可以用不同的格式测试它:

```python
# 默认格式: "2024-01-15 14:30:25"
get_current_datetime()

# 只要时和分: "14:30"
get_current_datetime("%H:%M")
```

这个校验能确保 Claude 不能给 `date_format` 传一个空字符串。虽然这个具体错误在实际中不太可能发生,但它演示了「校验输入 + 给出有帮助的错误信息」这套模式,方便 Claude 从中学习。

## 接下来

写好函数只是第一步。接下来,你需要写一份 JSON schema,向 Claude 描述这个函数,再把它整合进你的对话系统。这种「工具函数」的做法,能让 Claude 拥有强大的能力,同时保持你的代码结构清晰、易于维护。

## 课程资料下载

- 001_tools.ipynb

---

对产品经理来说,工具函数就像是给 AI 助理配的「标准作业流程(SOP)表单」:表单上每一栏(参数)都要填清楚、不能空着,填错了要能立刻提示「这栏不对,请重填」——这样负责执行的人(这里是 Claude)才能按标准动作把事情办对,而不是自己瞎猜。
