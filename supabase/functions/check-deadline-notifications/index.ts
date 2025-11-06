import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Deadline {
  id: string;
  deadline_type: string;
  due_date: string;
  activity_id: string;
  activities: {
    activity_number: string;
    company_name: string;
    org_site_number: string;
    user_id: string;
  };
}

interface PushSubscription {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Denv.get('SUPABASE_URL') ?? '',
      Denv.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate business days remaining
    const calculateBusinessDays = (dueDate: Date): number => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);

      let count = 0;
      const current = new Date(today);

      if (due < today) {
        while (current > due) {
          current.setDate(current.getDate() - 1);
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count--;
          }
        }
      } else {
        while (current < due) {
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
          }
          current.setDate(current.getDate() + 1);
        }
      }

      return count;
    };

    // Fetch all active deadlines
    const { data: deadlines, error: deadlinesError } = await supabaseClient
      .from('activity_deadlines')
      .select(`
        id,
        deadline_type,
        due_date,
        activity_id,
        activities!inner (
          activity_number,
          company_name,
          org_site_number,
          user_id,
          is_completed
        )
      `)
      .eq('activities.is_completed', false) as { data: Deadline[] | null; error: any };

    if (deadlinesError) throw deadlinesError;

    const notificationsToSend: { userId: string; notification: any }[] = [];

    // Check which deadlines need notifications
    for (const deadline of deadlines || []) {
      const dueDate = new Date(deadline.due_date);
      const daysRemaining = calculateBusinessDays(dueDate);

      let shouldNotify = false;
      let title = '';
      let body = '';
      let requireInteraction = false;

      // Overdue (5 days after due date)
      if (daysRemaining === -5) {
        shouldNotify = true;
        title = '🚨 Deadline Overdue';
        body = `Activity ${deadline.activities.activity_number} is 5 days overdue!`;
        requireInteraction = true;
      }
      // Due today
      else if (daysRemaining === 0) {
        shouldNotify = true;
        title = '⏰ Deadline Due Today';
        body = `Activity ${deadline.activities.activity_number} is due today!`;
        requireInteraction = true;
      }
      // 10 days before due date
      else if (daysRemaining === 10) {
        shouldNotify = true;
        title = '📅 Upcoming Deadline';
        body = `Activity ${deadline.activities.activity_number} is due in 10 business days`;
        requireInteraction = false;
      }

      if (shouldNotify) {
        notificationsToSend.push({
          userId: deadline.activities.user_id,
          notification: {
            title,
            body: `${body} - ${deadline.activities.company_name}`,
            tag: `deadline-${deadline.id}`,
            requireInteraction,
            data: {
              url: '/',
              activityNumber: deadline.activities.activity_number,
              deadlineType: deadline.deadline_type,
            },
          },
        });
      }
    }

    // Fetch push subscriptions and send notifications
    const userIds = [...new Set(notificationsToSend.map(n => n.userId))];
    
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds) as { data: PushSubscription[] | null; error: any };

    if (subsError) throw subsError;

    let sentCount = 0;

    for (const { userId, notification } of notificationsToSend) {
      const userSubscriptions = (subscriptions || []).filter(s => s.user_id === userId);

      for (const subscription of userSubscriptions) {
        try {
          // Send push notification using Web Push
          await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'TTL': '86400',
            },
            body: JSON.stringify(notification),
          });
          sentCount++;
        } catch (error) {
          console.error(`Failed to send notification to ${subscription.endpoint}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Checked ${deadlines?.length || 0} deadlines, sent ${sentCount} notifications`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
