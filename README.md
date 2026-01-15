# 🍁 INGOT - Inspection Management System

> **I**nspection **N**avigator for **G**overnment **O**perations & **T**racking

A sleek, secure, and bilingual inspection workflow system built for the Government of Canada. INGOT streamlines security inspections from initial contact through final approval—all in one powerful web application.

---

## ✨ What is INGOT?

INGOT is a comprehensive inspection management platform designed for DISIS (Departmental Industrial Security Inspection Services). It handles the complete lifecycle of security inspections:

- 📋 **Inspection Workflow** - From initial contact to final approval letter
- 📝 **Document Generation** - Auto-populated templates for memorandums, reports, and approval letters  
- 🔍 **Organization Search** - Quick lookup of organizations by OID, CAGE, or name
- 📧 **Email Templates** - Pre-formatted bilingual communications
- 👥 **Team Collaboration** - Multi-inspector support with role-based access
- 🌐 **Fully Bilingual** - Complete English/French support

---

## 🚀 Quick Start

### For Developers

```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Build for production
npm run build
```

### For Deployment (IONOS)

1. **Database Setup**
   - Create MySQL database in IONOS panel
   - Import `database/schema.sql` via phpMyAdmin

2. **Configure API**
   - Update `api/config.php` with your credentials (or set environment variables)

3. **Upload Files**
   - Build: `npm run build`
   - Upload `dist/` contents to web root
   - Upload `api/` folder to web root

4. **Create Admin User**
   - Insert first user via phpMyAdmin (see schema for structure)
   - First login will prompt password change

---

## 🔐 Security Features

- **256-bit Password Requirements** - 8+ chars, mixed case, numbers, symbols
- **Forced Password Change** - New users must change initial password
- **Rate Limiting** - Protection against brute force attacks
- **AES-256 Encryption** - Sensitive data encrypted at rest
- **Session-Based Auth** - Secure PHP sessions with CSRF protection
- **Role-Based Access** - Admin, Inspector, and Viewer roles

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | PHP 8.x, MySQL 8.x |
| Hosting | IONOS Shared Hosting (Apache) |
| Build | Vite |

---

## 📁 Project Structure

```
ingot/
├── api/                    # PHP backend endpoints
│   ├── config.php          # Database configuration (⚠️ update for your host)
│   ├── auth.php            # Authentication endpoints
│   ├── organizations.php   # Organization CRUD
│   └── ...
├── database/
│   └── schema.sql          # MySQL database schema
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # Custom React hooks
│   └── pages/              # Route pages
├── public/                 # Static assets
│   └── data/               # Excel data files
└── docs/                   # Word templates
```

---

## 🔧 Configuration

### Database (api/config.php)

The app uses environment variables with fallbacks. To migrate hosts:

```php
// Option 1: Set environment variables in hosting panel
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS

// Option 2: Update fallback values directly in config.php
define('DB_HOST', getenv('DB_HOST') ?: 'your-host.io');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'your_database');
define('DB_USER', getenv('DB_USER') ?: 'your_user');
define('DB_PASS', getenv('DB_PASS') ?: 'your_password');
```

---

## 👥 User Management

### Default Username Format
- Format: `firstname` + first initial of `lastname` (e.g., `austinl`)
- Initial Password: `firstname@Ingot2026!`

### Roles
- **Admin** - Full access, user management, system settings
- **Inspector** - Create/manage inspections, generate documents
- **Viewer** - Read-only access to assigned inspections

---

## 🇨🇦 Made with Pride

Built for the Government of Canada's security inspection teams. INGOT represents a modern approach to government software—fast, secure, and delightful to use.

*Inspection management, the way it should be.*

---

## 📄 License

Government of Canada Internal Use Only

---

<p align="center">
  <strong>🍁 INGOT</strong><br>
  <em>Streamlining Security Inspections Across Canada</em>
</p>
