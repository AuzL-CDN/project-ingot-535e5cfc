# Project INGOT - Inspection Management System

## Overview

**Project INGOT** is a comprehensive web-based inspection management system designed specifically for government security inspectors. The application streamlines the entire inspection workflow from planning through reporting, with automated document generation and seamless Microsoft 365 integration.

### Key Features

- **Inspection Planning & Tracking**: Manage inspections with automated deadline calculations and status tracking
- **Automated Document Generation**: Generate approval letters, memorandums, final reports, and checklists from templates
- **Checklist Management**: Protected and Classified security checklists with scoring
- **Hardware Inventory**: Track security products and hardware across organizations
- **SharePoint Integration**: Seamless document storage and retrieval
- **Bilingual Support**: Full English and French language support
- **Offline Capability**: Continue working without internet connection

### Target Users

- Government Security Inspectors
- Security Compliance Officers
- Facility Security Officers
- Departmental Security Administrators

---

## Important Notice: No Software Installation Required

This deployment guide is designed for government environments where terminal commands and software installation are restricted. **All deployment steps use browser-based graphical user interfaces only.** No command-line tools, PowerShell scripts, or software downloads are required.

---

## Prerequisites Checklist

Before beginning deployment, ensure you have access to the following:

- [ ] **Microsoft 365 Account** with SharePoint Online access
- [ ] **SharePoint Admin Center** access (or contact with IT administrator who has this access)
- [ ] **Azure Portal** access (portal.azure.com) - requires Azure subscription
- [ ] **Power Automate** access (make.powerautomate.com)
- [ ] **Pre-built Application Package** - The `dist.zip` file provided by your development team
- [ ] **30-45 minutes** of uninterrupted time to complete setup

**Estimated Total Deployment Time**: 2-3 hours for first-time deployment

---

## Deployment Guide

This guide walks through deployment using only browser-based tools available in Microsoft 365 and Azure.

### Step 1: Create SharePoint Site

**Time Required**: ~10 minutes

1. **Access SharePoint Admin Center**
   - Open your web browser
   - Navigate to: `https://[yourtenant]-admin.sharepoint.com`
   - Sign in with your Microsoft 365 admin credentials

2. **Create Team Site**
   - Click **Sites** in the left navigation menu
   - Click **Active sites** → **Create**
   - Select **Team site**
   - Site name: `Project INGOT`
   - Site description: `Inspection Management System for Security Inspectors`
   - Primary administrator: Enter your email
   - Click **Finish**

3. **Verify Site Creation**
   - The site will appear in your Active sites list
   - Click the site name to open it in a new tab
   - You should see an empty Team site homepage
   - Copy the site URL (e.g., `https://[yourtenant].sharepoint.com/sites/ProjectINGOT`)
   - **Save this URL** - you'll need it later

**Success Check**: You can access the Project INGOT SharePoint site and see the default Team site homepage.

---

### Step 2: Create SharePoint Lists

**Time Required**: ~30 minutes

You will create 5 SharePoint lists to store inspection data. Each list is created using the SharePoint web interface.

#### 2.1: Create "Inspectors" List

1. **Create the List**
   - Navigate to your Project INGOT SharePoint site
   - Click **New** → **List**
   - Choose **Blank list**
   - Name: `Inspectors`
   - Description: `Active inspection tracking`
   - Click **Create**

2. **Add Columns**
   - Click **+ Add column** for each column below
   - Select the column type and enter the settings

   | Column Name | Type | Required | Additional Settings |
   |-------------|------|----------|---------------------|
   | OrgName | Single line of text | Yes | Max 255 characters |
   | InspectionDate | Date and time | Yes | Date only |
   | Status | Choice | Yes | Choices: Planning, In Progress, Under Review, Completed |
   | InspectorName | Single line of text | Yes | Max 255 characters |
   | FolderPath | Single line of text | No | Max 500 characters |

3. **Verify List Structure**
   - Click **List settings** (gear icon → List settings)
   - Scroll to **Columns** section
   - Verify all 5 columns are listed

#### 2.2: Create "Activities" List

1. **Create the List**
   - From Project INGOT site homepage
   - Click **New** → **List**
   - Choose **Blank list**
   - Name: `Activities`
   - Description: `Inspection activities log`
   - Click **Create**

2. **Add Columns** (14 columns total)

   | Column Name | Type | Required | Additional Settings |
   |-------------|------|----------|---------------------|
   | InspectionID | Number | Yes | Min: 0, No decimals |
   | ActivityType | Choice | Yes | Choices: Initial Contact, Site Visit, Document Review, Follow-up |
   | ActivityDate | Date and time | Yes | Date and time |
   | Description | Multiple lines of text | Yes | Plain text |
   | CompletedBy | Single line of text | Yes | Max 255 characters |
   | AttachmentPath | Single line of text | No | Max 500 characters |
   | OrgName | Single line of text | Yes | Max 255 characters |
   | ContactPerson | Single line of text | No | Max 255 characters |
   | Notes | Multiple lines of text | No | Enhanced rich text |
   | FollowUpRequired | Yes/No | Yes | Default: No |
   | FollowUpDate | Date and time | No | Date only |
   | Priority | Choice | No | Choices: Low, Medium, High, Critical |
   | Duration | Number | No | Min: 0, decimals allowed |
   | Location | Single line of text | No | Max 255 characters |

#### 2.3: Create "CorrectiveMeasures" List

1. **Create the List**
   - From Project INGOT site homepage
   - Click **New** → **List**
   - Choose **Blank list**
   - Name: `CorrectiveMeasures`
   - Description: `Tracking of corrective measures`
   - Click **Create**

2. **Add Columns**

   | Column Name | Type | Required | Additional Settings |
   |-------------|------|----------|---------------------|
   | InspectionID | Number | Yes | Min: 0, No decimals |
   | MeasureDescription | Multiple lines of text | Yes | Plain text |
   | DueDate | Date and time | Yes | Date only |
   | Status | Choice | Yes | Choices: Open, In Progress, Completed, Overdue |

#### 2.4: Create "ApprovalCCs" List

1. **Create the List**
   - From Project INGOT site homepage
   - Click **New** → **List**
   - Choose **Blank list**
   - Name: `ApprovalCCs`
   - Description: `CC recipients for approval letters`
   - Click **Create**

2. **Add Columns**

   | Column Name | Type | Required | Additional Settings |
   |-------------|------|----------|---------------------|
   | RecipientName | Single line of text | Yes | Max 255 characters |
   | RecipientTitle | Single line of text | Yes | Max 255 characters |
   | Organization | Single line of text | Yes | Max 255 characters |
   | Email | Single line of text | Yes | Max 255 characters |
   | IsActive | Yes/No | Yes | Default: Yes |
   | Category | Choice | No | Choices: Management, Security, Operations, External |

#### 2.5: Create "RunLog" List

1. **Create the List**
   - From Project INGOT site homepage
   - Click **New** → **List**
   - Choose **Blank list**
   - Name: `RunLog`
   - Description: `System activity audit log`
   - Click **Create**

2. **Add Columns**

   | Column Name | Type | Required | Additional Settings |
   |-------------|------|----------|---------------------|
   | Timestamp | Date and time | Yes | Date and time, default: current time |
   | UserEmail | Single line of text | Yes | Max 255 characters |
   | Action | Single line of text | Yes | Max 255 characters |
   | Details | Multiple lines of text | No | Plain text |
   | InspectionID | Number | No | Min: 0, No decimals |
   | Success | Yes/No | Yes | Default: Yes |
   | ErrorMessage | Multiple lines of text | No | Plain text |

**Success Check**: All 5 lists are visible on your Project INGOT site homepage. Each list contains the specified columns.

---

### Step 3: Set Up Document Library

**Time Required**: ~15 minutes

The document library stores Word templates and generated inspection documents.

#### 3.1: Create Folder Structure

1. **Access Document Library**
   - Navigate to your Project INGOT SharePoint site
   - Click **Documents** in the left navigation (default library)

2. **Create Templates Folder**
   - Click **New** → **Folder**
   - Name: `Templates`
   - Click **Create**

3. **Create Inspectors Folder**
   - Click **New** → **Folder**
   - Name: `Inspectors`
   - Click **Create**

#### 3.2: Upload Word Templates

1. **Navigate to Templates Folder**
   - Click on the **Templates** folder to open it

2. **Upload Template Files**
   - Click **Upload** → **Files**
   - Select all 6 template files provided by your development team:
     - `ApprovalLetter.docx`
     - `CSC_ApprovalLetter.docx`
     - `Checklist_Classified.docx`
     - `Checklist_Protected.docx`
     - `FinalReport.docx`
     - `Memorandum.docx`
   - Click **Open** to upload

3. **Verify Template Content Controls**
   - These templates contain special "Content Controls" for mail merge
   - **Do not modify** the content controls (they have names like `{OrgName}`, `{InspectorName}`, etc.)
   - If templates need updating, contact your development team

#### 3.3: Configure Library Permissions

1. **Set Library Permissions**
   - Click **Documents** library settings (gear icon → Library settings)
   - Click **Permissions for this document library**
   - Click **Stop Inheriting Permissions**
   - Grant permissions:
     - **Inspectors Group**: Edit permissions
     - **Admins Group**: Full control
     - **System Account**: Full control (for Power Automate)

**Success Check**: Templates folder contains 6 Word documents. Inspectors folder is empty and ready for use.

---

### Step 4: Register Application in Azure Portal

**Time Required**: ~15 minutes

This step creates an Azure AD app registration that allows the application to authenticate users and access SharePoint.

#### 4.1: Create App Registration

1. **Open Azure Portal**
   - Navigate to: `https://portal.azure.com`
   - Sign in with your Azure admin credentials

2. **Navigate to App Registrations**
   - In the search bar at the top, type `App registrations`
   - Click **App registrations** from the results

3. **Create New Registration**
   - Click **+ New registration**
   - Enter the following details:
     - **Name**: `Project INGOT`
     - **Supported account types**: Select `Accounts in this organizational directory only`
     - **Redirect URI**: 
       - Platform: `Single-page application (SPA)`
       - URI: `https://your-static-web-app.azurestaticapps.net` (temporary - will update later)
   - Click **Register**

4. **Copy Important IDs**
   - After registration, you'll see the **Overview** page
   - **Copy and save** the following values:
     - **Application (client) ID**: (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
     - **Directory (tenant) ID**: (e.g., `12345678-90ab-cdef-1234-567890abcdef`)
   - Save these in a text file named `Project-INGOT-Config.txt`

#### 4.2: Configure API Permissions

1. **Navigate to API Permissions**
   - In your app registration, click **API permissions** in the left menu

2. **Add Microsoft Graph Permissions**
   - Click **+ Add a permission**
   - Select **Microsoft Graph**
   - Select **Delegated permissions**
   - Add the following permissions:
     - `Sites.Read.All` - Read all site collections
     - `Sites.ReadWrite.All` - Read and write all site collections
     - `Files.Read.All` - Read all files
     - `Files.ReadWrite.All` - Read and write all files
     - `User.Read` - Sign in and read user profile
   - Click **Add permissions**

3. **Grant Admin Consent**
   - Click **Grant admin consent for [Your Organization]**
   - Click **Yes** in the confirmation dialog
   - All permissions should now show green checkmarks under **Status**

**Success Check**: Your app registration is created with all 5 permissions granted (green checkmarks visible).

---

### Step 5: Create Power Automate Flows

**Time Required**: ~30 minutes

Power Automate flows handle automated tasks like creating folders and generating documents. You'll create 3 flows using the visual designer.

#### 5.1: Flow #1 - Create Inspector Folder

This flow creates a folder in SharePoint when a new inspection is created.

1. **Open Power Automate**
   - Navigate to: `https://make.powerautomate.com`
   - Sign in with your Microsoft 365 credentials

2. **Create New Flow**
   - Click **+ Create** in the left menu
   - Select **Automated cloud flow**
   - Flow name: `Project INGOT - Create Inspector Folder`
   - Skip trigger selection
   - Click **Create**

3. **Add HTTP Request Trigger**
   - Search for `When an HTTP request is received`
   - Click to add it
   - Click **Generate from sample** under **Request Body JSON Schema**
   - Paste this sample:
     ```json
     {
       "orgName": "Sample Organization",
       "inspectionId": "12345"
     }
     ```
   - Click **Done**

4. **Add SharePoint Action**
   - Click **+ New step**
   - Search for `SharePoint Create folder`
   - Select **Create folder** (SharePoint)
   - Site Address: Select your Project INGOT site from dropdown
   - Folder Path: `/Inspectors`
   - Name: Use dynamic content → `orgName` (from the HTTP request)

5. **Add Second SharePoint Action**
   - Click **+ New step**
   - Search for `SharePoint Create item`
   - Select **Create item** (SharePoint)
   - Site Address: Select your Project INGOT site
   - List Name: `Inspectors`
   - Map fields:
     - Title: Use dynamic content → `orgName`
     - OrgName: Use dynamic content → `orgName`
     - FolderPath: Type `/Inspectors/` then add dynamic content → `orgName`

6. **Save and Get URL**
   - Click **Save** at the top
   - Click back on the **When an HTTP request is received** trigger
   - Copy the **HTTP POST URL** (appears after saving)
   - Save this URL in your `Project-INGOT-Config.txt` file as `CreateFolderFlowURL`

#### 5.2: Flow #2 - Generate Document from Template

This flow generates Word documents from templates with mail merge.

1. **Create New Flow**
   - Click **+ Create** → **Automated cloud flow**
   - Flow name: `Project INGOT - Generate Document`
   - Skip trigger selection → **Create**

2. **Add HTTP Request Trigger**
   - Add trigger: `When an HTTP request is received`
   - Generate schema from sample:
     ```json
     {
       "templateName": "ApprovalLetter.docx",
       "outputFileName": "ApprovalLetter_SampleOrg.docx",
       "folderPath": "/Inspectors/Sample Organization",
       "data": {
         "OrgName": "Sample Organization",
         "InspectorName": "John Doe",
         "InspectionDate": "2025-01-15"
       }
     }
     ```

3. **Get Template File**
   - Add action: `SharePoint Get file content`
   - Site Address: Project INGOT site
   - File Identifier: `/Documents/Templates/` then dynamic content → `templateName`

4. **Populate Word Template**
   - Add action: `Word Online (Business) Populate a Microsoft Word template`
   - Location: `SharePoint`
   - Document Library: Select your Project INGOT Documents library
   - File: Use dynamic content → `File content` (from previous step)
   - For each field in your template, use dynamic content from the `data` object

5. **Create File in SharePoint**
   - Add action: `SharePoint Create file`
   - Site Address: Project INGOT site
   - Folder Path: Use dynamic content → `folderPath`
   - File Name: Use dynamic content → `outputFileName`
   - File Content: Use dynamic content → `Populated document` (from Word action)

6. **Save and Get URL**
   - Click **Save**
   - Copy the **HTTP POST URL** from the trigger
   - Save as `GenerateDocFlowURL` in `Project-INGOT-Config.txt`

#### 5.3: Flow #3 - Upload Supporting Documents

This flow uploads files to SharePoint folders.

1. **Create New Flow**
   - Click **+ Create** → **Automated cloud flow**
   - Flow name: `Project INGOT - Upload Supporting Documents`
   - Skip trigger → **Create**

2. **Add HTTP Request Trigger**
   - Add trigger: `When an HTTP request is received`
   - Generate schema from sample:
     ```json
     {
       "fileName": "Document.pdf",
       "fileContent": "base64encodedcontent",
       "folderPath": "/Inspectors/Sample Organization/Supporting Documents"
     }
     ```

3. **Add Compose Action** (to decode base64)
   - Add action: `Compose`
   - Inputs: `base64ToBinary(triggerBody()?['fileContent'])`

4. **Create File**
   - Add action: `SharePoint Create file`
   - Site Address: Project INGOT site
   - Folder Path: Use dynamic content → `folderPath`
   - File Name: Use dynamic content → `fileName`
   - File Content: Use dynamic content → Outputs (from Compose action)

5. **Save and Get URL**
   - Click **Save**
   - Copy the **HTTP POST URL**
   - Save as `UploadFileFlowURL` in `Project-INGOT-Config.txt`

**Success Check**: All 3 flows are saved and you have 3 HTTP POST URLs copied to your config file.

---

### Step 6: Deploy to Azure Static Web Apps

**Time Required**: ~20 minutes

This step deploys the pre-built application package to Azure using only the Azure Portal web interface.

#### 6.1: Create Static Web App Resource

1. **Open Azure Portal**
   - Navigate to: `https://portal.azure.com`
   - Sign in with your Azure admin credentials

2. **Create Resource**
   - Click **+ Create a resource**
   - Search for `Static Web App`
   - Click **Static Web App**
   - Click **Create**

3. **Configure Basic Settings**
   - **Subscription**: Select your Azure subscription
   - **Resource Group**: Create new or select existing (e.g., `ProjectINGOT-RG`)
   - **Name**: `project-ingot` (this becomes part of your URL)
   - **Plan type**: Select `Free` (or `Standard` if you need custom domains)
   - **Region**: Select closest region (e.g., `Canada Central` or `Canada East`)
   - **Deployment source**: Select `Other`
   - Click **Review + create**
   - Click **Create**

4. **Wait for Deployment**
   - Deployment takes 1-2 minutes
   - Click **Go to resource** when deployment completes

5. **Copy Static Web App URL**
   - On the Overview page, find the **URL** (e.g., `https://project-ingot-abc123.azurestaticapps.net`)
   - Copy this URL
   - Save it in `Project-INGOT-Config.txt` as `AppURL`

#### 6.2: Upload Application Package

1. **Request dist.zip from Development Team**
   - Contact Austin Larocque (`austin.larocque@tpsgc-pwgsc.gc.ca`)
   - Request the pre-built `dist.zip` application package
   - This package contains all compiled application files ready for deployment

2. **Upload via Azure Portal**
   - In your Static Web App resource, look for upload functionality
   - **Note**: Manual upload via portal may be limited. If not available, the development team will need to push code to a connected GitHub repository for automatic deployment

#### 6.3: Configure Environment Variables

1. **Add Application Settings**
   - In Static Web App, click **Configuration** → **Application settings**
   - Click **+ Add**
   - Add each of the following settings (click **+ Add** for each):

   | Name | Value |
   |------|-------|
   | `VITE_SHAREPOINT_SITE_URL` | Your Project INGOT site URL from Step 1 |
   | `VITE_AZURE_CLIENT_ID` | Application ID from Step 4 |
   | `VITE_AZURE_TENANT_ID` | Directory ID from Step 4 |
   | `VITE_FLOW_CREATE_FOLDER` | CreateFolderFlowURL from Step 5 |
   | `VITE_FLOW_GENERATE_DOC` | GenerateDocFlowURL from Step 5 |
   | `VITE_FLOW_UPLOAD_FILE` | UploadFileFlowURL from Step 5 |

2. **Save Configuration**
   - Click **Save** at the top
   - Application will restart with new settings (takes 1-2 minutes)

#### 6.4: Update Azure AD Redirect URI

1. **Return to Azure AD App Registration**
   - Navigate to `https://portal.azure.com`
   - Go to **App registrations**
   - Click on **Project INGOT** app

2. **Update Redirect URI**
   - Click **Authentication** in left menu
   - Under **Single-page application** section
   - Replace the temporary URI with your actual Static Web App URL
   - Format: `https://project-ingot-abc123.azurestaticapps.net`
   - Click **Save**

**Success Check**: Navigate to your Static Web App URL. You should see the Project INGOT login page (authentication may not work yet until Step 7).

---

### Step 7: Configure System Administrators

**Time Required**: ~10 minutes

The application requires at least two mandatory system administrators for security compliance.

#### 7.1: Create UserRoles List

1. **Create List**
   - Navigate to your Project INGOT SharePoint site
   - Click **New** → **List**
   - Name: `UserRoles`
   - Description: `Application user roles and permissions`
   - Click **Create**

2. **Add Columns**

   | Column Name | Type | Required | Additional Settings |
   |-------------|------|----------|---------------------|
   | UserEmail | Single line of text | Yes | Max 255 characters |
   | Role | Choice | Yes | Choices: Admin, Inspector, Viewer |
   | IsActive | Yes/No | Yes | Default: Yes |

#### 7.2: Add Mandatory Administrators

1. **Add Austin Larocque**
   - Navigate to **UserRoles** list
   - Click **+ New**
   - Enter the following:
     - **Title**: `Austin Larocque`
     - **UserEmail**: `austin.larocque@tpsgc-pwgsc.gc.ca`
     - **Role**: `Admin`
     - **IsActive**: `Yes`
   - Click **Save**

2. **Add James Grace**
   - Click **+ New**
   - Enter the following:
     - **Title**: `James Grace`
     - **UserEmail**: `james.grace@tpsgc-pwgsc.gc.ca`
     - **Role**: `Admin`
     - **IsActive**: `Yes`
   - Click **Save**

3. **Add Additional Users** (Optional)
   - Inspectors: Create entries with Role = `Inspector`
   - Viewers: Create entries with Role = `Viewer`

**Success Check**: UserRoles list contains at least 2 admin entries.

---

### Step 8: Test Deployment

**Time Required**: ~15 minutes

Verify all components are working correctly before releasing to users.

#### 8.1: Login Test

1. Navigate to your Static Web App URL
2. Click **Sign In**
3. Authenticate with your Microsoft 365 account
4. You should be redirected to the application homepage
5. **Success**: Homepage displays with navigation tabs visible

#### 8.2: Inspector Creation Test

1. Click **Main Form** tab
2. Fill in the form:
   - Organization Name: `Test Organization`
   - Inspector Name: Your name
   - Inspection Date: Today's date
   - Status: `Planning`
3. Click **Save**
4. **Verify in SharePoint**:
   - Navigate to Project INGOT → **Documents** → **Inspectors**
   - Verify folder named `Test Organization` was created
   - Navigate to **Inspectors** list
   - Verify entry for "Test Organization" was added

#### 8.3: Document Generation Test

1. In the application, navigate to **Approval Letter** tab
2. Fill in required fields
3. Click **Generate Document**
4. Wait for success message
5. **Verify in SharePoint**:
   - Navigate to `/Documents/Inspectors/Test Organization/`
   - Verify the approval letter was created
   - Open the document and verify content is populated correctly

#### 8.4: File Upload Test

1. In the application, navigate to **Supporting Documents** tab
2. Drag and drop a test PDF file
3. Click **Upload**
4. Wait for success message
5. **Verify in SharePoint**:
   - Navigate to `/Documents/Inspectors/Test Organization/Supporting Documents/`
   - Verify the PDF file was uploaded

#### 8.5: RunLog Verification

1. Navigate to SharePoint → **RunLog** list
2. Verify entries were created for each test action
3. Check that `Success` column shows `Yes` for all entries
4. If any entries show `No`, check the `ErrorMessage` column

**Success Check**: All 5 tests pass without errors. SharePoint lists and folders contain expected data.

---

## Code Maintenance & Government GitHub Integration

### Overview

For long-term sustainability and government compliance, it is **strongly recommended** to link this application to your organization's Government GitHub Enterprise account. This provides:

- **Version Control**: Track all code changes with full audit history
- **Change Management**: Review and approve updates through pull requests
- **Government Ownership**: Source code remains under government control
- **Backup & Recovery**: Complete code backup with point-in-time restoration
- **Compliance**: Meets government IT security policies for code management
- **SME Independence**: Designated Subject Matter Expert (Austin Larocque) can maintain code without requiring IT resources from other projects

### Benefits of GitHub Integration

1. **No Additional Government Resources Required**
   - Single SME (Austin Larocque) maintains code
   - No impact on other IT staff workloads
   - Self-service model for updates and bug fixes

2. **Security & Compliance**
   - All code changes require review before deployment
   - Full audit trail of who changed what and when
   - Meets Treasury Board IT security requirements
   - Protected and Classified information handling standards

3. **Business Continuity**
   - Code backup in government-controlled repository
   - Multiple administrators can access if SME unavailable
   - Easy rollback to previous versions if issues arise

---

### GitHub Linking Scenario (GUI-Only)

This section provides a step-by-step scenario for linking the Project INGOT codebase to a Government of Canada GitHub Enterprise account **without using any terminal commands**. All steps use browser-based graphical interfaces.

#### Prerequisites

Before beginning, ensure you have:
- [ ] Government GitHub Enterprise account (e.g., `github.gc.ca` or `github.com/YourDepartment`)
- [ ] Repository creation permissions in your GitHub organization
- [ ] Admin access to the Project INGOT Lovable account (current code hosting)
- [ ] Designated SME identified: Austin Larocque (`austin.larocque@tpsgc-pwgsc.gc.ca`)

#### Step 1: Export from Lovable to GitHub

Lovable (the development platform used to build this application) supports direct GitHub integration via its web interface.

1. **Access Lovable Project**
   - Login to Lovable at `https://lovable.dev`
   - Open the **Project INGOT** project

2. **Connect to GitHub**
   - Click the **GitHub** button in the top-right corner
   - Click **Connect to GitHub**
   - In the popup, click **Authorize Lovable GitHub App**
   - You'll be redirected to GitHub - sign in with your government GitHub account

3. **Select GitHub Organization**
   - After authorization, select your government GitHub organization from the dropdown
   - Example: `gc-cit` or `PWGSC-Innovation`

4. **Create Initial Repository**
   - Click **Create Repository** in Lovable
   - Repository name: `project-ingot-source`
   - Description: `Project INGOT - Inspection Management System - Source Code`
   - Visibility: **Private** (required for government code)
   - Click **Create**

5. **Verify Initial Sync**
   - Lovable will automatically push all project files to GitHub
   - This takes 1-2 minutes
   - Once complete, you'll see a green checkmark and the GitHub repository URL
   - Copy this URL (e.g., `https://github.gc.ca/gc-cit/project-ingot-source`)

**Result**: Your codebase is now on Government GitHub. Any changes made in Lovable automatically sync to this repository.

#### Step 2: Create Production Repository on Government GitHub

For production deployment, create a separate repository that contains only production-ready code.

1. **Access Government GitHub**
   - Open your web browser
   - Navigate to your government GitHub instance (e.g., `https://github.gc.ca`)
   - Sign in with your credentials

2. **Create Production Repository**
   - Click **+** in top-right → **New repository**
   - Owner: Select your department organization (e.g., `gc-cit`)
   - Repository name: `project-ingot-production`
   - Description: `Project INGOT - Production Deployment - OFFICIAL USE ONLY`
   - Visibility: **Private**
   - **Do NOT** initialize with README (we'll import code)
   - Click **Create repository**

3. **Import Code from Source Repository**
   - On the new repository page, click **Import code**
   - Source repository URL: Paste the URL from Step 1 (e.g., `https://github.gc.ca/gc-cit/project-ingot-source`)
   - Click **Begin import**
   - Wait 2-3 minutes for import to complete
   - Click **Continue to repository** when finished

**Result**: You now have two repositories:
- **project-ingot-source**: Development code (synced with Lovable)
- **project-ingot-production**: Production code (manually updated after testing)

#### Step 3: Configure SME Access & Permissions

1. **Add SME as Collaborator**
   - In the **project-ingot-production** repository
   - Click **Settings** (top menu bar)
   - Click **Collaborators and teams** (left sidebar)
   - Click **Add people**
   - Search for: `austin.larocque@tpsgc-pwgsc.gc.ca`
   - Role: **Maintain** (allows merging pull requests and managing repository)
   - Click **Add [name] to this repository**

2. **Add Secondary Administrator**
   - Click **Add people** again
   - Search for: `james.grace@tpsgc-pwgsc.gc.ca`
   - Role: **Write** (allows reviewing code and suggesting changes)
   - Click **Add**

3. **Configure Organization Team Access** (Optional)
   - If your organization has a "Security Team" or "IT Team"
   - Click **Add teams**
   - Select team (e.g., `Security-Operations`)
   - Role: **Read** (view-only access for oversight)
   - Click **Add**

**Result**: SME has full maintenance access. Secondary admin can review. Security team can audit.

#### Step 4: Set Up Branch Protection

Branch protection prevents accidental changes to production code and enforces review workflows.

1. **Access Branch Settings**
   - In **project-ingot-production** repository
   - Click **Settings** → **Branches** (left sidebar)

2. **Add Branch Protection Rule**
   - Under **Branch protection rules**, click **Add rule**
   - Branch name pattern: `main`
   - Enable the following checkboxes:
     - ✅ **Require a pull request before merging**
     - ✅ **Require approvals**: Set to `1` (at least one approval required)
     - ✅ **Dismiss stale pull request approvals when new commits are pushed**
     - ✅ **Require review from Code Owners** (optional)
     - ✅ **Require conversation resolution before merging**
     - ✅ **Do not allow bypassing the above settings** (prevents admins from bypassing rules)
   - Click **Create** at bottom

**Result**: All changes to production code require review and approval before merging. No one (including admins) can bypass this process.

#### Step 5: Maintenance Workflow (GUI-Only)

Once GitHub is configured, here's how the SME maintains the application:

**For Bug Fixes or Updates:**

1. **SME Receives Bug Report**
   - User reports issue via email or RunLog
   - SME evaluates severity and priority

2. **Make Changes in Lovable** (if SME prefers visual development)
   - SME logs into Lovable
   - Makes code changes using Lovable's AI interface
   - Tests changes in Lovable preview
   - Changes automatically sync to **project-ingot-source** repository

3. **Create Pull Request on GitHub**
   - SME goes to GitHub **project-ingot-source** repository
   - GitHub automatically detects new commits
   - Click **Compare & pull request** button
   - Target repository: **project-ingot-production**
   - Target branch: `main`
   - Source repository: **project-ingot-source**
   - Source branch: `main`
   - Fill in description:
     - What was fixed
     - Why it was needed
     - Testing performed
   - Click **Create pull request**

4. **Code Review**
   - Secondary admin (James Grace) receives notification
   - Reviews changes in GitHub web interface
   - Clicks **Files changed** tab to see code differences (green = added, red = removed)
   - Adds comments if changes needed
   - Clicks **Approve** when satisfied

5. **Merge and Deploy**
   - SME clicks **Merge pull request**
   - Clicks **Confirm merge**
   - Download updated code as ZIP from GitHub
   - Upload to Azure Static Web App via portal

**For Reviewing Change History:**

1. **Access Commits**
   - Navigate to repository in GitHub
   - Click **Commits** (top menu)
   - View chronological list of all changes

2. **View Specific Change**
   - Click on any commit
   - See exactly what code changed
   - See who made the change and when
   - See review comments

3. **Rollback if Needed**
   - Click **Code** tab
   - Click the commit hash dropdown (e.g., `main` branch)
   - Select the commit you want to restore
   - Click **Download ZIP**
   - Upload to Azure Static Web App via portal

---

### Benefits Summary

| Capability | Without GitHub | With GitHub (SME Maintained) |
|------------|----------------|------------------------------|
| Code Backup | Only in Lovable | Government-controlled backup |
| Change Tracking | None | Full audit trail |
| Code Review | None | Required approval process |
| Rollback | Difficult | One-click restore |
| SME Independence | Depends on IT | Fully independent |
| Cost to Government | Zero | Zero (GitHub Enterprise already available) |
| IT Resource Impact | None | None (SME self-manages) |
| Compliance | Partial | Full TB IT requirements |

### Recommendation

**It is strongly recommended** to implement GitHub integration as described above. This requires approximately **1 hour of initial setup** but provides long-term sustainability, compliance, and independence from external platforms.

The designated SME (Austin Larocque) can perform all maintenance tasks using only web-based interfaces, without requiring terminal commands or specialized software installation.

---

## Post-Deployment

### User Training

After successful deployment, schedule training sessions:

1. **Administrator Training** (2 hours)
   - User management in UserRoles list
   - Monitoring RunLog for errors
   - Reviewing submitted inspections
   - Managing Power Automate flows

2. **Inspector Training** (1.5 hours)
   - Creating new inspections
   - Using checklists
   - Generating documents
   - Uploading supporting files
   - Navigating SharePoint document library

3. **Training Materials**
   - Create screen recordings of common tasks
   - Provide quick reference guides
   - Schedule quarterly refresher sessions

### Permission Management

Manage user access via SharePoint and Azure AD:

1. **SharePoint Permissions**
   - Site owners: Full control
   - Inspectors group: Edit permissions on lists/libraries
   - Viewers group: Read-only access

2. **Application Permissions**
   - Controlled via **UserRoles** list
   - Only users with entries in UserRoles can access the app
   - Admins can add/remove users by editing the list

3. **Power Automate Permissions**
   - Ensure Power Automate flows run under a service account
   - Service account must have **Site Collection Administrator** rights

### Monitoring

Monitor system health using these browser-based tools:

1. **RunLog List** (Daily)
   - Check for entries with `Success = No`
   - Review error messages
   - Verify all user actions are being logged

2. **Power Automate Run History** (Weekly)
   - Navigate to `https://make.powerautomate.com`
   - Click **My flows**
   - Click each Project INGOT flow
   - Click **Run history**
   - Verify all runs show green checkmarks

3. **SharePoint Storage** (Monthly)
   - Navigate to SharePoint Admin Center
   - Click **Active sites** → **Project INGOT**
   - Check **Storage** usage
   - Alert admins if approaching limit

### Maintenance Schedule

| Task | Frequency | Method |
|------|-----------|--------|
| Review RunLog errors | Daily | SharePoint list view |
| Check Power Automate flows | Weekly | Power Automate portal |
| Update Word templates | As needed | SharePoint document library |
| Review user permissions | Monthly | SharePoint site permissions |
| Archive old inspections | Quarterly | SharePoint manual archive |
| Check storage usage | Monthly | SharePoint Admin Center |

---

## Troubleshooting

### Issue: Users Cannot Login

**Symptoms**: Login page appears, but after Microsoft authentication, users get an error or are redirected back to login.

**Solutions**:
1. **Check Azure AD Redirect URI**
   - Open Azure Portal → App registrations → Project INGOT
   - Click **Authentication**
   - Verify redirect URI exactly matches your Static Web App URL
   - Ensure it's listed under **Single-page application** (not Web)

2. **Check API Permissions**
   - In App registration, click **API permissions**
   - Verify all 5 permissions show green checkmarks
   - If red X appears, click **Grant admin consent**

3. **Check UserRoles List**
   - User email must exist in UserRoles list
   - **Role** must be set to Admin, Inspector, or Viewer
   - **IsActive** must be Yes

### Issue: Folders Not Created Automatically

**Symptoms**: New inspections are saved, but folders don't appear in SharePoint Documents library.

**Solutions**:
1. **Check Power Automate Flow**
   - Navigate to `https://make.powerautomate.com`
   - Click **My flows** → **Project INGOT - Create Inspector Folder**
   - Click **Run history**
   - If red X appears, click to view error details

2. **Common Flow Errors**:
   - **"Access denied"**: Service account needs Site Collection Administrator rights
   - **"Item not found"**: Site URL in flow doesn't match actual site URL
   - **"Invalid request"**: HTTP request body doesn't match schema

3. **Test Flow Manually**:
   - In Power Automate, click the flow
   - Click **Run** → **Run flow**
   - Manually enter test data
   - Verify folder is created in SharePoint

### Issue: Documents Not Generating

**Symptoms**: Click "Generate Document" but file doesn't appear in SharePoint, or error message shown.

**Solutions**:
1. **Check Template File**
   - Navigate to SharePoint `/Documents/Templates/`
   - Verify template file exists with exact name
   - Open template and verify Content Controls are intact

2. **Check Flow Run History**:
   - Power Automate → **Project INGOT - Generate Document** flow
   - Click **Run history**
   - View error details

3. **Common Template Errors**:
   - **"Content control not found"**: Template missing required Content Control
   - **"Access denied"**: Service account lacks permissions
   - **"Invalid file format"**: Template is not .docx format

### Issue: File Uploads Fail

**Symptoms**: Drag-and-drop files but upload doesn't complete, or error appears.

**Solutions**:
1. **Check File Size**
   - SharePoint has default 250 MB file size limit
   - For larger files, contact SharePoint admin to increase limit

2. **Check Flow Run History**:
   - Power Automate → **Project INGOT - Upload Supporting Documents**
   - View recent run errors

3. **Check Folder Permissions**:
   - Verify user has Edit permissions on target folder
   - Service account running flow must have Full Control

### Issue: Application Won't Load

**Symptoms**: Static Web App URL shows blank page or error.

**Solutions**:
1. **Check Application Settings**
   - Azure Portal → Static Web Apps → Project INGOT
   - Click **Configuration** → **Application settings**
   - Verify all 6 VITE_* variables are present
   - Check for typos in URLs

2. **Check Deployment Status**:
   - In Static Web App, click **Environments**
   - Verify **Production** shows green checkmark
   - If red X, deployment failed - contact development team

3. **Browser Console Errors**:
   - Open application in web browser
   - Press **F12** to open Developer Tools
   - Click **Console** tab
   - Look for red error messages
   - Common issues: CORS errors (check Azure AD config), missing environment variables

### Getting Help

If issues persist after trying these solutions:

1. **Gather Information**:
   - Screenshot of error message
   - Steps to reproduce the issue
   - Time when error occurred
   - Username of affected user
   - Browser and version (e.g., Edge 120, Chrome 121)

2. **Check RunLog**:
   - Navigate to SharePoint → **RunLog** list
   - Filter by user and time
   - Note any entries with `Success = No`
   - Copy the `ErrorMessage` text

3. **Contact Support**:
   - Email: `austin.larocque@tpsgc-pwgsc.gc.ca`
   - Include all gathered information
   - Attach screenshots
   - Indicate urgency level

---

## Mandatory System Administrators

Per government security policy, the following individuals must maintain administrative access at all times:

### Primary Administrator

**Name**: Austin Larocque  
**Email**: austin.larocque@tpsgc-pwgsc.gc.ca  
**Role**: System Architect & Primary Administrator  
**Responsibilities**:
- System maintenance and updates
- User permission management
- Security policy enforcement
- Technical troubleshooting
- Code maintenance

### Secondary Administrator

**Name**: James Grace  
**Email**: james.grace@tpsgc-pwgsc.gc.ca  
**Role**: Secondary Administrator  
**Responsibilities**:
- Backup administrator access
- User support
- Report generation
- Inspection oversight

### Administrator Capabilities

System administrators have the following privileges:
- Full access to all SharePoint lists and libraries
- Power Automate flow modification rights
- Azure AD application configuration access
- User role assignment in UserRoles list
- RunLog access for audit purposes
- Static Web App configuration access

**Security Note**: Administrator accounts are monitored via RunLog. All administrative actions are logged for audit compliance.

---

## Additional Resources

### Microsoft Documentation

- [SharePoint Online Documentation](https://learn.microsoft.com/sharepoint/)
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/azure/static-web-apps/)
- [Power Automate Documentation](https://learn.microsoft.com/power-automate/)
- [Azure AD App Registration Guide](https://learn.microsoft.com/azure/active-directory/develop/quickstart-register-app)

### Government of Canada IT Standards

- [GC Cloud Guardrails](https://canada-ca.github.io/cloud-guardrails/)
- [ITSG-33 IT Security Risk Management](https://cyber.gc.ca/en/guidance/it-security-risk-management-lifecycle-approach-itsg-33)
- [Direction on Enabling Access to Web Services](https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32588)

### Internal Documentation

The `docs/` folder in this repository contains additional technical documentation:
- `APPLICATION-DOCUMENTATION.md` - Detailed application features and architecture
- `M365-Implementation-Guide.md` - Advanced Microsoft 365 integration topics
- `SharePoint-Technical-Migration-Guide.md` - Technical reference for IT staff
- `SYSTEM-REQUIREMENTS.md` - Detailed system requirements and dependencies

---

## Support and Contact Information

### Primary Technical Contact

**Austin Larocque**  
System Architect & SME  
Email: austin.larocque@tpsgc-pwgsc.gc.ca  
Availability: Monday-Friday, 8:00 AM - 4:00 PM EST

### Secondary Contact

**James Grace**  
Security Operations Lead  
Email: james.grace@tpsgc-pwgsc.gc.ca  
Availability: Monday-Friday, 8:00 AM - 4:00 PM EST

### When Contacting Support

Please include the following information:

1. **Issue Description**
   - What were you trying to do?
   - What happened instead?
   - Is this blocking your work?

2. **Error Details**
   - Exact error message (screenshot preferred)
   - Time when error occurred
   - Your username/email

3. **System Information**
   - Browser and version (e.g., Edge 120)
   - What page/tab you were on
   - Any recent changes to the system

4. **RunLog Evidence**
   - Check the RunLog SharePoint list
   - Note the ID of any failed entries
   - Include this in your email

### Emergency Procedures

For **critical system outages** affecting multiple users:

1. **Immediate Actions**
   - Note the exact time of outage
   - Check Azure Static Web Apps status (portal.azure.com)
   - Check Power Automate flow run history
   - Document any error messages

2. **Contact Primary Administrator**
   - Email: austin.larocque@tpsgc-pwgsc.gc.ca with subject line: **URGENT: Project INGOT Outage**
   - If no response within 2 hours, contact secondary administrator

3. **Temporary Workaround**
   - Users can still access SharePoint directly to view/download documents
   - Manual folder creation can be performed in SharePoint if needed
   - Inspectors list can be updated manually via SharePoint

---

## Version Information

**Current Version**: 1.0.0  
**Last Updated**: November 2025  
**Compatibility**:
- SharePoint Online (Microsoft 365)
- Azure Static Web Apps (Standard or Free tier)
- Power Automate (included with Microsoft 365)
- Modern browsers: Edge 120+, Chrome 120+, Firefox 120+

**Known Limitations**:
- Maximum file upload size: 250 MB (SharePoint default)
- Power Automate flow execution limit: 40,000 actions per month (Free) or 100,000 (Premium)
- Static Web App bandwidth: 100 GB/month (Free) or unlimited (Standard)

---

## License

**Project INGOT** is proprietary software developed for the Government of Canada. 

**Copyright © 2025 Public Works and Government Services Canada (PWGSC)**

All rights reserved. This software and associated documentation are the property of the Government of Canada. Unauthorized copying, distribution, modification, or use is strictly prohibited.

**For Licensing Inquiries**: Contact austin.larocque@tpsgc-pwgsc.gc.ca

---

## Acknowledgments

**Development Team**:
- Austin Larocque - System Architect & Lead Developer
- James Grace - Security Requirements & Testing

**Government Stakeholders**:
- Corporate Security & Continuity (CSC) Division
- Industrial Security Directorate (ISD)
- IT Security Services

**Special Thanks**:
- All security inspectors who provided feedback during beta testing
- SharePoint administrators who assisted with environment setup
- Azure DevOps team for deployment support

---

**End of Document**

For technical documentation and advanced topics, see the `docs/` folder in this repository.