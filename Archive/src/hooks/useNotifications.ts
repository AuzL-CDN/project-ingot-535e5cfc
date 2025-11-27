import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateBusinessDaysRemaining, getNotificationColor, NotificationColor } from '@/utils/businessDayCalculator';

export type DeadlineType = 'checklist' | 'doc' | 'corrective_measures';

export interface NotificationItem {
  id: string;
  activityId: string;
  activityNumber: string;
  orgSiteNumber: string;
  companyName: string;
  deadlineType: DeadlineType;
  dueDate: Date;
  daysRemaining: number;
  color: NotificationColor;
}

export interface NotificationCounts {
  checklist: number;
  doc: number;
  corrective_measures: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({
    checklist: 0,
    doc: 0,
    corrective_measures: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all active deadlines for the user
      const { data: deadlines, error } = await supabase
        .from('activity_deadlines')
        .select(`
          id,
          deadline_type,
          due_date,
          activity_id,
          activities!inner (
            id,
            activity_number,
            org_site_number,
            company_name,
            is_completed,
            user_id
          )
        `)
        .eq('activities.user_id', user.id)
        .eq('activities.is_completed', false);

      if (error) throw error;

      const notificationItems: NotificationItem[] = (deadlines || [])
        .map(deadline => {
          const activity = (deadline as any).activities;
          const dueDate = new Date(deadline.due_date);
          const daysRemaining = calculateBusinessDaysRemaining(dueDate);
          const color = getNotificationColor(dueDate);

          return {
            id: deadline.id,
            activityId: activity.id,
            activityNumber: activity.activity_number,
            orgSiteNumber: activity.org_site_number,
            companyName: activity.company_name,
            deadlineType: deadline.deadline_type as DeadlineType,
            dueDate,
            daysRemaining,
            color,
          };
        })
        // Filter to show only items that need attention (approaching, due, or overdue)
        .filter(item => item.color !== 'default');

      setNotifications(notificationItems);

      // Calculate counts by type
      const newCounts = notificationItems.reduce(
        (acc, item) => {
          acc[item.deadlineType]++;
          return acc;
        },
        { checklist: 0, doc: 0, corrective_measures: 0 } as NotificationCounts
      );

      setCounts(newCounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('activity_deadlines_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_deadlines',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getNotificationsByType = (type: DeadlineType) => {
    return notifications.filter(n => n.deadlineType === type);
  };

  const getColorForType = (type: DeadlineType): NotificationColor => {
    const typeNotifications = getNotificationsByType(type);
    if (typeNotifications.length === 0) return 'default';

    // Return the most urgent color
    if (typeNotifications.some(n => n.color === 'red')) return 'red';
    if (typeNotifications.some(n => n.color === 'green')) return 'green';
    if (typeNotifications.some(n => n.color === 'yellow')) return 'yellow';
    return 'default';
  };

  return {
    notifications,
    counts,
    loading,
    getNotificationsByType,
    getColorForType,
    refetch: fetchNotifications,
  };
};
