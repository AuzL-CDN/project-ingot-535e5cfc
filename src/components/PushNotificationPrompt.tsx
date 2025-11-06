import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const PushNotificationPrompt = () => {
  const { isSupported, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          Push Notifications
        </CardTitle>
        <CardDescription>
          {isSubscribed
            ? 'You are receiving deadline reminder notifications'
            : 'Enable push notifications to receive deadline reminders'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={loading}
          variant={isSubscribed ? 'outline' : 'default'}
        >
          {loading ? 'Processing...' : isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
        </Button>
      </CardContent>
    </Card>
  );
};
