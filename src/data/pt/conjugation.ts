import data from './conjugationData.json';

// ---- types ----

export type Scope = 'all' | 'core' | 'irr' | 'reg';

export interface IrregVerb {
  en: string;
  forms: Record<string, string[]>;
  inf: string;
}

export interface RegVerb {
  en: string;
  inf: string;
  type: 'ar' | 'er' | 'ir';
}

export type Verb = IrregVerb | RegVerb;

export interface TenseMeta {
  def: boolean;
  en: string;
  grp: string;
  key: string;
  pt: string;
}

export interface MissRecord {
  miss: number;
  seen: number;
}

// ---- typed re-exports of JSON ----

export const PRON: string[] = data.PRON;
export const TENSES: TenseMeta[] = data.TENSES as TenseMeta[];
export const HINTS: Record<string, string> = data.HINTS as Record<string, string>;

const STEMENDS = data.STEMENDS as Record<string, Record<string, string[]>>;
const FUT_E: string[] = data.FUT_E;
const COND_E: string[] = data.COND_E;
const IR_PRES: string[] = data.IR_PRES;
const EST_PRES: string[] = data.EST_PRES;

export const IRREG: IrregVerb[] = data.IRREG as IrregVerb[];
export const REG: RegVerb[] = data.REG as RegVerb[];
export const VERBS: Verb[] = (IRREG as Verb[]).concat(REG as Verb[]);
export const CORE: string[] = data.CORE;

export const BY: Record<string, Verb> = {};
VERBS.forEach((v) => {
  BY[v.inf] = v;
});

// ---- pure functions ----

export function scopeVerbs(scope: Scope): string[] {
  if (scope === 'core') return CORE.slice();
  if (scope === 'reg') return REG.map((v) => v.inf);
  if (scope === 'irr') return IRREG.map((v) => v.inf);
  return VERBS.map((v) => v.inf);
}

function regForms(inf: string, type: 'ar' | 'er' | 'ir', tense: string): string[] {
  const stem = inf.slice(0, -2);
  if (tense === 'fut') return FUT_E.map((e) => inf + e);
  if (tense === 'cond') return COND_E.map((e) => inf + e);
  return STEMENDS[type][tense].map((e: string) => stem + e);
}

export function conj(v: Verb, tense: string): string[] {
  if (tense === 'futp') return IR_PRES.map((p) => p + ' ' + v.inf);
  if (tense === 'prog') return EST_PRES.map((p) => p + ' a ' + v.inf);
  const iv = v as IrregVerb;
  if (iv.forms && iv.forms[tense]) return iv.forms[tense];
  const rv = v as RegVerb;
  return regForms(rv.inf, rv.type, tense);
}

export function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.!?,]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function missRate(o: MissRecord | undefined): number {
  return o && o.seen ? o.miss / o.seen : 0;
}

export function wpick<T>(arr: T[], wf: (item: T) => number): T {
  const w = arr.map(wf);
  const tot = w.reduce((a, b) => a + b, 0);
  if (tot <= 0) return arr[Math.floor(Math.random() * arr.length)];
  let r = Math.random() * tot;
  for (let i = 0; i < arr.length; i++) {
    r -= w[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

// ---- progress persistence + mastery ----

/** localStorage key for the conjugation trainer's persisted state. */
export const CONJ_STORAGE_KEY = 'ep-conjugation:v1';

/** A verb counts as mastered once drilled this many times with high accuracy. */
export const CONJ_MASTERY_MIN_SEEN = 4;
export const CONJ_MASTERY_MIN_ACC = 0.85;

interface StoredConj {
  perVerb?: Record<string, MissRecord>;
}

/**
 * Reads the trainer's persisted state and counts verbs the learner has
 * effectively mastered (seen ≥ threshold with ≥85% accuracy). Mirrors the
 * pack-mastery shape consumed by the Portuguese hub.
 */
export function getConjugationMastery(): {mastered: number; total: number} {
  const total = VERBS.length;
  try {
    const raw = localStorage.getItem(CONJ_STORAGE_KEY);
    if (!raw) return {mastered: 0, total};
    const parsed = JSON.parse(raw) as StoredConj;
    const perVerb = parsed.perVerb ?? {};
    const mastered = VERBS.reduce((acc, v) => {
      const rec = perVerb[v.inf];
      if (!rec || rec.seen < CONJ_MASTERY_MIN_SEEN) return acc;
      const accuracy = (rec.seen - rec.miss) / rec.seen;
      return acc + (accuracy >= CONJ_MASTERY_MIN_ACC ? 1 : 0);
    }, 0);
    return {mastered, total};
  } catch {
    return {mastered: 0, total};
  }
}
