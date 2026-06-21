import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Eye, FileText, Building, Hash } from 'lucide-react';
import type { MainFormData } from '@/hooks/useInspectionState';

interface MemorandumTabProps {
  mainForm: MainFormData;
}

export const MemorandumTab = ({ mainForm }: MemorandumTabProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [memoData, setMemoData] = useState({
    date: new Date().toISOString().split('T')[0],
    contractLevel: '',
    activityType: '',
    activityNumber: mainForm.activityNumber || '',
    contractNumber: mainForm.contractNumber || '',
    orgName: mainForm.companyName || '',
    disisNumber: '',
    orgAddress: '',
    csoName: '',
    emailAddress: ''
  });

  const contractLevels = [
    'Unclassified',
    'Protected A',
    'Protected B', 
    'Protected C',
    'Confidential',
    'Secret',
    'Top Secret'
  ];

  const activityTypes = [
    'Initial Security Assessment',
    'Renewal Security Assessment',
    'Follow-up Inspection',
    'Compliance Review',
    'Special Assessment',
    'Other'
  ];

  const generatePreview = () => {
    return `
MEMORANDUM

TO: ${memoData.csoName || '[CSO Name]'}
FROM: Industrial Security Inspector
DATE: ${memoData.date}
SUBJECT: Security Assessment - ${memoData.orgName}

ACTIVITY DETAILS:
Activity Number: ${memoData.activityNumber}
Activity Type: ${memoData.activityType}
Contract Level: ${memoData.contractLevel}
Contract Number: ${memoData.contractNumber}

ORGANIZATION INFORMATION:
Name: ${memoData.orgName}
Organization - Site Number: ${mainForm.orgSiteNumber || '[Not specified]'}
Address: ${memoData.orgAddress || '[Address to be looked up]'}

Chief Security Officer: ${memoData.csoName}
Email: ${memoData.emailAddress}

This memorandum provides notification and documentation for the above-referenced security assessment activity conducted in accordance with the Government Security Policy and related directives.

Security Level: ${mainForm.securityLevel || '[Not specified]'}
Inspection Class: ${mainForm.inspectionClass || '[Not specified]'}

Please retain this memorandum for your records and ensure appropriate follow-up actions are completed as required.

Inspector: [Inspector Name]
Contact: [Inspector Contact Information]
    `.trim();
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-primary" />
              <span>Memorandum</span>
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
            Generate memorandum documents for 19F and 19G inspection classes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="memo-date">Date</Label>
                <Input
                  id="memo-date"
                  type="date"
                  value={memoData.date}
                  onChange={(e) => setMemoData({ ...memoData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo-contract-level">Contract Level</Label>
                <Select 
                  value={memoData.contractLevel}
                  onValueChange={(value) => setMemoData({ ...memoData, contractLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract level" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo-activity-type">Activity Type</Label>
                <Select 
                  value={memoData.activityType}
                  onValueChange={(value) => setMemoData({ ...memoData, activityType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo-activity-number" className="flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span>Activity Number</span>
                </Label>
                <Input
                  id="memo-activity-number"
                  value={memoData.activityNumber}
                  onChange={(e) => setMemoData({ ...memoData, activityNumber: e.target.value })}
                  placeholder="Auto-populated from Main"
                  className="bg-muted"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo-contract-number">Contract Number</Label>
                <Input
                  id="memo-contract-number"
                  value={memoData.contractNumber}
                  onChange={(e) => setMemoData({ ...memoData, contractNumber: e.target.value })}
                  placeholder="Auto-populated from Main"
                  className="bg-muted"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="memo-org-name" className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Organization Name</span>
                </Label>
                <Input
                  id="memo-org-name"
                  value={memoData.orgName}
                  onChange={(e) => setMemoData({ ...memoData, orgName: e.target.value })}
                  placeholder="Auto-populated from Main"
                  className="bg-muted"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo-org-site">Organization - Site Number</Label>
                <Input
                  id="memo-org-site"
                  value={mainForm.orgSiteNumber || ''}
                  placeholder="Auto-populated from Main"
                  className="bg-muted"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo-org-address">Organization Address</Label>
                <Textarea
                  id="memo-org-address"
                  value={memoData.orgAddress}
                  onChange={(e) => setMemoData({ ...memoData, orgAddress: e.target.value })}
                  placeholder="Auto-lookup from Org Directory or enter manually"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo-cso-name">CSO Name</Label>
                <Input
                  id="memo-cso-name"
                  value={memoData.csoName}
                  onChange={(e) => setMemoData({ ...memoData, csoName: e.target.value })}
                  placeholder="Enter CSO full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo-email">E-Mail Address</Label>
                <Input
                  id="memo-email"
                  type="email"
                  value={memoData.emailAddress}
                  onChange={(e) => setMemoData({ ...memoData, emailAddress: e.target.value })}
                  placeholder="cso@organization.com"
                />
              </div>
            </div>
          </div>

          {showPreview && (
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Live Memorandum Preview</h4>
              <div className="bg-muted/50 rounded-lg p-4 border">
                <pre className="text-sm whitespace-pre-wrap font-mono">{generatePreview()}</pre>
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Auto-populated from Main:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p>• Activity Number: {mainForm.activityNumber || 'Not set'}</p>
                <p>• Contract Number: {mainForm.contractNumber || 'Not set'}</p>
                <p>• Organization: {mainForm.companyName || 'Not set'}</p>
              </div>
              <div>
                <p>• Security Level: {mainForm.securityLevel || 'Not set'}</p>
                <p>• Inspection Class: {mainForm.inspectionClass || 'Not set'}</p>
                <p>• Inspection Type: {mainForm.inspectionType || 'Not set'}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Generate Memorandum (DOCX + PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};