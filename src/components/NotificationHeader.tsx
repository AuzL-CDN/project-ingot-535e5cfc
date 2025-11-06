import { useState, useEffect } from 'react';
import { Bell, FileCheck, FileText, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications, DeadlineType } from '@/hooks/useNotifications';
import { NotificationDialog } from '@/components/notifications/NotificationDialog';
import { cn } from '@/lib/utils';

interface NotificationHeaderProps {
  onViewActivity?: (activityNumber: string) => void;
}

export const NotificationHeader = ({ onViewActivity }: NotificationHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DeadlineType>('checklist');
  
  const { notifications, counts, getNotificationsByType, getColorForType } = useNotifications();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleIconClick = (type: DeadlineType) => {
    setSelectedType(type);
    setDialogOpen(true);
  };

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-destructive text-destructive-foreground';
      case 'yellow':
        return 'bg-yellow-500 text-white';
      case 'green':
        return 'bg-green-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="text-sm font-medium text-muted-foreground">
          {formatDateTime(currentTime)}
        </div>

        <div className="flex items-center gap-2">
          {/* Checklist Notification */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => handleIconClick('checklist')}
            title="Initial Checklist Deadlines"
          >
            <FileCheck className="h-4 w-4" />
            {counts.checklist > 0 && (
              <Badge
                className={cn(
                  'absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs',
                  getBadgeClasses(getColorForType('checklist'))
                )}
              >
                {counts.checklist}
              </Badge>
            )}
          </Button>

          {/* DoC Notification */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => handleIconClick('doc')}
            title="DoC (19F/19G) Deadlines"
          >
            <FileText className="h-4 w-4" />
            {counts.doc > 0 && (
              <Badge
                className={cn(
                  'absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs',
                  getBadgeClasses(getColorForType('doc'))
                )}
              >
                {counts.doc}
              </Badge>
            )}
          </Button>

          {/* Corrective Measures Notification */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => handleIconClick('corrective_measures')}
            title="Corrective Measures (1F/1G) Deadlines"
          >
            <AlertTriangle className="h-4 w-4" />
            {counts.corrective_measures > 0 && (
              <Badge
                className={cn(
                  'absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs',
                  getBadgeClasses(getColorForType('corrective_measures'))
                )}
              >
                {counts.corrective_measures}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <NotificationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        notifications={getNotificationsByType(selectedType)}
        type={selectedType}
        onViewActivity={onViewActivity}
      />
    </>
  );
};
