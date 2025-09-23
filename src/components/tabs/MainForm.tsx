import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save, FileText, Building, Hash, Calendar, User, Mail, Users, CheckCircle, Globe } from 'lucide-react';
import { MainFormData } from '@/hooks/useInspectionState';
import { useToast } from '@/hooks/use-toast';
import { AddressLookup } from '@/components/AddressLookup';

interface MainFormProps {
  mainForm: MainFormData;
  updateMainForm: (updates: Partial<MainFormData>) => void;
  saveActivity: () => any;
  completeActivity: () => void;
}

export const MainForm = ({ mainForm, updateMainForm, saveActivity, completeActivity }: MainFormProps) => {
  const { toast } = useToast();
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [pendingInspectionClass, setPendingInspectionClass] = useState('');

  const handleBeginActivity = () => {
    saveActivity();
    toast({
      title: "Activity Begun",
      description: "Your inspection activity has been started and saved successfully.",
    });
  };

  const handleCompleteActivity = () => {
    saveActivity();
    completeActivity();
    toast({
      title: "Activity Completed",
      description: "Activity completed! Approval Letter tab is now available.",
    });
  };

  const handleSave = () => {
    const activity = saveActivity();
    toast({
      title: "Activity Saved",
      description: `Activity ${activity.id} has been saved successfully.`,
    });
  };

  const handleNumberOfACSOs = (value: string) => {
    const num = parseInt(value);
    const newACSOs = Array.from({ length: num }, (_, i) => 
      mainForm.acsos[i] || { fullName: '', email: '' }
    );
    updateMainForm({ numberOfACSOs: num, acsos: newACSOs });
  };

  const updateACSO = (index: number, field: 'fullName' | 'email', value: string) => {
    const updatedACSOs = [...mainForm.acsos];
    updatedACSOs[index] = { ...updatedACSOs[index], [field]: value };
    updateMainForm({ acsos: updatedACSOs });
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
    { value: '1F', label: '1F - Protected Ins.' },
    { value: '1G', label: '1G - Secret+ Ins.' },
    { value: '19F', label: '19F - Protected DoC' },
    { value: '19G', label: '19G - Secret+ DoC' }
  ];

  const handleInspectionClassChange = (value: string) => {
    setPendingInspectionClass(value);
    setShowLanguageDialog(true);
  };

  const handleLanguageSelection = (language: string) => {
    setSelectedLanguage(language);
    if (language === 'french') {
      // Show UI language confirmation dialog
      toast({
        title: "French Selected",
        description: "Would you like to change the interface to French as well?",
        action: (
          <div className="flex space-x-2">
            <Button size="sm" onClick={() => handleUILanguageChoice(true)}>
              Yes
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleUILanguageChoice(false)}>
              No
            </Button>
          </div>
        ),
      });
    } else {
      // English selected, proceed normally
      updateMainForm({ inspectionClass: pendingInspectionClass as MainFormData['inspectionClass'] });
      setShowLanguageDialog(false);
    }
  };

  const handleUILanguageChoice = (changeTuiFrench: boolean) => {
    updateMainForm({ 
      inspectionClass: pendingInspectionClass as MainFormData['inspectionClass'],
      language: selectedLanguage,
      uiLanguage: changeTuiFrench ? 'french' : 'english'
    });
    setShowLanguageDialog(false);
    
    if (changeTuiFrench) {
      toast({
        title: "Langue française sélectionnée",
        description: "L'interface sera traduite en français et utilisera les modèles français.",
      });
    } else {
      toast({
        title: "French Templates Selected",
        description: "Interface will remain in English but French templates will be used for documents.",
      });
    }
  };

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

              {/* CSO Full Name */}
              <div className="space-y-2">
                <Label htmlFor="cso-full-name" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Full Name of CSO</span>
                </Label>
                <Input
                  id="cso-full-name"
                  value={mainForm.csoFullName}
                  onChange={(e) => updateMainForm({ csoFullName: e.target.value })}
                  placeholder="Enter CSO's full name"
                />
              </div>

              {/* CSO Email */}
              <div className="space-y-2">
                <Label htmlFor="cso-email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>CSO's E-mail Address</span>
                </Label>
                <Input
                  id="cso-email"
                  type="email"
                  value={mainForm.csoEmail}
                  onChange={(e) => updateMainForm({ csoEmail: e.target.value })}
                  placeholder="cso@organization.com"
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

              {/* Number of ACSOs */}
              <div className="space-y-2">
                <Label htmlFor="number-acsos" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Number of ACSOs</span>
                </Label>
                <Select 
                  value={mainForm.numberOfACSOs.toString()}
                  onValueChange={handleNumberOfACSOs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of ACSOs" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
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
          </div>

          {/* Address Lookup Section */}
          <AddressLookup
            orgSiteNumber={mainForm.orgSiteNumber}
            currentAddress={mainForm.address}
            onAddressUpdate={(address) => updateMainForm({ address })}
            onCompanyUpdate={(companyName) => updateMainForm({ companyName })}
          />

          {/* ACSO Fields */}
          {mainForm.numberOfACSOs > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Assistant Chief Security Officers</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mainForm.acsos.map((acso, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">ACSO #{index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`acso-name-${index}`}>Full Name of ACSO</Label>
                        <Input
                          id={`acso-name-${index}`}
                          value={acso.fullName}
                          onChange={(e) => updateACSO(index, 'fullName', e.target.value)}
                          placeholder="Enter ACSO's full name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`acso-email-${index}`}>ACSO E-mail Field</Label>
                        <Input
                          id={`acso-email-${index}`}
                          type="email"
                          value={acso.email}
                          onChange={(e) => updateACSO(index, 'email', e.target.value)}
                          placeholder="acso@organization.com"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="inspection-class">Inspection Class</Label>
              <Select 
                value={mainForm.inspectionClass}
                onValueChange={handleInspectionClassChange}
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
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Generated Folder Structure:</h4>
            <p className="text-sm font-mono text-muted-foreground">{generateRootFolder()}</p>
          </div>

          <div className="pt-4 border-t space-y-3">
            <Button onClick={handleBeginActivity} className="w-full" variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Begin Activity
            </Button>
            <Button onClick={handleCompleteActivity} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Language Selection Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Select Inspection Language</span>
            </DialogTitle>
            <DialogDescription>
              Choose the language for your inspection documents and templates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={selectedLanguage === 'english' ? 'default' : 'outline'}
                onClick={() => handleLanguageSelection('english')}
                className="h-16 flex flex-col space-y-1"
              >
                <span className="text-lg">🇨🇦</span>
                <span>English</span>
              </Button>
              <Button
                variant={selectedLanguage === 'french' ? 'default' : 'outline'}
                onClick={() => handleLanguageSelection('french')}
                className="h-16 flex flex-col space-y-1"
              >
                <span className="text-lg">🇫🇷</span>
                <span>Français</span>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              This will determine the language used for all inspection documents and templates.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};