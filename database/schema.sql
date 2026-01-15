-- =====================================================
-- INGOT MySQL Database Schema
-- For deployment on IONOS shared hosting
-- =====================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS activity_deadlines;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;

-- =====================================================
-- USERS TABLE (replaces Supabase auth.users)
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
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
-- PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    display_name VARCHAR(100),
    email VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ACTIVITIES TABLE
-- =====================================================
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_number VARCHAR(50) NOT NULL,
    org_site_number VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    inspection_class ENUM('1F', '1G', '19F', '19G') NOT NULL,
    activity_data JSON,
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
-- Password: Admin123! (pre-hashed with bcrypt)
-- Change this password immediately after first login!
-- =====================================================
-- INSERT INTO users (email, password_hash, display_name) 
-- VALUES ('admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User');
-- 
-- INSERT INTO user_roles (user_id, role) VALUES (1, 'admin');

-- =====================================================
-- SAMPLE ORGANIZATION DATA (optional)
-- =====================================================
-- INSERT INTO organizations (org_site_id, organization_name, address, phone_number) VALUES
-- ('113-0', 'A.U.G. Signals Ltd.', '103-73 Richmond Street West Toronto ON M5H4E8', '(416) 923-4425'),
-- ('118-0', 'ABI/Advanced Business Interiors Inc.', '2355 St. Laurent Boulevard Ottawa ON K1G4L2', '(613) 738-1003');
