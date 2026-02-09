# UI 优化方案：macOS 26 未来感风格

## 设计理念 (Design Philosophy)
基于 macOS 现有的设计语言（Big Sur / Sonoma）进行推演，"macOS 26" 风格将更加强调：
1.  **光学质感 (Optical Material)**：超越普通的毛玻璃，模拟真实的光线折射与色散，强调“厚度”与“通透感”。
2.  **沉浸式暗色 (Immersive Dark)**：使用纯度极高的“黑曜石”色调，而非传统的“深蓝灰”，配合高饱和度的霓虹微光。
3.  **无边界感 (Boundless)**：减少明显的边框线条，更多依赖光影和层级来区分内容。
4.  **原生排版 (Native Typography)**：强制使用系统级字体 (SF Pro)，确保在 Mac 上的绝对原生体验。

## 修改计划 (Implementation Plan)

### 1. 核心变量重构 (`:root`)
- **字体**: 切换为 `-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`。
- **色板**:
    - 背景色: 更加深邃的 `#000000` 或紧贴 `#050505`。
    - 强调色: 使用荧光感更强的青色 (Cyan) 与 靛蓝 (Indigo) 渐变。
    - 玻璃材质: 调整透明度与模糊半径 (`blur(40px)` -> `blur(60px)`)。

### 2. 组件样式升级
- **主卡片 (`.glass-card`)**:
    - 增加混合模式边框，模拟玻璃边缘的高光。
    - 引入 `backdrop-filter: blur(60px) saturate(180%)` 增强背景透出的色彩鲜艳度。
- **输入框 (`input`, `textarea`)**:
    - 移除默认边框，改为“凹陷”视觉效果（深色背景 + 内部阴影）。
    - 聚焦时产生柔和的光晕扩散，而非锐利的边框。
- **按钮 (`button`)**:
    - 采用全胶囊 (Pill-shape) 设计。
    - 增加“液态”光泽感，点击时有明确的缩放 (Scale) 动画。

### 3. 给用户的视觉“Wow”点
- **动态背景**: 使用 CSS Mesh Gradient 创建缓慢流动的极光背景。
- **微交互**: 所有的 Hover 状态都将带有平滑的 `transition`，模拟物理阻尼。

## 任务清单 (Task List)
- [ ] **重写 CSS 变量**: 定义 macOS 26 专属色板与材质参数。
- [ ] **升级全局背景**: 实现动态极光流体背景。
- [ ] **重构玻璃卡片**: 实现“光学玻璃”质感。
- [ ] **优化表单控件**: 输入框与按钮的现代化改造。
- [ ] **排版微调**: 调整字重与间距，符合 Apple Human Interface Guidelines。

请审核该设计方案。如果同意，我将直接开始修改代码。
