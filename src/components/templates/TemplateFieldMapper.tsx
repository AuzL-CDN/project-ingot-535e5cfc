import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TemplateField {
  id: string;
  name: string;
  type: 'static' | 'dynamic' | 'conditional' | 'repeating' | 'user-input' | 'auto-calculated' | 'calculated';
  category: 'black' | 'green' | 'blue' | 'orange' | 'red' | 'purple';
  description: string;
  example?: string;
  required?: boolean;
}

interface TemplateFieldMapperProps {
  fields: TemplateField[];
  onFieldSelect?: (field: TemplateField) => void;
  selectedFields?: string[];
}

const categoryColors = {
  black: 'bg-gray-800 text-white border-gray-600',
  green: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400',
  blue: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400',
  orange: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400',
  red: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400',
  purple: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400',
};

const typeIcons = {
  static: '⚫',
  dynamic: '🟢',
  conditional: '🔵',
  repeating: '🟠',
  'user-input': '🔴',
  'auto-calculated': '🟣',
  'calculated': '🟣',
};

const typeDescriptions = {
  static: 'Fixed content that never changes',
  dynamic: 'Auto-populated from database/forms', 
  conditional: 'Shown/hidden based on business rules',
  repeating: 'Lists that repeat based on data',
  'user-input': 'Requires manual inspector input',
  'auto-calculated': 'Computed/derived values',
  'calculated': 'Computed date values (e.g., +5, +20, +30 days)',
};

export const TemplateFieldMapper: React.FC<TemplateFieldMapperProps> = ({
  fields,
  onFieldSelect,
  selectedFields = [],
}) => {
  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, TemplateField[]>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(typeDescriptions).map(([type, description]) => (
          <div key={type} className="flex items-center space-x-2 p-3 rounded-lg bg-card border">
            <span className="text-lg">{typeIcons[type as keyof typeof typeIcons]}</span>
            <div>
              <div className="font-medium capitalize">{type.replace('-', ' ')}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
          </div>
        ))}
      </div>

      {Object.entries(groupedFields).map(([category, categoryFields]) => (
        <div key={category} className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span className="text-xl">
              {typeIcons[categoryFields[0].type as keyof typeof typeIcons]}
            </span>
            {categoryFields[0].type.charAt(0).toUpperCase() + categoryFields[0].type.slice(1).replace('-', ' ')} Fields
            <Badge variant="outline" className={cn('ml-2', categoryColors[category as keyof typeof categoryColors])}>
              {categoryFields.length} fields
            </Badge>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryFields.map((field) => (
              <div
                key={field.id}
                className={cn(
                  'p-4 rounded-lg border-2 cursor-pointer transition-all',
                  categoryColors[field.category as keyof typeof categoryColors],
                  selectedFields.includes(field.id) && 'ring-2 ring-primary',
                  onFieldSelect && 'hover:shadow-md'
                )}
                onClick={() => onFieldSelect?.(field)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium">{field.name}</div>
                  {field.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </div>
                
                <div className="text-sm opacity-90 mb-2">{field.description}</div>
                
                {field.example && (
                  <div className="text-xs opacity-75 italic">
                    Example: {field.example}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="outline" className="text-xs">
                    {field.id}
                  </Badge>
                  <span className="text-lg">
                    {typeIcons[field.type as keyof typeof typeIcons]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// M365 Content Control Field Mappings
// Based on actual uploaded Word templates
// ==========================================

// Approval Letter / IT-Approval fields
export const APPROVAL_LETTER_FIELDS: TemplateField[] = [
  // Dynamic Fields (Green) - Auto-populated from database
  { id: 'TodayDate', name: 'Today Date', type: 'dynamic', category: 'green', description: 'Current date when document is generated', example: 'January 15, 2026', required: true },
  { id: 'OrgCSO', name: 'CSO Name', type: 'dynamic', category: 'green', description: 'Chief Security Officer full name from CSO database', example: 'John Smith', required: true },
  { id: 'OrgName', name: 'Organization Name', type: 'dynamic', category: 'green', description: 'Company/organization name from ORG database', example: 'Acme Corp Ltd.', required: true },
  { id: 'OrgSite', name: 'Org Site Number', type: 'dynamic', category: 'green', description: 'Organization site identifier', example: 'ORG-12345', required: true },
  { id: 'SiteAddress', name: 'Site Address', type: 'dynamic', category: 'green', description: 'Organization address from database', example: '123 Main Street, Ottawa, ON K1A 0B1' },
  { id: 'Contract', name: 'Contract Number', type: 'dynamic', category: 'green', description: 'Contract reference number', example: 'W8486-220001/001/CY', required: true },
  { id: 'ConType', name: 'Contract Type', type: 'dynamic', category: 'green', description: 'Type of contract', example: 'Supply Arrangement' },
  { id: 'SecLevel', name: 'Security Level', type: 'dynamic', category: 'green', description: 'Security classification level', example: 'PROTECTED A', required: true },
  
  // Conditional Fields (Blue) - Shown/hidden based on rules
  { id: 'ApprRen', name: 'Approval/Renewal', type: 'conditional', category: 'blue', description: 'Whether this is initial approval or renewal', example: 'GRANTS/RENEWS' },
  { id: 'CSCSection', name: 'CSC Section', type: 'conditional', category: 'blue', description: 'Correctional Service Canada specific content', example: 'CSC computer annex details' },
  
  // User Input Fields (Red) - Manual entry required
  { id: 'Initials', name: 'Inspector Initials', type: 'user-input', category: 'red', description: 'Inspector identification initials', example: 'JS', required: true },
  
  // Repeating Fields (Orange) - Multiple items
  { id: 'CCList', name: 'CC Recipients', type: 'repeating', category: 'orange', description: 'Carbon copy recipient list', example: 'Multiple CC recipients' },
  
  // CSC-specific fields
  { id: 'ComputerName', name: 'Computer Name', type: 'dynamic', category: 'green', description: 'CSC computer identification', example: 'CSC-WS-001' },
  { id: 'AssetSerial', name: 'Asset Serial', type: 'dynamic', category: 'green', description: 'Computer serial number', example: 'SN123456789' },
];

// Corrective Measures Letter fields
export const CORRECTIVE_MEASURES_FIELDS: TemplateField[] = [
  // Dynamic Fields (Green)
  { id: 'TodayDate', name: 'Today Date', type: 'dynamic', category: 'green', description: 'Current date', example: 'January 15, 2026', required: true },
  { id: 'OrgSite', name: 'Org Site Number', type: 'dynamic', category: 'green', description: 'Organization site identifier', example: 'ORG-12345', required: true },
  { id: 'OrgCSO', name: 'CSO Name', type: 'dynamic', category: 'green', description: 'CSO full name', example: 'John Smith', required: true },
  { id: 'RoleType', name: 'CSO Role Type', type: 'dynamic', category: 'green', description: 'CSO or ACSO designation', example: 'Chief Security Officer' },
  { id: 'CompanyName', name: 'Company Name', type: 'dynamic', category: 'green', description: 'Organization name', example: 'Acme Corp Ltd.', required: true },
  { id: 'SITEADDRESS', name: 'Site Address', type: 'dynamic', category: 'green', description: 'Full site address', example: '123 Main Street, Ottawa' },
  { id: 'InspDate', name: 'Inspection Date', type: 'dynamic', category: 'green', description: 'Date of inspection', example: 'January 10, 2026' },
  { id: 'Contype', name: 'Contract Type', type: 'dynamic', category: 'green', description: 'Type of contract', example: 'Supply Arrangement' },
  { id: 'SecLevel', name: 'Security Level', type: 'dynamic', category: 'green', description: 'Security classification', example: 'PROTECTED B' },
  
  // Calculated Fields (Purple)
  { id: 'Plus30', name: 'Due Date (+30 days)', type: 'calculated', category: 'purple', description: 'Corrective measures due date (30 business days from inspection)', example: 'February 24, 2026', required: true },
  
  // Repeating Fields (Orange)
  { id: 'CorrectiveMeasures', name: 'Corrective Measures List', type: 'repeating', category: 'orange', description: 'List of required corrective actions', example: 'Multiple measures' },
];

// Initial Email fields (Protected and Classified)
export const INITIAL_EMAIL_FIELDS: TemplateField[] = [
  // Dynamic Fields (Green)
  { id: 'OrgName', name: 'Organization Name', type: 'dynamic', category: 'green', description: 'Organization name', example: 'Acme Corp Ltd.', required: true },
  { id: 'OrgSite', name: 'Org Site Number', type: 'dynamic', category: 'green', description: 'Organization site ID', example: 'ORG-12345', required: true },
  { id: 'Contract', name: 'Contract Number', type: 'dynamic', category: 'green', description: 'Contract reference', example: 'W8486-220001', required: true },
  { id: 'CSOName', name: 'CSO Name', type: 'dynamic', category: 'green', description: 'CSO contact name', example: 'John Smith', required: true },
  { id: 'SecLevel', name: 'Security Level', type: 'dynamic', category: 'green', description: 'Classification level', example: 'PROTECTED A' },
  { id: 'ConType', name: 'Contract Type', type: 'dynamic', category: 'green', description: 'Contract type', example: 'Supply Arrangement' },
  
  // Calculated Fields (Purple) - Business day calculations
  { id: 'Plus5', name: 'Response Due (+5 days)', type: 'calculated', category: 'purple', description: 'Acknowledgement due date (5 business days)', example: 'January 22, 2026', required: true },
  { id: 'Plus20', name: 'Documents Due (+20 days)', type: 'calculated', category: 'purple', description: 'Documentation due date (20 business days)', example: 'February 12, 2026', required: true },
];

// Checklist fields (Protected and Classified)
export const CHECKLIST_FIELDS: TemplateField[] = [
  // Dynamic Fields (Green)
  { id: 'OrgName', name: 'Organization Name', type: 'dynamic', category: 'green', description: 'Organization name', example: 'Acme Corp Ltd.', required: true },
  { id: 'OrgSite', name: 'Org Site Number', type: 'dynamic', category: 'green', description: 'Site identifier', example: 'ORG-12345', required: true },
  { id: 'ContractNumber', name: 'Contract Number', type: 'dynamic', category: 'green', description: 'Contract reference', example: 'W8486-220001' },
  { id: 'StartDate', name: 'Award Date', type: 'dynamic', category: 'green', description: 'Contract award date', example: 'January 1, 2024' },
  { id: 'EndDate', name: 'Expiry Date', type: 'dynamic', category: 'green', description: 'Contract expiry date', example: 'December 31, 2026' },
  { id: 'ClientDept', name: 'Client Department', type: 'dynamic', category: 'green', description: 'Government client department', example: 'DND' },
  { id: 'SecLevel', name: 'Security Level', type: 'dynamic', category: 'green', description: 'Classification level', example: 'SECRET' },
  { id: 'ITLink', name: 'IT Link', type: 'dynamic', category: 'green', description: 'IT connectivity type', example: 'GC Network' },
  { id: 'ConType', name: 'Contract Type', type: 'dynamic', category: 'green', description: 'Contract type', example: 'Standing Offer' },
  
  // User Input Fields (Red)
  { id: 'InspectionFindings', name: 'Inspection Findings', type: 'user-input', category: 'red', description: 'Detailed inspection observations', example: 'Access control measures are adequate...' },
];

// Final Report fields
export const FINAL_REPORT_FIELDS: TemplateField[] = [
  // Dynamic Fields (Green)
  { id: 'OrganizationName', name: 'Organization Name', type: 'dynamic', category: 'green', description: 'Company name from organization database', example: 'Acme Corp Ltd.', required: true },
  { id: 'OrganizationNumber', name: 'Organization Number', type: 'dynamic', category: 'green', description: 'Unique organization site identifier', example: 'ORG-12345', required: true },
  { id: 'ContractNumber', name: 'Contract Number', type: 'dynamic', category: 'green', description: 'Government contract reference', example: 'W8486-220001/001/CY', required: true },
  { id: 'InspectorName', name: 'Inspector Name', type: 'dynamic', category: 'green', description: 'Name of conducting inspector', example: 'John Smith', required: true },
  { id: 'InspectionDate', name: 'Inspection Date', type: 'dynamic', category: 'green', description: 'Date of inspection', example: 'March 15, 2024', required: true },
  
  // Conditional Fields (Blue)
  { id: 'SecurityLevel', name: 'Security Level', type: 'conditional', category: 'blue', description: 'Security classification level', example: 'PROTECTED A/B, SECRET', required: true },
  { id: 'TRASection', name: 'TRA Section', type: 'conditional', category: 'blue', description: 'Threat Risk Assessment section (PROTECTED B+)', example: 'Shown for PROTECTED B and above' },
  
  // Repeating Fields (Orange)
  { id: 'CorrectiveMeasures', name: 'Corrective Measures', type: 'repeating', category: 'orange', description: 'List of required corrective actions', example: 'Multiple measures per section' },
  { id: 'ITEquipmentList', name: 'IT Equipment List', type: 'repeating', category: 'orange', description: 'List of inspected IT equipment', example: 'Server-01, Workstation-02' },
  
  // User Input Fields (Red)  
  { id: 'GeneralComments', name: 'General Comments', type: 'user-input', category: 'red', description: 'Inspector observations and notes', example: 'Overall security posture is satisfactory...' },
  { id: 'InspectionFindings', name: 'Inspection Findings', type: 'user-input', category: 'red', description: 'Specific findings from inspection', example: 'No significant security issues identified...' },
  
  // Auto-calculated Fields (Purple)
  { id: 'InspectionDuration', name: 'Inspection Duration', type: 'auto-calculated', category: 'purple', description: 'Calculated inspection time', example: '3.5 hours' },
  { id: 'CompliancePercentage', name: 'Compliance Percentage', type: 'auto-calculated', category: 'purple', description: 'Overall compliance score', example: '95%' },
];

// Memorandum fields
export const MEMORANDUM_FIELDS: TemplateField[] = [
  // Dynamic Fields (Green)
  { id: 'Date', name: 'Memorandum Date', type: 'dynamic', category: 'green', description: 'Date of memorandum', example: 'March 15, 2024', required: true },
  { id: 'ContractLevel', name: 'Contract Level', type: 'dynamic', category: 'green', description: 'Security level of contract', example: 'PROTECTED A', required: true },
  { id: 'ActivityType', name: 'Activity Type', type: 'dynamic', category: 'green', description: 'Type of inspection activity', example: 'Initial Assessment', required: true },
  { id: 'OrgName', name: 'Organization Name', type: 'dynamic', category: 'green', description: 'Organization name', example: 'Acme Corp Ltd.', required: true },
  
  // User Input Fields (Red)
  { id: 'RemarksRecommendation', name: 'Remarks & Recommendation', type: 'user-input', category: 'red', description: 'Inspector remarks and recommendations', example: 'Site is compliant and ready for approval...' },
  
  // Conditional Fields (Blue)
  { id: 'ValidationSection', name: 'Validation Section', type: 'conditional', category: 'blue', description: 'Validation inspection specific fields', example: 'Follow-up validation details' },
];
