# Claude with Google Vertex - 04 Vertex AI Setup Vertex AI 环境配置

> Course: Claude with Google Vertex(在 Google Vertex AI 上使用 Claude)· Lesson 04
> 课程: Claude with Google Vertex · 第 04 课
> 来源: Anthropic Academy (anthropic.skilljar.com),登录后抓取英文原文翻译整理,2026-07-23

## Lesson Content 课程内容

下一课我们要向 Vertex AI 发起请求来调用 Claude 模型。在那之前,需要先做一点环境配置。

## Step One: Ensure Anthropic models are enabled in Vertex 第一步: 确认 Vertex 中已启用 Anthropic 模型

在浏览器中打开 <https://console.cloud.google.com/vertex-ai/dashboard>

在左侧导航栏点击 **Model Garden**,在 **Search models** 搜索框里输入 **Anthropic**,然后点击你想使用的模型。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1751930983%2F1.1751930983608.png)

## Step Two: Enable the Model 第二步: 启用模型

找到目标模型后,可能还需要手动启用。在模型信息页点击 **Enable** 按钮。

如果你看不到 **Enable** 按钮,说明你已经有这个模型的访问权限了。

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1751931014%2F2.1751931013945.png)

## Step Three: Install the gcloud CLI 第三步: 安装 gcloud CLI

如果还没装 gcloud CLI,按官方文档安装并完成认证: <https://cloud.google.com/sdk/docs/install>

![课程配图](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1751931033%2F3.1751931033360.png)

## Step Four: Login and set up authentication with the gcloud CLI 第四步: 登录并配置 gcloud CLI 认证

如果还没登录过 gcloud CLI,先运行:

```bash
gcloud init
gcloud auth login
```

然后设置项目 ID 和默认凭据:

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud auth application-default login
```

就这些! 之后 Anthropic SDK 访问 Vertex 时会自动使用这套凭据。

对产品经理来说: 这一课是 Vertex 版与 Bedrock 版最实质的差别所在。同一门课的其他内容几乎完全一致,真正不同的只有「怎么拿到访问权限」这一层——Vertex 走 Google Cloud 项目 + gcloud 凭据,Bedrock 走 AWS profile。换云厂商时要重做的是这一层,上面的提示词、工具、RAG 那些能力和代码基本原样可搬。
