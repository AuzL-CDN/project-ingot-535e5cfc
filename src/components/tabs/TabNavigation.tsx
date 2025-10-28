import { cn } from '@/lib/utils';
import { TabId } from '../InspectionApp';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '../auth/AuthProvider';
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
  BookOpen,
  Shield,
  ExternalLink
} from 'lucide-react';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  showDocMemo: boolean;
  showInspectionCorrective: boolean;
  isInspectorSetup: boolean;
  isActivityCompleted: boolean;
  uiLanguage: string;
}

interface TabItem {
  id: TabId;
  labelKey: keyof typeof import('@/translations/translations').translations;
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
  isActivityCompleted,
  uiLanguage
}: TabNavigationProps) => {
  const { t } = useTranslation(uiLanguage);
  const { isAdmin, isDev } = useAuth();
  
  const tabs: TabItem[] = [
    { id: 'inspector', labelKey: 'inspectorInfo', icon: User, isStatic: true },
    { id: 'main', labelKey: 'mainTab', icon: FileText, requiresInspector: true },
    { id: 'search', labelKey: 'searchTab', icon: Search, isStatic: true, requiresInspector: true },
    { id: 'emails', labelKey: 'emailsTab', icon: Mail, isStatic: true, requiresInspector: true },
    { id: 'doc', labelKey: 'docTab', icon: FileCheck, requiresInspector: true },
    { id: 'memorandum', labelKey: 'memorandumTab', icon: Mail, requiresInspector: true },
    { id: 'inspection', labelKey: 'inspectionTab', icon: ClipboardList, requiresInspector: true },
    { id: 'corrective', labelKey: 'correctiveMeasuresTab', icon: AlertTriangle, requiresInspector: true },
    { id: 'documents', labelKey: 'supportingDocsTab', icon: FolderOpen, isStatic: true, requiresInspector: true },
    { id: 'approval', labelKey: 'approvalLetterTab', icon: CheckCircle, isStatic: true, requiresInspector: true },
    { id: 'finalreport', labelKey: 'finalReportTab', icon: FileText, isStatic: true, requiresInspector: true },
    { id: 'disisnotes', labelKey: 'disisNotes', icon: BookOpen, isStatic: true, requiresInspector: true },
    { id: 'resources', labelKey: 'resourcesTab', icon: ExternalLink, isStatic: true, requiresInspector: true },
    { id: 'status', labelKey: 'statusTab', icon: Activity, isStatic: true, requiresInspector: true },
    { id: 'admin', labelKey: 'adminTab', icon: Shield, isStatic: true },
  ];

  const isTabVisible = (tab: TabItem) => {
    // Admin tab visible only to admins or in dev mode
    if (tab.id === 'admin') {
      return isAdmin || isDev;
    }

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
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};