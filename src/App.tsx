import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type OutputFormat = "base64" | "hex";
type KeyFormat = "raw" | "base64";

// localStorage keys
const STORAGE_KEY = "aes_key";
const STORAGE_KEY_FORMAT = "aes_key_format";
const STORAGE_OUTPUT_FORMAT = "aes_output_format";

function App() {
  const [plaintext, setPlaintext] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [key, setKey] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [keyFormat, setKeyFormat] = useState<KeyFormat>(
    () => (localStorage.getItem(STORAGE_KEY_FORMAT) as KeyFormat) || "base64"
  );
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(
    () => (localStorage.getItem(STORAGE_OUTPUT_FORMAT) as OutputFormat) || "base64"
  );
  const [error, setError] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // 保存密钥到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, key);
  }, [key]);

  // 保存密钥格式到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FORMAT, keyFormat);
  }, [keyFormat]);

  // 保存输出格式到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_OUTPUT_FORMAT, outputFormat);
  }, [outputFormat]);

  // 计算实际密钥长度（Base64解码后）
  function getActualKeyLength(): number {
    if (keyFormat === "base64") {
      try {
        // Base64解码后的长度约为原始长度的3/4
        const padding = (key.match(/=/g) || []).length;
        return Math.floor((key.length * 3) / 4) - padding;
      } catch {
        return 0;
      }
    }
    return key.length;
  }

  function isValidKeyLength(): boolean {
    const len = getActualKeyLength();
    return [16, 24, 32].includes(len);
  }

  async function handleEncrypt() {
    if (!plaintext || !key) {
      setError("请输入明文和密钥");
      return;
    }
    if (!isValidKeyLength()) {
      setError(`密钥解码后长度必须为16、24或32字节（当前: ${getActualKeyLength()}字节）`);
      return;
    }
    setError("");
    setIsEncrypting(true);
    try {
      const result = await invoke<string>("aes_encrypt", {
        plaintext,
        key,
        keyFormat,
        outputFormat,
      });
      setCiphertext(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsEncrypting(false);
    }
  }

  async function handleDecrypt() {
    if (!ciphertext || !key) {
      setError("请输入密文和密钥");
      return;
    }
    if (!isValidKeyLength()) {
      setError(`密钥解码后长度必须为16、24或32字节（当前: ${getActualKeyLength()}字节）`);
      return;
    }
    setError("");
    setIsDecrypting(true);
    try {
      const result = await invoke<string>("aes_decrypt", {
        ciphertext,
        key,
        keyFormat,
        inputFormat: outputFormat,
      });
      setPlaintext(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsDecrypting(false);
    }
  }

  function handleSwap() {
    const temp = plaintext;
    setPlaintext(ciphertext);
    setCiphertext(temp);
  }

  function handleClear() {
    setPlaintext("");
    setCiphertext("");
    setKey("");
    setError("");
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 静默处理
    }
  }

  return (
    <main className="app-container">
      <div className="glass-card">
        <header className="header">
          <div className="logo-icon">🔐</div>
          <h1>AES 加解密工具</h1>
          <p className="subtitle">AES/ECB/PKCS5Padding</p>
        </header>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="key-section">
          <label className="label">
            <span className="label-icon">🔑</span>
            密钥
            <span className="key-format-hint">
              {keyFormat === "base64" ? "(Base64编码)" : "(原始字符串)"}
            </span>
          </label>
          <div className="key-input-wrapper">
            <input
              type="text"
              className="key-input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={keyFormat === "base64" ? "请输入Base64编码的密钥..." : "请输入密钥..."}
            />
            <span className={`key-length ${isValidKeyLength() ? "valid" : ""}`}>
              {getActualKeyLength()}字节
            </span>
          </div>
          <div className="key-format-toggle">
            <button
              className={`key-format-btn ${keyFormat === "base64" ? "active" : ""}`}
              onClick={() => setKeyFormat("base64")}
            >
              Base64密钥
            </button>
            <button
              className={`key-format-btn ${keyFormat === "raw" ? "active" : ""}`}
              onClick={() => setKeyFormat("raw")}
            >
              原始字符串
            </button>
          </div>
        </div>

        <div className="format-section">
          <label className="label">
            <span className="label-icon">📝</span>
            输出格式
          </label>
          <div className="format-toggle">
            <button
              className={`format-btn ${outputFormat === "base64" ? "active" : ""}`}
              onClick={() => setOutputFormat("base64")}
            >
              Base64
            </button>
            <button
              className={`format-btn ${outputFormat === "hex" ? "active" : ""}`}
              onClick={() => setOutputFormat("hex")}
            >
              Hex
            </button>
          </div>
        </div>

        <div className="text-section">
          <div className="text-box">
            <label className="label">
              <span className="label-icon">📄</span>
              明文
            </label>
            <textarea
              className="text-area"
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="请输入要加密的文本..."
              rows={5}
            />
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(plaintext)}
              title="复制"
            >
              📋
            </button>
          </div>

          <div className="action-buttons">
            <button
              className="action-btn encrypt-btn"
              onClick={handleEncrypt}
              disabled={isEncrypting}
            >
              {isEncrypting ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                <>
                  <span>加密</span>
                  <span className="arrow">↓</span>
                </>
              )}
            </button>
            <button className="action-btn swap-btn" onClick={handleSwap}>
              ⇅
            </button>
            <button
              className="action-btn decrypt-btn"
              onClick={handleDecrypt}
              disabled={isDecrypting}
            >
              {isDecrypting ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                <>
                  <span>解密</span>
                  <span className="arrow">↑</span>
                </>
              )}
            </button>
          </div>

          <div className="text-box">
            <label className="label">
              <span className="label-icon">🔒</span>
              密文
            </label>
            <textarea
              className="text-area"
              value={ciphertext}
              onChange={(e) => setCiphertext(e.target.value)}
              placeholder="加密后的密文将显示在这里..."
              rows={5}
            />
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(ciphertext)}
              title="复制"
            >
              📋
            </button>
          </div>
        </div>

        <button className="clear-btn" onClick={handleClear}>
          🗑️ 清空所有
        </button>
      </div>
    </main>
  );
}

export default App;
