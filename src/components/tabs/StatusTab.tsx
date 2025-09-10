import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle, XCircle, Clock, ExternalLink, FileText } from 'lucide-react';

interface StatusTabProps {
  currentActivity: string;
}

// Mock data for demonstration
const mockRunHistory = [
  {
    id: '1',
    action: 'Generate Approval Letter',
    result: 'Success',
    timestamp: '2024-01-15T10:30:00Z',
    message: 'DOCX and PDF generated successfully',
    fileLinks: [
      { name: 'Approval_Letter_20241234.docx', path: '/Deliverables/Approval_Letter_20241234.docx' },
      { name: 'Approval_Letter_20241234.pdf', path: '/Deliverables/Approval_Letter_20241234.pdf' }
    ]
  },
  {
    id: '2',
    action: 'Create Activity Folder',
    result: 'Success',
    timestamp: '2024-01-15T10:25:00Z',
    message: 'Activity folder structure created',
    fileLinks: [
      { name: 'Activity Folder', path: '/20241234_(123-00) Example Company/' }
    ]
  },
  {
    id: '3',
    action: 'Generate DoC',
    result: 'Error',
    timestamp: '2024-01-15T09:45:00Z',
    message: 'Missing required field: CSO Name'
  },
  {
    id: '4',
    action: 'Save Activity',
    result: 'Success',
    timestamp: '2024-01-15T09:30:00Z',
    message: 'Activity data saved to SharePoint'
  }
];

export const StatusTab = ({ currentActivity }: StatusTabProps) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getResultIcon = (result: string) => {
    switch (result.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result.toLowerCase()) {
      case 'success':
        return <Badge variant="default" className="bg-success text-success-foreground">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Pending</Badge>;
      default:
        return <Badge variant="outline">{result}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Activity Status</span>
          </CardTitle>
          <CardDescription>
            View run history, generated files, and activity status for the current activity.
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
                <h4 className="font-semibold text-foreground">Run History</h4>
                <div className="space-y-3">
                  {mockRunHistory.map((run) => (
                    <Card key={run.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                              {getResultIcon(run.result)}
                              <h5 className="font-medium text-foreground">{run.action}</h5>
                              {getResultBadge(run.result)}
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{run.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(run.timestamp)}
                            </p>

                            {run.fileLinks && run.fileLinks.length > 0 && (
                              <div className="space-y-1 mt-3">
                                <p className="text-xs font-medium text-foreground">Generated Files:</p>
                                {run.fileLinks.map((file, index) => (
                                  <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1 text-xs text-primary hover:text-primary-hover"
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    <span>{file.name}</span>
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </Button>
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
                    <ExternalLink className="h-4 w-4 mr-2" />
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
                    <ExternalLink className="h-4 w-4 mr-2" />
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