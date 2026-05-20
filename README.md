# PromptLens

PromptLens 是一个静态网页工具，用于把原始需求、问题、图片想法、开发需求或已有提示词优化成更精准的 AI 提示词。

## 当前功能

- 动态后端：Node 服务、API 路由、本地 JSON 数据库
- 商用账户：注册、登录、退出、会话令牌
- 云端历史与收藏：登录后保存到服务端数据库
- 服务端模板与统计：模板、生成量、收藏量通过 API 获取
- 安全 AI 代理：通过后端 `/api/optimize` 调用 AI，避免在前端暴露 API Key
- 模板中心：开发、图片、写作、分析、商业、个人场景模板
- 追问模式：自动生成补充问题，并把回答合并进需求
- 提示词改写器：优化已有提示词，而不是执行原提示词
- 多版本输出：简洁版、专业版、超详细版、可直接复制版
- 结构拆解：展示角色、目标、约束、输出格式和风险提示
- 图片参数：为图像生成模型生成正向、负面和画幅建议
- 评分体系：清晰度、上下文、约束、格式、可执行性
- 历史记录、收藏、导出 TXT / MD、分享链接
- 本地工作区账户和可配置云端同步端点
- 可配置 AI 后端接入端点
- 暗色模式和移动端布局

## 本地动态运行

需要 Node.js 18 或更高版本。

```bash
npm start
```

启动后访问：

```text
http://localhost:8787
```

后端会自动创建本地数据库：

```text
data/db.json
```

该文件已加入 `.gitignore`，不会被提交到 GitHub。

## 动态 API

- `GET /api/health`：健康检查
- `GET /api/templates`：获取服务端模板
- `GET /api/stats`：获取站点统计
- `POST /api/auth/register`：注册账户
- `POST /api/auth/login`：登录账户
- `POST /api/auth/logout`：退出登录
- `GET /api/me`：读取当前用户
- `GET /api/prompts`：读取云端历史
- `POST /api/prompts`：保存云端历史
- `GET /api/favorites`：读取云端收藏
- `POST /api/favorites`：保存云端收藏
- `POST /api/optimize`：后端 AI 增强

## AI 后端接入

GitHub Pages 只能托管静态文件，不能安全保存 API Key。动态版已经提供 Node 后端，可以把 AI Key 放在服务器环境变量里。

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-mini
npm start
```

如果没有配置 `OPENAI_API_KEY`，`/api/optimize` 会返回服务端规则增强结果，网站仍然可用。

前端会向后端发送：

```json
{
  "input": "用户原始需求",
  "mode": "code",
  "model": "pro",
  "workspace": "用户名称",
  "options": {
    "language": "zh",
    "tone": "professional",
    "format": "structured",
    "detail": 4
  }
}
```

后端建议返回：

```json
{
  "prompt": "优化后的完整提示词",
  "blueprint": "结构拆解",
  "image": "图片参数，可选",
  "score": 92,
  "variants": [
    {
      "title": "专业版",
      "note": "适合日常高质量使用",
      "content": "..."
    }
  ]
}
```

## GitHub Pages 发布

仓库设置中开启 Pages：

- Source: Deploy from a branch
- Branch: main
- Folder: /root

发布后网站地址通常是：

```text
https://<github-user>.github.io/<repo-name>/
```

注意：GitHub Pages 只能展示静态版。如果要让注册、登录、云端历史、AI 后端这些动态功能在公网可用，需要部署到 Vercel、Cloudflare、Railway、Render 或自己的服务器。

## Render 长期部署

仓库已包含 `render.yaml`，可以在 Render 里选择 Blueprint 部署。

基本设置：

- Runtime: Node
- Start Command: `npm start`
- Environment Variable: `OPENAI_API_KEY` 可选

免费实例可能会休眠，本地 JSON 数据库也不适合长期生产数据。正式商用建议把数据迁移到 Supabase、Postgres 或其他托管数据库。
