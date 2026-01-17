# Final Report Template - Clean Edition

A streamlined 4-page IT Security Inspection Report with a clean 2-column layout, distinct boxed sections, and Pass/Fail checkboxes with 3-line observations.

## Design Philosophy

- **Simple boxes** with clear borders separating every information zone
- **2-column layout** for sections (balanced, not cluttered)
- **Pass/Fail + 3-line observation** per section (minimal, focused)
- **Everything visible at a glance** without hunting through paragraphs
- **~4 pages total**

---

## Quick Start

1. Open `FinalReport_Clean.html` in Microsoft Word
2. Save as DOCX (File → Save As → Word Document)
3. Replace placeholders with Content Controls (see Field Reference below)
4. Save as your master template

---

## Page Structure

### Page 1: Header & Inspection Details

| Zone | Content |
|------|---------|
| Security Banner | Classification level (PROTECTED A/B) |
| Organization Info | Name, Site Number, Address, CSO, Alt CSO |
| Contract Info | Contract #, Activity #, Client Dept, Security Level, Type |
| Inspection Details | Date, Inspector, Region |
| Inspection Status | Status, Report Date, File Reference |
| Purpose Statement | Brief inspection purpose |

### Page 2: Sections 1-6

Two-column grid with 3 rows:
- **Row 1:** Section 1 (Physical Location) | Section 2 (TRA)
- **Row 2:** Section 3 (Data Transfer) | Section 4 (IT Media)
- **Row 3:** Section 5 (Personnel Security) | Section 6 (IT Personnel)

Each section box contains:
- Section number and title
- Pass/Fail checkboxes
- 3 observation lines

### Page 3: Sections 7-9 + Corrective Measures

- **Row 1:** Section 7 (IT Equipment) | Section 8 (Recovery)
- **Centered:** Section 9 (Disposal)
- **Table:** Corrective Measures (10 rows) with #, Description, Section, Done columns

### Page 4: Summary & Sign-off

| Zone | Content |
|------|---------|
| Additional Remarks | 4 lines for inspector notes |
| Supporting Documents | Document count, Email count, Checklist, Video checkboxes |
| Recommendation | Approved / Conditional / Not Approved checkboxes |
| Assessment | Good / Adequate / Insufficient |
| Signature Block | Inspector signature and date |

---

## Content Control Setup

### Enable Developer Tab

1. File → Options → Customize Ribbon
2. Check "Developer" under Main Tabs
3. Click OK

### Adding Content Controls

For each placeholder:
1. Select the placeholder text (e.g., `{CompanyName}`)
2. Delete the placeholder
3. Insert appropriate Content Control from Developer tab
4. Set the **Tag** property to match the field name

---

## Field Reference

### Header Fields (Page 1)

| Placeholder | Tag | Type |
|-------------|-----|------|
| `{SecurityLevel}` | SecurityLevel | Plain Text |
| `{CompanyName}` | CompanyName | Plain Text |
| `{OrgSiteNumber}` | OrgSiteNumber | Plain Text |
| `{Address}` | Address | Plain Text |
| `{CSOFullName}` | CSOFullName | Plain Text |
| `{AltCSOName}` | AltCSOName | Plain Text |
| `{ContractNumber}` | ContractNumber | Plain Text |
| `{ActivityNumber}` | ActivityNumber | Plain Text |
| `{ClientDepartment}` | ClientDepartment | Plain Text |
| `{InspectionType}` | InspectionType | Plain Text |
| `{InspectionDate}` | InspectionDate | Date Picker |
| `{InspectorName}` | InspectorName | Plain Text |
| `{InspectorRegion}` | InspectorRegion | Plain Text |
| `{InspectionStatus}` | InspectionStatus | Plain Text |
| `{ReportDate}` | ReportDate | Date Picker |
| `{FileReference}` | FileReference | Plain Text |
| `{PurposeStatement}` | PurposeStatement | Rich Text |

### Section Observations (Pages 2-3)

Each section has 3 observation lines:

| Section | Line 1 Tag | Line 2 Tag | Line 3 Tag |
|---------|------------|------------|------------|
| Section 1 | Section1_Obs_Line1 | Section1_Obs_Line2 | Section1_Obs_Line3 |
| Section 2 | Section2_Obs_Line1 | Section2_Obs_Line2 | Section2_Obs_Line3 |
| Section 3 | Section3_Obs_Line1 | Section3_Obs_Line2 | Section3_Obs_Line3 |
| Section 4 | Section4_Obs_Line1 | Section4_Obs_Line2 | Section4_Obs_Line3 |
| Section 5 | Section5_Obs_Line1 | Section5_Obs_Line2 | Section5_Obs_Line3 |
| Section 6 | Section6_Obs_Line1 | Section6_Obs_Line2 | Section6_Obs_Line3 |
| Section 7 | Section7_Obs_Line1 | Section7_Obs_Line2 | Section7_Obs_Line3 |
| Section 8 | Section8_Obs_Line1 | Section8_Obs_Line2 | Section8_Obs_Line3 |
| Section 9 | Section9_Obs_Line1 | Section9_Obs_Line2 | Section9_Obs_Line3 |

### Corrective Measures Table (Page 3)

| Placeholder | Tag | Type |
|-------------|-----|------|
| `{Measure1_Text}` - `{Measure10_Text}` | Measure1_Text - Measure10_Text | Plain Text |
| `{Measure1_Section}` - `{Measure10_Section}` | Measure1_Section - Measure10_Section | Plain Text |
| `{TotalMeasures}` | TotalMeasures | Plain Text |

### Summary Fields (Page 4)

| Placeholder | Tag | Type |
|-------------|-----|------|
| `{AdditionalRemarks_Line1}` - `{AdditionalRemarks_Line4}` | AdditionalRemarks_Line1-4 | Plain Text |
| `{SupportingDocCount}` | SupportingDocCount | Plain Text |
| `{EmailCount}` | EmailCount | Plain Text |

---

## Section Mapping

| Section # | Checklist Area |
|-----------|----------------|
| 1 | Physical Location of Work |
| 2 | Threat & Risk Assessment |
| 3 | Transfer of Data |
| 4 | IT Media Storage |
| 5 | Personnel Security Screening |
| 6 | IT Personnel Security |
| 7 | IT Equipment & Configuration |
| 8 | Recovery & Backup |
| 9 | Disposal of IT Media |

---

## Visual Style

### Colors
- **Navy Header:** #003366
- **White Background:** #FFFFFF
- **Light Grey Alternating:** #f8f9fa
- **Border Grey:** #cccccc

### Typography
- **Font Family:** Calibri, Arial
- **Headers:** Bold, 10-11pt
- **Body:** Regular, 10pt
- **Fine Print:** 8-9pt

### Box Styling
- 1px solid borders (#ccc)
- Navy (#003366) header bars
- White section number badges
- Consistent 12px padding

---

## Integration with FinalReportTab.tsx

When populating from the INGOT app, map data as follows:

```typescript
const templateData = {
  // Header
  CompanyName: mainForm.organizationName,
  OrgSiteNumber: mainForm.siteNumber,
  Address: mainForm.address,
  CSOFullName: mainForm.csoName,
  AltCSOName: mainForm.altCsoName,
  ContractNumber: mainForm.contractNumber,
  ActivityNumber: mainForm.activityNumber,
  ClientDepartment: mainForm.clientDepartment,
  SecurityLevel: mainForm.securityLevel,
  InspectionType: mainForm.inspectionType,
  InspectionDate: mainForm.inspectionDate,
  InspectorName: mainForm.inspectorName,
  InspectorRegion: mainForm.inspectorRegion,
  
  // Section Observations (split into 3 lines each)
  Section1_Obs_Line1: reportData.section1Obs?.split('\n')[0] || '',
  Section1_Obs_Line2: reportData.section1Obs?.split('\n')[1] || '',
  Section1_Obs_Line3: reportData.section1Obs?.split('\n')[2] || '',
  // ... repeat for sections 2-9
  
  // Corrective Measures
  Measure1_Text: correctiveMeasures[0]?.text || '',
  Measure1_Section: correctiveMeasures[0]?.section || '',
  // ... repeat for measures 2-10
  TotalMeasures: correctiveMeasures.length.toString(),
  
  // Summary
  AdditionalRemarks_Line1: reportData.additionalRemarks?.split('\n')[0] || '',
  SupportingDocCount: reportData.documentCount?.toString() || '0',
  EmailCount: reportData.emailCount?.toString() || '0',
};
```

---

## Checkbox Controls

The template includes checkbox controls for:
- **Section Pass/Fail** (manual use)
- **Corrective Measure Done** (tracking completion)
- **Supporting Documents** (Checklist attached, Video recording)
- **Recommendation** (Approved, Conditional, Not Approved)
- **Assessment** (Good, Adequate, Insufficient)

These are primarily for manual form-filling. For app integration, handle checkbox states separately.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01 | Clean Edition - 2-column layout with boxed sections |
