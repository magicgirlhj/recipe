# Supabase 云同步设置

My Kitchen 继续由 GitHub Pages 托管。Supabase SDK 通过 CDN 加载，不需要在本地执行 `npm install @supabase/supabase-js`。

## 1. 创建数据表

在 Supabase Dashboard 打开 `SQL Editor`，运行 [`supabase/setup.sql`](./supabase/setup.sql)。

这会创建一张 `kitchen_data` 表，并启用 Row Level Security。每个登录用户只能访问自己的数据。

## 2. 开启邮箱登录

打开：

```text
Authentication -> Providers -> Email
```

确认 Email provider 已启用。若启用了邮箱确认，新用户注册后需要先点击确认邮件。

## 3. 配置登录 URL

打开：

```text
Authentication -> URL Configuration
```

填写：

```text
Site URL:
https://magicgirlhj.github.io/recipe/
```

在 Redirect URLs 中添加：

```text
https://magicgirlhj.github.io/recipe/
http://localhost:5173/**
http://localhost:4173/**
```

## 4. 获取连接信息

在 Supabase 项目设置中找到：

- Project URL
- Publishable key，通常以 `sb_publishable_` 开头

不要使用 `service_role` key。

## 5. 选择配置方式

### 推荐：GitHub Pages 自动配置

在 GitHub 仓库打开：

```text
Settings -> Secrets and variables -> Actions
```

在 `Secrets` 或 `Variables` 里创建：

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

下次部署时，GitHub Actions 会在构建阶段把配置注入网站。所有设备第一次打开设置页都会显示“已自动配置”，用户只需要登录或创建账号。

Project URL 和 publishable key 会出现在前端构建产物中，这是 Supabase 前端项目的正常用法；不要填写 `service_role` key。

### 备选：设置页手动配置

打开网站的 `设置 -> 连接设置`，填写 Project URL 和 Publishable Key。

配置只保存在当前浏览器。换设备时需要再填写一次，然后使用同一邮箱账号登录。

### 本地开发自动配置

如果本地也想自动带好连接，可以创建 `.env.local`，内容如下：

```text
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

`.env.local` 不要提交到 GitHub。

## 6. 首次登录和同步规则

- 未登录时，数据继续保存在 localStorage。
- 第一次登录且云端为空时，当前设备数据会自动上传。
- 云端已有数据时，登录设备会下载云端数据。
- 登录后修改菜谱、Wishlist 或冰箱，约 700ms 后自动同步。
- 设置页提供“上传本机”和“下载云端”用于手动覆盖。

第一版采用“最后保存者覆盖”。不要在两台设备上同时离线编辑同一份数据。
