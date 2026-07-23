# Claude with Google Vertex - 76 Agents and workflows 智能体与工作流

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 76
> 课程: Claude with Google Vertex · 第 76 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

用 Claude 做应用时,你经常会碰到一次请求完不成的任务。这时就轮到**工作流(workflows)** 和**智能体(agents)** 出场了——它们是处理复杂多步流程的两种策略。

其实这门课里你已经在用这些概念了。还记得我们给 Claude 工具、让它自己想办法完成任务吗?那就是一个智能体在工作。

## Choosing Between Workflows and Agents 怎么在两者之间选

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621312%2F11_-_001_-_Agents_and_Workflows_01.1748621311977.png)

选择取决于**你对这个任务理解得有多清楚**:

- **用工作流**: 当你能清楚描绘出 Claude 解决问题该走的确切流程或步骤,或者你的产品交互本身就把用户限制在一组固定任务里
- **用智能体**: 当你不确定会给 Claude 什么样的任务、什么样的参数

**工作流**是一连串对 Claude 的调用,通过预先设定好的步骤来解决某个特定问题。**智能体**则是给 Claude 一个目标和一套工具,期待它自己想办法用这些工具达成目标。

## A Real-World Workflow Example 一个真实的工作流例子

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621313%2F11_-_001_-_Agents_and_Workflows_05.1748621313095.png)

看个实际例子: 做一个「图片转 CAD」的应用。用户拖入一张金属零件的图片,应用生成一个 STEP 文件(3D 模型的行业标准格式)。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621314%2F11_-_001_-_Agents_and_Workflows_06.1748621314624.png)

可以拆成这样的工作流步骤:

1. 把图片喂给 Claude,让它详细描述这个物体
2. 基于描述,让 Claude 用 CadQuery 库把物体建模出来
3. 生成 3D 模型的渲染图
4. 让 Claude 拿渲染图与原图对照打分。有问题就修正并重复

这是一个完美的工作流场景,因为用户提供图片之后该做什么我们心里很有数,整套步骤可以直接用代码写成预定义的序列。

## The Evaluator-Optimizer Pattern 评估—优化模式

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748621316%2F11_-_001_-_Agents_and_Workflows_14.1748621316130.png)

这个 CAD 例子演示了一种常见的工作流模式,叫**评估—优化(evaluator-optimizer)**:

- **生产者(Producer)**: 接收输入、产出结果(Claude 用 CadQuery 建模并渲染)
- **评分者(Grader)**: 按标准评估结果
- **反馈回路**: 评分者不接受时,反馈回到生产者去改进
- **接受(Acceptance)**: 循环持续到评分者接受为止

## Why Learn Workflow Patterns? 为什么要学工作流模式

识别出不同的工作流,等于给自己攒了一套可复用的实现配方。评估—优化就是一个被其他工程师验证过好用的模式——不妨在你自己的应用里试试!

记住,工作流不会自己实现,代码还是要你写。但有这些经过验证的模式作为起点,能省下不少时间,也能避开别人已经踩过的坑。

对产品经理来说: 「工作流 vs 智能体」的选择,其实等价于「**这个流程我说得清楚吗**」。说得清楚就写成工作流——可预测、可测试、成本可控; 说不清楚才交给智能体。实践中一个常见错误是过早上智能体: 明明流程固定,却因为「智能体听起来更先进」而放弃了确定性。判断标准很朴素: 你能不能画出流程图。能画,就别用智能体。
