<?php
declare(strict_types=1);
/**
 * INGOT API Configuration
 * Database connection and global settings
 */

// Require PHP 8.4 or higher
if (version_compare(PHP_VERSION, '8.4.0', '<')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'PHP 8.4 or higher required. Current version: ' . PHP_VERSION
    ]);
    exit;
}

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Timezone
date_default_timezone_set('America/Toronto');

// Session settings
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) ? '1' : '0');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.gc_maxlifetime', '86400'); // 24 hours

// Database Configuration - IONOS Production
// ============================================================================
// MIGRATION INSTRUCTIONS: To move to a different host, either:
//   1. Set environment variables in your hosting panel (recommended):
//      DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
//   2. Or update the fallback values below directly
// ============================================================================
define('DB_HOST', getenv('DB_HOST') ?: 'db5019381304.hosting-data.io');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'dbs15164102');
define('DB_USER', getenv('DB_USER') ?: 'dbu4409535');
define('DB_PASS', getenv('DB_PASS') ?: ''); // Set via IONOS environment panel
define('DB_CHARSET', 'utf8mb4');

// Application settings
define('APP_NAME', 'INGOT');
define('APP_URL', getenv('APP_URL') ?: 'https://ingot.watchnexus.ca');
define('API_VERSION', '1.0.0');

// CORS settings
define('ALLOWED_ORIGINS', [
    'https://ingot.watchnexus.ca',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
]);

/**
 * Get PDO database connection
 */
function getDB(): PDO {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                DB_HOST,
                DB_PORT,
                DB_NAME,
                DB_CHARSET
            );
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            
        } catch (PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Database connection failed'
            ]);
            exit;
        }
    }
    
    return $pdo;
}

/**
 * Set CORS headers
 */
function setCorsHeaders(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Set JSON content type header
 */
function setJsonHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
}

// Apply headers
setCorsHeaders();
setJsonHeaders();
