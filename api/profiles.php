<?php
/**
 * INGOT API - Profiles Endpoints
 * 
 * Endpoints:
 * - GET  /profiles.php        - Get current user's profile
 * - PUT  /profiles.php        - Update current user's profile
 * - GET  /profiles.php?id=X   - Get profile by user ID (admin only)
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/middleware.php';

// Require authentication for all profile operations
requireAuth();

$method = getRequestMethod();
$id = getQueryParam('id');

routeRequest([
    'GET' => fn() => $id ? handleGetProfileById($id) : handleGetProfile(),
    'PUT' => 'handleUpdateProfile'
]);

/**
 * Get current user's profile
 */
function handleGetProfile(): void {
    $userId = getCurrentUserId();
    $db = getDB();
    
    $stmt = $db->prepare('
        SELECT p.*, u.email as user_email
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?
    ');
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();
    
    if (!$profile) {
        // Profile might not exist if trigger failed, create it
        $stmt = $db->prepare('SELECT email, display_name FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        $stmt = $db->prepare('INSERT INTO profiles (user_id, display_name, email) VALUES (?, ?, ?)');
        $stmt->execute([$userId, $user['display_name'], $user['email']]);
        
        $stmt = $db->prepare('SELECT * FROM profiles WHERE user_id = ?');
        $stmt->execute([$userId]);
        $profile = $stmt->fetch();
    }
    
    sendSuccess(['profile' => $profile]);
}

/**
 * Get profile by user ID (admin only)
 */
function handleGetProfileById(int $id): void {
    requireAdmin();
    
    $db = getDB();
    
    $stmt = $db->prepare('
        SELECT p.*, u.email as user_email
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?
    ');
    $stmt->execute([$id]);
    $profile = $stmt->fetch();
    
    if (!$profile) {
        sendNotFound('Profile not found');
    }
    
    sendSuccess(['profile' => $profile]);
}

/**
 * Update current user's profile
 */
function handleUpdateProfile(): void {
    $userId = getCurrentUserId();
    $data = getJsonBody();
    $db = getDB();
    
    // Build update query
    $updateFields = [];
    $params = [];
    
    if (isset($data['display_name'])) {
        $updateFields[] = 'display_name = ?';
        $params[] = sanitizeString($data['display_name']);
    }
    
    if (empty($updateFields)) {
        sendError('No fields to update', 400);
    }
    
    $params[] = $userId;
    
    // Update profile
    $sql = 'UPDATE profiles SET ' . implode(', ', $updateFields) . ' WHERE user_id = ?';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    // Also update user table if display_name changed
    if (isset($data['display_name'])) {
        $stmt = $db->prepare('UPDATE users SET display_name = ? WHERE id = ?');
        $stmt->execute([sanitizeString($data['display_name']), $userId]);
    }
    
    // Return updated profile
    $stmt = $db->prepare('SELECT * FROM profiles WHERE user_id = ?');
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();
    
    sendSuccess(['profile' => $profile], 'Profile updated');
}
