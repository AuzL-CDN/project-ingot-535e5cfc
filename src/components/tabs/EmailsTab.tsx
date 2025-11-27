import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, User } from 'lucide-react';
import { MainFormData } from '@/hooks/useInspectionState';

interface EmailsTabProps {
  mainForm: MainFormData;
}

export const EmailsTab = ({ mainForm }: EmailsTabProps) => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <span>E-Mail Addresses</span>
          </CardTitle>
          <CardDescription>
            All email addresses auto-populated from Main tab for easy reference and copying.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CSO Email Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Chief Security Officer</span>
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="cso-name-display">CSO Full Name</Label>
                <Input
                  id="cso-name-display"
                  value={mainForm.csoFullName || 'Not set'}
                  className="bg-muted"
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cso-email-display">CSO Email Address</Label>
                <Input
                  id="cso-email-display"
                  value={mainForm.csoEmail || 'Not set'}
                  className="bg-muted"
                  readOnly
                />
              </div>
            </div>
            
            {/* ACSOs Email Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Assistant Chief Security Officers</span>
              </h3>
              
              <div className="space-y-2">
                <Label>Number of ACSOs</Label>
                <Input
                  value={mainForm.numberOfACSOs.toString()}
                  className="bg-muted"
                  readOnly
                />
              </div>
              
              {mainForm.numberOfACSOs > 0 && (
                <div className="space-y-4">
                  {mainForm.acsos.map((acso, index) => (
                    <div key={index} className="space-y-3 p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium text-foreground">ACSO #{index + 1}</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`acso-name-${index}`}>Full Name</Label>
                        <Input
                          id={`acso-name-${index}`}
                          value={acso.fullName || 'Not set'}
                          className="bg-muted"
                          readOnly
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`acso-email-${index}`}>Email Address</Label>
                        <Input
                          id={`acso-email-${index}`}
                          value={acso.email || 'Not set'}
                          className="bg-muted"
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {mainForm.numberOfACSOs === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No ACSOs configured</p>
                  <p className="text-sm">Add ACSOs in the Main tab to see them here</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Email Summary:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• CSO: {mainForm.csoEmail || 'Not set'}</p>
              {mainForm.acsos.map((acso, index) => (
                <p key={index}>• ACSO #{index + 1}: {acso.email || 'Not set'}</p>
              ))}
              {mainForm.numberOfACSOs === 0 && <p>• No ACSOs configured</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};