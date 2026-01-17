import { format } from 'date-fns';

export interface AutomationField {
  id: string;
  type: 'static' | 'dynamic' | 'conditional' | 'repeating' | 'user-input' | 'auto-calculated';
  category: 'black' | 'green' | 'blue' | 'orange' | 'red' | 'purple';
  value?: any;
  condition?: string;
  calculation?: string;
}

export interface TemplateMapping {
  [key: string]: AutomationField;
}

export class ContentAutomationService {
  // Template mappings for each document type
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAN FINAL REPORT MAPPING (v4 - 2-Column Boxed Layout)
  // ═══════════════════════════════════════════════════════════════════════════
  static readonly FINAL_REPORT_CLEAN_MAPPING: TemplateMapping = {
    // ─────────────────────────────────────────────────────────────────────────
    // GREEN - Dynamic Fields (auto-populated from database/forms)
    // ─────────────────────────────────────────────────────────────────────────
    'CompanyName': { id: 'company-name', type: 'dynamic', category: 'green' },
    'OrgSiteNumber': { id: 'org-site-number', type: 'dynamic', category: 'green' },
    'Address': { id: 'address', type: 'dynamic', category: 'green' },
    'CSOFullName': { id: 'cso-full-name', type: 'dynamic', category: 'green' },
    'AltCSOName': { id: 'alt-cso-name', type: 'dynamic', category: 'green' },
    'ContractNumber': { id: 'contract-number', type: 'dynamic', category: 'green' },
    'ActivityNumber': { id: 'activity-number', type: 'dynamic', category: 'green' },
    'ClientDepartment': { id: 'client-department', type: 'dynamic', category: 'green' },
    'SecurityLevel': { id: 'security-level', type: 'dynamic', category: 'green' },
    'InspectionType': { id: 'inspection-type', type: 'dynamic', category: 'green' },
    'InspectionDate': { id: 'inspection-date', type: 'dynamic', category: 'green' },
    'InspectorName': { id: 'inspector-name', type: 'dynamic', category: 'green' },
    'InspectorRegion': { id: 'inspector-region', type: 'dynamic', category: 'green' },
    'InspectionStatus': { id: 'inspection-status', type: 'dynamic', category: 'green' },
    'ReportDate': { id: 'report-date', type: 'dynamic', category: 'green' },
    'FileReference': { id: 'file-reference', type: 'dynamic', category: 'green' },
    'SupportingDocCount': { id: 'supporting-doc-count', type: 'dynamic', category: 'green' },
    'EmailCount': { id: 'email-count', type: 'dynamic', category: 'green' },
    
    // ─────────────────────────────────────────────────────────────────────────
    // RED - User Input Required (purpose & section observations - 3 lines each)
    // ─────────────────────────────────────────────────────────────────────────
    'PurposeStatement': { id: 'purpose-statement', type: 'user-input', category: 'red' },
    'Section1_Obs_Line1': { id: 'section1-obs-line1', type: 'user-input', category: 'red' },
    'Section1_Obs_Line2': { id: 'section1-obs-line2', type: 'user-input', category: 'red' },
    'Section1_Obs_Line3': { id: 'section1-obs-line3', type: 'user-input', category: 'red' },
    'Section2_Obs_Line1': { id: 'section2-obs-line1', type: 'user-input', category: 'red' },
    'Section2_Obs_Line2': { id: 'section2-obs-line2', type: 'user-input', category: 'red' },
    'Section2_Obs_Line3': { id: 'section2-obs-line3', type: 'user-input', category: 'red' },
    'Section3_Obs_Line1': { id: 'section3-obs-line1', type: 'user-input', category: 'red' },
    'Section3_Obs_Line2': { id: 'section3-obs-line2', type: 'user-input', category: 'red' },
    'Section3_Obs_Line3': { id: 'section3-obs-line3', type: 'user-input', category: 'red' },
    'Section4_Obs_Line1': { id: 'section4-obs-line1', type: 'user-input', category: 'red' },
    'Section4_Obs_Line2': { id: 'section4-obs-line2', type: 'user-input', category: 'red' },
    'Section4_Obs_Line3': { id: 'section4-obs-line3', type: 'user-input', category: 'red' },
    'Section5_Obs_Line1': { id: 'section5-obs-line1', type: 'user-input', category: 'red' },
    'Section5_Obs_Line2': { id: 'section5-obs-line2', type: 'user-input', category: 'red' },
    'Section5_Obs_Line3': { id: 'section5-obs-line3', type: 'user-input', category: 'red' },
    'Section6_Obs_Line1': { id: 'section6-obs-line1', type: 'user-input', category: 'red' },
    'Section6_Obs_Line2': { id: 'section6-obs-line2', type: 'user-input', category: 'red' },
    'Section6_Obs_Line3': { id: 'section6-obs-line3', type: 'user-input', category: 'red' },
    'Section7_Obs_Line1': { id: 'section7-obs-line1', type: 'user-input', category: 'red' },
    'Section7_Obs_Line2': { id: 'section7-obs-line2', type: 'user-input', category: 'red' },
    'Section7_Obs_Line3': { id: 'section7-obs-line3', type: 'user-input', category: 'red' },
    'Section8_Obs_Line1': { id: 'section8-obs-line1', type: 'user-input', category: 'red' },
    'Section8_Obs_Line2': { id: 'section8-obs-line2', type: 'user-input', category: 'red' },
    'Section8_Obs_Line3': { id: 'section8-obs-line3', type: 'user-input', category: 'red' },
    'Section9_Obs_Line1': { id: 'section9-obs-line1', type: 'user-input', category: 'red' },
    'Section9_Obs_Line2': { id: 'section9-obs-line2', type: 'user-input', category: 'red' },
    'Section9_Obs_Line3': { id: 'section9-obs-line3', type: 'user-input', category: 'red' },
    'AdditionalRemarks_Line1': { id: 'additional-remarks-line1', type: 'user-input', category: 'red' },
    'AdditionalRemarks_Line2': { id: 'additional-remarks-line2', type: 'user-input', category: 'red' },
    'AdditionalRemarks_Line3': { id: 'additional-remarks-line3', type: 'user-input', category: 'red' },
    'AdditionalRemarks_Line4': { id: 'additional-remarks-line4', type: 'user-input', category: 'red' },
    
    // ─────────────────────────────────────────────────────────────────────────
    // ORANGE - Repeating Elements (consolidated corrective measures table)
    // ─────────────────────────────────────────────────────────────────────────
    'Measure1_Text': { id: 'measure-1-text', type: 'repeating', category: 'orange' },
    'Measure1_Section': { id: 'measure-1-section', type: 'repeating', category: 'orange' },
    'Measure2_Text': { id: 'measure-2-text', type: 'repeating', category: 'orange' },
    'Measure2_Section': { id: 'measure-2-section', type: 'repeating', category: 'orange' },
    'Measure3_Text': { id: 'measure-3-text', type: 'repeating', category: 'orange' },
    'Measure3_Section': { id: 'measure-3-section', type: 'repeating', category: 'orange' },
    'Measure4_Text': { id: 'measure-4-text', type: 'repeating', category: 'orange' },
    'Measure4_Section': { id: 'measure-4-section', type: 'repeating', category: 'orange' },
    'Measure5_Text': { id: 'measure-5-text', type: 'repeating', category: 'orange' },
    'Measure5_Section': { id: 'measure-5-section', type: 'repeating', category: 'orange' },
    'Measure6_Text': { id: 'measure-6-text', type: 'repeating', category: 'orange' },
    'Measure6_Section': { id: 'measure-6-section', type: 'repeating', category: 'orange' },
    'Measure7_Text': { id: 'measure-7-text', type: 'repeating', category: 'orange' },
    'Measure7_Section': { id: 'measure-7-section', type: 'repeating', category: 'orange' },
    'Measure8_Text': { id: 'measure-8-text', type: 'repeating', category: 'orange' },
    'Measure8_Section': { id: 'measure-8-section', type: 'repeating', category: 'orange' },
    'Measure9_Text': { id: 'measure-9-text', type: 'repeating', category: 'orange' },
    'Measure9_Section': { id: 'measure-9-section', type: 'repeating', category: 'orange' },
    'Measure10_Text': { id: 'measure-10-text', type: 'repeating', category: 'orange' },
    'Measure10_Section': { id: 'measure-10-section', type: 'repeating', category: 'orange' },
    
    // ─────────────────────────────────────────────────────────────────────────
    // PURPLE - Auto-calculated Fields
    // ─────────────────────────────────────────────────────────────────────────
    'TotalMeasures': { id: 'total-measures', type: 'auto-calculated', category: 'purple', calculation: 'countAllMeasures' },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DEFINITIVE FINAL REPORT MAPPING (v3 - Consolidated Corrective Measures)
  // ═══════════════════════════════════════════════════════════════════════════
  static readonly FINAL_REPORT_DEFINITIVE_MAPPING: TemplateMapping = {
    // ─────────────────────────────────────────────────────────────────────────
    // GREEN - Dynamic Fields (auto-populated from database/forms)
    // ─────────────────────────────────────────────────────────────────────────
    'CompanyName': { id: 'company-name', type: 'dynamic', category: 'green' },
    'OrgSiteNumber': { id: 'org-site-number', type: 'dynamic', category: 'green' },
    'ActivityNumber': { id: 'activity-number', type: 'dynamic', category: 'green' },
    'ContractNumber': { id: 'contract-number', type: 'dynamic', category: 'green' },
    'SecurityLevel': { id: 'security-level', type: 'dynamic', category: 'green' },
    'ClientDepartment': { id: 'client-department', type: 'dynamic', category: 'green' },
    'InspectionDate': { id: 'inspection-date', type: 'dynamic', category: 'green' },
    'InspectorName': { id: 'inspector-name', type: 'dynamic', category: 'green' },
    'Address': { id: 'address', type: 'dynamic', category: 'green' },
    'CSOFullName': { id: 'cso-full-name', type: 'dynamic', category: 'green' },
    'AltCSOName': { id: 'alt-cso-name', type: 'dynamic', category: 'green' },
    'SupportingDocCount': { id: 'supporting-doc-count', type: 'dynamic', category: 'green' },
    'EmailCount': { id: 'email-count', type: 'dynamic', category: 'green' },
    'Attachment1': { id: 'attachment-1', type: 'dynamic', category: 'green' },
    'Attachment2': { id: 'attachment-2', type: 'dynamic', category: 'green' },
    'Attachment3': { id: 'attachment-3', type: 'dynamic', category: 'green' },
    'Attachment4': { id: 'attachment-4', type: 'dynamic', category: 'green' },
    'Attachment5': { id: 'attachment-5', type: 'dynamic', category: 'green' },
    
    // ─────────────────────────────────────────────────────────────────────────
    // RED - User Input Required (section observations)
    // ─────────────────────────────────────────────────────────────────────────
    'Section1_Observations': { id: 'section1-observations', type: 'user-input', category: 'red' },
    'Section2_Observations': { id: 'section2-observations', type: 'user-input', category: 'red' },
    'Section3_Observations': { id: 'section3-observations', type: 'user-input', category: 'red' },
    'Section4_Observations': { id: 'section4-observations', type: 'user-input', category: 'red' },
    'Section5_Observations': { id: 'section5-observations', type: 'user-input', category: 'red' },
    'Section6_Observations': { id: 'section6-observations', type: 'user-input', category: 'red' },
    'Section7_Observations': { id: 'section7-observations', type: 'user-input', category: 'red' },
    'Section8_Observations': { id: 'section8-observations', type: 'user-input', category: 'red' },
    'Section9_Observations': { id: 'section9-observations', type: 'user-input', category: 'red' },
    'AdditionalRemarks': { id: 'additional-remarks', type: 'user-input', category: 'red' },
    
    // ─────────────────────────────────────────────────────────────────────────
    // ORANGE - Repeating Elements (consolidated corrective measures)
    // ─────────────────────────────────────────────────────────────────────────
    'Measure1_Text': { id: 'measure-1-text', type: 'repeating', category: 'orange' },
    'Measure1_Section': { id: 'measure-1-section', type: 'repeating', category: 'orange' },
    'Measure2_Text': { id: 'measure-2-text', type: 'repeating', category: 'orange' },
    'Measure2_Section': { id: 'measure-2-section', type: 'repeating', category: 'orange' },
    'Measure3_Text': { id: 'measure-3-text', type: 'repeating', category: 'orange' },
    'Measure3_Section': { id: 'measure-3-section', type: 'repeating', category: 'orange' },
    'Measure4_Text': { id: 'measure-4-text', type: 'repeating', category: 'orange' },
    'Measure4_Section': { id: 'measure-4-section', type: 'repeating', category: 'orange' },
    'Measure5_Text': { id: 'measure-5-text', type: 'repeating', category: 'orange' },
    'Measure5_Section': { id: 'measure-5-section', type: 'repeating', category: 'orange' },
    'Measure6_Text': { id: 'measure-6-text', type: 'repeating', category: 'orange' },
    'Measure6_Section': { id: 'measure-6-section', type: 'repeating', category: 'orange' },
    'Measure7_Text': { id: 'measure-7-text', type: 'repeating', category: 'orange' },
    'Measure7_Section': { id: 'measure-7-section', type: 'repeating', category: 'orange' },
    'Measure8_Text': { id: 'measure-8-text', type: 'repeating', category: 'orange' },
    'Measure8_Section': { id: 'measure-8-section', type: 'repeating', category: 'orange' },
    'Measure9_Text': { id: 'measure-9-text', type: 'repeating', category: 'orange' },
    'Measure9_Section': { id: 'measure-9-section', type: 'repeating', category: 'orange' },
    'Measure10_Text': { id: 'measure-10-text', type: 'repeating', category: 'orange' },
    'Measure10_Section': { id: 'measure-10-section', type: 'repeating', category: 'orange' },
    
    // ─────────────────────────────────────────────────────────────────────────
    // PURPLE - Auto-calculated Fields
    // ─────────────────────────────────────────────────────────────────────────
    'TotalMeasures': { id: 'total-measures', type: 'auto-calculated', category: 'purple', calculation: 'countAllMeasures' },
  };

  // Legacy Hybrid Final Report Template Mapping (v2) - kept for backwards compatibility
  static readonly FINAL_REPORT_MAPPING: TemplateMapping = {
    // ═══════════════════════════════════════════════════════════════
    // GREEN - Dynamic Fields (auto-populated from database/forms)
    // ═══════════════════════════════════════════════════════════════
    'OrganizationName': { id: 'org-name', type: 'dynamic', category: 'green' },
    'OrgNumber': { id: 'org-number', type: 'dynamic', category: 'green' },
    'ContractNumber': { id: 'contract-number', type: 'dynamic', category: 'green' },
    'AwardDate': { id: 'award-date', type: 'dynamic', category: 'green' },
    'ExpiryDate': { id: 'expiry-date', type: 'dynamic', category: 'green' },
    'SecurityLevel': { id: 'security-level', type: 'dynamic', category: 'green' },
    'ContractType': { id: 'contract-type', type: 'dynamic', category: 'green' },
    'ActivityNumber': { id: 'activity-number', type: 'dynamic', category: 'green' },
    'ClientDepartment': { id: 'client-department', type: 'dynamic', category: 'green' },
    'InspectionDate': { id: 'inspection-date', type: 'dynamic', category: 'green' },
    'ReportDate': { id: 'report-date', type: 'dynamic', category: 'green' },
    'InspectorName': { id: 'inspector-name', type: 'dynamic', category: 'green' },
    'DISISNumber': { id: 'disis-number', type: 'dynamic', category: 'green' },
    'Address': { id: 'address', type: 'dynamic', category: 'green' },
    'CSOFullName': { id: 'cso-full-name', type: 'dynamic', category: 'green' },
    'AltCSOName': { id: 'alt-cso-name', type: 'dynamic', category: 'green' },
    
    // ═══════════════════════════════════════════════════════════════
    // BLUE - Conditional Sections (logic-based visibility)
    // ═══════════════════════════════════════════════════════════════
    'InspectionStatus': { id: 'inspection-status', type: 'conditional', category: 'blue' },
    'TRASection': { id: 'tra-section', type: 'conditional', category: 'blue', condition: 'securityLevel >= PROTECTED_B' },
    'QualityAssessment': { id: 'quality-assessment', type: 'conditional', category: 'blue' },
    'ApprovalStatus': { id: 'approval-status', type: 'conditional', category: 'blue' },
    
    // ═══════════════════════════════════════════════════════════════
    // ORANGE - Repeating Elements (lists/tables)
    // ═══════════════════════════════════════════════════════════════
    'Attendees': { id: 'attendees', type: 'repeating', category: 'orange' },
    'Section1_Measures': { id: 'section1-measures', type: 'repeating', category: 'orange' },
    'Section2_Measures': { id: 'section2-measures', type: 'repeating', category: 'orange' },
    'Section3_Measures': { id: 'section3-measures', type: 'repeating', category: 'orange' },
    'Section4_Measures': { id: 'section4-measures', type: 'repeating', category: 'orange' },
    'Section5_Measures': { id: 'section5-measures', type: 'repeating', category: 'orange' },
    'Section6_Measures': { id: 'section6-measures', type: 'repeating', category: 'orange' },
    'Section7_Measures': { id: 'section7-measures', type: 'repeating', category: 'orange' },
    'Section8_Measures': { id: 'section8-measures', type: 'repeating', category: 'orange' },
    'Section9_Measures': { id: 'section9-measures', type: 'repeating', category: 'orange' },
    
    // ═══════════════════════════════════════════════════════════════
    // RED - User Input Required (inspector comments)
    // ═══════════════════════════════════════════════════════════════
    'SupplierPurpose': { id: 'supplier-purpose', type: 'user-input', category: 'red' },
    'TRAComments': { id: 'tra-comments', type: 'user-input', category: 'red' },
    'Section1_Comments': { id: 'section1-comments', type: 'user-input', category: 'red' },
    'Section2_Comments': { id: 'section2-comments', type: 'user-input', category: 'red' },
    'Section3_Comments': { id: 'section3-comments', type: 'user-input', category: 'red' },
    'Section4_Comments': { id: 'section4-comments', type: 'user-input', category: 'red' },
    'Section5_Comments': { id: 'section5-comments', type: 'user-input', category: 'red' },
    'Section6_Comments': { id: 'section6-comments', type: 'user-input', category: 'red' },
    'Section7_Comments': { id: 'section7-comments', type: 'user-input', category: 'red' },
    'Section8_Comments': { id: 'section8-comments', type: 'user-input', category: 'red' },
    'Section9_Comments': { id: 'section9-comments', type: 'user-input', category: 'red' },
    
    // ═══════════════════════════════════════════════════════════════
    // PURPLE - Auto-calculated Fields
    // ═══════════════════════════════════════════════════════════════
    'TotalMeasures': { id: 'total-measures', type: 'auto-calculated', category: 'purple', calculation: 'countAllMeasures' },
    'CompletedCount': { id: 'completed-count', type: 'auto-calculated', category: 'purple', calculation: 'countCompletedMeasures' },
    'PendingCount': { id: 'pending-count', type: 'auto-calculated', category: 'purple', calculation: 'countPendingMeasures' },
  };

  static readonly APPROVAL_LETTER_MAPPING: TemplateMapping = {
    // GREEN - Dynamic Fields
    'InspectorInitials': { id: 'inspector-initials', type: 'dynamic', category: 'green' },
    'Date': { id: 'letter-date', type: 'dynamic', category: 'green' },
    'CSOFullName': { id: 'cso-full-name', type: 'dynamic', category: 'green' },
    'CompanyName': { id: 'company-name', type: 'dynamic', category: 'green' },
    'OrgNumber': { id: 'org-number', type: 'dynamic', category: 'green' },
    'Contracts': { id: 'contracts', type: 'dynamic', category: 'green' },
    'SecurityLevel': { id: 'security-level', type: 'dynamic', category: 'green' },
    
    // BLUE - Conditional Sections
    'CSCSection': { id: 'csc-section', type: 'conditional', category: 'blue', condition: 'isCSCContract' },
    'ApprovalType': { id: 'approval-type', type: 'conditional', category: 'blue' },
    
    // ORANGE - Repeating Elements
    'CCList': { id: 'cc-list', type: 'repeating', category: 'orange' },
    
    // GREEN - CSC-specific dynamic fields (conditional)
    'ComputerName': { id: 'computer-name', type: 'dynamic', category: 'green' },
    'AssetSerial': { id: 'asset-serial', type: 'dynamic', category: 'green' },
    'OperatingSystem': { id: 'operating-system', type: 'dynamic', category: 'green' },
    'EncryptionLevel': { id: 'encryption-level', type: 'dynamic', category: 'green' },
    'BIOSProtected': { id: 'bios-protected', type: 'dynamic', category: 'green' },
  };

  static readonly MEMORANDUM_MAPPING: TemplateMapping = {
    // GREEN - Dynamic Fields
    'Date': { id: 'memo-date', type: 'dynamic', category: 'green' },
    'ContractLevel': { id: 'contract-level', type: 'dynamic', category: 'green' },
    'ActivityType': { id: 'activity-type', type: 'dynamic', category: 'green' },
    'ActivityNumber': { id: 'activity-number', type: 'dynamic', category: 'green' },
    'ContractNumber': { id: 'contract-number', type: 'dynamic', category: 'green' },
    'OrgName': { id: 'org-name', type: 'dynamic', category: 'green' },
    'DISIS': { id: 'disis-number', type: 'dynamic', category: 'green' },
    'OrgAddress': { id: 'org-address', type: 'dynamic', category: 'green' },
    'CSOName': { id: 'cso-name', type: 'dynamic', category: 'green' },
    'EmailAddress': { id: 'email-address', type: 'dynamic', category: 'green' },
    
    // RED - User Input Required
    'RemarksRecommendation': { id: 'remarks-recommendation', type: 'user-input', category: 'red' },
    'ValidationDetails': { id: 'validation-details', type: 'user-input', category: 'red' },
    
    // BLUE - Conditional Sections
    'ValidationSection': { id: 'validation-section', type: 'conditional', category: 'blue', condition: 'isValidationInspection' },
  };

  // Helper methods for content generation
  static generateDynamicContent(field: AutomationField, data: any): string {
    switch (field.id) {
      case 'letter-date':
      case 'inspection-date':
      case 'memo-date':
        return format(new Date(), 'MMMM dd, yyyy');
      case 'inspector-initials':
        return data.inspector?.initials || '';
      case 'org-name':
      case 'company-name':
        return data.organization?.name || '';
      case 'org-number':
        return data.organization?.siteId || '';
      case 'cso-name':
      case 'cso-full-name':
        return data.organization?.csoName || '';
      default:
        return data[field.id] || '';
    }
  }

  static shouldShowConditionalContent(field: AutomationField, data: any): boolean {
    if (!field.condition) return true;
    
    switch (field.condition) {
      case 'isCSCContract':
        return data.contractType === 'CSC';
      case 'securityLevel >= PROTECTED_B':
        return ['PROTECTED B', 'SECRET', 'TOP SECRET'].includes(data.securityLevel);
      case 'isValidationInspection':
        return data.activityType === 'Validation Inspection';
      default:
        return true;
    }
  }

  static generateRepeatingContent(field: AutomationField, data: any[]): string[] {
    switch (field.id) {
      case 'cc-list':
        return data.map(cc => `${cc.name} - ${cc.position}`);
      case 'corrective-measures':
        return data.map((measure, index) => 
          `${index + 1}. [${measure.section}] ${measure.description}`
        );
      case 'personnel-list':
        return data.map(person => `${person.name} - ${person.clearanceLevel}`);
      case 'attendees':
        return data.map(attendee => `${attendee.name} - ${attendee.role}`);
      // Section-specific corrective measures (1-9)
      case 'section1-measures':
      case 'section2-measures':
      case 'section3-measures':
      case 'section4-measures':
      case 'section5-measures':
      case 'section6-measures':
      case 'section7-measures':
      case 'section8-measures':
      case 'section9-measures':
        return data.map((measure, index) => 
          `${index + 1}. ${measure.description} | Due: ${measure.dueDate || 'N/A'}`
        );
      default:
        return [];
    }
  }

  static calculateField(field: AutomationField, data: any): string | number {
    if (!field.calculation) return '';
    
    switch (field.calculation) {
      case 'endTime - startTime':
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return `${hours.toFixed(1)} hours`;
      case 'compliantItems / totalItems * 100':
        return Math.round((data.compliantItems / data.totalItems) * 100);
      case 'countAllMeasures':
        const allMeasures = data.correctiveMeasures || [];
        return allMeasures.length;
      case 'countCompletedMeasures':
        const completedMeasures = (data.correctiveMeasures || []).filter((m: any) => m.completed);
        return completedMeasures.length;
      case 'countPendingMeasures':
        const pendingMeasures = (data.correctiveMeasures || []).filter((m: any) => !m.completed);
        return pendingMeasures.length;
      default:
        return '';
    }
  }

  // Main content generation method
  static generateContent(templateType: string, fieldId: string, data: any): any {
    let mapping: TemplateMapping;
    
    switch (templateType) {
      case 'final-report':
        mapping = this.FINAL_REPORT_MAPPING;
        break;
      case 'approval-letter':
        mapping = this.APPROVAL_LETTER_MAPPING;
        break;
      case 'memorandum':
        mapping = this.MEMORANDUM_MAPPING;
        break;
      default:
        return '';
    }

    const field = mapping[fieldId];
    if (!field) return '';

    switch (field.type) {
      case 'dynamic':
        return this.generateDynamicContent(field, data);
      case 'conditional':
        return this.shouldShowConditionalContent(field, data);
      case 'repeating':
        return this.generateRepeatingContent(field, data[fieldId] || []);
      case 'auto-calculated':
        return this.calculateField(field, data);
      case 'user-input':
        return data[fieldId] || '';
      default:
        return '';
    }
  }
}