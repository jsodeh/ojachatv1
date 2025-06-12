import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';

export function NotificationOptIn() {
  const { isSubscribed, subscribe, unsubscribe } = useNotification();

  return (
    <Button
      onClick={isSubscribed ? unsubscribe : subscribe}
      variant={isSubscribed ? "outline" : "default"}
      className="flex items-center gap-2"
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4" />
          <span>Disable Notifications</span>
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          <span>Enable Notifications</span>
        </>
      )}
    </Button>
  );
} 