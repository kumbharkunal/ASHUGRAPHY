/**
 * Calendar maths on plain YYYY-MM-DD strings in local time (no time zones, no library). Strings in
 * this form sort in date order, so comparisons are plain string comparisons.
 */

const LOCALE = "en-IN";

const fieldFormat = new Intl.DateTimeFormat(LOCALE, { weekday: "short", day: "numeric", month: "long", year: "numeric" });
const fullFormat = new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const monthFormat = new Intl.DateTimeFormat(LOCALE, { month: "long" });
const monthShortFormat = new Intl.DateTimeFormat(LOCALE, { month: "short" });
const weekdayShortFormat = new Intl.DateTimeFormat(LOCALE, { weekday: "short" });
const weekdayLongFormat = new Intl.DateTimeFormat(LOCALE, { weekday: "long" });

/** Weeks start on Sunday, as Indian calendars do. 1 January 2023 was a Sunday. */
const WEEK = Array.from({ length: 7 }, (_, index) => new Date(2023, 0, 1 + index));

export const weekdays = WEEK.map((day) => ({
  short: weekdayShortFormat.format(day).slice(0, 2),
  long: weekdayLongFormat.format(day),
}));

export const monthNames = Array.from({ length: 12 }, (_, month) => ({
  long: monthFormat.format(new Date(2023, month, 1)),
  short: monthShortFormat.format(new Date(2023, month, 1)),
}));

function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fromDate(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isoDate(year: number, month: number, day: number): string {
  return fromDate(new Date(year, month, day));
}

export function yearOf(iso: string): number {
  return Number(iso.slice(0, 4));
}

/** Month index, 0 for January. */
export function monthOf(iso: string): number {
  return Number(iso.slice(5, 7)) - 1;
}

export function dayOf(iso: string): number {
  return Number(iso.slice(8, 10));
}

/** "2027-02" for any day in February 2027. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** 0 for Sunday. */
export function weekdayOf(iso: string): number {
  return toDate(iso).getDay();
}

export function addDays(iso: string, days: number): string {
  const date = toDate(iso);
  date.setDate(date.getDate() + days);
  return fromDate(date);
}

/** Same day of the month, kept inside shorter months (31 January plus one month is 28 February). */
export function addMonths(iso: string, months: number): string {
  const target = new Date(yearOf(iso), monthOf(iso) + months, 1);
  const day = Math.min(dayOf(iso), daysInMonth(target.getFullYear(), target.getMonth()));
  return isoDate(target.getFullYear(), target.getMonth(), day);
}

export function clampDate(iso: string, min: string, max: string): string {
  if (iso < min) return min;
  if (iso > max) return max;
  return iso;
}

/** "Sun, 14 February 2027", as the date field shows it. */
export function formatFieldDate(iso: string): string {
  return fieldFormat.format(toDate(iso));
}

/** "Sunday, 14 February 2027", for screen readers. */
export function formatFullDate(iso: string): string {
  return fullFormat.format(toDate(iso));
}
