# My Kitchen / 今天吃什么

一个个人饮食数据库 MVP，用来管理自己的菜谱、想吃清单 Wishlist、冰箱库存，并基于这些数据生成“今天吃什么”的候选推荐列表。

网站完全运行在前端。未登录时数据保存在浏览器 `localStorage` 中；配置 Supabase 后可使用邮箱账号在不同设备之间同步。

## 功能

- 首页 Dashboard：统计菜谱、Wishlist、冰箱库存，展示最近添加、快过期提醒和今日候选推荐。
- 我的菜谱 Recipes：菜谱列表、搜索、标签筛选、新建、编辑、删除、详情查看、记录“今天做了”。
- 想吃清单 Wishlist：保存想尝试的菜，支持搜索、新建、编辑、删除、转成菜谱。
- 我的冰箱 Fridge：管理食材库存，按冷藏、冷冻、常温分类，显示过期和快过期状态。
- 今天吃什么 Recommendation：支持综合推荐、冰箱优先、Wishlist 优先、随机探索，生成 Top 5 候选列表。
- 设置 Settings：Supabase 连接、邮箱注册/登录、同步状态、手动上传/下载和恢复示例数据。

## 技术栈

- React + Vite
- TypeScript
- Tailwind CSS
- lucide-react
- react-router-dom
- uuid
- localStorage
- Supabase Auth + PostgreSQL JSONB，可选

## 本地运行

```bash
npm install
npm run dev
```

打开终端输出的本地地址，通常是：

```bash
http://localhost:5173/
```

## 构建

```bash
npm run build
```

构建产物会生成在 `dist/` 目录。

## 预览构建产物

```bash
npm run preview
```

## 部署到 GitHub Pages

本项目已配置 GitHub Actions：`.github/workflows/deploy.yml`。

推荐步骤：

1. 在 GitHub 创建一个新仓库，例如 `my-kitchen`。
2. 将本地仓库推送到 GitHub。
3. 进入 GitHub 仓库的 `Settings -> Pages`。
4. 在 `Build and deployment` 中选择 `GitHub Actions`。
5. 推送到 `main` 分支后，workflow 会自动构建并部署。

如需开箱即用的云同步，在 GitHub Actions Repository secrets 中添加：

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

完整数据库和认证配置见 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)。

因为项目使用 `HashRouter` 和 Vite `base: "./"`，可以部署到：

```text
https://<username>.github.io/<repo-name>/
```

## 手动推送命令

如果还没有添加远程仓库：

```bash
git remote add origin https://github.com/<username>/<repo-name>.git
git branch -M main
git push -u origin main
```

如果已经添加远程仓库：

```bash
git push
```

## 项目结构

```text
.
├── .github/workflows/deploy.yml
├── supabase/setup.sql
├── SUPABASE_SETUP.md
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── src
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── components
│   │   ├── forms
│   │   ├── Layout.tsx
│   │   ├── RecipeCard.tsx
│   │   ├── WishlistCard.tsx
│   │   └── InventoryCard.tsx
│   ├── context
│   │   └── KitchenContext.tsx
│   ├── lib
│   │   └── supabase.ts
│   ├── data
│   │   ├── sampleData.ts
│   │   └── types.ts
│   ├── pages
│   │   ├── Dashboard.tsx
│   │   ├── Recipes.tsx
│   │   ├── Wishlist.tsx
│   │   ├── Fridge.tsx
│   │   ├── Recommendation.tsx
│   │   └── Settings.tsx
│   └── utils
│       ├── date.ts
│       ├── recommendations.ts
│       └── storage.ts
└── README.md
```

## 数据说明

第一次打开网站时，如果 localStorage 中没有数据，会自动初始化：

- 3 个个人菜谱
- 3 个 Wishlist 项目
- 5 个冰箱食材
- 25 个公共菜谱

公共菜谱只作为冷启动和补充推荐，用户自己的菜谱和 Wishlist 会优先参与推荐。

## 云同步说明

- Supabase SDK 通过 CDN 加载，不需要在本地安装 Supabase npm 包。
- 未配置或未登录时，所有功能仍可使用 localStorage。
- 第一次登录且云端为空时，当前浏览器的数据会自动上传。
- 云端已有数据时，新设备登录后会载入云端数据。
- 登录状态下的修改会自动保存，设置页也提供手动上传和下载。
