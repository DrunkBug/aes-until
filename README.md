# AES 加解密工具 (AES Encryption Tool)

一个基于 Tauri + React + Rust 构建的跨平台 AES 加解密工具。提供现代化的用户界面，支持 AES/ECB/PKCS5Padding 标准，专为开发者设计。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tauri](https://img.shields.io/badge/Tauri-v2-orange.svg)
![Rust](https://img.shields.io/badge/Rust-1.75%2B-black.svg)

## ✨ 功能特性

- **标准支持**: 严格采用 `AES/ECB/PKCS5Padding` 加密模式，与 Java/Node.js 等主流语言的标准库兼容。
- **灵活的密钥格式**: 
  - 支持 **原始字符串** (Raw String) 作为密钥。
  - 支持 **Base64 编码** 的密钥输入，方便处理二进制密钥。
  - 自动校验密钥长度（支持 128/192/256 位，即 16/24/32 字节）。
- **多样的输出格式**:
  - 加密结果可选 **Base64** 或 **Hex** (十六进制) 格式。
- **用户体验优化**:
  - 💾 自动记忆：自动保存上次使用的密钥和格式配置（基于本地存储）。
  - 📋 一键复制：方便地复制明文或密文结果。
  - 🔄 快速互换：一键交换明文与密文内容，方便进行解密测试。
  - 🎨 现代化 UI：采用玻璃拟态 (Glassmorphism) 设计风格，简洁美观。

## 🛠️ 技术栈

*   **Frontend**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
*   **Backend**: [Rust](https://www.rust-lang.org/)
*   **Framework**: [Tauri v2](https://tauri.app/)
*   **Styling**: Vanilla CSS (原生 CSS 变量与 Flexbox/Grid 布局)

## 🚀 开发指南

### 环境要求

*   [Rust](https://www.rust-lang.org/tools/install) (建议最新稳定版)
*   [Node.js](https://nodejs.org/) (建议 LTS 版本)
*   包管理器 (推荐 [pnpm](https://pnpm.io/) 或 npm/yarn)

### 安装依赖

```bash
# 安装前端依赖
npm install
# 或
pnpm install
```

### 启动开发环境

```bash
# 启动 Tauri 开发窗口
npm run tauri dev
# 或
pnpm tauri dev
```

首次运行时，Rust 依赖会自动下载并编译，这可能需要几分钟时间。

## 📦 打包构建

构建用于生产环境的应用程序（支持 macOS .app / Windows .exe / Linux .deb）：

```bash
npm run tauri build
# 或
pnpm tauri build
```

构建产物将位于 `src-tauri/target/release/bundle` 目录下。

## 🔒 安全说明

*   **AES/ECB 模式**: 本工具使用 ECB 模式，虽然方便调试和对接旧系统，但在密码学上不如 CBC/GCM 模式安全。**请勿用于传输极度敏感的数据**。
*   **本地处理**: 所有加解密运算均在本地 Rust 后端完成，**不会**上传任何数据到服务器。

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源。
