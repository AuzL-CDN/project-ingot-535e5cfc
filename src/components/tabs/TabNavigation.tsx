import { cn } from '@/lib/utils';
import { TabId } from '../InspectionApp';
import { 
  User, 
  FileText, 
  Search, 
  CheckCircle, 
  Activity, 
  FileCheck, 
  Mail, 
  ClipboardList, 
  AlertTriangle, 
  FolderOpen,
  BookOpen 
} from 'lucide-react';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  showDocMemo: boolean;
  showInspectionCorrective: boolean;
  isInspectorSetup: boolean;
  isActivityCompleted: boolean;
}

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isStatic?: boolean;
  requiresInspector?: boolean;
}

export const TabNavigation = ({ 
  activeTab, 
  onTabChange, 
  showDocMemo, 
  showInspectionCorrective,
  isInspectorSetup,
  isActivityCompleted 
}: TabNavigationProps) => {
  
  const tabs: TabItem[] = [
    { id: 'inspector', label: 'Inspector Information', icon: User, isStatic: true },
    { id: 'main', label: 'Main', icon: FileText, requiresInspector: true },
    { id: 'search', label: 'Search', icon: Search, isStatic: true, requiresInspector: true },
    { id: 'emails', label: 'E-Mails', icon: Mail, isStatic: true, requiresInspector: true },
    { id: 'doc', label: 'DoC', icon: FileCheck, requiresInspector: true },
    { id: 'memorandum', label: 'Memorandum', icon: Mail, requiresInspector: true },
    { id: 'inspection', label: 'Inspection', icon: ClipboardList, requiresInspector: true },
    { id: 'corrective', label: 'Corrective Measures', icon: AlertTriangle, requiresInspector: true },
    { id: 'documents', label: 'Supporting Documents', icon: FolderOpen, isStatic: true, requiresInspector: true },
    { id: 'approval', label: 'Approval Letter', icon: CheckCircle, isStatic: true, requiresInspector: true },
    { id: 'finalreport', label: 'Final Report', icon: BookOpen, isStatic: true, requiresInspector: true },
    { id: 'status', label: 'Status', icon: Activity, isStatic: true, requiresInspector: true },
  ];

  const isTabVisible = (tab: TabItem) => {
    if (!isInspectorSetup && tab.requiresInspector) {
      return false;
    }

    if (tab.id === 'approval' && !isActivityCompleted) {
      return false;
    }

    if (tab.id === 'doc' || tab.id === 'memorandum') {
      return showDocMemo;
    }
    
    if (tab.id === 'inspection' || tab.id === 'corrective') {
      return showInspectionCorrective;
    }
    
    return true;
  };

  const visibleTabs = tabs.filter(isTabVisible);

  return (
    <div className="bg-card border-b shadow-sm overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex space-x-1 min-w-max" role="tablist">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = !isInspectorSetup && tab.requiresInspector;
            
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && onTabChange(tab.id)}
                disabled={isDisabled}
                className={cn(
                  "flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-smooth whitespace-nowrap",
                  isActive 
                    ? "border-accent text-nav-active bg-accent/5" 
                    : "border-transparent text-nav-inactive hover:text-foreground hover:bg-nav-hover",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                role="tab"
                aria-selected={isActive}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};