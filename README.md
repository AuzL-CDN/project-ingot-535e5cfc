# Project INGOT - Inspection Management System
## Comprehensive Deployment & Administration Guide

### 🔍 Project Overview

**Project INGOT** is a comprehensive Inspection Management System designed for government security inspectors to streamline inspection processes, automate document generation, and ensure compliance with security protocols. The system supports multiple inspection types and integrates with Microsoft 365 environments.

---

## 🚀 Production Deployment Guide

### Prerequisites

Before deploying Project INGOT, ensure you have:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: v2.28.0 or higher
- **Microsoft 365 Tenant**: With Global Administrator access
- **Azure AD**: Admin access for app registrations
- **SharePoint Online**: Site collection administrator access

---

## 📦 Building from Source Code

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd project-ingot

# Install all dependencies
npm install

# Verify installations
node --version    # Should show v18.0.0+
npm --version     # Should show v9.0.0+
```

### Step 2: Build Production Bundle

```bash
# Run production build
npm run build

# This creates an optimized production build in the /dist folder
# Output includes:
# - Minified JavaScript bundles
# - Optimized CSS files
# - Static assets (images, fonts)
# - HTML entry point (index.html)
```

### Step 3: Verify Build Output

```bash
# Preview the production build locally
npm run preview

# The application will be available at http://localhost:4173
# Test all critical features before deployment:
# ✓ Authentication flow
# ✓ Tab navigation
# ✓ Form submissions
# ✓ File uploads
# ✓ Document generation
```

---

## 🔄 Migrating from Supabase to Microsoft 365 Authentication

### Overview

Project INGOT was initially built with Supabase for rapid prototyping. For production deployment in government environments, you must replace Supabase authentication with Microsoft 365 Azure AD authentication.

---

### PHASE 1: Remove Supabase Dependencies

#### Step 1.1: Uninstall Supabase Packages

```bash
# Remove Supabase client library
npm uninstall @supabase/supabase-js

# Remove Supabase-related packages
npm uninstall @tanstack/react-query  # If only used for Supabase
```

#### Step 1.2: Delete Supabase Files

```bash
# Remove integration files
rm -rf src/integrations/supabase/

# Remove Supabase configuration
rm -rf supabase/

# Remove environment variables
# Edit .env and remove:
# - VITE_SUPABASE_PROJECT_ID
# - VITE_SUPABASE_PUBLISHABLE_KEY
# - VITE_SUPABASE_URL
```

#### Step 1.3: Remove Supabase Code References

Files to modify:
- `src/components/auth/AuthProvider.tsx` - Remove Supabase imports and logic
- `src/App.tsx` - Remove Supabase client initialization
- Any components importing from `@/integrations/supabase/client`

---

### PHASE 2: Configure Azure AD Application

#### Step 2.1: Create Azure AD App Registration

1. **Navigate to Azure Portal**
   - Go to https://portal.azure.com
   - Sign in with Global Administrator account

2. **Register New Application**
   ```
   Azure Active Directory → App registrations → New registration
   
   Name: Project INGOT - Inspection Management System
   Supported account types: Accounts in this organizational directory only
   Redirect URI: 
     - Type: Single-page application (SPA)
     - URI: https://your-domain.com (production URL)
     - Add: http://localhost:5173 (for local development)
   ```

3. **Record Application Details**
   ```
   Application (client) ID: [SAVE THIS - You'll need it]
   Directory (tenant) ID: [SAVE THIS - You'll need it]
   ```

#### Step 2.2: Configure API Permissions

Required Microsoft Graph API Permissions:

```
1. Navigate to: API permissions → Add a permission → Microsoft Graph

2. Add Delegated Permissions:
   ✓ User.Read                    - Read user profile
   ✓ User.ReadBasic.All           - Read all users' basic profiles
   ✓ Sites.ReadWrite.All          - Read and write to SharePoint sites
   ✓ Files.ReadWrite.All          - Read and write files
   ✓ offline_access               - Maintain access to data
   ✓ openid                       - OpenID Connect sign-in
   ✓ profile                      - View users' basic profile
   ✓ email                        - View users' email address

3. Grant Admin Consent:
   - Click "Grant admin consent for [Your Organization]"
   - Click "Yes" to confirm
   - All permissions should show "Granted for [Your Organization]"
```

#### Step 2.3: Configure Authentication Settings

```
1. Navigate to: Authentication

2. Platform configurations:
   - Single-page application: https://your-domain.com
   - Add additional redirect URIs as needed

3. Implicit grant and hybrid flows:
   ☑ Access tokens (used for implicit flows)
   ☑ ID tokens (used for implicit and hybrid flows)

4. Supported account types:
   ○ Accounts in this organizational directory only

5. Allow public client flows: No
```

---

### PHASE 3: Configure SharePoint Online

#### Step 3.1: Create SharePoint Site Collection

```bash
1. Navigate to SharePoint Admin Center
   https://[tenant]-admin.sharepoint.com

2. Create Site Collection:
   Sites → Active sites → Create

   Template: Team site
   Site name: Project INGOT
   Site address: /sites/ProjectINGOT
   Primary administrator: [Your admin account]
   Additional owners:
     - austin.larocque@tpsgc-pwgsc.gc.ca
     - james.grace@tpsgc-pwgsc.gc.ca
```

#### Step 3.2: Create SharePoint Lists

Execute these PowerShell commands or create manually:

```powershell
# Connect to SharePoint Online
Connect-PnPOnline -Url "https://[tenant].sharepoint.com/sites/ProjectINGOT" -Interactive

# Create Inspectors List
$inspectorsList = New-PnPList -Title "Inspectors" -Template GenericList
Add-PnPField -List "Inspectors" -DisplayName "Inspector Name" -InternalName "InspectorName" -Type Text -Required
Add-PnPField -List "Inspectors" -DisplayName "Initials" -InternalName "Initials" -Type Text -Required
Add-PnPField -List "Inspectors" -DisplayName "Email" -InternalName "Email" -Type Text -Required
Add-PnPField -List "Inspectors" -DisplayName "User ID" -InternalName "UserID" -Type Text -Required
Add-PnPField -List "Inspectors" -DisplayName "Folder Path" -InternalName "FolderPath" -Type Text

# Create Activities List
$activitiesList = New-PnPList -Title "Activities" -Template GenericList
Add-PnPField -List "Activities" -DisplayName "Activity Number" -InternalName "ActivityNumber" -Type Text -Required
Add-PnPField -List "Activities" -DisplayName "Organization Site ID" -InternalName "OrgSiteID" -Type Text
Add-PnPField -List "Activities" -DisplayName "Company Name" -InternalName "CompanyName" -Type Text
Add-PnPField -List "Activities" -DisplayName "Client Department" -InternalName "ClientDepartment" -Type Text
Add-PnPField -List "Activities" -DisplayName "CSO Name" -InternalName "CSOName" -Type Text
Add-PnPField -List "Activities" -DisplayName "CSO Email" -InternalName "CSOEmail" -Type Text
Add-PnPField -List "Activities" -DisplayName "Contract Type" -InternalName "ContractType" -Type Text
Add-PnPField -List "Activities" -DisplayName "Contract Number" -InternalName "ContractNumber" -Type Text
Add-PnPField -List "Activities" -DisplayName "Security Level" -InternalName "SecurityLevel" -Type Text
Add-PnPField -List "Activities" -DisplayName "Inspection Type" -InternalName "InspectionType" -Type Text
Add-PnPField -List "Activities" -DisplayName "Inspection Class" -InternalName "InspectionClass" -Type Text
Add-PnPField -List "Activities" -DisplayName "Date" -InternalName "InspectionDate" -Type DateTime
Add-PnPField -List "Activities" -DisplayName "Status" -InternalName "Status" -Type Choice -Choices "Not Started","In Progress","Completed"
Add-PnPField -List "Activities" -DisplayName "Inspector ID" -InternalName "InspectorID" -Type Text

# Create User Roles List
$userRolesList = New-PnPList -Title "UserRoles" -Template GenericList
Add-PnPField -List "UserRoles" -DisplayName "User ID" -InternalName "UserID" -Type Text -Required
Add-PnPField -List "UserRoles" -DisplayName "Email" -InternalName "Email" -Type Text -Required
Add-PnPField -List "UserRoles" -DisplayName "Role" -InternalName "Role" -Type Choice -Choices "admin","moderator","user","m365" -Required

# Create CorrectiveMeasures List
$correctiveMeasuresList = New-PnPList -Title "CorrectiveMeasures" -Template GenericList
Add-PnPField -List "CorrectiveMeasures" -DisplayName "Activity Number" -InternalName "ActivityNumber" -Type Text -Required
Add-PnPField -List "CorrectiveMeasures" -DisplayName "Measure Description" -InternalName "MeasureDescription" -Type Note
Add-PnPField -List "CorrectiveMeasures" -DisplayName "Status" -InternalName "Status" -Type Choice -Choices "Open","In Progress","Completed"
Add-PnPField -List "CorrectiveMeasures" -DisplayName "Due Date" -InternalName "DueDate" -Type DateTime

# Create RunLog List (Audit Trail)
$runLogList = New-PnPList -Title "RunLog" -Template GenericList
Add-PnPField -List "RunLog" -DisplayName "Action" -InternalName "Action" -Type Text -Required
Add-PnPField -List "RunLog" -DisplayName "User ID" -InternalName "UserID" -Type Text
Add-PnPField -List "RunLog" -DisplayName "Details" -InternalName "Details" -Type Note
Add-PnPField -List "RunLog" -DisplayName "Timestamp" -InternalName "Timestamp" -Type DateTime -Required

Write-Host "SharePoint Lists created successfully!" -ForegroundColor Green
```

#### Step 3.3: Create Document Library Structure

```powershell
# Create Document Library
New-PnPList -Title "Documents" -Template DocumentLibrary

# Create folder structure
Add-PnPFolder -Name "Templates" -Folder "Documents"
Add-PnPFolder -Name "Inspectors" -Folder "Documents"
Add-PnPFolder -Name "Generated" -Folder "Documents"

Write-Host "Document Library structure created!" -ForegroundColor Green
```

#### Step 3.4: Upload Word Templates

```powershell
# Upload templates from local docs/word-templates/ folder
$templateFiles = @(
    "ApprovalLetter.docx",
    "CSC_ApprovalLetter.docx",
    "Checklist_Protected.docx",
    "Checklist_Classified.docx",
    "FinalReport.docx",
    "Memorandum.docx"
)

foreach ($file in $templateFiles) {
    Add-PnPFile -Path "./docs/word-templates/$file" -Folder "Documents/Templates"
    Write-Host "Uploaded: $file" -ForegroundColor Cyan
}

Write-Host "All templates uploaded successfully!" -ForegroundColor Green
```

---

### PHASE 4: Configure Mandatory Administrators

#### Step 4.1: Add System Administrators via PowerShell

```powershell
# Connect to SharePoint List
Connect-PnPOnline -Url "https://[tenant].sharepoint.com/sites/ProjectINGOT" -Interactive

# Get User IDs from Azure AD
$austinUser = Get-PnPUser | Where-Object { $_.Email -eq "austin.larocque@tpsgc-pwgsc.gc.ca" }
$jamesUser = Get-PnPUser | Where-Object { $_.Email -eq "james.grace@tpsgc-pwgsc.gc.ca" }

# Add Austin Larocque as Admin
Add-PnPListItem -List "UserRoles" -Values @{
    "UserID" = $austinUser.Id
    "Email" = "austin.larocque@tpsgc-pwgsc.gc.ca"
    "Role" = "admin"
}

# Add James Grace as Admin
Add-PnPListItem -List "UserRoles" -Values @{
    "UserID" = $jamesUser.Id
    "Email" = "james.grace@tpsgc-pwgsc.gc.ca"
    "Role" = "admin"
}

Write-Host "Mandatory administrators configured successfully!" -ForegroundColor Green
Write-Host "Admins: Austin Larocque, James Grace" -ForegroundColor Yellow
```

#### Step 4.2: Verify Admin Access

```powershell
# Verify admin roles
$admins = Get-PnPListItem -List "UserRoles" -Query "<View><Query><Where><Eq><FieldRef Name='Role'/><Value Type='Choice'>admin</Value></Eq></Where></Query></View>"

Write-Host "Current System Administrators:" -ForegroundColor Cyan
foreach ($admin in $admins) {
    Write-Host "  - $($admin['Email']) (UserID: $($admin['UserID']))" -ForegroundColor Green
}
```

---

### PHASE 5: Install and Configure MSAL

#### Step 5.1: Install Microsoft Authentication Library

```bash
# Install MSAL React and Browser packages
npm install @azure/msal-react @azure/msal-browser

# Install Microsoft Graph Client (optional but recommended)
npm install @microsoft/microsoft-graph-client
```

#### Step 5.2: Create MSAL Configuration File

Create `src/config/authConfig.ts`:

```typescript
import { Configuration, LogLevel } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: [
    "User.Read",
    "User.ReadBasic.All",
    "Sites.ReadWrite.All",
    "Files.ReadWrite.All",
  ],
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphUsersEndpoint: "https://graph.microsoft.com/v1.0/users",
};
```

#### Step 5.3: Update AuthProvider Component

Replace `src/components/auth/AuthProvider.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from '@/config/authConfig';

interface Profile {
  id: string;
  display_name: string | null;
  email: string;
}

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  roles: string[];
  isAdmin: boolean;
  isModerator: boolean;
  isDev: boolean;
  isM365: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const user = accounts[0] || null;

  // Fetch user roles from SharePoint UserRoles list
  const fetchUserRoles = async (userId: string) => {
    try {
      const siteUrl = import.meta.env.VITE_SHAREPOINT_SITE_URL;
      const response = await fetch(
        `${siteUrl}/_api/web/lists/getbytitle('UserRoles')/items?$filter=UserID eq '${userId}'`,
        {
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Authorization': `Bearer ${accounts[0]?.idToken}`,
          },
        }
      );
      
      const data = await response.json();
      return data.d.results.map((item: any) => item.Role);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return ['user']; // Default role
    }
  };

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user) return;

    try {
      const userRoles = await fetchUserRoles(user.localAccountId);
      setRoles(userRoles);

      setProfile({
        id: user.localAccountId,
        display_name: user.name || null,
        email: user.username,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile();
    }
  };

  const signIn = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const signOut = async () => {
    try {
      await instance.logoutPopup();
      setProfile(null);
      setRoles([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && inProgress === InteractionStatus.None) {
      fetchProfile();
    }
    setLoading(inProgress !== InteractionStatus.None);
  }, [isAuthenticated, user, inProgress]);

  // Development mode override (localhost only)
  const isDev = window.location.hostname === 'localhost';
  const isAdmin = isDev || roles.includes('admin');
  const isModerator = roles.includes('moderator');
  const isM365 = roles.includes('m365');

  const value: AuthContextType = {
    user,
    profile,
    roles,
    isAdmin,
    isModerator,
    isDev,
    isM365,
    loading,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

#### Step 5.4: Update Main Application Entry Point

Update `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './config/authConfig';
import App from './App';
import './index.css';

const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
await msalInstance.initialize();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MsalProvider>
  </React.StrictMode>
);
```

---

### PHASE 6: Environment Configuration

#### Step 6.1: Create Production Environment File

Create `.env.production`:

```bash
# Azure AD Configuration
VITE_AZURE_TENANT_ID=your-tenant-id-here
VITE_AZURE_CLIENT_ID=your-client-id-here

# SharePoint Configuration
VITE_SHAREPOINT_SITE_URL=https://yourtenant.sharepoint.com/sites/ProjectINGOT

# Application Configuration
VITE_APP_VERSION=2.5.0
VITE_ENVIRONMENT=production

# Push Notifications (Configure after generating VAPID keys)
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key-here

# Power Automate Flow URLs (Configure these after creating flows)
VITE_FLOW_CREATE_FOLDER=https://prod-xx.westus.logic.azure.com:443/workflows/xxx
VITE_FLOW_GENERATE_DOC=https://prod-xx.westus.logic.azure.com:443/workflows/xxx
VITE_FLOW_UPLOAD_DOC=https://prod-xx.westus.logic.azure.com:443/workflows/xxx
```

#### Step 6.2: Security Hardening

```bash
# Never commit .env files to version control
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore

# Create .env.example for documentation
cat > .env.example << EOF
# Azure AD Configuration
VITE_AZURE_TENANT_ID=
VITE_AZURE_CLIENT_ID=

# SharePoint Configuration
VITE_SHAREPOINT_SITE_URL=

# Application Configuration
VITE_APP_VERSION=2.5.0
VITE_ENVIRONMENT=production

# Push Notifications
VITE_VAPID_PUBLIC_KEY=

# Power Automate Flow URLs
VITE_FLOW_CREATE_FOLDER=
VITE_FLOW_GENERATE_DOC=
VITE_FLOW_UPLOAD_DOC=
EOF
```

---

### PHASE 7: Configure Push Notifications System

Project INGOT includes a comprehensive deadline notification system that sends push notifications to users' browsers when inspection deadlines are approaching, due, or overdue.

#### Step 7.1: Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for Web Push notifications:

```bash
# Install web-push globally (if not already installed)
npm install -g web-push

# Generate VAPID key pair
web-push generate-vapid-keys

# Output will show:
# Public Key: BNxxx...
# Private Key: xxx...

# Save both keys securely
```

#### Step 7.2: Configure Environment Variables

Add the VAPID public key to your environment files:

**Production (.env.production):**
```bash
VITE_VAPID_PUBLIC_KEY=your-public-key-from-step-7.1
```

**Development (.env):**
```bash
VITE_VAPID_PUBLIC_KEY=your-public-key-from-step-7.1
```

**Note:** The private key should be stored as a Supabase secret (configured in Supabase Dashboard → Project Settings → Edge Functions → Secrets).

#### Step 7.3: Enable Database Extensions for Scheduled Notifications

The notification system uses PostgreSQL cron to check deadlines daily. Enable required extensions:

```sql
-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
```

Run this SQL in your Supabase SQL Editor.

#### Step 7.4: Schedule Daily Notification Check

Configure the cron job to run daily at 8:00 AM UTC:

```sql
SELECT cron.schedule(
  'check-deadline-notifications-daily',
  '0 8 * * *', -- Every day at 8:00 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://ejctzcsegswfrkwbywte.supabase.co/functions/v1/check-deadline-notifications',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqY3R6Y3NlZ3N3ZnJrd2J5d3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mjk1NDMsImV4cCI6MjA3NDMwNTU0M30.lu-xf1W72mRfCdGyUDTrcohJKkRxoWEzJZv0toZ5qWs"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

**Adjust timezone if needed:**
- 8 AM EST (UTC-5): use `'0 13 * * *'`
- 8 AM PST (UTC-8): use `'0 16 * * *'`
- 8 AM CST (UTC-6): use `'0 14 * * *'`

#### Step 7.5: Verify Cron Job Installation

```sql
-- View all scheduled jobs
SELECT * FROM cron.job;

-- Check job execution history
SELECT * FROM cron.job_run_details 
WHERE jobname = 'check-deadline-notifications-daily' 
ORDER BY start_time DESC 
LIMIT 10;
```

#### Step 7.6: Notification Trigger Points

The system automatically sends notifications at these intervals:

| Trigger Point | Days Before/After Due Date | Notification Type | Priority |
|--------------|---------------------------|-------------------|----------|
| **Upcoming** | 10 business days before | 📅 "Upcoming Deadline" | Normal |
| **Due Today** | 0 (on due date) | ⏰ "Deadline Due Today" | High |
| **Overdue** | 5 business days after | 🚨 "Deadline Overdue" | Critical |

#### Step 7.7: User Instructions for Enabling Notifications

Users must enable push notifications in their browser:

1. **Navigate to Admin Tab**
   - Click the Admin tab (visible to authenticated users)
   
2. **Enable Push Notifications**
   - Look for the "Push Notifications" card
   - Click "Enable Notifications" button
   - Allow browser notification permission when prompted

3. **Test Notifications**
   - Notifications appear in the notification header (bell icon)
   - In-app banners show at the top of the application
   - Browser push notifications appear even when the app is closed

#### Step 7.8: Troubleshooting Notifications

```bash
# Issue: Browser notifications not appearing
Solution:
1. Check browser notification permissions (browser settings)
2. Verify service worker is registered (DevTools → Application → Service Workers)
3. Check that VAPID public key is correctly configured in .env
4. Test with a different browser

# Issue: Cron job not running
Solution:
1. Verify pg_cron extension is enabled: SELECT * FROM pg_extension WHERE extname = 'pg_cron';
2. Check job status: SELECT * FROM cron.job WHERE jobname = 'check-deadline-notifications-daily';
3. Review job execution logs: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
4. Manually trigger the edge function to test: curl -X POST [edge-function-url]

# Issue: Notifications not sending
Solution:
1. Check edge function logs in Supabase Dashboard
2. Verify push subscriptions exist: SELECT COUNT(*) FROM push_subscriptions;
3. Test notification endpoint manually
4. Ensure user has active deadlines in the system
```

#### Step 7.9: Monitoring Notification System

```sql
-- Check active push subscriptions
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as unique_users
FROM push_subscriptions;

-- View users with approaching deadlines
SELECT 
  a.activity_number,
  a.company_name,
  ad.deadline_type,
  ad.due_date,
  ad.status
FROM activity_deadlines ad
JOIN activities a ON ad.activity_id = a.id
WHERE a.is_completed = false
ORDER BY ad.due_date ASC;

-- Check cron job execution history
SELECT 
  jobname,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobname = 'check-deadline-notifications-daily'
ORDER BY start_time DESC 
LIMIT 20;
```

---

### PHASE 8: Create Power Automate Flows

#### Flow 1: Create Inspector Folder

```
Trigger: HTTP Request
  Method: POST
  Body Schema: {
    "inspectorInitials": "string",
    "inspectorName": "string"
  }

Action 1: Create Folder
  Site Address: [Your SharePoint Site]
  Folder Path: /Documents/Inspectors/@{triggerBody()?['inspectorInitials']}

Action 2: Create Subfolders
  - Supporting Documents
  - Generated Reports
  - Checklists

Action 3: Respond to HTTP
  Status Code: 200
  Body: {"success": true, "folderPath": "@{outputs('Create_Folder')?['Path']}"}
```

#### Flow 2: Generate Document from Template

```
Trigger: HTTP Request
  Method: POST
  Body Schema: {
    "templateName": "string",
    "activityNumber": "string",
    "fieldData": {}
  }

Action 1: Get File Content (Template)
  Site Address: [Your SharePoint Site]
  File: /Documents/Templates/@{triggerBody()?['templateName']}

Action 2: Populate Word Template
  Use: Word Online Connector
  Template File: @{outputs('Get_File_Content')}
  Field Mappings: @{triggerBody()?['fieldData']}

Action 3: Create File (Generated Document)
  Site Address: [Your SharePoint Site]
  Folder Path: /Documents/Generated/@{triggerBody()?['activityNumber']}
  File Name: @{triggerBody()?['templateName']}_Generated_@{utcNow()}.docx
  File Content: @{outputs('Populate_Word_Template')?['body']}

Action 4: Respond to HTTP
  Status Code: 200
  Body: {"success": true, "documentUrl": "@{outputs('Create_File')?['Path']}"}
```

#### Flow 3: Upload Supporting Document

```
Trigger: HTTP Request
  Method: POST
  Body Schema: {
    "activityNumber": "string",
    "fileName": "string",
    "fileContent": "string (base64)"
  }

Action 1: Create File
  Site Address: [Your SharePoint Site]
  Folder Path: /Documents/Inspectors/@{triggerBody()?['inspectorInitials']}/Supporting Documents
  File Name: @{triggerBody()?['fileName']}
  File Content: @{base64ToBinary(triggerBody()?['fileContent'])}

Action 2: Respond to HTTP
  Status Code: 200
  Body: {"success": true, "fileUrl": "@{outputs('Create_File')?['Path']}"}
```

#### Save Flow URLs

After creating each flow:
1. Copy the HTTP POST URL
2. Add to `.env.production` file
3. Update environment configuration

---

---

## 🌐 Deployment to Production

### Option 1: Azure Static Web Apps (Recommended for M365)

```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Login to Azure
az login

# Create Static Web App
az staticwebapp create \
  --name project-ingot \
  --resource-group YourResourceGroup \
  --source /dist \
  --location "West US 2" \
  --branch main \
  --app-location "/" \
  --api-location "" \
  --output-location "dist"

# Deploy
swa deploy --env production
```

### Option 2: Azure App Service

```bash
# Create App Service Plan
az appservice plan create \
  --name project-ingot-plan \
  --resource-group YourResourceGroup \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name project-ingot \
  --resource-group YourResourceGroup \
  --plan project-ingot-plan \
  --runtime "NODE|18-lts"

# Deploy build
az webapp deployment source config-zip \
  --resource-group YourResourceGroup \
  --name project-ingot \
  --src ./dist.zip

# Configure environment variables
az webapp config appsettings set \
  --resource-group YourResourceGroup \
  --name project-ingot \
  --settings \
    VITE_AZURE_TENANT_ID=$VITE_AZURE_TENANT_ID \
    VITE_AZURE_CLIENT_ID=$VITE_AZURE_CLIENT_ID \
    VITE_SHAREPOINT_SITE_URL=$VITE_SHAREPOINT_SITE_URL
```

### Option 3: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod --dir=dist

# Set environment variables via Netlify dashboard
# Site settings → Environment variables → Add variables
```

### Option 4: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add VITE_AZURE_TENANT_ID
vercel env add VITE_AZURE_CLIENT_ID
vercel env add VITE_SHAREPOINT_SITE_URL
```

---

## ✅ Post-Deployment Verification

### Critical Testing Checklist

```bash
# 1. Authentication Flow
☐ Navigate to production URL
☐ Click "Sign In" button
☐ Microsoft login popup appears
☐ Successful authentication redirects to dashboard
☐ User profile loads correctly

# 2. Admin Access
☐ Login as austin.larocque@tpsgc-pwgsc.gc.ca
☐ Verify Admin tab is visible
☐ Test user management functions
☐ Login as james.grace@tpsgc-pwgsc.gc.ca
☐ Verify Admin tab is visible
☐ Confirm admin permissions are working

# 3. Core Functionality
☐ Inspector profile creation
☐ Activity creation and management
☐ Organization search and lookup
☐ File upload to SharePoint
☐ Document generation from templates
☐ Email template generation
☐ Final report creation

# 4. Notification System
☐ Push notification subscriptions working
☐ In-app notification banners displaying correctly
☐ Deadline notifications appear in notification header
☐ Cron job executing daily at scheduled time
☐ Edge function processing deadlines correctly
☐ Service worker registered and active

# 5. Integration Tests
☐ SharePoint list read/write operations
☐ Document library access
☐ Power Automate flow triggers
☐ Microsoft Graph API calls
☐ Template population and download

# 6. Performance Tests
☐ Page load time < 3 seconds
☐ File upload for 10MB+ files
☐ Concurrent user testing (10+ users)
☐ Network latency handling
☐ Browser compatibility (Chrome, Edge, Firefox)

# 7. Security Validation
☐ HTTPS enforcement
☐ Authentication token expiration handling
☐ Role-based access control
☐ Admin-only functions are restricted
☐ SharePoint permissions are correct
☐ No sensitive data in browser console
```

---

## 👥 Mandatory System Administrators

### Primary Administrators

**Austin Larocque**
- Email: austin.larocque@tpsgc-pwgsc.gc.ca
- Role: System Administrator
- Permissions: Full admin access, user management, system configuration
- Responsibilities: Primary system administration, technical support

**James Grace**
- Email: james.grace@tpsgc-pwgsc.gc.ca
- Role: System Administrator
- Permissions: Full admin access, user management, system configuration
- Responsibilities: Secondary system administration, backup support

### Admin Capabilities

Administrators have access to:
- **User Management**: Add, edit, remove users and assign roles
- **System Configuration**: Modify application settings and parameters
- **Data Import/Export**: Import organization data, export reports
- **System Status**: Monitor application health and performance
- **Role Assignment**: Grant admin, moderator, or user roles
- **Audit Logs**: View system activity and usage logs

---

## 🔒 Security Best Practices

### Production Security Checklist

```bash
# 1. Azure AD Security
☐ Multi-factor authentication (MFA) enabled for all users
☐ Conditional access policies configured
☐ Admin accounts use privileged identity management (PIM)
☐ Regular access reviews conducted

# 2. SharePoint Security
☐ External sharing disabled or restricted
☐ Document library permissions properly configured
☐ Sensitive data protected with encryption
☐ Version history enabled for audit trail

# 3. Application Security
☐ HTTPS enforced (no HTTP access)
☐ Content Security Policy (CSP) headers configured
☐ Environment variables never exposed in client code
☐ Regular security updates applied

# 4. Network Security
☐ Azure Front Door or CDN configured
☐ DDoS protection enabled
☐ IP restrictions for admin functions (optional)
☐ Rate limiting configured

# 5. Compliance
☐ Privacy policy published and accessible
☐ Data retention policies defined
☐ User consent mechanisms implemented
☐ GDPR/compliance requirements met
```

---

## 📊 Monitoring and Maintenance

### Application Monitoring

```bash
# Recommended Monitoring Tools

1. Azure Application Insights
   - Real-time performance monitoring
   - Error tracking and diagnostics
   - User behavior analytics
   - Custom telemetry and metrics

2. SharePoint Admin Center
   - Storage usage monitoring
   - User activity reports
   - Site health dashboard

3. Azure AD Sign-in Logs
   - Authentication success/failure rates
   - Suspicious login detection
   - User access patterns
```

### Maintenance Schedule

```
Daily:
☐ Review error logs in Application Insights
☐ Check authentication success rates
☐ Monitor API performance metrics

Weekly:
☐ Review user activity reports
☐ Check SharePoint storage usage
☐ Validate backup integrity
☐ Review security alerts

Monthly:
☐ Update npm dependencies (security patches)
☐ Review and rotate access credentials
☐ Conduct admin access review
☐ Test disaster recovery procedures
☐ Review Power Automate flow runs

Quarterly:
☐ Full security audit
☐ Performance optimization review
☐ User feedback collection and analysis
☐ Feature roadmap planning
```

---

## 🆘 Troubleshooting Guide

### Common Issues and Solutions

#### Authentication Errors

```bash
# Issue: "AADSTS50058: Silent sign-in failed"
Solution:
1. Clear browser cache and cookies
2. Check Azure AD app registration redirect URIs
3. Verify clientId and tenantId in configuration
4. Test in incognito/private browsing mode

# Issue: "Access token expired"
Solution:
1. Implement token refresh logic in AuthProvider
2. Use MSAL's acquireTokenSilent method
3. Add token refresh on 401 responses
```

#### SharePoint Access Issues

```bash
# Issue: "Access denied to SharePoint list"
Solution:
1. Verify Azure AD app has Sites.ReadWrite.All permission
2. Check admin consent was granted
3. Validate user has appropriate SharePoint permissions
4. Review list-level permissions in SharePoint

# Issue: "List or item not found"
Solution:
1. Confirm SharePoint lists were created correctly
2. Verify list names match exactly (case-sensitive)
3. Check site URL is correct in environment variables
4. Test API endpoint with Postman or similar tool
```

#### Power Automate Flow Errors

```bash
# Issue: "Flow trigger failed"
Solution:
1. Check flow URL is correct in .env file
2. Verify flow is turned ON in Power Automate
3. Review flow run history for error details
4. Test flow manually with sample data
5. Check authentication and permissions

# Issue: "Document generation failed"
Solution:
1. Verify template exists in SharePoint Templates folder
2. Check template content controls are properly named
3. Validate field data matches template structure
4. Review Word Online connector settings
5. Test with minimal data to isolate issue
```

---

## 📞 Support and Contact

### Technical Support

**Primary Contact:**
- Austin Larocque
- Email: austin.larocque@tpsgc-pwgsc.gc.ca
- Role: Lead System Administrator

**Secondary Contact:**
- James Grace  
- Email: james.grace@tpsgc-pwgsc.gc.ca
- Role: System Administrator

### Emergency Procedures

**Critical System Failure:**
1. Contact both system administrators immediately
2. Document error messages and screenshots
3. Check Azure status page: https://status.azure.com
4. Review Application Insights for error details
5. If necessary, revert to last known good deployment

**Security Incident:**
1. Contact IT Security team immediately
2. Notify system administrators
3. Document incident details
4. Preserve logs and evidence
5. Follow organizational security incident response procedures

---

## 📚 Additional Resources

### Documentation

- [Application Documentation](docs/APPLICATION-DOCUMENTATION.md)
- [SharePoint Technical Migration Guide](docs/SharePoint-Technical-Migration-Guide.md)
- [SharePoint Deployment Guide - Non-Technical](docs/SharePoint-Deployment-Guide-NonTechnical.md)
- [M365 Implementation Guide](docs/M365-Implementation-Guide.md)
- [Migration Verification Checklist](docs/Migration-Verification-Checklist.md)
- [Quick Start Checklist](docs/Quick-Start-Checklist.md)

### Microsoft Resources

- [Azure AD Documentation](https://docs.microsoft.com/azure/active-directory/)
- [MSAL.js Documentation](https://docs.microsoft.com/azure/active-directory/develop/msal-overview)
- [Microsoft Graph API](https://docs.microsoft.com/graph/)
- [SharePoint Online](https://docs.microsoft.com/sharepoint/)
- [Power Automate](https://docs.microsoft.com/power-automate/)

---

## 📝 Version Information

**Current Version:** 2.6.0  
**Last Updated:** 2025-01-28  
**Compatibility:** Microsoft 365, Azure AD, SharePoint Online, Supabase  
**Mandatory Admins:** Austin Larocque, James Grace  
**New Features:** Push Notifications, In-App Deadline Alerts, Automated Reminder System

---

## ⚖️ License and Compliance

**Copyright © 2025 - Public Services and Procurement Canada (PSPC)**  
**Project INGOT - Inspection Management System**

This application is developed for internal use within the Government of Canada. All rights reserved.

**Compliance:**
- Government of Canada Security Standards
- Privacy Act compliance
- WCAG 2.1 AA accessibility standards
- Official Languages Act (bilingual support)

---

**END OF DEPLOYMENT GUIDE**
