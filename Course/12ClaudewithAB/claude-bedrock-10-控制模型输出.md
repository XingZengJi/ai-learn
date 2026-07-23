# Claude with AWS Bedrock - 10 Controlling Model Output 控制模型输出

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 10
> 课程: Claude with AWS Bedrock · 第 10 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Beyond crafting better prompts, there are two powerful techniques for controlling Claude's output: prefilled assistant messages and stop sequences. These methods give you precise control over how Claude responds and when it stops generating text.

> 除了把提示词写得更好之外,还有两个强大的技巧可以用来控制 Claude 的输出:预填充助手消息(prefilled assistant messages)和停止序列(stop sequences)。这两种方法能让你精确控制 Claude 如何响应,以及它何时停止生成文本。

## Prefilled Assistant Messages 预填充助手消息

Message prefilling lets you provide the beginning of Claude's response, which strongly influences the direction of its answer. Instead of letting Claude decide how to start its response, you give it a specific opening that steers the conversation.

> 消息预填充(prefilling)让你能提供 Claude 响应的开头部分,这会强烈影响它答案的走向。你不需要让 Claude 自己决定怎么开头,而是给它一个特定的开场白,由此引导整个对话的方向。

Here's how it works: you build your normal list of messages with the user's question, but then add an assistant message at the end containing the start of the response you want. When Claude processes this, it sees the assistant message and thinks "I've already started responding to this question, so I should continue from where I left off."

> 具体是这样运作的:你像平时一样构建包含用户问题的消息列表,但在最后再加一条助手消息,里面写着你想要的响应开头。当 Claude 处理这份消息时,它会看到这条助手消息,然后「以为」自己已经开始回答这个问题了,于是会接着往下继续写。

For example, if you ask "Is tea or coffee better at breakfast?" and prefill with "Coffee is better because", Claude will continue from that point and build a response supporting coffee. The key insight is that Claude will pick up exactly where your prefilled text ends - it won't repeat what you've written.

> 举个例子,如果你问「早餐喝茶好还是喝咖啡好?」,并预填充「咖啡更好,因为」,Claude 就会从这里继续往下写,构建出一个支持咖啡的回答。关键在于:Claude 会正好从你预填充文本结束的地方接着写——它不会重复你已经写过的内容。

Let's see this in practice:

> 我们来看一个实际的例子:

```python
messages = []
add_user_message(messages, "Is coffee or tea better for breakfast?")
add_assistant_message(messages, "Coffee is better because")

chat(messages)
```

This returns something like "it has more caffeine." Notice that Claude continues directly from your prefilled text, so you'll need to combine both parts to get the complete response: "Coffee is better because it has more caffeine."

> 这会返回类似「它含有更多咖啡因」这样的内容。注意,Claude 是直接从你预填充的文本之后继续写的,所以你需要把两部分拼接起来,才能得到完整的响应:「咖啡更好,因为它含有更多咖啡因。」

You can steer Claude in any direction by changing your prefilled text:

> 通过改变预填充的文本,你可以把 Claude 引向任何你想要的方向:

- "Tea is better because" - pushes toward tea. 「茶更好,因为」——把回答推向支持茶。
- "They are the same because" - creates a neutral response. 「两者其实差不多,因为」——生成一个中立的回答。

对产品经理来说,预填充有点像帮同事「起个头」再让他接着往下讲——你先说「我觉得方案 A 更好,因为」,对方大概率会顺着这个方向往下补充理由,而不会另起炉灶反驳你。Claude 的这种「顺势而为」的特性,正好可以被用来引导它的回答方向。

## Stop Sequences 停止序列

Stop sequences force Claude to end its response immediately when it generates specific text. This is useful when you want to truncate output at a particular point or prevent Claude from continuing past a certain marker.

> 停止序列(stop sequences)会强制 Claude 在生成某段特定文本时立刻结束响应。当你想在某个特定位置截断输出,或者不想让 Claude 继续写超过某个标记之后的内容时,这个功能就很有用。

The concept is straightforward: you provide a list of strings, and as soon as Claude generates any of those strings, it stops and returns whatever it has generated so far. The stop sequence itself is not included in the response.

> 这个概念很直接:你提供一份字符串列表,一旦 Claude 生成了其中任何一个字符串,它就会立刻停止,并返回目前为止已经生成的内容。停止序列本身不会包含在响应结果里。

To use stop sequences, you need to modify your chat function to accept them as a parameter:

> 要使用停止序列,你需要修改 chat 函数,让它能接收这个参数:

```python
def chat(messages, system=None, temperature=1.0, stop_sequences=[]):
    params = {
        "modelId": model_id,
        "messages": messages,
        "inferenceConfig": {
            "temperature": temperature,
            "stopSequences": stop_sequences
        },
    }
```

Here's a practical example:

> 来看一个实际的例子:

```python
messages = []
add_user_message(messages, "Count from 1 to 10")

chat(messages, stop_sequences=["5"])
```

This returns "1, 2, 3, 4," and stops before including the "5". You can specify multiple stop sequences, and Claude will stop at whichever one it encounters first:

> 这会返回「1, 2, 3, 4,」,在还没写到「5」之前就停止了。你可以指定多个停止序列,Claude 会在遇到其中任何一个时停止:

```python
chat(messages, stop_sequences=["5", "3, 4"])
```

Stop sequences are particularly useful for:

> 停止序列特别适用于以下场景:

- Controlling the length of responses. 控制响应的长度。
- Stopping at natural breakpoints in structured output. 在结构化输出的自然断点处停止。
- Preventing Claude from continuing past specific markers or delimiters. 防止 Claude 继续写超过特定标记或分隔符之后的内容。

Both techniques give you fine-grained control over Claude's behavior, allowing you to shape responses in ways that simple prompting alone cannot achieve.

> 这两种技巧都能让你对 Claude 的行为进行精细的控制,实现单靠提示词本身难以做到的响应塑造效果。
