import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Upload, FileText, Image, ExternalLink } from 'lucide-react';
import { FileUploadZone } from './FileUploadZone';
import type { ChecklistSection as ChecklistSectionType, ChecklistResponse } from '@/types/checklist';

interface ChecklistSectionProps {
  section: ChecklistSectionType;
  responses: Record<string, ChecklistResponse>;
  onResponseUpdate: (questionId: string, response: ChecklistResponse) => void;
  onFileUpload: (questionId: string, files: File[]) => void;
  uploadedFiles: Array<{
    questionId: string;
    files: Array<{
      id: string;
      name: string;
      url: string;
      type: string;
      size: number;
      uploadedAt: Date;
    }>;
  }>;
}

export const ChecklistSection = ({
  section,
  responses,
  onResponseUpdate,
  onFileUpload,
  uploadedFiles
}: ChecklistSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const getCompletionStatus = () => {
    const totalQuestions = section.questions.length;
    const answeredQuestions = section.questions.filter(q => 
      responses[q.id] && responses[q.id].value !== undefined && responses[q.id].value !== ''
    ).length;
    return { completed: answeredQuestions, total: totalQuestions };
  };

  const { completed, total } = getCompletionStatus();
  const isComplete = completed === total;

  const handleResponse = (questionId: string, value: any, notes?: string) => {
    onResponseUpdate(questionId, {
      questionId,
      value,
      notes,
      timestamp: new Date()
    });
  };

  const renderQuestion = (question: any) => {
    const currentResponse = responses[question.id];
    const questionFiles = uploadedFiles.find(uf => uf.questionId === question.id);

    return (
      <Card key={question.id} className={`${currentResponse ? 'border-green-200 bg-green-50/50' : ''}`}>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label className="text-sm font-medium leading-relaxed">
                  {question.questionText}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {question.hasDocumentation && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Documentation Required
                  </Badge>
                )}
              </div>
              {currentResponse && (
                <Badge variant="secondary" className="ml-2">
                  Completed
                </Badge>
              )}
            </div>

            {question.type === 'yes-no' && (
              <RadioGroup
                value={currentResponse?.value || ''}
                onValueChange={(value) => handleResponse(question.id, value)}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                  <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id={`${question.id}-no`} />
                  <Label htmlFor={`${question.id}-no`}>No</Label>
                </div>
              </RadioGroup>
            )}

            {question.type === 'text' && (
              <Input
                value={currentResponse?.value || ''}
                onChange={(e) => handleResponse(question.id, e.target.value)}
                placeholder="Enter your response..."
                className="w-full"
              />
            )}

            {question.type === 'multitext' && (
              <Textarea
                value={currentResponse?.value || ''}
                onChange={(e) => handleResponse(question.id, e.target.value)}
                placeholder="Enter detailed response..."
                rows={4}
                className="w-full resize-none"
              />
            )}

            {question.type === 'date' && (
              <Input
                type="date"
                value={currentResponse?.value || ''}
                onChange={(e) => handleResponse(question.id, e.target.value)}
                className="w-full"
              />
            )}

            {question.type === 'file-upload' && (
              <div className="space-y-4">
                <FileUploadZone
                  onFileUpload={(files) => onFileUpload(question.id, files)}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  maxSize={25 * 1024 * 1024} // 25MB
                  multiple
                />
                
                {questionFiles && questionFiles.files.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {questionFiles.files.map(file => (
                      <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-background">
                        <div className="flex-shrink-0">
                          {file.type.startsWith('image/') ? (
                            <Image className="h-8 w-8 text-blue-500" />
                          ) : (
                            <FileText className="h-8 w-8 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes section for all question types */}
            <div className="pt-2 border-t border-gray-100">
              <Label className="text-xs text-muted-foreground">Additional Notes (Optional)</Label>
              <Textarea
                value={currentResponse?.notes || ''}
                onChange={(e) => handleResponse(question.id, currentResponse?.value || '', e.target.value)}
                placeholder="Add any additional notes or context..."
                rows={2}
                className="mt-1 text-sm resize-none"
              />
            </div>

            {/* Final Report mapping indicator */}
            {question.finalReportMapping && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-600 font-medium">Auto-populates:</span>
                  <span className="text-blue-700">
                    Final Report → {question.finalReportMapping.section} → {question.finalReportMapping.field}
                  </span>
                </div>
              </div>
            )}

            {/* Conditional logic indicator */}
            {question.conditionalLogic && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                <span className="text-amber-600">
                  {question.conditionalLogic.skipToSection 
                    ? `If ${question.conditionalLogic.value}, skip to ${question.conditionalLogic.skipToSection}`
                    : `Conditional question - shows based on other responses`
                  }
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center space-x-3">
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
                <span>{section.title}</span>
                <Badge variant={isComplete ? 'default' : 'secondary'}>
                  {completed}/{total}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {isComplete && (
                  <Badge variant="default" className="bg-green-600">
                    Complete
                  </Badge>
                )}
              </div>
            </CardTitle>
            {section.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {section.description}
              </p>
            )}
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4 mt-4">
        {section.questions.map(renderQuestion)}
      </CollapsibleContent>
    </Collapsible>
  );
};