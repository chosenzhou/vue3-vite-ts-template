# 华康医药 · 企业微信 H5 销售数据看板 — 设计规范

> 本文档描述原型的视觉与交互规范，供 Codex CLI 用 **Quasar 2 + SCSS + ECharts 6** 复刻实现时参照。
> 入口文件：`index.html`；Open Design 预览使用单文件注册入口，样式与脚本已内联，避免拆分资源在预览沙箱中失效。`css/app.css` 与 `js/app.js` 是源码分层副本，用于迁移到 Vue/Quasar 工程时参考；迁移实现以其为准，不直接复制内联产物。

---

## 1. 设计系统基线（Quasar 注册规范）

| 维度 | 规范 |
| --- | --- |
| 色板 | 6 色注册色板（见 §2），品类色为 accent 透明度梯度衍生，禁止引入色板外新色相 |
| 字体 | Inter（回退栈 `system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif`），原型未引 CDN，实现时按项目字体方案加载 |
| 圆角 | 组件 8px（`--radius`），小元素 4px（`--radius-sm`），胶囊/圆点 99px |
| 描边 | 1px `--border`；图表网格线 `rgba(217,222,231,.7)` |
| 网格 | 8px 基准（间距 8 / 12 / 16 / 24），页面左右留白 `--pad-x: 16px` |
| 数字 | 全部数值容器加 `.num`（`font-variant-numeric: tabular-nums`）保证对齐 |
| 动效 | 时长 180–380ms、缓动 ease-out；`prefers-reduced-motion` 全量降级 |

---

## 2. Design Tokens（`css/app.css` `:root`）

### 2.1 色彩语义映射（6 色注册色板 → 语义变量）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--accent` | `#1677ff` | 主色：主按钮、选中态、图表主色、涨跌幅(涨) |
| `--bg` | `#ffffff` | 页面背景 |
| `--surface` / `--card` | `#f7f8fa` | 卡片背景 |
| `--border` / `--line` | `#d9dee7` | 1px 描边、分隔、进度槽 |
| `--fg` | `#111111` | 主文字 |
| `--muted` / `--down` | `#6b7280` | 次级文字、跌跌幅(跌) |

### 2.2 品类色（accent 梯度 + 中性灰，色板内衍生）

```
--cat-1 rgba(22,119,255,1)     化学药制剂
--cat-2 rgba(22,119,255,.64)   中成药
--cat-3 rgba(22,119,255,.42)   中药饮片
--cat-4 rgba(22,119,255,.26)   医疗器械
--cat-5 rgba(107,114,128,.45)  其他品类（灰）
```

### 2.3 功能色与布局常量

```
--tint    rgba(22,119,255,.08)   选中底色 / 图表面积填充(.10)
--up-bg   rgba(22,119,255,.08)   涨幅底
--down-bg rgba(107,114,128,.10)  跌幅底
--pad-x 16px · --content-max 1200px · --tabbar-h 56px
--sb-w 232px（侧边栏） · --sb-w-min 64px（折叠）
```

---

## 3. 字体阶梯

| 用途 | 字号/字重 | 示例 |
| --- | --- | --- |
| 页面标题 `.page-title` | 21px / 700 | 工作台 |
| 卡片标题 `.card-title` | 15px / 600 | 销售趋势 |
| KPI 数值 `.kpi-value strong` | 26px / 700 | 5,432.8 |
| 辅助说明 `.card-sub` / `.eyebrow` | 11px / muted | 近7日 · 单位：万元 |
| 正文/列表 | 14px / 400–500 | 客户名 |
| 标签/徽标 | 11–12px / 500–600 | 建设中 |

---

## 4. 断点与双端布局

| 断点 | 布局 |
| --- | --- |
| `<768`（手机） | 桌面侧边栏默认 `display:none`；底部 TabBar（56px + safe-area）；`page-body` 单列；销售二级页 `position:fixed` 自右推入覆盖 TabBar |
| `≥768`（平板过渡） | 结构同手机，仅放宽栅格 |
| `≥1024`（PC） | 显示左侧可折叠侧边栏（232px / 折叠 64px，`body.sb-collapsed`），TabBar 隐藏；页头吸顶；内容 `max-width:1200px` 居中；销售二级页改 `position:absolute` 覆盖主内容区（侧边栏保留 + 面包屑），页内 grid 12 列：趋势 8 列、品类环形 4 列、客户榜全宽（榜单行追加订单量/完成率列 `.rank-ord/.rank-rate`） |
| `≤359`（小屏） | KPI 单列、订单/完成率徽标隐藏、概览条 1+1 布局；优先保证 320px 无横向滚动 |

### 滚动与返回
- 应用框架按视口定高；`.screen-head` 与 `.sub-head` 固定在顶部，`.page-body` 独立纵向滚动。
- 移动端底部 TabBar 固定；安全区通过 `env(safe-area-inset-bottom)` 注入框架底部、正文底部和弹层底部，不额外绘制状态栏或 Home Indicator。
- 销售页打开时焦点进入返回按钮，主屏与 TabBar 隔离；返回后焦点回到「销售数据」入口。
- TabBar/侧边栏切换重置当前页滚动位置；客户详情关闭后焦点优先还原到触发行，异常场景回退到榜单容器。

### 返回行为
- 移动端：二级页左上返回箭头 / Esc；关闭后焦点回到工作台「销售数据」模块卡。
- PC 端：同上，但侧边栏始终可用（不被 inert）。
- 二级页打开时：三个 `.screen` 与 `.tabbar` 设 `inert`，防误触与焦点逃逸。

---

## 5. 组件规范

### 5.1 页面框架
- **侧边栏**：仅 `min-width:1024px` 显示；品牌区（盾形 logo + 华康医药/销售数据平台）+ 3 项导航（工作台/目标进度/我的）+ 底部折叠按钮；选中态 accent 左指示 + tint 底；折叠时只显图标。移动端由底部 TabBar 接管，避免侧边栏挤压正文。
- **TabBar**：3 个等分按钮，图标 20px + 文字 10px；选中 accent；`env(safe-area-inset-bottom)` 内边距。
- **页头**：eyebrow（日期/登录态）+ 页面标题，吸顶白底。
- **免登启动页 `.splash`**：logo + 标题 + 验证文案 + 三点 loading + 免登提示，1.5s 后淡出（reduced 500ms）。仅示意，不接真实 OAuth。

### 5.2 工作台
- **本月概览条 `.overview-strip`**：卡片按钮，3 项统计（销售额/订单量/完成率）+ 右箭头，点击 `openSales('month')`。
- **数据模块目录 `.hub-grid`**：2 列（≥768 3 列）卡片，图标 22px + 名称 + 一句 desc；状态徽标 `.hub-badge`：「建设中」灰底 /「无权限」锁图标灰底（`.is-lock` 整卡置灰）。销售数据可直接进入，其余点击弹 toast。

### 5.3 销售二级页
- **周期切换 `.seg`**：胶囊分段（今日/本周/本月），选中白底 + 描边 + accent 文字；`aria-pressed` 同步。
- **KPI 三联 `.kpi-grid`**：标签 + 大数 + 单位 + 涨跌 `.delta`（涨 `↑ 8.2%` accent、跌 `↓ 1.8pt` muted）。
- **趋势图**：SVG 折线 + 面积填充（`--tint` 加深为 .10），坐标网格 3 条，末点强调圆点；宽度自适应（容器 `clientWidth`，clamp 300–880，PC 高 210/坐标字号 11px），`ResizeObserver` 防抖 140ms 重绘；点按气泡 tooltip（深底白字圆角），`<title>` 兜底。
- **品类环形 `.donut-row`**：108×108 环形（13px 环宽，rotate -90 起点，段间留 1.4 间隙）+ 中心「本期销售额/总额」+ 图例（色点/名称/占比+金额）。
- **客户榜 `.rank-row`**：8 家客户；名次徽标（1–3 accent 系，其余灰）；名称 + 行业、金额 + 涨跌；默认 TOP5，「查看全部 8 家客户」展开/收起（`aria-expanded`）；行点击开客户详情弹层。PC 端追加订单量、完成率两列。

### 5.4 目标进度
- **英雄卡 `.hero-card`**：132×132 进度环（11px 环宽，`pathLength=100`，动画从 0 → 72.4%）+ 侧栏预测文案（预测达成 108.7%）+ 4 项统计（月度目标/已完成/剩余目标/日均需完成）。
- **进度列表 `.prog-item`**（团队 ×4、品类 ×4）：名称+百分比 / 6px 圆角进度槽 + accent 填充 / 「已完成 X 万 / 目标 Y 万」；品类项名前带色点 `.dot-mark`。

### 5.5 我的
- 个人卡（头像「陈」+ 姓名 + 角色徽标 + 组织）+ 设置列表（帮助与反馈按钮、版本信息）。
- **页面状态设计演示卡**（原型专用，供实现参照）：4 段 seg 切换——
  - 加载中：`.sk-line` 骨架条 shimmer（宽度 38/86/72/60%）
  - 空数据：盒子图标 + 「暂无数据」+ 说明 + 次按钮
  - 请求失败：警告图标 + 说明 + 主按钮「重新加载」
  - 无权限：锁图标 + 说明 + 主按钮「申请权限」
  - 按钮规范：`.btn`（32px 高、8px 圆角）；`.btn-primary` accent 白字；`.btn-ghost` 白底描边。

### 5.6 弹层与反馈
- **客户详情 `.sheet`**：移动端底部抽屉（grip + 标题 + 行业 chip + 关闭钮），PC 端居中对话框（≥1024 宽 440px）；内容 = 近7日迷你走势（335×64 sparkline）+ 4 项统计（销售额/订单量/客单价/完成率）+ 演示声明；打开时焦点入关闭钮，Esc/scrim 关闭后焦点还原。
- **Toast `#toast`**：底部居中深底圆角条，1.6s 自动消失（建设中/无权限/演示按钮反馈）。

---

## 6. 数字与文案规范

- 金额：万元一位小数，千分位 `toLocaleString('zh-CN')`（如 `5,432.8 万`）；订单量为整数千分位。
- 完成率/涨跌：一位小数；涨 `↑`、跌 `↓` + 百分比或 `pt`（率差）。
- 空态/失败/无权限文案见 §5.5；toast 文案：「『X』建设中，当前演示开放销售数据」「『X』暂无访问权限，请联系管理员开通」。

---

## 7. Mock 数据声明（`js/app.js`）

全部数据为前端写死的演示数据，**不来自真实接口**；字段结构按 alova 请求返回体设计，便于替换：

| 常量 | 结构 |
| --- | --- |
| `DASH` | 按 `today/week/month` 三周期：KPI(销售/订单/完成率+3 组 delta)、趋势序列(labels+values+副标题)、品类占比(pcts+amts)、客户榜 rank(8 家：amt/delta/orders/rate) |
| `CUSTOMERS` | 8 家客户：name/cat/spark(7 点走势系数) |
| `TEAMS` / `CAT_PROG` | 团队与品类目标进度：name/pct/done/target(+color) |

演示基准：今日 186.5万/342单/66.6%，本周 1286.4万/1798/71.2%，本月 5432.8万/7652/72.4%；月目标 7,500 万、剩 2,067.2 万、剩 18 天、日均需 114.8 万、预测 108.7%。

---

## 8. ECharts 6 主题映射

| 原型元素 | ECharts 配置 |
| --- | --- |
| 折线 + 面积 | `series.line`，`lineStyle.color=#1677ff`、`areaStyle.color='rgba(22,119,255,.10)'`、`symbol` 末点强调、`smooth:false` |
| 网格线 | `splitLine.lineStyle.color='rgba(217,222,231,.7)'` |
| 轴文字 | 11px `#6b7280` |
| 环形图 | `series.pie`，`radius:['62%','88%']`，色序 = `--cat-1..5`，`itemStyle.borderWidth` 白色 2px 代替段间隙，中心 `graphic.text` 总额 |
| 迷你走势 | `grid` 紧凑 + 隐藏轴，同折线主题 |
| tooltip | `backgroundColor:#111`、`borderRadius:6`、白字 11px |

---

## 9. Quasar 2 实现映射

| 原型结构 | Quasar 组件建议 |
| --- | --- |
| 页面框架（侧边栏 + 内容 + TabBar） | `q-layout` + `q-drawer`(show-if-above, mini 可折叠) + `q-page-container` + `q-footer`(`q-tabs`) |
| 卡片 | `q-card`（`flat` + 自定义 1px border，背景 `--surface`） |
| 周期/状态切换 seg | `q-btn-toggle`（`unelevated` + 自定义胶囊样式） |
| 客户详情弹层 | `q-dialog`（移动 `position="bottom"`，PC 默认居中） |
| 加载骨架 | `q-skeleton`（text/rect 组合替代 `.sk-line`） |
| 进度条 | `q-linear-progress`（6px 圆角轨道自定义） |
| 进度环 | `q-circular-progress`（`pathLength` 动画等价 `indeterminate`→值过渡） |
| Toast | `Quasar.notify`（`position="bottom"` 深底） |
| 涨跌徽标 | `q-badge`（transparent 底 + 语义色） |
| 列表行 | `q-item` / 自定义 button 行（保持 `.num` 对齐） |

---

## 10. 交互清单（验收对照）

1. TabBar/侧边栏切换 3 屏，两套导航 `aria-current` 同步，切屏有 180ms 淡入。
2. 概览条 → 打开销售页并预选「本月」；模块卡「销售数据」→ 打开并保持当前周期。
3. 周期 seg 切换：KPI 数字 tween、delta 更新、趋势/环形/客户榜全部重绘并重置为 TOP5。
4. 趋势图点位点击出气泡，再点收起；窗口缩放防抖重绘。
5. 客户榜展开/收起 8 家；行点击开详情抽屉（sparkline + 4 统计）。
6. 「建设中」「无权限」模块点击弹 toast。
7. 我的页状态演示 4 段切换，演示按钮触发 toast。
8. 目标环首次进入目标页播放 0 → 72.4% 动画（仅一次）。
9. 二级页打开时主屏与 TabBar `inert`；Esc / 返回钮 / scrim 关闭并还原焦点。
10. `prefers-reduced-motion` 下所有动画瞬时完成。

## 11. 原型交付与迁移说明

1. Open Design 预览入口 `index.html` 必须保持单文件自包含（CSS/JS 内联），不能只保留结构并引用外部资源。
2. 新增 Vue/Quasar 工程后，以 `css/app.css` 的 token 规则和 `js/app.js` 的交互状态机作为实现来源，交付时替换内联副本。
3. 预览统计使用 `scrollWidth`、`clientWidth` 与元素可见性，不依赖固定窗口截图；每次改版至少回归 320、375、1024、1440 四档宽度。
