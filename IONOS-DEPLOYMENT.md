# INGOT Deployment Guide for IONOS Shared Hosting

## Prerequisites
- IONOS shared hosting account with PHP 8.0+ and MySQL
- FTP client (FileZilla) or IONOS File Manager
- phpMyAdmin access

## Step 1: Create MySQL Database

1. Log into IONOS Control Panel
2. Navigate to **Hosting > Databases**
3. Create a new MySQL database:
   - Database name: `ingot_db`
   - Note the hostname, username, and password

## Step 2: Import Database Schema

1. Open phpMyAdmin from IONOS Control Panel
2. Select your new database
3. Go to **Import** tab
4. Upload `database/schema.sql`
5. Click **Go** to execute

## Step 3: Configure API

1. Edit `api/config.php` with your database credentials:
```php
define('DB_HOST', 'your-db-host.ionos.com');
define('DB_NAME', 'ingot_db');
define('DB_USER', 'your-username');
define('DB_PASS', 'your-password');
```

2. Update `APP_URL` to `https://ingot.watchnexus.ca`

## Step 4: Build React App

```bash
npm run build
```

This creates a `dist/` folder with production files.

## Step 5: Upload Files

Upload via FTP to your domain root (`/ingot.watchnexus.ca/`):

```
/ingot.watchnexus.ca/
├── api/                    ← Upload entire api/ folder
│   ├── config.php
│   ├── auth.php
│   ├── activities.php
│   └── ...
├── cron/                   ← Upload cron/ folder
│   └── check-deadlines.php
├── assets/                 ← From dist/assets/
├── index.html              ← From dist/
├── .htaccess               ← Root .htaccess
└── ...                     ← Other dist/ files
```

## Step 6: Set Up Cron Job

1. In IONOS Control Panel, go to **Cron Jobs**
2. Create new cron job:
   - Command: `php /homepages/XX/dXXXXXX/htdocs/ingot.watchnexus.ca/cron/check-deadlines.php`
   - Schedule: Daily at 8:00 AM

## Step 7: Create Admin User

In phpMyAdmin, run:
```sql
INSERT INTO users (email, password_hash, display_name) 
VALUES ('your-email@example.com', '$2y$10$YOUR_HASHED_PASSWORD', 'Admin');

INSERT INTO user_roles (user_id, role) VALUES (1, 'admin');
```

Generate password hash at: https://bcrypt-generator.com/

## Step 8: Test

1. Visit https://ingot.watchnexus.ca
2. Log in with admin credentials
3. Verify all features work

## Troubleshooting

- **500 Error**: Check PHP error logs in IONOS
- **CORS Issues**: Verify `.htaccess` is uploaded
- **Database errors**: Confirm credentials in `config.php`
