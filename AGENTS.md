## 项目导航

- 首次接手项目时阅读 `README.md`，了解项目结构、本地预览、认证契约和后端接入点；运行时版本及检查命令以 `.node-version`、`package.json` 和配置文件为准。
- 修改工作台 UI 或接后端前，阅读 `docs/workbench/status.md`，沿用已确认的设计取舍、业务 Mock 边界及联调计划；阶段历史在 `docs/workbench/history.md`。
- 修改页面、图表、弹层或视觉检查工具时，阅读 `docs/workbench/visual-qa.md`，按实际交互状态验证；设计基线与规范化例外以 `docs/workbench/visual-baseline.json` 为准。
- 代码审查时阅读 `CODING_STANDARDS.md`；检查失败时保留失败批次，依据其 `manifest.json`、截图和日志定位原因。

## 协作资料

- 需求、规格与任务：`.scratch/`，格式见 `docs/agents/issue-tracker.md`。该目录不提交；可持续共享的状态与决策放在 `docs/`。
- 需求分诊：使用 `docs/agents/triage-labels.md` 中的五类标签。
- 领域术语与架构决策：根目录 `GLOSSARY.md`、`docs/adr/`，使用约定见 `docs/agents/domain.md`。
