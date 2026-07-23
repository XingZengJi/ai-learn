# Claude with AWS Bedrock - 66 Parallelizing Claude Code 并行运行 Claude Code

> Course: Claude with AWS Bedrock(在 AWS Bedrock 上使用 Claude)· Lesson 66
> 课程: Claude with AWS Bedrock · 第 66 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

同时跑多个 Claude Code 实例,是能拿到的最大生产力提升之一。Claude 本身很轻量,你可以轻松开几份、各自分配不同任务、让它们同时干活——相当于拥有一支虚拟工程师团队。

## The Challenge: File Conflicts 挑战: 文件冲突

并行实例的主要问题是它们可能同时改同一批文件,导致代码互相冲突或失效——每个实例都不知道其他实例在干什么。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559790%2F12_-_005_-_Parallelizing_Claude_Code_00.1748559790559.png)

解决办法是给每个 Claude 实例一个独立的工作区: 各自拿一份项目副本,隔离地做改动,完事再把改动合回主项目。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559791%2F12_-_005_-_Parallelizing_Claude_Code_02.1748559791393.png)

## Git Worktrees

Git worktree 非常适合这个场景。只要项目已经用 Git 管理,就能直接用。它可以看作 Git 分支功能的延伸,允许你在机器上的不同目录里创建项目的完整副本。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559792%2F12_-_005_-_Parallelizing_Claude_Code_03.1748559791903.png)

每个 worktree 对应一个独立分支。你可以一个目录放功能 A、另一个放功能 B,各自都是完整代码库,然后在每个 worktree 里跑一个独立的 Claude Code 实例,完全隔离地工作。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559792%2F12_-_005_-_Parallelizing_Claude_Code_04.1748559792621.png)

每个实例做完各自的功能后,提交并像合并普通 Git 分支那样合回主分支。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559793%2F12_-_005_-_Parallelizing_Claude_Code_05.1748559792995.png)

## Automating Worktree Creation 自动化创建 worktree

听起来管理麻烦,但整套流程可以直接交给 Claude Code 自己做。你可以写一条提示词,让 Claude:

- 在指定文件夹里创建新的 git worktree
- 软链那些没被 Git 跟踪的依赖
- 在该目录启动一个新的 VS Code 实例

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559793%2F12_-_005_-_Parallelizing_Claude_Code_06.1748559793589.png)

## Custom Commands 自定义命令

与其每次复制粘贴长提示词,不如在 Claude Code 里做成自定义斜杠命令: 往 `.claude/commands` 目录里加一个 `.md` 文件即可。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559794%2F12_-_005_-_Parallelizing_Claude_Code_10.1748559794142.png)

自定义命令里可以引用 `$ARGUMENTS`,它会被替换成你传给命令的参数。例如:

- `/project:create_worktree feature_a` 创建名为 `feature_a` 的 worktree
- `/project:create_worktree develop` 创建名为 `develop` 的 worktree

## Parallel Development in Action 并行开发实况

实际操作时,你可以为不同功能创建多个 worktree,每个 Claude 实例负责自己那份任务,比如:

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559794%2F12_-_005_-_Parallelizing_Claude_Code_15.1748559794596.png)

- 更新文档相关的测试
- 添加日志
- 添加记笔记的工具
- 添加一个减法工具

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559795%2F12_-_005_-_Parallelizing_Claude_Code_16.1748559795172.png)

## Merging Changes 合并改动

功能完成后,合并过程同样可以自动化。再做一个自定义命令,告诉 Claude:

1. 切进 worktree 目录
2. 查看最新提交
3. 切回根目录
4. 合并该 worktree 分支
5. 自动处理合并冲突

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1748559796%2F12_-_005_-_Parallelizing_Claude_Code_17.1748559796410.png)

Claude 甚至能基于它对各分支改动的理解,自动解决合并冲突。

## Results 效果

这套方法能扩展到你管得过来的任意数量的并行实例。原本要串行推进的功能,现在可以由多个 Claude 实例同时开发,相当于有了自己的开发团队,各自在隔离环境里干活,最后再把成果汇到一起。生产力提升相当可观——你的开发产能基本上乘以了并行实例的数量。

对产品经理来说: 这里的瓶颈会从「写代码」转移到「你能同时审几份产出」。开四个实例意味着四份改动等你判断该不该合。所以并行数量的上限不是机器性能,是**你自己的评审带宽**——这一点和管理真实团队完全一样。
