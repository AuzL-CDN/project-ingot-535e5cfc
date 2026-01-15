import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, User, LogIn, AlertCircle, Lock, HelpCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Validation schemas for Login Prime 1
const usernameSchema = z.string().trim().min(2, { message: "Username is required" }).max(50);
const passwordSchema = z.string().min(1, { message: "Password is required" }).max(100);

export const AuthPage = () => {
  const { user, signIn, isDev, mustChangePassword, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [signInData, setSignInData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Show password change dialog when required
  useEffect(() => {
    if (user && mustChangePassword) {
      setShowPasswordChange(true);
    }
  }, [user, mustChangePassword]);

  // Redirect if authenticated and password change not required
  if (user && !mustChangePassword && !loading) {
    // Navigate with state to trigger welcome transition
    return <Navigate to="/" state={{ justLoggedIn: true, userName: user.display_name || user.username }} replace />;
  }

  const validateSignIn = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      usernameSchema.parse(signInData.username);
    } catch (error) {
      newErrors.username = error instanceof z.ZodError ? error.issues[0].message : 'Invalid username';
    }
    
    try {
      passwordSchema.parse(signInData.password);
    } catch (error) {
      newErrors.password = error instanceof z.ZodError ? error.issues[0].message : 'Invalid password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignIn()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await signIn(signInData.username, signInData.password);

      if (error) {
        if (error.message.includes('Invalid') || error.message.includes('401')) {
          setErrors({ general: 'Invalid username or password. Please check your credentials and try again.' });
        } else if (error.message.includes('429') || error.message.includes('rate')) {
          setErrors({ general: 'Too many login attempts. Please wait a moment before trying again.' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChanged = () => {
    setShowPasswordChange(false);
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      {/* Password Change Dialog - Non-dismissable on first login */}
      <ChangePasswordDialog 
        open={showPasswordChange} 
        onSuccess={handlePasswordChanged}
        isFirstLogin={mustChangePassword}
      />

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">INGOT</CardTitle>
            <CardDescription>
              Inspection Management System
            </CardDescription>
          </div>
          
          {/* Environment Badge */}
          <div className="flex justify-center">
            {isDev && (
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Dev Mode
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-username"
                  type="text"
                  placeholder="Enter your username"
                  value={signInData.username}
                  onChange={(e) => setSignInData(prev => ({ ...prev, username: e.target.value }))}
                  className={`pl-10 ${errors.username ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInData.password}
                  onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                  className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full text-muted-foreground"
              onClick={() => setShowForgotPassword(true)}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Forgot your password?
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>Contact your administrator for access</p>
          </div>

          {/* Forgot Password Dialog */}
          <ForgotPasswordDialog
            open={showForgotPassword}
            onOpenChange={setShowForgotPassword}
          />
        </CardContent>
      </Card>
    </div>
  );
};
