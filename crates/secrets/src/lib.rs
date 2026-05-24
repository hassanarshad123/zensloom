// unsafe required: Windows DPAPI calls (CryptProtectData/CryptUnprotectData)
// are FFI functions that require unsafe. The unsafe blocks are minimal and
// immediately copy output data before freeing Windows-allocated buffers.
#![allow(unsafe_code)]

use thiserror::Error;

#[derive(Error, Debug)]
pub enum SecretsError {
    #[error("Encryption failed: {0}")]
    EncryptionFailed(String),
    #[error("Decryption failed: {0}")]
    DecryptionFailed(String),
    #[error("Storage I/O error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Serialization error: {0}")]
    Serialization(String),
}

#[cfg(target_os = "windows")]
mod platform {
    use super::SecretsError;
    use std::collections::HashMap;
    use std::path::PathBuf;
    use windows::Win32::Security::Cryptography::{
        CryptProtectData, CryptUnprotectData, CRYPT_INTEGER_BLOB,
    };
    use windows_core::Free;

    fn dpapi_encrypt(plaintext: &[u8]) -> Result<Vec<u8>, SecretsError> {
        let input = CRYPT_INTEGER_BLOB {
            cbData: plaintext.len() as u32,
            pbData: plaintext.as_ptr() as *mut u8,
        };
        let mut output = CRYPT_INTEGER_BLOB {
            cbData: 0,
            pbData: std::ptr::null_mut(),
        };

        // SAFETY: Windows DPAPI call with valid input/output blobs.
        // We immediately copy the output and free the buffer.
        let result = unsafe {
            CryptProtectData(
                &input,
                None,
                None,
                None,
                None,
                0,
                &mut output,
            )
        };

        if result.is_err() {
            return Err(SecretsError::EncryptionFailed(
                "CryptProtectData failed".to_string(),
            ));
        }

        let encrypted = unsafe {
            std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec()
        };

        // DPAPI allocates the output buffer; we must free it with LocalFree.
        // The windows crate v0.60 exposes LocalFree through HLOCAL::free().
        unsafe {
            let mut hlocal = windows::Win32::Foundation::HLOCAL(output.pbData as *mut _);
            hlocal.free();
        }

        Ok(encrypted)
    }

    fn dpapi_decrypt(encrypted: &[u8]) -> Result<Vec<u8>, SecretsError> {
        let input = CRYPT_INTEGER_BLOB {
            cbData: encrypted.len() as u32,
            pbData: encrypted.as_ptr() as *mut u8,
        };
        let mut output = CRYPT_INTEGER_BLOB {
            cbData: 0,
            pbData: std::ptr::null_mut(),
        };

        let result = unsafe {
            CryptUnprotectData(
                &input,
                None,
                None,
                None,
                None,
                0,
                &mut output,
            )
        };

        if result.is_err() {
            return Err(SecretsError::DecryptionFailed(
                "CryptUnprotectData failed".to_string(),
            ));
        }

        let decrypted = unsafe {
            std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec()
        };

        unsafe {
            let mut hlocal = windows::Win32::Foundation::HLOCAL(output.pbData as *mut _);
            hlocal.free();
        }

        Ok(decrypted)
    }

    pub struct SecretStore {
        path: PathBuf,
    }

    impl SecretStore {
        pub fn new(path: PathBuf) -> Self {
            Self { path }
        }

        pub fn store(&self, key: &str, value: &str) -> Result<(), SecretsError> {
            let mut secrets = self.load_all()?;
            secrets.insert(key.to_string(), value.to_string());
            self.save_all(&secrets)
        }

        pub fn load(&self, key: &str) -> Result<Option<String>, SecretsError> {
            let secrets = self.load_all()?;
            Ok(secrets.get(key).cloned())
        }

        pub fn delete(&self, key: &str) -> Result<(), SecretsError> {
            let mut secrets = self.load_all()?;
            secrets.remove(key);
            self.save_all(&secrets)
        }

        pub fn has(&self, key: &str) -> Result<bool, SecretsError> {
            let secrets = self.load_all()?;
            Ok(secrets.contains_key(key))
        }

        fn load_all(&self) -> Result<HashMap<String, String>, SecretsError> {
            if !self.path.exists() {
                return Ok(HashMap::new());
            }
            let encrypted = std::fs::read(&self.path)?;
            if encrypted.is_empty() {
                return Ok(HashMap::new());
            }
            let decrypted = dpapi_decrypt(&encrypted)?;
            let json = String::from_utf8(decrypted)
                .map_err(|e| SecretsError::DecryptionFailed(e.to_string()))?;
            serde_json::from_str(&json)
                .map_err(|e| SecretsError::Serialization(e.to_string()))
        }

        fn save_all(&self, secrets: &HashMap<String, String>) -> Result<(), SecretsError> {
            if let Some(parent) = self.path.parent() {
                std::fs::create_dir_all(parent)?;
            }
            let json = serde_json::to_string(secrets)
                .map_err(|e| SecretsError::Serialization(e.to_string()))?;
            let encrypted = dpapi_encrypt(json.as_bytes())?;
            std::fs::write(&self.path, encrypted)?;
            Ok(())
        }
    }
}

#[cfg(not(target_os = "windows"))]
mod platform {
    use super::SecretsError;
    use std::path::PathBuf;

    pub struct SecretStore {
        _path: PathBuf,
    }

    impl SecretStore {
        pub fn new(path: PathBuf) -> Self {
            Self { _path: path }
        }

        pub fn store(&self, _key: &str, _value: &str) -> Result<(), SecretsError> {
            Err(SecretsError::EncryptionFailed(
                "DPAPI is only available on Windows".to_string(),
            ))
        }

        pub fn load(&self, _key: &str) -> Result<Option<String>, SecretsError> {
            Ok(None)
        }

        pub fn delete(&self, _key: &str) -> Result<(), SecretsError> {
            Ok(())
        }

        pub fn has(&self, _key: &str) -> Result<bool, SecretsError> {
            Ok(false)
        }
    }
}

pub use platform::SecretStore;
