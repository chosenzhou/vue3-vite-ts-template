# Vue H5 Template

可复制后独立开发的 Vue 3 响应式 H5 最小模板，面向普通手机和桌面浏览器。提供账号密码登录、登录守卫、用户会话、最小首页和 404；具体项目按需添加业务页面、图表或平台 JS-SDK。

保留 Vue 3、TypeScript、Vite 8、Vue Router 5、Pinia 4、Quasar 2、SCSS 和 alova 3，使用 pnpm 和 Playwright。模板不包含后端、演示账号或运行时 Mock；测试仅在 HTTP 边界拦截后端响应。

## 开始开发

使用 [.node-version](./.node-version) 指定的 Node 26.13.0 和 [package.json](./package.json) 指定的 pnpm 12.18.0：

```bash
pnpm install --frozen-lockfile
pnpm dev
```

默认访问 `http://localhost:5173`。未登录时首页会跳转 `/login`；无需后端即可查看登录页和公开的 404 页面。实际登录需要下面的后端接口。

需要更改本地配置时再复制环境示例；已有 `.env` 时直接编辑，不要覆盖：

```bash
cp .env.example .env
```

新项目复制后独立维护，模板后续修复按需手动同步。模块职责和扩展方式见[工程指南](./docs/template-plan.md)。

## 环境配置

| 变量                    | 默认值                  | 说明                                                                                |
| ----------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`     | `/api`                  | 站内 API 前缀或 HTTP(S) 绝对地址，不能包含凭证、查询参数或 hash；站内前缀不能为 `/` |
| `VITE_API_PROXY_TARGET` | `http://localhost:8080` | 开发服务器的后端代理目标，不含凭证                                                  |
| `VITE_PORT`             | `5173`                  | 开发端口，1 至 65535 的整数                                                         |

默认开发请求 `/api/auth/login` 会代理为 `http://localhost:8080/auth/login`，移除 `/api` 前缀。使用绝对 API 地址时浏览器直接请求该地址，不走本地代理，后端需允许相应跨域请求。

本地 `.env` 文件受 Git 忽略，`.env.example` 可以提交。`VITE_` 变量会公开到前端构建环境，不应存放密码、应用 Secret、私钥或后端签名凭证。

## 后端契约

接口路径相对于 API 基址。响应直接返回下面的数据，不预设额外的 `data` 或业务状态码包裹层。

### 登录

`POST /auth/login`，JSON 请求：

```json
{ "username": "your-account", "password": "your-password" }
```

成功响应：

```json
{
  "token": "backend-issued-token",
  "user": {
    "id": "1",
    "displayName": "用户名",
    "email": "user@example.com"
  }
}
```

`token`、用户 `id` 和 `displayName` 为非空字符串；`email`、`avatar` 可选。登录请求不携带已有 token。以上仅说明字段，不提供可用账号。

### 当前用户与退出

| 接口                | 请求                                          | 成功响应                                         |
| ------------------- | --------------------------------------------- | ------------------------------------------------ |
| `GET /users/me`     | `Authorization: Bearer <token>`               | 直接返回用户资料，与登录响应中的 `user` 结构一致 |
| `POST /auth/logout` | `Authorization: Bearer <token>`，无业务请求体 | 可返回 `204 No Content`                          |

错误使用标准 HTTP 状态码，JSON 错误体可含 `message`、`code`、`details`。非 JSON 错误提供默认 HTTP 提示；登录 401 只显示登录错误，其他受保护请求的 401 统一结束失效会话。

### 会话行为

- 登录成功保存 token 到 `localStorage`，用户资料保存在内存，密码不持久化。登录成功处理会返回原本站内地址；外链、登录页自身或无效地址回退首页。
- 刷新或重新打开后，使用 `/users/me` 验证本地 token；验证成功前不显示受保护内容。有 token 不等于已验证登录。
- 恢复遇到网络故障、5xx 或无效用户响应时保留待验证凭证，显示错误并允许重试；401 则清除会话并进入登录页。
- 退出立即清理本地会话并进入登录页，即使后端退出失败也不保留本地身份。会话版本隔离旧请求响应，避免旧 401 清除新登录。
- 模板没有 token 刷新、角色权限或跨标签页实时同步协议；接入后端时按项目需要扩展。

## 验证

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm exec playwright install chromium
E2E_PORT=5185 pnpm test:e2e
```

E2E 运行真实页面、路由、请求与会话存储，在 HTTP 边界拦截响应。测试服务器使用默认 `/api` 配置；开发服务器已运行或使用自定义 API 地址时，选择未占用的独立 `E2E_PORT`，避免复用其配置。测试输出位于忽略的 `test-results/`；失败重试可保留 trace。

当前验证覆盖手机和桌面基础布局、登录成功及失败、安全返回、会话恢复与重试、并发失效、退出和迟到响应。真实后端尚需在具体项目中联调。

## 构建与部署

```bash
pnpm build
pnpm preview
```

构建产物位于 `dist/`。`preview` 用于本地检查构建结果；Vite 开发代理不属于生产部署，需要部署服务为 API 配置反向代理，或在构建时指定绝对 API 基址。

生产使用 HTTPS。Vue Router 使用 History 模式，直接访问 `/login` 等应用路径需回退 `index.html`；API 路径应先交给后端，不能被页面回退吞掉。以默认 `/api` 且后端不含该前缀为例：

```nginx
location /api/ {
  proxy_pass http://backend/;
}

location / {
  try_files $uri $uri/ /index.html;
}
```
