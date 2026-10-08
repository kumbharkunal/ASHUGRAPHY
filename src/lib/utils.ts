/** Joins class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** "1" becomes "01". Frame counters and indexes use two digits. */
export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Today in the browser's local time as YYYY-MM-DD, for date input minimums. */
export function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
