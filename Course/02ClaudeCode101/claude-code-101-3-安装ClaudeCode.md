# Claude Code 101 - 3 Installing Claude Code 安装 Claude Code

> Course: Claude Code 101 · Lesson 3
> 课程: Claude Code 101 · 第 3 课
> 来源: Anthropic Academy (anthropic.skilljar.com),用户登录后提供英文原文,2026-07-12 整理翻译存档

Claude Code is simple to install whether you want to use it in your terminal, on the web, or in your IDE.

> 无论你想在终端、网页端还是 IDE 里使用 Claude Code,安装过程都很简单。

## Terminal 终端

On macOS, Linux, or WSL, use the curl command to install it in one go. If you prefer Homebrew, you can also use brew install, but note that this method doesn't support auto-updates.

> 在 macOS、Linux 或 WSL 上,用 curl 命令即可一步安装完成。如果你更喜欢用 Homebrew,也可以用 `brew install`,但要注意这种方式不支持自动更新。

On Windows, there are a few options. In PowerShell, use the Invoke-RestMethod command. In CMD, use the curl command. There's also a winget command available, though like Homebrew, it won't auto-update.

> 在 Windows 上有几种选择:在 PowerShell 里用 `Invoke-RestMethod` 命令,在 CMD 里用 curl 命令。也有 winget 命令可用,但和 Homebrew 一样,不支持自动更新。

> Terminal showing Claude Code successfully installed via curl(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

After installation, you should be able to run the claude command. If not, restart your terminal. Navigate to your project directory and run:

> 安装完成后,你应该就能运行 `claude` 命令了。如果不行,重启一下终端。进入你的项目目录,然后运行:

```
claude
```

You'll go through some initial setup steps like choosing your color theme and signing in with your Claude account (Pro, Max, or Enterprise) or using an API key. If your organization has a Claude Enterprise account, be sure to select that option.

> 接下来会走一遍初始设置流程,比如选择配色主题,以及用你的 Claude 账号(Pro、Max 或 Enterprise)登录,或者使用 API key。如果你所在的组织有 Claude Enterprise 账号,一定要选对应的选项。

> Claude Code login method selection: subscription, API, or third-party platform(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

Whatever directory you run claude in, it will have access to that directory and all of its subfolders.

> 你在哪个目录下运行 `claude`,它就能访问那个目录以及其中所有的子文件夹。

## Visual Studio Code

Open your Extensions panel and search for "Claude Code." Look for the extension by Anthropic with the blue verification check. Hit install.

> 打开扩展面板,搜索「Claude Code」。找到由 Anthropic 发布、带蓝色认证标志的扩展,点击安装。

After installation, you may need to restart VS Code. Once it's running, open the command palette with Ctrl/Cmd + Shift + P and search for "Claude Code Open in New Tab." You can also click the Claude logo if it's visible in your sidebar.

> 安装后可能需要重启 VS Code。启动之后,用 Ctrl/Cmd + Shift + P 打开命令面板,搜索「Claude Code Open in New Tab」。如果侧边栏里能看到 Claude 图标,直接点击它也可以。

> Claude Code extension page in VS Code marketplace(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

The VS Code extension provides a very similar experience to the terminal. You can also opt out of the UI and use the terminal experience directly in your settings.

> VS Code 扩展提供的体验和终端非常相似。你也可以在设置里关闭图形界面,直接使用终端式的体验。

## JetBrains

Install the Claude Code plugin from the JetBrains Marketplace. After installation, restart your IDE. When you reopen it, you'll see the Claude logo. Clicking it opens a pane with the terminal experience that works alongside your editor.

> 从 JetBrains 插件市场安装 Claude Code 插件。安装后重启 IDE。重新打开后,你会看到 Claude 图标,点击它会打开一个面板,提供和编辑器并行工作的终端式体验。

> Claude Code plugin in the JetBrains Marketplace(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## Desktop 桌面应用

After installing and signing into Claude Desktop, you'll see a toggle at the top labeled "Code." The look and feel is similar to the chat side of things, but it lets you work in a specific folder, change permissions, and even work in a cloud environment.

> 安装并登录 Claude 桌面应用后,顶部会有一个标着「Code」的切换开关。它的外观和聊天界面很相似,但可以让你在指定的文件夹中工作、调整权限,甚至在云端环境中工作。

> Claude Desktop Code view showing recent project folders(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## Web 网页端

On the web, access Claude Code by going to claude.ai/code, or by clicking the "Code" label in the sidebar of the chat app. This works similarly to the desktop app, but you're restricted to GitHub repositories.

> 在网页端,访问 claude.ai/code 即可使用 Claude Code,也可以点击聊天应用侧边栏里的「Code」标签。这和桌面应用的体验类似,但只能使用 GitHub 仓库。

> Claude Code on the web at claude.ai/code with repository selection(课程页面配图,此处仅保留文字说明,未随文字内容一并提供)

## Which One Should I Use? 该选哪一种?

If you want to stay on the cutting edge, the terminal is your best bet — features ship there first. The IDE integrations offer a nearly identical experience if you prefer Claude Code to feel more intertwined with your code editor.

> 如果你想第一时间用上最新功能,终端是最佳选择——新功能总是先在终端上线。如果你希望 Claude Code 和你的代码编辑器结合得更紧密,IDE 集成提供的体验几乎一模一样。

Desktop is great for letting Claude run in the background while you handle other tasks.

> 桌面应用很适合让 Claude 在后台运行,而你同时处理其他事情。

Claude Code on the web is a solid option if you want to remotely work on projects through a GitHub repository.

> 如果你想通过 GitHub 仓库远程处理项目,网页版 Claude Code 是个不错的选择。

However you want to use Claude Code is up to you.

> 具体怎么用,取决于你自己的习惯和场景。

对产品经理来说,可以这样类比选安装方式:终端像是「原生功能最全的旗舰版」,新特性最先在这里上线;IDE 插件像是「嵌入现有工作流的插件版」,适合本来就活在编辑器里的人;桌面应用像是「后台自动跑的助理」,适合你想让它默默干活、自己去忙别的;网页版则像是「随时随地打开浏览器就能用的轻量版」,依赖 GitHub 仓库。选哪个不影响能力本身,只影响你日常习惯怎么衔接。
