# 轻知 LightNode

轻量级 AI 个人知识库，支持 RAG 检索、云端同步、Freemium 订阅。

## 技术栈

- **前端**: React + Tailwind CSS + React Router + React Flow
- **后端**: Supabase (Auth + PostgreSQL + pgvector)
- **RAG**: OpenAI Embeddings + 混合检索 (向量 + 全文) + Reranking

## 快速开始

```bash
npm install
cp .env.example .env.local
# 编辑 .env.local 填入 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
npm run dev
```

## Supabase 配置

1. 在 [Supabase](https://supabase.com) 创建项目
2. 在 SQL Editor 中依次执行 `supabase/migrations/` 下的 SQL 文件
3. 在 Authentication > Providers 中启用 Email 和 Google OAuth
4. 将 Site URL 和 Redirect URLs 配置为你的应用地址

## 环境变量

| 变量 | 说明 |
|-----|------|
| VITE_SUPABASE_URL | Supabase 项目 URL |
| VITE_SUPABASE_ANON_KEY | Supabase 匿名密钥 |

API Key（OpenAI 或兼容接口）在应用内「设置」中配置，仅存本地。

## 功能概览

- **游客模式**: 本地 LocalStorage，50 条笔记上限，关键词搜索
- **Pro**: 无限笔记、RAG AI 问答、云端同步、知识图谱、数据导出
- **Max**: Pro 全部 + AI Studio（自然语言定制 UI）
- **双主题**: 代码极简风 / 温馨手帐风
- **AI Studio**: `/ai-studio`，用自然语言调整界面，实时预览
- **定价页**: `/pricing`

### 测试 Max 功能
在浏览器控制台执行 `localStorage.setItem('lightnode-tier-override','max')` 后刷新。

## 目录结构

```
src/
├── components/     # UI 组件
├── context/       # Auth, Storage, Theme, Toast, Subscription
├── lib/           # Supabase 客户端
├── pages/         # 页面
├── services/      # RAG 服务
├── templates/     # 邮件模板
└── hooks/         # 自定义 Hooks
supabase/migrations/  # 数据库迁移
docs/              # 设计文档（如浏览器插件）
```
