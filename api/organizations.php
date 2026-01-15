<?php
/**
 * INGOT API - Organizations Endpoints
 * 
 * Endpoints:
 * - GET    /organizations.php           - List organizations (with pagination)
 * - GET    /organizations.php?id=X      - Get organization by ID
 * - GET    /organizations.php?search=X  - Search organizations
 * - POST   /organizations.php           - Create organization (admin)
 * - POST   /organizations.php?action=import - Bulk import (admin)
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/middleware.php';

// Authentication required
requireAuth();

$method = getRequestMethod();
$id = getQueryParam('id');
$search = getQueryParam('search');
$action = getQueryParam('action');

if ($action === 'import') {
    handleBulkImport();
} elseif ($action === 'count') {
    handleGetCount();
} else {
    routeRequest([
        'GET' => function() use ($id, $search) {
            if ($id) {
                handleGetOrganization($id);
            } elseif ($search) {
                handleSearchOrganizations($search);
            } else {
                handleListOrganizations();
            }
        },
        'POST' => 'handleCreateOrganization'
    ]);
}

/**
 * Get organization count
 */
function handleGetCount(): void {
    $db = getDB();
    $stmt = $db->prepare('SELECT COUNT(*) as total FROM organizations');
    $stmt->execute();
    $result = $stmt->fetch();
    sendSuccess(['total' => (int)$result['total']]);
}

/**
 * List organizations with pagination
 */
function handleListOrganizations(): void {
    $db = getDB();
    
    $limit = min((int)getQueryParam('limit', 50), 100);
    $offset = max((int)getQueryParam('offset', 0), 0);
    
    $stmt = $db->prepare('SELECT * FROM organizations ORDER BY organization_name ASC LIMIT ? OFFSET ?');
    $stmt->execute([$limit, $offset]);
    $organizations = $stmt->fetchAll();
    
    // Get total count
    $stmt = $db->prepare('SELECT COUNT(*) as total FROM organizations');
    $stmt->execute();
    $total = $stmt->fetch()['total'];
    
    sendSuccess([
        'organizations' => $organizations,
        'total' => $total,
        'limit' => $limit,
        'offset' => $offset
    ]);
}

/**
 * Get organization by org_site_id
 */
function handleGetOrganization(string $id): void {
    $db = getDB();
    
    $stmt = $db->prepare('SELECT * FROM organizations WHERE org_site_id = ?');
    $stmt->execute([$id]);
    $organization = $stmt->fetch();
    
    if (!$organization) {
        sendNotFound('Organization not found');
    }
    
    sendSuccess(['organization' => $organization]);
}

/**
 * Search organizations by name or address
 */
function handleSearchOrganizations(string $search): void {
    if (strlen($search) < 2) {
        sendError('Search term must be at least 2 characters', 400);
    }
    
    $db = getDB();
    $searchTerm = '%' . $search . '%';
    
    // Try fulltext search first for better performance on large datasets
    try {
        $stmt = $db->prepare('
            SELECT *, MATCH(organization_name, address) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
            FROM organizations 
            WHERE MATCH(organization_name, address) AGAINST(? IN NATURAL LANGUAGE MODE)
            ORDER BY relevance DESC
            LIMIT 50
        ');
        $stmt->execute([$search, $search]);
        $organizations = $stmt->fetchAll();
        
        // If fulltext returns nothing, fallback to LIKE
        if (empty($organizations)) {
            throw new Exception('Fulltext returned empty');
        }
    } catch (Exception $e) {
        // Fallback to LIKE search
        $stmt = $db->prepare('
            SELECT * FROM organizations 
            WHERE org_site_id LIKE ? 
               OR organization_name LIKE ? 
               OR address LIKE ?
            ORDER BY organization_name ASC
            LIMIT 50
        ');
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm]);
        $organizations = $stmt->fetchAll();
    }
    
    sendSuccess([
        'organizations' => $organizations,
        'query' => $search,
        'count' => count($organizations)
    ]);
}

/**
 * Create new organization (admin only)
 */
function handleCreateOrganization(): void {
    requireAdmin();
    
    $data = getJsonBody();
    
    $errors = validateRequired($data, ['org_site_id', 'organization_name', 'address']);
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    $db = getDB();
    
    // Check for duplicate
    $stmt = $db->prepare('SELECT id FROM organizations WHERE org_site_id = ?');
    $stmt->execute([$data['org_site_id']]);
    
    if ($stmt->fetch()) {
        sendError('Organization with this site ID already exists', 409);
    }
    
    $stmt = $db->prepare('
        INSERT INTO organizations (org_site_id, organization_name, address, phone_number)
        VALUES (?, ?, ?, ?)
    ');
    
    $stmt->execute([
        sanitizeString($data['org_site_id']),
        sanitizeString($data['organization_name']),
        sanitizeString($data['address']),
        sanitizeString($data['phone_number'] ?? '')
    ]);
    
    $id = $db->lastInsertId();
    
    $stmt = $db->prepare('SELECT * FROM organizations WHERE id = ?');
    $stmt->execute([$id]);
    $organization = $stmt->fetch();
    
    sendSuccess(['organization' => $organization], 'Organization created', 201);
}

/**
 * Bulk import organizations (admin only)
 */
function handleBulkImport(): void {
    if (getRequestMethod() !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    requireAdmin();
    
    $data = getJsonBody();
    
    if (!isset($data['organizations']) || !is_array($data['organizations'])) {
        sendError('Organizations array required', 400);
    }
    
    $db = getDB();
    $imported = 0;
    $skipped = 0;
    $errors = [];
    
    $db->beginTransaction();
    
    try {
        $insertStmt = $db->prepare('
            INSERT INTO organizations (org_site_id, organization_name, address, phone_number)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            organization_name = VALUES(organization_name),
            address = VALUES(address),
            phone_number = VALUES(phone_number)
        ');
        
        foreach ($data['organizations'] as $index => $org) {
            if (empty($org['org_site_id']) || empty($org['organization_name']) || empty($org['address'])) {
                $skipped++;
                $errors[] = "Row $index: Missing required fields";
                continue;
            }
            
            $insertStmt->execute([
                sanitizeString($org['org_site_id']),
                sanitizeString($org['organization_name']),
                sanitizeString($org['address']),
                sanitizeString($org['phone_number'] ?? '')
            ]);
            
            $imported++;
        }
        
        $db->commit();
        
        sendSuccess([
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors
        ], "Imported $imported organizations");
        
    } catch (Exception $e) {
        $db->rollBack();
        sendError('Import failed: ' . $e->getMessage(), 500);
    }
}
