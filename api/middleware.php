<?php
/**
 * INGOT API Middleware
 * Authentication and authorization helpers
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';

/**
 * Start session if not already started
 */
function startSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated(): bool {
    startSession();
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Get current user ID
 */
function getCurrentUserId(): ?int {
    startSession();
    return $_SESSION['user_id'] ?? null;
}

/**
 * Get current user data
 */
function getCurrentUser(): ?array {
    if (!isAuthenticated()) {
        return null;
    }
    
    $userId = getCurrentUserId();
    $db = getDB();
    
    $stmt = $db->prepare('
        SELECT u.id, u.email, u.display_name, u.created_at, u.updated_at
        FROM users u
        WHERE u.id = ?
    ');
    $stmt->execute([$userId]);
    
    return $stmt->fetch() ?: null;
}

/**
 * Get user roles
 */
function getUserRoles(int $userId): array {
    $db = getDB();
    
    $stmt = $db->prepare('SELECT role FROM user_roles WHERE user_id = ?');
    $stmt->execute([$userId]);
    
    return array_column($stmt->fetchAll(), 'role');
}

/**
 * Check if current user has a specific role
 */
function hasRole(string $role): bool {
    $userId = getCurrentUserId();
    if (!$userId) {
        return false;
    }
    
    $roles = getUserRoles($userId);
    return in_array($role, $roles);
}

/**
 * Check if current user is admin
 */
function isAdmin(): bool {
    return hasRole('admin');
}

/**
 * Check if current user is moderator
 */
function isModerator(): bool {
    return hasRole('moderator') || hasRole('admin');
}

/**
 * Require authentication middleware
 */
function requireAuth(): void {
    if (!isAuthenticated()) {
        sendUnauthorized('Authentication required');
    }
}

/**
 * Require admin role middleware
 */
function requireAdmin(): void {
    requireAuth();
    
    if (!isAdmin()) {
        sendForbidden('Admin privileges required');
    }
}

/**
 * Require moderator role middleware
 */
function requireModerator(): void {
    requireAuth();
    
    if (!isModerator()) {
        sendForbidden('Moderator privileges required');
    }
}

/**
 * Set authenticated session
 */
function setAuthSession(int $userId, string $email, string $displayName = ''): void {
    startSession();
    
    // Regenerate session ID to prevent session fixation
    session_regenerate_id(true);
    
    $_SESSION['user_id'] = $userId;
    $_SESSION['email'] = $email;
    $_SESSION['display_name'] = $displayName;
    $_SESSION['logged_in_at'] = time();
}

/**
 * Clear authenticated session
 */
function clearAuthSession(): void {
    startSession();
    
    $_SESSION = [];
    
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }
    
    session_destroy();
}

/**
 * Get request method
 */
function getRequestMethod(): string {
    return strtoupper($_SERVER['REQUEST_METHOD']);
}

/**
 * Get query parameter
 */
function getQueryParam(string $name, $default = null) {
    return $_GET[$name] ?? $default;
}

/**
 * Route request to appropriate handler based on method
 */
function routeRequest(array $handlers): void {
    $method = getRequestMethod();
    
    if (!isset($handlers[$method])) {
        sendError('Method not allowed', 405);
    }
    
    $handlers[$method]();
}
