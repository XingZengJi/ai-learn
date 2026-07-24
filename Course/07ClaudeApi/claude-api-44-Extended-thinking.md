# Building with the Claude API - 44 Extended thinking 扩展思考

> Course: Building with the Claude API · Lesson 44
> 课程: Building with the Claude API · 第 44 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

重要说明:扩展思考(Extended Thinking)和其他一些功能不兼容,尤其是消息预填充(message pre-filling)和 temperature 参数。完整限制列表见:https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking#feature-compatibility

扩展思考是 Claude 的高级推理功能,能让模型在生成最终回答之前,花时间把复杂问题想清楚。可以把它理解成 Claude 的「草稿纸」——你能看到它得出答案的推理过程,这不仅提升了透明度,通常也能带来更高质量的回答。

## 扩展思考是如何运作的

开启扩展思考后,Claude 的响应会从简单的文本块,变成包含两部分的结构化响应:推理过程和最终答案。

开启思考功能后,你会同时拿到推理过程和最终答案。

主要好处包括:

- 复杂任务上更强的推理能力
- 难题上更高的准确率
- 对 Claude 思考过程的透明可见

不过,也有一些需要权衡的代价:

- 成本更高(思考过程本身也要消耗 token,需要付费)
- 延迟增加(思考需要时间)
- 你代码里处理响应的逻辑更复杂

## 什么时候该用扩展思考

判断标准很简单:靠你的提示词评估结果来决定。先不开思考功能跑一遍你的提示词,如果在你已经把提示词优化到位之后,准确率还是达不到要求,这时候再考虑开启扩展思考。它是「标准提示词工程已经不够用」时的补充手段。

## 响应结构与安全性

扩展思考的响应里包含一套特殊的签名系统,用于安全校验。

这个签名是一个加密令牌,用来确保你没有篡改思考文本。这能防止开发者擅自修改 Claude 的推理过程——这种篡改有可能把模型引导到不安全的方向上。

## 被遮蔽的思考内容(Redacted Thinking)

有时候,你收到的不是可读的推理文字,而是一个「被遮蔽」的思考块。

这种情况发生在:Claude 的思考过程被内部安全系统标记的时候。这段被遮蔽的内容,其实是以加密形式保存的真实思考内容,这样你就能在后续对话里把完整的消息原样传回给 Claude,而不会丢失上下文。

## 具体实现

要在代码里开启扩展思考,你需要给 `chat` 函数加两个参数:

```python
def chat(
    messages,
    system=None,
    temperature=1.0,
    stop_sequences=[],
    tools=None,
    thinking=False,
    thinking_budget=1024
):
```

`thinking_budget` 设定了 Claude 用于推理的最大 token 数。最小值是 1024 个 token,而且你的 `max_tokens` 参数必须大于这个思考预算。

在 API 参数里加上思考配置:

```python
if thinking:
    params["thinking"] = {
        "type": "enabled",
        "budget": thinking_budget
    }
```

然后带上思考功能来调用它:

```python
chat(messages, thinking=True)
```

## 测试被遮蔽的响应

出于测试目的,你可以通过发送一个特殊的触发字符串,强制让 Claude 返回一个「被遮蔽」的思考块。这能帮你确认你的应用在遇到这类响应时,能优雅地处理而不崩溃。

扩展思考是一个强大的功能,适合 Claude 需要处理复杂推理任务的场景,但考虑到成本和延迟的代价,要谨慎使用。先用标准提示词工程,把提示词彻底优化到位,再在确实需要那份额外推理能力时开启思考功能。

## 课程资料下载

- 001_thinking_complete.ipynb
- 001_thinking.ipynb

---

对产品经理来说,扩展思考就像给员工「多留点思考时间再交方案」——复杂决策(比如战略分析)给足思考时间往往能出更靠谱的结果,但简单任务(比如回复一封常规邮件)硬要「多想想」反而是浪费时间和成本。用不用这个功能,不该靠直觉,而该靠数据:先测一遍不开思考的准确率,不够用了再开。
