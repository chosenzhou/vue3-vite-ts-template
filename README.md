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

## 销售工作台页面

本次业务页面沿用现有认证入口 `/`，登录后可从「打开工作台」或「我的」底部导航进入工作台。企业微信工作台也可直接配置业务页地址，未登录时由原路由守卫引导授权。

| 路由         | 页面                                                 |
| ------------ | ---------------------------------------------------- |
| `/workbench` | 工作台首页与数据模块目录                             |
| `/sales`     | 销售看板；可用 `?period=today\|week\|month` 指定周期 |
| `/goals`     | 月度目标、团队与品类进度                             |
| `/profile`   | 我的，保留真实用户加载和退出登录                     |

小于 1024px 使用底部三项导航；销售作为二级页面隐藏底部导航。桌面保留可折叠侧栏，销售采用 12 列栅格，目标采用分栏布局。

设计实现以 `design/DESIGN.md`、HTML 及独立 CSS/JS 为基线。PNG 中与源码不同的旧版功能入口未纳入；状态演示卡转为实际请求状态组件。`/charts` 和原认证回调路由继续保留。

### 第一阶段业务数据

本次需求对 ADR-0003 的模板级 Mock 禁令采用限定例外：仅业务快照使用 `src/services/workbench/mock.ts`，不引入 Mock 服务或额外依赖。OAuth、用户、JS-SDK 和 401 重登继续调用原真实后端。

`src/services/workbench/types.ts` 定义业务契约，页面通过 `workbenchRepository` 读取数据。接后端时在 `src/services/workbench/index.ts` 将实现切换为 `createWorkbenchApi({ sales: '已确认的销售接口', goals: '已确认的目标接口' })`；该适配器复用原 alova 请求封装。销售响应中每个客户榜条目包含自身的客户资料，不依赖数组位置匹配客户。

当前用户姓名和头像来自 `/users/me`，角色及组织为设计稿的演示展示字段，不参与权限判断。预测的 108.7%、8,149 万等字段按原稿保留，尚未确定一致的全月预测计算口径，不在前端推导。

### 设计色板

`src/assets/styles/_palette.scss` 是六色设计色板的唯一来源：Quasar 主色直接引用，`workbench.scss` 从同一色板生成 CSS token；图表通过 `readWorkbenchTheme()` 读取这些 token，不再单独维护颜色常量。

### 页面验证

`pnpm test:e2e` 包含原认证回归和新增页面用例。测试通过拦截认证接口建立会话，不使用生产认证绕过逻辑。四页覆盖 320、360、390、430、600、820、1024、1366、1440、1920px；390px 和 1440px 截图保存至 `test-results/`。

真实企业微信内置浏览器、OAuth 后端和 JS-SDK 原生能力仍需在目标环境联调。

## 本地设计预览与视觉验收

启动 `pnpm dev` 后，打开 `http://localhost:5173/__preview/workbench`，或在默认开发首页点击「预览工作台」。预览内的导航、销售入口与返回会始终停留在 `/__preview/` 下，四个页面不需要后端登录即可查看。

预览复用真实 Vue 页面，只在开发环境注册。个人资料使用独立的设计稿样例，不写入会话、不修改原有 token、不请求用户或授权接口；正式业务路由仍受原守卫保护。生产构建不注册预览路由，也不显示预览按钮。

当前交付状态、已确认基线和后续待办统一维护在[工作台状态](docs/workbench/status.md)。视觉检查与证据格式见[检查说明](docs/workbench/visual-qa.md)，历史修复和人工验收记录见[历史记录](docs/workbench/history.md)。

```bash
pnpm test:visual
```

该命令自动启动或复用开发服务，检查四页及客户详情的手机/PC布局、关键文字样式和像素差异；超阈值、缺失元素或页面报错时失败。每次结果写入独立批次，包含代码指纹、浏览器、字体、视口、采集时间及整页/弹层/图表局部对照。打开`http://localhost:5173/artifacts/visual-qa/index.html`查看最新检查和历史验收。

GitHub Actions已配置锁定依赖安装、类型/Lint/构建、E2E及视觉检查，上传机器结果和视觉证据。工作流位置为[checks.yml](.github/workflows/checks.yml)，远端执行状态以仓库Checks为准。
