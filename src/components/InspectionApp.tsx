import { useState } from 'react';
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

export type TabId = 
  | 'inspector' 
  | 'main' 
  | 'search' 
  | 'approval' 
  | 'emails'
  | 'status' 
  | 'doc' 
  | 'memorandum' 
  | 'inspection' 
  | 'corrective' 
  | 'documents'
  | 'finalreport';

export const InspectionApp = () => {
  const [activeTab, setActiveTab] = useState<TabId>('inspector');
  const inspectionState = useInspectionState();

  const { mainForm, inspector, isActivityCompleted } = inspectionState;

  // Check if inspector profile is set up
  const isInspectorSetup = !!(inspector.name && inspector.initials && inspector.email);

  // Determine tab visibility based on inspection class
  const showDocMemo = mainForm.inspectionClass === '19F' || mainForm.inspectionClass === '19G';
  const showInspectionCorrective = mainForm.inspectionClass === '1F' || mainForm.inspectionClass === '1G';

  // If inspector not set up, force to inspector tab
  const currentTab = !isInspectorSetup && activeTab !== 'inspector' ? 'inspector' : activeTab;

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
      case 'status':
        return <StatusTab currentActivity={inspectionState.currentActivity} />;
      case 'doc':
        return showDocMemo ? <DocTab {...inspectionState} /> : <MainForm {...inspectionState} />;
      case 'memorandum':
        return showDocMemo ? <MemorandumTab {...inspectionState} /> : <MainForm {...inspectionState} />;
      case 'inspection':
        return showInspectionCorrective ? <InspectionTab {...inspectionState} /> : <MainForm {...inspectionState} />;
      case 'corrective':
        return showInspectionCorrective ? <CorrectiveMeasuresTab {...inspectionState} /> : <MainForm {...inspectionState} />;
      case 'documents':
        return <SupportingDocuments {...inspectionState} />;
      case 'finalreport':
        return <FinalReportTab mainForm={mainForm} correctiveMeasures={inspectionState.correctiveMeasures} saveActivity={inspectionState.saveActivity} />;
      default:
        return <MainForm {...inspectionState} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Inspection Management System</h1>
              <p className="text-muted-foreground">Professional inspection workflow and documentation</p>
            </div>
            {isInspectorSetup && (
              <div className="text-right text-sm text-muted-foreground">
                <p className="font-medium">{inspector.name} ({inspector.initials})</p>
                <p>{inspector.email}</p>
              </div>
            )}
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
          uiLanguage={mainForm.uiLanguage}
        />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
};