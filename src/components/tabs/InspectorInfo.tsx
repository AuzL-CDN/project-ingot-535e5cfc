import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, User, Mail, Tag } from 'lucide-react';
import { InspectorProfile } from '@/hooks/useInspectionState';

interface InspectorInfoProps {
  inspector: InspectorProfile;
  updateInspector: (updates: Partial<InspectorProfile>) => void;
}

export const InspectorInfo = ({ inspector, updateInspector }: InspectorInfoProps) => {
  const { toast } = useToast();

  const handleSave = () => {
    if (!inspector.name || !inspector.initials || !inspector.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // In real app, would create SharePoint folder: Documents/Inspectors/{Initials} - {Name}/
    toast({
      title: "Profile Saved",
      description: `Inspector profile saved. Folder created: Documents/Inspectors/${inspector.initials} - ${inspector.name}/`,
    });
  };

  const isComplete = inspector.name && inspector.initials && inspector.email;

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Inspector Information</span>
            </CardTitle>
            <CardDescription>
              Set up your inspector profile. This information will be used across all inspection activities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inspector-name" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Inspector Name *</span>
                </Label>
                <Input
                  id="inspector-name"
                  value={inspector.name}
                  onChange={(e) => updateInspector({ name: e.target.value })}
                  placeholder="Enter your full name"
                  className="transition-smooth focus:shadow-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector-initials" className="flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Inspector Initials *</span>
                </Label>
                <Input
                  id="inspector-initials"
                  value={inspector.initials}
                  onChange={(e) => updateInspector({ initials: e.target.value.toUpperCase() })}
                  placeholder="e.g., JD"
                  maxLength={5}
                  className="transition-smooth focus:shadow-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector-email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Address *</span>
                </Label>
                <Input
                  id="inspector-email"
                  type="email"
                  value={inspector.email}
                  onChange={(e) => updateInspector({ email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="transition-smooth focus:shadow-glow"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={handleSave}
                className="w-full"
                disabled={!isComplete}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Inspector Profile
              </Button>
              
              {isComplete && (
                <p className="text-sm text-success text-center mt-3">
                  ✓ Profile complete! You can now access all inspection features.
                </p>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">What happens when you save:</p>
              <ul className="space-y-1 text-xs">
                <li>• Your profile is stored for future sessions</li>
                <li>• A dedicated folder is created: Documents/Inspectors/{inspector.initials} - {inspector.name}/</li>
                <li>• Your initials will auto-populate in approval letters</li>
                <li>• All inspection tabs become available</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};