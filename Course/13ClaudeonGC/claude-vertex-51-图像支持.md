# Claude with Google Vertex - 51 Image support 图像支持

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 51
> 课程: Claude with Google Vertex · 第 51 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

Claude 的视觉能力让你可以在消息里放入图片,让它做各种细致的分析: 描述图片内容、对比多张图片、数数量,或者执行复杂的视觉分析任务。

## Image Handling Basics 图像处理基础

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621025%2F08_-_002_-_Image_Support_01.1748621025480.png)

用图片时要知道这几条限制:

- 单次请求所有消息中最多 **100 张**图片
- 每张图片最大 **5MB**
- 只发一张图时: 最大宽/高 **8000px**
- 发多张图时: 最大宽/高 **2000px**
- 图片可以用 base64 编码,也可以用图片 URL
- 每张图按尺寸计费: **tokens = (宽 px × 高 px) / 750**

要放入图片,在 user 消息里于文本块旁边加一个图像块。结构如下:

```python
with open("image.png", "rb") as f:
    image_bytes = base64.standard_b64encode(
        f.read()
    ).decode("utf-8")

add_user_message(messages, [
    # 图像块
    {
        "type": "image",
        "source": {
            "type": "base64",
            "media_type": "image/png",
            "data": image_bytes,
        }
    },
    # 文本块
    {
        "type": "text",
        "text": "What do you see in this image?"
    }
])
```

## Message Flow 消息流

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621026%2F08_-_002_-_Image_Support_02.1748621026421.png)

对话过程和纯文本交互完全一样。你的服务器发出含图像块和文本块的 user 消息,Claude 返回一条分析该图片的文本消息。

## Prompting Techniques 提示词技巧

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621027%2F08_-_002_-_Image_Support_04.1748621027248.png)

关于 Claude 视觉能力,最重要的一件事是: **好的提示词技巧至关重要**。即便图片很清晰,简单的提示词也常常给出糟糕的结果。

比如给一张有 12 颗弹珠的图,问 "How many marbles are in this image?",可能得到错误答案 13。用与处理文本时相同的提示词工程技巧,准确性能大幅提升:

- 提供详细的准则和分析步骤
- 使用 one-shot / multi-shot 示例
- 把复杂任务拆成更小的步骤

### Step-by-Step Analysis 分步分析

与其简单发问,不如给 Claude 一套方法论:

```
Analyze this image of marbles and determine the exact count using this methodology:
1. Begin by identifying each unique marble one at a time. Assign each a number as you identify it.
2. Verify your result by counting with a different method. Start from the bottom-left corner and work row by row, from left to right.

What is the exact, verified number of marbles in this image?
```

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621028%2F08_-_002_-_Image_Support_05.1748621027972.png)

这种结构化的方式让 Claude 得出了正确答案 12 颗。

### One-Shot Examples one-shot 示例

也可以在一条消息里放多组「图片—文本」对来做 one-shot 提示:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621029%2F08_-_002_-_Image_Support_07.1748621028745.png)

```
[11 颗弹珠的图片]
The image above has 11 marbles in it.

[12 颗弹珠的图片]  
How many marbles are in this image?
```

给一个示例,能显著提升 Claude 在目标图片上的准确率。

## Real-World Example: Fire Risk Assessment 实例: 火灾风险评估

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621030%2F08_-_002_-_Image_Support_08.1748621030403.png)

一个实际应用: 自动化的家庭保险火灾风险评估。保险公司常要求房主修剪房屋周围的树木以降低野火风险。与其派检查员逐户上门,不如用卫星图像配合 Claude。

系统分析卫星图像,识别:

- 住宅附近密集、紧挨的树木
- 应急服务难以进入的路线
- 悬在住宅上方的枝条

不要用「给个火灾风险分」这种简单提示词,而要建立一套详细的分析框架:

```
Analyze the attached satellite image of a property with these specific steps:

1. Residence identification: Locate the primary residence on the property by looking for:
   - The largest roofed structure
   - Typical residential features (driveway connection, regular geometry)
   - Distinction from other structures (garages, sheds, pools)

2. Tree overhang analysis: Examine all trees near the primary residence:
   - Identify any trees whose canopy extends directly over any portion of the roof
   - Estimate the percentage of roof covered by overhanging branches (0-25%, 25-50%, 50-75%, 75%+)
   - Note particularly dense areas of overhang

3. Fire risk assessment: For any overhanging trees, evaluate:
   - Potential wildfire vulnerability (ember catch points, continuous fuel paths to structure)
   - Proximity to chimneys, vents, or other roof openings if visible
   - Areas where branches create a "bridge" between wildland vegetation and the structure

4. Defensible space identification: Assess the property's overall vegetative structure:
   - Identify if trees connect to form a continuous canopy over or near the home
   - Note any obvious fuel ladders (vegetation that can carry fire from ground to tree to roof)

5. Fire risk rating: Based on your analysis, assign a Fire Risk Rating from 1-4:
   - Rating 1 (Low Risk): No tree branches overhanging the roof, good defensible space around
   - Rating 2 (Moderate Risk): Minimal overhang (<25% of roof), some separation between tree canopies
   - Rating 3 (High Risk): Significant overhang (25-50% of roof), connected tree canopies, multiple points of vulnerability
   - Rating 4 (Severe Risk): Extensive overhang (>50% of roof), dense vegetation against structure

For each item above (1-5), write one sentence summarizing your findings, with your final response being the numerical rating.
```

这份详尽的提示词引导 Claude 走完一套系统性分析,得出准确且可执行的火灾风险评估。在一处树木茂密的房产上测试时,Claude 正确地判定为「3(高风险)」——因为存在明显的枝条悬垂和连成片的树冠。

核心要点是: **Claude 的视觉能力很强,但它需要与任何复杂任务同等严谨的提示词工程**。花时间写出详细、结构化的提示词,别指望简单发问。

对产品经理来说: 数弹珠这个例子很有教育意义——**12 颗数成 13 颗,这类错误人眼一看就知道错了,但系统不会告诉你它错了**。视觉类 AI 功能的风险在于错误往往「看起来很合理」。所以这类功能的设计原则是: 让 AI 做**初筛和排序**,把需要人工复核的量降下来,而不是让它做终审。上面那个火险评估之所以可行,正是因为它的产出是「优先级排序」,而不是「保费定价」。
