-- =====================================================
-- INGOT MySQL Database Schema
-- For deployment on IONOS shared hosting
-- With 256-bit encryption support and Login Prime 1
-- =====================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS cso_contacts;
DROP TABLE IF EXISTS activity_deadlines;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS rate_limits;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;

-- =====================================================
-- USERS TABLE (replaces Supabase auth.users)
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    must_change_password BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SESSIONS TABLE (for PHP session management)
-- =====================================================
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- RATE LIMITS TABLE (for login attempt tracking)
-- =====================================================
CREATE TABLE rate_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    attempts INT DEFAULT 1,
    first_attempt DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    blocked_until DATETIME NULL,
    INDEX idx_ip_action (ip_address, action_type),
    INDEX idx_blocked_until (blocked_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- USER ROLES TABLE (separate for security)
-- =====================================================
CREATE TABLE user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role ENUM('admin', 'moderator', 'user') NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PROFILES TABLE (with encrypted fields)
-- =====================================================
CREATE TABLE profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    display_name VARCHAR(100),
    initials VARCHAR(10),
    email TEXT,
    phone_encrypted TEXT,
    profile_completed BOOLEAN DEFAULT FALSE,
    encryption_version TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_profile_completed (profile_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ACTIVITIES TABLE (with encrypted data)
-- =====================================================
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_number VARCHAR(50) NOT NULL,
    org_site_number VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    inspection_class ENUM('1F', '1G', '19F', '19G') NOT NULL,
    activity_data_encrypted TEXT,
    activity_data JSON,
    encryption_version TINYINT DEFAULT 1,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_number (activity_number),
    INDEX idx_org_site_number (org_site_number),
    INDEX idx_is_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ACTIVITY DEADLINES TABLE
-- =====================================================
CREATE TABLE activity_deadlines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    deadline_type ENUM('checklist', 'doc', 'corrective_measures') NOT NULL,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    business_days_allocated INT NOT NULL,
    status ENUM('on_track', 'approaching', 'due', 'overdue') DEFAULT 'on_track',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    INDEX idx_activity_id (activity_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================
CREATE TABLE organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    org_site_id VARCHAR(50) NOT NULL UNIQUE,
    organization_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(50) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_org_site_id (org_site_id),
    INDEX idx_organization_name (organization_name),
    FULLTEXT INDEX ft_search (organization_name, address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CSO CONTACTS TABLE (with encrypted email)
-- =====================================================
CREATE TABLE cso_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    org_site_id VARCHAR(50) NOT NULL,
    role ENUM('CSO', 'ACSO') NOT NULL DEFAULT 'CSO',
    full_name VARCHAR(255) NOT NULL,
    email_encrypted TEXT,
    acso_index INT NULL,
    encryption_version TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_org_site_id (org_site_id),
    INDEX idx_role (role),
    INDEX idx_full_name (full_name),
    UNIQUE KEY unique_org_role_index (org_site_id, role, acso_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AUDIT LOGS TABLE (for security monitoring)
-- =====================================================
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_details JSON,
    ip_address VARCHAR(45),
    severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_severity (severity),
    INDEX idx_created_at (created_at),
    INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TRIGGER: Auto-create profile on user creation
-- =====================================================
DELIMITER //
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO profiles (user_id, display_name, email)
    VALUES (NEW.id, NEW.display_name, NEW.email);
END//
DELIMITER ;

-- =====================================================
-- TRIGGER: Auto-assign 'user' role on user creation
-- =====================================================
DELIMITER //
CREATE TRIGGER after_user_insert_role
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'user');
END//
DELIMITER ;

-- =====================================================
-- INITIAL ADMIN USER SETUP
-- Password: Admin@Ingot2026! (pre-hashed with bcrypt)
-- Change this password immediately after first login!
-- =====================================================
-- INSERT INTO users (username, email, password_hash, display_name, must_change_password) 
-- VALUES ('admina', 'admin@ingot.local', '$2y$10$...', 'Admin User', TRUE);
-- 
-- INSERT INTO user_roles (user_id, role) VALUES (1, 'admin');

-- =====================================================
-- CLEANUP: Remove expired sessions and old rate limits
-- Run daily via cron job
-- =====================================================
-- DELETE FROM sessions WHERE expires_at < NOW();
-- DELETE FROM rate_limits WHERE last_attempt < DATE_SUB(NOW(), INTERVAL 1 DAY);
-- DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
