import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addBusinessDays } from '@/utils/businessDayCalculator';

export interface InspectorProfile {
  name: string;
  initials: string;
  email: string;
}

export interface DISISNote {
  id: string;
  date: string;
  content: string;
  timestamp: Date;
}

export interface GlobalState {
  globalUILanguage: 'en' | 'fr';
  documentLanguage: 'en' | 'fr';
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
  const [globalState, setGlobalState] = useState<GlobalState>({
    globalUILanguage: 'en',
    documentLanguage: 'en',
  });
  
  const [disisNotes, setDisisNotes] = useState<DISISNote[]>([]);
  
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

  const saveActivity = useCallback(async (): Promise<ActivityRecord> => {
    const activity: ActivityRecord = {
      id: currentActivity || `${mainForm.activityNumber}_${Date.now()}`,
      inspector,
      mainForm,
      approvalLetter,
      correctiveMeasures,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage for backward compatibility
    localStorage.setItem(`activity_${activity.id}`, JSON.stringify(activity));
    setCurrentActivity(activity.id);
    
    // Save to Supabase if user is authenticated and activity is new
    const { data: { user } } = await supabase.auth.getUser();
    if (user && !currentActivity && mainForm.activityNumber && mainForm.inspectionClass) {
      try {
        // Create activity record in database
        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .insert({
            user_id: user.id,
            activity_number: mainForm.activityNumber,
            org_site_number: mainForm.orgSiteNumber,
            company_name: mainForm.companyName,
            inspection_class: mainForm.inspectionClass,
          })
          .select()
          .single();

        if (activityError) throw activityError;

        // Determine which deadlines to create based on inspection class
        const deadlines: Array<{ deadline_type: string; business_days: number }> = [];
        
        if (mainForm.inspectionClass === '1F' || mainForm.inspectionClass === '1G') {
          deadlines.push({ deadline_type: 'checklist', business_days: 20 });
          deadlines.push({ deadline_type: 'corrective_measures', business_days: 30 });
        } else if (mainForm.inspectionClass === '19F' || mainForm.inspectionClass === '19G') {
          deadlines.push({ deadline_type: 'checklist', business_days: 20 });
          deadlines.push({ deadline_type: 'doc', business_days: 20 });
        }

        // Create deadline records
        const startDate = new Date();
        const deadlineRecords = deadlines.map(d => {
          const dueDate = addBusinessDays(startDate, d.business_days);
          return {
            activity_id: activityData.id,
            deadline_type: d.deadline_type,
            start_date: startDate.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            business_days_allocated: d.business_days,
          };
        });

        if (deadlineRecords.length > 0) {
          const { error: deadlineError } = await supabase
            .from('activity_deadlines')
            .insert(deadlineRecords);

          if (deadlineError) throw deadlineError;
        }

        console.log('Activity and deadlines created successfully');
      } catch (error) {
        console.error('Error creating activity in database:', error);
      }
    }
    
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

  const completeActivity = useCallback(async () => {
    setIsActivityCompleted(true);
    
    // Update activity in Supabase if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (user && mainForm.activityNumber) {
      try {
        // Find the activity by activity number and user_id
        const { data: activities, error: findError } = await supabase
          .from('activities')
          .select('id')
          .eq('user_id', user.id)
          .eq('activity_number', mainForm.activityNumber)
          .single();

        if (findError || !activities) {
          console.error('Error finding activity:', findError);
          return;
        }

        // Update activity as completed
        const { error: updateError } = await supabase
          .from('activities')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq('id', activities.id);

        if (updateError) throw updateError;

        console.log('Activity marked as completed');
      } catch (error) {
        console.error('Error completing activity in database:', error);
      }
    }
  }, [mainForm.activityNumber]);

  const updateGlobalUILanguage = (language: 'en' | 'fr') => {
    setGlobalState(prev => ({ ...prev, globalUILanguage: language }));
  };

  const updateDocumentLanguage = (language: 'en' | 'fr') => {
    setGlobalState(prev => ({ ...prev, documentLanguage: language }));
  };

  const addDISISNote = (content: string) => {
    const note: DISISNote = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      content,
      timestamp: new Date(),
    };
    setDisisNotes(prev => [...prev, note]);
    return note;
  };

  const deleteDISISNote = (id: string) => {
    setDisisNotes(prev => prev.filter(note => note.id !== id));
  };

  const getDISISNotesAsText = () => {
    return disisNotes.map(note => `${note.date}: ${note.content}`).join('\n\n');
  };

  return {
    inspector,
    mainForm,
    approvalLetter,
    correctiveMeasures,
    currentActivity,
    isActivityCompleted,
    globalState,
    disisNotes,
    updateInspector,
    updateMainForm,
    setApprovalLetter,
    setCorrectiveMeasures,
    loadActivity,
    saveActivity,
    searchActivities,
    completeActivity,
    updateGlobalUILanguage,
    updateDocumentLanguage,
    addDISISNote,
    deleteDISISNote,
    getDISISNotesAsText
  };
};