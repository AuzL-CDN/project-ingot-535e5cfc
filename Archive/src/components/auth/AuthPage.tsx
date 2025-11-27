import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, User, LogIn, UserPlus, AlertCircle, Info } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255);
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" }).max(100);
const displayNameSchema = z.string().trim().min(1, { message: "Display name is required" }).max(100);

export const AuthPage = () => {
  const { user, signIn, signUp, isDev, isM365 } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', displayName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const validateSignIn = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(signInData.email);
    } catch (error) {
      newErrors.email = error instanceof z.ZodError ? error.issues[0].message : 'Invalid email';
    }
    
    try {
      passwordSchema.parse(signInData.password);
    } catch (error) {
      newErrors.password = error instanceof z.ZodError ? error.issues[0].message : 'Invalid password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUp = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(signUpData.email);
    } catch (error) {
      newErrors.email = error instanceof z.ZodError ? error.issues[0].message : 'Invalid email';
    }
    
    try {
      passwordSchema.parse(signUpData.password);
    } catch (error) {
      newErrors.password = error instanceof z.ZodError ? error.issues[0].message : 'Invalid password';
    }
    
    try {
      displayNameSchema.parse(signUpData.displayName);
    } catch (error) {
      newErrors.displayName = error instanceof z.ZodError ? error.issues[0].message : 'Invalid display name';
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
      const { error } = await signIn(signInData.email, signInData.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please check your email and click the confirmation link before signing in.' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUp()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await signUp(signUpData.email, signUpData.password, signUpData.displayName);

      if (error) {
        if (error.message.includes('User already registered')) {
          setErrors({ general: 'An account with this email already exists. Please sign in instead.' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email for a confirmation link.",
        });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">Inspection System</CardTitle>
            <CardDescription>
              Access the professional inspection management system
            </CardDescription>
          </div>
          
          {/* Environment Badges */}
          <div className="flex justify-center space-x-2">
            {isDev && (
              <Badge variant="outline" className="text-xs">
                <Info className="h-3 w-3 mr-1" />
                Dev Mode
              </Badge>
            )}
            {isM365 && (
              <Badge variant="secondary" className="text-xs">
                M365 Ready
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </TabsTrigger>
            </TabsList>

            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    className={errors.password ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Display Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    value={signUpData.displayName}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, displayName: e.target.value }))}
                    className={errors.displayName ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.displayName && <p className="text-sm text-destructive">{errors.displayName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    className={errors.password ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />
          
          <div className="text-center text-sm text-muted-foreground">
            <p>First user automatically becomes admin</p>
            {isDev && (
              <p className="mt-1 text-xs">
                Dev mode: Email confirmation disabled for testing
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};