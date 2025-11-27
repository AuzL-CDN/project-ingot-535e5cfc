# Project INGOT - Migration Verification Checklist

## 📋 Pre-Migration Verification

### Supabase Removal Verification
- [ ] `@supabase/supabase-js` package removed from `package.json`
- [ ] All Supabase imports removed from codebase
- [ ] `src/integrations/supabase/` folder deleted
- [ ] No references to `supabase` in search results
- [ ] `.env` file contains no Supabase variables

### SharePoint Dependencies Installed
- [ ] `@azure/msal-browser` installed
- [ ] `@azure/msal-react` installed
- [ ] `@microsoft/microsoft-graph-client` installed
- [ ] `axios` installed
- [ ] All dependencies in `package.json` are up to date

---

## 🔧 SharePoint Environment Setup

### SharePoint Site Collection
- [ ] Site collection created at `/sites/ProjectINGOT`
- [ ] Site is accessible to all users who need access
- [ ] Site permissions configured correctly
- [ ] Document library exists and is accessible

### SharePoint Lists Created and Configured
- [ ] **Inspectors** list exists with all required columns
- [ ] **Activities** list exists with all required columns
- [ ] **CorrectiveMeasures** list exists with all required columns
- [ ] **ApprovalCCs** list exists with all required columns
- [ ] **RunLog** list exists with all required columns
- [ ] All required/optional field settings are correct
- [ ] Choice fields have correct options configured

### Document Library Structure
- [ ] `Templates` folder created in Documents library
- [ ] `Inspectors` folder created in Documents library
- [ ] All Word templates uploaded to `Templates` folder:
  - [ ] ApprovalLetter.docx
  - [ ] CSC_ApprovalLetter.docx
  - [ ] Checklist_Classified.docx
  - [ ] Checklist_Protected.docx
  - [ ] FinalReport.docx
  - [ ] Memorandum.docx
- [ ] Templates have proper content controls configured

---

## 🔐 Azure AD Configuration

### App Registration
- [ ] Azure AD App Registration created with name "Project INGOT"
- [ ] Application (client) ID obtained and saved
- [ ] Directory (tenant) ID obtained and saved
- [ ] Redirect URI configured for SPA application type
- [ ] Redirect URI matches deployment URL

### API Permissions
- [ ] `User.Read` permission added
- [ ] `Sites.Read.All` permission added
- [ ] `Sites.ReadWrite.All` permission added
- [ ] `Files.Read.All` permission added
- [ ] `Files.ReadWrite.All` permission added
- [ ] Admin consent granted for all permissions
- [ ] All permissions show green checkmarks

---

## ⚡ Power Automate Flows

### Flow #1: Create Inspector Folder
- [ ] Flow created with name "Project INGOT - Create Inspector Folder"
- [ ] HTTP trigger configured with correct JSON schema
- [ ] "Create new folder" action configured
- [ ] "Create item" action configured for Inspectors list
- [ ] Flow is enabled (turned on)
- [ ] HTTP POST URL copied and saved
- [ ] Flow tested successfully

### Flow #2: Generate Document
- [ ] Flow created with name "Project INGOT - Generate Document"
- [ ] HTTP trigger configured with correct JSON schema
- [ ] "Get file content" action retrieves template
- [ ] "Populate a Word template" action configured
- [ ] "Create file" action saves to SharePoint
- [ ] Flow is enabled (turned on)
- [ ] HTTP POST URL copied and saved
- [ ] Flow tested successfully

### Flow #3: Upload Supporting Documents
- [ ] Flow created with name "Project INGOT - Upload Supporting Documents"
- [ ] HTTP trigger configured with correct JSON schema
- [ ] "Create file" action uploads to correct folder
- [ ] Base64 decoding configured (if needed)
- [ ] Flow is enabled (turned on)
- [ ] HTTP POST URL copied and saved
- [ ] Flow tested successfully

---

## 🔧 Application Configuration

### Environment Variables
- [ ] `.env.local` file created (not committed)
- [ ] `VITE_AZURE_TENANT_ID` configured
- [ ] `VITE_AZURE_CLIENT_ID` configured
- [ ] `VITE_SHAREPOINT_SITE_URL` configured (with full URL)
- [ ] `VITE_FLOW_CREATE_FOLDER` configured (full URL)
- [ ] `VITE_FLOW_GENERATE_DOC` configured (full URL)
- [ ] `VITE_FLOW_UPLOAD_DOC` configured (full URL)
- [ ] No REACT_APP_* variables remaining
- [ ] `.env.local` is in `.gitignore`

### Code Configuration Files
- [ ] `src/config/sharepoint.config.ts` created
- [ ] Configuration reads from `VITE_*` environment variables
- [ ] Scopes array configured correctly
- [ ] SharePoint site URL and paths configured
- [ ] List names match SharePoint exactly

---

## 🧪 Functional Testing

### Authentication
- [ ] Application loads without errors
- [ ] Login button appears
- [ ] Clicking login opens Microsoft popup/redirect
- [ ] Can successfully authenticate with M365 account
- [ ] User info displayed after login
- [ ] Logout functionality works
- [ ] Session persists on page refresh

### Inspector Profile
- [ ] Can navigate to Inspector Info tab
- [ ] Can enter initials and email
- [ ] "Create Inspector Profile" button works
- [ ] Folder created in SharePoint Inspectors folder
- [ ] Entry created in Inspectors list
- [ ] Success message displayed

### Main Form
- [ ] Can navigate to Main Form tab
- [ ] All fields are editable
- [ ] Organization lookup works (if implemented)
- [ ] Can save form data
- [ ] Data persists when switching tabs
- [ ] Entry created/updated in Activities list

### Search Functionality
- [ ] Can search by Activity Number
- [ ] Can search by Organization Number
- [ ] Search results display correctly
- [ ] Can load saved activities
- [ ] All form fields populate from loaded data

### Document Generation
- [ ] Can generate Approval Letter
- [ ] Can generate Memorandum
- [ ] Can generate Final Report
- [ ] Documents appear in correct SharePoint folder
- [ ] Content controls are properly populated
- [ ] Document download works

### File Upload
- [ ] Can drag and drop files
- [ ] Can click to browse and select files
- [ ] Files upload successfully
- [ ] Files appear in SharePoint
- [ ] Files are in correct folder structure
- [ ] File type restrictions work

### Checklist (1F/1G)
- [ ] Can select checklist type
- [ ] Questions load correctly
- [ ] Can answer questions
- [ ] Can upload files per question
- [ ] Progress indicator works
- [ ] Data saves correctly

---

## 🔍 Integration Testing

### SharePoint Lists Integration
- [ ] Data flows from app to SharePoint lists
- [ ] List items are created correctly
- [ ] List items can be read back
- [ ] Updates reflect in SharePoint immediately
- [ ] No orphaned or duplicate entries

### Power Automate Integration
- [ ] All three flows trigger successfully
- [ ] Flow runs appear in Power Automate history
- [ ] Flows complete without errors
- [ ] Flow outputs are correct
- [ ] Error handling works when flows fail

### SharePoint Document Library
- [ ] Folders are created automatically
- [ ] Files upload to correct locations
- [ ] File permissions are appropriate
- [ ] Files can be downloaded
- [ ] Large files (up to 25MB) upload successfully

---

## 🚀 Deployment Verification

### Build Process
- [ ] `npm install` completes without errors
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors
- [ ] No build warnings (or acceptable warnings documented)
- [ ] `dist` folder created with all assets

### Deployment
- [ ] Application deployed to Azure Static Web Apps (or chosen platform)
- [ ] Deployment URL is accessible
- [ ] HTTPS enabled
- [ ] Custom domain configured (if required)
- [ ] Environment variables configured in deployment environment

### Post-Deployment
- [ ] Application loads on production URL
- [ ] No console errors
- [ ] Authentication works in production
- [ ] All integrations work in production
- [ ] Performance is acceptable (< 3s load time)

---

## 🔒 Security Verification

### Authentication & Authorization
- [ ] Only authenticated users can access the app
- [ ] Unauthenticated users redirected to login
- [ ] Tokens are stored securely
- [ ] Sessions expire appropriately
- [ ] Logout clears all session data

### Data Security
- [ ] No sensitive data in browser console
- [ ] No API keys in client-side code
- [ ] HTTPS enforced for all requests
- [ ] SharePoint permissions appropriate
- [ ] No data leakage between users

### Compliance
- [ ] Application meets organizational security requirements
- [ ] Data handling complies with privacy policies
- [ ] Audit logging functional (RunLog)
- [ ] Error messages don't expose sensitive information

---

## 📚 Documentation Verification

### Technical Documentation
- [ ] All deployment guides reference SharePoint (not Supabase)
- [ ] Environment variables use `VITE_*` prefix consistently
- [ ] Code comments updated
- [ ] README.md reflects current architecture
- [ ] API documentation updated (if applicable)

### User Documentation
- [ ] User guides updated
- [ ] Screenshots reflect current UI
- [ ] Training materials prepared
- [ ] Support documentation available
- [ ] FAQ updated

---

## ✅ Final Sign-Off

### Technical Lead Approval
- [ ] Code review completed
- [ ] Architecture approved
- [ ] Performance acceptable
- [ ] Security requirements met
- Date: ____________ Signature: ________________

### Business Owner Approval
- [ ] Functional requirements met
- [ ] User acceptance testing passed
- [ ] Ready for production deployment
- Date: ____________ Signature: ________________

### IT Operations Approval
- [ ] Infrastructure ready
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Support team trained
- Date: ____________ Signature: ________________

---

## 📝 Notes and Issues

Use this section to document any deviations, issues, or special considerations:

```
[Add notes here]
```

---

**Checklist Version**: 1.0  
**Last Updated**: 2025-10-09  
**Next Review**: After each major deployment or quarterly
