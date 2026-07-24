# Building with the Claude API - 34 Fine grained tool calling 精细化工具调用

> Course: Building with the Claude API · Lesson 34
> 课程: Building with the Claude API · 第 34 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

当你把工具使用和流式传输结合起来时,就能在 AI 生成工具参数的同时实时看到更新。这能带来响应更快的用户体验,但背后的一些运作细节值得弄清楚。

## 基础的工具流式传输

开启流式传输后,Claude 在处理你的请求时会返回不同类型的事件。你已经熟悉了普通文本生成时的 `ContentBlockDelta` 事件。对于工具使用,还需要处理一种新的事件类型:`InputJsonEvent`。

每个 `InputJsonEvent` 包含两个关键属性:

- **partial_json** —— 一小段 JSON,是工具参数的一部分
- **snapshot** —— 到目前为止收到的所有片段,累积拼接成的完整 JSON

在流式处理管线里,这样处理这些事件:

```python
for chunk in stream:
    if chunk.type == "input_json":
        # 处理这一小段 JSON
        print(chunk.partial_json)
        # 或者使用当前累积的完整快照
        current_args = chunk.snapshot
```

## JSON 校验是如何运作的

这里有个值得注意的地方。Anthropic API 并不会在 Claude 生成的同时,把每个片段都立即发给你,而是先把片段缓存起来,做校验。

API 会等到一个完整的顶层键值对生成完毕后,才发送任何内容。举个例子,如果你的工具期望这样的结构:

```json
{
  "abstract": "This paper presents a novel...",
  "meta": {
    "word_count": 847,
    "review": "This paper introduces QuanNet..."
  }
}
```

API 会:

1. 等到整个 `abstract` 的值生成完整
2. 按你的 schema 校验这个键值对
3. 一次性把 `abstract` 缓存的所有片段发给你
4. 对 `meta` 对象重复上述过程

这个校验过程,解释了为什么即便开了流式传输,你看到的效果还是「先延迟、再突然冒出一大段文字」——因为片段会被扣住,直到一个完整、有效的顶层键值对准备好为止。

## 精细化工具调用

如果你需要更快、更细粒度的流式效果——比如想给用户展示即时更新、或想尽快开始处理部分结果——你可以开启「精细化工具调用(fine-grained tool calling)」。

精细化工具调用主要做一件事:关闭 API 端的 JSON 校验。这意味着:

- Claude 一生成片段,你就能立刻拿到
- 顶层键之间不再有缓冲延迟
- 更接近传统意义上的流式行为
- **重要**:JSON 校验被关闭了——你的代码必须自己处理无效的 JSON

在 API 调用里加上 `fine_grained=True` 来开启它:

```python
run_conversation(
    messages, 
    tools=[save_article_schema], 
    fine_grained=True
)
```

开启精细化工具调用后,你可能会在流的很早阶段就收到 `word_count` 的值,而不需要等到整个 `meta` 对象生成完毕。

## 处理无效的 JSON

用精细化工具调用时,Claude 可能会生成无效的 JSON,比如 `"word_count": undefined` 而不是一个合法的数字。你的应用需要优雅地处理这类情况:

```python
try:
    parsed_args = json.loads(chunk.snapshot)
except json.JSONDecodeError:
    # 妥善处理无效 JSON 的情况
    print("Received invalid JSON, continuing...")
```

如果不开启精细化工具调用,API 的校验机制会捕获这类错误,并可能把有问题的值包装成字符串——但这可能又和你预期的 schema 对不上。

## 什么时候该用精细化工具调用

考虑在以下场景开启精细化工具调用:

- 你需要向用户展示工具参数生成的实时进度
- 你想尽快开始处理部分工具结果
- 缓冲延迟对你的用户体验有负面影响
- 你有信心妥善实现健壮的 JSON 错误处理

对大多数应用来说,默认带校验的行为已经完全够用。但当你确实需要那种极致的响应速度时,精细化工具调用能让你按 Claude 生成的速度尽快拿到片段——代价是自己要多担一份校验的责任。

---

对产品经理来说,这里的取舍很像「后台先校验完整表单再提交」和「前端边填边校验」的区别:默认模式(有校验)更稳妥,但用户会感觉「卡一下才出结果」;精细化模式响应更快,但产品团队要自己兜住「用户输入到一半、数据不完整」时的各种异常情况。选哪种,取决于你更看重「体验流畅」还是「省心少踩坑」。
