<?php
/**
 * INGOT Cron Job - Check Deadlines
 * Run daily via IONOS cron at 8:00 AM
 * 
 * Cron command: php /path/to/cron/check-deadlines.php
 */

// Ensure this runs only from CLI
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit("Access denied\n");
}

require_once __DIR__ . '/../api/config.php';

echo "Starting deadline check at " . date('Y-m-d H:i:s') . "\n";

try {
    $db = getDB();
    $today = new DateTime();
    $updated = 0;

    // Get all active deadlines
    $stmt = $db->prepare('
        SELECT d.id, d.due_date, d.status
        FROM activity_deadlines d
        JOIN activities a ON d.activity_id = a.id
        WHERE a.is_completed = FALSE
    ');
    $stmt->execute();
    $deadlines = $stmt->fetchAll();

    foreach ($deadlines as $deadline) {
        $dueDate = new DateTime($deadline['due_date']);
        $diff = $today->diff($dueDate);
        $daysRemaining = $diff->invert ? -$diff->days : $diff->days;

        // Determine new status
        if ($daysRemaining < 0) {
            $newStatus = 'overdue';
        } elseif ($daysRemaining === 0) {
            $newStatus = 'due';
        } elseif ($daysRemaining <= 3) {
            $newStatus = 'approaching';
        } else {
            $newStatus = 'on_track';
        }

        // Update if status changed
        if ($newStatus !== $deadline['status']) {
            $updateStmt = $db->prepare('UPDATE activity_deadlines SET status = ? WHERE id = ?');
            $updateStmt->execute([$newStatus, $deadline['id']]);
            $updated++;
        }
    }

    echo "Checked " . count($deadlines) . " deadlines, updated $updated statuses.\n";
    echo "Completed at " . date('Y-m-d H:i:s') . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
