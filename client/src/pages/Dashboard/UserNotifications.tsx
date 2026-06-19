import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';

const iconFor = (type: string) => {
  if (type === 'success') return CheckCircle2;
  if (type === 'warning') return Clock;
  return Info;
};

const UserNotifications = () => {
  const { user } = useAuth();
  const { getNotificationsForUser, markNotificationRead } = useData();
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchNotifications = React.useCallback(async () => {
    if (!user) return;
    try {
      const data = await getNotificationsForUser(user.id);
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, getNotificationsForUser]);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Card className="py-12 text-center text-off-white/50">Loading notifications...</Card>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-off-white">Notifications</h1>
        <p className="text-off-white/60">Booking updates from admin approvals</p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="py-12 text-center text-off-white/50">No notifications yet</Card>
        ) : (
          notifications.map(n => {
            const Icon = iconFor(n.type);
            return (
              <Card
                key={n.id}
                className={cn(
                  'flex gap-4 transition-all',
                  !n.isRead && 'border-accent/30 bg-accent/5'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-off-white">{n.title}</h3>
                    {!n.isRead && <Badge variant="accent">New</Badge>}
                  </div>
                  <p className="text-off-white/60">{n.message}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-off-white/40">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                    {n.link && (
                      <Link to={n.link} className="text-sm text-accent hover:underline" onClick={() => handleMarkRead(n.id)}>
                        View booking
                      </Link>
                    )}
                    {!n.isRead && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserNotifications;
