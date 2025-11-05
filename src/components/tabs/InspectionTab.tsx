import { useState } from 'react';
import { ChecklistManager } from '@/components/checklist/ChecklistManager';
import type { ChecklistAnalysis } from '@/types/checklist';

interface InspectionTabProps {
  mainForm: any;
  onFinalReportUpdate?: (updates: any) => void;
  onChecklistFileUpload?: (file: File) => void;
}

export const InspectionTab = ({ mainForm, onFinalReportUpdate, onChecklistFileUpload }: InspectionTabProps) => {
  const [analysisResults, setAnalysisResults] = useState<ChecklistAnalysis[]>([]);

  const handleAnalysisComplete = (analysis: ChecklistAnalysis[]) => {
    setAnalysisResults(analysis);
    console.log('Checklist analysis complete:', analysis);
  };

  const handleFinalReportUpdate = (updates: any) => {
    if (onFinalReportUpdate) {
      onFinalReportUpdate(updates);
    }
    console.log('Final report updates:', updates);
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