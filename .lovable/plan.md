

## Rewrite M365 Setup Guide — Comprehensive Click-by-Click Instructions

### Problem
The current `docs/M365-Setup-Guide.md` reads like a technical reference (field tables, JSON schemas, PowerShell). The user needs a **step-by-step walkthrough using the web interfaces** — SharePoint browser UI, Power Automate designer, Azure Portal — so someone unfamiliar can follow along and get everything working.

### Approach
Replace the guide with a ~1500-line comprehensive walkthrough structured by **module**, with each section written as numbered click-by-click instructions referencing exact menu paths, buttons, and dialog options in the web UI. No PowerShell, no CLI — everything through the browser.

### Document Structure

**Part 1: SharePoint Online (via browser)**
- Creating the site collection via SharePoint Admin Center
- Creating each of the 5 lists through the SharePoint web UI (Site Contents > New > List), with click-by-click instructions for adding each column (type, choices, required)
- Creating the Documents library folder structure (Templates, Inspectors)
- Uploading the 12 Word templates — which files, where exactly, and how to verify content controls

**Part 2: Word Templates — Content Controls Setup**
- How to enable the Developer tab in Word
- For each template: which content controls to insert, where, what to name them (Tag/Title), and what type (Plain Text, Rich Text, Date, Repeating Section)
- How to test a template manually before connecting to Power Automate

**Part 3: Azure AD App Registration (via Azure Portal)**
- Step-by-step through portal.azure.com: App registrations > New registration
- Exact screens for setting redirect URIs (SPA type)
- Adding API permissions through the UI (Microsoft Graph > Delegated > search for each permission)
- Granting admin consent
- Where to copy Client ID and Tenant ID

**Part 4: Power Automate — Flow 1: Create Inspector Folder**
- Open make.powerautomate.com > My flows > New flow > Instant cloud flow
- Adding the HTTP trigger step-by-step through the designer
- Defining the JSON schema in the trigger (with exact JSON to paste)
- Adding each action: SharePoint "Create new folder", SharePoint "Update item", SharePoint "Create item" (RunLog), Response
- Configuring each action: which site, which list, which fields, dynamic content references
- Adding error handling with Scope + parallel branch
- Saving, testing, and copying the trigger URL

**Part 5: Power Automate — Flow 2: Generate Document**
- Same step-by-step designer walkthrough
- HTTP trigger with templateName, activityNumber, inspectorInitials, mergeData
- "Get file content" from SharePoint Templates folder
- "Populate a Microsoft Word template" (Word Online connector) — how to connect it, map dynamic fields from mergeData
- "Create new folder" for the activity path
- "Create file" to save the populated document
- Log to RunLog, send Response
- Note about content controls vs. placeholder text and when to use Plumsail/Encodian

**Part 6: Power Automate — Flow 3: Upload Supporting Documents**
- HTTP trigger for file upload (binary body)
- Query parameters configuration
- SharePoint "Create new folder" + "Create file" for Supporting subfolder
- RunLog entry, Response

**Part 7: Connecting Everything**
- Where to find each flow's HTTP POST URL after saving
- Creating the `.env.local` file with all 6 required variables
- How each variable maps to what was configured above
- Building and deploying the React app (brief, since this is a web-focused guide)

**Part 8: Testing and Verification**
- Testing each flow individually via Power Automate's built-in Test feature (step-by-step through the Test pane)
- Verifying SharePoint lists have data after test runs
- Verifying folder structure and generated documents
- End-to-end test: create inspector > create activity > generate document > upload file
- Checklist of 10 verification points

**Part 9: Permissions and Security**
- Setting SharePoint site permissions through the web UI (Settings > Site permissions)
- Creating SharePoint groups for Owners/Members/Visitors
- Folder-level permission inheritance breaking (step-by-step)
- Power Automate connection sharing

### Deliverable
Single file: `docs/M365-Setup-Guide.md` (replaces existing)

### Key Differences from Current Guide
- Every instruction is "Click X > Select Y > Type Z" — no ambiguity
- Each Power Automate flow is built action-by-action through the web designer, not described as a table
- Template content control setup includes which Word menus to use
- SharePoint list creation walks through every column addition individually
- Testing uses Power Automate's built-in test pane, not curl/Postman

