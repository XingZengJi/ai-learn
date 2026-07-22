# Building with the Claude API - 19 Prompt engineering 提示词工程

> Course: Building with the Claude API · Lesson 19
> 课程: Building with the Claude API · 第 19 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-17 整理翻译存档

Prompt engineering is about taking a prompt you've written and improving it to get more reliable, higher-quality outputs. This process involves iterative refinement - starting with a basic prompt, evaluating its performance, then systematically applying engineering techniques to improve it.

> 提示词工程,做的是把你写的提示词不断打磨,让输出更可靠、质量更高。这个过程是迭代式的打磨:从一个基础提示词开始,评估它的表现,再系统性地运用各种工程技巧去改进它。

## The Iterative Improvement Process 迭代改进的过程

The approach follows a clear cycle that you can repeat until you achieve your desired results:

- Set a goal - Define what you want your prompt to accomplish
- Write an initial prompt - Create a basic first attempt
- Evaluate the prompt - Test it against your criteria
- Apply prompt engineering techniques - Use specific methods to improve performance
- Re-evaluate - Verify that your changes actually improved the results

  这套方法遵循一个清晰的循环,你可以反复跑这个循环,直到达到理想效果:设定目标——明确你希望提示词完成什么;写出初始提示词——先做一个基础版本;评估提示词——按你的标准测试它;运用提示词工程技巧——用具体方法提升表现;重新评估——确认你的改动确实改善了结果。

You repeat the last two steps until you're satisfied with the performance. Each iteration should show measurable improvement in your evaluation scores.

> 你会反复跑最后两步,直到对效果满意为止。每一轮迭代,评估分数上都应该能看到可衡量的提升。

## Setting Up Your Evaluation Pipeline 搭建评估流水线

To demonstrate this process, we'll work with a practical example: creating a prompt that generates one-day meal plans for athletes. The prompt needs to take into account an athlete's height, weight, goals, and dietary restrictions, then produce a comprehensive meal plan.

> 为了演示这个过程,我们用一个实际案例:写一个能为运动员生成「一日饮食计划」的提示词。这个提示词需要综合考虑运动员的身高、体重、目标和饮食限制,给出一份完整的饮食计划。

The evaluation setup uses a PromptEvaluator class that handles dataset generation and model grading. When creating your evaluator instance, you can control concurrency with the max_concurrent_tasks parameter:

> 评估环境用的是一个 `PromptEvaluator` 类,负责生成数据集和模型评分。创建评估器实例时,可以用 `max_concurrent_tasks` 参数控制并发数:

```python
evaluator = PromptEvaluator(max_concurrent_tasks=5)
```

Start with a low concurrency value (like 3) to avoid rate limit errors. You can increase it if your API quota allows for faster processing.

> 一开始建议把并发数设低一点(比如 3),避免触发速率限制报错。如果你的 API 配额允许更快处理,再往上调。

## Generating Test Data 生成测试数据

The evaluation system can automatically generate test cases based on your prompt requirements. You define what inputs your prompt needs:

> 评估系统能根据你提示词的需求自动生成测试用例。你只需定义提示词需要哪些输入:

```python
dataset = evaluator.generate_dataset(
    task_description="Write a compact, concise 1 day meal plan for a single athlete",
    prompt_inputs_spec={
        "height": "Athlete's height in cm",
        "weight": "Athlete's weight in kg", 
        "goal": "Goal of the athlete",
        "restrictions": "Dietary restrictions of the athlete"
    },
    output_file="dataset.json",
    num_cases=3
)
```

Keep the number of test cases low (2-3) during development to speed up your iteration cycle. You can increase this for final validation.

> 开发阶段把测试用例数量控制在较低水平(2-3 个),能加快迭代速度;做最终验证时再调高数量。

## Writing Your Initial Prompt 写初始提示词

Start with a simple, naive prompt to establish a baseline. Here's an example of a deliberately basic first attempt:

> 先用一个简单、朴素的提示词建立基准线。下面是一个刻意写得很基础的初版示例:

```python
def run_prompt(prompt_inputs):
    prompt = f"""
What should this person eat?

- Height: {prompt_inputs["height"]}
- Weight: {prompt_inputs["weight"]}
- Goal: {prompt_inputs["goal"]}
- Dietary restrictions: {prompt_inputs["restrictions"]}
"""
    
    messages = []
    add_user_message(messages, prompt)
    return chat(messages)
```

This basic prompt will likely produce poor results, but it gives you a starting point to measure improvement against.

> 这个基础提示词大概率效果不好,但它给了你一个可以对比改进效果的起点。

## Adding Evaluation Criteria 添加评估标准

When running your evaluation, you can specify additional criteria that the grading model should consider:

> 运行评估时,你可以指定评分模型需要额外考虑的标准:

```python
results = evaluator.run_evaluation(
    run_prompt_function=run_prompt,
    dataset_file="dataset.json",
    extra_criteria="""
The output should include:
- Daily caloric total
- Macronutrient breakdown  
- Meals with exact foods, portions, and timing
"""
)
```

This helps ensure your prompt is evaluated against the specific requirements that matter for your use case.

> 这样能确保你的提示词是按照真正适用于你场景的具体要求来评估的。

## Analyzing Results 分析结果

After running an evaluation, you'll get both a numerical score and a detailed HTML report. The report shows you exactly how each test case performed, including the model's reasoning for each score.

> 跑完一次评估后,你会得到一个数值分数和一份详细的 HTML 报告。报告会清楚展示每个测试用例的具体表现,包括模型对每个分数给出的评判理由。

Don't be discouraged by low initial scores - a score of 2.3 out of 10 is typical for a first attempt. The goal is to see consistent improvement as you apply engineering techniques.

> 不要因为初始分数低就气馁——满分 10 分里拿 2.3 分,对第一版提示词来说很正常。目标是随着你运用工程技巧,持续看到分数稳步提升。

The detailed evaluation report helps you understand exactly where your prompt is failing and what improvements are needed. Use this feedback to guide your next iteration.

> 详细的评估报告能帮你精确定位提示词在哪里出了问题、需要做什么改进。用这些反馈来指导你的下一轮迭代。

## Next Steps 接下来

With your baseline established, you're ready to start applying specific prompt engineering techniques. Each technique you learn should result in measurable improvement in your evaluation scores, gradually transforming your basic prompt into a reliable, high-performing tool.

> 有了基准线之后,你就可以开始运用具体的提示词工程技巧了。你学到的每一种技巧,都应该能带来评估分数上可衡量的提升,让你的基础提示词逐步蜕变成一个可靠、高效的工具。

Remember that prompt engineering is an iterative process. The key is to make one change at a time, evaluate the impact, and build on what works. This systematic approach ensures you understand which techniques provide the most value for your specific use case.

> 记住,提示词工程是一个迭代的过程。关键是每次只改一处,评估这处改动的影响,再在有效的基础上继续叠加。这种系统化的方法能确保你清楚知道,对你的具体场景来说,哪些技巧最值得用。

## Downloads 课程资料下载

- 001_prompting.ipynb
- 002_prompting_completed.ipynb

对产品经理来说,这一课讲的其实是「需求打磨」的标准套路:先定目标、出一版粗糙的 v1、拿真实场景测一测打个分、针对薄弱点做一处改动、再测一遍看分数有没有涨——一次只改一个变量,才知道是哪处改动真正起了作用,而不是稀里糊涂地同时改一堆东西却说不清哪个有效。
