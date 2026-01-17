# Final Report Template - Definitive Edition

A standardized, form-fillable IT Security Inspection Report template (3-4 pages) designed for both automated app integration and manual use.

## Quick Start

1. Open `FinalReport_Definitive.html` in Microsoft Word
2. Save as `.docx`
3. Replace `{placeholders}` with Content Controls (see setup instructions below)
4. Save as your master template

---

## Template Structure

| Page | Content |
|------|---------|
| 1 | Security banner, Header block, Purpose statement, Sections 1-4 |
| 2 | Sections 5-9 |
| 3 | Corrective Measures table (consolidated), Additional Remarks |
| 3-4 | Supporting Documents, Summary & Sign-off |

---

## Content Control Setup

### Enable Developer Tab

1. **File** → **Options** → **Customize Ribbon**
2. Check **"Developer"** → Click **OK**

### Adding Content Controls

For each `{placeholder}` in the template:

1. Select the placeholder text (including curly braces)
2. Go to **Developer** tab
3. Click the appropriate Content Control:
   - **Plain Text Content Control** for single-line fields
   - **Rich Text Content Control** for multi-line observations
   - **Date Picker Content Control** for dates
   - **Check Box Content Control** for checkboxes
4. With the control selected, click **Properties**
5. Set the **Tag** to match the field name (without curly braces)
6. Click **OK**

---

## Field Reference

### Header Fields (Dynamic - Auto-populated from app)

| Placeholder | Tag | Control Type |
|------------|-----|--------------|
| `{CompanyName}` | CompanyName | Plain Text |
| `{OrgSiteNumber}` | OrgSiteNumber | Plain Text |
| `{ActivityNumber}` | ActivityNumber | Plain Text |
| `{ContractNumber}` | ContractNumber | Plain Text |
| `{SecurityLevel}` | SecurityLevel | Plain Text |
| `{ClientDepartment}` | ClientDepartment | Plain Text |
| `{InspectionDate}` | InspectionDate | Date Picker |
| `{InspectorName}` | InspectorName | Plain Text |
| `{Address}` | Address | Plain Text |
| `{CSOFullName}` | CSOFullName | Plain Text |
| `{AltCSOName}` | AltCSOName | Plain Text |

### Section Observations (User Input)

| Placeholder | Tag | Control Type |
|------------|-----|--------------|
| `{Section1_Observations}` | Section1_Observations | Rich Text |
| `{Section2_Observations}` | Section2_Observations | Rich Text |
| `{Section3_Observations}` | Section3_Observations | Rich Text |
| `{Section4_Observations}` | Section4_Observations | Rich Text |
| `{Section5_Observations}` | Section5_Observations | Rich Text |
| `{Section6_Observations}` | Section6_Observations | Rich Text |
| `{Section7_Observations}` | Section7_Observations | Rich Text |
| `{Section8_Observations}` | Section8_Observations | Rich Text |
| `{Section9_Observations}` | Section9_Observations | Rich Text |

### Corrective Measures Table

| Placeholder | Tag | Control Type |
|------------|-----|--------------|
| `{Measure1_Text}` - `{Measure10_Text}` | Measure1_Text - Measure10_Text | Plain Text |
| `{Measure1_Section}` - `{Measure10_Section}` | Measure1_Section - Measure10_Section | Plain Text |
| `{TotalMeasures}` | TotalMeasures | Plain Text |

### Supporting Documents

| Placeholder | Tag | Control Type |
|------------|-----|--------------|
| `{SupportingDocCount}` | SupportingDocCount | Plain Text |
| `{EmailCount}` | EmailCount | Plain Text |
| `{Attachment1}` - `{Attachment5}` | Attachment1 - Attachment5 | Plain Text |

### Additional Fields

| Placeholder | Tag | Control Type |
|------------|-----|--------------|
| `{AdditionalRemarks}` | AdditionalRemarks | Rich Text |

---

## Section Mapping

| Section # | Checklist Area |
|-----------|---------------|
| 1 | Information System / Physical Location |
| 2 | Threat Risk Assessment (TRA) |
| 3 | Data Transfer |
| 4 | IT Media and Media Handling |
| 5 | Personnel Security |
| 6 | IT Personnel Security |
| 7 | IT Equipment / Information Technology Security |
| 8 | Recovery |
| 9 | Disposal |

---

## Visual Style

### Colors
- **Header banner**: Navy `#003366` with white text
- **Classification badge**: Red `#DC3545`
- **Section headers**: Navy background, white text
- **Table rows**: Alternating white / `#F8F9FA`

### Typography
- **Headers**: Calibri Bold, 12pt
- **Body text**: Calibri Regular, 11pt
- **Tables**: Calibri Regular, 10pt

---

## Usage Modes

### With Project INGOT App

When using the app, the following data sources map to template fields:

| Data Source | Fields |
|-------------|--------|
| `mainForm` | CompanyName, OrgSiteNumber, ContractNumber, SecurityLevel, ClientDepartment, InspectionDate, Address, CSOFullName, AltCSOName |
| `correctiveMeasures[]` | Measure1-10_Text, Measure1-10_Section, TotalMeasures |
| `reportData` | Section1-9_Observations, AdditionalRemarks |
| `inspector` | InspectorName |
| `attachments` | SupportingDocCount, EmailCount, Attachment1-5 |

### Manual Form-Filling

1. Open the template in Microsoft Word
2. Click on each Content Control and type your content
3. Check appropriate boxes for Pass/Fail and assessments
4. Save as a new document for each inspection

---

## Printing

- **Page size**: Letter (8.5" × 11")
- **Margins**: 0.75" all sides
- **Orientation**: Portrait
- **Recommended**: Export to PDF for distribution

---

## Integration with FinalReportTab.tsx

The `FinalReportTab` component should map data to these field tags:

```typescript
const fieldMappings = {
  // From mainForm
  CompanyName: mainForm.organizationName,
  OrgSiteNumber: mainForm.orgSiteId,
  ContractNumber: mainForm.contractNumber,
  SecurityLevel: mainForm.securityLevel,
  ClientDepartment: mainForm.clientDepartment,
  InspectionDate: mainForm.inspectionDate,
  Address: mainForm.address,
  CSOFullName: mainForm.csoName,
  AltCSOName: mainForm.altCsoName,
  InspectorName: mainForm.inspectorName,
  ActivityNumber: mainForm.activityNumber,
  
  // From reportData
  Section1_Observations: reportData.section1Observations,
  // ... sections 2-9
  AdditionalRemarks: reportData.additionalRemarks,
  
  // From correctiveMeasures
  TotalMeasures: correctiveMeasures.length,
  // Measure1_Text through Measure10_Text
  // Measure1_Section through Measure10_Section
};
```

---

## Checkbox Controls

For Pass/Fail and Yes/No checkboxes:
1. Use **Check Box Content Control** from Developer tab
2. These are intended for manual form-filling
3. In app integration, checkboxes are handled separately

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Definitive Edition - Consolidated corrective measures, added supporting docs tracking |
