# MCP - 3 Log and Progress Notifications 日志与进度通知

> Course: MCP(Model Context Protocol,模型上下文协议)深入课程 · Lesson 3
> 课程: MCP 深入课程 · 第 3 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Logging and progress notifications are simple to implement but make a huge difference in user experience when working with MCP servers. They help users understand what's happening during long-running operations instead of wondering if something has broken.

> 日志(logging)和进度通知(progress notifications)实现起来很简单,但对使用 MCP 服务器时的用户体验有着巨大的影响。它们能帮用户理解在一次耗时较长的操作过程中究竟发生了什么,而不是干等着、猜测是不是哪里出故障了。

When Claude calls a tool that takes time to complete - like researching a topic or processing data - users typically see nothing until the operation finishes. This can be frustrating because they don't know if the tool is working or has stalled.

> 当 Claude 调用一个需要一段时间才能完成的工具时——比如调研某个话题,或者处理数据——用户在操作完成之前通常什么都看不到。这会让人很沮丧,因为他们不知道工具是在正常运行,还是已经卡住了。

With logging and progress notifications enabled, users get real-time feedback showing exactly what's happening behind the scenes. They can see progress bars, status messages, and detailed logs as the operation runs.

> 启用日志和进度通知后,用户能得到实时反馈,准确看到幕后正在发生什么。操作进行的同时,他们能看到进度条、状态消息和详细的日志。

对产品经理来说,这就好比外卖 App 里的「订单状态条」——没有它,你只知道「下单了」和「送到了」两个时间点,中间一片空白,很容易怀疑商家是不是忘了做;有了它,你能看到「商家已接单」「正在制作」「骑手已取餐」每一步,体验完全不同。日志和进度通知在 MCP 里起的就是这个作用。

## How It Works 工作原理

In the Python MCP SDK, logging and progress notifications work through the `Context` argument that's automatically provided to your tool functions. This context object gives you methods to communicate back to the client during execution.

> 在 Python 版 MCP SDK 中,日志和进度通知是通过自动传给你工具函数的 `Context` 参数来实现的。这个 context 对象提供了一些方法,让你能在工具执行过程中,把信息实时传回客户端。

```python
@mcp.tool(
    name="research",
    description="Research a given topic"
)
async def research(
    topic: str = Field(description="Topic to research"),
    *,
    context: Context
):
    await context.info("About to do research...")
    await context.report_progress(20, 100)
    sources = await do_research(topic)
    
    await context.info("Writing report...")
    await context.report_progress(70, 100)
    results = await generate_report(sources)
    
    return results
```

The key methods you'll use are:

> 你会用到的两个关键方法是:

- **`context.info()`** - Send log messages to the client. **向客户端发送日志消息。**
- **`context.report_progress()`** - Update progress with current and total values. **用「当前值/总值」的形式更新进度。**

## Client-Side Implementation 客户端实现

On the client side, you need to set up callback functions to handle these notifications. The server emits these messages, but it's up to your client application to decide how to present them to users.

> 在客户端这边,你需要设置回调函数来处理这些通知。服务器负责发出这些消息,但如何把它们呈现给用户,则完全由你的客户端应用来决定。

```python
async def logging_callback(params: LoggingMessageNotificationParams):
    print(params.data)

async def print_progress_callback(
    progress: float, total: float | None, message: str | None
):
    if total is not None:
        percentage = (progress / total) * 100
        print(f"Progress: {progress}/{total} ({percentage:.1f}%)")
    else:
        print(f"Progress: {progress}")

async def run():
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(
            read,
            write,
            logging_callback=logging_callback
        ) as session:
            await session.initialize()
            
            await session.call_tool(
                name="add",
                arguments={"a": 1, "b": 3},
                progress_callback=print_progress_callback,
            )
```

You provide the logging callback when creating the client session, and the progress callback when making individual tool calls. This gives you flexibility to handle different types of notifications appropriately.

> 日志回调是在创建客户端会话时提供的,而进度回调则是在每次调用具体工具时提供的。这样你就能灵活地针对不同类型的通知,采取合适的处理方式。

## Presentation Options 呈现方式的选择

How you present these notifications depends on your application type:

> 如何呈现这些通知,取决于你的应用类型:

- **CLI applications** - Simply print messages and progress to the terminal.

  **命令行应用** - 直接把消息和进度打印到终端里。

- **Web applications** - Use WebSockets, server-sent events, or polling to push updates to the browser.

  **Web 应用** - 用 WebSocket、服务器推送事件(SSE)或轮询的方式,把更新推送到浏览器。

- **Desktop applications** - Update progress bars and status displays in your UI.

  **桌面应用** - 在界面里更新进度条和状态显示。

Remember that implementing these notifications is entirely optional. You can choose to ignore them completely, show only certain types, or present them however makes sense for your application. They're purely user experience enhancements to help users understand what's happening during long-running operations.

> 记住,实现这些通知完全是可选的。你可以选择完全忽略它们,也可以只展示某些类型,或者以任何适合你应用的方式来呈现。它们纯粹是用户体验层面的增强功能,目的是帮用户理解耗时操作背后正在发生的事情。
