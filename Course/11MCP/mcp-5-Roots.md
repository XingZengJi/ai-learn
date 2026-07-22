# MCP - 5 Roots 根目录授权

> Course: MCP(Model Context Protocol,模型上下文协议)深入课程 · Lesson 5
> 课程: MCP 深入课程 · 第 5 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-22 整理翻译存档

## Lesson Content 课程内容

Roots are a way to grant MCP servers access to specific files and folders on your local machine. Think of them as a permission system that says "Hey, MCP server, you can access these files" - but they do much more than just grant permission.

> Roots(根目录)是一种授权机制,用来让 MCP 服务器访问你本机上特定的文件和文件夹。可以把它理解成一套权限系统,相当于告诉 MCP 服务器:「嘿,你可以访问这些文件」——但它的作用远不止「给权限」这么简单。

对产品经理来说,roots 有点像你给外部合作方开的「共享文件夹权限」——你不会把整个公司网盘都共享出去,而是只开放某几个指定的文件夹;对方只能在这些文件夹里找东西,既方便协作,又不会泄露不该看到的内容。

### The Problem Roots Solve Roots 要解决的问题

Without roots, you'd run into a common issue. Imagine you have an MCP server with a video conversion tool that takes a file path and converts an MP4 to MOV format.

> 如果没有 roots,你会遇到一个常见的问题。假设你有一个 MCP 服务器,里面有一个视频转换工具,接收一个文件路径,把 MP4 转换成 MOV 格式。

When a user asks Claude to "convert biking.mp4 to mov format", Claude would call the tool with just the filename. But here's the problem - Claude has no way to search through your entire file system to find where that file actually lives.

> 当用户让 Claude「把 biking.mp4 转换成 mov 格式」时,Claude 调用这个工具时只会拿到一个文件名。但问题来了——Claude 没有办法搜遍你整个文件系统,去找出这个文件到底存放在哪里。

Your file system might be complex with files scattered across different directories. The user knows the biking.mp4 file is in their Movies folder, but Claude doesn't have that context.

> 你的文件系统可能相当复杂,文件散落在不同的目录里。用户自己知道 biking.mp4 在「影片」文件夹里,但 Claude 并不知道这个背景信息。

You could solve this by requiring users to always provide full paths, but that's not very user-friendly. Nobody wants to type out complete file paths every time.

> 你可以要求用户每次都提供完整路径来解决这个问题,但这样用户体验很差——没人愿意每次都手打一长串完整路径。

## Roots in Action Roots 的实际运作

Here's how the workflow changes with roots:

> 有了 roots 之后,工作流程会变成这样:

1. User asks to convert a video file. 用户要求转换一个视频文件。
2. Claude calls `list_roots` to see what directories it can access. Claude 调用 `list_roots`,查看自己能访问哪些目录。
3. Claude calls `read_dir` on accessible directories to find the file. Claude 在可访问的目录里调用 `read_dir`,查找目标文件。
4. Once found, Claude calls the conversion tool with the full path. 找到文件后,Claude 带着完整路径调用转换工具。

This happens automatically - users can still just say "convert biking.mp4" without providing full paths.

> 这一切都是自动发生的——用户依然只需要说「转换 biking.mp4」,不需要提供完整路径。

## Security and Boundaries 安全性与边界

Roots also provide security by limiting access. If you only grant access to your Desktop folder, the MCP server cannot access files in other locations like Documents or Downloads.

> Roots 还能通过限制访问范围来提供安全保障。如果你只授予了「桌面」文件夹的访问权限,MCP 服务器就无法访问「文档」或「下载」等其他位置的文件。

When Claude tries to access a file outside the approved roots, it gets an error and can inform the user that the file isn't accessible from the current server configuration.

> 当 Claude 试图访问已授权 roots 之外的文件时,会收到一个错误,并可以告知用户:在当前的服务器配置下,这个文件是无法访问的。

## Implementation Details 实现细节

The MCP SDK doesn't automatically enforce root restrictions - you need to implement this yourself. A typical pattern is to create a helper function like `is_path_allowed()` that:

> MCP SDK 不会自动强制执行 root 的访问限制——这部分需要你自己实现。一种典型的做法,是创建一个类似 `is_path_allowed()` 的辅助函数,它会:

1. Takes a requested file path. 接收一个被请求访问的文件路径。
2. Gets the list of approved roots. 获取已授权的 roots 列表。
3. Checks if the requested path falls within one of those roots. 检查该路径是否落在这些 roots 之中的某一个范围内。
4. Returns true/false for access permission. 返回「允许/不允许」访问的判断结果。

You then call this function in any tool that accesses files or directories before performing the actual file operation.

> 然后,在任何会访问文件或目录的工具中,你都要在真正执行文件操作之前,先调用这个函数做检查。

## Key Benefits 核心优势

- **User-friendly** - Users don't need to provide full file paths.

  **对用户友好** - 用户不需要提供完整的文件路径。

- **Focused search** - Claude only looks in approved directories, making file discovery faster.

  **搜索范围聚焦** - Claude 只会在已授权的目录里查找,文件发现速度更快。

- **Security** - Prevents accidental access to sensitive files outside approved areas.

  **安全性** - 防止意外访问到授权范围之外的敏感文件。

- **Flexibility** - You can provide roots through tools or inject them directly into prompts.

  **灵活性** - 你既可以通过工具来提供 roots,也可以直接把它们注入到提示词里。

Roots make MCP servers both more powerful and more secure by giving Claude the context it needs to find files while maintaining clear boundaries around what it can access.

> Roots 让 MCP 服务器变得既更强大、又更安全——它给了 Claude 找到文件所需要的情境信息,同时又为它能访问的范围划出了清晰的边界。
