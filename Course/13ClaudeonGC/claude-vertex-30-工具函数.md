# Claude with Google Vertex - 30 Tool functions 工具函数

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 30
> 课程: Claude with Google Vertex · 第 30 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

用 Claude 做 AI 应用时,你经常需要给它访问实时信息或执行动作的能力。工具函数就是干这个的——它们是普通的 Python 函数,当 Claude 需要额外数据来帮助用户时会调用它们。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619700%2F06_-_003_-_Tool_Functions_00.1748619699839.png)

上图是我们要实现的三个必备工具: 获取当前日期/时间、给日期加时长、设置提醒。先从第一个开始。

## What Are Tool Functions? 什么是工具函数

工具函数就是一个普通的 Python 函数,当 Claude 判断需要额外信息来完成任务时会被自动执行。比如用户问 "What time is it?",Claude 就会调用你的日期/时间工具来拿当前时间。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619700%2F06_-_003_-_Tool_Functions_06.1748619700490.png)

上图是一个天气工具函数的例子。注意它怎么校验输入、怎么给出清晰的错误信息——这是我们要遵循的关键最佳实践。

## Best Practices for Tool Functions 工具函数的最佳实践

写工具函数时记住这几条:

- **用有描述性的名字**: 函数名和参数名都应清楚表明用途
- **校验输入**: 始终检查必需参数是否存在、是否有效
- **给出有意义的错误信息**: Claude 收到报错后,可能会用修正过的参数再调一次

错误处理特别重要,因为 **Claude 能从失败中学习**。如果你返回 "Location cannot be empty" 这样清晰的错误信息,Claude 可能会带上正确的地点值重试一次。

## Building Your First Tool Function 写第一个工具函数

做一个获取当前日期时间的函数。它接受一个格式字符串来控制日期的显示方式:

```python
def get_current_datetime(date_format="%Y-%m-%d %H:%M:%S"):
    if not date_format:
        raise ValueError("date_format cannot be empty")
    return datetime.now().strftime(date_format)
```

默认格式串 `"%Y-%m-%d %H:%M:%S"` 产出的是 `"2024-03-15 14:30:45"` 这样的结果。传入不同格式串就能定制:

```python
# 只要时间
get_current_datetime("%H:%M")  # 返回 "14:30"

# 换一种日期格式
get_current_datetime("%B %d, %Y")  # 返回 "March 15, 2024"
```

## Input Validation 输入校验

`if not date_format:` 这个校验保证我们不会拿空字符串去格式化日期。Claude 很少犯这个错,但给出清晰的错误信息能帮它理解哪里出了问题、该怎么改。

Claude 遇到错误时,能看到确切的错误信息。**这个反馈回路让它可以调整做法、用修正后的参数重试。**

## Next Steps 下一步

工具函数只是第一步。接下来你需要写一份 JSON schema 把这个函数描述给 Claude,再把它接入你的聊天系统。函数本身就是普通 Python,复杂度在于怎么把它正确接到 Claude 的工具调用系统上。

对产品经理来说: 「错误信息要写清楚,因为 Claude 会读它并重试」——这是个很有意思的反直觉设计。传统系统里错误信息是给人看的日志; 在 AI 应用里,它变成了一条**给模型的反馈通道**。所以 "Error 400" 这种代号式错误在这里是有害的,而 "Location cannot be empty" 能让系统自我修复一次。这一条直接影响功能的成功率,值得写进技术规范。
