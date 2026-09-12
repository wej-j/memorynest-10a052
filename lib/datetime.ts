import { format, isToday, isYesterday, parse } from 'date-fns';

import type { Moment } from '@/lib/types';

export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function toTimeKey(date: Date): string {
  return format(date, 'HH:mm');
}

export type MomentTimestamp = Pick<Moment, 'date' | 'time'> & Partial<Pick<Moment, 'createdAt'>>;

/** Combines a moment's `date` + `time` into a real Date for sorting/display. */
export function momentDateTime(moment: MomentTimestamp): Date {
  const parsed = parse(`${moment.date} ${moment.time || '12:00'}`, 'yyyy-MM-dd HH:mm', new Date());
  return Number.isNaN(parsed.getTime()) ? new Date(moment.createdAt ?? Date.now()) : parsed;
}

/** "12 September 2026" */
export function formatLongDate(date: Date): string {
  return format(date, 'd MMMM yyyy');
}

/** "Today · 16:40" / "12 September 2026" for cards. */
export function formatCardDate(moment: MomentTimestamp): string {
  const date = momentDateTime(moment);
  if (isToday(date)) return `Today · ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Yesterday · ${format(date, 'HH:mm')}`;
  return formatLongDate(date);
}

/** "Saturday, 12 September 2026 at 16:40" for the detail screen. */
export function formatFullDateTime(moment: MomentTimestamp): string {
  return format(momentDateTime(moment), "EEEE, d MMMM yyyy 'at' HH:mm");
}

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(parse(value, 'yyyy-MM-dd', new Date()).getTime());
}

export function isValidTimeKey(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
