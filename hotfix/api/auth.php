<?php
declare(strict_types=1);
/**
 * INGOT API - Authentication Endpoints
 * 
 * Endpoints:
 * - POST ?action=login           - Sign in with username/password
 * - POST ?action=change_password - Change password (forced on first login)
 * - POST ?action=logout          - Sign out
 * - GET  ?action=session         - Get current session/user data
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/audit.php';

$action = getQueryParam('action', '');

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'change_password':
        handleChangePassword();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'session':
        handleSession();
        break;
    case 'request_password_reset':
        handleRequestPasswordReset();
        break;
    default:
        sendError('Invalid action', 400);
}

/**
 * Check rate limiting for login attempts
 */
function checkRateLimit(string $ip): bool {
    $db = getDB();
    
    // Clean old entries (older than 15 minutes)
    $stmt = $db->prepare('DELETE FROM rate_limits WHERE created_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)');
    $stmt->execute();
    
    // Count recent attempts
    $stmt = $db->prepare('SELECT COUNT(*) as attempts FROM rate_limits WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)');
    $stmt->execute([$ip]);
    $result = $stmt->fetch();
    
    return $result['attempts'] < 5; // Max 5 attempts per minute
}

/**
 * Record login attempt for rate limiting
 */
function recordLoginAttempt(string $ip): void {
    $db = getDB();
    $stmt = $db->prepare('INSERT INTO rate_limits (ip_address, endpoint) VALUES (?, ?)');
    $stmt->execute([$ip, 'login']);
}

/**
 * Handle user login (username-based for Login Prime 1)
 */
function handleLogin(): void {
    if (getRequestMethod() !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    // Check rate limiting
    if (!checkRateLimit($ip)) {
        logAuditEvent('login_rate_limited', null, ['ip' => $ip]);
        sendError('Too many login attempts. Please wait before trying again.', 429);
    }
    
    $data = getJsonBody();
    
    // Accept either 'username' or 'email' field for backwards compatibility
    $identifier = trim($data['username'] ?? $data['email'] ?? '');
    $password = $data['password'] ?? '';
    
    if (empty($identifier) || empty($password)) {
        recordLoginAttempt($ip);
        sendValidationError(['username' => 'Username and password are required']);
    }
    
    $db = getDB();
    
    // Find user by username OR email
    $stmt = $db->prepare('
        SELECT id, email, username, password_hash, display_name, must_change_password 
        FROM users 
        WHERE username = ? OR email = ?
    ');
    $stmt->execute([$identifier, strtolower($identifier)]);
    $user = $stmt->fetch();
    
    if (!$user) {
        recordLoginAttempt($ip);
        logAuditEvent('login_failed', null, ['identifier' => $identifier, 'reason' => 'user_not_found']);
        sendError('Invalid username or password', 401);
    }
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        recordLoginAttempt($ip);
        logAuditEvent('login_failed', $user['id'], ['reason' => 'invalid_password']);
        sendError('Invalid username or password', 401);
    }
    
    // Set session
    setAuthSession($user['id'], $user['email'], $user['display_name'] ?? '');
    
    // Get user roles
    $roles = getUserRoles($user['id']);
    
    // Get profile with profile_completed status
    $stmt = $db->prepare('SELECT * FROM profiles WHERE user_id = ?');
    $stmt->execute([$user['id']]);
    $profile = $stmt->fetch();
    
    logAuditEvent('login_success', $user['id']);
    
    sendSuccess([
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'username' => $user['username'],
            'display_name' => $user['display_name'],
            'must_change_password' => (bool)$user['must_change_password']
        ],
        'profile' => $profile,
        'roles' => $roles
    ], 'Login successful');
}

/**
 * Handle password change (enforced on first login)
 */
function handleChangePassword(): void {
    if (getRequestMethod() !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    requireAuth();
    
    $data = getJsonBody();
    $currentPassword = $data['current_password'] ?? '';
    $newPassword = $data['new_password'] ?? '';
    
    if (empty($currentPassword) || empty($newPassword)) {
        sendValidationError(['password' => 'Current and new password are required']);
    }
    
    // Validate password strength (256-bit equivalent security)
    // Must be 12+ chars, uppercase, lowercase, number, special char
    $errors = [];
    if (strlen($newPassword) < 12) {
        $errors[] = 'Password must be at least 12 characters';
    }
    if (!preg_match('/[A-Z]/', $newPassword)) {
        $errors[] = 'Password must contain at least one uppercase letter';
    }
    if (!preg_match('/[a-z]/', $newPassword)) {
        $errors[] = 'Password must contain at least one lowercase letter';
    }
    if (!preg_match('/[0-9]/', $newPassword)) {
        $errors[] = 'Password must contain at least one number';
    }
    if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $newPassword)) {
        $errors[] = 'Password must contain at least one special character';
    }
    
    if (!empty($errors)) {
        sendError(implode('. ', $errors), 400);
    }
    
    $userId = getCurrentUserId();
    $db = getDB();
    
    // Verify current password
    $stmt = $db->prepare('SELECT password_hash FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
        logAuditEvent('password_change_failed', $userId, ['reason' => 'invalid_current_password']);
        sendError('Current password is incorrect', 401);
    }
    
    // Update password and clear must_change_password flag
    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $db->prepare('UPDATE users SET password_hash = ?, must_change_password = FALSE, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$newHash, $userId]);
    
    logAuditEvent('password_changed', $userId);
    
    // Return updated user data
    $stmt = $db->prepare('SELECT id, email, username, display_name, must_change_password FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $updatedUser = $stmt->fetch();
    
    sendSuccess([
        'user' => [
            'id' => $updatedUser['id'],
            'email' => $updatedUser['email'],
            'username' => $updatedUser['username'],
            'display_name' => $updatedUser['display_name'],
            'must_change_password' => false
        ]
    ], 'Password changed successfully');
}

/**
 * Handle user logout
 */
function handleLogout(): void {
    if (getRequestMethod() !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $userId = getCurrentUserId();
    if ($userId) {
        logAuditEvent('logout', $userId);
    }
    
    clearAuthSession();
    
    sendSuccess([], 'Logout successful');
}

/**
 * Handle session check
 */
function handleSession(): void {
    if (getRequestMethod() !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    if (!isAuthenticated()) {
        sendSuccess([
            'authenticated' => false,
            'user' => null,
            'profile' => null,
            'roles' => []
        ], 'No active session');
        return;
    }
    
    $db = getDB();
    $userId = getCurrentUserId();
    
    // Get user with must_change_password
    $stmt = $db->prepare('SELECT id, email, username, display_name, must_change_password FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        clearAuthSession();
        sendSuccess([
            'authenticated' => false,
            'user' => null,
            'profile' => null,
            'roles' => []
        ], 'Session invalid');
        return;
    }
    
    $roles = getUserRoles($userId);
    
    // Get profile with profile_completed
    $stmt = $db->prepare('SELECT * FROM profiles WHERE user_id = ?');
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();
    
    sendSuccess([
        'authenticated' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'username' => $user['username'],
            'display_name' => $user['display_name'],
            'must_change_password' => (bool)$user['must_change_password']
        ],
        'profile' => $profile,
        'roles' => $roles
    ], 'Session active');
}

/**
 * Handle password reset request (from users who forgot their password)
 */
function handleRequestPasswordReset(): void {
    if (getRequestMethod() !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    // Rate limit password reset requests
    if (!checkRateLimit($ip)) {
        sendError('Too many requests. Please wait before trying again.', 429);
    }
    
    $data = getJsonBody();
    $username = trim($data['username'] ?? '');
    
    if (empty($username)) {
        sendError('Username is required', 400);
    }
    
    $db = getDB();
    
    // Find user by username
    $stmt = $db->prepare('SELECT id, username, display_name FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    // Always return success to prevent username enumeration
    // But only create request if user exists
    if ($user) {
        // Check if there's already a pending request
        $stmt = $db->prepare('SELECT id FROM password_reset_requests WHERE user_id = ? AND status = ?');
        $stmt->execute([$user['id'], 'pending']);
        $existing = $stmt->fetch();
        
        if (!$existing) {
            // Create password reset request
            $stmt = $db->prepare('
                INSERT INTO password_reset_requests (user_id, requested_at, status)
                VALUES (?, NOW(), ?)
            ');
            $stmt->execute([$user['id'], 'pending']);
            
            logAuditEvent('password_reset_requested', $user['id'], ['ip' => $ip]);
        }
    }
    
    recordLoginAttempt($ip); // Still record for rate limiting
    
    sendSuccess([], 'If your username exists in our system, your administrator has been notified of your password reset request.');
}
