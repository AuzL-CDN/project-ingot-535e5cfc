# Project INGOT — M365 Setup Guide (Web Interface)

> **Version 2.0** · Last updated 2026-03-18
>
> Comprehensive click-by-click instructions for deploying Project INGOT using **SharePoint Online**, **Power Automate**, and **Power Apps** — entirely through the web browser. No PowerShell or CLI required.

---

## Table of Contents

- [Part 1: SharePoint Online](#part-1-sharepoint-online)
  - [1.1 Create the Site Collection](#11-create-the-site-collection)
  - [1.2 Create the Inspectors List](#12-create-the-inspectors-list)
  - [1.3 Create the Activities List](#13-create-the-activities-list)
  - [1.4 Create the CorrectiveMeasures List](#14-create-the-correctivemeasures-list)
  - [1.5 Create the ApprovalCCs List](#15-create-the-approvalccs-list)
  - [1.6 Create the RunLog List](#16-create-the-runlog-list)
  - [1.7 Create the Document Library Folders](#17-create-the-document-library-folders)
  - [1.8 Upload Word Templates](#18-upload-word-templates)
- [Part 2: Word Templates — Content Controls](#part-2-word-templates--content-controls)
  - [2.1 Enable the Developer Tab](#21-enable-the-developer-tab)
  - [2.2 ApprovalLetter.docx](#22-approvalletterdocx)
  - [2.3 CSC_ApprovalLetter.docx](#23-csc_approvalletterdocx)
  - [2.4 Checklist_Classified.docx](#24-checklist_classifieddocx)
  - [2.5 Checklist_Protected.docx](#25-checklist_protecteddocx)
  - [2.6 Corrective_Measures.docx](#26-corrective_measuresdocx)
  - [2.7 CSC-IT-Approval.docx](#27-csc-it-approvaldocx)
  - [2.8 FinalReport.docx](#28-finalreportdocx)
  - [2.9 IT-Approval.docx](#29-it-approvaldocx)
  - [2.10 Initial_Email_Classified.docx](#210-initial_email_classifieddocx)
  - [2.11 Initial_Email_Protected.docx](#211-initial_email_protecteddocx)
  - [2.12 Memorandum.docx](#212-memorandumdocx)
  - [2.13 Test a Template Manually](#213-test-a-template-manually)
- [Part 3: Azure AD App Registration](#part-3-azure-ad-app-registration)
  - [3.1 Register the Application](#31-register-the-application)
  - [3.2 Record Your IDs](#32-record-your-ids)
  - [3.3 Add API Permissions](#33-add-api-permissions)
  - [3.4 Grant Admin Consent](#34-grant-admin-consent)
  - [3.5 Configure Authentication Settings](#35-configure-authentication-settings)
- [Part 4: Power Automate — Flow 1: Create Inspector Folder](#part-4-power-automate--flow-1-create-inspector-folder)
  - [4.1 Create the Flow](#41-create-the-flow)
  - [4.2 Configure the HTTP Trigger](#42-configure-the-http-trigger)
  - [4.3 Add Action: Create Folder in SharePoint](#43-add-action-create-folder-in-sharepoint)
  - [4.4 Add Action: Update Inspector Record](#44-add-action-update-inspector-record)
  - [4.5 Add Action: Log to RunLog](#45-add-action-log-to-runlog)
  - [4.6 Add Action: Send Response](#46-add-action-send-response)
  - [4.7 Add Error Handling](#47-add-error-handling)
  - [4.8 Save and Copy the Trigger URL](#48-save-and-copy-the-trigger-url)
- [Part 5: Power Automate — Flow 2: Generate Document](#part-5-power-automate--flow-2-generate-document)
  - [5.1 Create the Flow](#51-create-the-flow)
  - [5.2 Configure the HTTP Trigger](#52-configure-the-http-trigger)
  - [5.3 Add Action: Get Template File](#53-add-action-get-template-file)
  - [5.4 Add Action: Populate Word Template](#54-add-action-populate-word-template)
  - [5.5 Add Action: Create Activity Folder](#55-add-action-create-activity-folder)
  - [5.6 Add Action: Save the Generated File](#56-add-action-save-the-generated-file)
  - [5.7 Add Action: Log to RunLog](#57-add-action-log-to-runlog)
  - [5.8 Add Action: Send Response](#58-add-action-send-response)
  - [5.9 Save and Copy the Trigger URL](#59-save-and-copy-the-trigger-url)
- [Part 6: Power Automate — Flow 3: Upload Supporting Documents](#part-6-power-automate--flow-3-upload-supporting-documents)
  - [6.1 Create the Flow](#61-create-the-flow)
  - [6.2 Configure the HTTP Trigger](#62-configure-the-http-trigger)
  - [6.3 Add Action: Create Supporting Folder](#63-add-action-create-supporting-folder)
  - [6.4 Add Action: Create the File](#64-add-action-create-the-file)
  - [6.5 Add Action: Log to RunLog](#65-add-action-log-to-runlog)
  - [6.6 Add Action: Send Response](#66-add-action-send-response)
  - [6.7 Save and Copy the Trigger URL](#67-save-and-copy-the-trigger-url)
- [Part 7: Connecting Everything](#part-7-connecting-everything)
  - [7.1 Collect Your Flow URLs](#71-collect-your-flow-urls)
  - [7.2 Create the Environment File](#72-create-the-environment-file)
  - [7.3 Build and Deploy](#73-build-and-deploy)
- [Part 8: Testing and Verification](#part-8-testing-and-verification)
  - [8.1 Test Flow 1 — Create Inspector Folder](#81-test-flow-1--create-inspector-folder)
  - [8.2 Test Flow 2 — Generate Document](#82-test-flow-2--generate-document)
  - [8.3 Test Flow 3 — Upload Supporting Document](#83-test-flow-3--upload-supporting-document)
  - [8.4 End-to-End Verification Checklist](#84-end-to-end-verification-checklist)
- [Part 9: Permissions and Security](#part-9-permissions-and-security)
  - [9.1 Set Up SharePoint Groups](#91-set-up-sharepoint-groups)
  - [9.2 Assign Users to Groups](#92-assign-users-to-groups)
  - [9.3 Set Folder-Level Permissions](#93-set-folder-level-permissions)
  - [9.4 Share Power Automate Flows](#94-share-power-automate-flows)

---

## Part 1: SharePoint Online

Everything in this section is done through your web browser at `https://TENANT.sharepoint.com`.

---

### 1.1 Create the Site Collection

1. Open your browser and go to `https://TENANT-admin.sharepoint.com` (replace `TENANT` with your organization's tenant name).
2. Sign in with your **SharePoint Administrator** account.
3. In the left sidebar, click **Sites** → **Active sites**.
4. Click the **+ Create** button at the top of the page.
5. Select **Team site**.
6. In the panel that appears:
   - **Site name**: Type `Project INGOT`
   - **Site description**: Type `Inspection Management System`
   - **Site address**: The URL will auto-fill. Change the suffix to `ProjectINGOT` so the full URL reads:
     `https://TENANT.sharepoint.com/sites/ProjectINGOT`
   - **Group email address**: If prompted, leave as suggested or clear it — for a no-group site, select **Other options** and choose the template **Team site (no Microsoft 365 group)** if available.
   - **Language**: Select your preferred language (English or French).
   - **Time zone**: Select your time zone.
7. Click **Finish** (or **Create**).
8. Wait 30–60 seconds for the site to provision.
9. Verify: navigate to `https://TENANT.sharepoint.com/sites/ProjectINGOT` — you should see the empty site home page.

> **Write this URL down** — you will need it many times: `https://TENANT.sharepoint.com/sites/ProjectINGOT`

---

### 1.2 Create the Inspectors List

1. Go to your Project INGOT site: `https://TENANT.sharepoint.com/sites/ProjectINGOT`
2. Click the **⚙️ gear icon** (top-right) → **Site contents**.
3. Click **+ New** → **List**.
4. Select **Blank list**.
5. Name the list: `Inspectors`
6. Click **Create**.

You are now viewing the empty Inspectors list. The `Title` column already exists. Now add the remaining columns:

#### Add the "Initials" Column

7. Click **+ Add column** (at the top of the list, to the right of the existing columns).
8. Select **Single line of text**.
9. In the panel that opens on the right:
   - **Name**: Type `Initials`
   - **Require that this column contains information**: Toggle to **Yes**
10. Click **Save**.

#### Add the "Email" Column

11. Click **+ Add column**.
12. Select **Single line of text**.
13. In the panel:
   - **Name**: Type `Email`
   - **Require that this column contains information**: Toggle to **Yes**
14. Click **Save**.

#### Add the "FolderPath" Column

15. Click **+ Add column**.
16. Select **Single line of text**.
17. In the panel:
   - **Name**: Type `FolderPath`
   - **Require that this column contains information**: Leave as **No**
18. Click **Save**.

> ✅ **Inspectors list complete.** You should see 4 columns: Title, Initials, Email, FolderPath.

---

### 1.3 Create the Activities List

1. Click the **⚙️ gear icon** → **Site contents**.
2. Click **+ New** → **List** → **Blank list**.
3. Name: `Activities`
4. Click **Create**.

Now add each column one at a time:

#### Add "OrgSiteNumber"

5. Click **+ Add column** → **Single line of text**.
6. **Name**: `OrgSiteNumber`
7. **Required**: Yes
8. Click **Save**.

#### Add "CompanyName"

9. Click **+ Add column** → **Single line of text**.
10. **Name**: `CompanyName`
11. **Required**: Yes
12. Click **Save**.

#### Add "ClientDepartment"

13. Click **+ Add column** → **Single line of text**.
14. **Name**: `ClientDepartment`
15. **Required**: No
16. Click **Save**.

#### Add "ContractType"

17. Click **+ Add column** → **Choice**.
18. **Name**: `ContractType`
19. Under **Choices**, type each value on its own line:
    - `Government`
    - `Commercial`
    - `International`
20. **Required**: No
21. Click **Save**.

#### Add "ContractNumber"

22. Click **+ Add column** → **Single line of text**.
23. **Name**: `ContractNumber`
24. **Required**: No
25. Click **Save**.

#### Add "SecurityLevel"

26. Click **+ Add column** → **Choice**.
27. **Name**: `SecurityLevel`
28. Under **Choices**, type each value on its own line:
    - `Unclassified`
    - `Protected A`
    - `Protected B`
    - `Protected C`
    - `Classified`
    - `Secret`
    - `Top Secret`
29. **Required**: No
30. Click **Save**.

#### Add "InspectionType"

31. Click **+ Add column** → **Choice**.
32. **Name**: `InspectionType`
33. Under **Choices**:
    - `DoC`
    - `Onsite`
    - `Virtual`
    - `Remote`
34. **Required**: No
35. Click **Save**.

#### Add "InspectionClass"

36. Click **+ Add column** → **Choice**.
37. **Name**: `InspectionClass`
38. Under **Choices**:
    - `1F`
    - `1G`
    - `19F`
    - `19G`
39. **Required**: No
40. Click **Save**.

#### Add "InspectionDate"

41. Click **+ Add column** → **Date and time**.
42. **Name**: `InspectionDate`
43. **Include time**: Toggle to **No** (date only)
44. **Required**: Yes
45. Click **Save**.

#### Add "Status"

46. Click **+ Add column** → **Choice**.
47. **Name**: `Status`
48. Under **Choices**:
    - `Draft`
    - `In Progress`
    - `Completed`
    - `Archived`
49. **Default value**: Select `Draft`
50. **Required**: No
51. Click **Save**.

> ✅ **Activities list complete.** You should see 11 columns: Title, OrgSiteNumber, CompanyName, ClientDepartment, ContractType, ContractNumber, SecurityLevel, InspectionType, InspectionClass, InspectionDate, Status.

---

### 1.4 Create the CorrectiveMeasures List

1. **⚙️ gear icon** → **Site contents** → **+ New** → **List** → **Blank list**.
2. Name: `CorrectiveMeasures`
3. Click **Create**.

#### Add "ActivityNumber"

4. Click **+ Add column** → **Single line of text**.
5. **Name**: `ActivityNumber`
6. **Required**: Yes
7. Click **Save**.

#### Add "Index"

8. Click **+ Add column** → **Number**.
9. **Name**: `Index`
10. **Number of decimal places**: `0`
11. **Required**: Yes
12. Click **Save**.

#### Add "MeasureText"

13. Click **+ Add column** → **Multiple lines of text**.
14. **Name**: `MeasureText`
15. **Use enhanced rich text**: No (plain text)
16. **Required**: Yes
17. Click **Save**.

> ✅ **CorrectiveMeasures list complete.** Columns: Title, ActivityNumber, Index, MeasureText.

---

### 1.5 Create the ApprovalCCs List

1. **⚙️ gear icon** → **Site contents** → **+ New** → **List** → **Blank list**.
2. Name: `ApprovalCCs`
3. Click **Create**.

#### Add "ActivityNumber"

4. **+ Add column** → **Single line of text** → Name: `ActivityNumber` → Required: Yes → **Save**.

#### Add "Index"

5. **+ Add column** → **Number** → Name: `Index` → Decimal places: `0` → Required: Yes → **Save**.

#### Add "CCName"

6. **+ Add column** → **Single line of text** → Name: `CCName` → Required: Yes → **Save**.

#### Add "CCTitle"

7. **+ Add column** → **Single line of text** → Name: `CCTitle` → Required: No → **Save**.

#### Add "CCDepartment"

8. **+ Add column** → **Single line of text** → Name: `CCDepartment` → Required: No → **Save**.

#### Add "CCEmail"

9. **+ Add column** → **Single line of text** → Name: `CCEmail` → Required: No → **Save**.

> ✅ **ApprovalCCs list complete.** Columns: Title, ActivityNumber, Index, CCName, CCTitle, CCDepartment, CCEmail.

---

### 1.6 Create the RunLog List

1. **⚙️ gear icon** → **Site contents** → **+ New** → **List** → **Blank list**.
2. Name: `RunLog`
3. Click **Create**.

#### Add "ActivityNumber"

4. **+ Add column** → **Single line of text** → Name: `ActivityNumber` → Required: Yes → **Save**.

#### Add "Action"

5. **+ Add column** → **Single line of text** → Name: `Action` → Required: Yes → **Save**.

#### Add "Result"

6. **+ Add column** → **Choice** → Name: `Result` → Choices: `Success`, `Error`, `Warning` → Required: No → **Save**.

#### Add "Message"

7. **+ Add column** → **Multiple lines of text** → Name: `Message` → Required: No → **Save**.

#### Add "FileLink"

8. **+ Add column** → scroll down and select **Hyperlink** → Name: `FileLink` → Required: No → **Save**.

   > If you don't see "Hyperlink" in the quick list, click **+ Add column** → **Show/hide columns** or go to **List settings** (gear icon → List settings) → **Create column** → select **Hyperlink or Picture** as the type.

#### Add "Timestamp"

9. **+ Add column** → **Date and time** → Name: `Timestamp` → Include time: **Yes** → Required: Yes → **Save**.

#### Add "Inspector"

10. **+ Add column** → **Single line of text** → Name: `Inspector` → Required: No → **Save**.

> ✅ **RunLog list complete.** Columns: Title, ActivityNumber, Action, Result, Message, FileLink, Timestamp, Inspector.

---

### 1.7 Create the Document Library Folders

1. From your site home page, click **Documents** in the left sidebar. (This is the "Shared Documents" library that was created automatically with your site.)
2. Click **+ New** → **Folder**.
3. Name the folder: `Templates`
4. Click **Create**.
5. Click **+ New** → **Folder** again.
6. Name the folder: `Inspectors`
7. Click **Create**.

You should now see two folders in your Documents library:
- 📁 Templates
- 📁 Inspectors

> The `Inspectors` folder will contain sub-folders for each inspector (created automatically by Power Automate Flow 1). The `Templates` folder is where you'll upload the Word templates next.

---

### 1.8 Upload Word Templates

1. In your Documents library, **double-click** the **Templates** folder to open it.
2. Click **Upload** → **Files** in the toolbar at the top.
3. Navigate to the `docs/word-templates/` folder in the project repository on your computer.
4. Select **all 12** of the following files and click **Open**:

| # | File Name | Purpose |
|---|---|---|
| 1 | `ApprovalLetter.docx` | Standard approval letter |
| 2 | `CSC_ApprovalLetter.docx` | CSC-specific approval letter |
| 3 | `Checklist_Classified.docx` | Inspection checklist for Classified level |
| 4 | `Checklist_Protected.docx` | Inspection checklist for Protected level |
| 5 | `Corrective_Measures.docx` | Corrective measures report |
| 6 | `CSC-IT-Approval.docx` | CSC IT approval letter |
| 7 | `FinalReport.docx` | Final inspection report |
| 8 | `IT-Approval.docx` | IT approval letter |
| 9 | `Initial_Email_Classified.docx` | Initial notification email (Classified) |
| 10 | `Initial_Email_Protected.docx` | Initial notification email (Protected) |
| 11 | `Memorandum.docx` | Memorandum template |
| 12 | `Sample_Corrective_Measures.docx` | Reference sample (not used by flows) |

5. Wait for all files to finish uploading. You should see all 12 files listed in the Templates folder.
6. **Verify**: Click on any file to open it in Word Online — make sure it opens correctly and contains the expected template content.

---

## Part 2: Word Templates — Content Controls

Before Power Automate can populate your templates, each template must have **Content Controls** — special tagged fields that Power Automate replaces with real data. This section explains how to set them up in Microsoft Word (desktop version).

---

### 2.1 Enable the Developer Tab

You only need to do this once per computer.

1. Open **Microsoft Word** (desktop version, not Word Online).
2. Click **File** → **Options** (at the bottom of the left sidebar).
3. In the Word Options dialog, click **Customize Ribbon** in the left column.
4. In the right column ("Main Tabs"), find **Developer** and **check the box** ☑ next to it.
5. Click **OK**.
6. You should now see a **Developer** tab in the ribbon at the top of Word.

---

### How to Add a Content Control (General Instructions)

For every template below, you'll repeat this process for each field:

1. **Open** the template `.docx` file in Word (desktop).
2. **Find** the placeholder text (e.g., `{{CompanyName}}` or `{CompanyName}`).
3. **Select** the entire placeholder text (highlight it).
4. Click the **Developer** tab in the ribbon.
5. Click the appropriate content control button:
   - **Aa** (Plain Text Content Control) — for most fields
   - **📅** (Date Picker Content Control) — for date fields
   - **🔄** (Repeating Section Content Control) — for lists that repeat
   - **Aa** with formatting (Rich Text Content Control) — for multi-line text with formatting
6. With the content control now inserted (it appears as a grey box), click **Properties** in the Developer tab.
7. In the Content Control Properties dialog:
   - **Title**: Type the field name (e.g., `CompanyName`)
   - **Tag**: Type the **exact same** field name (e.g., `CompanyName`)
   - Optionally check **Content control cannot be deleted**
8. Click **OK**.
9. **Save** the file.

> ⚠️ **The Tag must match exactly** (case-sensitive). Power Automate uses the Tag to find and replace each field.

---

### 2.2 ApprovalLetter.docx

Open `ApprovalLetter.docx` in Word desktop and add these content controls:

| Placeholder to Find | Tag (exact) | Control Type |
|---|---|---|
| `{{InspectorInitials}}` | `InspectorInitials` | Plain Text |
| `{{Date}}` | `Date` | Date Picker |
| `{{CSOFullName}}` | `CSOFullName` | Plain Text |
| `{{CompanyName}}` | `CompanyName` | Plain Text |
| `{{OrgNumber}}` | `OrgNumber` | Plain Text |
| `{{Contracts}}` | `Contracts` | Plain Text |
| `{{SecurityLevel}}` | `SecurityLevel` | Plain Text |

#### CC List (Repeating Section)

The CC recipients section repeats for each person:

1. Find the section where CC recipients are listed.
2. Select the **entire block** that should repeat for each CC recipient (typically one paragraph or table row).
3. Click **Developer** → **Repeating Section Content Control**.
4. Click **Properties**:
   - **Title**: `CCList`
   - **Tag**: `CCList`
5. Click **OK**.
6. Inside the repeating section, add individual Plain Text controls for:
   - `CCName` — Recipient name
   - `CCTitle` — Job title
   - `CCDepartment` — Department

Save the file.

---

### 2.3 CSC_ApprovalLetter.docx

Open `CSC_ApprovalLetter.docx` and add these content controls:

| Placeholder | Tag | Control Type |
|---|---|---|
| `{{InspectorInitials}}` | `InspectorInitials` | Plain Text |
| `{{Date}}` | `Date` | Date Picker |
| `{{CSOFullName}}` | `CSOFullName` | Plain Text |
| `{{CompanyName}}` | `CompanyName` | Plain Text |
| `{{OrgNumber}}` | `OrgNumber` | Plain Text |
| `{{Contracts}}` | `Contracts` | Plain Text |
| `{{SecurityLevel}}` | `SecurityLevel` | Plain Text |
| `{{ComputerName}}` | `ComputerName` | Plain Text |
| `{{AssetSerial}}` | `AssetSerial` | Plain Text |
| `{{OperatingSystem}}` | `OperatingSystem` | Plain Text |
| `{{EncryptionLevel}}` | `EncryptionLevel` | Plain Text |
| `{{BIOSProtected}}` | `BIOSProtected` | Plain Text |

Also add the `CCList` repeating section as in [2.2](#22-approvalletterdocx).

Save the file.

---

### 2.4 Checklist_Classified.docx

Open `Checklist_Classified.docx` and add these content controls:

| Placeholder | Tag | Control Type |
|---|---|---|
| `{{CompanyName}}` | `CompanyName` | Plain Text |
| `{{OrgSiteNumber}}` | `OrgSiteNumber` | Plain Text |
| `{{ActivityNumber}}` | `ActivityNumber` | Plain Text |
| `{{SecurityLevel}}` | `SecurityLevel` | Plain Text |
| `{{InspectionDate}}` | `InspectionDate` | Date Picker |
| `{{InspectorName}}` | `InspectorName` | Plain Text |

For each checklist item that has a pass/fail or yes/no:
1. Place your cursor where the checkbox should go.
2. Click **Developer** → **Check Box Content Control** ☑.
3. Set appropriate Tag names (e.g., `Section1_Item1`, `Section1_Item2`, etc.).

Save the file.

---

### 2.5 Checklist_Protected.docx

Same field structure as [2.4 Checklist_Classified.docx](#24-checklist_classifieddocx). Open the file and add the same content controls:

| Placeholder | Tag | Control Type |
|---|---|---|
| `{{CompanyName}}` | `CompanyName` | Plain Text |
| `{{OrgSiteNumber}}` | `OrgSiteNumber` | Plain Text |
| `{{ActivityNumber}}` | `ActivityNumber` | Plain Text |
| `{{SecurityLevel}}` | `SecurityLevel` | Plain Text |
| `{{InspectionDate}}` | `InspectionDate` | Date Picker |
| `{{InspectorName}}` | `InspectorName` | Plain Text |

Add checkbox controls for checklist items. Save the file.

---

### 2.6 Corrective_Measures.docx

Open `Corrective_Measures.docx` and add:

| Placeholder | Tag | Control Type |
|---|---|---|
| `{{CompanyName}}` | `CompanyName` | Plain Text |
| `{{ActivityNumber}}` | `ActivityNumber` | Plain Text |
| `{{InspectionDate}}` | `InspectionDate` | Date Picker |
| `{{InspectorName}}` | `InspectorName` | Plain Text |
| `{{InspectorInitials}}` | `InspectorInitials` | Plain Text |

#### Measures List (Repeating Section)

1. Find the section listing individual corrective measures.
2. Select the block that should repeat for each measure.
3. Click **Developer** → **Repeating Section Content Control**.
4. **Properties**: Title = `MeasuresList`, Tag = `MeasuresList`.
5. Inside the repeating section, add:
   - `MeasureIndex` (Plain Text) — the measure number
   - `MeasureText` (Rich Text) — the measure description

Save the file.

---

### 2.7 CSC-IT-Approval.docx

Open `CSC-IT-Approval.docx` and add:

| Placeholder | Tag | Control Type |
|---|---|---|
| `{{Date}}` | `Date` | Date Picker |
| `{{CompanyName}}` | `CompanyName` | Plain Text |
| `{{OrgNumber}}` | `OrgNumber` | Plain Text |
| `{{CSOFullName}}` | `CSOFullName` | Plain Text |
| `{{ComputerName}}` | `ComputerName` | Plain Text |
| `{{AssetSerial}}` | `AssetSerial` | Plain Text |
| `{{OperatingSystem}}` | `OperatingSystem` | Plain Text |
| `{{EncryptionLevel}}` | `EncryptionLevel` | Plain Text |
| `{{SecurityLevel}}` | `SecurityLevel` | Plain Text |
| `{{InspectorName}}` | `InspectorName` | Plain Text |
| `{{InspectorInitials}}` | `InspectorInitials` | Plain Text |

Save the file.

---

### 2.8 FinalReport.docx

Open `FinalReport.docx` and add:

#### Header Fields

| Placeholder | Tag | Control Type |
|---|---|---|
| `{{CompanyName}}` | `CompanyName` | Plain Text |
| `{{OrgSiteNumber}}` | `OrgSiteNumber` | Plain Text |
| `{{ActivityNumber}}` | `ActivityNumber` | Plain Text |
| `{{ContractNumber}}` | `ContractNumber` | Plain Text |
| `{{SecurityLevel}}` | `SecurityLevel` | Plain Text |
| `{{ClientDepartment}}` | `ClientDepartment` | Plain Text |
| `{{InspectionDate}}` | `InspectionDate` | Date Picker |
| `{{InspectorName}}` | `InspectorName` | Plain Text |
| `{{Address}}` | `Address` | Plain Text |
| `{{CSOFullName}}` | `CSOFullName` | Plain Text |
| `{{AltCSOName}}` | `AltCSOName` | Plain Text |

#### Section Observations

For each of the 9 inspection sections, add a Rich Text content control:

| Placeholder | Tag | Control Type |
|---|---|---|
| `{{Section1_Observations}}` | `Section1_Observations` | Rich Text |
| `{{Section2_Observations}}` | `Section2_Observations` | Rich Text |
| `{{Section3_Observations}}` | `Section3_Observations` | Rich Text |
| `{{Section4_Observations}}` | `Section4_Observations` | Rich Text |
| `{{Section5_Observations}}` | `Section5_Observations` | Rich Text |
| `{{Section6_Observations}}` | `Section6_Observations` | Rich Text |
| `{{Section7_Observations}}` | `Section7_Observations` | Rich Text |
| `{{Section8_Observations}}` | `Section8_Observations` | Rich Text |
| `{{Section9_Observations}}` | `Section9_Observations` | Rich Text |

#### Corrective Measures (Repeating Section)

1. Select the corrective measures table rows that repeat.
2. **Developer** → **Repeating Section Content Control**.
3. Tag: `MeasuresList`.
4. Inside, add: `MeasureText` (Rich Text), `MeasureSection` (Plain Text).

#### Summary

| Placeholder | Tag | Control Type |
|---|---|---|
| `{{AdditionalRemarks}}` | `AdditionalRemarks` | Rich Text |
| `{{TotalMeasures}}` | `TotalMeasures` | Plain Text |

Save the file.

---

### 2.9 IT-Approval.docx

Open `IT-Approval.docx` and add:

| Placeholder | Tag | Control Type |
|---|---|---|
| `{{Date}}` | `Date` | Date Picker |
| `{{CompanyName}}` | `CompanyName` | Plain Text |
| `{{OrgNumber}}` | `OrgNumber` | Plain Text |
| `{{CSOFullName}}` | `CSOFullName` | Plain Text |
| `{{SecurityLevel}}` | `SecurityLevel` | Plain Text |
| `{{InspectorName}}` | `InspectorName` | Plain Text |
| `{{InspectorInitials}}` | `InspectorInitials` | Plain Text |

Save the file.

---

### 2.10 Initial_Email_Classified.docx

Open `Initial_Email_Classified.docx` and add:

| Placeholder | Tag | Control Type |
|---|---|---|
| `{{Date}}` | `Date` | Date Picker |
| `{{CSOFullName}}` | `CSOFullName` | Plain Text |
| `{{CompanyName}}` | `CompanyName` | Plain Text |
| `{{OrgNumber}}` | `OrgNumber` | Plain Text |
| `{{SecurityLevel}}` | `SecurityLevel` | Plain Text |
| `{{ActivityNumber}}` | `ActivityNumber` | Plain Text |
| `{{InspectionDate}}` | `InspectionDate` | Date Picker |
| `{{InspectorName}}` | `InspectorName` | Plain Text |
| `{{InspectorInitials}}` | `InspectorInitials` | Plain Text |
| `{{EmailAddress}}` | `EmailAddress` | Plain Text |

Save the file.

---

### 2.11 Initial_Email_Protected.docx

Same fields as [2.10](#210-initial_email_classifieddocx). Open `Initial_Email_Protected.docx` and add the same content controls with the same Tags. Save the file.

---

### 2.12 Memorandum.docx

Open `Memorandum.docx` and add:

| Placeholder | Tag | Control Type |
|---|---|---|
| `{{Date}}` | `Date` | Date Picker |
| `{{ContractLevel}}` | `ContractLevel` | Plain Text |
| `{{ActivityType}}` | `ActivityType` | Plain Text |
| `{{ActivityNumber}}` | `ActivityNumber` | Plain Text |
| `{{ContractNumber}}` | `ContractNumber` | Plain Text |
| `{{OrgName}}` | `OrgName` | Plain Text |
| `{{DISIS}}` | `DISIS` | Plain Text |
| `{{OrgAddress}}` | `OrgAddress` | Plain Text |
| `{{CSOName}}` | `CSOName` | Plain Text |
| `{{EmailAddress}}` | `EmailAddress` | Plain Text |

Save the file.

---

### 2.13 Test a Template Manually

Before connecting to Power Automate, verify your content controls work:

1. Open the template in Word (desktop).
2. Click the **Developer** tab.
3. Click **Design Mode** (toggles design mode on — you'll see the content control boundaries clearly).
4. Verify each content control shows its Tag name.
5. Click **Design Mode** again to toggle it off.
6. Try typing inside each content control — you should be able to enter text in the grey boxes.
7. **Re-upload** the updated template to SharePoint: go to your site → Documents → Templates → click **Upload** → **Files** → select the updated file → when prompted "A file with this name already exists", select **Replace**.

---

## Part 3: Azure AD App Registration

This section is done in the Azure Portal at `https://portal.azure.com`.

---

### 3.1 Register the Application

1. Open your browser and go to `https://portal.azure.com`.
2. Sign in with your **Global Administrator** (or Application Administrator) account.
3. In the search bar at the top, type `App registrations` and click **App registrations** from the results.
4. Click **+ New registration** at the top.
5. Fill in the registration form:
   - **Name**: Type `Project INGOT`
   - **Supported account types**: Select **Accounts in this organizational directory only (Single tenant)**
   - **Redirect URI**:
     - In the dropdown, select **Single-page application (SPA)**
     - In the URL field, type: `http://localhost:5173`
6. Click **Register**.

You are now on the app's **Overview** page.

---

### 3.2 Record Your IDs

On the Overview page, you'll see two important values. **Copy these now** — you'll need them later:

| Field on Screen | What to Copy | Where You'll Use It |
|---|---|---|
| **Application (client) ID** | A GUID like `a1b2c3d4-e5f6-...` | → `.env.local` as `VITE_AZURE_CLIENT_ID` |
| **Directory (tenant) ID** | A GUID like `f7g8h9i0-j1k2-...` | → `.env.local` as `VITE_AZURE_TENANT_ID` |

> 💡 **Tip**: Paste these into a temporary text file so you don't lose them.

---

### 3.3 Add API Permissions

1. In the left sidebar of your app registration, click **API permissions**.
2. Click **+ Add a permission**.
3. In the panel that appears, click **Microsoft Graph** (the first option, with the blue icon).
4. Select **Delegated permissions** (not Application permissions).
5. In the search box, type `Sites.ReadWrite.All`.
6. Check the box ☑ next to **Sites.ReadWrite.All**.
7. Clear the search box and type `Files.ReadWrite`.
8. Check the box ☑ next to **Files.ReadWrite**.
9. Click **Add permissions** at the bottom of the panel.

You should now see 3 permissions listed:
- `User.Read` (was there by default)
- `Sites.ReadWrite.All` (you just added)
- `Files.ReadWrite` (you just added)

---

### 3.4 Grant Admin Consent

1. Still on the **API permissions** page, look at the **Status** column. It probably says "Not granted for [Tenant]" with an orange ⚠ icon.
2. Click the **Grant admin consent for [Your Tenant Name]** button at the top of the permissions list.
3. A confirmation dialog appears. Click **Yes**.
4. All three permissions should now show a green ✅ checkmark with status "Granted for [Tenant]".

---

### 3.5 Configure Authentication Settings

1. In the left sidebar, click **Authentication**.
2. Under **Platform configurations**, you should see **Single-page application** with the redirect URI `http://localhost:5173`.
3. Click **+ Add URI** to add your production URL:
   - Type: `https://YOUR-APP.azurestaticapps.net` (replace with your actual production URL)
   - Click **Save** at the bottom.
4. Scroll down to **Implicit grant and hybrid flows**.
5. Check ☑ **Access tokens (used for implicit flows)**.
6. Check ☑ **ID tokens (used for implicit and hybrid flows)**.
7. Click **Save** at the bottom of the page.

> ✅ **Azure AD setup complete.** You have a registered app with the correct permissions and redirect URIs.

---

## Part 4: Power Automate — Flow 1: Create Inspector Folder

This flow creates a folder in the SharePoint document library when a new inspector is added in the app.

---

### 4.1 Create the Flow

1. Open your browser and go to `https://make.powerautomate.com`.
2. Sign in with your Microsoft 365 account.
3. In the left sidebar, click **My flows**.
4. Click **+ New flow** → **Instant cloud flow**.
5. In the dialog that appears:
   - **Flow name**: Type `INGOT - Create Inspector Folder`
   - Under "Choose how to trigger this flow", select **When an HTTP request is received**
   - Click **Create**.

You are now in the flow designer with the HTTP trigger step already on the canvas.

---

### 4.2 Configure the HTTP Trigger

1. Click on the **When an HTTP request is received** trigger block to expand it.
2. You'll see a field called **Request Body JSON Schema**. Click inside it and paste this exact JSON:

```json
{
  "type": "object",
  "properties": {
    "inspectorInitials": {
      "type": "string"
    },
    "inspectorName": {
      "type": "string"
    }
  },
  "required": [
    "inspectorInitials"
  ]
}
```

3. Click on **Advanced options** (if visible) or the three dots `...` → **Settings**.
4. Under **Allowed methods**, select **POST**.
5. Close the settings.

> The schema tells Power Automate what data to expect. After saving the flow, this trigger will generate a unique URL.

---

### 4.3 Add Action: Create Folder in SharePoint

1. Click **+ New step** (below the trigger).
2. In the search box, type `SharePoint` and select the **SharePoint** connector.
3. From the list of actions, select **Create new folder**.
4. Configure the action:
   - **Site Address**: Click the dropdown and select your Project INGOT site. If it doesn't appear, click **Enter custom value** and type:
     `https://TENANT.sharepoint.com/sites/ProjectINGOT`
   - **List or Library**: Select **Documents** (or `Shared Documents`).
   - **Folder Path**: Click in the field, then click **Add dynamic content** (the ⚡ lightning bolt icon). Select `inspectorInitials` from the dynamic content list. The field should now read:
     `Inspectors/` then click in front of the dynamic content and type `Inspectors/` so it reads:

     `Inspectors/` ⚡`inspectorInitials`

     The full path will resolve to something like `Inspectors/JD`.

---

### 4.4 Add Action: Update Inspector Record

This step writes the folder path back to the Inspectors list item so the app knows where the folder is.

1. Click **+ New step**.
2. Search for **SharePoint** → select **Update item**.
3. Configure:
   - **Site Address**: Select your Project INGOT site.
   - **List Name**: Select **Inspectors**.
   - **Id**: This is the SharePoint list item ID. For now, you may need to use a **Get items** action first to find the inspector by initials. Here's how:

**Alternative approach — insert a "Get items" step before Update:**

a. Click the `...` on the Update item step → **Delete**.

b. Click **+ New step** → **SharePoint** → **Get items**.

c. Configure:
   - **Site Address**: Project INGOT site
   - **List Name**: Inspectors
   - **Filter Query**: `Initials eq '` then add dynamic content ⚡`inspectorInitials` then type `'`
     Full filter: `Initials eq '`⚡`inspectorInitials``'`
   - **Top Count**: `1`

d. Click **+ New step** → **SharePoint** → **Update item**.

e. Configure:
   - **Site Address**: Project INGOT site
   - **List Name**: Inspectors
   - **Id**: Click **Add dynamic content** → under the "Get items" section, select **ID**. Power Automate will automatically wrap this in an "Apply to each" loop — that's OK.
   - **Title**: Add dynamic content → ⚡`inspectorName`
   - **FolderPath**: Type `Inspectors/` then add dynamic content ⚡`inspectorInitials`

---

### 4.5 Add Action: Log to RunLog

1. Click **+ New step** (inside the Apply to each loop, or after it).
2. **SharePoint** → **Create item**.
3. Configure:
   - **Site Address**: Project INGOT site
   - **List Name**: RunLog
   - **Title**: Type `CreateFolder-` then add ⚡`inspectorInitials`
   - **ActivityNumber**: Type `N/A` (this flow isn't activity-specific)
   - **Action**: Type `CreateFolder`
   - **Result**: Select `Success` from the dropdown
   - **Message**: Type `Created folder for inspector ` then add ⚡`inspectorInitials`
   - **Timestamp**: Click **Expression** tab (next to Dynamic content), type `utcNow()`, and click **OK**.
   - **Inspector**: Add dynamic content ⚡`inspectorInitials`

---

### 4.6 Add Action: Send Response

1. Click **+ New step**.
2. Search for `Response` → select **Response** (under the "Request" connector).
3. Configure:
   - **Status Code**: `200`
   - **Headers**: Click **Show advanced options** → add a header:
     - Key: `Content-Type`
     - Value: `application/json`
   - **Body**: Type:
     ```json
     {
       "success": true,
       "folderPath": "Inspectors/INITIALS"
     }
     ```
     Replace `INITIALS` with dynamic content ⚡`inspectorInitials` so it reads:
     ```
     {
       "success": true,
       "folderPath": "Inspectors/⚡inspectorInitials"
     }
     ```

---

### 4.7 Add Error Handling

To handle errors gracefully:

1. **Select all the action steps** after the trigger (Create folder, Get items, Update item, Create item for RunLog, Response).
2. Click the `...` (three dots) on the first action → **Add a parallel branch** → actually, the easier approach is:

**Using Scope blocks:**

a. Delete the existing Response step.

b. Click **+ New step** → search for **Scope** → select **Scope** (under "Control").

c. **Rename** the scope to `Try` by clicking the title.

d. **Drag** (or cut/paste) the Create folder, Get items, Update item, and RunLog steps **inside** the Try scope. (Click `...` on each step → **Move to** → **Try Scope**.)

e. After the Try scope, click **+ New step** → **Scope** → rename to `Catch`.

f. Click the `...` on the **Catch** scope → **Configure run after** → check ☑ **has failed** and ☑ **has timed out** → uncheck ☐ **is successful** → click **Done**.

g. Inside the **Catch** scope, add:
   - **SharePoint** → **Create item** (RunLog): Action = `CreateFolder`, Result = `Error`, Message = `Folder creation failed for ⚡inspectorInitials`
   - **Response**: Status Code = `500`, Body = `{ "success": false, "error": "Folder creation failed" }`

h. After the **Catch** scope (at the same level), add another **Response** that runs after the **Try** scope succeeds:
   - Status Code = `200`, Body = `{ "success": true, "folderPath": "Inspectors/⚡inspectorInitials" }`

---

### 4.8 Save and Copy the Trigger URL

1. Click **Save** in the top toolbar.
2. After saving, click on the **When an HTTP request is received** trigger to expand it.
3. You'll see a field labeled **HTTP POST URL** with a long URL. Click the **📋 copy** button next to it.
4. **Paste this URL** into your temporary text file. Label it:
   ```
   FLOW 1 (Create Inspector Folder): https://prod-xx.eastus.logic.azure.com:443/workflows/...
   ```

> ⚠️ **This URL contains a secret signature.** Treat it like a password — do not share it publicly.

---

## Part 5: Power Automate — Flow 2: Generate Document

This flow takes a template name and merge data, populates the Word template, and saves the result to the inspector's activity folder.

---

### 5.1 Create the Flow

1. Go to `https://make.powerautomate.com` → **My flows**.
2. Click **+ New flow** → **Instant cloud flow**.
3. **Flow name**: `INGOT - Generate Document`
4. Trigger: **When an HTTP request is received**
5. Click **Create**.

---

### 5.2 Configure the HTTP Trigger

1. Click on the trigger block and paste this JSON schema:

```json
{
  "type": "object",
  "properties": {
    "templateName": {
      "type": "string"
    },
    "activityNumber": {
      "type": "string"
    },
    "inspectorInitials": {
      "type": "string"
    },
    "mergeData": {
      "type": "object"
    }
  },
  "required": [
    "templateName",
    "activityNumber",
    "inspectorInitials",
    "mergeData"
  ]
}
```

2. Set the method to **POST** (in advanced options if available).

---

### 5.3 Add Action: Get Template File

1. Click **+ New step** → **SharePoint** → **Get file content using path**.
2. Configure:
   - **Site Address**: Select your Project INGOT site.
   - **File Path**: Type `/Shared Documents/Templates/` then add dynamic content ⚡`templateName`

   Full path: `/Shared Documents/Templates/`⚡`templateName`

> This retrieves the Word template file from the Templates folder you created in Part 1.

---

### 5.4 Add Action: Populate Word Template

1. Click **+ New step**.
2. Search for `Word Online` or `Populate a Microsoft Word template`.
3. Select **Populate a Microsoft Word template** (under the Word Online (Business) connector).
4. If prompted to sign in, use your Microsoft 365 account.
5. Configure:
   - **Location**: Select **SharePoint**
   - **Document Library**: Select **Documents**
   - **File**: Select the template file path — but since we need a dynamic path, use the file content from the previous step instead. Click **Switch to input entire file content** (or use the approach below).

**Alternative approach using the file content directly:**

> **Important Note:** The "Populate a Microsoft Word template" connector in Power Automate works best when you select a specific template file from SharePoint. For dynamic template selection, you have two options:

**Option A — Switch/Case (Recommended for reliability):**

a. After the trigger, add a **Control** → **Switch** action.
b. Set the **On** field to ⚡`templateName`.
c. Add a **Case** for each template (e.g., `FinalReport.docx`, `Memorandum.docx`, etc.).
d. In each case, add:
   - **Populate a Microsoft Word template**: Select the specific template file from SharePoint → Documents → Templates → [that specific file]
   - Map each content control tag to the corresponding field from ⚡`mergeData`. Power Automate will show all the content control tags from the selected template — fill each one with the appropriate dynamic content from `mergeData`.

**Option B — Direct file content (Requires premium connector or third-party):**

If you have a premium connector like **Encodian** or **Plumsail Documents**, you can pass the file content from step 5.3 directly and do dynamic field replacement. This is more flexible but requires additional licensing.

For the rest of this guide, we'll assume **Option A (Switch/Case)**:

6. For each case in the Switch, after selecting the template and mapping fields, Power Automate will display all the content control Tags from that template. For each Tag, click in the field and use **Add dynamic content** → expand the ⚡`mergeData` object to find the matching field.

> Example: For `FinalReport.docx`, you'll see fields like `CompanyName`, `ActivityNumber`, `InspectorName`, etc. Map each one to `mergeData.CompanyName`, `mergeData.ActivityNumber`, `mergeData.InspectorName`, etc.

---

### 5.5 Add Action: Create Activity Folder

After each case in the Switch (or after the Switch block):

1. **+ New step** → **SharePoint** → **Create new folder**.
2. Configure:
   - **Site Address**: Project INGOT site
   - **List or Library**: Documents
   - **Folder Path**: `Inspectors/`⚡`inspectorInitials`/⚡`activityNumber`

> If the folder already exists, the action will fail. To handle this, click the `...` → **Configure run after** → check ☑ **is successful** and ☑ **has failed**. The flow will continue either way.

---

### 5.6 Add Action: Save the Generated File

1. **+ New step** → **SharePoint** → **Create file**.
2. Configure:
   - **Site Address**: Project INGOT site
   - **Folder Path**: `/Shared Documents/Inspectors/`⚡`inspectorInitials`/⚡`activityNumber`
   - **File Name**: Add dynamic content ⚡`templateName`
   - **File Content**: Add dynamic content from the **Populate a Microsoft Word template** step → select **Microsoft Word Document** (the output file content).

---

### 5.7 Add Action: Log to RunLog

1. **+ New step** → **SharePoint** → **Create item**.
2. Configure:
   - **Site Address**: Project INGOT site
   - **List Name**: RunLog
   - **Title**: `GenerateDoc-`⚡`activityNumber`-⚡`templateName`
   - **ActivityNumber**: ⚡`activityNumber`
   - **Action**: `GenerateDoc`
   - **Result**: `Success`
   - **Message**: `Generated `⚡`templateName` for activity `⚡`activityNumber`
   - **FileLink**: Use the output from the Create file step — click **Add dynamic content** → under "Create file", select **Link to item** (or construct the URL).
   - **Timestamp**: Expression → `utcNow()`
   - **Inspector**: ⚡`inspectorInitials`

---

### 5.8 Add Action: Send Response

1. **+ New step** → **Response**.
2. Configure:
   - **Status Code**: `200`
   - **Headers**: `Content-Type` = `application/json`
   - **Body**:
     ```json
     {
       "success": true,
       "fileUrl": "LINK_TO_CREATED_FILE"
     }
     ```
     Replace `LINK_TO_CREATED_FILE` with dynamic content from the Create file step (⚡Link to item or ⚡Path).

---

### 5.9 Save and Copy the Trigger URL

1. Click **Save**.
2. Click the HTTP trigger → copy the **HTTP POST URL**.
3. Paste into your text file:
   ```
   FLOW 2 (Generate Document): https://prod-xx.eastus.logic.azure.com:443/workflows/...
   ```

---

## Part 6: Power Automate — Flow 3: Upload Supporting Documents

This flow accepts a file upload and saves it to the correct activity's Supporting folder.

---

### 6.1 Create the Flow

1. **My flows** → **+ New flow** → **Instant cloud flow**.
2. **Flow name**: `INGOT - Upload Supporting Documents`
3. Trigger: **When an HTTP request is received**
4. Click **Create**.

---

### 6.2 Configure the HTTP Trigger

This flow receives the file as the raw HTTP body, with metadata in query parameters.

1. Click on the trigger. For the JSON schema, leave it **blank** (since the body is binary file content, not JSON).
2. Click **Settings** or **Advanced options**:
   - Set the method to **POST**.

The app will send the file with query parameters:
- `?activityNumber=2026-0042&inspectorInitials=JD&fileName=scan001.pdf`

To access query parameters in later steps, you'll use expressions:
- `triggerOutputs()['queries']['activityNumber']`
- `triggerOutputs()['queries']['inspectorInitials']`
- `triggerOutputs()['queries']['fileName']`

> **Tip:** To make these easier to use, add three **Compose** actions right after the trigger:

3. **+ New step** → **Data Operations** → **Compose**.
   - Rename to `Get ActivityNumber`
   - **Inputs**: Click **Expression** tab, type: `triggerOutputs()['queries']['activityNumber']`, click **OK**.

4. **+ New step** → **Compose**.
   - Rename to `Get InspectorInitials`
   - **Inputs**: Expression → `triggerOutputs()['queries']['inspectorInitials']`

5. **+ New step** → **Compose**.
   - Rename to `Get FileName`
   - **Inputs**: Expression → `triggerOutputs()['queries']['fileName']`

---

### 6.3 Add Action: Create Supporting Folder

1. **+ New step** → **SharePoint** → **Create new folder**.
2. Configure:
   - **Site Address**: Project INGOT site
   - **List or Library**: Documents
   - **Folder Path**: `Inspectors/`⚡`Outputs` (from Get InspectorInitials)`/`⚡`Outputs` (from Get ActivityNumber)`/Supporting`

   Use dynamic content from the Compose steps: click ⚡ → under "Get InspectorInitials", select **Outputs**, type `/`, then ⚡ → under "Get ActivityNumber", select **Outputs**, type `/Supporting`.

3. Click `...` → **Configure run after** → check both ☑ **is successful** and ☑ **has failed** (so the flow continues if the folder already exists).

---

### 6.4 Add Action: Create the File

1. **+ New step** → **SharePoint** → **Create file**.
2. Configure:
   - **Site Address**: Project INGOT site
   - **Folder Path**: `/Shared Documents/Inspectors/`⚡InspectorInitials`/`⚡ActivityNumber`/Supporting`
   - **File Name**: ⚡`Outputs` from "Get FileName"
   - **File Content**: Click **Add dynamic content** → under "When an HTTP request is received", select **Body** (this is the raw binary file content).

---

### 6.5 Add Action: Log to RunLog

1. **+ New step** → **SharePoint** → **Create item**.
2. Configure:
   - **Site Address**: Project INGOT site
   - **List Name**: RunLog
   - **Title**: `UploadDoc-`⚡ActivityNumber`-`⚡FileName
   - **ActivityNumber**: ⚡ActivityNumber
   - **Action**: `UploadDoc`
   - **Result**: `Success`
   - **Message**: `Uploaded `⚡FileName` to `⚡ActivityNumber`/Supporting`
   - **Timestamp**: Expression → `utcNow()`
   - **Inspector**: ⚡InspectorInitials

---

### 6.6 Add Action: Send Response

1. **+ New step** → **Response**.
2. Configure:
   - **Status Code**: `200`
   - **Headers**: `Content-Type` = `application/json`
   - **Body**:
     ```json
     {
       "success": true,
       "fileUrl": "URL_FROM_CREATE_FILE"
     }
     ```
     Replace `URL_FROM_CREATE_FILE` with dynamic content ⚡Link to item from the Create file step.

---

### 6.7 Save and Copy the Trigger URL

1. Click **Save**.
2. Click the trigger → copy the **HTTP POST URL**.
3. Paste into your text file:
   ```
   FLOW 3 (Upload Documents): https://prod-xx.eastus.logic.azure.com:443/workflows/...
   ```

---

## Part 7: Connecting Everything

Now that all the pieces are set up, connect them to the React application.

---

### 7.1 Collect Your Flow URLs

By now you should have three URLs from the Power Automate triggers. They look like this:

```
https://prod-XX.eastus.logic.azure.com:443/workflows/GUID/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=SIGNATURE
```

You should also have from Part 3:
- **Application (client) ID** from Azure AD
- **Directory (tenant) ID** from Azure AD

And from Part 1:
- **SharePoint Site URL**: `https://TENANT.sharepoint.com/sites/ProjectINGOT`

---

### 7.2 Create the Environment File

1. In the project repository on your computer, find the file `.env.example` in the root folder.
2. **Copy** `.env.example` and name the copy `.env.local`.
3. Open `.env.local` in a text editor and fill in each value:

```env
# Azure AD Configuration
VITE_AZURE_TENANT_ID=paste-your-tenant-id-here
VITE_AZURE_CLIENT_ID=paste-your-client-id-here

# SharePoint Configuration
VITE_SHAREPOINT_SITE_URL=https://TENANT.sharepoint.com/sites/ProjectINGOT

# Power Automate Flow URLs
VITE_FLOW_CREATE_FOLDER=paste-your-flow-1-url-here
VITE_FLOW_GENERATE_DOC=paste-your-flow-2-url-here
VITE_FLOW_UPLOAD_DOC=paste-your-flow-3-url-here

# Optional
VITE_APP_VERSION=2.5.0
VITE_ENVIRONMENT=production
```

4. **Save** the file.

> ⚠️ **Never commit `.env.local` to Git.** It contains secrets (the flow URLs have embedded signatures).

---

### 7.3 Build and Deploy

#### For Local Testing

1. Open a terminal in the project root.
2. Run `npm install` (or `bun install`).
3. Run `npm run dev` (or `bun dev`).
4. Open `http://localhost:5173` in your browser.

#### For Azure Static Web Apps Deployment

1. Go to the Azure Portal → create an **Azure Static Web App** resource.
2. Connect it to your GitHub repository.
3. In the Azure Static Web App settings, go to **Configuration** → **Application settings**.
4. Add each environment variable as an application setting:

| Setting Name | Value |
|---|---|
| `VITE_AZURE_TENANT_ID` | Your Tenant ID |
| `VITE_AZURE_CLIENT_ID` | Your Client ID |
| `VITE_SHAREPOINT_SITE_URL` | Your SharePoint site URL |
| `VITE_FLOW_CREATE_FOLDER` | Flow 1 URL |
| `VITE_FLOW_GENERATE_DOC` | Flow 2 URL |
| `VITE_FLOW_UPLOAD_DOC` | Flow 3 URL |

5. Save and redeploy.

#### Embedding in SharePoint (Optional)

If you want to embed the app directly in your SharePoint site:

1. Go to your Project INGOT SharePoint site.
2. Click **⚙️ gear** → **Add a page** (or edit the home page).
3. Click **+** to add a web part → search for **Embed**.
4. Select the **Embed** web part.
5. In the web part settings, paste your app URL:
   - For Azure Static Web Apps: `https://YOUR-APP.azurestaticapps.net`
   - For local dev: `http://localhost:5173`
6. Click **Republish** to save the page.

---

## Part 8: Testing and Verification

Test each flow individually using Power Automate's built-in test feature before testing end-to-end.

---

### 8.1 Test Flow 1 — Create Inspector Folder

1. Go to `https://make.powerautomate.com` → **My flows**.
2. Click on **INGOT - Create Inspector Folder** to open it.
3. Click **Test** in the top-right corner.
4. Select **Manually** → click **Test**.
5. The flow is now waiting for a request. You need to send one:

#### Send a Test Request (Using Power Automate's built-in test)

Actually, for HTTP-triggered flows, Power Automate needs an actual HTTP request. The easiest way without a CLI:

**Option A — Use the app itself:**
1. Open the app in your browser (localhost or production).
2. Navigate to the Inspector management section.
3. Add a new inspector with initials `TEST` and name `Test Inspector`.
4. The app will call the flow automatically.

**Option B — Use Power Automate's "Run" button:**
1. Go to your flow → click **Run** (if available for HTTP triggers).
2. Paste the test payload:
   ```json
   {
     "inspectorInitials": "TEST",
     "inspectorName": "Test Inspector"
   }
   ```
3. Click **Run flow**.

**Option C — Use another flow to test:**
1. Create a temporary "Instant cloud flow" with a **Manual trigger** (button).
2. Add an **HTTP** action that POSTs to your Flow 1 URL with the test JSON body.
3. Run this test flow.

#### Verify the Results

After the flow runs:

1. Go to your SharePoint site → **Documents** → **Inspectors**.
2. You should see a new folder named `TEST`.
3. Go to **Site contents** → **Inspectors** list.
4. Find the "Test Inspector" item — the **FolderPath** column should show `Inspectors/TEST`.
5. Go to **Site contents** → **RunLog** list.
6. You should see a new entry with Action = `CreateFolder` and Result = `Success`.

---

### 8.2 Test Flow 2 — Generate Document

1. Open the **INGOT - Generate Document** flow.
2. Click **Test** → **Manually** → **Test**.
3. Send a request (via the app or a test flow) with this payload:

```json
{
  "templateName": "FinalReport.docx",
  "activityNumber": "2026-TEST",
  "inspectorInitials": "TEST",
  "mergeData": {
    "CompanyName": "Test Company Inc.",
    "OrgSiteNumber": "ORG-001",
    "ActivityNumber": "2026-TEST",
    "ContractNumber": "C-12345",
    "SecurityLevel": "Protected A",
    "ClientDepartment": "Test Department",
    "InspectionDate": "2026-03-18",
    "InspectorName": "Test Inspector",
    "Address": "123 Test Street, Ottawa, ON",
    "CSOFullName": "Jane Smith"
  }
}
```

#### Verify the Results

1. Go to SharePoint → **Documents** → **Inspectors** → **TEST** → **2026-TEST**.
2. You should see `FinalReport.docx`.
3. Click to open it in Word Online.
4. Verify that the merge fields have been replaced:
   - "Test Company Inc." should appear where `{{CompanyName}}` was.
   - "Protected A" should appear where `{{SecurityLevel}}` was.
   - All other fields should be populated.
5. Check the **RunLog** list for a new entry with Action = `GenerateDoc`.

---

### 8.3 Test Flow 3 — Upload Supporting Document

1. Open the **INGOT - Upload Supporting Documents** flow.
2. Click **Test** → **Manually** → **Test**.
3. Send a test file upload through the app:
   - Open the app → go to an activity.
   - Use the "Upload Supporting Document" feature.
   - Select a small test PDF file.

#### Verify the Results

1. Go to SharePoint → **Documents** → **Inspectors** → **TEST** → **2026-TEST** → **Supporting**.
2. Your uploaded file should appear.
3. Check **RunLog** for Action = `UploadDoc`.

---

### 8.4 End-to-End Verification Checklist

Go through each item and confirm it works:

| # | Test | How to Verify | ✅ Pass? |
|---|---|---|---|
| 1 | **Site loads** | Open your app URL — the login page appears | ☐ |
| 2 | **Azure AD login** | Click Sign In — redirected to Microsoft login, then back to app | ☐ |
| 3 | **Create inspector** | Add inspector in the app → folder appears in SharePoint Documents/Inspectors | ☐ |
| 4 | **Create activity** | Create activity in the app → item appears in SharePoint Activities list | ☐ |
| 5 | **Generate Final Report** | Generate a report → populated .docx file appears in the inspector's activity folder | ☐ |
| 6 | **Generate Memorandum** | Generate a memorandum → populated .docx file appears | ☐ |
| 7 | **Upload supporting doc** | Upload a file → appears in the Supporting subfolder | ☐ |
| 8 | **Corrective measures** | Add corrective measures → items appear in CorrectiveMeasures list | ☐ |
| 9 | **RunLog entries** | Check RunLog list → all actions logged with timestamps | ☐ |
| 10 | **Bilingual toggle** | Switch between EN/FR → all UI text changes | ☐ |

---

## Part 9: Permissions and Security

---

### 9.1 Set Up SharePoint Groups

SharePoint uses groups to manage permissions. Your site has three default groups:

1. Go to your SharePoint site.
2. Click **⚙️ gear** → **Site permissions**.
3. You'll see three default groups:
   - **Project INGOT Owners** — Full control (admins)
   - **Project INGOT Members** — Edit access (inspectors)
   - **Project INGOT Visitors** — Read-only (stakeholders)

---

### 9.2 Assign Users to Groups

1. On the **Site permissions** page, click the group you want to add users to (e.g., **Project INGOT Members**).
2. Click **+ Add members** (or **New** → **Add users**).
3. Type the person's name or email address.
4. Select them from the dropdown.
5. Click **Add** (or **Share**).

| Role | Group | What They Can Do |
|---|---|---|
| **Admin** | Owners | Full control — manage lists, settings, permissions, delete items |
| **Inspector** | Members | Create/edit activities, generate documents, upload files |
| **Viewer** | Visitors | View activities and documents (read-only) |

---

### 9.3 Set Folder-Level Permissions

To restrict each inspector so they can only see their own folder:

1. Go to **Documents** → **Inspectors**.
2. Hover over an inspector's folder (e.g., `JD`) → click the **⋮ three dots** → **Manage access**.
3. Click **Advanced** (or go to the classic permissions page).
4. Click **Stop Inheriting Permissions** → confirm by clicking **OK**.
5. Now you can remove users/groups who should not access this folder:
   - Select the groups/users to remove → click **Remove User Permissions**.
6. Add only the specific inspector:
   - Click **Grant Permissions** → type the inspector's name → select **Contribute** permission level → **Share**.

Repeat for each inspector's folder.

> ⚠️ **This is optional but recommended** for environments where inspectors should not see each other's data.

---

### 9.4 Share Power Automate Flows

By default, only the flow creator can edit flows. To share management:

1. Go to `https://make.powerautomate.com` → **My flows**.
2. Click on a flow name → click **Share** (or **⋮ More commands** → **Share**).
3. Under **Owners**, click **+ Add**.
4. Type the email of the person you want to share with.
5. Select them and click **OK** (or **Save**).

> **Owners** can edit and manage the flow. **Run-only users** can trigger the flow but not edit it. For the INGOT flows, only admins need Owner access.

---

## Quick Reference

| Component | Location |
|---|---|
| SharePoint Site | `https://TENANT.sharepoint.com/sites/ProjectINGOT` |
| SharePoint Admin | `https://TENANT-admin.sharepoint.com` |
| Azure Portal | `https://portal.azure.com` → App registrations → Project INGOT |
| Power Automate | `https://make.powerautomate.com` → My flows |
| React App (dev) | `http://localhost:5173` |
| Word Templates | SharePoint → Documents → Templates |
| Setup Script (optional) | `docs/sharepoint-setup.ps1` |
| Deployment Config | `docs/deployment-config.json` |
| Template Field Reference | `docs/word-templates/README-Templates.md` |

---

## Summary of Environment Variables

| Variable | Where You Got It | Section |
|---|---|---|
| `VITE_AZURE_TENANT_ID` | Azure Portal → App registration → Overview → Directory (tenant) ID | [Part 3](#32-record-your-ids) |
| `VITE_AZURE_CLIENT_ID` | Azure Portal → App registration → Overview → Application (client) ID | [Part 3](#32-record-your-ids) |
| `VITE_SHAREPOINT_SITE_URL` | The site URL you created | [Part 1](#11-create-the-site-collection) |
| `VITE_FLOW_CREATE_FOLDER` | Flow 1 HTTP trigger URL | [Part 4](#48-save-and-copy-the-trigger-url) |
| `VITE_FLOW_GENERATE_DOC` | Flow 2 HTTP trigger URL | [Part 5](#59-save-and-copy-the-trigger-url) |
| `VITE_FLOW_UPLOAD_DOC` | Flow 3 HTTP trigger URL | [Part 6](#67-save-and-copy-the-trigger-url) |
