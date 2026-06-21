import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  KeyRound, 
  Check, 
  X, 
  Clock, 
  RefreshCw, 
  Loader2, 
  Copy, 
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface PasswordResetRequest {
  id: number;
  user_id: number;
  username: string;
  display_name: string | null;
  email: string;
  requested_at: string;
  resolved_at: string | null;
  resolved_by: number | null;
  resolver_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
}

interface TempPasswordResult {
  username: string;
  display_name: string | null;
  temporary_password: string;
}

export const PasswordResetRequests = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  
  // Dialog for showing temporary password
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [tempPasswordResult, setTempPasswordResult] = useState<TempPasswordResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [passwordRevealed, setPasswordRevealed] = useState(false);

  // Auto-dismiss temporary password dialog after 60 seconds
  useEffect(() => {
    if (!showTempPassword) return;
    const timer = setTimeout(() => {
      setShowTempPassword(false);
      setPasswordRevealed(false);
      setCopied(false);
    }, 60000);
    return () => clearTimeout(timer);
  }, [showTempPassword]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.passwordResets.list(statusFilter);
      
      if (response.success && response.data) {
        setRequests(response.data.requests);
        setCounts(response.data.counts);
      } else {
        throw new Error(response.error || 'Failed to load requests');
      }
    } catch (error) {
      console.error('Error fetching password reset requests:', error);
      toast({
        title: "Error",
        description: "Failed to load password reset requests.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin, statusFilter]);

  const handleApprove = async (request: PasswordResetRequest) => {
    try {
      setActionLoading(request.id);
      const response = await api.passwordResets.approve(request.id);

      if (response.success && response.data) {
        setTempPasswordResult({
          username: response.data.username,
          display_name: request.display_name,
          temporary_password: ''
        });
        setShowTempPassword(true);
        
        toast({
          title: "Password Reset Approved",
          description: `Password reset for ${request.display_name || request.username}. The temporary password has been logged.`,
        });
        
        fetchRequests();
      } else {
        throw new Error(response.error || 'Failed to approve request');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve password reset.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request: PasswordResetRequest) => {
    try {
      setActionLoading(request.id);
      const response = await api.passwordResets.reject(request.id);

      if (response.success) {
        toast({
          title: "Request Rejected",
          description: `Password reset request for ${request.display_name || request.username} has been rejected.`,
        });
        fetchRequests();
      } else {
        throw new Error(response.error || 'Failed to reject request');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject password reset.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Please select and copy manually.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. Admin privileges required.
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <span>Password Reset Requests</span>
                {(counts['pending'] ?? 0) > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {counts['pending']} pending
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Review and manage user password reset requests.
              </CardDescription>
            </div>
            <Button onClick={fetchRequests} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
            <TabsList>
              <TabsTrigger value="pending">
                Pending {counts['pending'] ? `(${counts['pending']})` : ''}
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved {counts['approved'] ? `(${counts['approved']})` : ''}
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected {counts['rejected'] ? `(${counts['rejected']})` : ''}
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No {statusFilter !== 'all' ? statusFilter : ''} password reset requests.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    {statusFilter !== 'pending' && <TableHead>Resolved By</TableHead>}
                    {statusFilter === 'pending' && <TableHead className="w-[140px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{request.display_name || 'Unnamed'}</p>
                            <p className="text-xs text-muted-foreground">{request.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{request.username}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(request.requested_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      {statusFilter !== 'pending' && (
                        <TableCell className="text-muted-foreground">
                          {request.resolver_name || '-'}
                          {request.resolved_at && (
                            <div className="text-xs">
                              {new Date(request.resolved_at).toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                      )}
                      {statusFilter === 'pending' && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(request)}
                              disabled={actionLoading === request.id}
                            >
                              {actionLoading === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(request)}
                              disabled={actionLoading === request.id}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Temporary Password Dialog */}
      <Dialog open={showTempPassword} onOpenChange={setShowTempPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Password Reset Complete
            </DialogTitle>
            <DialogDescription>
              A temporary password has been generated for {tempPasswordResult?.display_name || tempPasswordResult?.username}.
            </DialogDescription>
          </DialogHeader>
          
          {tempPasswordResult && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please provide this temporary password to the user securely. They will be required to change it on their next login.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <div className="font-mono bg-muted p-3 rounded-md">
                  {tempPasswordResult.username}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Temporary Password</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono bg-muted p-3 rounded-md text-lg tracking-wider">
                    {passwordRevealed ? tempPasswordResult.temporary_password : '••••••••••••'}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPasswordRevealed(prev => !prev)}
                    title={passwordRevealed ? 'Hide password' : 'Show password'}
                  >
                    {passwordRevealed ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(tempPasswordResult.temporary_password)}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordRevealed && (
                  <p className="text-xs text-amber-600">This dialog will auto-dismiss in 60 seconds. Copy the password now.</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowTempPassword(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
