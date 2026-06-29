import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotif } from '../../context/NotifContext';
import { dateGroupLabel } from '../../utils/formatters';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import NotificationItem from '../../components/NotificationItem';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonNotif } from '../../components/ui/Skeleton';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, fetch, markRead, markAllRead } = useNotif();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    fetch().finally(() => setLoading(false));
  }, [fetch]);

  const handleNotifClick = async (notif) => {
    if (!notif.read) await markRead(notif._id);
    if (notif.relatedRequest) navigate(`/requests/${notif.relatedRequest._id}`);
    else if (notif.relatedGroup) navigate(`/groups/${notif.relatedGroup._id}`);
  };

  // Group notifications by date label
  const grouped = notifications.reduce((acc, n) => {
    const label = dateGroupLabel(n.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(n);
    return acc;
  }, {});

  const groups = ['Today', 'Yesterday', 'Earlier'].filter(g => grouped[g]?.length > 0);

  return (
    <AppShell>
      <TopBar 
        title="Notifications" 
        showBack={false}
        rightSlot={
          unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface text-brand-sub hover:bg-accent rounded-lg text-xs font-semibold transition-colors">
              <CheckCheck size={14} /> Mark all read
            </button>
          )
        }
      />
      
      <div className="page-content px-4 py-4 space-y-6">
        {loading ? (
          <Card className="divide-y divide-accent/60"><SkeletonNotif /><SkeletonNotif /><SkeletonNotif /></Card>
        ) : notifications.length > 0 ? (
          groups.map((group) => (
            <div key={group}>
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2 ml-2">{group}</p>
              <Card className="overflow-hidden border-0 divide-y divide-accent/60">
                {grouped[group].map((notif) => (
                  <NotificationItem key={notif._id} notif={notif} onClick={handleNotifClick} />
                ))}
              </Card>
            </div>
          ))
        ) : (
          <Card className="mt-4">
            <EmptyState icon={Bell} title="All caught up!" subtitle="You have no notifications right now." />
          </Card>
        )}
      </div>
    </AppShell>
  );
};

export default NotificationsPage;
