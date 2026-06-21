import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUploadZone } from './FileUploadZone';
import { ChecklistDocumentParser } from '@/services/DocumentParser';
import { Upload, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { ChecklistType, ChecklistResponse } from '@/types/checklist';
import type { ParsedChecklistData, ParsedResponse } from '@/types/documentParsing';

interface DocumentImporterProps {
  checklistType: ChecklistType;
  onImport: (responses: Record<string, ChecklistResponse>) => void;
  onFileUpload?: (file: File) => void;
}

export const DocumentImporter = ({ checklistType, onImport, onFileUpload }: DocumentImporterProps) => {
  const [parsedData, setParsedData] = useState<ParsedChecklistData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedResponses, setEditedResponses] = useState<Record<string, string>>({});

  const handleFileUpload = async (fileUrl: string, file: File) => {
    setIsProcessing(true);
    toast.info('Parsing document... This may take a moment.');

    try {
      const parser = new ChecklistDocumentParser();
      const result = await parser.parseDocument(file, checklistType);

      if (result.success && result.data) {
        setParsedData(result.data);
        
        // Initialize edited responses with parsed values
        const initial: Record<string, string> = {};
        result.data.responses.forEach(response => {
          initial[response.questionId] = response.value;
        });
        setEditedResponses(initial);
        
        // Save file to Main Files category in Supporting Documents
        if (onFileUpload) {
          onFileUpload(file);
        }
        
        toast.success(`Found ${result.data.responses.length} responses in document`);
      } else {
        toast.error(result.error || 'Failed to parse document');
      }
    } catch (error) {
      console.error('Document import error:', error);
      toast.error('An error occurred while processing the document');
    } finally {
      URL.revokeObjectURL(fileUrl);
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!parsedData) return;

    const responses: Record<string, ChecklistResponse> = {};
    
    parsedData.responses.forEach(response => {
      const editedValue = editedResponses[response.questionId] || response.value;
      responses[response.questionId] = {
        questionId: response.questionId,
        value: editedValue,
        timestamp: new Date()
      };
    });

    onImport(responses);
    toast.success('Responses applied to checklist');
    setParsedData(null);
    setEditedResponses({});
  };

  const handleCancel = () => {
    setParsedData(null);
    setEditedResponses({});
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'destructive';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (parsedData) {
    return (
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Review Parsed Responses
              </CardTitle>
              <CardDescription>
                Verify and edit the responses extracted from {parsedData.fileName}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {parsedData.responses.length} responses found
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Review the confidence scores and adjust any values before applying to the checklist.
              Low confidence responses should be verified carefully.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {parsedData.responses.map((response) => (
              <Card
                key={response.questionId}
                className={
                  response.confidence >= 0.8
                    ? 'border-green-200 bg-green-50/50'
                    : response.confidence >= 0.6
                    ? 'border-yellow-200 bg-yellow-50/50'
                    : 'border-red-200 bg-red-50/50'
                }
              >
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <Label className="text-sm font-medium leading-relaxed flex-1">
                      {response.questionText}
                    </Label>
                    <Badge variant={getConfidenceColor(response.confidence)}>
                      {getConfidenceLabel(response.confidence)} ({Math.round(response.confidence * 100)}%)
                    </Badge>
                  </div>
                  
                  <Input
                    value={editedResponses[response.questionId] || response.value}
                    onChange={(e) => 
                      setEditedResponses({
                        ...editedResponses,
                        [response.questionId]: e.target.value
                      })
                    }
                    placeholder="Response value"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Apply to Checklist
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Checklist from Document
        </CardTitle>
        <CardDescription>
          Upload a filled DOCX checklist to automatically populate responses.
          The system will attempt to match content to questions and show confidence scores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUploadZone
          onFileUpload={(files) => {
            if (files.length > 0) {
              // Create a temporary URL for the file
              const fileUrl = URL.createObjectURL(files[0]);
              handleFileUpload(fileUrl, files[0]);
            }
          }}
          accept=".docx"
          maxSize={10 * 1024 * 1024}
          multiple={false}
        />
        
        {isProcessing && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Processing document... This may take 10-30 seconds depending on file size.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
