/**
 * Business Day Calculator Utility
 * Handles business day calculations excluding weekends
 */

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

/**
 * Add business days to a date (excluding weekends)
 */
export const addBusinessDays = (startDate: Date, businessDays: number): Date => {
  const result = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < businessDays) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result)) {
      daysAdded++;
    }
  }

  return result;
};

/**
 * Calculate business days between two dates
 */
export const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let businessDays = 0;

  const current = new Date(start);
  while (current <= end) {
    if (!isWeekend(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return businessDays;
};

/**
 * Calculate business days remaining until a deadline
 * Returns negative if overdue
 */
export const calculateBusinessDaysRemaining = (dueDate: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (today > due) {
    // Overdue - return negative business days
    return -calculateBusinessDays(due, today);
  }

  return calculateBusinessDays(today, due);
};

/**
 * Determine notification status based on business days remaining
 */
export type NotificationStatus = 'on_track' | 'approaching' | 'due' | 'overdue';
export type NotificationColor = 'default' | 'yellow' | 'green' | 'red';

export const getNotificationStatus = (dueDate: Date): NotificationStatus => {
  const daysRemaining = calculateBusinessDaysRemaining(dueDate);

  if (daysRemaining < -5) {
    return 'overdue';
  } else if (daysRemaining === 0) {
    return 'due';
  } else if (daysRemaining <= 10 && daysRemaining > 0) {
    return 'approaching';
  }
  return 'on_track';
};

export const getNotificationColor = (dueDate: Date): NotificationColor => {
  const daysRemaining = calculateBusinessDaysRemaining(dueDate);

  if (daysRemaining < -5) {
    return 'red'; // 5+ days overdue
  } else if (daysRemaining === 0) {
    return 'green'; // Due today
  } else if (daysRemaining <= 10 && daysRemaining > 0) {
    return 'yellow'; // 10 days or less remaining
  }
  return 'default'; // On track
};

/**
 * Format days remaining text
 */
export const formatDaysRemaining = (daysRemaining: number): string => {
  if (daysRemaining < 0) {
    return `${Math.abs(daysRemaining)} days overdue`;
  } else if (daysRemaining === 0) {
    return 'Due today';
  } else if (daysRemaining === 1) {
    return '1 day remaining';
  }
  return `${daysRemaining} days remaining`;
};
