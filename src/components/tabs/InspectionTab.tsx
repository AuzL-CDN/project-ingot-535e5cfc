import { useState } from 'react';
import { ChecklistManager } from '@/components/checklist/ChecklistManager';
import type { ChecklistAnalysis } from '@/types/checklist';
import type { MainFormData } from '@/hooks/useInspectionState';

interface InspectionTabProps {
  mainForm: MainFormData;
  onFinalReportUpdate?: (updates: Record<string, string>) => void;
  onChecklistFileUpload?: (file: File) => void;
}

export const InspectionTab = ({ mainForm, onFinalReportUpdate, onChecklistFileUpload }: InspectionTabProps) => {
  const [analysisResults, setAnalysisResults] = useState<ChecklistAnalysis[]>([]);

  const handleAnalysisComplete = (analysis: ChecklistAnalysis[]) => {
    setAnalysisResults(analysis);
  };

  const handleFinalReportUpdate = (updates: Record<string, string>) => {
    if (onFinalReportUpdate) {
      onFinalReportUpdate(updates);
    }
  };


  return (
    <div className="p-6">
      <ChecklistManager
        mainForm={mainForm}
        onAnalysisComplete={handleAnalysisComplete}
        onFinalReportUpdate={handleFinalReportUpdate}
        onChecklistFileUpload={onChecklistFileUpload}
      />
      
      {analysisResults.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Analysis Complete</h4>
          <p className="text-sm text-green-700">
            {analysisResults.length} checklist responses have been analyzed and integrated into the Final Report.
            Review the Final Report tab to see the auto-generated content.
          </p>
        </div>
      )}
    </div>
  );
};