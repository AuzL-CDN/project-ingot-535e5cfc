import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, FileText, Users, Eye, Download } from 'lucide-react';
import { ApprovalLetterData } from '@/hooks/useInspectionState';
import { generateApprovalLetter } from '@/lib/documents';
import { useToast } from '@/hooks/use-toast';

interface ApprovalLetterProps {
  approvalLetter: ApprovalLetterData;
  setApprovalLetter: (data: ApprovalLetterData) => void;
}

export const ApprovalLetter = ({ approvalLetter, setApprovalLetter }: ApprovalLetterProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleCCCountChange = (count: string) => {
    const numCount = parseInt(count) || 0;
    const newCCs = Array.from({ length: numCount }, (_, i) => 
      approvalLetter.ccs[i] || { name: '', title: '', department: '', email: '' }
    );
    
    setApprovalLetter({
      ...approvalLetter,
      ccCount: numCount,
      ccs: newCCs
    });
  };

  const updateCC = (index: number, field: string, value: string) => {
    const newCCs = [...approvalLetter.ccs];
    newCCs[index] = { ...newCCs[index], [field]: value };
    setApprovalLetter({ ...approvalLetter, ccs: newCCs });
  };

  const generatePreview = () => {
    return `
APPROVAL LETTER

Date: ${approvalLetter.date}
Inspector: ${approvalLetter.inspectorInitials}

TO: ${approvalLetter.csoFullName}
Company: ${approvalLetter.companyName}
Organization Number: ${approvalLetter.orgNumber}

Re: IT Written Approval - ${approvalLetter.contracts}

Security Level: ${approvalLetter.securityLevel}

${approvalLetter.approve ? '☑' : '☐'} Approve
${approvalLetter.approves ? '☑' : '☐'} Approves  
${approvalLetter.renewed ? '☑' : '☐'} Renewed

${approvalLetter.isBothSpecific ? 'This approval is both site-specific and contract-specific.' : ''}
${approvalLetter.reaffirmsPrevious ? 'This reaffirms the previously issued IT Written Approval(s) for this site.' : ''}

${approvalLetter.isCSC ? `
CSC Information:
Computer Name: ${approvalLetter.computerName || '[Not specified]'}
Asset/Serial: ${approvalLetter.assetSerial || '[Not specified]'}
Operating System: ${approvalLetter.operatingSystem || '[Not specified]'}
Encryption Level: ${approvalLetter.encryptionLevel || '[Not specified]'}
BIOS Password Protected: ${approvalLetter.biosPasswordProtected ? 'Yes' : 'No'}
` : ''}

${approvalLetter.ccs.length > 0 ? `
CC:
${approvalLetter.ccs.map(cc => `${cc.name} - ${cc.title}, ${cc.department} (${cc.email})`).join('\n')}
` : ''}
    `.trim();
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();

  const handleExportDocx = async () => {
    setIsGenerating(true);
    try {
      await generateApprovalLetter(approvalLetter);
      toast({ title: "Document Generated", description: "Approval letter downloaded as .docx" });
    } catch (err) {
      toast({ title: "Export Failed", description: "Could not generate the document.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Approval Letter</span>
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
            Generate IT Written Approval letters with automatic data population.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inspector-initials">Inspector Initials</Label>
                <Input
                  id="inspector-initials"
                  value={approvalLetter.inspectorInitials}
                  onChange={(e) => setApprovalLetter({ ...approvalLetter, inspectorInitials: e.target.value })}
                  placeholder="Automatically populated"
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-csc"
                  checked={approvalLetter.isCSC}
                  onCheckedChange={(checked) => setApprovalLetter({ ...approvalLetter, isCSC: checked as boolean })}
                />
                <Label htmlFor="is-csc">Is this letter for CSC?</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="letter-date">Date</Label>
                <Input
                  id="letter-date"
                  type="date"
                  value={approvalLetter.date}
                  onChange={(e) => setApprovalLetter({ ...approvalLetter, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cso-name">Full Name of CSO</Label>
                <Input
                  id="cso-name"
                  value={approvalLetter.csoFullName}
                  onChange={(e) => setApprovalLetter({ ...approvalLetter, csoFullName: e.target.value })}
                  placeholder="Enter CSO full name"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="approval-company">Company Name</Label>
                <Input
                  id="approval-company"
                  value={approvalLetter.companyName}
                  readOnly
                  className="bg-muted"
                  placeholder="Auto-populated from Main"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval-org">Organization Number</Label>
                <Input
                  id="approval-org"
                  value={approvalLetter.orgNumber}
                  readOnly
                  className="bg-muted"
                  placeholder="Auto-populated from Main"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval-contracts">Contracts</Label>
                <Input
                  id="approval-contracts"
                  value={approvalLetter.contracts}
                  readOnly
                  className="bg-muted"
                  placeholder="Auto-populated from Main"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval-security">Security Level</Label>
                <Input
                  id="approval-security"
                  value={approvalLetter.securityLevel}
                  readOnly
                  className="bg-muted"
                  placeholder="Auto-populated from Main"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Approval Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="approve"
                  checked={approvalLetter.approve}
                  onCheckedChange={(checked) => setApprovalLetter({ ...approvalLetter, approve: checked as boolean })}
                />
                <Label htmlFor="approve">Approve</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="approves"
                  checked={approvalLetter.approves}
                  onCheckedChange={(checked) => setApprovalLetter({ ...approvalLetter, approves: checked as boolean })}
                />
                <Label htmlFor="approves">Approves</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="renewed"
                  checked={approvalLetter.renewed}
                  onCheckedChange={(checked) => setApprovalLetter({ ...approvalLetter, renewed: checked as boolean })}
                />
                <Label htmlFor="renewed">Renewed</Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="both-specific"
                  checked={approvalLetter.isBothSpecific}
                  onCheckedChange={(checked) => setApprovalLetter({ ...approvalLetter, isBothSpecific: checked as boolean })}
                />
                <Label htmlFor="both-specific">Is both site-specific and contract-specific</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reaffirms"
                  checked={approvalLetter.reaffirmsPrevious}
                  onCheckedChange={(checked) => setApprovalLetter({ ...approvalLetter, reaffirmsPrevious: checked as boolean })}
                />
                <Label htmlFor="reaffirms">Reaffirms the previously issued IT Written Approval(s) for this site</Label>
              </div>
            </div>
          </div>

          {approvalLetter.isCSC && (
            <div className="space-y-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <h4 className="font-semibold text-foreground flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>CSC Information</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="computer-name">Computer Name</Label>
                  <Input
                    id="computer-name"
                    value={approvalLetter.computerName || ''}
                    onChange={(e) => setApprovalLetter({ ...approvalLetter, computerName: e.target.value })}
                    placeholder="Enter computer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset-serial">Asset/Serial</Label>
                  <Input
                    id="asset-serial"
                    value={approvalLetter.assetSerial || ''}
                    onChange={(e) => setApprovalLetter({ ...approvalLetter, assetSerial: e.target.value })}
                    placeholder="Enter asset or serial number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operating-system">Operating System</Label>
                  <Input
                    id="operating-system"
                    value={approvalLetter.operatingSystem || ''}
                    onChange={(e) => setApprovalLetter({ ...approvalLetter, operatingSystem: e.target.value })}
                    placeholder="e.g., Windows 11, macOS 14"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encryption-level">Encryption Level</Label>
                  <Input
                    id="encryption-level"
                    value={approvalLetter.encryptionLevel || ''}
                    onChange={(e) => setApprovalLetter({ ...approvalLetter, encryptionLevel: e.target.value })}
                    placeholder="e.g., AES-256"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bios-password"
                  checked={approvalLetter.biosPasswordProtected || false}
                  onCheckedChange={(checked) => setApprovalLetter({ ...approvalLetter, biosPasswordProtected: checked as boolean })}
                />
                <Label htmlFor="bios-password">BIOS password protected</Label>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="cc-count">Number of CC's</Label>
              <Select value={approvalLetter.ccCount.toString()} onValueChange={handleCCCountChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {approvalLetter.ccCount > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">CC Recipients</h4>
                {Array.from({ length: approvalLetter.ccCount }, (_, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor={`cc-name-${i}`}>Name</Label>
                      <Input
                        id={`cc-name-${i}`}
                        value={approvalLetter.ccs[i]?.name || ''}
                        onChange={(e) => updateCC(i, 'name', e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`cc-title-${i}`}>Title</Label>
                      <Input
                        id={`cc-title-${i}`}
                        value={approvalLetter.ccs[i]?.title || ''}
                        onChange={(e) => updateCC(i, 'title', e.target.value)}
                        placeholder="Job title"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`cc-dept-${i}`}>Department</Label>
                      <Input
                        id={`cc-dept-${i}`}
                        value={approvalLetter.ccs[i]?.department || ''}
                        onChange={(e) => updateCC(i, 'department', e.target.value)}
                        placeholder="Department"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`cc-email-${i}`}>Email</Label>
                      <Input
                        id={`cc-email-${i}`}
                        type="email"
                        value={approvalLetter.ccs[i]?.email || ''}
                        onChange={(e) => updateCC(i, 'email', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showPreview && (
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Live Preview</h4>
              <div className="bg-muted/50 rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">{generatePreview()}</pre>
              </div>
            </div>
          )}

          <div className="pt-4 border-t space-y-2">
            <Button className="w-full" onClick={handleExportDocx} disabled={isGenerating}>
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download Approval Letter (.docx)'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};