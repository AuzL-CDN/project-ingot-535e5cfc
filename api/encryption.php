<?php
/**
 * INGOT API - AES-256-CBC Encryption Helper
 * 
 * Provides 256-bit encryption for sensitive data at rest.
 * Key must be stored in environment variable ENCRYPTION_KEY (32 bytes hex).
 * 
 * Usage:
 *   require_once __DIR__ . '/encryption.php';
 *   $encrypted = encryptData('sensitive text');
 *   $decrypted = decryptData($encrypted);
 */

define('ENCRYPTION_CIPHER', 'aes-256-cbc');
define('ENCRYPTION_KEY_ENV', 'ENCRYPTION_KEY');

/**
 * Get the encryption key from environment
 * Key should be 32 bytes (64 hex characters) for AES-256
 */
function getEncryptionKey(): string {
    $keyHex = getenv(ENCRYPTION_KEY_ENV);
    
    if (!$keyHex) {
        error_log('CRITICAL: ENCRYPTION_KEY environment variable is not set');
        throw new RuntimeException('Encryption key is not configured. Set ENCRYPTION_KEY environment variable.');
    }
    
    return hex2bin($keyHex);
}

/**
 * Encrypt a string using AES-256-CBC
 * 
 * @param string $plaintext The data to encrypt
 * @return string Base64-encoded encrypted data with IV
 */
function encryptData(string $plaintext): string {
    if (empty($plaintext)) {
        return '';
    }
    
    $key = getEncryptionKey();
    $ivLength = openssl_cipher_iv_length(ENCRYPTION_CIPHER);
    $iv = openssl_random_pseudo_bytes($ivLength);
    
    $encrypted = openssl_encrypt(
        $plaintext,
        ENCRYPTION_CIPHER,
        $key,
        OPENSSL_RAW_DATA,
        $iv
    );
    
    if ($encrypted === false) {
        error_log('Encryption failed: ' . openssl_error_string());
        throw new RuntimeException('Encryption failed');
    }
    
    // Combine IV and encrypted data, then base64 encode
    return base64_encode($iv . $encrypted);
}

/**
 * Decrypt a string encrypted with encryptData()
 * 
 * @param string $ciphertext Base64-encoded encrypted data with IV
 * @return string Decrypted plaintext
 */
function decryptData(string $ciphertext): string {
    if (empty($ciphertext)) {
        return '';
    }
    
    $key = getEncryptionKey();
    $data = base64_decode($ciphertext, true);
    
    if ($data === false) {
        error_log('Decryption failed: Invalid base64 encoding');
        throw new RuntimeException('Decryption failed: Invalid encoding');
    }
    
    $ivLength = openssl_cipher_iv_length(ENCRYPTION_CIPHER);
    
    if (strlen($data) < $ivLength) {
        error_log('Decryption failed: Data too short');
        throw new RuntimeException('Decryption failed: Invalid data');
    }
    
    $iv = substr($data, 0, $ivLength);
    $encrypted = substr($data, $ivLength);
    
    $decrypted = openssl_decrypt(
        $encrypted,
        ENCRYPTION_CIPHER,
        $key,
        OPENSSL_RAW_DATA,
        $iv
    );
    
    if ($decrypted === false) {
        error_log('Decryption failed: ' . openssl_error_string());
        throw new RuntimeException('Decryption failed');
    }
    
    return $decrypted;
}

/**
 * Encrypt an array as JSON
 * 
 * @param array $data The array to encrypt
 * @return string Base64-encoded encrypted JSON
 */
function encryptArray(array $data): string {
    $json = json_encode($data, JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        throw new RuntimeException('JSON encoding failed');
    }
    return encryptData($json);
}

/**
 * Decrypt to an array
 * 
 * @param string $ciphertext Base64-encoded encrypted JSON
 * @return array Decrypted array
 */
function decryptArray(string $ciphertext): array {
    if (empty($ciphertext)) {
        return [];
    }
    
    $json = decryptData($ciphertext);
    $data = json_decode($json, true);
    
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        error_log('Decryption JSON parse failed: ' . json_last_error_msg());
        return [];
    }
    
    return $data ?? [];
}

/**
 * Check if a string appears to be encrypted (base64 with proper length)
 * 
 * @param string $data The data to check
 * @return bool True if the data appears to be encrypted
 */
function isEncrypted(string $data): bool {
    if (empty($data)) {
        return false;
    }
    
    // Check if it's valid base64
    $decoded = base64_decode($data, true);
    if ($decoded === false) {
        return false;
    }
    
    // Check minimum length (IV + at least 1 block)
    $ivLength = openssl_cipher_iv_length(ENCRYPTION_CIPHER);
    return strlen($decoded) >= $ivLength + 16;
}

/**
 * Generate a new encryption key (for setup)
 * 
 * @return string 64-character hex string suitable for ENCRYPTION_KEY
 */
function generateEncryptionKey(): string {
    return bin2hex(random_bytes(32));
}

/**
 * Hash sensitive data for comparison (one-way)
 * Uses SHA-256 with application key as pepper
 * 
 * @param string $data The data to hash
 * @return string 64-character hex hash
 */
function hashSensitiveData(string $data): string {
    $key = getEncryptionKey();
    return hash_hmac('sha256', $data, $key);
}
