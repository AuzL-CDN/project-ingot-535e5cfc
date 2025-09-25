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
import { useTranslation } from '@/hooks/useTranslation';

interface MainFormProps {
  mainForm: MainFormData;
  updateMainForm: (updates: Partial<MainFormData>) => void;
  saveActivity: () => any;
  completeActivity: () => void;
  globalState: { globalUILanguage: 'en' | 'fr' };
}

export const MainForm = ({ mainForm, updateMainForm, saveActivity, completeActivity, globalState }: MainFormProps) => {
  const { toast } = useToast();
  const { t } = useTranslation(globalState.globalUILanguage === 'fr' ? 'french' : 'english');
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [pendingInspectionClass, setPendingInspectionClass] = useState('');

  const handleBeginActivity = () => {
    saveActivity();
    toast({
      title: t('activityBegun'),
      description: t('activityBegunDesc'),
    });
  };

  const handleCompleteActivity = () => {
    saveActivity();
    completeActivity();
    toast({
      title: t('activityCompleted'),
      description: t('activityCompletedDesc'),
    });
  };

  const handleSave = () => {
    const activity = saveActivity();
    toast({
      title: t('activitySaved'),
      description: `Activity ${activity.id} ${t('activitySavedDesc')}`,
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
              {t('yes')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleUILanguageChoice(false)}>
              {t('no')}
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
            <span>{t('packageGenerator')}</span>
          </CardTitle>
          <CardDescription>
            {t('packageGeneratorDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activity-number" className="flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span>{t('activityNumber')}</span>
                </Label>
                <Input
                  id="activity-number"
                  value={mainForm.activityNumber}
                  onChange={(e) => updateMainForm({ activityNumber: e.target.value })}
                  placeholder="e.g., 20241234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-site">{t('orgSiteNumber')}</Label>
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
                  <span>{t('companyName')}</span>
                </Label>
                <Input
                  id="company-name"
                  value={mainForm.companyName}
                  onChange={(e) => updateMainForm({ companyName: e.target.value })}
                  placeholder={t('enterCompanyName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-department">{t('clientDepartment')}</Label>
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
                  <span>{t('csoFullName')}</span>
                </Label>
                <Input
                  id="cso-full-name"
                  value={mainForm.csoFullName}
                  onChange={(e) => updateMainForm({ csoFullName: e.target.value })}
                  placeholder={t('enterCSOName')}
                />
              </div>

              {/* CSO Email */}
              <div className="space-y-2">
                <Label htmlFor="cso-email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{t('csoEmail')}</span>
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
                <Label htmlFor="contract-type">{t('contractType')}</Label>
                <Select 
                  value={mainForm.contractType}
                  onValueChange={(value) => updateMainForm({ contractType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectContractType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract-number">{t('contractNumber')}</Label>
                <Input
                  id="contract-number"
                  value={mainForm.contractNumber}
                  onChange={(e) => updateMainForm({ contractNumber: e.target.value })}
                  placeholder={t('enterContractNumber')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-level">{t('securityLevel')}</Label>
                <Select 
                  value={mainForm.securityLevel}
                  onValueChange={(value) => updateMainForm({ securityLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectSecurityLevel')} />
                  </SelectTrigger>
                  <SelectContent>
                    {securityLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspection-type">{t('inspectionType')}</Label>
                <Select 
                  value={mainForm.inspectionType}
                  onValueChange={(value) => updateMainForm({ inspectionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectInspectionType')} />
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
                  <span>{t('numberOfACSOs')}</span>
                </Label>
                <Select 
                  value={mainForm.numberOfACSOs.toString()}
                  onValueChange={handleNumberOfACSOs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectNumberACSOs')} />
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
                  <span>{t('date')}</span>
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
                <span>{t('assistantCSOs')}</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mainForm.acsos.map((acso, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">ACSO #{index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`acso-name-${index}`}>{t('acsoFullName')}</Label>
                        <Input
                          id={`acso-name-${index}`}
                          value={acso.fullName}
                          onChange={(e) => updateACSO(index, 'fullName', e.target.value)}
                          placeholder={t('enterACSORName')}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`acso-email-${index}`}>{t('acsoEmailField')}</Label>
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
              <Label htmlFor="inspection-class">{t('inspectionClass')}</Label>
              <Select 
                value={mainForm.inspectionClass}
                onValueChange={handleInspectionClassChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectInspectionClass')} />
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
            <h4 className="font-medium text-foreground mb-2">{t('generatedFolder')}</h4>
            <p className="text-sm font-mono text-muted-foreground">{generateRootFolder()}</p>
          </div>

          <div className="pt-4 border-t space-y-3">
            <Button onClick={handleBeginActivity} className="w-full" variant="outline">
              <Save className="h-4 w-4 mr-2" />
              {t('beginActivity')}
            </Button>
            <Button onClick={handleCompleteActivity} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('completeActivity')}
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
              <span>{t('selectLanguage')}</span>
            </DialogTitle>
            <DialogDescription>
              {t('selectLanguageDesc')}
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
                <span>{t('english')}</span>
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