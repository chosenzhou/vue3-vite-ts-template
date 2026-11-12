# WeCom Workbench H5 Template

面向企业微信「工作台 → 自建应用」的 Vue 3 响应式 Web 模板。生产目标只包含企业微信手机端与桌面端内置浏览器；普通浏览器仅用于本地开发、调试和自动化测试。

## 技术栈

- Vue 3 + TypeScript
- Vite 8
- Vue Router 5（History 模式）
- Pinia 4
- alova 3 + fetch adapter
- Quasar 2（一套响应式 UI，覆盖手机与桌面）
- SCSS
- ECharts 6 + vue-echarts（按需注册）
- Playwright E2E

## 快速开始

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## 环境变量

| 变量                    | 说明                                      |
| ----------------------- | ----------------------------------------- |
| `VITE_API_BASE_URL`     | 前端请求 API 前缀，默认 `/api`            |
| `VITE_API_PROXY_TARGET` | 本地开发代理目标                          |
| `VITE_PORT`             | 本地开发端口                              |
| `VITE_WECOM_CORP_ID`    | 企业微信 CorpID，仅 JS-SDK 初始化兜底使用 |
| `VITE_WECOM_AGENT_ID`   | 自建应用 AgentID，仅 JS-SDK 使用          |

`CorpID`、`Secret`、通讯录密钥和 ticket 均不得进入前端环境变量。

## 认证契约

### 创建授权入口

```http
POST /auth/entry
```

请求：

```json
{ "redirect": "/profile" }
```

响应：

```json
{ "authorizationUrl": "https://open.weixin.qq.com/connect/oauth2/authorize?..." }
```

后端负责生成企业微信 OAuth URL、CorpID、AgentID、可信回调地址与初始 state。前端会保留目标路由并覆写 `state`，用于回调后返回原页面。

### 回调登录

企业微信回调到 `/auth/callback/wecom` 后：

```http
POST /auth/wecom
```

请求：

```json
{ "code": "..." }
```

响应：

```json
{
  "token": "...",
  "user": { "id": "...", "displayName": "...", "provider": "wecom" }
}
```

其他接口：

- `POST /auth/logout`
- `GET /users/me`

`401` 会清除本地会话并重新请求授权入口。错误响应使用标准 HTTP 状态码：

```json
{ "message": "Human readable message", "code": "MACHINE_CODE" }
```

## JS-SDK

JS-SDK 默认不初始化。需要原生能力时按需调用：

```ts
const ww = await useWecomJssdk(['getExternalContact']);
```

签名接口：

```http
GET /jssdk/signature?client=wecom&url=https%3A%2F%2Fexample.com%2Fpath
```

响应：

```json
{
  "appId": "ww-or-agent-app-id",
  "timestamp": 1760000000,
  "nonceStr": "random",
  "signature": "signature",
  "agentId": "agent-id",
  "corpId": "corp-id"
}
```

## 部署

- 企业微信自建应用工作台入口指向 H5 首页或后端授权入口。
- OAuth 回调域名配置为 `https://your-domain/auth/callback/wecom`。
- History 路由需要所有应用路径回退 `index.html`。
- 生产环境必须启用 HTTPS。
- 配置企业微信可信域名与 JS-SDK 安全域名。

Nginx 示例：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 常用命令

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm typecheck
pnpm test:e2e
```
