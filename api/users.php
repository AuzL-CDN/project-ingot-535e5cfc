<?php
/**
 * INGOT API - User Management Endpoints (Admin Only)
 * 
 * Endpoints:
 * - GET    /users.php              - List all users with profiles and roles
 * - GET    /users.php?id=X         - Get specific user details
 * - POST   /users.php              - Create new user
 * - PUT    /users.php?id=X         - Update user
 * - DELETE /users.php?id=X         - Delete user
 * - POST   /users.php?action=reset_password&id=X - Reset user password
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/middleware.php';

// Require admin for all user management operations
requireAdmin();

$method = getRequestMethod();
$userId = getQueryParam('id');
$action = getQueryParam('action');

// Handle special actions
if ($action === 'reset_password' && $method === 'POST') {
    handleResetPassword();
    exit;
}

routeRequest([
    'GET' => fn() => $userId ? handleGetUser((int)$userId) : handleListUsers(),
    'POST' => 'handleCreateUser',
    'PUT' => fn() => handleUpdateUser((int)$userId),
    'DELETE' => fn() => handleDeleteUser((int)$userId)
]);

/**
 * List all users with their profiles and roles
 */
function handleListUsers(): void {
    $db = getDB();
    
    $stmt = $db->prepare('
        SELECT 
            u.id, 
            u.email, 
            u.display_name, 
            u.created_at,
            u.updated_at,
            p.id as profile_id
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        ORDER BY u.created_at DESC
    ');
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    // Get roles for each user
    foreach ($users as &$user) {
        $stmt = $db->prepare('SELECT role FROM user_roles WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $user['roles'] = array_column($stmt->fetchAll(), 'role');
    }
    
    sendSuccess(['users' => $users]);
}

/**
 * Get specific user details
 */
function handleGetUser(int $userId): void {
    $db = getDB();
    
    $stmt = $db->prepare('
        SELECT 
            u.id, 
            u.email, 
            u.display_name, 
            u.created_at,
            u.updated_at
        FROM users u
        WHERE u.id = ?
    ');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendNotFound('User not found');
    }
    
    // Get roles
    $stmt = $db->prepare('SELECT role FROM user_roles WHERE user_id = ?');
    $stmt->execute([$userId]);
    $user['roles'] = array_column($stmt->fetchAll(), 'role');
    
    // Get profile
    $stmt = $db->prepare('SELECT * FROM profiles WHERE user_id = ?');
    $stmt->execute([$userId]);
    $user['profile'] = $stmt->fetch();
    
    sendSuccess(['user' => $user]);
}

/**
 * Create a new user
 */
function handleCreateUser(): void {
    $data = getJsonBody();
    
    $errors = validateRequired($data, ['email', 'password']);
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    $email = strtolower(trim($data['email']));
    $password = $data['password'];
    $displayName = sanitizeString($data['display_name'] ?? '');
    $role = $data['role'] ?? 'user';
    
    // Validate email format
    if (!validateEmail($email)) {
        sendError('Invalid email format', 400);
    }
    
    // Validate password strength
    if (strlen($password) < 8) {
        sendError('Password must be at least 8 characters', 400);
    }
    
    // Validate role
    $validRoles = ['admin', 'moderator', 'user'];
    if (!in_array($role, $validRoles)) {
        sendError('Invalid role. Must be: admin, moderator, or user', 400);
    }
    
    $db = getDB();
    
    // Check if email already exists
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        sendError('Email already registered', 409);
    }
    
    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    // Create user
    $stmt = $db->prepare('
        INSERT INTO users (email, password_hash, display_name)
        VALUES (?, ?, ?)
    ');
    $stmt->execute([$email, $passwordHash, $displayName ?: null]);
    
    $userId = $db->lastInsertId();
    
    // The trigger auto-assigns 'user' role, so we need to update if different
    if ($role !== 'user') {
        // First remove the auto-assigned 'user' role
        $stmt = $db->prepare('DELETE FROM user_roles WHERE user_id = ? AND role = ?');
        $stmt->execute([$userId, 'user']);
        
        // Add the requested role
        $stmt = $db->prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)');
        $stmt->execute([$userId, $role]);
    }
    
    // Get created user
    $stmt = $db->prepare('
        SELECT id, email, display_name, created_at
        FROM users WHERE id = ?
    ');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    // Get roles
    $stmt = $db->prepare('SELECT role FROM user_roles WHERE user_id = ?');
    $stmt->execute([$userId]);
    $user['roles'] = array_column($stmt->fetchAll(), 'role');
    
    sendSuccess(['user' => $user], 'User created successfully', 201);
}

/**
 * Update user
 */
function handleUpdateUser(int $userId): void {
    if (!$userId) {
        sendError('User ID is required', 400);
    }
    
    $data = getJsonBody();
    $db = getDB();
    
    // Check if user exists
    $stmt = $db->prepare('SELECT id FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    
    if (!$stmt->fetch()) {
        sendNotFound('User not found');
    }
    
    // Build update query for users table
    $updateFields = [];
    $params = [];
    
    if (isset($data['email'])) {
        $email = strtolower(trim($data['email']));
        if (!validateEmail($email)) {
            sendError('Invalid email format', 400);
        }
        
        // Check if email already used by another user
        $stmt = $db->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
        $stmt->execute([$email, $userId]);
        if ($stmt->fetch()) {
            sendError('Email already in use by another user', 409);
        }
        
        $updateFields[] = 'email = ?';
        $params[] = $email;
    }
    
    if (isset($data['display_name'])) {
        $updateFields[] = 'display_name = ?';
        $params[] = sanitizeString($data['display_name']);
    }
    
    // Update users table if there are fields to update
    if (!empty($updateFields)) {
        $params[] = $userId;
        $sql = 'UPDATE users SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        // Also update profile
        if (isset($data['display_name'])) {
            $stmt = $db->prepare('UPDATE profiles SET display_name = ? WHERE user_id = ?');
            $stmt->execute([sanitizeString($data['display_name']), $userId]);
        }
        if (isset($data['email'])) {
            $stmt = $db->prepare('UPDATE profiles SET email = ? WHERE user_id = ?');
            $stmt->execute([$email, $userId]);
        }
    }
    
    // Update role if specified
    if (isset($data['role'])) {
        $role = $data['role'];
        $validRoles = ['admin', 'moderator', 'user'];
        
        if (!in_array($role, $validRoles)) {
            sendError('Invalid role. Must be: admin, moderator, or user', 400);
        }
        
        // Prevent removing own admin role
        if ($userId === getCurrentUserId() && $role !== 'admin') {
            sendError('Cannot remove your own admin role', 403);
        }
        
        // Remove all existing roles and add new one
        $stmt = $db->prepare('DELETE FROM user_roles WHERE user_id = ?');
        $stmt->execute([$userId]);
        
        $stmt = $db->prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)');
        $stmt->execute([$userId, $role]);
    }
    
    // Get updated user
    $stmt = $db->prepare('
        SELECT id, email, display_name, created_at, updated_at
        FROM users WHERE id = ?
    ');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    // Get roles
    $stmt = $db->prepare('SELECT role FROM user_roles WHERE user_id = ?');
    $stmt->execute([$userId]);
    $user['roles'] = array_column($stmt->fetchAll(), 'role');
    
    sendSuccess(['user' => $user], 'User updated successfully');
}

/**
 * Delete user
 */
function handleDeleteUser(int $userId): void {
    if (!$userId) {
        sendError('User ID is required', 400);
    }
    
    // Prevent self-deletion
    if ($userId === getCurrentUserId()) {
        sendError('Cannot delete your own account', 403);
    }
    
    $db = getDB();
    
    // Check if user exists
    $stmt = $db->prepare('SELECT id FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    
    if (!$stmt->fetch()) {
        sendNotFound('User not found');
    }
    
    // Delete user (cascades to roles, profile, activities, etc.)
    $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    
    sendSuccess([], 'User deleted successfully');
}

/**
 * Reset user password
 */
function handleResetPassword(): void {
    $userId = getQueryParam('id');
    
    if (!$userId) {
        sendError('User ID is required', 400);
    }
    
    $data = getJsonBody();
    $newPassword = $data['new_password'] ?? null;
    
    if (!$newPassword) {
        sendError('New password is required', 400);
    }
    
    if (strlen($newPassword) < 8) {
        sendError('Password must be at least 8 characters', 400);
    }
    
    $db = getDB();
    
    // Check if user exists
    $stmt = $db->prepare('SELECT id, display_name FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendNotFound('User not found');
    }
    
    // Hash and update password
    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
    $stmt = $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $stmt->execute([$passwordHash, $userId]);
    
    sendSuccess([
        'user_id' => (int)$userId,
        'display_name' => $user['display_name']
    ], 'Password reset successfully');
}
