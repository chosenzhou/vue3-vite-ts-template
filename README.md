# Vue H5 Template

我维护的 Vue 3 + TypeScript H5 项目模板，面向普通手机和桌面浏览器，可复制后独立开发。

我把模板的默认范围控制在项目启动所需的基础能力：响应式布局、账号密码登录、路由守卫、用户会话、首页和 404 页面。业务页面、图表及微信、企业微信等平台能力，交给具体项目按需扩展。

## 功能与范围

- **页面与布局**：使用 Quasar 构建手机和桌面共用的响应式界面，提供登录页、首页和公开的 404 页面。
- **账号认证**：账号密码登录、表单校验、提交反馈、错误提示，以及登录后的安全站内返回。
- **会话管理**：持久化 token，刷新后验证凭证，恢复失败可重试，退出时立即清理本地身份。
- **请求处理**：统一注入 Bearer token、解析 HTTP 错误，并处理受保护请求的 401 响应。
- **异步隔离**：通过会话版本识别过期请求，避免旧响应覆盖新登录状态。
- **工程检查**：TypeScript、ESLint、Playwright、工具回归测试及 GitHub Actions。

模板仅包含前端，不提供后端服务、可用的演示账号或运行时 Mock。token 刷新、角色权限和跨标签页实时同步协议，需要按实际后端契约扩展。

## 技术栈

| 用途       | 技术                               |
| ---------- | ---------------------------------- |
| 应用框架   | Vue 3、TypeScript                  |
| 开发与构建 | Vite 8、pnpm                       |
| 路由与状态 | Vue Router 5、Pinia 4              |
| 界面与样式 | Quasar 2、SCSS                     |
| HTTP 请求  | alova 3                            |
| 代码检查   | ESLint、vue-tsc                    |
| 自动化测试 | Playwright、Node.js 内置测试执行器 |

具体依赖及版本范围见 [package.json](./package.json)，安装时以 `pnpm-lock.yaml` 为准。

## 开始开发

### 环境要求

- Node.js **26.13.0**，版本记录在 [.node-version](./.node-version)。
- pnpm **12.18.0**，版本记录在 [package.json](./package.json) 的 `packageManager` 字段。

### 安装与启动

```bash
git clone git@github.com:chosenzhou/vue3-vite-ts-template.git
cd vue3-vite-ts-template
pnpm install --frozen-lockfile
pnpm dev
```

默认访问 <http://localhost:5173>。未登录访问首页时，会跳转至 `/login`。

无需启动后端即可查看登录页和 404 页面；完成登录、恢复会话和退出请求需要接入下文约定的后端接口。

### 本地配置

默认配置可直接启动项目。需要调整 API 地址、代理目标或端口时，再创建本地环境文件：

```bash
cp .env.example .env
```

已有 `.env` 时直接编辑，请勿覆盖。本地配置方法见[环境配置](#环境配置)。

### 复用方式

新项目复制后独立维护，模板后续修复按需手动同步。添加页面、接口或平台能力前，建议先阅读[开发指南](./docs/development.md)。

## 项目结构

```text
src/
  main.ts            应用入口与插件初始化
  App.vue            应用布局与会话恢复反馈
  config.ts          API 基址解析
  views/             登录、首页和 404 页面
  router/            路由、登录守卫与页面标题
  services/
    http.ts          HTTP 客户端与认证通知
    auth.ts          登录、恢复、退出及会话失效处理
    api/             接口路径、请求参数与返回类型
    model/           接口与应用共享的类型
  stores/            用户会话状态
  utils/             站内返回地址等纯函数
  types/             环境声明与框架类型扩展
  assets/styles/     基础样式
scripts/eslint/      模块依赖边界规则
tests/
  e2e/               页面、认证与会话行为测试
  tooling/           ESLint 规则与测试服务隔离回归
docs/                开发指南、协作约定与架构决策
.github/workflows/   CI 检查
```

API 和模型从具体模块直接导入。公共组件、组合逻辑和领域术语按实际复用需求增加，不预建占位目录。构建产物、测试产物、本地任务和 CodeGraph 索引均受 Git 忽略。

## 环境配置

| 变量                    | 默认值                  | 说明                                                                                |
| ----------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`     | `/api`                  | 站内 API 前缀或 HTTP(S) 绝对地址；不能包含凭证、查询参数或 hash，站内前缀不能为 `/` |
| `VITE_API_PROXY_TARGET` | `http://localhost:8080` | 开发服务器的后端代理目标，不含凭证                                                  |
| `VITE_PORT`             | `5173`                  | 开发端口，取值为 1 至 65535 的整数                                                  |

默认情况下，开发请求 `/api/auth/login` 会移除 `/api` 前缀，代理至 `http://localhost:8080/auth/login`。

当 `VITE_API_BASE_URL` 使用绝对地址时，浏览器直接请求该地址，不经过本地代理，后端需配置相应的跨域访问规则。

本地 `.env` 文件受 Git 忽略，`.env.example` 用于共享配置示例。`VITE_` 变量会公开到前端构建环境，请勿存放密码、应用 Secret、私钥或后端签名凭证。

## 后端契约

以下接口路径均相对于 `VITE_API_BASE_URL`。成功响应直接返回约定的数据，不额外包裹 `data` 或业务状态码。实际后端采用其他结构时，应在通信或接口边界完成适配。

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

`token`、用户 `id` 和 `displayName` 必须为非空字符串，`email`、`avatar` 为可选字段。登录请求不携带已有 token；示例中的账号、密码和 token 仅用于说明字段。

### 当前用户与退出

| 接口                | 请求                                          | 成功响应                                         |
| ------------------- | --------------------------------------------- | ------------------------------------------------ |
| `GET /users/me`     | `Authorization: Bearer <token>`               | 直接返回用户资料，结构与登录响应中的 `user` 一致 |
| `POST /auth/logout` | `Authorization: Bearer <token>`，无业务请求体 | 可返回 `204 No Content`                          |

### 错误响应

错误使用标准 HTTP 状态码，JSON 错误体可包含 `message`、`code` 和 `details`。客户端使用字符串类型的 `message` 作为错误提示，缺少有效消息时回退为 `HTTP <状态码>`，并通过 `ApiError` 暴露状态码及响应体。

登录接口的 401 由登录页展示错误；其他受保护请求的 401 统一结束失效会话并跳转至登录页。

### 会话行为

| 场景           | 处理方式                                                             |
| -------------- | -------------------------------------------------------------------- |
| 登录成功       | 将 token 保存至 `localStorage`，用户资料保存在内存，密码不持久化     |
| 登录后返回     | 返回原本站内地址；外链、登录页自身、无法识别的路由或无效地址回退首页 |
| 刷新或重新打开 | 调用 `/users/me` 验证本地 token，验证通过前不显示受保护内容          |
| 恢复失败       | 网络故障、5xx 或无效用户响应保留待验证凭证，展示错误并允许重试       |
| 凭证失效       | 401 清除会话，跳转登录页并保留原目标地址                             |
| 主动退出       | 立即清理本地会话并进入登录页，后端退出失败不恢复本地身份             |
| 旧请求迟到     | 校验请求所属的会话版本，避免旧成功响应或旧 401 影响新会话            |

本地存在 token 只表示持有凭证，不代表会话已经通过验证。认证模块仅合并同一会话版本的恢复请求；默认关闭 alova GET 缓存和请求共享，当前用户请求同时关闭浏览器 HTTP 缓存。

## 验证

安装依赖后，在项目根目录执行：

```bash
pnpm typecheck
pnpm lint
pnpm exec playwright install chromium
pnpm test:tooling
pnpm build
pnpm test:e2e
```

首次运行测试前需安装 Chromium；工具回归中的服务复用测试也会使用浏览器。浏览器已安装时可跳过安装命令。

### 测试覆盖

E2E 运行真实页面、路由、请求客户端和会话存储，仅在 HTTP 边界拦截响应。覆盖登录成功与失败、表单反馈、安全返回、会话恢复与重试、并发失效、退出、迟到响应，以及手机和桌面的基础布局。真实后端仍需在具体项目中联调。

工具回归使用 Node.js 内置测试执行器，检查 ESLint 模块边界和 E2E 服务隔离。ESLint 约束 HTTP、API 和认证协调层的直接依赖，覆盖别名、相对路径、转导出和字符串动态导入；允许的模块关系见[开发指南](./docs/development.md)。

### 测试服务与失败排查

E2E 默认独立启动 `5180` 端口的测试服务器，固定使用 `/api` 配置，不复用 `5173` 开发服务。可通过 `E2E_PORT` 指定其他端口；端口被占用时直接报错，不终止原服务。

本地调试需要复用已配置好的服务时，显式设置 `E2E_REUSE_SERVER=1` 和对应端口。复用时不会覆盖原服务的环境变量，CI 始终禁用复用。

失败的 E2E 会在受 Git 忽略的 `test-results/` 中保留 trace，可通过以下命令查看：

```bash
pnpm exec playwright show-trace <trace.zip>
```

### 持续集成

GitHub [Checks 工作流](./.github/workflows/checks.yml)在 push、Pull Request 或手动触发时执行，读取项目声明的 Node.js 与 pnpm 版本，冻结安装依赖，并运行类型检查、lint、工具回归、构建及 E2E。

失败时上传测试产物，保留 14 天，可从 Actions 下载后查看 trace。检查状态以对应提交的实际运行结果为准。

## 构建与部署

```bash
pnpm build
pnpm preview
```

构建产物位于 `dist/`，`preview` 用于本地检查构建结果。

生产环境使用 HTTPS。Vite 开发代理不随构建产物发布，部署时需要为 API 配置反向代理，或在构建时指定绝对 API 基址。

Vue Router 使用 History 模式，直接访问 `/login` 等应用路径时，服务器需回退到 `index.html`。API 路径应先转发给后端，避免被页面回退规则处理。

以默认 `/api` 前缀、后端路由不含该前缀为例，Nginx 配置如下：

```nginx
location /api/ {
  proxy_pass http://backend/;
}

location / {
  try_files $uri $uri/ /index.html;
}
```

## 开发文档

- [开发指南](./docs/development.md)：模块职责、添加页面与 API、平台能力接入及验证方式。
- [审查标准](./CODING_STANDARDS.md)：异步认证结果的会话归属与副作用检查。
- [ADR-0008](./docs/adr/0008-generic-h5-starter-scope.md)：通用 H5 最小模板的范围与复用方式。
- [ADR-0009](./docs/adr/0009-password-authentication-contract.md)：账号密码认证与会话契约。

## 许可证

本项目采用 [MIT License](./LICENSE)。
