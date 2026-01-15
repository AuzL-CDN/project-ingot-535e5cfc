import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  Activity, 
  Database, 
  Settings, 
  AlertCircle,
  LogOut,
  Crown,
  AlertTriangle,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { UserManagement } from '../admin/UserManagement';
import { PasswordResetRequests } from '../admin/PasswordResetRequests';
import { SystemStatus } from '../admin/SystemStatus';
import { DataImportUtility } from '../DataImportUtility';
import { useToast } from '@/hooks/use-toast';

export const AdminTab = () => {
  const { user, profile, isAdmin, signOut, isDev, isM365 } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to access the admin panel.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Access denied. Administrator privileges required to access this section.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Dev Mode Security Warning */}
      {isDev && (
        <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Development Mode Active:</strong> Admin access is enabled on localhost for testing only. 
            This is NOT secure for production. Implement proper authentication before deploying.
          </AlertDescription>
        </Alert>
      )}

      {/* Admin Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-6 w-6 text-primary" />
                <span>Admin Panel</span>
                <Badge variant="default" className="bg-red-100 text-red-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin Access
                </Badge>
              </CardTitle>
              <CardDescription>
                System administration and management tools
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Environment Badges */}
              <div className="flex space-x-2">
                {isDev && (
                  <Badge variant="outline">Dev Mode</Badge>
                )}
                {isM365 && (
                  <Badge variant="secondary">M365 Ready</Badge>
                )}
              </div>
              
              {/* User Info */}
              <div className="text-right text-sm">
                <p className="font-medium">{profile?.display_name || 'Admin User'}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              
              {/* Sign Out */}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Data</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>User Management</span>
                </CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveTab('users')} 
                  className="w-full"
                >
                  Manage Users
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-primary" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>
                  Import organization data and manage system databases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveTab('data')} 
                  variant="outline" 
                  className="w-full"
                >
                  Manage Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>System Status</span>
                </CardTitle>
                <CardDescription>
                  Monitor system health and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveTab('system')} 
                  variant="outline" 
                  className="w-full"
                >
                  View Status
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>System Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure system preferences and integration settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Environment Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Admin Environment:</strong> {isDev ? 'Development mode active' : 'Production environment'}. 
              {isM365 ? ' M365 integration enabled.' : ' Supabase backend active.'} 
              All admin actions are logged and audited.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
          <PasswordResetRequests />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <DataImportUtility />
        </TabsContent>

        <TabsContent value="system">
          <SystemStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};