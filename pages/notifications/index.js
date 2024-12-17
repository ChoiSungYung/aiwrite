import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles!actor_id(full_name),
        work:works(title)
      `)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
  };

  const markAsRead = async (id) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .match({ id });
    
    // UI 업데이트
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      )
    );
  };

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case 'like':
        return `${notification.actor?.full_name || 'Someone'} liked your work "${notification.work?.title}"`;
      case 'comment':
        return `${notification.actor?.full_name || 'Someone'} commented on "${notification.work?.title}"`;
      case 'follow':
        return `${notification.actor?.full_name || 'Someone'} started following your library`;
      default:
        return notification.content;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="space-y-4">
        {notifications.length === 0 && (
          <p className="text-gray-500 text-center py-8">No notifications yet</p>
        )}
        {notifications.map(notification => (
          <Card
            key={notification.id}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              !notification.is_read ? 'bg-blue-50' : 'bg-white'
            }`}
            onClick={() => {
              if (!notification.is_read) {
                markAsRead(notification.id);
              }
              if (notification.link) {
                window.location.href = notification.link;
              }
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-900">{getNotificationContent(notification)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              {!notification.is_read && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  New
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}