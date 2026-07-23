# Claude with AWS Bedrock - 45 Image support 图像支持

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 45
> 课程: Claude with AWS Bedrock · 第 45 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Claude's vision capabilities allow you to include images in your messages and ask Claude to analyze, compare, count objects, or perform virtually any visual task you can imagine. This opens up powerful possibilities for applications ranging from document analysis to automated assessments.

> Claude 的视觉能力让你可以在消息里放入图像,让它分析、比较、数数,或者做几乎任何你能想到的视觉任务。这为从文档分析到自动化评估的各类应用打开了想象空间。

## Image Handling Basics 图像处理基础

When working with images in Claude, you need to understand a few key limitations:

> 在 Claude 里处理图像时,有几条关键限制要清楚:

- Up to 20 images across all messages in a single request. 单次请求中所有消息加起来最多 20 张图。
- Max size of 3.75MB. 单张最大 3.75MB。
- Max height/width of 8000px. 长宽最大 8000 像素。
- Each image counts as a certain number of tokens: `tokens = (width px × height px) / 750`. 每张图会折算成一定数量的 token: token 数 = (宽像素 × 高像素) / 750。

> 这个公式值得记一下: 一张 1000×1000 的图约合 1333 个 token。图越大越贵,所以上传前先压缩到够用的尺寸,是很实在的省钱手段。

To include an image, you add it as another type of message part. For each image you want to send, you include one image part in your user message. The structure looks like this:

> 要放入图像,你把它作为消息中的另一种「部分(part)」加进去。每发一张图,就在用户消息里放一个 image 部分。结构如下:

```python
with open("image.png", "rb") as f:
    image_bytes = f.read()

add_user_message(messages, [
    {
        "image": {
            "format": "png",
            "source": {"bytes": image_bytes}
        }
    },
    {"text": "What do you see in this image?"}
])
```

> 代码在做什么: 以二进制方式读取图片文件,然后往用户消息里放两个部分——一个是图像本身(标明格式和字节数据),一个是文字提问。图像和文字是并列的消息部分,不是嵌套关系。

## Multiple Images 多张图像

You can send multiple images in a single message by adding multiple image parts. Claude can then analyze relationships between images, compare them, or answer questions that require understanding multiple visual inputs.

> 你可以在同一条消息里放多个 image 部分来发送多张图。这样 Claude 就能分析图与图之间的关系、做对比,或者回答那些需要综合理解多个视觉输入的问题。

## Prompting Techniques 提示词技巧

The most important thing to understand about Claude's vision capabilities is that all the same prompting engineering techniques apply to images. You can dramatically increase Claude's vision accuracy by providing guidelines, analysis steps, or using one-shot/multi-shot examples.

> 关于 Claude 视觉能力,最重要的一点认知是: **之前学的所有提示词工程技巧,在图像上一样适用**。给出判断准则、分析步骤,或者使用单样本/多样本示例,都能大幅提升 Claude 的视觉准确率。

For example, instead of simply asking "How many marbles are in this image?", you can provide a structured approach:

> 举例来说,与其简单地问「这张图里有多少颗弹珠?」,不如给出一套结构化的做法:

```
Analyze this image of marbles and determine the exact count using this methodology:
1. Begin by identifying each unique marble one at a time. Assign each a number as you identify it.
2. Verify your result by counting with a different method. Start from the bottom-left corner and work row by row, from left to right.
What is the exact, verified number of marbles in this image?
```

> 翻译:「分析这张弹珠图片,按以下方法确定精确数量: 1. 先逐个识别每一颗不同的弹珠,识别一颗就编一个号。2. 换一种方法再数一遍来验证结果——从左下角开始,一行一行、从左往右数。这张图里经过验证的精确弹珠数是多少?」

> 注意这里用了两个技巧: 让它分步骤做(而不是直接给答案),以及**用另一种方法交叉验证**。后者对计数类任务尤其有效。

Another effective technique is one-shot prompting, where you provide an example image with the correct analysis before asking Claude to analyze your target image:

> 另一个有效技巧是单样本提示: 先给一张示例图和对应的正确分析,再让 Claude 分析你真正要问的那张图。

## Real-World Example: Fire Risk Assessments 真实案例: 火灾风险评估

A practical application of Claude's vision capabilities is automated fire risk assessment for insurance companies. Instead of sending inspectors to each property, companies can use high-resolution satellite imagery and ask Claude to evaluate fire risks.

> Claude 视觉能力的一个实际应用,是保险公司的自动化火灾风险评估。公司不必给每处房产都派查勘员,而是用高分辨率卫星影像,让 Claude 来评估火灾风险。

The system can analyze several key factors:

> 系统可以分析这几个关键因素:

- Dense, close-packed trees near the residence. 住宅附近是否有密集、紧挨的树木。
- Difficult access routes for emergency vehicles. 应急车辆是否难以进入。
- Branches overhanging the residence. 是否有枝条悬在住宅上方。
- Overall tree density and spacing. 整体的树木密度和间距。

Here's how you might structure such an analysis:

> 这类分析的代码结构大致如下:

```python
with open('./images/prop7.png', 'rb') as f:
    image_bytes = f.read()

messages = []

add_user_message(messages, [
    {"image": {"format": "png", "source": {"bytes": image_bytes}}},
    {"text": prompt}
])

response = chat(messages)
```

The key to success with this type of complex visual analysis is providing detailed, structured prompts that guide Claude through specific analysis steps rather than asking for a simple assessment.

> 这类复杂视觉分析要做成功,关键在于提供详细、结构化的提示词,引导 Claude 走完具体的分析步骤,而不是笼统地要一个「评估结果」。

Remember: when working with images, don't fall into the trap of using simple prompts. Apply the same prompt engineering techniques you've learned for text-based interactions to dramatically improve Claude's visual analysis accuracy.

> 记住: 处理图像时,别掉进「随手写个简单提示词」的陷阱。把你在文本交互中学到的那些提示词工程技巧照样用上,能大幅提升 Claude 视觉分析的准确率。
