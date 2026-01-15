<?php
/**
 * INGOT API - Security Audit Logging
 * 
 * Logs security-relevant events for monitoring and compliance.
 * Events are stored in the audit_logs table.
 */

require_once __DIR__ . '/config.php';

/**
 * Audit event types
 */
define('AUDIT_LOGIN_SUCCESS', 'login_success');
define('AUDIT_LOGIN_FAILED', 'login_failed');
define('AUDIT_LOGOUT', 'logout');
define('AUDIT_PASSWORD_CHANGE', 'password_change');
define('AUDIT_PASSWORD_RESET', 'password_reset');
define('AUDIT_USER_CREATED', 'user_created');
define('AUDIT_USER_DELETED', 'user_deleted');
define('AUDIT_ROLE_ASSIGNED', 'role_assigned');
define('AUDIT_ROLE_REMOVED', 'role_removed');
define('AUDIT_ADMIN_ACTION', 'admin_action');
define('AUDIT_DATA_ACCESS', 'data_access');
define('AUDIT_DATA_EXPORT', 'data_export');
define('AUDIT_RATE_LIMIT_HIT', 'rate_limit_hit');
define('AUDIT_SUSPICIOUS_ACTIVITY', 'suspicious_activity');

/**
 * Log an audit event
 * 
 * @param string $eventType Type of event (use AUDIT_* constants)
 * @param array $details Additional event details
 * @param int|null $userId User ID (null for anonymous/system events)
 * @param string $severity Event severity: info, warning, critical
 */
function logAuditEvent(
    string $eventType,
    array $details = [],
    ?int $userId = null,
    string $severity = 'info'
): void {
    try {
        $db = getDB();
        
        // Get client IP (handle proxies)
        $clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] 
            ?? $_SERVER['HTTP_X_REAL_IP'] 
            ?? $_SERVER['REMOTE_ADDR'] 
            ?? 'unknown';
        
        // If multiple IPs (proxy chain), take the first one
        if (strpos($clientIp, ',') !== false) {
            $clientIp = trim(explode(',', $clientIp)[0]);
        }
        
        // Prepare event details
        $eventDetails = json_encode([
            ...$details,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
            'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
        ], JSON_UNESCAPED_UNICODE);
        
        $stmt = $db->prepare('
            INSERT INTO audit_logs (user_id, event_type, event_details, ip_address, severity)
            VALUES (?, ?, ?, ?, ?)
        ');
        
        $stmt->execute([
            $userId,
            $eventType,
            $eventDetails,
            $clientIp,
            $severity
        ]);
        
    } catch (Exception $e) {
        // Don't let audit logging failures break the application
        error_log('Audit logging failed: ' . $e->getMessage());
    }
}

/**
 * Log a successful login
 */
function auditLoginSuccess(int $userId, string $username): void {
    logAuditEvent(AUDIT_LOGIN_SUCCESS, [
        'username' => $username,
    ], $userId, 'info');
}

/**
 * Log a failed login attempt
 */
function auditLoginFailed(string $username, string $reason = 'Invalid credentials'): void {
    logAuditEvent(AUDIT_LOGIN_FAILED, [
        'username' => $username,
        'reason' => $reason,
    ], null, 'warning');
}

/**
 * Log a logout event
 */
function auditLogout(int $userId): void {
    logAuditEvent(AUDIT_LOGOUT, [], $userId, 'info');
}

/**
 * Log a password change
 */
function auditPasswordChange(int $userId, bool $forced = false): void {
    logAuditEvent(AUDIT_PASSWORD_CHANGE, [
        'forced' => $forced,
    ], $userId, 'info');
}

/**
 * Log rate limit being hit
 */
function auditRateLimitHit(string $identifier, string $action): void {
    logAuditEvent(AUDIT_RATE_LIMIT_HIT, [
        'identifier' => $identifier,
        'action' => $action,
    ], null, 'warning');
}

/**
 * Log suspicious activity
 */
function auditSuspiciousActivity(string $description, array $details = []): void {
    logAuditEvent(AUDIT_SUSPICIOUS_ACTIVITY, [
        'description' => $description,
        ...$details,
    ], null, 'critical');
}

/**
 * Log an admin action
 */
function auditAdminAction(int $adminUserId, string $action, array $details = []): void {
    logAuditEvent(AUDIT_ADMIN_ACTION, [
        'action' => $action,
        ...$details,
    ], $adminUserId, 'info');
}

/**
 * Get recent audit logs (admin only)
 * 
 * @param int $limit Number of logs to return
 * @param string|null $eventType Filter by event type
 * @param string|null $severity Filter by severity
 * @return array Array of audit log entries
 */
function getAuditLogs(
    int $limit = 100,
    ?string $eventType = null,
    ?string $severity = null
): array {
    $db = getDB();
    
    $sql = 'SELECT * FROM audit_logs WHERE 1=1';
    $params = [];
    
    if ($eventType) {
        $sql .= ' AND event_type = ?';
        $params[] = $eventType;
    }
    
    if ($severity) {
        $sql .= ' AND severity = ?';
        $params[] = $severity;
    }
    
    $sql .= ' ORDER BY created_at DESC LIMIT ?';
    $params[] = $limit;
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    return $stmt->fetchAll();
}

/**
 * Get login attempts for an IP address in the last N minutes
 * 
 * @param string $ipAddress IP address to check
 * @param int $minutes Time window in minutes
 * @return int Number of failed login attempts
 */
function getFailedLoginAttempts(string $ipAddress, int $minutes = 15): int {
    $db = getDB();
    
    $stmt = $db->prepare('
        SELECT COUNT(*) as count 
        FROM audit_logs 
        WHERE event_type = ?
          AND ip_address = ?
          AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
    ');
    
    $stmt->execute([AUDIT_LOGIN_FAILED, $ipAddress, $minutes]);
    $result = $stmt->fetch();
    
    return (int)($result['count'] ?? 0);
}

/**
 * Check if IP is currently rate limited
 * 
 * @param string $ipAddress IP address to check
 * @return bool True if rate limited
 */
function isIpRateLimited(string $ipAddress): bool {
    $failedAttempts = getFailedLoginAttempts($ipAddress, 15);
    return $failedAttempts >= 10;
}
