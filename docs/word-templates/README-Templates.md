# Word Template Configuration Guide

## Overview
This folder contains Word template files with content controls that integrate with the Project INGOT application. Each template uses specific content control names that map to the application data.

## Template Files Required

### 1. ApprovalLetter.docx
**Content Controls:**
- `InspectorInitials` - Inspector's initials
- `Date` - Letter date
- `CSOFullName` - Chief Security Officer full name
- `CompanyName` - Organization name
- `OrgNumber` - Organization site number
- `Contracts` - Contract details
- `SecurityLevel` - Security classification level
- `CCList` - Repeating section for CC recipients
- `CSCSection` - Conditional section for CSC approvals
- `ComputerName` - Computer identification (CSC only)
- `AssetSerial` - Asset serial number (CSC only)
- `OperatingSystem` - OS details (CSC only)
- `EncryptionLevel` - Encryption specification (CSC only)
- `BIOSProtected` - BIOS protection status (CSC only)

### 2. DoC.docx (Declaration of Compliance)
**Content Controls:**
- `OrgName` - Organization name
- `OrgNumber` - Organization number
- `OrgAddress` - Organization address
- `CSOName` - Chief Security Officer name
- `CurrentContract` - Current contract details
- `PreviousContract` - Previous contract reference
- `PreviousInspectionDate` - Last inspection date

### 3. Memorandum.docx
**Content Controls:**
- `Date` - Memorandum date
- `ContractLevel` - Security level
- `ActivityType` - Type of activity
- `ActivityNumber` - Activity identifier
- `ContractNumber` - Contract reference
- `OrgName` - Organization name
- `DISIS` - DISIS number
- `OrgAddress` - Organization address
- `CSOName` - Chief Security Officer name
- `EmailAddress` - Contact email

### 4. Inspection.docx
**Content Controls:**
- `CompanyName` - Organization name
- `ClientDepartment` - Department name
- `SecurityLevel` - Security classification
- `OrgSiteNumber` - Site identifier
- `ContractType` - Type of contract
- `ContractNumber` - Contract reference
- `AwardDate` - Contract award date
- `ExpiryDate` - Contract expiry date

### 5. CorrectiveMeasures.docx
**Content Controls:**
- `CompanyName` - Organization name
- `ActivityNumber` - Activity identifier
- `InspectionDate` - Date of inspection
- `MeasuresList` - Repeating section for corrective measures
- `InspectorName` - Inspector name
- `InspectorInitials` - Inspector initials

## Creating Content Controls in Word

### Step-by-Step Instructions:

1. **Open Word and create your document template**

2. **Insert Content Controls:**
   - Go to **Developer** tab (enable if not visible: File > Options > Customize Ribbon > Developer)
   - Place cursor where content should appear
   - Click **Plain Text Content Control** or **Rich Text Content Control**
   - Select the content control and click **Properties**
   - Set the **Title** and **Tag** to match the control names listed above

3. **For Repeating Sections (like CC Lists):**
   - Select the entire section that should repeat
   - Click **Repeating Section Content Control**
   - Set appropriate properties

4. **For Conditional Sections:**
   - Create the content that should conditionally appear
   - Use section breaks or paragraph controls as needed

## Content Control Properties

### Text Controls
- **Lock**: Check "Content control cannot be deleted"
- **Style**: Apply appropriate paragraph/character styles
- **Placeholder Text**: Provide helpful placeholder text

### Date Controls  
- **Display Format**: Use appropriate date format for your locale
- **Calendar Type**: Gregorian (typically)

### Repeating Sections
- **Allow users to add and remove sections**: Usually checked
- **Section title**: Descriptive name for the repeated content

## Testing Your Templates

### Manual Testing:
1. Open the template in Word
2. Go to **Mailings** > **Start Mail Merge** > **Directory**
3. Click **Select Recipients** > **Type a New List**
4. Add sample data matching your content control names
5. Insert merge fields and preview results

### Integration Testing:
1. Upload template to SharePoint Templates folder
2. Use the Project INGOT application to generate a document
3. Verify all content controls populate correctly
4. Check formatting and layout

## Template Maintenance

### Version Control:
- Always backup templates before making changes
- Use descriptive filenames with version numbers if needed
- Test thoroughly after any modifications

### Style Guidelines:
- Use consistent fonts and formatting
- Apply Word styles rather than direct formatting
- Ensure headers/footers are appropriate for your organization
- Include necessary logos, letterheads, or branding

## Troubleshooting

### Common Issues:

**Content controls not populating:**
- Check that Tag names match exactly (case-sensitive)
- Verify content control type is appropriate for data type
- Ensure template is saved as .docx format

**Formatting issues:**
- Check paragraph styles applied to content controls
- Verify spacing and indentation settings
- Test with both short and long content

**Repeating sections not working:**
- Ensure proper section structure in template
- Check that data source provides arrays/collections properly
- Verify section boundaries are correct

### Power Automate Integration Notes:
- Templates must be stored in SharePoint document library
- File permissions must allow Power Automate service account access
- Content control names are case-sensitive
- Use only supported content control types (Plain Text, Rich Text, Date, Repeating Section)

## Security Considerations

- Store templates in secure SharePoint location
- Limit edit permissions to authorized personnel
- Regular review and update of template content
- Ensure no sensitive information is hardcoded in templates

---

**Important**: Always test templates thoroughly before deploying to production. Small errors in content control configuration can cause document generation failures.