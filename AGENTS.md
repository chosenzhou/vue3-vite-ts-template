## 项目导航

- 首次接手：阅读 [README](./README.md)，确认运行环境、接口契约和验证命令。
- 添加页面、API 或调整认证：阅读[工程指南](./docs/template-plan.md)，按模块职责保持请求、认证、会话与导航边界。
- 修改依赖边界或测试启动：核对 [ESLint 配置](./eslint.config.js)、[Playwright 配置](./playwright.config.ts)及[工具回归](./tests/tooling/)，用行为回归验证规则与服务隔离。
- 代码审查：阅读[审查标准](./CODING_STANDARDS.md)；拆分或委派任务：阅读工程指南中的“任务上下文与验证”。
- 调整模板范围或认证方式：阅读 [ADR](./docs/adr/)，保留决策历史；当前定位见 ADR-0008，认证契约见 ADR-0009。

## Agent skills

- Issue tracker：本地规格和任务位于忽略的 `.scratch/`，约定见 [issue tracker](./docs/agents/issue-tracker.md)。共享工程说明放在 `docs/`，不依赖本地任务文件。
- Triage：使用五种标准状态，见 [triage labels](./docs/agents/triage-labels.md)。
- Domain：当前为单一上下文，见 [domain docs](./docs/agents/domain.md)。只有实际业务领域术语才加入 [Glossary](./GLOSSARY.md)。
