<?php
/**
 * INGOT API Response Helpers
 * Standardized JSON response functions
 */

/**
 * Send a success response
 */
function sendSuccess(array $data = [], string $message = 'Success', int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Send an error response
 */
function sendError(string $message, int $statusCode = 400, array $details = []): void {
    http_response_code($statusCode);
    $response = [
        'success' => false,
        'error' => $message
    ];
    
    if (!empty($details)) {
        $response['details'] = $details;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Send a not found response
 */
function sendNotFound(string $message = 'Resource not found'): void {
    sendError($message, 404);
}

/**
 * Send an unauthorized response
 */
function sendUnauthorized(string $message = 'Unauthorized'): void {
    sendError($message, 401);
}

/**
 * Send a forbidden response
 */
function sendForbidden(string $message = 'Access denied'): void {
    sendError($message, 403);
}

/**
 * Send a validation error response
 */
function sendValidationError(array $errors): void {
    sendError('Validation failed', 422, $errors);
}

/**
 * Get JSON request body
 */
function getJsonBody(): array {
    // Reject payloads over 2MB
    $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 2 * 1024 * 1024) {
        sendError('Request body too large. Maximum size is 2MB.', 413);
    }
    
    $input = file_get_contents('php://input');
    if (empty($input)) {
        return [];
    }
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError('Invalid JSON payload', 400);
    }
    
    return $data ?? [];
}

/**
 * Validate required fields
 */
function validateRequired(array $data, array $requiredFields): array {
    $errors = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
        }
    }
    
    return $errors;
}

/**
 * Validate email format
 */
function validateEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Sanitize string input
 */
function sanitizeString(string $input): string {
    return trim($input);
}

function sanitizeForHtml(string $input): string {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}
