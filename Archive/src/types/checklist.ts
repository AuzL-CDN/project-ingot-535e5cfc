// Checklist data types and interfaces
export type ChecklistType = '1F' | '1G';

export interface ChecklistQuestion {
  id: string;
  section: string;
  questionText: string;
  type: 'yes-no' | 'text' | 'multitext' | 'file-upload' | 'date' | 'conditional';
  required: boolean;
  hasDocumentation?: boolean;
  conditionalLogic?: {
    showIf: string; // question id
    value: any; // expected value
    skipToSection?: string;
  };
  finalReportMapping?: {
    section: string;
    field: string;
    automationRule?: string;
  };
}

export interface ChecklistSection {
  id: string;
  title: string;
  description?: string;
  questions: ChecklistQuestion[];
  order: number;
}

export interface ChecklistResponse {
  questionId: string;
  value: any;
  files?: File[];
  notes?: string;
  timestamp: Date;
}

export interface ChecklistData {
  type: ChecklistType;
  responses: Record<string, ChecklistResponse>;
  uploadedFiles: {
    questionId: string;
    files: Array<{
      id: string;
      name: string;
      url: string;
      type: string;
      size: number;
      uploadedAt: Date;
    }>;
  }[];
  completionStatus: {
    sectionId: string;
    completed: boolean;
    progress: number;
  }[];
  lastUpdated: Date;
}

export interface ChecklistAnalysis {
  questionId: string;
  finding: string;
  recommendation?: string;
  finalReportContent: string;
  automationLevel: 'full' | 'partial' | 'manual';
  confidence: number;
}

// Protected (1F) Checklist Structure
export const PROTECTED_CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'preliminary',
    title: 'Preliminary Questions',
    order: 1,
    questions: [
      {
        id: 'client_equipment',
        section: 'preliminary',
        questionText: 'Will IT equipment be provided by the Client Department to the supplier?',
        type: 'yes-no',
        required: true,
        finalReportMapping: {
          section: 'IT_EQUIPMENT',
          field: 'client_provided_equipment',
          automationRule: 'client_equipment_provision'
        }
      },
      {
        id: 'cloud_computing',
        section: 'preliminary',
        questionText: 'Does your organization use Cloud Computing (e.g. Infrastructure as a Service including Storage, Platform as a Service, and/or Software as a Service) for the processing, producing and/or storing of the Protected information contract?',
        type: 'yes-no',
        required: true,
        finalReportMapping: {
          section: 'IT_INFRASTRUCTURE',
          field: 'cloud_usage',
          automationRule: 'cloud_computing_assessment'
        }
      },
      {
        id: 'additional_security',
        section: 'preliminary',
        questionText: 'Are there additional IT security measures included in the contract\'s Statement of Work (SOW)?',
        type: 'yes-no',
        required: true
      },
      {
        id: 'outside_operation',
        section: 'preliminary',
        questionText: 'Will you be operating outside of an operation zone? (i.e.; Work from home, etc.)',
        type: 'yes-no',
        required: true,
        conditionalLogic: {
          showIf: 'outside_operation',
          value: true
        }
      }
    ]
  },
  {
    id: 'it_infrastructure',
    title: 'IT Infrastructure Physical Location',
    order: 2,
    questions: [
      {
        id: 'alternate_site',
        section: 'it_infrastructure',
        questionText: 'Will the Protected information be electronically processed, produced and/or stored at an alternate company site and/or to a third-party supplier/subcontractor?',
        type: 'yes-no',
        required: true,
        conditionalLogic: {
          showIf: 'alternate_site',
          value: false,
          skipToSection: 'threat_assessment'
        },
        finalReportMapping: {
          section: 'INFORMATION_SYSTEM_LOCATION',
          field: 'alternate_locations',
          automationRule: 'location_assessment'
        }
      },
      {
        id: 'srcl_inclusion',
        section: 'it_infrastructure',
        questionText: 'Is the alternate company site and/or third-party supplier/subcontractor included in the SRCL/Contract?',
        type: 'yes-no',
        required: true
      },
      {
        id: 'site_details',
        section: 'it_infrastructure',
        questionText: 'Please provide information about an alternate company site - Site Number & Address:',
        type: 'multitext',
        required: false
      }
    ]
  },
  {
    id: 'threat_assessment',
    title: 'Threat Risk Assessment (TRA)',
    order: 3,
    questions: [
      {
        id: 'tra_exists',
        section: 'threat_assessment',
        questionText: 'Is there a TRA in place?',
        type: 'yes-no',
        required: true,
        hasDocumentation: true,
        finalReportMapping: {
          section: 'THREAT_RISK_ASSESSMENT',
          field: 'tra_status',
          automationRule: 'tra_analysis'
        }
      },
      {
        id: 'tra_recommendations',
        section: 'threat_assessment',
        questionText: 'Please identify what the TRA recommended to safeguard the Protected information:',
        type: 'multitext',
        required: false
      }
    ]
  },
  {
    id: 'personnel_security',
    title: 'Personnel Security',
    order: 4,
    questions: [
      {
        id: 'personnel_cleared',
        section: 'personnel_security',
        questionText: 'Are all personnel identified in the Personnel Security portion of the SRCL cleared to the required level?',
        type: 'yes-no',
        required: true,
        finalReportMapping: {
          section: 'PERSONNEL_SECURITY',
          field: 'clearance_status',
          automationRule: 'personnel_clearance_check'
        }
      },
      {
        id: 'security_awareness',
        section: 'personnel_security',
        questionText: 'Is there a documented Security Awareness program for all personnel involved with this contract?',
        type: 'yes-no',
        required: true,
        hasDocumentation: true
      },
      {
        id: 'need_to_know',
        section: 'personnel_security',
        questionText: 'Are personnel briefed on the "need-to-know" principle?',
        type: 'yes-no',
        required: true
      }
    ]
  },
  {
    id: 'it_equipment',
    title: 'IT Equipment / Information Technology Security',
    order: 5,
    questions: [
      {
        id: 'is_configured',
        section: 'it_equipment',
        questionText: 'Is the IS unit configured and ready for inspection?',
        type: 'yes-no',
        required: true,
        finalReportMapping: {
          section: 'IT_EQUIPMENT',
          field: 'system_readiness',
          automationRule: 'system_configuration_check'
        }
      },
      {
        id: 'os_version',
        section: 'it_equipment',
        questionText: 'What is the Operating System version?',
        type: 'text',
        required: true,
        finalReportMapping: {
          section: 'IT_EQUIPMENT',
          field: 'operating_system',
          automationRule: 'os_documentation'
        }
      },
      {
        id: 'antivirus_details',
        section: 'it_equipment',
        questionText: 'What is the antivirus solution, version, and update schedule?',
        type: 'multitext',
        required: true,
        finalReportMapping: {
          section: 'IT_EQUIPMENT',
          field: 'antivirus_info',
          automationRule: 'antivirus_documentation'
        }
      }
    ]
  }
];

// Classified (1G) Checklist Structure  
export const CLASSIFIED_CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'system_location',
    title: 'System Location',
    order: 1,
    questions: [
      {
        id: 'floor_plan',
        section: 'system_location',
        questionText: 'Provide a floor plan identifying where the IT equipment and IT media will be utilized for the processing, producing and storing of Classified information and/or data.',
        type: 'file-upload',
        required: true,
        hasDocumentation: true
      },
      {
        id: 'alternate_processing',
        section: 'system_location',
        questionText: 'Will the Classified information be electronically processed, produced and/or stored at an alternate company site and/or to a third-party supplier/subcontractor?',
        type: 'yes-no',
        required: true
      }
    ]
  },
  {
    id: 'personnel_security_classified',
    title: 'Personnel Security',
    order: 2,
    questions: [
      {
        id: 'security_clearances',
        section: 'personnel_security_classified',
        questionText: 'Are all personnel identified in the Personnel Security portion of the SRCL cleared to the required level?',
        type: 'yes-no',
        required: true,
        finalReportMapping: {
          section: 'PERSONNEL_SECURITY',
          field: 'clearance_verification',
          automationRule: 'classified_clearance_check'
        }
      }
    ]
  }
];

export const getChecklistSections = (type: ChecklistType): ChecklistSection[] => {
  return type === '1F' ? PROTECTED_CHECKLIST_SECTIONS : CLASSIFIED_CHECKLIST_SECTIONS;
};