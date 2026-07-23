# Claude with Google Vertex - 12 Controlling model output 控制模型输出

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 12
> 课程: Claude with Google Vertex · 第 12 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

除了把提示词写好,还有两个很有力的手段能控制 Claude 的输出: **预填 assistant 消息**和**停止序列**。它们让你能精确控制 Claude 怎么回应、什么时候停下来。

## Prefilled Assistant Messages 预填 assistant 消息

消息预填的意思是: 你先替 Claude 写好回复的开头,它从那个位置往下接着写。这个技巧在把 Claude 往某个特定方向引导时非常好用。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619499%2F03_-_010_-_Controlling_Model_Output_01.1748619499244.png)

做法是: 除了发 user 消息,再在消息列表末尾加一条 assistant 消息。Claude 看到这条 assistant 消息,会认为「我已经开始回答这个问题了,应该从刚才断掉的地方继续」。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619499%2F03_-_010_-_Controlling_Model_Output_05.1748619499761.png)

举例: 你问 "Is tea or coffee better at breakfast?",不预填的话,Claude 通常会给一个两边都提到的中立回答。但如果你加一条 assistant 消息 "Coffee is better because",Claude 就会顺着往下写,给咖啡站台。

要理解的关键点是: Claude **从你预填文字结束的位置精确接续**。你写 "Coffee is better because",Claude 不会把这句重复一遍,而是紧跟在 "because" 后面把话说完。

代码结构:

```python
messages = []
add_user_message(messages, "Is tea or coffee better at breakfast?")
add_assistant_message(messages, "Coffee is better because")
answer = chat(messages)
```

用这个技巧可以把 Claude 引向任何方向:

- 偏向咖啡: "Coffee is better because"
- 偏向茶: "Tea is better because"
- 唱反调: "Neither is very good because"

## Stop Sequences 停止序列

停止序列强制 Claude 在生成到某个特定字符串时立刻结束回复。用来控制回复的长度或终点非常合适。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619500%2F03_-_010_-_Controlling_Model_Output_15.1748619500461.png)

概念很直接: 你给一个字符串列表,Claude 一旦生成其中任意一个,就立即停止并返回到那一刻为止已生成的内容。

比如让 Claude "Count from 1 to 10",停止序列设成 "5":

```python
add_user_message(messages, "Count from 1 to 10")
answer = chat(messages, stop_sequences=["5"])
```

返回的是 "1, 2, 3, 4, " —— 正好停在 "5" 出现之前,"5" 不会进入输出。

停止序列还可以更精确。想去掉结尾多余的逗号和空格,就用 `stop_sequences=[", 5"]`,结果更干净: "1, 2, 3, 4"。

停止序列特别适合:

- 限制列表长度
- 停在特定标记或分隔符处
- 生成格式一致的输出
- 防止回复过长

这两个技巧让你能细粒度地控制 Claude 的行为,做出更可预测、更有针对性的回复。

对产品经理来说: 预填这个技巧有个容易忽略的副作用——**它会引入你自己的偏向**。"Coffee is better because" 拿到的绝不是中立分析,而是你已经替它定了结论。用来控制格式(比如预填 `{` 让它直接吐 JSON)是好用法; 用来控制立场时要留神,别把它当成「模型的客观判断」拿去做决策依据。
