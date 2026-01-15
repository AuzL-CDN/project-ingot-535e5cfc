import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useInspectionState } from '@/hooks/useInspectionState';
import { TabNavigation } from './tabs/TabNavigation';
import { InspectorInfo } from './tabs/InspectorInfo';
import { MainForm } from './tabs/MainForm';
import { SearchTab } from './tabs/SearchTab';
import { ApprovalLetter } from './tabs/ApprovalLetter';
import { EmailsTab } from './tabs/EmailsTab';
import { StatusTab } from './tabs/StatusTab';
import { DocTab } from './tabs/DocTab';
import { MemorandumTab } from './tabs/MemorandumTab';
import { InspectionTab } from './tabs/InspectionTab';
import { CorrectiveMeasuresTab } from './tabs/CorrectiveMeasuresTab';
import { SupportingDocuments } from './tabs/SupportingDocuments';
import { FinalReportTab } from './tabs/FinalReportTab';
import { DISISNotesTab } from './tabs/DISISNotesTab';
import { ResourcesTab } from './tabs/ResourcesTab';
import { AdminTab } from './tabs/AdminTab';
import { UserMenuDropdown } from '@/components/UserMenuDropdown';
import { WelcomeTransition } from '@/components/WelcomeTransition';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from './auth/AuthProvider';

export type TabId = 
  | 'inspector' 
  | 'main' 
  | 'search' 
  | 'approval' 
  | 'emails'
  | 'disisnotes'
  | 'status' 
  | 'doc' 
  | 'memorandum' 
  | 'inspection' 
  | 'corrective' 
  | 'documents'
  | 'finalreport'
  | 'resources'
  | 'admin';

export const InspectionApp = () => {
  const [activeTab, setActiveTab] = useState<TabId>('inspector');
  const [checklistFiles, setChecklistFiles] = useState<File[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUserName, setWelcomeUserName] = useState('');
  const inspectionState = useInspectionState();
  const { user, loading } = useAuth();
  const location = useLocation();

  const { mainForm, inspector, isActivityCompleted, globalState } = inspectionState;
  const { t } = useTranslation(globalState.globalUILanguage === 'fr' ? 'french' : 'english');
  
  // Check for welcome transition trigger
  useEffect(() => {
    const state = location.state as { justLoggedIn?: boolean; userName?: string } | null;
    if (state?.justLoggedIn && state?.userName) {
      setWelcomeUserName(state.userName);
      setShowWelcome(true);
      // Clear the state so refresh doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }


  // Check if inspector profile is set up
  const isInspectorSetup = !!(inspector.name && inspector.initials && inspector.email);

  // Determine tab visibility based on inspection class
  const showDocMemo = mainForm.inspectionClass === '19F' || mainForm.inspectionClass === '19G';
  const showInspectionCorrective = mainForm.inspectionClass === '1F' || mainForm.inspectionClass === '1G';

  // If inspector not set up, force to inspector tab
  const currentTab = !isInspectorSetup && activeTab !== 'inspector' ? 'inspector' : activeTab;

  const handleChecklistFileUpload = (file: File) => {
    setChecklistFiles(prev => [...prev, file]);
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'inspector':
        return <InspectorInfo {...inspectionState} />;
      case 'main':
        return <MainForm {...inspectionState} />;
      case 'search':
        return <SearchTab {...inspectionState} />;
      case 'approval':
        return <ApprovalLetter {...inspectionState} />;
      case 'emails':
        return <EmailsTab {...inspectionState} />;
      case 'disisnotes':
        return <DISISNotesTab {...inspectionState} globalUILanguage={globalState.globalUILanguage} />;
      case 'status':
        return <StatusTab currentActivity={inspectionState.currentActivity} />;
      case 'doc':
        return showDocMemo ? <DocTab {...inspectionState} /> : <MainForm {...inspectionState} />;
      case 'memorandum':
        return showDocMemo ? <MemorandumTab {...inspectionState} /> : <MainForm {...inspectionState} />;
      case 'inspection':
        return showInspectionCorrective ? <InspectionTab mainForm={mainForm} onFinalReportUpdate={(updates) => console.log('Final report updates:', updates)} onChecklistFileUpload={handleChecklistFileUpload} /> : <MainForm {...inspectionState} />;
      case 'corrective':
        return showInspectionCorrective ? <CorrectiveMeasuresTab {...inspectionState} /> : <MainForm {...inspectionState} />;
      case 'documents':
        return <SupportingDocuments {...inspectionState} checklistFiles={checklistFiles} />;
      case 'finalreport':
        return <FinalReportTab mainForm={mainForm} correctiveMeasures={inspectionState.correctiveMeasures} saveActivity={inspectionState.saveActivity} />;
      case 'resources':
        return <ResourcesTab />;
      case 'admin':
        return <AdminTab />;
      default:
        return <MainForm {...inspectionState} />;
    }
  };

  return (
    <>
      {showWelcome && (
        <WelcomeTransition 
          userName={welcomeUserName} 
          onComplete={() => setShowWelcome(false)} 
        />
      )}
      <div className="min-h-screen bg-gradient-subtle">
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('inspectionManagementSystem')}</h1>
              <p className="text-muted-foreground">{t('professionalInspectionWorkflow')}</p>
            </div>
            <div className="flex items-center space-x-4">
              {isInspectorSetup && (
                <UserMenuDropdown
                  inspector={inspector}
                  globalUILanguage={globalState.globalUILanguage}
                  documentLanguage={globalState.documentLanguage}
                  onUILanguageChange={inspectionState.updateGlobalUILanguage}
                  onDocumentLanguageChange={inspectionState.updateDocumentLanguage}
                />
              )}
            </div>
          </div>
        </div>
      </div>

        <TabNavigation
          activeTab={currentTab}
          onTabChange={setActiveTab}
          showDocMemo={showDocMemo}
          showInspectionCorrective={showInspectionCorrective}
          isInspectorSetup={isInspectorSetup}
          isActivityCompleted={isActivityCompleted}
          uiLanguage={globalState.globalUILanguage === 'fr' ? 'french' : 'english'}
        />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          {renderActiveTab()}
        </div>
      </main>
      </div>
    </>
  );
};