<?php
/**
 * INGOT API - Deadlines Endpoints
 * 
 * Endpoints:
 * - GET    /deadlines.php              - List user's deadlines
 * - GET    /deadlines.php?id=X         - Get single deadline
 * - GET    /deadlines.php?activity=X   - Get deadlines for activity
 * - PUT    /deadlines.php?id=X         - Update deadline status
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/middleware.php';

// Require authentication for all deadline operations
requireAuth();

$method = getRequestMethod();
$id = getQueryParam('id');
$activityId = getQueryParam('activity');

routeRequest([
    'GET' => function() use ($id, $activityId) {
        if ($id) {
            handleGetDeadline($id);
        } elseif ($activityId) {
            handleGetActivityDeadlines($activityId);
        } else {
            handleListDeadlines();
        }
    },
    'PUT' => fn() => handleUpdateDeadline($id)
]);

/**
 * List all deadlines for current user's activities
 */
function handleListDeadlines(): void {
    $userId = getCurrentUserId();
    $db = getDB();
    
    $status = getQueryParam('status');
    $limit = min((int)getQueryParam('limit', 50), 100);
    $offset = max((int)getQueryParam('offset', 0), 0);
    
    $sql = '
        SELECT d.*, a.activity_number, a.company_name, a.inspection_class
        FROM activity_deadlines d
        JOIN activities a ON d.activity_id = a.id
        WHERE a.user_id = ? AND a.is_completed = FALSE
    ';
    $params = [$userId];
    
    if ($status) {
        $sql .= ' AND d.status = ?';
        $params[] = $status;
    }
    
    $sql .= ' ORDER BY d.due_date ASC LIMIT ? OFFSET ?';
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $deadlines = $stmt->fetchAll();
    
    // Calculate days remaining for each deadline
    $today = new DateTime();
    foreach ($deadlines as &$deadline) {
        $dueDate = new DateTime($deadline['due_date']);
        $diff = $today->diff($dueDate);
        $deadline['days_remaining'] = $diff->invert ? -$diff->days : $diff->days;
        $deadline['is_overdue'] = $deadline['days_remaining'] < 0;
    }
    
    sendSuccess(['deadlines' => $deadlines]);
}

/**
 * Get single deadline by ID
 */
function handleGetDeadline(int $id): void {
    $userId = getCurrentUserId();
    $db = getDB();
    
    $stmt = $db->prepare('
        SELECT d.*, a.activity_number, a.company_name
        FROM activity_deadlines d
        JOIN activities a ON d.activity_id = a.id
        WHERE d.id = ? AND a.user_id = ?
    ');
    $stmt->execute([$id, $userId]);
    $deadline = $stmt->fetch();
    
    if (!$deadline) {
        sendNotFound('Deadline not found');
    }
    
    sendSuccess(['deadline' => $deadline]);
}

/**
 * Get deadlines for a specific activity
 */
function handleGetActivityDeadlines(int $activityId): void {
    $userId = getCurrentUserId();
    $db = getDB();
    
    // Verify activity ownership
    $stmt = $db->prepare('SELECT id FROM activities WHERE id = ? AND user_id = ?');
    $stmt->execute([$activityId, $userId]);
    
    if (!$stmt->fetch()) {
        sendNotFound('Activity not found');
    }
    
    $stmt = $db->prepare('SELECT * FROM activity_deadlines WHERE activity_id = ? ORDER BY due_date ASC');
    $stmt->execute([$activityId]);
    $deadlines = $stmt->fetchAll();
    
    sendSuccess(['deadlines' => $deadlines]);
}

/**
 * Update deadline status
 */
function handleUpdateDeadline(int $id): void {
    if (!$id) {
        sendError('Deadline ID required', 400);
    }
    
    $userId = getCurrentUserId();
    $data = getJsonBody();
    $db = getDB();
    
    // Verify ownership through activity
    $stmt = $db->prepare('
        SELECT d.id FROM activity_deadlines d
        JOIN activities a ON d.activity_id = a.id
        WHERE d.id = ? AND a.user_id = ?
    ');
    $stmt->execute([$id, $userId]);
    
    if (!$stmt->fetch()) {
        sendNotFound('Deadline not found');
    }
    
    // Update status
    $validStatuses = ['on_track', 'approaching', 'due', 'overdue'];
    
    if (isset($data['status']) && in_array($data['status'], $validStatuses)) {
        $stmt = $db->prepare('UPDATE activity_deadlines SET status = ? WHERE id = ?');
        $stmt->execute([$data['status'], $id]);
    }
    
    // Return updated deadline
    $stmt = $db->prepare('SELECT * FROM activity_deadlines WHERE id = ?');
    $stmt->execute([$id]);
    $deadline = $stmt->fetch();
    
    sendSuccess(['deadline' => $deadline], 'Deadline updated');
}
