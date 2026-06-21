<?php
/**
 * INGOT API Configuration
 * Database connection and global settings
 */

// Error reporting (disable in production)
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Timezone
date_default_timezone_set('America/Toronto');

// Session settings
session_name('INGOT_SESSION');
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.gc_maxlifetime', 28800); // 8 hours
ini_set('session.cookie_lifetime', 28800); // 8 hours

// Database Configuration - IONOS Production
// ============================================================================
// MIGRATION INSTRUCTIONS: To move to a different host, either:
//   1. Set environment variables in your hosting panel (recommended):
//      DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
//   2. Or update the fallback values below directly
// ============================================================================
define('DB_HOST', getenv('DB_HOST') ?: '');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: '');
define('DB_USER', getenv('DB_USER') ?: '');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// Application settings
define('APP_NAME', 'INGOT');
define('APP_URL', getenv('APP_URL') ?: '');
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
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
    header('Access-Control-Expose-Headers: X-CSRF-Token');
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
    // Avoid cached API responses (prevents 304 while debugging/rolling out hotfixes)
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
}

// Apply headers
setCorsHeaders();
setJsonHeaders();

// CSRF validation for state-changing requests with active sessions
if (in_array(getRequestMethod(), ['POST', 'PUT', 'DELETE'])) {
    $skipCsrf = strpos($_SERVER['SCRIPT_NAME'] ?? '', 'auth.php') !== false;
    if (isset($_SESSION['user_id']) && !$skipCsrf) {
        validateCsrfToken();
    }
}
