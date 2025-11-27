import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TemplateField {
  id: string;
  name: string;
  type: 'static' | 'dynamic' | 'conditional' | 'repeating' | 'user-input' | 'auto-calculated';
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
};

const typeDescriptions = {
  static: 'Fixed content that never changes',
  dynamic: 'Auto-populated from database/forms', 
  conditional: 'Shown/hidden based on business rules',
  repeating: 'Lists that repeat based on data',
  'user-input': 'Requires manual inspector input',
  'auto-calculated': 'Computed/derived values',
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

// Predefined field mappings for each template
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

export const APPROVAL_LETTER_FIELDS: TemplateField[] = [
  // Dynamic Fields (Green)
  { id: 'InspectorInitials', name: 'Inspector Initials', type: 'dynamic', category: 'green', description: 'Inspector identification initials', example: 'JS', required: true },
  { id: 'Date', name: 'Letter Date', type: 'dynamic', category: 'green', description: 'Date of approval letter', example: 'March 15, 2024', required: true },
  { id: 'CSOFullName', name: 'CSO Full Name', type: 'dynamic', category: 'green', description: 'Chief Security Officer full name', example: 'Jane Doe', required: true },
  { id: 'CompanyName', name: 'Company Name', type: 'dynamic', category: 'green', description: 'Organization name', example: 'Acme Corp Ltd.', required: true },
  
  // Conditional Fields (Blue)
  { id: 'CSCSection', name: 'CSC Section', type: 'conditional', category: 'blue', description: 'Correctional Service Canada specific content', example: 'CSC computer details section' },
  { id: 'ApprovalType', name: 'Approval Type', type: 'conditional', category: 'blue', description: 'Type of approval granted/denied', example: 'GRANTS/DENIES' },
  
  // Repeating Fields (Orange)
  { id: 'CCList', name: 'CC Recipients', type: 'repeating', category: 'orange', description: 'Carbon copy recipient list', example: 'Multiple CC recipients' },
  
  // CSC-specific Dynamic Fields (Green but conditional)
  { id: 'ComputerName', name: 'Computer Name', type: 'dynamic', category: 'green', description: 'CSC computer identification', example: 'CSC-WS-001' },
  { id: 'AssetSerial', name: 'Asset Serial', type: 'dynamic', category: 'green', description: 'Computer serial number', example: 'SN123456789' },
];

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