# 通用 H5 最小模板实施方案

状态：范围、认证契约和测试边界已确认；[正式规格](../.scratch/generic-h5-template/spec.md)已发布为 `ready-for-agent`，当前代码尚未实施改造。

## 目标

复制后独立开发的 Vue H5 骨架。保留现有 Vue、TypeScript、Vite、Vue Router、Pinia、Quasar、SCSS 和 alova，不升级或替换技术栈；移除企业微信 JS-SDK、OAuth、ECharts 和对应示例。平台集成由具体项目后续添加。

## 目录与职责

```text
src/
  main.ts
  App.vue
  router/index.ts
  services/
    http.ts
    auth.ts
    api/auth.ts
    api/user.ts
    model/auth.ts
    model/user.ts
  stores/session.ts
  views/
    home/HomeView.vue
    login/LoginView.vue
    not-found/NotFoundView.vue
  utils/redirect.ts
  types/
    env.d.ts
    router.d.ts
  assets/styles/main.scss
  quasar-variables.scss
```

- `services/http.ts`：alova 客户端、凭证注入、响应解析、显式导出的请求错误。通过配置接收凭证读取及失效回调，不导入 Router、Store 或业务 API。
- `services/api/`：接口地址、参数和返回类型；不操作页面或会话。各模块直接导入所需文件，避免请求层经汇总导出反向依赖 API。
- `services/auth.ts`：统一 `signIn`、`restoreSession`、`signOut` 和失效会话处理；不直接操作路由。恢复会话时合并并发请求，失效处理避免重复触发。
- `stores/session.ts`：保存 token、用户资料及会话验证状态；集中读写本地 token。登录状态由会话状态派生，不维护可独立写入的第三份登录布尔值。
- `router/index.ts`：路由、登录守卫和标题；当前规模保持一个文件。业务首页受保护，登录页和 404 公开。
- `views/`：表单、loading、错误、重试和导航。登录成功处理在会话建立后返回原站内地址，不保留独立 OAuth 回调页面。首页仅展示最小用户信息和退出入口。
- `utils/redirect.ts`：校验登录后返回地址，仅允许安全的站内路由。
- `main.ts`：应用初始化并连接请求失效回调与路由；不承载登录业务实现。
- `types/`：仅放环境声明、框架类型扩展；应用类型随所属模块显式导出。`UserProfile` 独立于认证响应。
- `App.vue` 与样式：保留最小响应式应用壳。没有真实复用需求时不创建空的 `components/`、`composables/`、`layouts/` 或包装 Quasar 的组件。

## 认证行为

接口契约见 [ADR-0009](./adr/0009-password-authentication-contract.md)。访问受保护路由时恢复并验证会话，无凭证或凭证失效则到 `/login?redirect=...`；登录成功保存会话并返回安全的原地址。

登录接口失败只显示登录错误，不再次启动认证。其他受保护接口返回 401 时，统一清除会话并进入登录页；不请求登录接口来自动重新登录。网络故障和服务端错误不直接认定为凭证失效，应允许重试。退出时清理本地会话，即使后端退出请求失败也不继续保留本地登录态。

本地保存 token，用户资料从后端恢复，不保存密码。不内置测试账号、生产 Mock、角色权限系统、多认证提供方或 token 刷新协议。

## 配置与文档

统一 API 地址默认值与环境变量读取，保留本地代理；忽略本地 `.env` 文件但保留 `.env.example`。约束与当前工具链兼容的 Node 版本，保留现有 pnpm 锁文件。移除 Git 对 `.DS_Store` 的跟踪，保留磁盘文件。

同步 README、AGENTS、Glossary 和相关 ADR，说明首次启动、接口契约、方法放置及扩展示例。Glossary 不再把企业微信概念定义为模板的必备领域；没有已定义业务术语时不编造术语。历史 ADR 保留并注明被替代的决策。

先前回滚遗留的本地 `artifacts/` 产物保留在磁盘，作为生成产物忽略，不纳入模板交付。

## 验证与交付

运行 `pnpm typecheck`、`pnpm lint`、`pnpm build` 和已有 Playwright E2E。E2E 使用测试内请求拦截，覆盖登录成功及失败、原路返回、不安全返回地址、刷新后恢复会话、凭证失效、并发 401、退出及 404；检查手机和桌面基础布局。

不恢复已回滚的四页业务 UI 或视觉对照工具。执行时核对依赖、锁文件与运行版本，不额外引入测试或 UI 框架。提交、推送及远端回滚不属于本方案的自动执行步骤。
