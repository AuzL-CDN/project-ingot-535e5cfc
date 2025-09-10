import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, FileText, Building, Hash, Calendar } from 'lucide-react';
import { MainFormData } from '@/hooks/useInspectionState';
import { useToast } from '@/hooks/use-toast';

interface MainFormProps {
  mainForm: MainFormData;
  updateMainForm: (updates: Partial<MainFormData>) => void;
  saveActivity: () => any;
}

export const MainForm = ({ mainForm, updateMainForm, saveActivity }: MainFormProps) => {
  const { toast } = useToast();

  const handleSave = () => {
    const activity = saveActivity();
    toast({
      title: "Activity Saved",
      description: `Activity ${activity.id} has been saved successfully.`,
    });
  };

  const contractTypes = [
    'Prime Contract',
    'Subcontract',
    'Service Contract',
    'Supply Contract',
    'Standing Offer',
    'Other'
  ];

  const securityLevels = [
    'Unclassified',
    'Protected A',
    'Protected B',
    'Protected C',
    'Confidential',
    'Secret',
    'Top Secret'
  ];

  const inspectionTypes = [
    'DoC',
    'Onsite',
    'Virtual',
    'Hybrid',
    'Follow-up'
  ];

  const inspectionClasses = [
    { value: '1F', label: '1F - Initial FSC' },
    { value: '1G', label: '1G - Renewal FSC' },
    { value: '19F', label: '19F - Initial DoC' },
    { value: '19G', label: '19G - Renewal DoC' }
  ];

  const generateRootFolder = () => {
    if (mainForm.activityNumber && mainForm.orgSiteNumber && mainForm.companyName) {
      return `${mainForm.activityNumber}_(${mainForm.orgSiteNumber}) ${mainForm.companyName}`;
    }
    return 'Preview: [Activity]_([Org-Site]) [Company]';
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Package Generator</span>
          </CardTitle>
          <CardDescription>
            Enter core information that will auto-populate across all inspection documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activity-number" className="flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span>Activity Number</span>
                </Label>
                <Input
                  id="activity-number"
                  value={mainForm.activityNumber}
                  onChange={(e) => updateMainForm({ activityNumber: e.target.value })}
                  placeholder="e.g., 20241234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-site">Organization - Site Number</Label>
                <Input
                  id="org-site"
                  value={mainForm.orgSiteNumber}
                  onChange={(e) => updateMainForm({ orgSiteNumber: e.target.value })}
                  placeholder="e.g., 123-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-name" className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Company Name</span>
                </Label>
                <Input
                  id="company-name"
                  value={mainForm.companyName}
                  onChange={(e) => updateMainForm({ companyName: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-department">Client Department</Label>
                <Input
                  id="client-department"
                  value={mainForm.clientDepartment}
                  onChange={(e) => updateMainForm({ clientDepartment: e.target.value })}
                  placeholder="e.g., DND, RCMP, etc."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract-type">Contract Type</Label>
                <Select 
                  value={mainForm.contractType}
                  onValueChange={(value) => updateMainForm({ contractType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract-number">Contract Number</Label>
                <Input
                  id="contract-number"
                  value={mainForm.contractNumber}
                  onChange={(e) => updateMainForm({ contractNumber: e.target.value })}
                  placeholder="Enter contract number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-level">Security Level</Label>
                <Select 
                  value={mainForm.securityLevel}
                  onValueChange={(value) => updateMainForm({ securityLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select security level" />
                  </SelectTrigger>
                  <SelectContent>
                    {securityLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspection-type">Inspection Type</Label>
                <Select 
                  value={mainForm.inspectionType}
                  onValueChange={(value) => updateMainForm({ inspectionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select inspection type" />
                  </SelectTrigger>
                  <SelectContent>
                    {inspectionTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="inspection-class">Inspection Class</Label>
              <Select 
                value={mainForm.inspectionClass}
                onValueChange={(value) => updateMainForm({ inspectionClass: value as MainFormData['inspectionClass'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select inspection class" />
                </SelectTrigger>
                <SelectContent>
                  {inspectionClasses.map((cls) => (
                    <SelectItem key={cls.value} value={cls.value}>{cls.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Date</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={mainForm.date}
                onChange={(e) => updateMainForm({ date: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Generated Folder Structure:</h4>
            <p className="text-sm font-mono text-muted-foreground">{generateRootFolder()}</p>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};