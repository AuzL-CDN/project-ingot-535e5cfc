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
  static readonly FINAL_REPORT_MAPPING: TemplateMapping = {
    // GREEN - Dynamic Fields
    'OrganizationName': { id: 'org-name', type: 'dynamic', category: 'green' },
    'OrganizationNumber': { id: 'org-number', type: 'dynamic', category: 'green' },
    'ContractNumber': { id: 'contract-number', type: 'dynamic', category: 'green' },
    'AwardDate': { id: 'award-date', type: 'dynamic', category: 'green' },
    'ExpiryDate': { id: 'expiry-date', type: 'dynamic', category: 'green' },
    'ActivityNumber': { id: 'activity-number', type: 'dynamic', category: 'green' },
    'InspectorName': { id: 'inspector-name', type: 'dynamic', category: 'green' },
    'InspectionDate': { id: 'inspection-date', type: 'dynamic', category: 'green' },
    'CSOName': { id: 'cso-name', type: 'dynamic', category: 'green' },
    
    // BLUE - Conditional Sections
    'SecurityLevel': { id: 'security-level', type: 'conditional', category: 'blue' },
    'TRASection': { id: 'tra-section', type: 'conditional', category: 'blue', condition: 'securityLevel >= PROTECTED_B' },
    'ClassificationSpecific': { id: 'classification-specific', type: 'conditional', category: 'blue' },
    
    // ORANGE - Repeating Elements
    'CorrectiveMeasures': { id: 'corrective-measures', type: 'repeating', category: 'orange' },
    'ITEquipmentList': { id: 'it-equipment', type: 'repeating', category: 'orange' },
    'PersonnelList': { id: 'personnel-list', type: 'repeating', category: 'orange' },
    
    // RED - User Input Required
    'GeneralComments': { id: 'general-comments', type: 'user-input', category: 'red' },
    'InspectionFindings': { id: 'inspection-findings', type: 'user-input', category: 'red' },
    'Recommendations': { id: 'recommendations', type: 'user-input', category: 'red' },
    
    // PURPLE - Auto-calculated
    'InspectionDuration': { id: 'inspection-duration', type: 'auto-calculated', category: 'purple', calculation: 'endTime - startTime' },
    'CompliancePercentage': { id: 'compliance-percentage', type: 'auto-calculated', category: 'purple', calculation: 'compliantItems / totalItems * 100' },
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