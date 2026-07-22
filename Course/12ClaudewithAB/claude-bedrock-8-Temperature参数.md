# Claude with AWS Bedrock - 8 Temperature Temperature 参数

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 8
> 课程: Claude with AWS Bedrock · 第 8 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Temperature is a powerful parameter that controls how creative or deterministic Claude's responses will be. Understanding how to use it effectively can dramatically improve your AI applications.

> Temperature(温度)是一个强大的参数,控制着 Claude 的响应是「更有创意」还是「更确定可预测」。理解如何有效使用它,能大幅提升你 AI 应用的效果。

## How Claude Generates Text Claude 是如何生成文本的

Before diving into temperature, it's helpful to understand Claude's text generation process. When you send Claude a prompt like "What do you think?", it goes through three phases:

> 在深入了解 temperature 之前,先理解一下 Claude 生成文本的过程会很有帮助。当你给 Claude 发送一个类似「你怎么看?」的提示词时,它会经历三个阶段:

1. **Tokenization:** Breaking your input into smaller chunks. **分词(Tokenization):** 把你的输入拆分成更小的片段。
2. **Prediction:** Calculating probabilities for possible next tokens. **预测(Prediction):** 计算下一个可能出现的 token 的各种概率。
3. **Sampling:** Selecting a token based on those probabilities. **采样(Sampling):** 根据这些概率,选出一个 token。

In the diagram above, you can see how Claude might assign different probabilities to potential next tokens. The word "about" has a 30% chance, "would" has 20%, and so on. This process repeats for each token until the response is complete.

> 在示意图中可以看到,Claude 会给可能出现的下一个 token 分配不同的概率。比如「about」这个词有 30% 的概率,「would」有 20%,以此类推。这个过程会针对每一个 token 重复进行,直到整段响应生成完毕。

## What Temperature Does Temperature 的作用

Temperature is a decimal value between 0 and 1 that directly influences these token selection probabilities. Think of it as a creativity dial:

> Temperature 是一个介于 0 到 1 之间的小数值,直接影响着 token 被选中的概率。可以把它想象成一个「创意旋钮」:

- **Low temperature (near 0):** Makes the highest probability token much more likely to be selected. **低 temperature(接近 0):** 让概率最高的那个 token 被选中的可能性大大增加。
- **High temperature (near 1):** Distributes probability more evenly across all possible tokens. **高 temperature(接近 1):** 让概率在所有可能的 token 之间分布得更均匀。

At temperature 0, Claude becomes deterministic - it will always pick the most probable token. At temperature 1, lower-probability tokens have a much better chance of being selected, leading to more creative and varied outputs.

> 当 temperature 为 0 时,Claude 会变得「确定可预测」——它总是会选择概率最高的那个 token。当 temperature 为 1 时,那些概率较低的 token 也有更大的机会被选中,从而带来更有创意、更多样化的输出。

对产品经理来说,这个「旋钮」很像给员工的「自由发挥空间」设定档位:temperature 调到 0,相当于要求员工严格按标准话术回答,每次答案几乎一样;调到 1,相当于允许员工发散思考、给出不同角度的答案,创意更多但也更难预测。

## Temperature Ranges and Use Cases Temperature 的取值区间与适用场景

Different tasks call for different temperature settings:

> 不同的任务需要不同的 temperature 设置:

**Low Temperature (0.0 - 0.3) 低 Temperature(0.0 - 0.3)**

- Factual responses 事实性回答
- Coding assistance 编码辅助
- Data extraction 数据提取
- Content moderation 内容审核

**Medium Temperature (0.4 - 0.7) 中等 Temperature(0.4 - 0.7)**

- Summarization 摘要总结
- Educational content 教育类内容
- Problem-solving 问题求解
- Creative writing with constraints 有限制条件的创意写作

**High Temperature (0.8 - 1.0) 高 Temperature(0.8 - 1.0)**

- Brainstorming 头脑风暴
- Creative writing 创意写作
- Marketing content 营销内容
- Joke generation 生成笑话

## Setting Temperature in Code 在代码中设置 Temperature

By default, Claude's temperature is set to 1.0, which means maximum creativity. You can override this by adding temperature to your inference configuration:

> 默认情况下,Claude 的 temperature 设为 1.0,也就是最大创意程度。你可以通过在推理配置(inference configuration)中添加 temperature 来覆盖这个默认值:

```python
def chat(messages, system=None, temperature=1.0):
    params = {
        "modelId": model_id,
        "messages": messages,
        "inferenceConfig": {"temperature": temperature}
    }
    
    if system:
        params["system"] = [{"text": system}]
    
    response = client.converse(**params)
    return response["output"]["message"]["content"][0]["text"]
```

## Temperature in Practice 实践中的 Temperature

Here's a practical example using movie idea generation. With temperature set to the default (1.0), you might get creative responses like:

> 来看一个用电影创意生成来举例的实际场景。当 temperature 设为默认值(1.0)时,你可能会得到这样有创意的回答:

"A reclusive origami master discovers her intricate paper creations come to life at night, leading her on a magical journey to save their miniature world from a mysterious shadow creature threatening to unfold their existence."

> 「一位深居简出的折纸大师发现,她那些精巧的纸艺作品会在夜晚活过来,这带领她踏上了一段奇幻旅程,去拯救这个微缩世界——一个神秘的影子生物正威胁着要把它们『展开』、抹去它们的存在。」

But when you set temperature to 0.0 for the same prompt, you'll consistently get more predictable responses:

> 但当你把同一个提示词的 temperature 设为 0.0 时,你会持续得到更加可预测的回答:

"A time-traveling archaeologist must prevent ancient artifacts from being stolen by a tech billionaire who's using them to build a doomsday device that harnesses their forgotten power."

> 「一位穿越时空的考古学家必须阻止古代文物被一位科技富豪偷走——对方正利用这些文物,打造一台能驾驭其被遗忘力量的末日装置。」

Running the low-temperature version multiple times will produce very similar responses, often with repeated themes like "time-traveling historian" or "time-traveling archaeologist."

> 多次运行低 temperature 的版本,会得到非常相似的回答,经常会重复出现「穿越时空的历史学家」或「穿越时空的考古学家」之类的主题。

## Key Takeaways 核心要点

Temperature gives you direct control over Claude's creativity level. Use lower temperatures when you need consistent, factual responses, and higher temperatures when you want creative, varied outputs. The default temperature of 1.0 maximizes creativity, so consider lowering it for tasks requiring precision and consistency.

> Temperature 让你能直接掌控 Claude 的创意程度。当你需要一致、符合事实的回答时,用较低的 temperature;当你想要有创意、多样化的输出时,用较高的 temperature。默认的 temperature 值 1.0 会最大化创意程度,所以对于那些需要精确性和一致性的任务,可以考虑把它调低。
