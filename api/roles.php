<?php
/**
 * INGOT API - Role Management Endpoints (Admin Only)
 * 
 * Endpoints:
 * - GET    /roles.php              - List all users with roles
 * - GET    /roles.php?user=X       - Get roles for specific user
 * - POST   /roles.php              - Assign role to user
 * - DELETE /roles.php?user=X&role=Y - Remove role from user
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/middleware.php';

// Require admin for all role operations
requireAdmin();

$method = getRequestMethod();
$userId = getQueryParam('user');

routeRequest([
    'GET' => fn() => $userId ? handleGetUserRoles($userId) : handleListUsersWithRoles(),
    'POST' => 'handleAssignRole',
    'DELETE' => 'handleRemoveRole'
]);

/**
 * List all users with their roles
 */
function handleListUsersWithRoles(): void {
    $db = getDB();
    
    $stmt = $db->prepare('
        SELECT u.id, u.email, u.display_name, u.created_at,
               GROUP_CONCAT(ur.role) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
    ');
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    // Convert roles string to array
    foreach ($users as &$user) {
        $user['roles'] = $user['roles'] ? explode(',', $user['roles']) : [];
    }
    
    sendSuccess(['users' => $users]);
}

/**
 * Get roles for a specific user
 */
function handleGetUserRoles(int $userId): void {
    $db = getDB();
    
    // Check if user exists
    $stmt = $db->prepare('SELECT id, email, display_name FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendNotFound('User not found');
    }
    
    // Get roles
    $stmt = $db->prepare('SELECT role FROM user_roles WHERE user_id = ?');
    $stmt->execute([$userId]);
    $roles = array_column($stmt->fetchAll(), 'role');
    
    sendSuccess([
        'user' => $user,
        'roles' => $roles
    ]);
}

/**
 * Assign role to user
 */
function handleAssignRole(): void {
    $data = getJsonBody();
    
    $errors = validateRequired($data, ['user_id', 'role']);
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    $userId = (int)$data['user_id'];
    $role = $data['role'];
    
    // Validate role
    $validRoles = ['admin', 'moderator', 'user'];
    if (!in_array($role, $validRoles)) {
        sendError('Invalid role. Must be: admin, moderator, or user', 400);
    }
    
    $db = getDB();
    
    // Check if user exists
    $stmt = $db->prepare('SELECT id FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    
    if (!$stmt->fetch()) {
        sendNotFound('User not found');
    }
    
    // Check if role already assigned
    $stmt = $db->prepare('SELECT id FROM user_roles WHERE user_id = ? AND role = ?');
    $stmt->execute([$userId, $role]);
    
    if ($stmt->fetch()) {
        sendError('Role already assigned to user', 409);
    }
    
    // Assign role
    $stmt = $db->prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)');
    $stmt->execute([$userId, $role]);
    
    sendSuccess(['user_id' => $userId, 'role' => $role], 'Role assigned', 201);
}

/**
 * Remove role from user
 */
function handleRemoveRole(): void {
    $userId = getQueryParam('user');
    $role = getQueryParam('role');
    
    if (!$userId || !$role) {
        sendError('User ID and role are required', 400);
    }
    
    // Prevent removing own admin role
    if ((int)$userId === getCurrentUserId() && $role === 'admin') {
        sendError('Cannot remove your own admin role', 403);
    }
    
    $db = getDB();
    
    $stmt = $db->prepare('DELETE FROM user_roles WHERE user_id = ? AND role = ?');
    $stmt->execute([$userId, $role]);
    
    if ($stmt->rowCount() === 0) {
        sendNotFound('Role not found for user');
    }
    
    sendSuccess([], 'Role removed');
}
