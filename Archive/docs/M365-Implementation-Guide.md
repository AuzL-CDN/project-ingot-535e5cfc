# Project INGOT - M365 Implementation Guide

## Executive Summary
This guide provides step-by-step instructions to deploy Project INGOT (Inspection Management System) in a Microsoft 365 environment with minimal effort while ensuring full functionality and security compliance.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Phase 1: Environment Setup](#phase-1-environment-setup)
3. [Phase 2: Code Deployment](#phase-2-code-deployment)
4. [Phase 3: M365 Integration](#phase-3-m365-integration)
5. [Phase 4: Testing & Validation](#phase-4-testing--validation)
6. [Phase 5: Production Deployment](#phase-5-production-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Security Checklist](#security-checklist)

## Prerequisites

### Required M365 Licenses
- SharePoint Online Plan 2 (or M365 Business Premium)
- Power Platform licenses (Power Apps, Power Automate)
- Azure Active Directory P1/P2 (recommended for advanced security)

### Required Permissions
- SharePoint Site Collection Administrator
- Power Platform Administrator
- Azure Active Directory Administrator
- Global Administrator (for initial setup)

### Required Tools
- Node.js 18+ and npm/yarn
- Git client
- Modern web browser (Chrome, Edge, Firefox)
- Visual Studio Code (recommended)

## Phase 1: Environment Setup

### Step 1.1: Create SharePoint Site Collection
```powershell
# Connect to SharePoint Online
Connect-SPOService -Url https://yourtenant-admin.sharepoint.com

# Create new site collection
New-SPOSite -Url https://yourtenant.sharepoint.com/sites/ProjectINGOT -Owner admin@yourtenant.com -StorageQuota 1024 -Template STS#3 -Title "Project INGOT - Inspection Management"
```

### Step 1.2: Configure SharePoint Lists
Navigate to your SharePoint site and create the following lists:

#### Inspectors List
- **Name**: `Inspectors`
- **Columns**:
  - Title (Single line of text) - Inspector Name
  - Initials (Single line of text)
  - Email (Single line of text)
  - FolderPath (Single line of text)
  - Created (Date and Time) - Auto-populated
  - Modified (Date and Time) - Auto-populated

#### Activities List  
- **Name**: `Activities`
- **Columns**:
  - Title (Single line of text) - Activity Number
  - OrgSiteNumber (Single line of text)
  - CompanyName (Single line of text)
  - ClientDepartment (Single line of text)
  - ContractType (Choice: Government, Commercial, International)
  - ContractNumber (Single line of text)
  - SecurityLevel (Choice: Unclassified, Protected A, Protected B, Protected C, Classified, Secret, Top Secret)
  - InspectionType (Choice: DoC, Onsite, Virtual, Remote)
  - InspectionClass (Choice: 1F, 1G, 19F, 19G)
  - InspectionDate (Date and Time)
  - InspectorRef (Lookup to Inspectors list)
  - Status (Choice: Draft, In Progress, Completed, Archived)

#### CorrectiveMeasures List
- **Name**: `CorrectiveMeasures`
- **Columns**:
  - Title (Single line of text) - Auto-generated
  - ActivityNumber (Lookup to Activities list)
  - Index (Number)
  - MeasureText (Multiple lines of text)

#### ApprovalCCs List
- **Name**: `ApprovalCCs`
- **Columns**:
  - Title (Single line of text) - Auto-generated
  - ActivityNumber (Lookup to Activities list)
  - Index (Number)
  - CCName (Single line of text)
  - CCTitle (Single line of text)
  - CCDepartment (Single line of text)
  - CCEmail (Single line of text)

#### RunLog List
- **Name**: `RunLog`
- **Columns**:
  - Title (Single line of text) - Auto-generated
  - ActivityNumber (Lookup to Activities list)
  - Action (Single line of text)
  - Result (Choice: Success, Error, Warning)
  - Message (Multiple lines of text)
  - FileLink (Hyperlink)
  - Timestamp (Date and Time)
  - Inspector (Single line of text)

### Step 1.3: Create Document Library Structure
1. Navigate to **Documents** library in your SharePoint site
2. Create the following folder structure:
```
Documents/
├── Templates/
│   ├── ApprovalLetter.docx
│   ├── DoC.docx
│   ├── Memorandum.docx
│   ├── Inspection.docx
│   └── CorrectiveMeasures.docx
└── Inspectors/
    └── [Inspector folders will be auto-created]
```

### Step 1.4: Upload Word Templates
Create Word templates with content controls for each document type:

#### ApprovalLetter.docx Template
```xml
<!-- Content Controls to include: -->
- InspectorInitials
- Date
- CSOFullName
- CompanyName
- OrgNumber
- Contracts
- SecurityLevel
- CCList (repeating section)
```

#### DoC.docx Template
```xml
<!-- Content Controls to include: -->
- OrgName
- OrgNumber
- OrgAddress
- CSOName
- CurrentContract
- PreviousContract
- PreviousInspectionDate
```

Upload these templates to the `Documents/Templates/` folder.

## Phase 2: Code Deployment

### Step 2.1: Clone Repository
```bash
# Clone your GitHub repository
git clone https://github.com/yourusername/project-ingot.git
cd project-ingot

# Install dependencies
npm install
```

### Step 2.2: Configure Environment Variables
Create `.env.local` file:
```env
# SharePoint Configuration
REACT_APP_SHAREPOINT_SITE_URL=https://yourtenant.sharepoint.com/sites/ProjectINGOT
REACT_APP_TENANT_ID=your-tenant-id
REACT_APP_CLIENT_ID=your-app-registration-id

# Azure AD Configuration
REACT_APP_AAD_APP_ID=your-azure-ad-app-id
REACT_APP_AAD_TENANT=yourtenant.onmicrosoft.com

# Power Platform Configuration  
REACT_APP_POWER_AUTOMATE_BASE_URL=https://prod-xx.westus.logic.azure.com
```

### Step 2.3: Build and Test Locally
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Test production build
npm run preview
```

### Step 2.4: Deploy to Azure Static Web Apps
```bash
# Install Azure CLI
# Create resource group
az group create --name rg-project-ingot --location "West US 2"

# Create static web app
az staticwebapp create \
    --name project-ingot \
    --resource-group rg-project-ingot \
    --source https://github.com/yourusername/project-ingot \
    --location "West US 2" \
    --branch main \
    --app-location "/" \
    --api-location "api" \
    --output-location "dist"
```

## Phase 3: M365 Integration

### Step 3.1: Create Azure AD App Registration
1. Navigate to Azure Portal > Azure Active Directory > App registrations
2. Click "New registration"
3. Configure:
   - **Name**: Project INGOT
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Web - https://your-static-web-app.azurestaticapps.net
4. Note the **Application (client) ID**

### Step 3.2: Configure API Permissions
Add the following Microsoft Graph permissions:
- Sites.Read.All
- Sites.ReadWrite.All
- Files.Read.All
- Files.ReadWrite.All
- User.Read

Grant admin consent for all permissions.

### Step 3.3: Create Power Automate Flows

#### Flow 1: Create Inspector Folder
**Trigger**: When an HTTP request is received
**Actions**:
1. Parse JSON (inspector data)
2. Create folder in SharePoint
3. Set folder permissions
4. Return success response

#### Flow 2: Generate Document
**Trigger**: When an HTTP request is received  
**Actions**:
1. Parse JSON (document data)
2. Populate Word template
3. Save to SharePoint
4. Convert to PDF
5. Log to RunLog list
6. Return file links

#### Flow 3: Upload Supporting Documents
**Trigger**: When an HTTP request is received
**Actions**:
1. Parse JSON (file data)
2. Create activity folder structure
3. Upload files to appropriate folders
4. Update permissions
5. Log upload activity

### Step 3.4: Update React App Configuration
Install required packages:
```bash
npm install @azure/msal-browser @azure/msal-react @microsoft/microsoft-graph-client
```

Create authentication configuration:
```typescript
// src/config/authConfig.ts
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["Sites.Read.All", "Sites.ReadWrite.All", "Files.ReadWrite.All"]
};
```

## Phase 4: Testing & Validation

### Step 4.1: Functional Testing Checklist
- [ ] Inspector profile creation and folder generation
- [ ] Main form data entry and validation
- [ ] Cross-tab data propagation
- [ ] Search functionality (by Activity Number and Org Number)
- [ ] Document generation (all types)
- [ ] File upload to correct folders
- [ ] Approval letter with CC functionality
- [ ] Conditional tab visibility based on Inspection Class
- [ ] Status tab showing run history
- [ ] All form validations working

### Step 4.2: Security Testing Checklist
- [ ] Authentication required for access
- [ ] Proper permissions on SharePoint folders
- [ ] Input validation on all fields
- [ ] No sensitive data in browser storage
- [ ] HTTPS enforcement
- [ ] Content Security Policy headers
- [ ] Cross-origin request protection

### Step 4.3: Performance Testing
```bash
# Run Lighthouse audit
npm install -g lighthouse
lighthouse https://your-app-url --output html --output-path ./lighthouse-report.html

# Run bundle analyzer
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer dist
```

### Step 4.4: Integration Testing
Test each Power Automate flow manually:
1. Create test inspector profile
2. Generate each document type
3. Upload test files
4. Verify SharePoint list updates
5. Check folder structure creation
6. Validate document generation

## Phase 5: Production Deployment

### Step 5.1: Pre-Production Checklist
- [ ] All environment variables configured
- [ ] SSL certificate installed and valid
- [ ] Custom domain configured (if required)
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] User acceptance testing completed
- [ ] Security review completed
- [ ] Performance benchmarks met

### Step 5.2: Go-Live Steps
1. **Final Deployment**:
   ```bash
   # Deploy to production
   npm run build
   # Upload to Azure Static Web Apps
   ```

2. **DNS Configuration**:
   - Configure custom domain (if required)
   - Update DNS records
   - Verify SSL certificate

3. **User Communication**:
   - Send go-live notification
   - Provide user training materials
   - Share support contact information

### Step 5.3: Post-Deployment Monitoring
- Monitor application performance
- Check error logs regularly
- Validate SharePoint integration
- Monitor user adoption
- Track system usage metrics

## Troubleshooting

### Common Issues and Solutions

#### Authentication Issues
**Problem**: Users can't authenticate
**Solution**: 
- Verify Azure AD app registration
- Check redirect URIs
- Validate permissions granted
- Clear browser cache

#### SharePoint Connection Issues
**Problem**: Cannot connect to SharePoint
**Solution**:
- Verify site collection exists
- Check permissions
- Validate API permissions
- Test with SharePoint admin account

#### Document Generation Failures
**Problem**: Word templates not generating
**Solution**:
- Verify template format
- Check content control names
- Validate Power Automate flow
- Test with sample data

#### File Upload Issues
**Problem**: Files not uploading to correct folders
**Solution**:
- Check folder permissions
- Verify Power Automate flow
- Test folder creation logic
- Validate file size limits

### Error Codes and Messages

| Error Code | Description | Solution |
|------------|-------------|----------|
| AUTH001 | Authentication failed | Check Azure AD configuration |
| SP001 | SharePoint access denied | Verify site permissions |
| DOC001 | Document generation failed | Check Word template format |
| FILE001 | File upload failed | Verify folder structure and permissions |

## Security Checklist

### Pre-Production Security Review
- [ ] **Authentication**: Azure AD integration working
- [ ] **Authorization**: Role-based access implemented
- [ ] **Data Encryption**: HTTPS enforced, data encrypted at rest
- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **Output Encoding**: All outputs properly encoded
- [ ] **Session Management**: Secure session handling
- [ ] **Error Handling**: No sensitive information in errors
- [ ] **Logging**: Security events logged appropriately
- [ ] **Dependencies**: All dependencies up to date and secure
- [ ] **Configuration**: No hardcoded secrets or credentials

### Ongoing Security Monitoring
- Regular security scans
- Dependency vulnerability checks
- Access log reviews
- Permission audits
- Incident response procedures

## Maintenance and Support

### Regular Maintenance Tasks
- **Weekly**: Review error logs, check system performance
- **Monthly**: Update dependencies, review security logs
- **Quarterly**: Full security review, performance optimization
- **Annually**: Comprehensive system audit, disaster recovery testing

### Support Contacts
- **Technical Support**: [Your IT Support Team]
- **Security Issues**: [Your Security Team]
- **Business Questions**: [Business Owner]
- **Emergency Contact**: [Emergency Contact Info]

## Appendices

### Appendix A: PowerShell Scripts
[Include all PowerShell scripts for automation]

### Appendix B: Word Template Examples
[Include sample Word templates with proper content controls]

### Appendix C: Power Automate Flow Configurations
[Include detailed flow configurations]

### Appendix D: User Training Materials
[Include user guides and training documentation]

---

**Document Version**: 1.0  
**Last Updated**: $(date)  
**Next Review Date**: $(date + 6 months)  

*This document is confidential and proprietary. Distribution is restricted to authorized personnel only.*