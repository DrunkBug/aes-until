// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use aes::cipher::{generic_array::GenericArray, BlockDecrypt, BlockEncrypt, KeyInit};
use aes::{Aes128, Aes192, Aes256};
use base64::{
    alphabet,
    engine::{general_purpose, DecodePaddingMode, GeneralPurpose, GeneralPurposeConfig},
    Engine,
};

/// 标准Base64引擎（用于编码和严格解码）
const BASE64: GeneralPurpose = general_purpose::STANDARD;

/// 宽松的Base64解码引擎（兼容Apache Commons Codec）
/// 忽略padding位验证，与Java的Base64.decodeBase64()行为一致
const BASE64_LENIENT: GeneralPurpose = GeneralPurpose::new(
    &alphabet::STANDARD,
    GeneralPurposeConfig::new()
        .with_decode_padding_mode(DecodePaddingMode::Indifferent)
        .with_decode_allow_trailing_bits(true),
);

/// PKCS7/PKCS5 填充（AES块大小为16字节，PKCS5和PKCS7在此场景下等效）
fn pkcs7_pad(data: &[u8], block_size: usize) -> Vec<u8> {
    let padding_len = block_size - (data.len() % block_size);
    let mut padded = data.to_vec();
    padded.extend(vec![padding_len as u8; padding_len]);
    padded
}

/// PKCS7/PKCS5 去填充
fn pkcs7_unpad(data: &[u8]) -> Result<Vec<u8>, String> {
    if data.is_empty() {
        return Err("数据为空".to_string());
    }
    let padding_len = data[data.len() - 1] as usize;
    if padding_len == 0 || padding_len > 16 {
        return Err("无效的填充长度".to_string());
    }
    // 验证填充是否正确
    for i in 0..padding_len {
        if data[data.len() - 1 - i] != padding_len as u8 {
            return Err("填充验证失败".to_string());
        }
    }
    Ok(data[..data.len() - padding_len].to_vec())
}

/// AES/ECB 加密
fn aes_ecb_encrypt_raw(plaintext: &[u8], key: &[u8]) -> Result<Vec<u8>, String> {
    let padded = pkcs7_pad(plaintext, 16);
    let mut ciphertext = Vec::with_capacity(padded.len());

    match key.len() {
        16 => {
            let cipher = Aes128::new(GenericArray::from_slice(key));
            for chunk in padded.chunks(16) {
                let mut block = GenericArray::clone_from_slice(chunk);
                cipher.encrypt_block(&mut block);
                ciphertext.extend_from_slice(&block);
            }
        }
        24 => {
            let cipher = Aes192::new(GenericArray::from_slice(key));
            for chunk in padded.chunks(16) {
                let mut block = GenericArray::clone_from_slice(chunk);
                cipher.encrypt_block(&mut block);
                ciphertext.extend_from_slice(&block);
            }
        }
        32 => {
            let cipher = Aes256::new(GenericArray::from_slice(key));
            for chunk in padded.chunks(16) {
                let mut block = GenericArray::clone_from_slice(chunk);
                cipher.encrypt_block(&mut block);
                ciphertext.extend_from_slice(&block);
            }
        }
        _ => return Err(format!("无效的密钥长度: {}，支持16/24/32字节", key.len())),
    }

    Ok(ciphertext)
}

/// AES/ECB 解密
fn aes_ecb_decrypt_raw(ciphertext: &[u8], key: &[u8]) -> Result<Vec<u8>, String> {
    if ciphertext.len() % 16 != 0 {
        return Err("密文长度必须是16的倍数".to_string());
    }

    let mut plaintext = Vec::with_capacity(ciphertext.len());

    match key.len() {
        16 => {
            let cipher = Aes128::new(GenericArray::from_slice(key));
            for chunk in ciphertext.chunks(16) {
                let mut block = GenericArray::clone_from_slice(chunk);
                cipher.decrypt_block(&mut block);
                plaintext.extend_from_slice(&block);
            }
        }
        24 => {
            let cipher = Aes192::new(GenericArray::from_slice(key));
            for chunk in ciphertext.chunks(16) {
                let mut block = GenericArray::clone_from_slice(chunk);
                cipher.decrypt_block(&mut block);
                plaintext.extend_from_slice(&block);
            }
        }
        32 => {
            let cipher = Aes256::new(GenericArray::from_slice(key));
            for chunk in ciphertext.chunks(16) {
                let mut block = GenericArray::clone_from_slice(chunk);
                cipher.decrypt_block(&mut block);
                plaintext.extend_from_slice(&block);
            }
        }
        _ => return Err(format!("无效的密钥长度: {}，支持16/24/32字节", key.len())),
    }

    pkcs7_unpad(&plaintext)
}

/// 解析密钥：支持 raw（原始字符串）或 base64（Base64编码）格式
fn parse_key(key: &str, key_format: Option<&str>) -> Result<Vec<u8>, String> {
    match key_format.unwrap_or("raw") {
        "base64" => BASE64_LENIENT
            .decode(key)
            .map_err(|e| format!("密钥Base64解码失败: {}", e)),
        _ => Ok(key.as_bytes().to_vec()),
    }
}

/// AES/ECB/PKCS5Padding 加密命令
/// - plaintext: 明文字符串
/// - key: 密钥（支持16/24/32字节）
/// - key_format: 密钥格式 "raw"（原始字符串）或 "base64"（Base64编码，与Java兼容）
/// - output_format: 输出格式 "base64" 或 "hex"
#[tauri::command]
fn aes_encrypt(
    plaintext: &str,
    key: &str,
    key_format: Option<&str>,
    output_format: Option<&str>,
) -> Result<String, String> {
    let key_bytes = parse_key(key, key_format)?;
    let encrypted = aes_ecb_encrypt_raw(plaintext.as_bytes(), &key_bytes)?;

    match output_format.unwrap_or("base64") {
        "hex" => Ok(hex::encode(&encrypted)),
        _ => Ok(BASE64.encode(&encrypted)),
    }
}

/// AES/ECB/PKCS5Padding 解密命令
/// - ciphertext: 密文字符串（Base64或Hex编码）
/// - key: 密钥（支持16/24/32字节）
/// - key_format: 密钥格式 "raw"（原始字符串）或 "base64"（Base64编码，与Java兼容）
/// - input_format: 输入格式 "base64" 或 "hex"
#[tauri::command]
fn aes_decrypt(
    ciphertext: &str,
    key: &str,
    key_format: Option<&str>,
    input_format: Option<&str>,
) -> Result<String, String> {
    let key_bytes = parse_key(key, key_format)?;

    let encrypted_bytes = match input_format.unwrap_or("base64") {
        "hex" => hex::decode(ciphertext).map_err(|e| format!("Hex解码失败: {}", e))?,
        _ => BASE64
            .decode(ciphertext)
            .map_err(|e| format!("Base64解码失败: {}", e))?,
    };

    let decrypted = aes_ecb_decrypt_raw(&encrypted_bytes, &key_bytes)?;

    String::from_utf8(decrypted).map_err(|e| format!("UTF-8解码失败: {}", e))
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, aes_encrypt, aes_decrypt])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
