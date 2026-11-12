# 个人博客 · 前端

博客前台和后台管理页面，基于 Vue 2 + Element UI，前后端分离。

- 线上地址：<https://xn--hlry9isyc4tas57t.com>
- 后端仓库：[tyyfhju/blog-backend](https://github.com/tyyfhju/blog-backend)
- 后端架构和完整部署教程：[blog-backend / README.md](https://github.com/tyyfhju/blog-backend/blob/main/README.md)
- 详细服务器部署步骤：[blog-backend / DEPLOY.md](https://github.com/tyyfhju/blog-backend/blob/main/DEPLOY.md)

## 功能

**前台**

- 首页、文章列表、文章详情、归档、分类、相册、关于
- 全站搜索、文章点赞、上下篇、相关推荐
- 评论、关于页留言（必须登录，显示登录邮箱）
- 登录、注册、邮箱验证码、找回密码
- 邮件订阅开关、新文章邮件通知、邮件内一键退订
- 深浅主题、移动端适配、搜索弹层、登录模态框

**后台**

- 仪表盘、文章、分类、标签、用户、评论、留言、相册、博客设置
- Markdown 编辑器、封面上传、站点文案配置
- 评论/留言管理、用户管理、相册管理

## 技术栈

| 技术 | 说明 |
| --- | --- |
| Vue 2.6 | 前端框架 |
| Vue Router 3.6 | 路由 |
| Vuex 3.6 | 登录态、站点设置、主题 |
| Element UI 2.15 | 后台管理组件 |
| axios 1.x | 接口请求 |
| markdown-it 13 | 文章 Markdown 渲染 |
| mavon-editor 2.10 | 后台 Markdown 编辑器 |
| highlight.js 11 | 代码高亮 |
| canvas 2D | 首页和文章页动画 |

## 目录结构

```text
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/              接口封装
│   ├── assets/           全站样式
│   ├── components/       公共组件
│   ├── content/          前台文案默认值
│   ├── router/           路由和登录/管理员守卫
│   ├── store/            Vuex
│   ├── utils/            工具函数
│   ├── views/            前台页面
│   │   └── admin/        后台页面
│   ├── App.vue
│   └── main.js
├── vue.config.js         开发端口和 /api 代理
└── package.json
```

## 本地开发

### 环境

- Node.js 14+
- 后端已启动在 `http://localhost:8080`

### 安装和启动

```bash
npm install
npm run serve
```

打开：`http://localhost:8081`。

`vue.config.js` 里配置了：

```js
devServer: {
  port: 8081,
  proxy: {
    '/api': {
      target: 'http://localhost:8080'
    }
  }
}
```

所以本地开发时，页面请求 `/api/...` 会自动代理到后端。

### 生产构建

```bash
npm run build
```

产物在 `dist/`。

## 部署

前端只部署 `dist` 静态文件，接口由 Nginx 反代到后端。

### 1. 上传

把本地 `dist` 里面的内容上传到：

```text
/var/www/blog/dist/
```

最终结构：

```text
/var/www/blog/dist/
├── index.html
├── js/
├── css/
├── fonts/
├── img/
└── favicon.ico
```

不要上传成 `/var/www/blog/dist/dist/index.html`。

### 2. 权限

```bash
sudo chown -R www-data:www-data /var/www/blog
sudo find /var/www/blog -type d -exec chmod 755 {} \;
sudo find /var/www/blog -type f -exec chmod 644 {} \;
```

### 3. Nginx

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name <域名> www.<域名>;

    root /var/www/blog/dist;
    index index.html;
    client_max_body_size 50m;

    location ^~ /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /sitemap.xml {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

HTTPS：

```bash
sudo certbot --nginx -d <域名> -d www.<域名> \
  --redirect --agree-tos -m <邮箱> --no-eff-email
```

## 更新前端

```bash
npm run build
```

用新的 `dist` 内容覆盖 `/var/www/blog/dist`，再执行一次权限设置即可。静态文件覆盖后一般不用重启 Nginx。

## 说明

- 前端不保存任何密钥，接口地址统一走同源 `/api`。
- 登录 token 存在浏览器 localStorage，评论、留言、订阅等接口需要登录态。
- 项目基于 Vue 2，构建时会有 bundle 体积警告，属于正常现象。
