/**
 * Every date in the app is shown and typed in India time (Asia/Kolkata, UTC+05:30, no daylight saving), whatever
 * the time zone of the phone or computer. The API wants ISO text with an offset, so we always send "+05:30".
 */
const TZ = 'Asia/Kolkata';
const OFFSET = '+05:30';

const dateTime = new Intl.DateTimeFormat('en-IN', {
  timeZone: TZ,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});
const dateOnly = new Intl.DateTimeFormat('en-IN', {
  timeZone: TZ,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const parts = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** "26 Nov 2026, 1:06 pm" */
export const formatDateTime = (iso: string): string =>
  dateTime.format(new Date(iso)).replace(/\b(am|pm)\b/i, (m) => m.toLowerCase());
/** "26 Nov 2026" */
export const formatDate = (iso: string): string => dateOnly.format(new Date(iso));

const wallClock = (date: Date): Record<string, string> =>
  Object.fromEntries(parts.formatToParts(date).map((p) => [p.type, p.value]));

/** Today in India as "YYYY-MM-DD". */
export const todayYmd = (now: Date = new Date()): string => {
  const w = wallClock(now);
  return `${w.year}-${w.month}-${w.day}`;
};

/** Now in India as "YYYY-MM-DDTHH:mm" (the value of a datetime-local field). */
export const nowForInput = (now: Date = new Date()): string => {
  const w = wallClock(now);
  return `${w.year}-${w.month}-${w.day}T${w.hour}:${w.minute}`;
};

/** An ISO time from the API as "YYYY-MM-DDTHH:mm" in India time, for editing in a datetime-local field. */
export const isoToInput = (iso: string): string => nowForInput(new Date(iso));

/** "YYYY-MM-DDTHH:mm" typed in India time -> ISO text with the offset the API requires. */
export const inputToIso = (value: string): string => `${value}:00${OFFSET}`;

/** First and last moment of an India calendar day, for from/to filters. */
export const dayStartIso = (ymd: string): string => `${ymd}T00:00:00.000${OFFSET}`;
export const dayEndIso = (ymd: string): string => `${ymd}T23:59:59.999${OFFSET}`;
