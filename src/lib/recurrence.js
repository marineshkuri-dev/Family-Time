export const RECURRENCE_LABELS = {
  weekly:       'חוזר כל שבוע',
  twice_weekly: 'חוזר פעמיים בשבוע',
  monthly:      'חוזר כל חודש',
};

/**
 * Returns an array of day-of-month numbers (1-31) on which the given
 * event/task appears in the requested [year, month].
 * Works purely from the stored row — no extra DB rows are created.
 */
export function expandInMonth(item, year, month) {
  const type = item.recurrence_type;

  // Non-recurring: show only on the exact event_date
  if (!type || type === 'none') {
    const d = new Date((item.event_date || item.due_date || '') + 'T12:00:00');
    if (d.getFullYear() === year && d.getMonth() === month) return [d.getDate()];
    return [];
  }

  const endDate     = item.recurrence_end_date
    ? new Date(item.recurrence_end_date + 'T23:59:59')
    : null;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result      = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (endDate && date > endDate) continue;

    if (type === 'monthly') {
      const startDay = new Date((item.event_date || '') + 'T12:00:00').getDate();
      if (day === startDay) result.push(day);
    } else if (type === 'weekly' || type === 'twice_weekly') {
      const weekday = date.getDay(); // 0=Sun … 6=Sat
      // Fall back to the weekday of the first occurrence if no days stored
      const days = item.recurrence_days?.length
        ? item.recurrence_days
        : [new Date((item.event_date || '') + 'T12:00:00').getDay()];
      if (days.includes(weekday)) result.push(day);
    }
  }

  return result;
}

// Returns true if an item is recurring
export function isRecurring(item) {
  return !!item?.recurrence_type && item.recurrence_type !== 'none';
}
