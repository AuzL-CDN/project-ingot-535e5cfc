<?php
/**
 * INGOT API - Password Reset Requests Management (Admin Only)
 * 
 * Endpoints:
 * - GET    /password-resets.php           - List all pending password reset requests
 * - POST   /password-resets.php?action=approve&id=X - Approve and reset password
 * - POST   /password-resets.php?action=reject&id=X  - Reject reset request
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/audit.php';

// Require admin for all password reset management operations
requireAdmin();

$method = getRequestMethod();
$action = getQueryParam('action');
$requestId = getQueryParam('id');

switch ($method) {
    case 'GET':
        handleListRequests();
        break;
    case 'POST':
        if ($action === 'approve') {
            handleApproveRequest((int)$requestId);
        } elseif ($action === 'reject') {
            handleRejectRequest((int)$requestId);
        } else {
            sendError('Invalid action', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

/**
 * List all password reset requests
 */
function handleListRequests(): void {
    $db = getDB();
    $status = getQueryParam('status', 'pending');
    
    $validStatuses = ['pending', 'approved', 'rejected', 'all'];
    if (!in_array($status, $validStatuses)) {
        $status = 'pending';
    }
    
    $sql = '
        SELECT 
            prr.id,
            prr.user_id,
            prr.requested_at,
            prr.resolved_at,
            prr.resolved_by,
            prr.status,
            u.username,
            u.display_name,
            u.email,
            resolver.display_name as resolver_name
        FROM password_reset_requests prr
        JOIN users u ON prr.user_id = u.id
        LEFT JOIN users resolver ON prr.resolved_by = resolver.id
    ';
    
    if ($status !== 'all') {
        $sql .= ' WHERE prr.status = ?';
        $stmt = $db->prepare($sql . ' ORDER BY prr.requested_at DESC');
        $stmt->execute([$status]);
    } else {
        $stmt = $db->prepare($sql . ' ORDER BY prr.requested_at DESC');
        $stmt->execute();
    }
    
    $requests = $stmt->fetchAll();
    
    // Count by status
    $stmt = $db->prepare('SELECT status, COUNT(*) as count FROM password_reset_requests GROUP BY status');
    $stmt->execute();
    $counts = [];
    foreach ($stmt->fetchAll() as $row) {
        $counts[$row['status']] = (int)$row['count'];
    }
    
    sendSuccess([
        'requests' => $requests,
        'counts' => $counts
    ]);
}

/**
 * Generate a secure temporary password
 */
function generateTempPassword(): string {
    $length = 12;
    $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $lowercase = 'abcdefghijklmnopqrstuvwxyz';
    $numbers = '0123456789';
    $special = '!@#$%^&*';
    
    // Ensure at least one of each required character type
    $password = $uppercase[random_int(0, strlen($uppercase) - 1)];
    $password .= $lowercase[random_int(0, strlen($lowercase) - 1)];
    $password .= $numbers[random_int(0, strlen($numbers) - 1)];
    $password .= $special[random_int(0, strlen($special) - 1)];
    
    // Fill the rest with random characters
    $allChars = $uppercase . $lowercase . $numbers . $special;
    for ($i = 4; $i < $length; $i++) {
        $password .= $allChars[random_int(0, strlen($allChars) - 1)];
    }
    
    // Shuffle the password
    return str_shuffle($password);
}

/**
 * Approve password reset request and generate new password
 */
function handleApproveRequest(int $requestId): void {
    if (!$requestId) {
        sendError('Request ID is required', 400);
    }
    
    $db = getDB();
    $adminId = getCurrentUserId();
    
    // Get the request
    $stmt = $db->prepare('
        SELECT prr.*, u.username, u.display_name 
        FROM password_reset_requests prr
        JOIN users u ON prr.user_id = u.id
        WHERE prr.id = ? AND prr.status = ?
    ');
    $stmt->execute([$requestId, 'pending']);
    $request = $stmt->fetch();
    
    if (!$request) {
        sendError('Reset request not found or already processed', 404);
    }
    
    // Generate temporary password
    $tempPassword = generateTempPassword();
    $passwordHash = password_hash($tempPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    
    // Update user's password and set must_change_password
    $stmt = $db->prepare('
        UPDATE users 
        SET password_hash = ?, must_change_password = TRUE, updated_at = NOW()
        WHERE id = ?
    ');
    $stmt->execute([$passwordHash, $request['user_id']]);
    
    // Mark request as approved
    $stmt = $db->prepare('
        UPDATE password_reset_requests 
        SET status = ?, resolved_at = NOW(), resolved_by = ?
        WHERE id = ?
    ');
    $stmt->execute(['approved', $adminId, $requestId]);
    
    logAuditEvent('password_reset_approved', $request['user_id'], [
        'request_id' => $requestId,
        'approved_by' => $adminId
    ]);
    
    sendSuccess([
        'request_id' => $requestId,
        'user_id' => $request['user_id'],
        'username' => $request['username'],
        'display_name' => $request['display_name'],
        'temporary_password' => $tempPassword
    ], 'Password reset approved. Please provide the temporary password to the user.');
}

/**
 * Reject password reset request
 */
function handleRejectRequest(int $requestId): void {
    if (!$requestId) {
        sendError('Request ID is required', 400);
    }
    
    $db = getDB();
    $adminId = getCurrentUserId();
    
    // Get the request
    $stmt = $db->prepare('SELECT * FROM password_reset_requests WHERE id = ? AND status = ?');
    $stmt->execute([$requestId, 'pending']);
    $request = $stmt->fetch();
    
    if (!$request) {
        sendError('Reset request not found or already processed', 404);
    }
    
    // Mark request as rejected
    $stmt = $db->prepare('
        UPDATE password_reset_requests 
        SET status = ?, resolved_at = NOW(), resolved_by = ?
        WHERE id = ?
    ');
    $stmt->execute(['rejected', $adminId, $requestId]);
    
    logAuditEvent('password_reset_rejected', $request['user_id'], [
        'request_id' => $requestId,
        'rejected_by' => $adminId
    ]);
    
    sendSuccess([
        'request_id' => $requestId
    ], 'Password reset request rejected.');
}
