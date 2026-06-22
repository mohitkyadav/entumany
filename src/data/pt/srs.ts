import {generateUniqueArray} from 'utils/common';
import vocabData from './a1VocabData.json';

// ---- types ----

export interface Card {
  cat: string;
  en: string;
  ipa: string;
  pt: string;
}

export interface CardState {
  box: number;
  due: number;
  lapses: number;
  reps: number;
}

export type Quality = 'again' | 'easy' | 'good' | 'hard';

export interface NewLog {
  count: number;
  date: string;
}

export interface VocabSettings {
  dir: 'audio' | 'produce' | 'recognise';
  goalMin: number;
  mode: 'flip' | 'type';
  newPerDay: number;
}

// ---- re-exports of JSON data ----

export const CAT: Record<string, string> = vocabData.CAT as Record<string, string>;
export const BOX: Record<number, number> = vocabData.BOX as unknown as Record<number, number>;
export const BUILTIN: Card[] = vocabData.BUILTIN as Card[];

export const DAY = 864e5;

// ---- date helpers ----

export function ymd(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function today(): string {
  return ymd(new Date());
}

export function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return ymd(d);
}

// ---- typing helpers ----

export function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.?!,]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function stripArt(s: string): string {
  return s.replace(/^(o|a|os|as)\s+/, '');
}

export function typeTargets(card: Card): Set<string> {
  const set = new Set<string>();
  card.pt
    .split('/')
    .map((p) => p.trim())
    .forEach((p) => {
      const n = norm(p);
      set.add(n);
      set.add(stripArt(n));
    });
  return set;
}

export function checkType(input: string, card: Card): boolean {
  const n = norm(input);
  const t = typeTargets(card);
  return t.has(n) || t.has(stripArt(n));
}

// ---- SRS helpers ----

export function previewDays(box: number, q: Quality): number {
  if (q === 'again') return 0;
  if (q === 'hard') return Math.max(1, Math.round(BOX[Math.max(1, box)] / 2));
  if (q === 'good') return BOX[Math.min(6, box + 1)];
  return BOX[Math.min(6, box + 2)];
}

export function fmtDays(d: number): string {
  if (d < 1) return 'now';
  if (d === 1) return '1d';
  if (d < 30) return d + 'd';
  return Math.round(d / 30) + 'mo';
}

export function dueKeys(cards: Record<string, CardState>, keys: string[]): string[] {
  const now = Date.now();
  return keys.filter((k) => {
    const c = cards[k];
    return c && c.box >= 1 && c.due <= now;
  });
}

export function learnedCount(cards: Record<string, CardState>, keys: string[]): number {
  return keys.filter((k) => {
    const c = cards[k];
    return c && c.box >= 4;
  }).length;
}

export function newAvail(settings: VocabSettings, newLog: NewLog): number {
  const usedToday = newLog.date === today() ? newLog.count : 0;
  return Math.max(0, settings.newPerDay - usedToday);
}

export function shuffle<T>(arr: T[]): T[] {
  const order = generateUniqueArray(arr.length);
  return order.map((i) => arr[i]);
}

export interface SrsQueue {
  done: Set<string>;
  overflow: number;
  planned: number;
  queue: string[];
}

export function buildSrs(cards: Record<string, CardState>, keys: string[], avail: number): SrsQueue {
  const due = shuffle(dueKeys(cards, keys));
  const unseen = shuffle(keys.filter((k) => !cards[k]));
  const news = unseen.slice(0, avail);
  let q = due.concat(news);
  const cap = 40;
  const overflow = Math.max(0, q.length - cap);
  if (overflow) q = q.slice(0, cap);
  return {done: new Set<string>(), overflow, planned: q.length, queue: q};
}

export function seenForExtra(cards: Record<string, CardState>, keys: string[]): string[] {
  const s = keys.filter((k) => cards[k] && cards[k].box >= 1);
  s.sort((a, b) => cards[a].due - cards[b].due);
  return s;
}

export function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
