# Hybrid Final Report Template

## Overview

The `FinalReport_Hybrid.html` template combines the best elements from three design concepts:
- **Clean Government Modern** - Minimalist header with navy/grey color scheme
- **Executive Dashboard Style** - Visual callout boxes and metrics cards
- **Structured Compliance Report** - Compliance badges and checkboxes for tracking

## Quick Start

### Creating the Word Template

1. **Open** `FinalReport_Hybrid.html` in Microsoft Word
2. **Save As** → `FinalReport_Hybrid.docx`
3. **Replace placeholders** with Content Controls (see mapping below)
4. **Save** to `docs/word-templates/`

### Enabling Developer Tab (if not visible)
- File → Options → Customize Ribbon → Check "Developer"

---

## Template Structure (6 Pages)

| Page | Section | Key Elements |
|------|---------|--------------|
| 1 | Cover & Executive Dashboard | Header banner, 4 callout boxes, quick reference |
| 2 | Inspection Details | Attendees table, purpose, TRA status card |
| 3-5 | Findings by Section | 9 sections with comments & corrective measures |
| 6 | Summary & Sign-off | Summary card, metrics, signature block |

---

## Content Controls Mapping

### 🟢 Dynamic Fields (Auto-populated)

| Tag | Type | Source | Description |
|-----|------|--------|-------------|
| `OrganizationName` | Plain Text | mainForm.companyName | Company name |
| `OrgNumber` | Plain Text | mainForm.orgSiteNumber | Site number |
| `ContractNumber` | Plain Text | mainForm.contractNumber | Contract reference |
| `AwardDate` | Date | mainForm.awardDate | Contract award date |
| `ExpiryDate` | Date | mainForm.expiryDate | Contract expiry date |
| `SecurityLevel` | Plain Text | mainForm.securityLevel | PROTECTED A/B/SECRET |
| `ContractType` | Plain Text | mainForm.contractType | CSC/Standard/etc. |
| `ActivityNumber` | Plain Text | mainForm.activityNumber | Activity reference |
| `ClientDepartment` | Plain Text | mainForm.clientDepartment | Government department |
| `InspectionDate` | Date | reportData.inspectionDate | Date of inspection |
| `ReportDate` | Date | reportData.reportDate | Report generation date |
| `InspectorName` | Plain Text | reportData.inspectorSignature | Inspector full name |
| `DISISNumber` | Plain Text | mainForm.disisNumber | DISIS reference |
| `Address` | Plain Text | mainForm.address | Site address |
| `CSOFullName` | Plain Text | mainForm.csoFullName | CSO name |
| `AltCSOName` | Plain Text | mainForm.altCsoName | Alternate CSO |

### 🔵 Conditional Fields (Logic-based)

| Tag | Type | Condition | Values |
|-----|------|-----------|--------|
| `InspectionStatus` | Plain Text | Based on findings | PASS / CONDITIONAL / FAIL |
| `TRASection` | Section | securityLevel >= PROTECTED B | Show/Hide |
| `QualityAssessment` | Plain Text | Based on compliance | adequate / inadequate |
| `ApprovalStatus` | Plain Text | Based on recommendation | APPROVED / CONDITIONALLY APPROVED / NOT APPROVED |

### 🟠 Repeating Sections

| Tag | Type | Content |
|-----|------|---------|
| `Attendees` | Repeating Section | Additional attendees rows |
| `Section1_Measures` | Repeating Section | Section 1 corrective measures |
| `Section2_Measures` | Repeating Section | Section 2 corrective measures |
| ... | ... | ... |
| `Section9_Measures` | Repeating Section | Section 9 corrective measures |

### 🔴 User Input Fields (Inspector Comments)

| Tag | Type | Description |
|-----|------|-------------|
| `SupplierPurpose` | Rich Text | Description of supplier's work |
| `TRAComments` | Rich Text | TRA status comments |
| `Section1_Comments` | Rich Text | Information System comments |
| `Section2_Comments` | Rich Text | TRA section comments |
| `Section3_Comments` | Rich Text | Data Transfer comments |
| `Section4_Comments` | Rich Text | IT Media comments |
| `Section5_Comments` | Rich Text | Personnel Security comments |
| `Section6_Comments` | Rich Text | IT Personnel Security comments |
| `Section7_Comments` | Rich Text | IT Equipment comments |
| `Section8_Comments` | Rich Text | Recovery comments |
| `Section9_Comments` | Rich Text | Disposal comments |

### 🟣 Auto-calculated Fields

| Tag | Type | Calculation |
|-----|------|-------------|
| `TotalMeasures` | Plain Text | Count of all corrective measures |
| `CompletedCount` | Plain Text | Count of completed measures |
| `PendingCount` | Plain Text | Count of pending measures |

---

## Visual Style Guide

### Colors
```
Primary Navy:    #003366 (headers, accents)
Secondary Grey:  #F5F5F5 (backgrounds)
Success Green:   #28A745 (PASS status)
Warning Yellow:  #FFC107 (PARTIAL status)
Danger Red:      #DC3545 (FAIL status)
Text Black:      #212529 (body text)
Border Grey:     #DEE2E6 (table borders)
```

### Typography
- **Headers:** Calibri Bold, 14pt
- **Subheaders:** Calibri Bold, 12pt
- **Body:** Calibri Regular, 11pt
- **Tables:** Calibri Regular, 10pt
- **Footer:** Calibri Regular, 9pt

### Spacing
- Section margins: 0.5" left/right
- Between sections: 0.3" vertical space
- Table cell padding: 0.1"

---

## Step-by-Step Content Control Setup

### 1. Plain Text Content Control
```
1. Place cursor where {FieldName} appears
2. Developer → Controls → Plain Text Content Control (Aa)
3. Click Properties
4. Set Title: [Field Name]
5. Set Tag: [FieldName] (exact match to mapping)
6. Check: "Content control cannot be deleted"
7. Click OK
```

### 2. Repeating Section Content Control
```
1. Select the entire table row(s) that should repeat
2. Developer → Controls → Repeating Section Content Control
3. Click Properties
4. Set Title: [Section Name] Measures
5. Set Tag: Section[X]_Measures
6. Check: "Allow users to add and remove sections"
7. Click OK
```

### 3. Date Content Control
```
1. Place cursor where date field appears
2. Developer → Controls → Date Picker Content Control
3. Click Properties
4. Set Title: [Date Field Name]
5. Set Tag: [DateFieldName]
6. Set Display format: MMMM dd, yyyy
7. Click OK
```

---

## Compliance Badge Configuration

The section headers include compliance badges that should be configured as:

| Status | Badge Text | Background Color |
|--------|------------|------------------|
| Pass | ✓ PASS | #28A745 (green) |
| Partial | ⚠ PARTIAL | #FFC107 (yellow) |
| Fail | ✗ FAIL | #DC3545 (red) |

**In Word:** Use Shading (Design → Page Borders → Shading) to set background colors.

---

## Integration with Project INGOT

### FinalReportTab.tsx Data Flow
```
mainForm → Organization details, contract info, security level
reportData → Inspector info, dates, comments
correctiveMeasures[] → Grouped by section for repeating tables
```

### ContentAutomationService.ts
The service maps all template fields to their data sources:
- `generateDynamicContent()` - Populates GREEN fields
- `shouldShowConditionalContent()` - Controls BLUE sections
- `generateRepeatingContent()` - Builds ORANGE tables
- `calculateField()` - Computes PURPLE values

---

## Testing Checklist

- [ ] All 6 pages render correctly
- [ ] Header banner displays with security classification
- [ ] 4 dashboard callout boxes populate
- [ ] Attendees table expands for additional rows
- [ ] All 9 section headers display with compliance badges
- [ ] Comments boxes accept rich text input
- [ ] Corrective measures tables expand/collapse per section
- [ ] Summary card shows correct approval status
- [ ] Metrics calculate correctly
- [ ] Signature block renders properly
- [ ] Footer appears on all pages

---

## Troubleshooting

### Content Controls Not Populating
- Verify Tag names match exactly (case-sensitive)
- Check that Content Control type matches data type
- Ensure file saved as .docx (not .doc)

### Repeating Sections Empty
- Confirm data source provides arrays
- Check section boundaries in template
- Verify Repeating Section Control wraps correct elements

### Formatting Issues
- Apply Word Styles instead of direct formatting
- Check paragraph spacing settings
- Test with both short and long content

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-16 | Initial hybrid template combining 3 design concepts |
