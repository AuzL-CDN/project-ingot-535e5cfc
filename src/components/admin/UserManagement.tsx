import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, UserPlus, Shield, Settings, AlertCircle, Crown, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  roles?: { role: string }[];
}

type AppRole = 'admin' | 'moderator' | 'user';

export const UserManagement = () => {
  const { user, isAdmin, isDev, isM365 } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('user');
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Fetch roles separately
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        throw rolesError;
      }

      // Combine profiles with roles
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: roles?.filter(role => role.user_id === profile.user_id).map(r => ({ role: r.role })) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load user list.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    try {
      // Remove existing roles for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Add new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Role Updated",
        description: `User role changed to ${newRole}`,
      });

      // Refresh the user list
      await fetchUsers();
      setShowRoleDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (roles: { role: string }[]) => {
    if (roles.some(r => r.role === 'admin')) {
      return <Badge variant="default" className="bg-red-100 text-red-800"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
    }
    if (roles.some(r => r.role === 'moderator')) {
      return <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />Moderator</Badge>;
    }
    return <Badge variant="outline"><Eye className="h-3 w-3 mr-1" />User</Badge>;
  };

  const getPrimaryRole = (roles: { role: string }[]): AppRole => {
    if (roles.some(r => r.role === 'admin')) return 'admin';
    if (roles.some(r => r.role === 'moderator')) return 'moderator';
    return 'user';
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. Admin privileges required to manage users.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>User Management</span>
            {isDev && <Badge variant="outline">Dev Mode</Badge>}
            {isM365 && <Badge variant="secondary">M365 Ready</Badge>}
          </CardTitle>
          <CardDescription>
            Manage user accounts and access permissions. In M365 environment, this will integrate with Azure AD.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No users found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Total users: {users.length}
                </p>
                <Button 
                  onClick={fetchUsers}
                  variant="outline" 
                  size="sm"
                >
                  Refresh
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userProfile) => (
                      <TableRow key={userProfile.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {userProfile.display_name?.[0]?.toUpperCase() || userProfile.email[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{userProfile.display_name || 'Unknown'}</p>
                              {userProfile.user_id === user?.id && (
                                <Badge variant="outline" className="text-xs">You</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{userProfile.email}</TableCell>
                        <TableCell>{getRoleBadge(userProfile.roles || [])}</TableCell>
                        <TableCell>
                          {new Date(userProfile.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {userProfile.user_id !== user?.id && (
                            <Dialog open={showRoleDialog && selectedUser?.id === userProfile.id} onOpenChange={setShowRoleDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(userProfile);
                                    setNewRole(getPrimaryRole(userProfile.roles || []));
                                    setShowRoleDialog(true);
                                  }}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Manage User Role</DialogTitle>
                                  <DialogDescription>
                                    Change the role for {userProfile.display_name || userProfile.email}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Current Role</Label>
                                    <div>{getRoleBadge(userProfile.roles || [])}</div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>New Role</Label>
                                    <Select value={newRole} onValueChange={(value: AppRole) => setNewRole(value)}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="moderator">Moderator</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={() => selectedUser && handleRoleChange(selectedUser.user_id, newRole)}>
                                    Update Role
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isDev && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Development Mode:</strong> User management is handled via Supabase. 
            In M365 production, this will integrate with Azure Active Directory for centralized user management.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};