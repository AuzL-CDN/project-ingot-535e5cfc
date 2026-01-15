<?php
declare(strict_types=1);
/**
 * INGOT API - Activities Endpoints
 * 
 * Endpoints:
 * - GET    /activities.php        - List user's activities
 * - GET    /activities.php?id=X   - Get single activity
 * - POST   /activities.php        - Create new activity
 * - PUT    /activities.php?id=X   - Update activity
 * - DELETE /activities.php?id=X   - Delete activity
 * - POST   /activities.php?action=complete&id=X - Complete activity
 * - GET    /activities.php?action=search&q=X    - Search activities
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/middleware.php';

// Require authentication for all activity operations
requireAuth();

$method = getRequestMethod();
$action = getQueryParam('action', '');
$id = getQueryParam('id');

// Route based on action or method
if ($action === 'complete' && $id) {
    handleCompleteActivity((int)$id);
} elseif ($action === 'search') {
    handleSearchActivities();
} else {
    routeRequest([
        'GET' => $id ? fn() => handleGetActivity((int)$id) : 'handleListActivities',
        'POST' => 'handleCreateActivity',
        'PUT' => fn() => handleUpdateActivity((int)$id),
        'DELETE' => fn() => handleDeleteActivity((int)$id)
    ]);
}

/**
 * List all activities for current user
 */
function handleListActivities(): void {
    $userId = getCurrentUserId();
    $db = getDB();
    
    $limit = min((int)getQueryParam('limit', 50), 100);
    $offset = max((int)getQueryParam('offset', 0), 0);
    $completed = getQueryParam('completed');
    
    $sql = 'SELECT * FROM activities WHERE user_id = ?';
    $params = [$userId];
    
    if ($completed !== null) {
        $sql .= ' AND is_completed = ?';
        $params[] = $completed === 'true' ? 1 : 0;
    }
    
    $sql .= ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $activities = $stmt->fetchAll();
    
    // Parse JSON data for each activity
    foreach ($activities as &$activity) {
        if ($activity['activity_data']) {
            $activity['activity_data'] = json_decode($activity['activity_data'], true);
        }
    }
    
    // Get total count
    $countSql = 'SELECT COUNT(*) as total FROM activities WHERE user_id = ?';
    $countParams = [$userId];
    if ($completed !== null) {
        $countSql .= ' AND is_completed = ?';
        $countParams[] = $completed === 'true' ? 1 : 0;
    }
    
    $stmt = $db->prepare($countSql);
    $stmt->execute($countParams);
    $total = $stmt->fetch()['total'];
    
    sendSuccess([
        'activities' => $activities,
        'total' => $total,
        'limit' => $limit,
        'offset' => $offset
    ]);
}

/**
 * Get single activity by ID
 */
function handleGetActivity(int $id): void {
    $userId = getCurrentUserId();
    $db = getDB();
    
    $stmt = $db->prepare('SELECT * FROM activities WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $userId]);
    $activity = $stmt->fetch();
    
    if (!$activity) {
        sendNotFound('Activity not found');
    }
    
    // Parse JSON data
    if ($activity['activity_data']) {
        $activity['activity_data'] = json_decode($activity['activity_data'], true);
    }
    
    // Get deadlines
    $stmt = $db->prepare('SELECT * FROM activity_deadlines WHERE activity_id = ?');
    $stmt->execute([$id]);
    $activity['deadlines'] = $stmt->fetchAll();
    
    sendSuccess(['activity' => $activity]);
}

/**
 * Create new activity
 */
function handleCreateActivity(): void {
    $userId = getCurrentUserId();
    $data = getJsonBody();
    
    // Validate required fields
    $errors = validateRequired($data, ['activity_number', 'org_site_number', 'company_name', 'inspection_class']);
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    // Validate inspection class
    $validClasses = ['1F', '1G', '19F', '19G'];
    if (!in_array($data['inspection_class'], $validClasses)) {
        sendError('Invalid inspection class', 400);
    }
    
    $db = getDB();
    
    // Store additional data as JSON
    $activityData = $data['activity_data'] ?? $data;
    unset($activityData['activity_number'], $activityData['org_site_number'], 
          $activityData['company_name'], $activityData['inspection_class']);
    
    $stmt = $db->prepare('
        INSERT INTO activities (user_id, activity_number, org_site_number, company_name, inspection_class, activity_data)
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    
    $stmt->execute([
        $userId,
        sanitizeString($data['activity_number']),
        sanitizeString($data['org_site_number']),
        sanitizeString($data['company_name']),
        $data['inspection_class'],
        json_encode($activityData)
    ]);
    
    $activityId = (int)$db->lastInsertId();
    
    // Create deadlines based on inspection class
    createDeadlines($db, $activityId, $data['inspection_class']);
    
    // Return created activity
    $stmt = $db->prepare('SELECT * FROM activities WHERE id = ?');
    $stmt->execute([$activityId]);
    $activity = $stmt->fetch();
    
    if ($activity['activity_data']) {
        $activity['activity_data'] = json_decode($activity['activity_data'], true);
    }
    
    // Get deadlines
    $stmt = $db->prepare('SELECT * FROM activity_deadlines WHERE activity_id = ?');
    $stmt->execute([$activityId]);
    $activity['deadlines'] = $stmt->fetchAll();
    
    sendSuccess(['activity' => $activity], 'Activity created', 201);
}

/**
 * Update existing activity
 */
function handleUpdateActivity(int $id): void {
    if (!$id) {
        sendError('Activity ID required', 400);
    }
    
    $userId = getCurrentUserId();
    $data = getJsonBody();
    $db = getDB();
    
    // Verify ownership
    $stmt = $db->prepare('SELECT id FROM activities WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $userId]);
    
    if (!$stmt->fetch()) {
        sendNotFound('Activity not found');
    }
    
    // Build update query dynamically
    $updateFields = [];
    $params = [];
    
    $allowedFields = ['activity_number', 'org_site_number', 'company_name', 'inspection_class', 'is_completed'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updateFields[] = "$field = ?";
            $params[] = $data[$field];
        }
    }
    
    // Handle activity_data JSON
    if (isset($data['activity_data'])) {
        $updateFields[] = 'activity_data = ?';
        $params[] = json_encode($data['activity_data']);
    }
    
    if (empty($updateFields)) {
        sendError('No fields to update', 400);
    }
    
    $params[] = $id;
    
    $sql = 'UPDATE activities SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    // Return updated activity
    $stmt = $db->prepare('SELECT * FROM activities WHERE id = ?');
    $stmt->execute([$id]);
    $activity = $stmt->fetch();
    
    if ($activity['activity_data']) {
        $activity['activity_data'] = json_decode($activity['activity_data'], true);
    }
    
    sendSuccess(['activity' => $activity], 'Activity updated');
}

/**
 * Delete activity
 */
function handleDeleteActivity(int $id): void {
    if (!$id) {
        sendError('Activity ID required', 400);
    }
    
    $userId = getCurrentUserId();
    $db = getDB();
    
    $stmt = $db->prepare('DELETE FROM activities WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $userId]);
    
    if ($stmt->rowCount() === 0) {
        sendNotFound('Activity not found');
    }
    
    sendSuccess([], 'Activity deleted');
}

/**
 * Complete an activity
 */
function handleCompleteActivity(int $id): void {
    if (getRequestMethod() !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $userId = getCurrentUserId();
    $db = getDB();
    
    $stmt = $db->prepare('
        UPDATE activities 
        SET is_completed = TRUE, completed_at = NOW()
        WHERE id = ? AND user_id = ?
    ');
    $stmt->execute([$id, $userId]);
    
    if ($stmt->rowCount() === 0) {
        sendNotFound('Activity not found');
    }
    
    sendSuccess([], 'Activity completed');
}

/**
 * Search activities
 */
function handleSearchActivities(): void {
    $userId = getCurrentUserId();
    $query = getQueryParam('q', '');
    
    if (strlen($query) < 2) {
        sendError('Search query must be at least 2 characters', 400);
    }
    
    $db = getDB();
    $searchTerm = '%' . $query . '%';
    
    $stmt = $db->prepare('
        SELECT * FROM activities 
        WHERE user_id = ? 
        AND (
            activity_number LIKE ? 
            OR org_site_number LIKE ? 
            OR company_name LIKE ?
        )
        ORDER BY updated_at DESC
        LIMIT 50
    ');
    
    $stmt->execute([$userId, $searchTerm, $searchTerm, $searchTerm]);
    $activities = $stmt->fetchAll();
    
    foreach ($activities as &$activity) {
        if ($activity['activity_data']) {
            $activity['activity_data'] = json_decode($activity['activity_data'], true);
        }
    }
    
    sendSuccess(['activities' => $activities, 'query' => $query]);
}

/**
 * Create deadlines based on inspection class
 */
function createDeadlines(PDO $db, int $activityId, string $inspectionClass): void {
    $today = date('Y-m-d');
    
    // Deadline configurations (business days)
    $deadlineConfigs = [
        '1F' => ['checklist' => 5, 'doc' => 10],
        '1G' => ['checklist' => 5, 'doc' => 10],
        '19F' => ['checklist' => 10, 'doc' => 20, 'corrective_measures' => 30],
        '19G' => ['checklist' => 10, 'doc' => 20, 'corrective_measures' => 30]
    ];
    
    $config = $deadlineConfigs[$inspectionClass] ?? $deadlineConfigs['1F'];
    
    foreach ($config as $type => $days) {
        $dueDate = addBusinessDays($today, $days);
        
        $stmt = $db->prepare('
            INSERT INTO activity_deadlines (activity_id, deadline_type, start_date, due_date, business_days_allocated, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ');
        
        $stmt->execute([
            $activityId,
            $type,
            $today,
            $dueDate,
            $days,
            'on_track'
        ]);
    }
}

/**
 * Add business days to a date (excluding weekends)
 */
function addBusinessDays(string $startDate, int $businessDays): string {
    $date = new DateTime($startDate);
    $addedDays = 0;
    
    while ($addedDays < $businessDays) {
        $date->modify('+1 day');
        $dayOfWeek = (int)$date->format('N');
        
        // Skip weekends (6 = Saturday, 7 = Sunday)
        if ($dayOfWeek < 6) {
            $addedDays++;
        }
    }
    
    return $date->format('Y-m-d');
}
