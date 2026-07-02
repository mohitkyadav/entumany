/**
 * Builds a downloadable .ics file with a daily recurring 30-minute practice
 * event. The app is a client-only PWA, so instead of pushing to a calendar
 * API the user imports this once into Google/Apple/any calendar app.
 */

const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Local "floating" timestamp (no timezone) — calendars show it in local time. */
const localStamp = (d: Date): string =>
  `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;

/** Escape RFC 5545 special characters in text values. */
const escapeText = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export const PRACTICE_ICS_FILENAME = 'entumany-daily-practice.ics';

export const buildDailyPracticeIcs = (hour: number, title: string, url: string): string => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0);
  // If today's slot has already passed, the series starts tomorrow.
  if (start <= now) start.setDate(start.getDate() + 1);

  const dtStamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

  return (
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Entumany//Daily Practice//EN',
      'BEGIN:VEVENT',
      'UID:daily-practice@entumany',
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${localStamp(start)}`,
      'DURATION:PT30M',
      'RRULE:FREQ=DAILY',
      `SUMMARY:${escapeText(title)}`,
      `DESCRIPTION:${escapeText(url)}`,
      `URL:${url}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n') + '\r\n'
  );
};
