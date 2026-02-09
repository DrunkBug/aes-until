# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AES ECB encryption/decryption desktop tool built with **Tauri 2 + React 19 + TypeScript + Vite 7**. The Rust backend (`src-tauri/`) performs AES/ECB/PKCS5Padding crypto operations; the React frontend (`src/`) provides the UI. Package manager is **pnpm**.

## Commands

```bash
# Development (launches both Vite dev server and Tauri window)
pnpm tauri dev

# Build production bundle (macOS .app / .dmg, etc.)
pnpm tauri build

# Frontend only (Vite dev server on port 1420, no Tauri window)
pnpm dev

# Type-check + build frontend only
pnpm build

# Rust checks (run from src-tauri/)
cd src-tauri && cargo check
cd src-tauri && cargo clippy
cd src-tauri && cargo test

# Single Rust test
cd src-tauri && cargo test <test_name>
```

## Architecture

### Tauri command flow

```
React (invoke) ──IPC──> Rust #[tauri::command] ──> Result<String, String> ──IPC──> React
```

Two Tauri commands are registered in `src-tauri/src/lib.rs`:
- `aes_encrypt(plaintext, key, key_format?, output_format?)` — encrypts with AES/ECB/PKCS5Padding
- `aes_decrypt(ciphertext, key, key_format?, input_format?)` — decrypts

The frontend calls them via `invoke()` from `@tauri-apps/api/core`.

### Rust backend (`src-tauri/src/lib.rs`)

All crypto logic is in a single file. Key internal functions:
- `pkcs7_pad` / `pkcs7_unpad` — manual PKCS7 padding (block size 16)
- `aes_ecb_encrypt_raw` / `aes_ecb_decrypt_raw` — raw AES-ECB using the `aes` crate, dispatching on key length (128/192/256)
- `parse_key` — key input as raw UTF-8 string or Base64-decoded bytes
- Two Base64 engines: strict (`BASE64`) for encoding, lenient (`BASE64_LENIENT`) for decoding to match Java/Apache Commons Codec behavior

Crate name is `aes_lib` (set in `Cargo.toml [lib]`) to avoid conflict with the `aes` dependency.

### React frontend (`src/`)

Single-component app in `App.tsx`. State: plaintext, ciphertext, key, key/output format. Settings (key, formats) are persisted to `localStorage`. No routing, no state management library.

### Tauri config

- `src-tauri/tauri.conf.json` — app identifier `com.osake.aes`, window 800x600, Vite dev URL `localhost:1420`
- `src-tauri/capabilities/default.json` — `core:default` + `opener:default` permissions

## Key Dependencies (Rust)

- `aes 0.8` — AES block cipher
- `base64 0.22` — Base64 encode/decode
- `hex 0.4` — hex encode/decode
- `serde` / `serde_json` — serialization for Tauri IPC

## Conventions

- UI text and error messages are in Chinese.
- The project uses ECB mode intentionally (tool for testing/debugging AES-ECB scenarios, not for production crypto).
