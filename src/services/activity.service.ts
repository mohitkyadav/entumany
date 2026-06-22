/**
 * Lightweight, app-wide practice log. Every answer/review across the quiz
 * packs and the Portuguese trainers bumps a per-day counter, which powers the
 * dashboard streak flame and the activity heatmap. Stored as a flat
 * `{ 'YYYY-MM-DD': count }` map so it stays tiny and merge-friendly.
 */

const STORAGE_KEY = 'activityLog';

export type ActivityLog = Record<string, number>;

export interface ActivityDay {
  count: number;
  date: string;
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** Local-time YYYY-MM-DD (deliberately not UTC, so streaks follow the user's day). */
export const ymd = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const load = (): ActivityLog => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ActivityLog;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const save = (log: ActivityLog): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // ignore quota / serialisation errors — activity tracking is best-effort
  }
};

/** Records `count` reviews against today's bucket. */
export const recordActivity = (count = 1): void => {
  if (count <= 0) return;
  const log = load();
  const key = ymd(new Date());
  log[key] = (log[key] ?? 0) + count;
  save(log);
};

export const getActivityLog = (): ActivityLog => load();

/** All-time number of recorded reviews. */
export const getTotalReviews = (): number => Object.values(load()).reduce((acc, n) => acc + n, 0);

/** Number of distinct days with any activity. */
export const getActiveDays = (): number => Object.values(load()).filter((n) => n > 0).length;

/**
 * Consecutive days with activity ending today (or yesterday, as a one-day grace
 * so the streak doesn't read 0 until a full day is missed).
 */
export const getCurrentStreak = (log: ActivityLog = load()): number => {
  const cursor = new Date();
  if (!log[ymd(cursor)]) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while ((log[ymd(cursor)] ?? 0) > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

/**
 * Returns the trailing `weeks` worth of days as week-columns (each column is 7
 * days, Sunday→Saturday) ready to render as a GitHub-style heatmap. The final
 * column ends on the current week.
 */
export const getActivityMatrix = (weeks = 13, log: ActivityLog = load()): ActivityDay[][] => {
  const end = new Date();
  // Walk back to the Sunday that starts the visible window.
  const start = new Date(end);
  start.setDate(start.getDate() - end.getDay() - (weeks - 1) * 7);

  const columns: ActivityDay[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < weeks; w += 1) {
    const col: ActivityDay[] = [];
    for (let d = 0; d < 7; d += 1) {
      const date = ymd(cursor);
      col.push({count: cursor > end ? -1 : log[date] ?? 0, date});
      cursor.setDate(cursor.getDate() + 1);
    }
    columns.push(col);
  }
  return columns;
};
