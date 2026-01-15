<?php
/**
 * INGOT API - Authentication Endpoints
 * 
 * Endpoints:
 * - POST ?action=login    - Sign in with email/password
 * - POST ?action=register - Create new account
 * - POST ?action=logout   - Sign out
 * - GET  ?action=session  - Get current session/user data
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/middleware.php';

$action = getQueryParam('action', '');

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'register':
        handleRegister();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'session':
        handleSession();
        break;
    default:
        sendError('Invalid action', 400);
}

/**
 * Handle user login
 */
function handleLogin(): void {
    if (getRequestMethod() !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $data = getJsonBody();
    
    // Validate required fields
    $errors = validateRequired($data, ['email', 'password']);
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    $email = strtolower(trim($data['email']));
    $password = $data['password'];
    
    // Validate email format
    if (!validateEmail($email)) {
        sendError('Invalid email format', 400);
    }
    
    $db = getDB();
    
    // Find user by email
    $stmt = $db->prepare('SELECT id, email, password_hash, display_name FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendError('Invalid email or password', 401);
    }
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        sendError('Invalid email or password', 401);
    }
    
    // Set session
    setAuthSession($user['id'], $user['email'], $user['display_name'] ?? '');
    
    // Get user roles
    $roles = getUserRoles($user['id']);
    
    // Get profile
    $stmt = $db->prepare('SELECT * FROM profiles WHERE user_id = ?');
    $stmt->execute([$user['id']]);
    $profile = $stmt->fetch();
    
    sendSuccess([
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'display_name' => $user['display_name']
        ],
        'profile' => $profile,
        'roles' => $roles
    ], 'Login successful');
}

/**
 * Handle user registration
 */
function handleRegister(): void {
    if (getRequestMethod() !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $data = getJsonBody();
    
    // Validate required fields
    $errors = validateRequired($data, ['email', 'password']);
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    $email = strtolower(trim($data['email']));
    $password = $data['password'];
    $displayName = sanitizeString($data['display_name'] ?? '');
    
    // Validate email format
    if (!validateEmail($email)) {
        sendError('Invalid email format', 400);
    }
    
    // Validate password strength
    if (strlen($password) < 8) {
        sendError('Password must be at least 8 characters', 400);
    }
    
    $db = getDB();
    
    // Check if email already exists
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        sendError('Email already registered', 409);
    }
    
    // Check if this is the first user (make them admin)
    $stmt = $db->prepare('SELECT COUNT(*) as count FROM users');
    $stmt->execute();
    $isFirstUser = $stmt->fetch()['count'] == 0;
    
    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    // Create user
    $stmt = $db->prepare('
        INSERT INTO users (email, password_hash, display_name)
        VALUES (?, ?, ?)
    ');
    $stmt->execute([$email, $passwordHash, $displayName ?: null]);
    
    $userId = $db->lastInsertId();
    
    // If first user, assign admin role
    if ($isFirstUser) {
        $stmt = $db->prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)');
        $stmt->execute([$userId, 'admin']);
    }
    
    // Set session
    setAuthSession($userId, $email, $displayName);
    
    // Get roles
    $roles = getUserRoles($userId);
    
    // Get profile (created by trigger)
    $stmt = $db->prepare('SELECT * FROM profiles WHERE user_id = ?');
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();
    
    sendSuccess([
        'user' => [
            'id' => $userId,
            'email' => $email,
            'display_name' => $displayName
        ],
        'profile' => $profile,
        'roles' => $roles,
        'isFirstUser' => $isFirstUser
    ], 'Registration successful', 201);
}

/**
 * Handle user logout
 */
function handleLogout(): void {
    if (getRequestMethod() !== 'POST') {
        sendError('Method not allowed', 405);
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
    
    $user = getCurrentUser();
    $roles = getUserRoles($user['id']);
    
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM profiles WHERE user_id = ?');
    $stmt->execute([$user['id']]);
    $profile = $stmt->fetch();
    
    sendSuccess([
        'authenticated' => true,
        'user' => $user,
        'profile' => $profile,
        'roles' => $roles
    ], 'Session active');
}
