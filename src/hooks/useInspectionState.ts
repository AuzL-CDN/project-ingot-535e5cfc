import { useState, useCallback } from 'react';

export interface InspectorProfile {
  name: string;
  initials: string;
  email: string;
}

export interface MainFormData {
  activityNumber: string;
  orgSiteNumber: string;
  companyName: string;
  address: string;
  clientDepartment: string;
  contractType: string;
  contractNumber: string;
  securityLevel: string;
  inspectionType: string;
  inspectionClass: '1F' | '1G' | '19F' | '19G' | '';
  date: string;
  csoFullName: string;
  csoEmail: string;
  numberOfACSOs: number;
  acsos: Array<{
    fullName: string;
    email: string;
  }>;
  language?: string;
  uiLanguage?: string;
}

export interface ApprovalLetterData {
  inspectorInitials: string;
  isCSC: boolean;
  date: string;
  csoFullName: string;
  csoEmail: string;
  companyName: string;
  orgNumber: string;
  contracts: string;
  approve: boolean;
  approves: boolean;
  renewed: boolean;
  securityLevel: string;
  isBothSpecific: boolean;
  reaffirmsPrevious: boolean;
  ccCount: number;
  ccs: Array<{
    name: string;
    title: string;
    department: string;
    email: string;
  }>;
  computerName?: string;
  assetSerial?: string;
  operatingSystem?: string;
  encryptionLevel?: string;
  biosPasswordProtected?: boolean;
}

export interface CorrectiveMeasure {
  index: number;
  text: string;
  completed?: boolean;
  section?: string;
}

export interface ActivityRecord {
  id: string;
  inspector: InspectorProfile;
  mainForm: MainFormData;
  approvalLetter: ApprovalLetterData;
  correctiveMeasures: CorrectiveMeasure[];
  createdAt: string;
  updatedAt: string;
}

export const useInspectionState = () => {
  const [inspector, setInspector] = useState<InspectorProfile>({
    name: '',
    initials: '',
    email: ''
  });

  const [mainForm, setMainForm] = useState<MainFormData>({
    activityNumber: '',
    orgSiteNumber: '',
    companyName: '',
    address: '',
    clientDepartment: '',
    contractType: '',
    contractNumber: '',
    securityLevel: '',
    inspectionType: '',
    inspectionClass: '',
    date: new Date().toISOString().split('T')[0],
    csoFullName: '',
    csoEmail: '',
    numberOfACSOs: 0,
    acsos: []
  });

  const [approvalLetter, setApprovalLetter] = useState<ApprovalLetterData>({
    inspectorInitials: '',
    isCSC: false,
    date: new Date().toISOString().split('T')[0],
    csoFullName: '',
    csoEmail: '',
    companyName: '',
    orgNumber: '',
    contracts: '',
    approve: false,
    approves: false,
    renewed: false,
    securityLevel: '',
    isBothSpecific: false,
    reaffirmsPrevious: false,
    ccCount: 0,
    ccs: []
  });

  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  
  const [correctiveMeasures, setCorrectiveMeasures] = useState<CorrectiveMeasure[]>([]);

  const [currentActivity, setCurrentActivity] = useState<string>('');

  // Cross-tab data propagation
  const updateMainForm = useCallback((updates: Partial<MainFormData>) => {
    setMainForm(prev => {
      const newForm = { ...prev, ...updates };
      
      // Auto-propagate to approval letter
      setApprovalLetter(prevApproval => ({
        ...prevApproval,
        companyName: newForm.companyName,
        orgNumber: newForm.orgSiteNumber,
        securityLevel: newForm.securityLevel,
        contracts: `${newForm.contractType}: ${newForm.contractNumber}`.trim(),
        csoFullName: newForm.csoFullName,
        csoEmail: newForm.csoEmail
      }));

      return newForm;
    });
  }, []);

  const updateInspector = useCallback((updates: Partial<InspectorProfile>) => {
    setInspector(prev => {
      const newInspector = { ...prev, ...updates };
      
      // Auto-propagate initials to approval letter
      setApprovalLetter(prevApproval => ({
        ...prevApproval,
        inspectorInitials: newInspector.initials
      }));

      return newInspector;
    });
  }, []);

  const loadActivity = useCallback((activity: ActivityRecord) => {
    setInspector(activity.inspector);
    setMainForm(activity.mainForm);
    setApprovalLetter(activity.approvalLetter);
    setCorrectiveMeasures(activity.correctiveMeasures);
    setCurrentActivity(activity.id);
  }, []);

  const saveActivity = useCallback((): ActivityRecord => {
    const activity: ActivityRecord = {
      id: currentActivity || `${mainForm.activityNumber}_${Date.now()}`,
      inspector,
      mainForm,
      approvalLetter,
      correctiveMeasures,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real app, this would save to SharePoint/database
    localStorage.setItem(`activity_${activity.id}`, JSON.stringify(activity));
    setCurrentActivity(activity.id);
    
    return activity;
  }, [inspector, mainForm, approvalLetter, correctiveMeasures, currentActivity]);

  const searchActivities = useCallback((searchTerm: string): ActivityRecord[] => {
    const results: ActivityRecord[] = [];
    
    // Search in localStorage (in real app, would search SharePoint)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('activity_')) {
        try {
          const activity = JSON.parse(localStorage.getItem(key)!);
          if (
            activity.mainForm.activityNumber.includes(searchTerm) ||
            activity.mainForm.orgSiteNumber.includes(searchTerm) ||
            activity.mainForm.companyName.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            results.push(activity);
          }
        } catch (e) {
          // Skip invalid records
        }
      }
    }
    
    return results;
  }, []);

  const completeActivity = () => {
    setIsActivityCompleted(true);
  };

  return {
    inspector,
    mainForm,
    approvalLetter,
    correctiveMeasures,
    currentActivity,
    isActivityCompleted,
    updateInspector,
    updateMainForm,
    setApprovalLetter,
    setCorrectiveMeasures,
    loadActivity,
    saveActivity,
    searchActivities,
    completeActivity
  };
};