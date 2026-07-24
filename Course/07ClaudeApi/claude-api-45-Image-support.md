# Building with the Claude API - 45 Image support 图像支持

> Course: Building with the Claude API · Lesson 45
> 课程: Building with the Claude API · 第 45 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

Claude 的视觉能力让你可以在消息里包含图像,让 Claude 以各种方式对图像进行分析。你可以让 Claude 描述图像里有什么、比较多张图像、数物体数量,或执行复杂的视觉分析任务。

## 图像处理的基本限制

处理图像时,有几个重要的限制需要记住:

- 单次请求里,所有消息加起来最多 100 张图像
- 单张图像最大 5MB
- 只发一张图像时:最大高/宽为 8000px
- 发多张图像时:最大高/宽为 2000px
- 图像可以用 base64 编码提供,也可以用图片 URL 提供
- 每张图像消耗的 token 数取决于它的尺寸:`tokens = (宽度像素 × 高度像素) / 750`

要给 Claude 发一张图像,你需要在用户消息里,连同文本块一起加入一个图像块。结构如下:

```python
with open("image.png", "rb") as f:
    image_bytes = base64.standard_b64encode(f.read()).decode("utf-8")

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

## 消息流转

整个对话的运作方式和纯文本交互一样。你的服务器把包含图像块和文本块的用户消息发给 Claude,Claude 返回一个包含分析结果的文本块。

## 提示词技巧

要让 Claude 在处理图像时给出好结果,关键是运用和处理文本时一样的提示词工程技巧。简单的提示词往往效果不好。比如,问「这张图里有多少颗弹珠?」这样的问题,得到的计数结果可能是错的。

你可以通过以下方式大幅提升 Claude 的准确率:

- 提供详细的指引和分析步骤
- 使用单样本或多样本示例
- 把复杂任务拆解成更小的步骤

### 分步分析

与其提一个简单的问题,不如给 Claude 一套方法论:

```
Analyze this image of marbles and determine the exact count using this methodology:
1. Begin by identifying each unique marble one at a time. Assign each a number as you identify it.
2. Verify your result by counting with a different method. Start from the bottom-left corner and work row by row, from left to right.

What is the exact, verified number of marbles in this image?
```

### 单样本示例

你也可以在消息里提供示例来提升准确率。附上一张已知数量的图像,给出正确答案,再问关于目标图像的问题。这能给 Claude 一个参照点,理解你想要的分析方式是什么样的。

## 实际案例:火灾风险评估

这里有一个实际应用:为房屋保险自动化火灾风险评估。保险公司不需要给每处房产都派检查员上门,而是可以用卫星图像加上 Claude 的分析来完成。

这套系统通过分析卫星图像来识别:

- 靠近住宅、密集聚集的树木
- 应急服务难以抵达的通道
- 悬垂在住宅上方的树枝

与其用「给出一个火灾风险评分」这样简单的提示词,一个结构良好的提示词会把分析拆解成具体的步骤:

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
   - Rating 1 (Low Risk): No tree branches overhanging the roof, good defensible space around the home
   - Rating 2 (Moderate Risk): Minimal overhang (<25% of roof), some separation between tree canopies
   - Rating 3 (High Risk): Significant overhang (25-50% of roof), connected tree canopies, multiple vulnerability points
   - Rating 4 (Severe Risk): Extensive overhang (>50% of roof), dense vegetation against structure

For each item above (1-5), write one sentence summarizing your findings, with your final response being the numerical rating.
```

这份细致的提示词引导 Claude 完成一套系统性的分析,得出的评估结果,比一个简单请求要准确、有用得多。

记住:同样的提示词工程技巧,对图像和对文本一样有效。想要可靠的结果,就该花时间打磨详细、结构化的提示词,而不是依赖简单的提问。

---

对产品经理来说,这一课最有价值的启示是「视觉理解任务的提示词工程和文本任务是同一套方法论」——不要以为「让 AI 看图」就该随便一问了事,复杂的视觉判断(比如数数、风险评级)同样需要给出方法论、拆解步骤、给参照示例。火灾风险评估那个案例特别值得记住:一个设计良好的分步提示词,能把「不知道靠不靠谱的模糊判断」变成「可复现、可审计的评级流程」,这正是把 AI 能力落地成可信赖产品功能的关键。
