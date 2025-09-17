import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertCircle, FileText, Mail, Calendar, Activity, Upload, Users, Shield } from 'lucide-react';

export interface ActivityLogEntry {
  id: string;
  action: string;
  result: 'success' | 'warning' | 'error';
  timestamp: string;
  details: string;
  files?: Array<{
    name: string;
    type: string;
    url?: string;
  }>;
}

interface StatusTabProps {
  currentActivity: string;
  activityLog?: ActivityLogEntry[];
}

// Sample activity log entries
const sampleActivityLog: ActivityLogEntry[] = [
  {
    id: '1',
    action: 'Activity Created',
    result: 'success',
    timestamp: new Date().toISOString(),
    details: 'New inspection activity initialized with main form data',
    files: []
  },
  {
    id: '2',
    action: 'Address Lookup Completed',
    result: 'success',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    details: 'Organization address verified from directory lookup',
  },
  {
    id: '3',
    action: 'Document Uploaded',
    result: 'success',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    details: 'Supporting document uploaded to activity folder',
    files: [
      { name: 'security_policy.pdf', type: 'PDF Document' }
    ]
  },
  {
    id: '4',
    action: 'Corrective Measure Added',
    result: 'success',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    details: 'New corrective measure added under IT Equipment section',
  },
  {
    id: '5',
    action: 'Corrective Measure Completed',
    result: 'success',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    details: 'Corrective measure marked as completed with verification',
  },
  {
    id: '6',
    action: 'Email Sent',
    result: 'success',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    details: 'Notification email sent to CSO regarding inspection status',
  }
];

export const StatusTab = ({ currentActivity, activityLog = sampleActivityLog }: StatusTabProps) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getResultIcon = (result: string) => {
    switch (result.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result.toLowerCase()) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Document') || action.includes('Upload')) {
      return <Upload className="h-4 w-4" />;
    }
    if (action.includes('Email')) {
      return <Mail className="h-4 w-4" />;
    }
    if (action.includes('Corrective')) {
      return <Shield className="h-4 w-4" />;
    }
    if (action.includes('Address') || action.includes('Lookup')) {
      return <Users className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Activity Log</span>
          </CardTitle>
          <CardDescription>
            Real-time tracking of all actions, uploads, and status changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentActivity ? (
            <>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Current Activity</h4>
                <p className="text-sm text-muted-foreground font-mono">{currentActivity}</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Activity History</h4>
                <div className="space-y-3">
                  {activityLog.map((entry) => (
                    <Card key={entry.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                              {getActionIcon(entry.action)}
                              {getResultIcon(entry.result)}
                              <h5 className="font-medium text-foreground">{entry.action}</h5>
                              {getResultBadge(entry.result)}
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{entry.details}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(entry.timestamp)}
                            </p>

                            {entry.files && entry.files.length > 0 && (
                              <div className="space-y-1 mt-3">
                                <p className="text-xs font-medium text-foreground">Files:</p>
                                {entry.files.map((file, index) => (
                                  <div
                                    key={index}
                                    className="inline-flex items-center space-x-1 text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded mr-2"
                                  >
                                    <FileText className="h-3 w-3" />
                                    <span>{file.name} ({file.type})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Open Activity Folder
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Deliverables
                  </Button>
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    SharePoint Site
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Activity Selected</h3>
              <p>Save an activity from the Main tab or load one from Search to view status information.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};