# 账号密码认证与会话契约

通用 H5 模板保留最小账号密码认证骨架，替代企业微信 OAuth 流程及 ADR-0007 的平台认证约定。登录请求为 `POST /auth/login`，提交 `{ username, password }` 并接收 `{ token, user }`；`GET /users/me` 获取当前用户，`POST /auth/logout` 退出登录。前端通过 Bearer token 调用受保护接口。

登录回调指登录成功后保存会话并返回原本访问的站内页面，不保留 OAuth 专用回调路由。沿用 `localStorage` 保存 token，普通刷新及重新打开页面可恢复凭证；本地存在 token 不等于已验证的会话，恢复时须向后端确认。密码不持久化，模板不预设 token 刷新协议。

相较于默认不包含认证，这保留了新业务常用的登录守卫和用户会话；相较于预设平台 OAuth 或 Cookie 会话，则沿用现有 Bearer token 集成方式，后续项目仍可按后端要求替换。以上选择于 2026-11-13 讨论中确认，接口字段及当前行为见 [README](../../README.md)。
