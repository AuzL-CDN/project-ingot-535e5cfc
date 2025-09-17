import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Eye, Save, Calendar, Building, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CorrectiveMeasure } from '@/hooks/useInspectionState';

interface FinalReportTabProps {
  mainForm: any;
  correctiveMeasures: CorrectiveMeasure[];
  saveActivity: () => any;
}

export const FinalReportTab = ({ mainForm, correctiveMeasures, saveActivity }: FinalReportTabProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [reportData, setReportData] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorSignature: '',
    reportDate: new Date().toISOString().split('T')[0],
    customFindings: '',
    enableDigitalSignature: false
  });
  const { toast } = useToast();

  const handleSave = () => {
    saveActivity();
    toast({
      title: "Final Report Saved",
      description: "Your final report has been saved successfully.",
    });
  };

  const groupCorrectiveMeasuresBySection = () => {
    const grouped: { [key: string]: CorrectiveMeasure[] } = {};
    
    correctiveMeasures.forEach(measure => {
      const section = measure.section || 'GENERAL';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(measure);
    });
    
    return grouped;
  };

  const generateCorrectiveMeasuresText = () => {
    const grouped = groupCorrectiveMeasuresBySection();
    let text = '';
    
    const sections = [
      'INFORMATION SYSTEM / PHYSICAL LOCATION',
      'THREAT RISK ASSESSMENT (TRA)',
      'DATA TRANSFER',
      'IT MEDIA & MEDIA HANDLING',
      'PERSONNEL SECURITY',
      'IT PERSONNEL SECURITY',
      'IT EQUIPMENT / INFORMATION TECHNOLOGY SECURITY',
      'RECOVERY',
      'DISPOSAL'
    ];
    
    sections.forEach(section => {
      text += `\n# ${section}\n\n# General Comments:\n\n[To be filled by user]\n\n# Corrective Measures:\n\n`;
      
      if (grouped[section] && grouped[section].length > 0) {
        grouped[section].forEach((measure, index) => {
          text += `${index + 1}. ${measure.text}\n`;
        });
      } else {
        text += 'None.\n';
      }
      
      text += '\n';
    });
    
    return text;
  };

  const generatePreview = () => {
    return `PROTECTED A
Information Technology Security Inspection Report

Organization Name: ${mainForm.companyName || '[Company Name]'}

Organization Number: ${mainForm.orgSiteNumber || '[Org Number]'}

Gov. Department: ${mainForm.clientDepartment || '[Department]'}

Contract Number: ${mainForm.contractNumber || '[Contract Number]'}

Award Date: [Award Date]

Expiry Date: [Expiry Date]

Activity Number: ${mainForm.activityNumber || '[Activity Number]'}

# Attendees:

| Name           | Position                                  |
| -------------- | ----------------------------------------- |
| ${mainForm.csoFullName || '[CSO Name]'} | Company Security Officer                  |
| [ACSO Name]    | Alternate Company Security Officer        |
| ${reportData.inspectorSignature || '[Inspector Name]'} | Information Technology Security Inspector |

Date and Time: ${reportData.inspectionDate}

Location: ${mainForm.address || '[Address]'}

# Purpose:

The purpose of the Information Technology Security (IT Sec) inspection was to determine if the company could process ${mainForm.securityLevel || '[Security Level]'} information in accordance with the Contract Security Program (CSP) and the contract Security Requirement Check List (SRCL) paragraph 11e, and with the contractual documentation provided by PWGSC.

${reportData.customFindings || '[Custom findings section]'}

${generateCorrectiveMeasuresText()}

Contract Security Program

Industrial Security Sector 1/5

PROTECTED A

Inspector: ${reportData.inspectorSignature || '[Digital Signature Required]'}
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
                    <Label htmlFor="inspector-signature">Inspector Name</Label>
                    <Input
                      id="inspector-signature"
                      value={reportData.inspectorSignature}
                      onChange={(e) => setReportData({ ...reportData, inspectorSignature: e.target.value })}
                      placeholder="Enter inspector name"
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
                  <Label htmlFor="custom-findings">Custom Findings Section</Label>
                  <Textarea
                    id="custom-findings"
                    value={reportData.customFindings}
                    onChange={(e) => setReportData({ ...reportData, customFindings: e.target.value })}
                    placeholder="Enter any additional findings or custom content for the report..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-blue-900 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Corrective Measures Integration</span>
                  </h4>
                  <p className="text-sm text-blue-800">
                    Corrective measures from the Corrective Measures tab will be automatically organized by section in the final report.
                  </p>
                  <div className="text-xs text-blue-700">
                    <p>Current measures: {correctiveMeasures.length}</p>
                    <p>Completed: {correctiveMeasures.filter(m => m.completed).length}</p>
                  </div>
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

              <div className="pt-4 border-t space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Digital Signature Requirements</h4>
                  <p className="text-sm text-yellow-800 mb-3">
                    For digital signature integration with Entrust Certificate Agent, additional backend setup would be required. 
                    This would involve external application integration which isn't available in this web-based environment.
                  </p>
                  <p className="text-sm text-yellow-800">
                    Current workflow: Generate report → Convert to PDF → Manual signature → Upload/distribute
                  </p>
                </div>
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Final Report (Manual Signature Required)
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};