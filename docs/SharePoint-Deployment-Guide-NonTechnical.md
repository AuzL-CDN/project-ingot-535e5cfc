# Project INGOT - SharePoint Deployment Guide
## For Non-Technical Users

This guide will help you deploy Project INGOT to your organization's SharePoint environment. Each section includes simple step-by-step instructions.

---

## 📋 What You'll Need

Before you begin, make sure you have access to:

- [ ] **Microsoft 365 Account** with SharePoint Online
- [ ] **Admin Access** to SharePoint (or someone who can help you)
- [ ] **Azure Portal Access** (your IT department can provide this)
- [ ] **Power Automate Access** (included with most M365 licenses)
- [ ] **About 2-3 hours** to complete the full setup

---

## Step 1: Create Your SharePoint Site (15 minutes)

### What This Does
Creates a dedicated website within SharePoint where Project INGOT will store all inspection data and documents.

### Instructions

1. **Open SharePoint Admin Center**
   - Go to: https://admin.microsoft.com
   - Click on "SharePoint" in the left menu
   - Click "Sites" → "Active sites"

2. **Create New Site**
   - Click the "+ Create" button
   - Choose "Team site"
   - Name it: `Project INGOT`
   - URL: `/sites/ProjectINGOT`
   - Click "Finish"

3. **Wait for Site Creation**
   - This takes about 2-3 minutes
   - You'll receive an email when it's ready

### ✅ Success Check
- You can access https://[yourcompany].sharepoint.com/sites/ProjectINGOT
- You see an empty SharePoint site

---

## Step 2: Create SharePoint Lists (20 minutes)

### What This Does
Creates 5 special lists that act as databases for storing inspection information.

### Instructions

1. **Navigate to Your Site**
   - Go to: https://[yourcompany].sharepoint.com/sites/ProjectINGOT
   - Click "Site contents" in the left menu

2. **Create List #1: Inspectors**
   - Click "+ New" → "List"
   - Name: `Inspectors`
   - Click "Create"
   - Click "+ Add column" and add these fields:
     * **Initials** (Single line of text) - Required
     * **Email** (Single line of text) - Required
     * **FolderPath** (Single line of text)
   - Click "Save"

3. **Create List #2: Activities**
   - Repeat the process above
   - Name: `Activities`
   - Add these columns:
     * **OrgSiteNumber** (Single line of text) - Required
     * **CompanyName** (Single line of text) - Required
     * **ClientDepartment** (Single line of text)
     * **ContractType** (Choice: Government, Commercial, International)
     * **ContractNumber** (Single line of text)
     * **SecurityLevel** (Choice: Unclassified, Protected A, Protected B, Protected C, Classified, Secret, Top Secret)
     * **InspectionType** (Choice: DoC, Onsite, Virtual, Remote)
     * **InspectionClass** (Choice: 1F, 1G, 19F, 19G)
     * **InspectionDate** (Date and time) - Required
     * **Status** (Choice: Draft, In Progress, Completed, Archived)

4. **Create List #3: CorrectiveMeasures**
   - Name: `CorrectiveMeasures`
   - Add columns:
     * **ActivityNumber** (Single line of text) - Required
     * **Index** (Number) - Required
     * **MeasureText** (Multiple lines of text) - Required

5. **Create List #4: ApprovalCCs**
   - Name: `ApprovalCCs`
   - Add columns:
     * **ActivityNumber** (Single line of text) - Required
     * **Index** (Number) - Required
     * **CCName** (Single line of text) - Required
     * **CCTitle** (Single line of text)
     * **CCDepartment** (Single line of text)
     * **CCEmail** (Single line of text)

6. **Create List #5: RunLog**
   - Name: `RunLog`
   - Add columns:
     * **ActivityNumber** (Single line of text) - Required
     * **Action** (Single line of text) - Required
     * **Result** (Choice: Success, Error, Warning)
     * **Message** (Multiple lines of text)
     * **FileLink** (Hyperlink)
     * **Timestamp** (Date and time) - Required
     * **Inspector** (Single line of text)

### ✅ Success Check
- You can see all 5 lists in "Site contents"
- Each list has the correct columns

---

## Step 3: Set Up Document Library (10 minutes)

### What This Does
Creates folders where your Word templates and generated documents will be stored.

### Instructions

1. **Navigate to Documents**
   - Go to your Project INGOT site
   - Click "Documents" in the left menu

2. **Create Templates Folder**
   - Click "+ New" → "Folder"
   - Name: `Templates`
   - Click "Create"

3. **Create Inspectors Folder**
   - Click "+ New" → "Folder"
   - Name: `Inspectors`
   - Click "Create"

4. **Upload Word Templates**
   - Open the `Templates` folder
   - Click "Upload" → "Files"
   - Select all Word template files from `docs/word-templates/` folder
   - Templates to upload:
     * ApprovalLetter.docx
     * CSC_ApprovalLetter.docx
     * Checklist_Classified.docx
     * Checklist_Protected.docx
     * FinalReport.docx
     * Memorandum.docx

### ✅ Success Check
- Documents library has two folders: Templates and Inspectors
- Templates folder contains 6 Word documents

---

## Step 4: Register the Application in Azure (20 minutes)

### What This Does
Creates a secure connection between Project INGOT and your SharePoint data.

### Instructions

1. **Open Azure Portal**
   - Go to: https://portal.azure.com
   - Sign in with your admin account

2. **Navigate to App Registrations**
   - Search for "App registrations" in the top search bar
   - Click on "App registrations"
   - Click "+ New registration"

3. **Register the Application**
   - Name: `Project INGOT`
   - Supported account types: "Accounts in this organizational directory only"
   - Redirect URI: Select "Single-page application (SPA)"
   - URL: `https://[your-deployed-app-url]` (you'll update this later)
   - Click "Register"

4. **Copy Important Information**
   - You'll see a page with important IDs
   - **SAVE THESE SOMEWHERE SAFE:**
     * **Application (client) ID**: Copy this
     * **Directory (tenant) ID**: Copy this

5. **Add API Permissions**
   - Click "API permissions" in the left menu
   - Click "+ Add a permission"
   - Choose "Microsoft Graph"
   - Choose "Delegated permissions"
   - Search for and add these permissions:
     * `Sites.Read.All`
     * `Sites.ReadWrite.All`
     * `Files.Read.All`
     * `Files.ReadWrite.All`
     * `User.Read`
   - Click "Add permissions"

6. **Grant Admin Consent**
   - Click "Grant admin consent for [Your Organization]"
   - Click "Yes" to confirm
   - All permissions should now show green checkmarks

### ✅ Success Check
- You have saved the Application ID and Tenant ID
- All API permissions show green checkmarks

---

## Step 5: Create Power Automate Flows (30 minutes)

### What This Does
Creates automated workflows that handle folder creation, document generation, and file uploads.

### Flow #1: Create Inspector Folder

1. **Open Power Automate**
   - Go to: https://make.powerautomate.com
   - Sign in with your account

2. **Create New Flow**
   - Click "+ Create" → "Automated cloud flow"
   - Name: `Project INGOT - Create Inspector Folder`
   - Trigger: "When an HTTP request is received"
   - Click "Create"

3. **Configure HTTP Trigger**
   - Click "When an HTTP request is received"
   - In "Request Body JSON Schema", paste:
   ```json
   {
     "type": "object",
     "properties": {
       "initials": { "type": "string" },
       "email": { "type": "string" }
     }
   }
   ```

4. **Add Create Folder Action**
   - Click "+ New step"
   - Search for "SharePoint"
   - Select "Create new folder"
   - Site Address: Select your Project INGOT site
   - Folder Path: `/Shared Documents/Inspectors`
   - Name: Use dynamic content `initials`

5. **Add Create List Item Action**
   - Click "+ New step"
   - Search for "SharePoint"
   - Select "Create item"
   - Site Address: Select your Project INGOT site
   - List Name: `Inspectors`
   - Fill in:
     * Initials: Use dynamic content `initials`
     * Email: Use dynamic content `email`
     * FolderPath: `/Shared Documents/Inspectors/[initials]`

6. **Save and Get URL**
   - Click "Save"
   - Click on the HTTP trigger again
   - Copy the "HTTP POST URL" - **SAVE THIS**

### Flow #2: Generate Document

1. **Create New Flow**
   - Name: `Project INGOT - Generate Document`
   - Trigger: "When an HTTP request is received"

2. **Configure HTTP Trigger**
   - Request Body JSON Schema:
   ```json
   {
     "type": "object",
     "properties": {
       "templateName": { "type": "string" },
       "outputFileName": { "type": "string" },
       "data": { "type": "object" },
       "folderPath": { "type": "string" }
     }
   }
   ```

3. **Add Get Template File**
   - Click "+ New step"
   - Search for "SharePoint"
   - Select "Get file content"
   - Site Address: Your Project INGOT site
   - File Identifier: `/Shared Documents/Templates/[templateName]`

4. **Add Populate Document**
   - Click "+ New step"
   - Search for "Word Online"
   - Select "Populate a Word template"
   - Template: Use file content from previous step
   - Data: Use dynamic content `data`

5. **Add Create File**
   - Click "+ New step"
   - Search for "SharePoint"
   - Select "Create file"
   - Site Address: Your Project INGOT site
   - Folder Path: Use dynamic content `folderPath`
   - File Name: Use dynamic content `outputFileName`
   - File Content: Use output from "Populate a Word template"

6. **Save and Get URL**
   - Click "Save"
   - Copy the "HTTP POST URL" - **SAVE THIS**

### Flow #3: Upload Supporting Documents

1. **Create New Flow**
   - Name: `Project INGOT - Upload Supporting Documents`
   - Trigger: "When an HTTP request is received"

2. **Configure HTTP Trigger**
   - Request Body JSON Schema:
   ```json
   {
     "type": "object",
     "properties": {
       "fileName": { "type": "string" },
       "fileContent": { "type": "string" },
       "folderPath": { "type": "string" }
     }
   }
   ```

3. **Add Create File**
   - Click "+ New step"
   - Search for "SharePoint"
   - Select "Create file"
   - Site Address: Your Project INGOT site
   - Folder Path: Use dynamic content `folderPath`
   - File Name: Use dynamic content `fileName`
   - File Content: Use dynamic content `fileContent` (base64 decoded)

4. **Save and Get URL**
   - Click "Save"
   - Copy the "HTTP POST URL" - **SAVE THIS**

### ✅ Success Check
- You have 3 flows created and enabled
- You have saved all 3 HTTP POST URLs

---

## Step 6: Prepare Application Configuration (5 minutes)

### What This Does
Gathers all the information needed to connect the application to SharePoint.

### Instructions

1. **Create Configuration Document**
   - Open Notepad or any text editor
   - Copy this template and fill in your values:

   ```
   PROJECT INGOT - DEPLOYMENT CONFIGURATION
   =========================================

   SHAREPOINT INFORMATION:
   - SharePoint Site URL: https://[yourcompany].sharepoint.com/sites/ProjectINGOT
   - Tenant Name: [yourcompany]

   AZURE AD INFORMATION:
   - Tenant ID: [paste from Step 4]
   - Client ID (Application ID): [paste from Step 4]

   POWER AUTOMATE FLOW URLS:
   - Create Inspector Folder: [paste from Step 5, Flow #1]
   - Generate Document: [paste from Step 5, Flow #2]
   - Upload Supporting Documents: [paste from Step 5, Flow #3]
   ```

2. **Save This Document**
   - Save as: `Project-INGOT-Config.txt`
   - **Keep this secure and private**
   - You'll need this for deployment

### ✅ Success Check
- You have a text file with all configuration values filled in

---

## Step 7: Deploy the Application (15 minutes)

### What This Does
Makes Project INGOT available for your team to use.

### Option A: Deploy to Azure Static Web Apps (Recommended)

1. **Get Deployment Package**
   - Your developer will provide you with a `dist.zip` file
   - This contains the built application

2. **Open Azure Portal**
   - Go to: https://portal.azure.com

3. **Create Static Web App**
   - Search for "Static Web Apps"
   - Click "+ Create"
   - Fill in:
     * Subscription: Your Azure subscription
     * Resource Group: Create new or use existing
     * Name: `project-ingot`
     * Region: Choose closest to you
     * SKU: Free or Standard
   - Click "Review + Create"
   - Click "Create"

4. **Upload Application**
   - Once created, go to the resource
   - Click "Configuration" in left menu
   - Add your configuration values (from Step 6)
   - Click "Overview"
   - Note the URL (e.g., `https://project-ingot.azurestaticapps.net`)

5. **Update Azure AD Redirect URI**
   - Go back to Azure Portal → App registrations
   - Find "Project INGOT"
   - Click "Authentication"
   - Update the redirect URI with your new app URL
   - Click "Save"

### Option B: SharePoint App Catalog

1. **Package Application**
   - Get the `.sppkg` file from your developer

2. **Open SharePoint Admin Center**
   - Go to: https://admin.microsoft.com
   - Click "SharePoint"

3. **Upload to App Catalog**
   - Click "More features"
   - Under "Apps", click "Open"
   - Click "App Catalog"
   - Upload the `.sppkg` file
   - Check "Make this solution available to all sites"
   - Click "Deploy"

4. **Add to Your Site**
   - Go to your Project INGOT site
   - Click "Site contents"
   - Click "+ New" → "App"
   - Find "Project INGOT" and click "Add"

### ✅ Success Check
- You can access the application at its deployed URL
- You see the login screen

---

## Step 8: Test the Deployment (15 minutes)

### What This Does
Verifies everything is working correctly.

### Instructions

1. **Test Login**
   - Open the application URL
   - Click "Sign In"
   - Use your M365 credentials
   - You should be logged in successfully

2. **Test Inspector Creation**
   - Navigate to "Inspector Info" tab
   - Fill in your initials and email
   - Click "Create Inspector Profile"
   - Check SharePoint → Inspectors folder → New folder should exist

3. **Test Main Form**
   - Fill out the main inspection form
   - Click "Save"
   - Check SharePoint → Activities list → New entry should appear

4. **Test Document Generation**
   - On an inspection, generate a document
   - Check SharePoint → Your inspector folder → Document should appear

5. **Test File Upload**
   - Upload a supporting document
   - Check SharePoint → Document appears in correct folder

### ✅ Success Check
- All tests pass without errors
- Data appears in SharePoint lists and folders

---

## 🎉 Deployment Complete!

Your Project INGOT system is now fully deployed and ready for use.

### Next Steps

1. **Train Your Team**
   - Show users how to log in
   - Demonstrate the inspection workflow
   - Explain document generation

2. **Create Additional Inspectors**
   - Have each inspector create their profile
   - Verify their folders are created

3. **Set Permissions**
   - In SharePoint, set appropriate access levels
   - Ensure only authorized users can access

4. **Monitor Usage**
   - Check the RunLog list for any errors
   - Review generated documents for accuracy

---

## 🆘 Common Issues and Solutions

### Issue: "Cannot connect to SharePoint"
**Solution:** 
- Verify your SharePoint site URL is correct
- Check that you granted admin consent for API permissions
- Ensure your account has access to the site

### Issue: "Power Automate flow not triggering"
**Solution:**
- Verify the flow is turned ON
- Check the flow run history for errors
- Ensure the HTTP POST URL is correct in configuration

### Issue: "Document generation fails"
**Solution:**
- Verify Word templates are in the Templates folder
- Check that template content controls match the data fields
- Review the RunLog list for specific errors

### Issue: "Cannot upload files"
**Solution:**
- Check file size (max 250MB)
- Verify folder path exists
- Ensure SharePoint has enough storage space

---

## 📞 Need Help?

Contact your IT department or system administrator with:
- This guide
- Your configuration file (Project-INGOT-Config.txt)
- Screenshot of any error messages
- Description of what you were trying to do

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**For:** Project INGOT - Inspection Management System