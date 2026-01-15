import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Check, X, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ChangePasswordDialogProps {
  open: boolean;
  username: string;
  onSuccess: () => void;
}

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number (0-9)', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character (!@#$%^&*)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export const ChangePasswordDialog = ({ open, username, onSuccess }: ChangePasswordDialogProps) => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check which requirements are met
  const requirementsMet = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    passed: req.test(newPassword),
  }));

  const allRequirementsMet = requirementsMet.every(r => r.passed);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = currentPassword.length > 0 && allRequirementsMet && passwordsMatch;

  // Calculate password strength
  const passedCount = requirementsMet.filter(r => r.passed).length;
  const strengthPercent = (passedCount / PASSWORD_REQUIREMENTS.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercent < 40) return 'bg-destructive';
    if (strengthPercent < 80) return 'bg-warning';
    return 'bg-success';
  };

  const getStrengthLabel = () => {
    if (strengthPercent < 40) return 'Weak';
    if (strengthPercent < 80) return 'Fair';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await api.auth.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been updated successfully. Please use your new password next time you sign in.',
        });
        onSuccess();
      } else {
        setError(response.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">Change Your Password</DialogTitle>
          <DialogDescription className="text-center">
            Welcome, <strong>{username}</strong>! For security, you must change your password before continuing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10 pr-10"
                placeholder="Enter your current password"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 pr-10"
                placeholder="Create a strong password"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {/* Password Strength Meter */}
            {newPassword.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Password Strength</span>
                  <span className={cn(
                    'font-medium',
                    strengthPercent < 40 && 'text-destructive',
                    strengthPercent >= 40 && strengthPercent < 80 && 'text-warning',
                    strengthPercent >= 80 && 'text-success',
                  )}>
                    {getStrengthLabel()}
                  </span>
                </div>
                <Progress value={strengthPercent} className={cn('h-2', getStrengthColor())} />
              </div>
            )}
          </div>

          {/* Password Requirements */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">Password Requirements:</p>
            <ul className="space-y-1">
              {requirementsMet.map((req) => (
                <li 
                  key={req.id} 
                  className={cn(
                    'flex items-center text-xs',
                    req.passed ? 'text-success' : 'text-muted-foreground'
                  )}
                >
                  {req.passed ? (
                    <Check className="h-3 w-3 mr-2 flex-shrink-0" />
                  ) : (
                    <X className="h-3 w-3 mr-2 flex-shrink-0" />
                  )}
                  {req.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  'pl-10 pr-10',
                  confirmPassword.length > 0 && !passwordsMatch && 'border-destructive'
                )}
                placeholder="Confirm your new password"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
            {passwordsMatch && (
              <p className="text-xs text-success flex items-center">
                <Check className="h-3 w-3 mr-1" /> Passwords match
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            This is a one-time requirement. You won't be asked again.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
