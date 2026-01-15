<?php
/**
 * INGOT User Seeding Script
 * 
 * Creates initial users with generated usernames and default passwords.
 * 
 * Username format: firstname + first letter of lastname (lowercase)
 * Password format: firstname@Ingot2026!
 * 
 * ⚠️ DELETE THIS FILE AFTER RUNNING! ⚠️
 * 
 * Run once via browser: https://your-domain.com/api/seed-users.php
 * Or via CLI: php seed-users.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';

// Safety check - prevent accidental re-runs
$lockFile = __DIR__ . '/.seed-completed';
if (file_exists($lockFile)) {
    sendError('Seeding already completed. Delete ' . $lockFile . ' to run again.', 400);
}

// User data: [lastname, firstname, role]
$users = [
    ['Daoust', 'Patrick', 'user'],
    ['Laroque', 'Austin', 'admin'],
    ['Donnelly', 'Owen', 'user'],
    ['Latremouille', 'Eric', 'user'],
    ['Meshake', 'Shegeya', 'user'],
    ['Sincennes', 'Nicole', 'user'],
    ['Weatherby', 'Pamela', 'user'],
    ['Witwit', 'Hussain', 'user'],
    ['Grace', 'James', 'admin'],
    ['Laviolette', 'Michelle', 'admin'],
];

/**
 * Generate username from name parts
 * Format: firstname + first letter of lastname (lowercase)
 */
function generateUsername(string $firstName, string $lastName): string {
    $firstName = strtolower(trim($firstName));
    $lastInitial = strtolower(substr(trim($lastName), 0, 1));
    return $firstName . $lastInitial;
}

/**
 * Generate default password
 * Format: firstname@Ingot2026!
 */
function generateDefaultPassword(string $firstName): string {
    $firstName = ucfirst(strtolower(trim($firstName)));
    return $firstName . '@Ingot2026!';
}

try {
    $db = getDB();
    
    $results = [
        'created' => [],
        'skipped' => [],
        'errors' => []
    ];
    
    foreach ($users as [$lastName, $firstName, $role]) {
        $username = generateUsername($firstName, $lastName);
        $password = generateDefaultPassword($firstName);
        $displayName = $firstName . ' ' . $lastName;
        $email = $username . '@ingot.local'; // Placeholder email
        
        try {
            // Check if username already exists
            $stmt = $db->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
            $stmt->execute([$username, $email]);
            
            if ($stmt->fetch()) {
                $results['skipped'][] = [
                    'username' => $username,
                    'reason' => 'Already exists'
                ];
                continue;
            }
            
            // Hash password with bcrypt (cost 12 for 256-bit security equivalent)
            $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            
            // Create user with username and must_change_password = TRUE
            $stmt = $db->prepare('
                INSERT INTO users (username, email, password_hash, display_name, must_change_password)
                VALUES (?, ?, ?, ?, TRUE)
            ');
            $stmt->execute([$username, $email, $passwordHash, $displayName]);
            
            $userId = $db->lastInsertId();
            
            // Create profile with profile_completed = FALSE
            $stmt = $db->prepare('
                INSERT INTO profiles (user_id, display_name, email, profile_completed)
                VALUES (?, ?, ?, FALSE)
            ');
            $stmt->execute([$userId, $displayName, $email]);
            
            // Assign role
            $stmt = $db->prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)');
            $stmt->execute([$userId, $role]);
            
            $results['created'][] = [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'display_name' => $displayName,
                'password' => $password, // Only shown during seeding!
                'role' => $role,
                'must_change_password' => true
            ];
            
        } catch (Exception $e) {
            $results['errors'][] = [
                'username' => $username,
                'error' => $e->getMessage()
            ];
        }
    }
    
    // Create lock file to prevent re-runs
    if (count($results['created']) > 0) {
        file_put_contents($lockFile, date('Y-m-d H:i:s'));
    }
    
    // Output results
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'User seeding completed',
        'summary' => [
            'created' => count($results['created']),
            'skipped' => count($results['skipped']),
            'errors' => count($results['errors'])
        ],
        'details' => $results,
        'credentials' => array_map(function($user) {
            return [
                'username' => $user['username'],
                'password' => $user['password'],
                'role' => $user['role'],
                'note' => 'Password change required on first login'
            ];
        }, $results['created']),
        'warning' => '⚠️ DELETE THIS FILE (seed-users.php) IMMEDIATELY FOR SECURITY!'
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    sendError('Seeding failed: ' . $e->getMessage(), 500);
}
