# Claude with Google Vertex - 06 Multi-turn conversations 多轮对话

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 06
> 课程: Claude with Google Vertex · 第 06 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

用 Anthropic API 和 Claude 时,有一个关键概念必须理解: **Claude 不会保存你的任何对话历史**。你发的每一个请求都是完全独立的,不带任何之前交流的记忆。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619440%2F03_-_004_-_Multi-Turn_Conversations_01.1748619440499.png)

也就是说,如果你想让 Claude 在多轮对话里记得前面说过什么,对话状态得由你自己来维护。

## The Problem with Stateless Conversations 无状态对话的问题

假设你问 Claude "What is quantum computing?",拿到一个不错的回答。接着你追问 "Write another sentence"——Claude 完全不知道你在说什么,它会随便写一句毫不相干的话,因为它对刚才那段量子计算的讨论没有任何记忆。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619441%2F03_-_004_-_Multi-Turn_Conversations_02.1748619441159.png)

## How Multi-Turn Conversations Work 多轮对话是怎么实现的

要保住对话上下文,你需要做两件事:

- 在自己的代码里手动维护一份完整的消息列表
- 每次请求都把完整的消息历史一起发过去

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619441%2F03_-_004_-_Multi-Turn_Conversations_05.1748619441704.png)

真正可行的流程是:

1. 把最初的 user 消息发给 Claude
2. 把 Claude 的回复作为一条 assistant 消息加进消息列表
3. 把你的追问作为另一条 user 消息加进去
4. 把整段对话历史发给 Claude

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619442%2F03_-_004_-_Multi-Turn_Conversations_08.1748619442168.png)

## Building Helper Functions 写几个辅助函数

为了让对话管理更省事,可以写三个辅助函数:

```python
def add_user_message(messages, text):
    user_message = {"role": "user", "content": text}
    messages.append(user_message)

def add_assistant_message(messages, text):
    assistant_message = {"role": "assistant", "content": text}
    messages.append(assistant_message)

def chat(messages):
    message = client.messages.create(
        model=model,
        max_tokens=1000,
        messages=messages,
    )
    return message.content[0].text
```

## Putting It All Together 组装起来

用这几个函数维护一段对话:

```python
# 从空的消息列表开始
messages = []

# 加入最初的提问
add_user_message(messages, "Define quantum computing in one sentence")

# 拿到 Claude 的回复
answer = chat(messages)

# 把 Claude 的回复加进对话历史
add_assistant_message(messages, answer)

# 加入追问
add_user_message(messages, "Write another sentence")

# 带着完整上下文拿到追问的回复
final_answer = chat(messages)
```

现在 Claude 就明白 "Write another sentence" 是指继续展开那段量子计算的定义了,因为你把完整的对话上下文给了它。

## Key Takeaways 要点

记住: 每一次 API 调用都是独立的。想要对话上下文,你必须:

- 把所有消息存在自己的应用里
- 每次请求都发送完整的消息历史
- 用 `"user"` / `"assistant"` 角色正确地组织消息

这几个辅助函数在后续的学习里会一直用到,它们能让你做出「像自然对话」而不是「一问一答互不相干」的应用。

对产品经理来说: 这一课解释了一件产品上很重要的事——**对话越长,每一轮的成本越高**。因为每次都要把全部历史重发一遍,输入 token 是累加的。所以长对话的成本不是线性而是接近平方增长,这直接影响定价模型和「要不要限制对话轮数」这类产品决策。后面的提示词缓存那几课,正是为了缓解这个问题。
