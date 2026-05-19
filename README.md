# PromptLens

PromptLens 是一个静态网页工具，用于把原始需求、问题、图片想法、开发需求或已有提示词优化成更精准的 AI 提示词。

## 当前功能

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

## AI 后端接入

GitHub Pages 只能托管静态文件，不能安全保存 API Key。生产环境应把密钥放在后端，然后在网页的“AI 接入”里填写后端地址。

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
