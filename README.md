# PromptLens

PromptLens 是一个动态 AI 任务书生成网站，用于把一句模糊想法整理成可直接交给 AI 执行的任务书。它面向不会写复杂需求的人，帮助用户补齐目标、上下文、约束、输出格式和验收标准。

## 当前功能

- 动态后端：Node 服务、API 路由、本地 JSON 数据库
- 商用账户：注册、登录、退出、会话令牌
- 云端历史与收藏：登录后保存到服务端数据库
- 正式数据库适配：配置 `DATABASE_URL` 后可使用 Supabase / PostgreSQL，未配置时自动使用本地 JSON
- 对话式优化：先追问缺失信息，再把回答合并进最终任务书
- 评分解释：解释分数来源、短板和下一步提升建议
- 双层评分：拆分本地结构分、AI质量分和综合分，避免 AI 增强后分数变化造成误解
- 项目画像：补充目标用户、成功标准和避免事项，让输出更贴近业务场景
- 快捷增强：一键生成完整任务书、精简任务书、补齐交付信息、验收标准和图像任务书
- 任务书体检：检查目标用户、成功标准、约束、格式和可衡量指标是否完整
- 个人工作台：展示历史、收藏、自定义模板和导出记录
- 自定义模板：登录用户可保存到云端，访客可保存到本地浏览器
- 服务端模板与统计：模板、生成量、收藏量通过 API 获取
- 安全 AI 代理：通过后端 `/api/optimize` 调用真实 AI 模型，避免在前端暴露 API Key
- 模板中心：开发、图片、写作、分析、商业、个人场景模板
- 追问模式：自动生成补充问题，并把回答合并进需求
- 任务书改写器：优化已有任务说明，而不是执行原任务
- 多版本输出：精简任务书、标准任务书、交付任务书、可直接复制版
- 交付拆解：展示角色、目标、约束、输出格式和风险提示
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
- `POST /api/templates`：保存自定义模板
- `GET /api/stats`：获取站点统计
- `GET /api/dashboard`：读取个人工作台
- `POST /api/exports`：记录导出行为
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
OPENAI_FAST_MODEL=gpt-4.1-mini
OPENAI_PRO_MODEL=gpt-4.1
OPENAI_CREATIVE_MODEL=gpt-4.1
npm start
```

如果没有配置 `OPENAI_API_KEY`，`/api/optimize` 会返回服务端规则增强结果，网站仍然可用。

如果使用兼容 OpenAI Chat Completions 的模型网关，可以配置：

```bash
OPENAI_BASE_URL=https://your-compatible-provider.example.com/v1
OPENAI_API_KEY=your_provider_key
```

## 正式数据库

本地默认使用 `data/db.json`，适合测试和演示。正式商用建议使用 Supabase 或 PostgreSQL，并在 Render 环境变量中配置：

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

服务启动后会自动创建 `promptlens_store` 表，把账号、历史、收藏、模板、导出记录和事件保存到数据库。没有配置 `DATABASE_URL` 时会自动回退到本地 JSON。

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
  "prompt": "优化后的完整 AI 任务书",
  "blueprint": "交付拆解",
  "image": "图片参数，可选",
  "score": 92,
  "scoreExplanation": "评分解释和提升建议",
  "questions": ["需要追问的问题"],
  "variants": [
    {
      "title": "标准任务书",
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
