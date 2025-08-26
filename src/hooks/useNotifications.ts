import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'approval_request' | 'status_update' | 'system';
  read: boolean;
  related_application_id: string | null;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // リアルタイム更新を設定
      const subscription = supabase
        .channel('notifications_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            loadNotifications();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) {
        console.error('Failed to mark notification as read:', error);
        return { success: false, error: error.message };
      }

      await loadNotifications();
      return { success: true };
    } catch (err) {
      return { success: false, error: '通知の更新に失敗しました' };
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) {
        console.error('Failed to mark all notifications as read:', error);
        return { success: false, error: error.message };
      }

      await loadNotifications();
      return { success: true };
    } catch (err) {
      return { success: false, error: '通知の更新に失敗しました' };
    }
  };

  const createNotification = async (notificationData: {
    user_id: string;
    title: string;
    message: string;
    type: 'approval_request' | 'status_update' | 'system';
    related_application_id?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (error) {
        console.error('Failed to create notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: '通知の作成に失敗しました' };
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification,
    refetch: loadNotifications
  };
}