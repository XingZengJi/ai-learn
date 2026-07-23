# Claude with Google Vertex - 10 Temperature Temperature 参数

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 10
> 课程: Claude with Google Vertex · 第 10 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

temperature 是一个控制 Claude 回复「有多可预测」还是「有多有创意」的参数。用好它,能显著改善你的 AI 应用。

## How Claude Generates Text Claude 是怎么生成文本的

在讲 temperature 之前,先理解 Claude 的文本生成过程。当你发出 "What do you think?" 这样的提示时,它会走三大步:

1. **分词(Tokenization)** —— 把输入切成更小的块
2. **预测(Prediction)** —— 计算下一个词各种可能性的概率
3. **采样(Sampling)** —— 根据这些概率选出一个 token

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619496%2F03_-_008_-_Temperature_00.1748619496769.png)

在这个例子里,Claude 可能给 "about" 30% 的概率、"would" 20%、"of" 10%,依此类推。然后选出一个 token,再重复整个过程,直到写完完整回复。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619497%2F03_-_008_-_Temperature_05.1748619497297.png)

## What Temperature Does temperature 做的事

temperature 是 0 到 1 之间的小数,直接影响上面那个选词的概率分布。可以把它想成 Claude 回复的「创意旋钮」。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619497%2F03_-_008_-_Temperature_06.1748619497674.png)

temperature 低(接近 0)时,Claude 高度确定性——几乎总是挑概率最高的那个 token。temperature 高(接近 1)时,概率会被摊得更平均,输出更多样、更有创意。

## Temperature Ranges and Use Cases 取值区间与适用场景

不同任务对应不同的 temperature:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748619499%2F03_-_008_-_Temperature_10.1748619499025.png)

### Low Temperature (0.0 - 0.3) 低温

- 事实性回答
- 编程辅助
- 数据抽取
- 内容审核

### Medium Temperature (0.4 - 0.7) 中温

- 摘要总结
- 教学内容
- 问题求解
- 有约束的创意写作

### High Temperature (0.8 - 1.0) 高温

- 头脑风暴
- 创意写作
- 营销文案
- 生成笑话

## Implementing Temperature in Code 代码实现

给 chat 函数加上 temperature 支持很简单:

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

改动就两处: 加上 `temperature=1.0` 参数,以及在 params 字典里加 `"temperature": temperature`。

## Testing Temperature Effects 试试效果

想直观看到差别,可以用不同设置生成电影创意:

```python
# 低温 —— 更可预测
answer = chat(messages, temperature=0.0)

# 高温 —— 更有创意
answer = chat(messages, temperature=1.0)
```

`temperature=0.0` 时,你可能反复拿到类似「一位时空穿越的考古学家必须阻止古代文物被盗」这样的答案。`temperature=1.0` 时,创意概念的多样性会明显提升。

## Key Takeaways 要点

记住: temperature **不保证**输出不同,它只是改变了「拿到不同输出」的概率。即便设成高温,Claude 偶尔也会给出相似的回复。关键是让设置匹配任务:

- 需要稳定、事实性的回答时用低温
- 需要创意和多样性时用高温
- 针对你的具体场景多试几个值,找到最合适的

temperature 是调节 Claude 行为最实用的参数之一,是 AI 开发工具箱里的必备项。

对产品经理来说: 这个参数很容易被误用成「万能调节钮」。要注意它调的是**采样随机性**,不是**质量**或**准确度**——把 temperature 调低不会让 Claude 更少犯错,只会让它每次犯同样的错。想提高准确度,该改的是提示词、示例和上下文,不是这个旋钮。
