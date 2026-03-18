# Project INGOT — M365 Deployment Guide

> **Version 1.0** · Last updated 2026-03-18
>
> Step-by-step instructions for deploying Project INGOT on **SharePoint Online**, **Power Automate**, and **Power Apps** within a Microsoft 365 tenant.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [SharePoint Site Setup](#2-sharepoint-site-setup)
3. [SharePoint Lists — Field Definitions](#3-sharepoint-lists--field-definitions)
4. [Document Library & Word Templates](#4-document-library--word-templates)
5. [Azure AD App Registration](#5-azure-ad-app-registration)
6. [Power Automate Flows](#6-power-automate-flows)
7. [Power Apps Integration](#7-power-apps-integration)
8. [Environment Configuration](#8-environment-configuration)
9. [Testing & Validation](#9-testing--validation)
10. [Security Considerations](#10-security-considerations)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prerequisites

| Requirement | Details |
|---|---|
| **M365 Licence** | E3 / E5 or Business Premium (must include SharePoint Online and Power Automate) |
| **Admin Access** | SharePoint Admin + Global Admin (or Application Admin for Azure AD) |
| **PnP PowerShell** | `Install-Module PnP.PowerShell -Scope CurrentUser` — used by the automated setup script |
| **SharePoint Management Shell** | `Install-Module Microsoft.Online.SharePoint.PowerShell` |
| **Node.js ≥ 18** | Required to build and deploy the React front-end |
| **Git** | To clone the repository |

### Verify PnP PowerShell

```powershell
Get-Module PnP.PowerShell -ListAvailable
# Expected: 2.x or later
```

---

## 2. SharePoint Site Setup

### Option A — Automated Script

The repository includes a ready-made PowerShell script:

```powershell
.\docs\sharepoint-setup.ps1 `
  -TenantUrl   "https://TENANT-admin.sharepoint.com" `
  -SiteUrl     "https://TENANT.sharepoint.com/sites/ProjectINGOT" `
  -AdminEmail  "admin@TENANT.onmicrosoft.com"
```

This creates the site collection, all five lists, and the document-library folder structure in one run.

### Option B — Manual Setup

1. **Create Site Collection**
   - Go to **SharePoint Admin Centre → Active sites → + Create**
   - Template: **Team site (no M365 group)** — template `STS#3`
   - URL: `https://TENANT.sharepoint.com/sites/ProjectINGOT`
   - Storage quota: **1 024 MB** (adjust as needed)

2. **Wait for Provisioning** — Allow 1–2 minutes for the site to become available.

3. **Create Lists & Fields** — See [Section 3](#3-sharepoint-lists--field-definitions) below.

4. **Create Document Library Folders** — See [Section 4](#4-document-library--word-templates).

---

## 3. SharePoint Lists — Field Definitions

Create each list via **Site Contents → + New → List → Blank list**.

### 3.1 Inspectors

| Column | Type | Required | Notes |
|---|---|---|---|
| Title | Single line of text | ✅ | Inspector full name |
| Initials | Single line of text | ✅ | e.g. `JD` |
| Email | Single line of text | ✅ | Government email |
| FolderPath | Single line of text | ❌ | Auto-set by Power Automate flow |

### 3.2 Activities

| Column | Type | Required | Notes |
|---|---|---|---|
| Title | Single line of text | ✅ | Activity number (e.g. `2026-0042`) |
| OrgSiteNumber | Single line of text | ✅ | |
| CompanyName | Single line of text | ✅ | |
| ClientDepartment | Single line of text | ❌ | |
| ContractType | Choice | ❌ | Choices: `Government`, `Commercial`, `International` |
| ContractNumber | Single line of text | ❌ | |
| SecurityLevel | Choice | ❌ | Choices: `Unclassified`, `Protected A`, `Protected B`, `Protected C`, `Classified`, `Secret`, `Top Secret` |
| InspectionType | Choice | ❌ | Choices: `DoC`, `Onsite`, `Virtual`, `Remote` |
| InspectionClass | Choice | ❌ | Choices: `1F`, `1G`, `19F`, `19G` |
| InspectionDate | Date and Time | ✅ | Date only |
| Status | Choice | ❌ | Choices: `Draft`, `In Progress`, `Completed`, `Archived` |

### 3.3 CorrectiveMeasures

| Column | Type | Required | Notes |
|---|---|---|---|
| Title | Single line of text | ✅ | Auto-generated: `{ActivityNumber}-CM-{Index}` |
| ActivityNumber | Single line of text | ✅ | Links to Activities.Title |
| Index | Number | ✅ | 1-based sequential |
| MeasureText | Multiple lines of text | ✅ | Plain text |

### 3.4 ApprovalCCs

| Column | Type | Required | Notes |
|---|---|---|---|
| Title | Single line of text | ✅ | Auto-generated: `{ActivityNumber}-CC-{Index}` |
| ActivityNumber | Single line of text | ✅ | Links to Activities.Title |
| Index | Number | ✅ | 1-based sequential |
| CCName | Single line of text | ✅ | |
| CCTitle | Single line of text | ❌ | Job title |
| CCDepartment | Single line of text | ❌ | |
| CCEmail | Single line of text | ❌ | |

### 3.5 RunLog

| Column | Type | Required | Notes |
|---|---|---|---|
| Title | Single line of text | ✅ | Auto-generated: `{ActivityNumber}-{Timestamp}` |
| ActivityNumber | Single line of text | ✅ | |
| Action | Single line of text | ✅ | e.g. `GenerateDoc`, `UploadFile` |
| Result | Choice | ❌ | Choices: `Success`, `Error`, `Warning` |
| Message | Multiple lines of text | ❌ | Error details / notes |
| FileLink | Hyperlink or Picture | ❌ | URL to generated file |
| Timestamp | Date and Time | ✅ | Date and time |
| Inspector | Single line of text | ❌ | Inspector initials |

---

## 4. Document Library & Word Templates

### Folder Structure

In the default **Documents** (Shared Documents) library, create:

```
Documents/
├── Templates/          ← Word templates go here
└── Inspectors/         ← Per-inspector folders (created by flow)
    └── {Initials}/
        └── {ActivityNumber}/
            ├── FinalReport.docx
            ├── Memorandum.docx
            └── Supporting/
```

### Templates to Upload

Upload the following files from `docs/word-templates/` to **Documents › Templates**:

| # | File | Purpose |
|---|---|---|
| 1 | `ApprovalLetter.docx` | Standard approval letter |
| 2 | `CSC_ApprovalLetter.docx` | CSC-specific approval |
| 3 | `Checklist_Classified.docx` | Classified-level checklist |
| 4 | `Checklist_Protected.docx` | Protected-level checklist |
| 5 | `Corrective_Measures.docx` | Corrective measures report |
| 6 | `CSC-IT-Approval.docx` | CSC IT approval letter |
| 7 | `FinalReport.docx` | Standard final report |
| 8 | `IT-Approval.docx` | IT approval letter |
| 9 | `Initial_Email_Classified.docx` | Initial email (Classified) |
| 10 | `Initial_Email_Protected.docx` | Initial email (Protected) |
| 11 | `Memorandum.docx` | Memorandum template |
| 12 | `Sample_Corrective_Measures.docx` | Sample / reference |

> **Tip:** Each template uses `{{PLACEHOLDER}}` merge fields. See `docs/word-templates/README-Templates.md` for the full field reference.

---

## 5. Azure AD App Registration

### 5.1 Create the App

1. Go to **Azure Portal → Azure Active Directory → App registrations → + New registration**
2. Name: **Project INGOT**
3. Supported account types: **Accounts in this organizational directory only** (Single tenant)
4. Redirect URI (SPA):
   - `https://YOUR-APP.azurestaticapps.net` (production)
   - `http://localhost:5173` (local dev)
5. Click **Register**

### 5.2 Record IDs

| Value | Where to find | Maps to |
|---|---|---|
| Application (client) ID | Overview blade | `VITE_AZURE_CLIENT_ID` |
| Directory (tenant) ID | Overview blade | `VITE_AZURE_TENANT_ID` |

### 5.3 API Permissions

Navigate to **API permissions → + Add a permission → Microsoft Graph → Delegated permissions** and add:

| Permission | ID | Purpose |
|---|---|---|
| `Sites.ReadWrite.All` | `205e70e5-aba6-4c52-a976-6d2d46c48043` | Read/write SharePoint lists and libraries |
| `Files.ReadWrite` | `5a54b8b3-347c-476d-8f8e-42d5c7424d29` | Upload/download documents |

Click **Grant admin consent for [Tenant]**.

### 5.4 Authentication Settings

- Under **Authentication → Implicit grant and hybrid flows**, enable:
  - ✅ Access tokens
  - ✅ ID tokens
- Under **Authentication → Platform configurations**, confirm the SPA redirect URIs are listed.

---

## 6. Power Automate Flows

Create three flows in Power Automate. All use an **HTTP Request** trigger (When an HTTP request is received) so the React app can call them via their trigger URLs.

### 6.1 Flow: Create Inspector Folder

**Purpose:** When a new inspector is added, create their folder structure in SharePoint.

#### Trigger

- Type: **When an HTTP request is received**
- Method: `POST`
- Request Body JSON Schema:

```json
{
  "type": "object",
  "properties": {
    "inspectorInitials": { "type": "string" },
    "inspectorName":     { "type": "string" }
  },
  "required": ["inspectorInitials"]
}
```

#### Actions

| Step | Action | Configuration |
|---|---|---|
| 1 | **Create folder** (SharePoint) | Site: `ProjectINGOT` · Library: `Documents` · Path: `Inspectors/{inspectorInitials}` |
| 2 | **Update item** (SharePoint) | List: `Inspectors` · Update `FolderPath` to `Inspectors/{inspectorInitials}` |
| 3 | **Create item** (SharePoint) | List: `RunLog` · Action: `CreateFolder` · Result: `Success` |
| 4 | **Response** | Status `200` · Body: `{ "success": true, "folderPath": "..." }` |

#### Error Handling

- Add a **Scope** around steps 1–3 with a parallel **Scope** set to run on failure.
- On failure, log to RunLog with Result = `Error` and return status `500`.

---

### 6.2 Flow: Generate Document

**Purpose:** Populate a Word template with merge data and save the output to the inspector's folder.

#### Trigger

- Type: **When an HTTP request is received**
- Method: `POST`
- Request Body JSON Schema:

```json
{
  "type": "object",
  "properties": {
    "templateName":     { "type": "string" },
    "activityNumber":   { "type": "string" },
    "inspectorInitials":{ "type": "string" },
    "mergeData": {
      "type": "object",
      "description": "Key-value pairs matching {{PLACEHOLDER}} fields in the template"
    }
  },
  "required": ["templateName", "activityNumber", "inspectorInitials", "mergeData"]
}
```

#### Actions

| Step | Action | Configuration |
|---|---|---|
| 1 | **Get file content** (SharePoint) | Site: `ProjectINGOT` · Path: `Documents/Templates/{templateName}` |
| 2 | **Populate a Microsoft Word template** (Word Online) | Template: output of step 1 · Fields: mapped from `mergeData` |
| 3 | **Create folder** (SharePoint) | Path: `Documents/Inspectors/{inspectorInitials}/{activityNumber}` (ignore if exists) |
| 4 | **Create file** (SharePoint) | Path: `Documents/Inspectors/{inspectorInitials}/{activityNumber}/{templateName}` · Content: output of step 2 |
| 5 | **Create item** (SharePoint) | List: `RunLog` · Action: `GenerateDoc` · Result: `Success` · FileLink: URL of created file |
| 6 | **Response** | Status `200` · Body: `{ "success": true, "fileUrl": "..." }` |

> **Important:** The "Populate a Microsoft Word template" connector requires content controls in the `.docx` file. If your templates use `{{PLACEHOLDER}}` text instead, replace step 2 with a **Compose** action that does string replacement on the file's XML content, or use a third-party connector like **Encodian** or **Plumsail Documents**.

---

### 6.3 Flow: Upload Supporting Documents

**Purpose:** Accept a file upload from the app and store it in the correct activity folder.

#### Trigger

- Type: **When an HTTP request is received**
- Method: `POST`
- Request Body: Binary (set Content-Type header handling)

#### Query Parameters

| Parameter | Required | Description |
|---|---|---|
| `activityNumber` | ✅ | Target activity |
| `inspectorInitials` | ✅ | Inspector's folder |
| `fileName` | ✅ | Original file name |

#### Actions

| Step | Action | Configuration |
|---|---|---|
| 1 | **Create folder** (SharePoint) | Path: `Documents/Inspectors/{inspectorInitials}/{activityNumber}/Supporting` (ignore if exists) |
| 2 | **Create file** (SharePoint) | Path: `.../{activityNumber}/Supporting/{fileName}` · Content: trigger body |
| 3 | **Create item** (SharePoint) | List: `RunLog` · Action: `UploadDoc` · Result: `Success` |
| 4 | **Response** | Status `200` · Body: `{ "success": true, "fileUrl": "..." }` |

---

### Recording Flow URLs

After saving each flow, copy the **HTTP POST URL** from the trigger step:

```
https://prod-XX.eastus.logic.azure.com:443/workflows/GUID/triggers/manual/paths/invoke?api-version=...&sp=...&sv=...&sig=...
```

Map these to environment variables (see [Section 8](#8-environment-configuration)).

---

## 7. Power Apps Integration

There are two integration strategies:

### Option A — Embed the React App (Recommended)

Use the React front-end deployed to Azure Static Web Apps and embed it in a Power Apps canvas app or a SharePoint page via an **iframe** or **Power Apps component framework (PCF)** control.

1. **SharePoint Page:**
   - Edit a page on the Project INGOT site
   - Add an **Embed** web part
   - Paste the Azure Static Web Apps URL

2. **Canvas App:**
   - In Power Apps Studio, add an **HTML text** control
   - Set its `HtmlText` property to:
     ```
     "<iframe src='https://YOUR-APP.azurestaticapps.net' width='100%' height='100%' style='border:none;'></iframe>"
     ```

### Option B — Native Power Apps Canvas App

Build a separate canvas app that reads/writes directly to the SharePoint lists:

1. Create a new **Canvas app** from blank
2. Add **SharePoint** as a data source → connect to `ProjectINGOT` site
3. Add all five lists as data connections
4. Build screens for:
   - Inspector management
   - Activity creation / editing
   - Corrective measures entry
   - Document generation (call Power Automate flows via `Flow.Run`)

> Option A is recommended because it preserves the existing React UI, bilingual support, and advanced features (checklist analyzer, template field mapper, etc.).

---

## 8. Environment Configuration

Create a `.env.local` file in the project root (see `.env.example`):

```env
# Azure AD
VITE_AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# SharePoint
VITE_SHAREPOINT_SITE_URL=https://TENANT.sharepoint.com/sites/ProjectINGOT

# Power Automate Flow Trigger URLs
VITE_FLOW_CREATE_FOLDER=https://prod-xx.eastus.logic.azure.com:443/workflows/...
VITE_FLOW_GENERATE_DOC=https://prod-xx.eastus.logic.azure.com:443/workflows/...
VITE_FLOW_UPLOAD_DOC=https://prod-xx.eastus.logic.azure.com:443/workflows/...

# Optional
VITE_APP_VERSION=2.5.0
VITE_ENVIRONMENT=production
```

### Azure Static Web Apps

If deploying via GitHub Actions to Azure Static Web Apps, add these as **GitHub repository secrets** and reference them in the workflow YAML:

| Secret Name | Value |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | From Azure Portal → Static Web App → Manage deployment token |
| `VITE_AZURE_TENANT_ID` | Tenant ID |
| `VITE_AZURE_CLIENT_ID` | Client ID |
| `VITE_SHAREPOINT_SITE_URL` | SharePoint site URL |
| `VITE_FLOW_CREATE_FOLDER` | Flow URL |
| `VITE_FLOW_GENERATE_DOC` | Flow URL |
| `VITE_FLOW_UPLOAD_DOC` | Flow URL |

---

## 9. Testing & Validation

### Checklist

| # | Test | Expected Result |
|---|---|---|
| 1 | Open the app and sign in with Azure AD | Redirected to Microsoft login, then back to app |
| 2 | Create a new inspector | Inspector appears in SharePoint Inspectors list; folder created in Documents/Inspectors |
| 3 | Create a new activity | Activity item created in SharePoint Activities list |
| 4 | Generate a Final Report | Word document appears in `Documents/Inspectors/{initials}/{activity}/FinalReport.docx` with merged data |
| 5 | Upload a supporting document | File appears in `…/Supporting/` folder |
| 6 | Add corrective measures | Items appear in CorrectiveMeasures list linked to the activity |
| 7 | Check RunLog | All actions logged with correct timestamps and results |
| 8 | Test bilingual toggle | UI switches between English and French |
| 9 | Test on mobile | Responsive layout works on tablet/phone |
| 10 | Verify permissions | Non-admin user cannot access Admin tab |

### Power Automate Testing

- Open each flow → **Test → Manually**
- Send a test HTTP request using **Postman** or **curl**:

```bash
curl -X POST "FLOW_URL_HERE" \
  -H "Content-Type: application/json" \
  -d '{"inspectorInitials":"JD","inspectorName":"Jane Doe"}'
```

---

## 10. Security Considerations

### Authentication & Authorization

- **Azure AD SSO** handles authentication — no passwords stored in the app.
- **SharePoint permissions** control who can read/write each list and library.
- Assign users to the site via SharePoint groups:
  - **Owners** → Admins (full control)
  - **Members** → Inspectors (contribute)
  - **Visitors** → Read-only stakeholders

### Data Protection

- All data at rest is encrypted by Microsoft 365 (BitLocker + per-file encryption).
- Data in transit uses TLS 1.2+.
- Power Automate flow URLs contain a SAS signature — treat them as secrets.

### Row-Level Security Equivalent

SharePoint does not have native RLS like PostgreSQL. To restrict inspectors to their own data:

1. **Folder-level permissions:** Break inheritance on each inspector's folder and grant access only to that inspector.
2. **List views with filters:** Create personal views filtered by the current user's email.
3. **Power Automate validation:** Add a condition in each flow to verify the requesting user matches the inspector.

### Audit Trail

- The **RunLog** list provides an application-level audit trail.
- SharePoint's built-in **version history** and **audit logs** (Microsoft Purview) provide platform-level auditing.

---

## 11. Troubleshooting

| Issue | Solution |
|---|---|
| **CORS errors** in browser console | Ensure the Azure Static Web App URL is added as a redirect URI in the Azure AD app registration. For local dev, add `http://localhost:5173`. |
| **403 Forbidden** on SharePoint API calls | Verify API permissions have admin consent. Check the user has at least Member-level access to the site. |
| **Power Automate flow fails** | Check the flow run history in Power Automate portal. Common issues: incorrect SharePoint site URL, missing folder, template not found. |
| **Word template fields not replaced** | Ensure templates use Word **content controls** (not plain-text placeholders) if using the built-in Word Online connector. |
| **Login redirect loop** | Clear browser cache. Verify the redirect URI exactly matches (including trailing slash). |
| **Documents not appearing** | Check the folder path in the flow. Verify the inspector's `FolderPath` field is set in the Inspectors list. |

---

## Quick Reference

| Component | URL / Location |
|---|---|
| SharePoint Site | `https://TENANT.sharepoint.com/sites/ProjectINGOT` |
| Azure AD App | Azure Portal → App registrations → Project INGOT |
| Power Automate | `https://make.powerautomate.com` |
| React App (prod) | `https://YOUR-APP.azurestaticapps.net` |
| React App (dev) | `http://localhost:5173` |
| Setup Script | `docs/sharepoint-setup.ps1` |
| Word Templates | `docs/word-templates/` |
| Deployment Config | `docs/deployment-config.json` |
