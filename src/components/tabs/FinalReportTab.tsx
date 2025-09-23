import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    supplierPurpose: '',
    enableDigitalSignature: false,
    hasTRA: '',
    traComments: '',
    // Green text input fields
    itMediaInfo: '',
    osInfo: '',
    updateSchedule: '',
    antivirusDetails: '',
    itEquipmentList: '',
    encryptionDetails: '',
    backupPlan: ''
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
      text += `\n# ${section}\n\n# General Comments:\n\n`;
      
      // Add TRA-specific content
      if (section === 'THREAT RISK ASSESSMENT (TRA)') {
        if (reportData.hasTRA === 'yes') {
          text += `The supplier did provide a copy of the TRA, it had a section which covered emanations (emissions). ${reportData.traComments || ''}\n\n`;
        } else if (reportData.hasTRA === 'no') {
          text += `The supplier did not provide a copy of the TRA, it is not a requirement at the PROTECTED A or B levels.\n\n`;
        } else {
          text += `[To be filled by user]\n\n`;
        }
      } else {
        text += `[To be filled by user]\n\n`;
      }
      
      text += `# Corrective Measures:\n\n`;
      
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

Organization Name: ${mainForm.companyName || 'XXXXXXXXXXXXXX'}

Organization Number: ${mainForm.orgSiteNumber || 'XXXXXXXXXXXXXX'}

Gov. Department: ${mainForm.clientDepartment || 'XXXXXXXXXXXXXX'}

Contract Number: ${mainForm.contractNumber || 'XXXXXXXXXXXXXX'}

Award Date: XXXXXXXXXXXXXX

Expiry Date: XXXXXXXXXXXXXX

Activity Number: ${mainForm.activityNumber || 'XXXXXXXXXXXXXX'}

# Attendees:

| Name           | Position                                  |
| -------------- | ----------------------------------------- |
| ${mainForm.csoFullName || 'XXXXXXXXXXXXXX'} | Company Security Officer                  |
| XXXXXXXXXXXXXX | Alternate Company Security Officer        |
| ${reportData.inspectorSignature || 'XXXXXXXXXXXXXX'} | Information Technology Security Inspector |

Date and Time: ${reportData.inspectionDate || 'XXXXXXXXXXXXXX'}

Location: ${mainForm.address || '[Location]'}

# Purpose:

The purpose of the Information Technology Security (IT Sec) inspection was to determine if the company could process ${mainForm.securityLevel || 'XXXXXXXXXXXXXX'} information in accordance with the Contract Security Program (CSP) and the contract Security Requirement Check List (SRCL) paragraph 11e, and with the contractual documentation provided by PWGSC.

Supplier provides ${reportData.supplierPurpose || 'XXXXXXXXXXXXXX'}

# Contract Security Program

Industrial Security Sector 1/5

PROTECTED A

PROTECTED A
# Information Technology Security Inspection Report

${generateCorrectiveMeasuresText()}

# Contract Security Program

Industrial Security Sector

2/5

PROTECTED A

PROTECTED A
# Information Technology Security Inspection Report

# General Comments:

Client provides information on XXXXXXXXXXX and information will be returned on XXXXXXXXXXX, encrypted ( ). Encrypted IT media will be delivered to the client department, via courier or hand delivered, encryption at the AES 256 encryption standard and will be packaged in accordance with CSM article 506. (Packaging and transmittal of PROTECTED B information and assets). All USBs have been uniquely identified and labelled.

# Corrective Measures:

${groupCorrectiveMeasuresBySection()['IT MEDIA & MEDIA HANDLING']?.map((measure, index) => `${index + 1}. ${measure.text}`).join('\n') || 'None.'}

# PERSONNEL SECURITY

# General Comments:

The section of the Personnel Security was filled with all of the employee's name that will be working on this contract. All employees were cross checked in DISIS and all were found to be cleared at the ${mainForm.securityLevel || 'XXXXXXXXXXX'} level of clearance required to work on this contract. Additionally, the CSO also stated that there was a documented Security Awareness program for all personnel involved with this contract. All personnel were aware of the handling of information at the ${mainForm.securityLevel || 'XXXXXXXXXXX'} level as defined in the Contract Security Manual (CSM).

# Corrective Measures:

${groupCorrectiveMeasuresBySection()['PERSONNEL SECURITY']?.map((measure, index) => `${index + 1}. ${measure.text}`).join('\n') || 'None.'}

# IT PERSONNEL SECURITY

# General Comments:

The CSO indicated that XXXXXXXXXXX support and provide administrative support to for IT technical issues. All personnel will be briefed on the handling ${mainForm.securityLevel || 'XXXXXXXXXXX'} information as defined in the Contract Security Manual (CSM). IT XXXXXXXXXXX has administrative rights and has no involvement on contracts.

# Corrective Measures:

${groupCorrectiveMeasuresBySection()['IT PERSONNEL SECURITY']?.map((measure, index) => `${index + 1}. ${measure.text}`).join('\n') || 'None.'}

# IT EQUIPMENT / INFORMATION TECHNOLOGY SECURITY

# General Comments:

The OS for the laptop is XXXXXXXXXXX. Updates and patches will be applied XXXXXXXXXXX. At the time of the IT

# Contract Security Program

Industrial Security Sector

3/5

PROTECTED A

PROTECTED A
# Information Technology Security Inspection Report

# SECURITY INSPECTION

There were unique usernames and passwords (XX characters) for the identified personnel to access the IS. The IS have a screensaver set to lock the user account out after 10 minutes of inactivity. It was confirmed by the ACSO that administrative accounts are used for administrative purposes while user accounts are used to process, produce and store the sensitive information in support of this contract.

The antivirus solution for the COMPANY XXXXXXXXXXX, version XXXXXXXXXXX. Antivirus is updated prior to the start of the contract, updated monthly once work has started.

# List of IT equipment being used in support of this contract:

- Laptop / desktop / server – XXXXXXXXXXX
- Printer - XXXXXXXXXXX
- Firewall – XXXXXXXXXXX
- Router- XXXXXXXXXXX

Segregation is handled by XXXXXXXXXXX. AES encryption at the XXXXXXXXXXX level XXXXXXXXXXX are encrypted in transit, XXXXXXXXXXX encrypted at rest and locked in storage cabinet.

# Corrective Measures:

${groupCorrectiveMeasuresBySection()['IT EQUIPMENT / INFORMATION TECHNOLOGY SECURITY']?.map((measure, index) => `${index + 1}. ${measure.text}`).join('\n') || 'None.'}

# RECOVERY

# General Comments:

The Supplier did/did not have a backup plan in place at the time of inspection. The supplier backup is XXXXXXXXXXX

# Corrective Measures:

${groupCorrectiveMeasuresBySection()['RECOVERY']?.map((measure, index) => `${index + 1}. ${measure.text}`).join('\n') || 'None.'}

# DISPOSAL

# General Comments:

At the time of the IT Sec inspection, the company indicated that they will ensure that all ${mainForm.securityLevel || 'XXXXXXXXXXX'} information is completely removed from the information system once they have the go ahead from the client department and/or when this contract has been terminated. All information will be returned to the client department.

# Corrective Measures:

Contract Security Program
Industrial Security Sector
4/5
PROTECTED A

PROTECTED A
Information Technology Security Inspection Report

# SUMMARY

The IT Sec Inspection revealed that Company Name has good IT security measures to safeguard government information for this contract. The CSO / ACSO demonstrated that Company Name has a good overall understanding and control of the ${mainForm.securityLevel || 'XXXXXXXXXXX'} information for when the company will be required to process, produce and/or store ${mainForm.securityLevel || 'XXXXXXXXXXX'} information associated with this contract.

The 'corrective measures' as described ABOVE on various subjects, will, once implemented assist in maintaining the Confidentiality, Integrity, Availability and Accountability of the Government ${mainForm.securityLevel || 'XXXXXXXXXXX'} information related to this contract.

The IT Sec Inspector recommends that this site be approved for processing at the ${mainForm.securityLevel || 'XXXXXXXXXXX'} level for this contract.

Inspector Signature

IT Sec Inspector

Contract Security Program

Industrial Security Sector    5/5

PROTECTED A
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

                <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="supplier-purpose">Supplier Purpose</Label>
                  <Textarea
                    id="supplier-purpose"
                    value={reportData.supplierPurpose}
                    onChange={(e) => setReportData({ ...reportData, supplierPurpose: e.target.value })}
                    placeholder="Enter the supplier purpose details..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                {/* TRA Section */}
                <div className="space-y-4 border-2 border-primary/20 rounded-lg p-4">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Threat Risk Assessment (TRA)</Label>
                    <RadioGroup
                      value={reportData.hasTRA}
                      onValueChange={(value) => setReportData({ ...reportData, hasTRA: value })}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="tra-yes" />
                        <Label htmlFor="tra-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="tra-no" />
                        <Label htmlFor="tra-no">No</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-sm text-muted-foreground">Is there a TRA in place?</p>
                  </div>

                  {reportData.hasTRA === 'yes' && (
                    <div className="space-y-2">
                      <Label htmlFor="tra-comments">Additional TRA Comments</Label>
                      <Textarea
                        id="tra-comments"
                        value={reportData.traComments}
                        onChange={(e) => setReportData({ ...reportData, traComments: e.target.value })}
                        placeholder="Enter any additional comments about the TRA..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* User Input Fields for Green Text Sections */}
                <div className="space-y-4 border-2 border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-foreground flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Report Input Fields</span>
                  </h4>
                  <div className="text-sm text-muted-foreground mb-4">
                    Complete these fields to populate the green text sections in the Final Report.
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>IT Media Information</Label>
                      <Input
                        value={reportData.itMediaInfo}
                        onChange={(e) => setReportData({ ...reportData, itMediaInfo: e.target.value })}
                        placeholder="e.g., USB, DVD, Hard Drive"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Describe media types used for information delivery/return</p>
                    </div>
                    <div className="space-y-2">
                      <Label>OS Information</Label>
                      <Input
                        value={reportData.osInfo}
                        onChange={(e) => setReportData({ ...reportData, osInfo: e.target.value })}
                        placeholder="e.g., Windows 11, macOS Ventura"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Operating system details for laptops/desktops</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Update Schedule</Label>
                      <Input
                        value={reportData.updateSchedule}
                        onChange={(e) => setReportData({ ...reportData, updateSchedule: e.target.value })}
                        placeholder="e.g., weekly, monthly, as needed"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">How often updates and patches are applied</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Antivirus Details</Label>
                      <Input
                        value={reportData.antivirusDetails}
                        onChange={(e) => setReportData({ ...reportData, antivirusDetails: e.target.value })}
                        placeholder="e.g., Norton, McAfee, Windows Defender"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Antivirus solution name and version</p>
                    </div>
                    <div className="space-y-2">
                      <Label>IT Equipment List</Label>
                      <Textarea
                        value={reportData.itEquipmentList}
                        onChange={(e) => setReportData({ ...reportData, itEquipmentList: e.target.value })}
                        placeholder="List all IT equipment (laptops, printers, firewalls, routers, etc.)"
                        rows={3}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Complete list of IT equipment used for the contract</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Encryption Details</Label>
                      <Input
                        value={reportData.encryptionDetails}
                        onChange={(e) => setReportData({ ...reportData, encryptionDetails: e.target.value })}
                        placeholder="e.g., AES-256, network segregation method"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Encryption standards and segregation methods</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Backup Plan</Label>
                      <Input
                        value={reportData.backupPlan}
                        onChange={(e) => setReportData({ ...reportData, backupPlan: e.target.value })}
                        placeholder="e.g., daily cloud backup, weekly local backup"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Describe the backup and recovery plan</p>
                    </div>
                  </div>
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