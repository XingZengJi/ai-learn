# Building with the Claude API - 8 Temperature 温度参数

> Course: Building with the Claude API · Lesson 8
> 课程: Building with the Claude API · 第 8 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

Temperature is a powerful parameter that controls how predictable or creative Claude's responses will be. Understanding how to use it effectively can dramatically improve your AI applications.

> Temperature(温度)是一个有力的参数,它控制着 Claude 回复的「可预测程度」还是「创造性程度」。理解如何有效使用它,能大幅提升你的 AI 应用效果。

## How Claude Generates Text Claude 如何生成文本

Before diving into temperature, it helps to understand Claude's text generation process. When you send Claude a prompt like "What do you think?", it goes through three key steps:

> 在深入了解温度之前,先理解 Claude 生成文本的过程会有帮助。当你给 Claude 发送类似「你怎么看?」这样的提示词时,它会经历三个关键步骤:

- Tokenization - Breaking your input into smaller chunks
- Prediction - Calculating probabilities for possible next words
- Sampling - Choosing a token based on those probabilities

  分词(Tokenization)——把你的输入拆成更小的片段;预测(Prediction)——为所有可能的「下一个词」计算概率;采样(Sampling)——根据这些概率选出一个 token。

In this example, Claude might assign a 30% probability to "about", 20% to "would", 10% to "of", and so on. The model then selects one token and repeats this entire process to build complete sentences.

> 在这个例子里,Claude 可能会给 "about" 分配 30% 的概率,给 "would" 分配 20%,给 "of" 分配 10%,以此类推。模型选出一个 token 后,会重复整个过程来构建完整的句子。

## What Temperature Does Temperature 的作用

Temperature is a decimal value between 0 and 1 that directly influences these selection probabilities. It's like adjusting the "creativity dial" on Claude's responses.

> Temperature 是一个介于 0 到 1 之间的小数值,直接影响上述的选词概率。它就像是 Claude 回复上的一个「创造力旋钮」。

At low temperatures (near 0), Claude becomes very deterministic - it almost always picks the highest probability token. At high temperatures (near 1), Claude distributes probability more evenly across options, leading to more varied and creative outputs.

> 温度较低(接近 0)时,Claude 会变得非常「确定」——它几乎总是选择概率最高的那个 token。温度较高(接近 1)时,Claude 会把概率分配得更均匀,从而产生更多样、更有创造性的输出。

## Interactive Temperature Demo 温度交互演示

You can see temperature in action with Claude's interactive demo. Watch how the probability distribution changes as you adjust the temperature slider:

> 你可以通过 Claude 的交互式演示直观看到温度的效果。观察当你拖动温度滑块时,概率分布是如何变化的:

At temperature 0.0, "about" gets 100% probability - completely deterministic. At temperature 1.0, probabilities spread more evenly across all possible tokens, introducing randomness and creativity.

> 温度为 0.0 时,"about" 获得 100% 的概率——完全确定。温度为 1.0 时,概率会在所有可能的 token 上分布得更均匀,引入随机性和创造性。

## Choosing the Right Temperature 如何选择合适的温度

Different tasks call for different temperature ranges:

> 不同的任务需要不同的温度区间:

### Low Temperature (0.0 - 0.3) 低温度

- Factual responses
- Coding assistance
- Data extraction
- Content moderation

  事实性回答;编程辅助;数据抽取;内容审核。

### Medium Temperature (0.4 - 0.7) 中等温度

- Summarization
- Educational content
- Problem-solving
- Creative writing with constraints

  摘要总结;教育类内容;问题求解;带约束条件的创意写作。

### High Temperature (0.8 - 1.0) 高温度

- Brainstorming
- Creative writing
- Marketing content
- Joke generation

  头脑风暴;创意写作;营销内容;笑话生成。

## Implementing Temperature in Code 在代码中实现温度参数

Adding temperature support to your chat function is straightforward. Here's how to modify your existing function:

> 给你的 chat 函数加上温度支持很简单,修改方式如下:

```python
def chat(messages, system=None, temperature=1.0):
    params = {
        "model": model,
        "max_tokens": 1000,
        "messages": messages,
        "temperature": temperature
    }
    
    if system:
        params["system"] = system
    
    message = client.messages.create(**params)
    return message.content[0].text
```

The key changes are adding temperature=1.0 as a parameter and including "temperature": temperature in the params dictionary.

> 关键改动是:新增 `temperature=1.0` 作为参数,并在 params 字典里加入 `"temperature": temperature`。

## Testing Temperature Effects 测试温度效果

To see temperature in action, try generating movie ideas with different settings:

> 想直观看到温度的效果,可以试着用不同的设置生成电影创意:

```python
# Low temperature - more predictable
answer = chat(messages, temperature=0.0)

# High temperature - more creative  
answer = chat(messages, temperature=1.0)
```

At temperature 0.0, you might consistently get responses like "A time-traveling archaeologist must prevent ancient artifacts from being stolen." At temperature 1.0, you'll see much more variety in themes, characters, and plot elements.

> 温度为 0.0 时,你可能会一直得到类似「一位穿越时空的考古学家必须阻止古代文物被盗」这样的回答。温度为 1.0 时,主题、角色和情节元素会呈现出丰富得多的变化。

## Key Takeaways 关键要点

Remember that temperature doesn't guarantee different outputs - it just changes the probability of getting them. Even at high temperatures, Claude might occasionally produce similar responses. The key is matching your temperature choice to your specific use case:

> 记住,温度并不能保证一定会得到不同的输出——它只是改变了得到不同输出的概率。即便在高温度下,Claude 偶尔也可能生成相似的回答。关键在于让温度的选择匹配你的具体使用场景:

- Need consistent, factual responses? Use low temperature
- Want creative brainstorming? Dial up the temperature
- Somewhere in between? Medium temperatures work well for most general tasks

  需要一致、符合事实的回答?用低温度。想要有创造力的头脑风暴?把温度调高。介于两者之间?中等温度适合大多数通用任务。

Temperature is one of the most practical parameters you can adjust to fine-tune Claude's behavior for your specific needs.

> Temperature 是你能用来微调 Claude 行为、贴合具体需求的最实用的参数之一。

对产品经理来说,temperature 就像给团队定「发散程度」——写周报、抽取数据这类要求「说准话」的场景,把旋钮拧到低档;头脑风暴新点子、起营销文案这类要求「多来点花样」的场景,就把旋钮拧高。同一个 Claude,同一套 prompt,靠这一个参数就能在「靠谱」和「有创意」之间切换。
