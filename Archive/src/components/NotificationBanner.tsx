import { AlertTriangle, Clock, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { NotificationItem } from '@/hooks/useNotifications';

interface NotificationBannerProps {
  notifications: NotificationItem[];
  onViewActivity?: (activityNumber: string) => void;
}

export const NotificationBanner = ({ notifications, onViewActivity }: NotificationBannerProps) => {
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (notifications.length === 0) return null;

  // Get the most urgent notification
  const urgentNotifications = notifications
    .filter(n => !dismissed.includes(n.id))
    .sort((a, b) => {
      const colorPriority = { red: 0, green: 1, yellow: 2, default: 3 };
      return colorPriority[a.color] - colorPriority[b.color];
    });

  if (urgentNotifications.length === 0) return null;

  const mostUrgent = urgentNotifications[0];
  const additionalCount = urgentNotifications.length - 1;

  const getAlertVariant = (color: string) => {
    if (color === 'red') return 'destructive';
    return 'default';
  };

  const getIcon = (color: string) => {
    if (color === 'red') return AlertCircle;
    if (color === 'green') return Clock;
    return AlertTriangle;
  };

  const Icon = getIcon(mostUrgent.color);

  const getMessage = () => {
    if (mostUrgent.daysRemaining < 0) {
      return `Activity ${mostUrgent.activityNumber} is overdue by ${Math.abs(mostUrgent.daysRemaining)} business days`;
    }
    if (mostUrgent.daysRemaining === 0) {
      return `Activity ${mostUrgent.activityNumber} is due today`;
    }
    if (mostUrgent.daysRemaining <= 10) {
      return `Activity ${mostUrgent.activityNumber} is due in ${mostUrgent.daysRemaining} business days`;
    }
    return `Activity ${mostUrgent.activityNumber} has an upcoming deadline`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'checklist': return 'Checklist';
      case 'doc': return 'DOC';
      case 'corrective_measures': return 'Corrective Measures';
      default: return type;
    }
  };

  return (
    <div className="w-full px-4 pt-4">
      <Alert variant={getAlertVariant(mostUrgent.color)} className="relative">
        <Icon className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between pr-8">
          <span>Deadline Alert</span>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={() => setDismissed([...dismissed, mostUrgent.id])}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="space-y-2">
          <p className="font-medium">{getMessage()}</p>
          <p className="text-sm">
            {getTypeLabel(mostUrgent.deadlineType)} - {mostUrgent.companyName} ({mostUrgent.orgSiteNumber})
          </p>
          {additionalCount > 0 && (
            <p className="text-sm opacity-80">
              + {additionalCount} more deadline{additionalCount > 1 ? 's' : ''} need attention
            </p>
          )}
          {onViewActivity && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewActivity(mostUrgent.activityNumber)}
              className="mt-2"
            >
              View Activity
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};
