# 宸宸管家 Web App

宸宸育婴记录系统 — 阿姨专用

## 项目结构

```
chenchen-app/
├── src/               # React 前端
├── functions/api/     # Cloudflare Pages Function（Feishu API 代理）
├── worker-cron/       # Cloudflare Cron Worker（每晚 22:00 发日报）
├── index.html
└── package.json
```

---

## 部署步骤

### 第一步：GitHub

1. 在 GitHub 新建 repo，名字：`chenchen-app`
2. 把所有文件推上去

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_USERNAME/chenchen-app.git
git push -u origin main
```

### 第二步：Cloudflare Pages

1. 进入 Cloudflare Dashboard → Pages → Create a project
2. 连接 GitHub repo `chenchen-app`
3. 构建配置：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 添加环境变量（Settings → Environment Variables）：
   - `FEISHU_APP_ID` = `cli_a92b842dfa385bde`
   - `FEISHU_APP_SECRET` = `dsKKjlgWCANv2VcVDjJgYbWsdOv8nuAg`
5. 保存并部署

### 第三步：Cron Worker

1. 安装 Wrangler CLI（如果没有）：
```bash
npm install -g wrangler
wrangler login
```

2. 进入 worker-cron 目录：
```bash
cd worker-cron
```

3. 设置 secrets：
```bash
wrangler secret put FEISHU_APP_ID
# 输入: cli_a92b842dfa385bde

wrangler secret put FEISHU_APP_SECRET
# 输入: dsKKjlgWCANv2VcVDjJgYbWsdOv8nuAg
```

4. 部署：
```bash
wrangler deploy
```

5. 测试晚报（手动触发）：
   访问 `https://chenchen-cron.YOUR_SUBDOMAIN.workers.dev/trigger`

---

## 飞书多维表格配置提醒

使用前确认：
- `03_便便记录` → `形态` 字段选项：`正常软便` 改为 `正常`
- `02_辅食记录` → `进食量` 字段选项：新增 `全吃完`

---

## 技术信息

| 配置 | 值 |
|------|-----|
| app_token | A0Y2bHOfaaFagNsW6iyceceunEb |
| Cron 时间 | 每天 14:00 UTC = 22:00 北京时间 |
| Webhook | 见 worker-cron/index.js |
