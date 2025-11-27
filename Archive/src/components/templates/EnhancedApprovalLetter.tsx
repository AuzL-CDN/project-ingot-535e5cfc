import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { TemplateFieldMapper, APPROVAL_LETTER_FIELDS } from '@/components/templates/TemplateFieldMapper';
import { ContentAutomationService } from '@/components/templates/ContentAutomationService';

interface EnhancedApprovalLetterProps {
  approvalLetter: any;
  setApprovalLetter: (data: any) => void;
}

export const EnhancedApprovalLetter: React.FC<EnhancedApprovalLetterProps> = ({
  approvalLetter,
  setApprovalLetter,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleCCCountChange = (count: string) => {
    const ccCount = parseInt(count);
    const ccs = Array.from({ length: ccCount }, (_, i) => 
      approvalLetter.ccs?.[i] || { name: '', position: '' }
    );
    setApprovalLetter({ ...approvalLetter, ccCount, ccs });
  };

  const updateCC = (index: number, field: string, value: string) => {
    const updatedCcs = [...(approvalLetter.ccs || [])];
    updatedCcs[index] = { ...updatedCcs[index], [field]: value };
    setApprovalLetter({ ...approvalLetter, ccs: updatedCcs });
  };

  const generateEnhancedPreview = () => {
    const templateData = {
      inspector: { initials: approvalLetter.inspectorInitials },
      organization: { 
        name: approvalLetter.companyName,
        siteId: approvalLetter.orgNumber,
        csoName: approvalLetter.csoName 
      },
      contractType: approvalLetter.isCSC ? 'CSC' : 'Standard',
      securityLevel: approvalLetter.securityLevel,
    };

    const content = [];
    
    // Header with auto-populated dynamic fields
    content.push('PROTECTED A');
    content.push('Public Services and Procurement Canada');
    content.push('Information Technology Security');
    content.push('');
    content.push(`Date: ${ContentAutomationService.generateContent('approval-letter', 'Date', templateData)}`);
    content.push('');
    content.push(`${ContentAutomationService.generateContent('approval-letter', 'CSOFullName', templateData)}`);
    content.push('Company Security Officer');
    content.push(`${ContentAutomationService.generateContent('approval-letter', 'CompanyName', templateData)}, ${approvalLetter.orgNumber}`);
    content.push('');
    content.push(`Contract(s): ${approvalLetter.contracts}`);
    content.push('');

    // Conditional approval text
    const approvalAction = approvalLetter.approvalOption === 'grants' ? 'GRANTS' : 'DENIES';
    content.push(`The Contract Security Program (CSP) of Public Services and Procurement Canada (PSPC) hereby ${approvalAction} your organization's authority to produce, process, store, or transmit information electronically at the ${approvalLetter.securityLevel} security level.`);
    content.push('');

    // CSC Conditional Section
    if (approvalLetter.isCSC && ContentAutomationService.generateContent('approval-letter', 'CSCSection', { contractType: 'CSC' })) {
      content.push('CSC SPECIFIC INFORMATION:');
      content.push(`Computer Name: ${approvalLetter.computerName || '[AUTO-POPULATED]'}`);
      content.push(`Asset Serial: ${approvalLetter.assetSerial || '[AUTO-POPULATED]'}`);
      content.push(`Operating System: ${approvalLetter.operatingSystem || '[AUTO-POPULATED]'}`);
      content.push(`Encryption Level: ${approvalLetter.encryptionLevel || '[AUTO-POPULATED]'}`);
      content.push(`BIOS Protected: ${approvalLetter.biosProtected || '[AUTO-POPULATED]'}`);
      content.push('');
    }

    // Signature section
    content.push('Approval Authorized by:');
    content.push('');
    content.push('Michelle Laviolette');
    content.push('Manager, Inspections Division');
    content.push('Contract Security Program');
    content.push('');
    content.push(`Inspector's Initials: ${approvalLetter.inspectorInitials}`);
    content.push('');

    // Repeating CC Section
    if (approvalLetter.ccs?.length > 0) {
      content.push('CC:');
      approvalLetter.ccs.forEach((cc: any) => {
        if (cc.name && cc.position) {
          content.push(`${cc.name} - ${cc.position}`);
        }
      });
      if (approvalLetter.isCSC) {
        content.push('CSC Contract Security, ContractSecuritySRCL.GEN-NHQ@CSC-SCC.GC.CA');
      }
    }

    return content.join('\n');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          IT Written Approval Letter
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400">
            🔵 Smart Conditional Logic
          </Badge>
        </CardTitle>
        <CardDescription>
          Enhanced approval letter with automated content generation and conditional sections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="information" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="automation">Field Mapping</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="automation" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Approval Letter Content Automation</h3>
                <Badge variant="secondary">
                  {APPROVAL_LETTER_FIELDS.length} fields mapped
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                This template features conditional logic for CSC contracts and repeating sections for CC recipients.
              </p>
              <TemplateFieldMapper 
                fields={APPROVAL_LETTER_FIELDS}
                onFieldSelect={(field) => {
                  console.log('Selected field:', field);
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="information" className="space-y-6">
            {/* Auto-populated Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                🟢 Auto-populated Information
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400">
                  Dynamic Fields
                </Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <Label>Inspector Initials</Label>
                  <Input
                    value={approvalLetter.inspectorInitials || ''}
                    onChange={(e) => setApprovalLetter({...approvalLetter, inspectorInitials: e.target.value})}
                    placeholder="Auto-populated from profile"
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={approvalLetter.date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setApprovalLetter({...approvalLetter, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>CSO Full Name</Label>
                  <Input
                    value={approvalLetter.csoName || ''}
                    onChange={(e) => setApprovalLetter({...approvalLetter, csoName: e.target.value})}
                    placeholder="Auto-populated from organization"
                  />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={approvalLetter.companyName || ''}
                    onChange={(e) => setApprovalLetter({...approvalLetter, companyName: e.target.value})}
                    placeholder="Auto-populated from main form"
                  />
                </div>
              </div>
            </div>

            {/* Conditional Logic Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                🔵 Conditional Logic
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400">
                  Smart Sections
                </Badge>
              </h3>
              <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Approval Decision</Label>
                    <Select 
                      value={approvalLetter.approvalOption} 
                      onValueChange={(value) => setApprovalLetter({...approvalLetter, approvalOption: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select approval option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grants">GRANTS Authority</SelectItem>
                        <SelectItem value="denies">DENIES Authority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={approvalLetter.isCSC || false}
                      onCheckedChange={(checked) => setApprovalLetter({...approvalLetter, isCSC: checked})}
                    />
                    <Label>CSC Contract (shows additional fields)</Label>
                  </div>
                </div>

                {/* CSC Conditional Section */}
                {approvalLetter.isCSC && (
                  <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded border">
                    <h4 className="font-medium mb-3">🔵 CSC-Specific Information (Conditional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Computer Name</Label>
                        <Input
                          value={approvalLetter.computerName || ''}
                          onChange={(e) => setApprovalLetter({...approvalLetter, computerName: e.target.value})}
                          placeholder="CSC computer identifier"
                        />
                      </div>
                      <div>
                        <Label>Asset Serial Number</Label>
                        <Input
                          value={approvalLetter.assetSerial || ''}
                          onChange={(e) => setApprovalLetter({...approvalLetter, assetSerial: e.target.value})}
                          placeholder="Serial number"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Repeating CC Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                🟠 Repeating Elements
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400">
                  Dynamic Lists
                </Badge>
              </h3>
              <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                <div>
                  <Label>Number of CC Recipients</Label>
                  <Select 
                    value={approvalLetter.ccCount?.toString() || '0'} 
                    onValueChange={handleCCCountChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0,1,2,3,4,5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} recipients</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {approvalLetter.ccs?.map((cc: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-4 p-3 bg-white dark:bg-gray-800 rounded border">
                    <div>
                      <Label>CC Recipient {index + 1} Name</Label>
                      <Input
                        value={cc.name || ''}
                        onChange={(e) => updateCC(index, 'name', e.target.value)}
                        placeholder="Recipient name"
                      />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input
                        value={cc.position || ''}
                        onChange={(e) => updateCC(index, 'position', e.target.value)}
                        placeholder="Position/Title"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Enhanced Letter Preview</h3>
              <Badge variant="secondary">Auto-generated Content</Badge>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {generateEnhancedPreview()}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button>Generate DOCX</Button>
              <Button variant="outline">Generate PDF</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};