# Condensed Final Report Template

A practical, form-fillable IT Security Inspection Report template (~3-4 pages).

## Quick Start

1. Open `FinalReport_Condensed.html` in Microsoft Word
2. Save as `.docx`
3. Replace `{placeholders}` with Content Controls (see instructions below)

## Template Structure

| Page | Content |
|------|---------|
| 1-2 | Header box, Purpose, 9 Section observations |
| 3 | Corrective Measures table (consolidated) |
| 3-4 | Additional Remarks, Supporting Documents, Summary & Sign-off |

## Content Control Setup

### Enable Developer Tab
1. File → Options → Customize Ribbon
2. Check "Developer" → OK

### Adding Content Controls

For each `{placeholder}`:
1. Select the placeholder text
2. Developer tab → Plain Text Content Control
3. Click Properties → Set **Tag** to match the field name

### Field Reference

#### Header Section
| Placeholder | Tag | Type |
|------------|-----|------|
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

#### Section Observations
| Placeholder | Tag |
|------------|-----|
| `{Section1_Observations}` | Section1_Observations |
| `{Section2_Observations}` | Section2_Observations |
| ... | ... |
| `{Section9_Observations}` | Section9_Observations |

#### Corrective Measures Table
| Placeholder | Tag |
|------------|-----|
| `{Measure1_Text}` | Measure1_Text |
| `{Measure1_Section}` | Measure1_Section |
| ... | ... |
| `{Measure10_Text}` | Measure10_Text |
| `{Measure10_Section}` | Measure10_Section |
| `{TotalMeasures}` | TotalMeasures |

#### Supporting Documents
| Placeholder | Tag |
|------------|-----|
| `{SupportingDocCount}` | SupportingDocCount |
| `{EmailCount}` | EmailCount |
| `{Attachment1}` - `{Attachment5}` | Attachment1 - Attachment5 |

#### Summary
| Placeholder | Tag |
|------------|-----|
| `{AdditionalRemarks}` | AdditionalRemarks |

## Checkbox Controls

For Pass/Fail and Yes/No checkboxes:
1. Developer tab → Check Box Content Control
2. These are meant for manual form-filling

## Section Mapping

| Section # | Checklist Area |
|-----------|---------------|
| 1 | Information System / Physical Location |
| 2 | Threat Risk Assessment (TRA) |
| 3 | Data Transfer |
| 4 | IT Media & Media Handling |
| 5 | Personnel Security |
| 6 | IT Personnel Security |
| 7 | IT Equipment / IT Security |
| 8 | Recovery |
| 9 | Disposal |

## Usage Tips

### Manual Form-Filling
- Print the template and fill by hand, OR
- Open in Word and type directly into content controls

### Integration with Project INGOT
If using the app, the following data sources map to these fields:
- **mainForm** → Header fields (CompanyName, ContractNumber, etc.)
- **correctiveMeasures[]** → Measures table
- **reportData** → Section observations, Additional Remarks

## Visual Style

- **Header**: Navy (#003366) with white text
- **Section boxes**: Navy headers, light content areas
- **Tables**: Alternating grey/white rows
- **Security badge**: Red (#DC3545) for PROTECTED classification

## Printing

- Page size: Letter (8.5" x 11")
- Margins: 0.75" all sides
- Orientation: Portrait
- Recommended: Print to PDF for distribution
