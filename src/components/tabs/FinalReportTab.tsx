import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, Save, Calendar, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FinalReportTabProps {
  mainForm: any;
  saveActivity: () => any;
}

export const FinalReportTab = ({ mainForm, saveActivity }: FinalReportTabProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [reportData, setReportData] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    findings: '',
    recommendations: '',
    conclusion: '',
    inspectorSignature: '',
    reportDate: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  const handleSave = () => {
    saveActivity();
    toast({
      title: "Final Report Saved",
      description: "Your final report has been saved successfully.",
    });
  };

  const generatePreview = () => {
    return `
FINAL INSPECTION REPORT

Activity Number: ${mainForm.activityNumber || '[Not specified]'}
Organization: ${mainForm.companyName || '[Not specified]'}
Organization Number: ${mainForm.orgSiteNumber || '[Not specified]'}
Address: ${mainForm.address || '[Not specified]'}

Inspection Details:
Date of Inspection: ${reportData.inspectionDate}
Security Level: ${mainForm.securityLevel || '[Not specified]'}
Inspection Class: ${mainForm.inspectionClass || '[Not specified]'}
Inspection Type: ${mainForm.inspectionType || '[Not specified]'}

FINDINGS:
${reportData.findings || '[No findings entered]'}

RECOMMENDATIONS:
${reportData.recommendations || '[No recommendations entered]'}

CONCLUSION:
${reportData.conclusion || '[No conclusion entered]'}

Inspector: ${reportData.inspectorSignature || '[Not signed]'}
Report Date: ${reportData.reportDate}

This report is prepared in accordance with the Government Security Policy and related security directives.
    `.trim();
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Final Report</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </CardTitle>
          <CardDescription>
            Generate comprehensive final inspection report with findings and recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="information" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="information">Information</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="information" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inspection-date" className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Inspection Date</span>
                    </Label>
                    <Input
                      id="inspection-date"
                      type="date"
                      value={reportData.inspectionDate}
                      onChange={(e) => setReportData({ ...reportData, inspectionDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-date">Report Date</Label>
                    <Input
                      id="report-date"
                      type="date"
                      value={reportData.reportDate}
                      onChange={(e) => setReportData({ ...reportData, reportDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inspector-signature">Inspector Signature</Label>
                    <Input
                      id="inspector-signature"
                      value={reportData.inspectorSignature}
                      onChange={(e) => setReportData({ ...reportData, inspectorSignature: e.target.value })}
                      placeholder="Enter inspector name for signature"
                    />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Auto-populated from Main:</span>
                  </h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Activity Number: {mainForm.activityNumber || 'Not set'}</p>
                    <p>• Organization: {mainForm.companyName || 'Not set'}</p>
                    <p>• Security Level: {mainForm.securityLevel || 'Not set'}</p>
                    <p>• Inspection Class: {mainForm.inspectionClass || 'Not set'}</p>
                    <p>• Inspection Type: {mainForm.inspectionType || 'Not set'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="findings">Findings</Label>
                  <Textarea
                    id="findings"
                    value={reportData.findings}
                    onChange={(e) => setReportData({ ...reportData, findings: e.target.value })}
                    placeholder="Document inspection findings, deficiencies, and observations..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <Textarea
                    id="recommendations"
                    value={reportData.recommendations}
                    onChange={(e) => setReportData({ ...reportData, recommendations: e.target.value })}
                    placeholder="Provide recommendations for improvement and compliance..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conclusion">Conclusion</Label>
                  <Textarea
                    id="conclusion"
                    value={reportData.conclusion}
                    onChange={(e) => setReportData({ ...reportData, conclusion: e.target.value })}
                    placeholder="Summarize overall inspection results and final assessment..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4 border-t">
                <Button onClick={handleSave} variant="outline" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save & Continue Later
                </Button>
                <Button onClick={() => setShowPreview(true)} className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Save & Preview
                </Button>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium mb-2">Report Guidelines:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Document all security deficiencies and compliance issues</li>
                  <li>• Provide specific recommendations with implementation timelines</li>
                  <li>• Reference applicable security policies and directives</li>
                  <li>• Use professional language suitable for official documentation</li>
                  <li>• Include both positive findings and areas for improvement</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Report Preview</h3>
                <Button onClick={() => setShowPreview(!showPreview)} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>

              {showPreview && (
                <Card>
                  <CardContent className="p-6">
                    <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono">{generatePreview()}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Final Report (DOCX + PDF)
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};