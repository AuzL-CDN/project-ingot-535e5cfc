import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckSquare, FileText, AlertCircle } from 'lucide-react';
import { ChecklistSection } from './ChecklistSection';
import { ChecklistAnalyzer } from './ChecklistAnalyzer';
import { DocumentImporter } from './DocumentImporter';
import { HardwareManager } from '@/components/hardware/HardwareManager';
import type { ChecklistType, ChecklistData, ChecklistResponse, ChecklistAnalysis } from '@/types/checklist';
import type { HardwareData } from '@/types/hardware';
import { getChecklistSections } from '@/types/checklist';

interface ChecklistManagerProps {
  mainForm: any;
  onAnalysisComplete: (analysis: ChecklistAnalysis[]) => void;
  onFinalReportUpdate: (updates: any) => void;
}

export const ChecklistManager = ({ 
  mainForm, 
  onAnalysisComplete, 
  onFinalReportUpdate 
}: ChecklistManagerProps) => {
  const [activeChecklist, setActiveChecklist] = useState<ChecklistType>('1F');
  const [activeTab, setActiveTab] = useState<'1F' | '1G' | 'hardware'>('1F');
  const [checklistData, setChecklistData] = useState<Record<ChecklistType, ChecklistData>>({
    '1F': {
      type: '1F',
      responses: {},
      uploadedFiles: [],
      completionStatus: [],
      lastUpdated: new Date()
    },
    '1G': {
      type: '1G', 
      responses: {},
      uploadedFiles: [],
      completionStatus: [],
      lastUpdated: new Date()
    }
  });

  const [hardwareData, setHardwareData] = useState<HardwareData>({
    items: []
  });

  const [analysisResults, setAnalysisResults] = useState<Record<ChecklistType, ChecklistAnalysis[]>>({
    '1F': [],
    '1G': []
  });

  const currentSections = getChecklistSections(activeChecklist);
  const currentData = checklistData[activeChecklist];

  const updateResponse = useCallback((questionId: string, response: ChecklistResponse) => {
    setChecklistData(prev => ({
      ...prev,
      [activeChecklist]: {
        ...prev[activeChecklist],
        responses: {
          ...prev[activeChecklist].responses,
          [questionId]: response
        },
        lastUpdated: new Date()
      }
    }));
  }, [activeChecklist]);

  const handleDocumentImport = useCallback((responses: Record<string, ChecklistResponse>) => {
    setChecklistData(prev => ({
      ...prev,
      [activeChecklist]: {
        ...prev[activeChecklist],
        responses: {
          ...prev[activeChecklist].responses,
          ...responses
        },
        lastUpdated: new Date()
      }
    }));
  }, [activeChecklist]);

  const handleFileUpload = useCallback((questionId: string, files: File[]) => {
    // In a real implementation, files would be uploaded to Supabase Storage
    const fileRecords = files.map(file => ({
      id: `${questionId}_${Date.now()}_${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file), // Temporary URL for preview
      type: file.type,
      size: file.size,
      uploadedAt: new Date()
    }));

    setChecklistData(prev => ({
      ...prev,
      [activeChecklist]: {
        ...prev[activeChecklist],
        uploadedFiles: [
          ...prev[activeChecklist].uploadedFiles.filter(uf => uf.questionId !== questionId),
          {
            questionId,
            files: fileRecords
          }
        ],
        lastUpdated: new Date()
      }
    }));

    // Update the response to include file references
    updateResponse(questionId, {
      questionId,
      value: fileRecords.map(f => f.name).join(', '),
      files,
      timestamp: new Date()
    });
  }, [activeChecklist, updateResponse]);

  const calculateProgress = useCallback((sections: any[]) => {
    const totalQuestions = sections.reduce((acc, section) => acc + section.questions.length, 0);
    const answeredQuestions = Object.keys(currentData.responses).length;
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  }, [currentData.responses]);

  const analyzeChecklist = useCallback(async () => {
    const analyzer = new ChecklistAnalyzer();
    const analysis = await analyzer.analyzeResponses(
      activeChecklist,
      currentData.responses,
      mainForm
    );
    
    setAnalysisResults(prev => ({
      ...prev,
      [activeChecklist]: analysis
    }));
    
    onAnalysisComplete(analysis);
    
    // Generate Final Report updates based on analysis
    const finalReportUpdates = analyzer.generateFinalReportUpdates(analysis);
    onFinalReportUpdate(finalReportUpdates);
  }, [activeChecklist, currentData.responses, mainForm, onAnalysisComplete, onFinalReportUpdate]);

  const getChecklistBadgeColor = (type: ChecklistType) => {
    const progress = calculateProgress(getChecklistSections(type));
    if (progress === 100) return 'default';
    if (progress > 50) return 'secondary';
    return 'outline';
  };

  const progress1F = calculateProgress(getChecklistSections('1F'));
  const progress1G = calculateProgress(getChecklistSections('1G'));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span>Security Checklists</span>
            </div>
            <div className="flex space-x-2">
              <Badge variant={getChecklistBadgeColor('1F')}>1F: {progress1F}%</Badge>
              <Badge variant={getChecklistBadgeColor('1G')}>1G: {progress1G}%</Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Complete security checklists for automatic Final Report generation. 
            Images and documents will be embedded and linked in the final report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value: any) => {
            setActiveTab(value);
            if (value === '1F' || value === '1G') {
              setActiveChecklist(value);
            }
          }}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="1F" className="flex items-center space-x-2">
                <span>1F - Protected</span>
                <Badge variant="outline" className="ml-2">
                  {progress1F}%
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="1G" className="flex items-center space-x-2">
                <span>1G - Classified</span>
                <Badge variant="outline" className="ml-2">
                  {progress1G}%
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="hardware">
                Hardware
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 mb-4">
              {(activeTab === '1F' || activeTab === '1G') && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {Object.keys(checklistData[activeChecklist].responses).length} / {
                        currentSections.reduce((acc, section) => acc + section.questions.length, 0)
                      } completed
                    </span>
                  </div>
                  <Progress value={calculateProgress(currentSections)} className="h-2" />
                </>
              )}
            </div>

            <TabsContent value="1F" className="space-y-6">
              <DocumentImporter 
                checklistType="1F"
                onImport={handleDocumentImport}
              />
              
              <div className="grid gap-6">
                {getChecklistSections('1F').map(section => (
                  <ChecklistSection
                    key={section.id}
                    section={section}
                    responses={currentData.responses}
                    onResponseUpdate={updateResponse}
                    onFileUpload={handleFileUpload}
                    uploadedFiles={currentData.uploadedFiles}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="1G" className="space-y-6">
              <DocumentImporter 
                checklistType="1G"
                onImport={handleDocumentImport}
              />
              
              <div className="grid gap-6">
                {getChecklistSections('1G').map(section => (
                  <ChecklistSection
                    key={section.id}
                    section={section}
                    responses={currentData.responses}
                    onResponseUpdate={updateResponse}
                    onFileUpload={handleFileUpload}
                    uploadedFiles={currentData.uploadedFiles}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="hardware">
              <HardwareManager 
                data={hardwareData}
                onUpdate={setHardwareData}
              />
            </TabsContent>
          </Tabs>

          {Object.keys(currentData.responses).length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Analysis & Report Generation</span>
                </div>
                <button
                  onClick={analyzeChecklist}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Analyze & Generate Report Content
                </button>
              </div>
              
              {analysisResults[activeChecklist].length > 0 && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Analysis Complete - {analysisResults[activeChecklist].length} findings processed
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Final Report sections have been automatically updated based on your checklist responses.
                    Check the Final Report tab to review the generated content.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
