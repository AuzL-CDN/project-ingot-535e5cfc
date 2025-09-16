import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileCheck, Eye, FileText, Building, MapPin } from 'lucide-react';

interface DocTabProps {
  mainForm: any;
}

export const DocTab = ({ mainForm }: DocTabProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [docData, setDocData] = useState({
    orgName: mainForm.companyName || '',
    orgNumber: mainForm.orgSiteNumber || '',
    orgAddress: '',
    csoName: '',
    currentContract: mainForm.contractNumber || '',
    previousContract: '',
    previousInspectionDate: ''
  });

  const generatePreview = () => {
    return `
DECLARATION OF COMPLIANCE (DoC)

Organization Information:
Name: ${docData.orgName}
Number: ${docData.orgNumber}
Address: ${mainForm.address || '[Address to be looked up from Main tab]'}

Chief Security Officer: ${docData.csoName}

Contract Information:
Current Contract: ${docData.currentContract}
Previous Contract: ${docData.previousContract || 'N/A'}
Previous Inspection Date: ${docData.previousInspectionDate || 'N/A'}

Security Level: ${mainForm.securityLevel || '[Not specified]'}
Inspection Class: ${mainForm.inspectionClass || '[Not specified]'}

This Declaration of Compliance is issued in accordance with the Industrial Security Program requirements.

Date: ${new Date().toLocaleDateString()}
Activity Number: ${mainForm.activityNumber || '[Not specified]'}
    `.trim();
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 justify-between">
            <div className="flex items-center space-x-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <span>Declaration of Compliance (DoC)</span>
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
            Generate DoC letters for 19F and 19G inspection classes with organization lookup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-org-name" className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Organization Name</span>
                </Label>
                <Input
                  id="doc-org-name"
                  value={docData.orgName}
                  onChange={(e) => setDocData({ ...docData, orgName: e.target.value })}
                  placeholder="Auto-populated from Main"
                  className="bg-muted"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-org-number">Organization Number</Label>
                <Input
                  id="doc-org-number"
                  value={docData.orgNumber}
                  onChange={(e) => setDocData({ ...docData, orgNumber: e.target.value })}
                  placeholder="Auto-populated from Main"
                  className="bg-muted"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-cso-name">Chief Security Officer Name</Label>
                <Input
                  id="doc-cso-name"
                  value={docData.csoName}
                  onChange={(e) => setDocData({ ...docData, csoName: e.target.value })}
                  placeholder="Enter CSO full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-company-address" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Company Address</span>
                </Label>
                <Textarea
                  id="doc-company-address"
                  value={mainForm.address || ''}
                  className="bg-muted"
                  rows={3}
                  readOnly
                  placeholder="Auto-populated from Main tab address lookup"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-current-contract">Current Contract</Label>
                <Input
                  id="doc-current-contract"
                  value={docData.currentContract}
                  onChange={(e) => setDocData({ ...docData, currentContract: e.target.value })}
                  placeholder="Auto-populated from Main"
                  className="bg-muted"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-previous-contract">Previous Contract</Label>
                <Input
                  id="doc-previous-contract"
                  value={docData.previousContract}
                  onChange={(e) => setDocData({ ...docData, previousContract: e.target.value })}
                  placeholder="Enter previous contract number (if any)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-previous-inspection">Previous Inspection Date</Label>
                <Input
                  id="doc-previous-inspection"
                  type="date"
                  value={docData.previousInspectionDate}
                  onChange={(e) => setDocData({ ...docData, previousInspectionDate: e.target.value })}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Auto-populated from Main:</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Security Level: {mainForm.securityLevel || 'Not set'}</p>
                  <p>• Inspection Class: {mainForm.inspectionClass || 'Not set'}</p>
                  <p>• Activity Number: {mainForm.activityNumber || 'Not set'}</p>
                  <p>• Address: {mainForm.address || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>

          {showPreview && (
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Live DoC Preview</h4>
              <div className="bg-muted/50 rounded-lg p-4 border">
                <pre className="text-sm whitespace-pre-wrap font-mono">{generatePreview()}</pre>
              </div>
            </div>
          )}

          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <h4 className="font-semibold text-foreground mb-2">Organization Directory Lookup</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Organization address and other details can be automatically looked up from:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• SharePoint List: OrgDirectory (recommended)</li>
              <li>• Excel Table: OneDrive hosted (limited scalability)</li>
            </ul>
            <Button variant="outline" size="sm" className="mt-3">
              <Building className="h-4 w-4 mr-2" />
              Lookup Organization Details
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Generate DoC (DOCX + PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};