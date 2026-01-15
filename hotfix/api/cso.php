<?php
declare(strict_types=1);
/**
 * INGOT API - CSO (Chief Security Officer) Endpoints
 * 
 * Endpoints:
 * - GET ?org_site_id=XXX     - Get CSO/ACSOs for an organization
 * - GET ?search=name         - Search CSOs by name
 * - GET ?action=count        - Get total CSO count
 * - POST ?action=import      - Bulk import CSO data (admin only)
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/encryption.php';

// Route based on action/parameters
$action = getQueryParam('action', '');
$orgSiteId = getQueryParam('org_site_id', '');
$search = getQueryParam('search', '');

if ($action === 'import') {
    requireAdmin();
    handleBulkImport();
} elseif ($action === 'count') {
    handleCount();
} elseif (!empty($orgSiteId)) {
    handleGetByOrgSite($orgSiteId);
} elseif (!empty($search)) {
    handleSearch($search);
} else {
    handleList();
}

/**
 * Get CSOs/ACSOs for an organization
 */
function handleGetByOrgSite(string $orgSiteId): void {
    if (getRequestMethod() !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $db = getDB();
    
    $stmt = $db->prepare('
        SELECT id, org_site_id, role, full_name, email_encrypted, acso_index
        FROM cso_contacts
        WHERE org_site_id = ?
        ORDER BY 
            CASE role WHEN "CSO" THEN 0 ELSE 1 END,
            acso_index ASC
    ');
    $stmt->execute([$orgSiteId]);
    $contacts = $stmt->fetchAll();
    
    // Decrypt emails
    foreach ($contacts as &$contact) {
        if (!empty($contact['email_encrypted'])) {
            try {
                $contact['email'] = decryptData($contact['email_encrypted']);
            } catch (Exception $e) {
                $contact['email'] = ''; // Failed to decrypt
            }
        } else {
            $contact['email'] = '';
        }
        unset($contact['email_encrypted']);
    }
    
    sendSuccess([
        'org_site_id' => $orgSiteId,
        'contacts' => $contacts,
        'count' => count($contacts)
    ]);
}

/**
 * Search CSOs by name
 */
function handleSearch(string $query): void {
    if (getRequestMethod() !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $db = getDB();
    $searchTerm = '%' . $query . '%';
    
    $stmt = $db->prepare('
        SELECT id, org_site_id, role, full_name, email_encrypted, acso_index
        FROM cso_contacts
        WHERE full_name LIKE ?
        ORDER BY full_name ASC
        LIMIT 50
    ');
    $stmt->execute([$searchTerm]);
    $contacts = $stmt->fetchAll();
    
    // Decrypt emails
    foreach ($contacts as &$contact) {
        if (!empty($contact['email_encrypted'])) {
            try {
                $contact['email'] = decryptData($contact['email_encrypted']);
            } catch (Exception $e) {
                $contact['email'] = '';
            }
        } else {
            $contact['email'] = '';
        }
        unset($contact['email_encrypted']);
    }
    
    sendSuccess([
        'query' => $query,
        'contacts' => $contacts,
        'count' => count($contacts)
    ]);
}

/**
 * Get total CSO count
 */
function handleCount(): void {
    if (getRequestMethod() !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $db = getDB();
    
    $stmt = $db->prepare('SELECT COUNT(*) as total FROM cso_contacts');
    $stmt->execute();
    $result = $stmt->fetch();
    
    // Also get counts by role
    $stmt = $db->prepare('
        SELECT role, COUNT(*) as count 
        FROM cso_contacts 
        GROUP BY role
    ');
    $stmt->execute();
    $roleCounts = $stmt->fetchAll();
    
    sendSuccess([
        'total' => (int)$result['total'],
        'by_role' => array_column($roleCounts, 'count', 'role')
    ]);
}

/**
 * List all CSOs with pagination
 */
function handleList(): void {
    if (getRequestMethod() !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $limit = min((int)getQueryParam('limit', 50), 200);
    $offset = (int)getQueryParam('offset', 0);
    
    $db = getDB();
    
    $stmt = $db->prepare('
        SELECT id, org_site_id, role, full_name, acso_index
        FROM cso_contacts
        ORDER BY org_site_id ASC, 
            CASE role WHEN "CSO" THEN 0 ELSE 1 END,
            acso_index ASC
        LIMIT ? OFFSET ?
    ');
    $stmt->execute([$limit, $offset]);
    $contacts = $stmt->fetchAll();
    
    // Get total count
    $countStmt = $db->prepare('SELECT COUNT(*) as total FROM cso_contacts');
    $countStmt->execute();
    $total = $countStmt->fetch()['total'];
    
    sendSuccess([
        'contacts' => $contacts,
        'total' => (int)$total,
        'limit' => $limit,
        'offset' => $offset
    ]);
}

/**
 * Bulk import CSO data (admin only)
 */
function handleBulkImport(): void {
    if (getRequestMethod() !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $data = getJsonBody();
    
    if (!isset($data['contacts']) || !is_array($data['contacts'])) {
        sendError('Invalid request: contacts array required', 400);
    }
    
    $contacts = $data['contacts'];
    
    if (count($contacts) > 1000) {
        sendError('Maximum 1000 contacts per import batch', 400);
    }
    
    $db = getDB();
    $imported = 0;
    $skipped = 0;
    $errors = [];
    
    $stmt = $db->prepare('
        INSERT INTO cso_contacts (org_site_id, role, full_name, email_encrypted, acso_index)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            full_name = VALUES(full_name),
            email_encrypted = VALUES(email_encrypted)
    ');
    
    foreach ($contacts as $index => $contact) {
        try {
            // Validate required fields
            if (empty($contact['org_site_id']) || empty($contact['full_name'])) {
                $skipped++;
                continue;
            }
            
            $orgSiteId = trim($contact['org_site_id']);
            $role = strtoupper(trim($contact['role'] ?? 'CSO'));
            $fullName = trim($contact['full_name']);
            $email = trim($contact['email'] ?? '');
            $acsoIndex = isset($contact['acso_index']) ? (int)$contact['acso_index'] : null;
            
            // Validate role
            if (!in_array($role, ['CSO', 'ACSO'])) {
                $role = 'CSO';
            }
            
            // Encrypt email if provided
            $emailEncrypted = !empty($email) ? encryptData($email) : null;
            
            $stmt->execute([
                $orgSiteId,
                $role,
                $fullName,
                $emailEncrypted,
                $acsoIndex
            ]);
            
            $imported++;
            
        } catch (Exception $e) {
            $errors[] = [
                'index' => $index,
                'error' => $e->getMessage()
            ];
        }
    }
    
    sendSuccess([
        'imported' => $imported,
        'skipped' => $skipped,
        'errors' => count($errors),
        'error_details' => array_slice($errors, 0, 10) // Only return first 10 errors
    ], "Imported $imported CSO contacts");
}
