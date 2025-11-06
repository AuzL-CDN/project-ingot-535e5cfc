import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeadlineType, NotificationItem } from '@/hooks/useNotifications';
import { formatDaysRemaining } from '@/utils/businessDayCalculator';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: NotificationItem[];
  type: DeadlineType;
  onViewActivity?: (activityNumber: string) => void;
}

const getTypeLabel = (type: DeadlineType): string => {
  switch (type) {
    case 'checklist':
      return 'Initial Checklist';
    case 'doc':
      return 'DoC (19F/19G)';
    case 'corrective_measures':
      return 'Corrective Measures (1F/1G)';
  }
};

const getColorBadgeVariant = (color: string) => {
  switch (color) {
    case 'red':
      return 'destructive';
    case 'yellow':
      return 'default';
    case 'green':
      return 'default';
    default:
      return 'secondary';
  }
};

const getColorIcon = (color: string) => {
  switch (color) {
    case 'red':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'yellow':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'green':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

export const NotificationDialog = ({ 
  open, 
  onOpenChange, 
  notifications, 
  type,
  onViewActivity 
}: NotificationDialogProps) => {
  const sortedNotifications = [...notifications].sort((a, b) => {
    // Sort by urgency: red first, then yellow, then green
    const colorOrder = { red: 0, yellow: 1, green: 2, default: 3 };
    return colorOrder[a.color] - colorOrder[b.color];
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTypeLabel(type)} - Deadlines</DialogTitle>
          <DialogDescription>
            Activities requiring attention ({notifications.length})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {sortedNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>All activities are on track!</p>
            </div>
          ) : (
            sortedNotifications.map((notification) => (
              <div
                key={notification.id}
                className="border rounded-lg p-4 space-y-2 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getColorIcon(notification.color)}
                    <div>
                      <p className="font-semibold text-sm">
                        Activity #{notification.activityNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.companyName}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getColorBadgeVariant(notification.color)}>
                    {formatDaysRemaining(notification.daysRemaining)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Org/Site:</span> {notification.orgSiteNumber}
                  </div>
                  {onViewActivity && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewActivity(notification.activityNumber)}
                    >
                      View Activity
                    </Button>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Due: {notification.dueDate.toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
