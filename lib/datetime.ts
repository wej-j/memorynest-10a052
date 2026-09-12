import { format, isToday, isYesterday, parse } from 'date-fns';
import { de } from 'date-fns/locale';

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

/** "12. September 2026" */
export function formatLongDate(date: Date): string {
  return format(date, 'd. MMMM yyyy', { locale: de });
}

/** "Heute · 16:40" / "12. September 2026" für Karten. */
export function formatCardDate(moment: MomentTimestamp): string {
  const date = momentDateTime(moment);
  if (isToday(date)) return `Heute · ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Gestern · ${format(date, 'HH:mm')}`;
  return formatLongDate(date);
}

/** "Samstag, 12. September 2026 · 16:40" für die Detailseite. */
export function formatFullDateTime(moment: MomentTimestamp): string {
  return format(momentDateTime(moment), "EEEE, d. MMMM yyyy '·' HH:mm", { locale: de });
}

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(parse(value, 'yyyy-MM-dd', new Date()).getTime());
}

export function isValidTimeKey(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
