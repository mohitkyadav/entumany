import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PageTitle} from 'components';
import {usePersistentState, useSpeech} from 'hooks';
import {BY, CONJ_STORAGE_KEY, HINTS, PRON, TENSES, conj, missRate, norm, scopeVerbs, wpick} from 'data/pt/conjugation';
import type {Scope} from 'data/pt/conjugation';
import './ConjugationTrainer.scss';

interface MissMap {
  miss: number;
  seen: number;
}

interface ConjSettings {
  audio: boolean;
  mode: 'flip' | 'type';
  scope: Scope;
  tenses: string[];
}

interface ConjState {
  best: number;
  correct: number;
  curStreak: number;
  perTense: Record<string, MissMap>;
  perVerb: Record<string, MissMap>;
  seen: number;
  settings: ConjSettings;
}

interface CurItem {
  inf: string;
  person: number;
  tense: string;
}

interface VerdictState {
  kind: 'no' | 'ok' | 'warn';
  text: string;
}

const INITIAL_STATE: ConjState = {
  best: 0,
  correct: 0,
  curStreak: 0,
  perTense: {},
  perVerb: {},
  seen: 0,
  settings: {
    audio: true,
    mode: 'type',
    scope: 'core',
    tenses: TENSES.filter((t) => t.def).map((t) => t.key),
  },
};

function activeTenses(settings: ConjSettings): string[] {
  return TENSES.filter((t) => settings.tenses.includes(t.key)).map((t) => t.key);
}

const ConjugationTrainer: FC = () => {
  const navigate = useNavigate();
  const speech = useSpeech();
  const [state, setState] = usePersistentState<ConjState>(CONJ_STORAGE_KEY, INITIAL_STATE);

  const [cur, setCur] = useState<CurItem | null>(null);
  const [input, setInput] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [showPara, setShowPara] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [verdict, setVerdict] = useState<VerdictState | null>(null);
  const lastKey = useRef('');

  const stateRef = useRef(state);
  stateRef.current = state;

  const nextItem = useCallback(() => {
    const ts = activeTenses(stateRef.current.settings);
    const vs = scopeVerbs(stateRef.current.settings.scope);
    if (!ts.length || !vs.length) {
      setCur(null);
      setRevealed(false);
      return;
    }
    let tense: string;
    let inf: string;
    let person: number;
    let key: string;
    let tries = 0;
    do {
      tense = wpick(ts, (t) => 1 + 3 * missRate(stateRef.current.perTense[t]));
      inf = wpick(vs, (i) => 1 + 3 * missRate(stateRef.current.perVerb[i]));
      person = Math.floor(Math.random() * 5);
      key = inf + '|' + tense + '|' + person;
      tries++;
    } while (key === lastKey.current && tries < 6);
    lastKey.current = key;
    setCur({inf, person, tense});
    setRevealed(false);
    setInput('');
    setVerdict(null);
    setShowPara(false);
  }, []);

  const recordResult = useCallback(
    (ok: boolean) => {
      setState((prev) => {
        const {inf, tense} = cur!;
        const pt = prev.perTense[tense] ?? {miss: 0, seen: 0};
        const pv = prev.perVerb[inf] ?? {miss: 0, seen: 0};
        const newStreak = ok ? prev.curStreak + 1 : 0;
        return {
          ...prev,
          best: ok ? Math.max(prev.best, newStreak) : prev.best,
          correct: prev.correct + (ok ? 1 : 0),
          curStreak: newStreak,
          perTense: {...prev.perTense, [tense]: {miss: pt.miss + (ok ? 0 : 1), seen: pt.seen + 1}},
          perVerb: {...prev.perVerb, [inf]: {miss: pv.miss + (ok ? 0 : 1), seen: pv.seen + 1}},
          seen: prev.seen + 1,
        };
      });
    },
    [cur, setState],
  );

  const doCheck = useCallback(() => {
    if (!cur || revealed) return;
    const ans = conj(BY[cur.inf], cur.tense)[cur.person];
    const val = input.trim();
    const ok = norm(val) === norm(ans);
    const exact = val === ans;
    let kind: 'no' | 'ok' | 'warn';
    let text: string;
    if (ok && exact) {
      kind = 'ok';
      text = '✓ certo';
    } else if (ok) {
      kind = 'warn';
      text = '✓ certo — mind the accents: ' + ans;
    } else {
      kind = 'no';
      text = '✗ ' + (val ? '«' + val + '» → ' : '') + ans;
    }
    setVerdict({kind, text});
    setRevealed(true);
    setShowPara(true);
    if (state.settings.audio) speech.speak(ans);
    recordResult(ok);
  }, [cur, input, revealed, recordResult, speech, state.settings.audio]);

  const doShow = useCallback(() => {
    if (!cur || revealed) return;
    const ans = conj(BY[cur.inf], cur.tense)[cur.person];
    setRevealed(true);
    setShowPara(true);
    if (state.settings.audio) speech.speak(ans);
  }, [cur, revealed, speech, state.settings.audio]);

  const gradeFlip = useCallback(
    (ok: boolean) => {
      recordResult(ok);
      nextItem();
    },
    [recordResult, nextItem],
  );

  const toggleTense = useCallback(
    (key: string) => {
      setState((prev) => {
        const set = new Set(prev.settings.tenses);
        if (set.has(key)) {
          set.delete(key);
        } else {
          set.add(key);
        }
        return {...prev, settings: {...prev.settings, tenses: Array.from(set)}};
      });
      setTimeout(() => {
        const newTenses = activeTenses(stateRef.current.settings);
        if (cur && !newTenses.includes(cur.tense)) {
          nextItem();
        }
      }, 0);
    },
    [setState, cur, nextItem],
  );

  const setScope = useCallback(
    (s: Scope) => {
      setState((prev) => ({...prev, settings: {...prev.settings, scope: s}}));
      setTimeout(() => nextItem(), 0);
    },
    [setState, nextItem],
  );

  const setMode = useCallback(
    (m: 'flip' | 'type') => {
      setState((prev) => ({...prev, settings: {...prev.settings, mode: m}}));
    },
    [setState],
  );

  const setSetting = useCallback(
    <K extends keyof ConjSettings>(key: K, value: ConjSettings[K]) => {
      setState((prev) => ({...prev, settings: {...prev.settings, [key]: value}}));
    },
    [setState],
  );

  const handleReset = useCallback(() => {
    if (!window.confirm('Reset all progress?')) return;
    setState((prev) => ({
      ...prev,
      best: 0,
      correct: 0,
      curStreak: 0,
      perTense: {},
      perVerb: {},
      seen: 0,
    }));
  }, [setState]);

  // Boot: pick first item on mount
  useEffect(() => {
    nextItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard handler — runs without deps to always have fresh closures
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (!cur) return;
      if (!revealed) {
        if (e.key === ' ' && state.settings.mode === 'flip') {
          e.preventDefault();
          doShow();
        }
        return;
      }
      if (state.settings.mode === 'flip') {
        if (e.key === '1') {
          gradeFlip(true);
          return;
        }
        if (e.key === '2') {
          gradeFlip(false);
          return;
        }
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        nextItem();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  return (
    <div className="ep-conj animation-scale-up">
      <PageTitle title="Conjugação" />
      <div className="wrap">
        <div className="backrow">
          <button className="backbtn" onClick={() => navigate('/pt')}>
            ← back
          </button>
        </div>
        <div className="top">
          <div>
            <div className="eyebrow">Conjugation · pt-PT</div>
            <h1>Conjugação</h1>
          </div>
          <div className="readout">
            streak <b>{state.curStreak}</b>
            <span>{state.seen ? Math.round((100 * state.correct) / state.seen) + '% accuracy' : '— accuracy'}</span>
          </div>
        </div>

        {speech.notice && <div className="notice" dangerouslySetInnerHTML={{__html: speech.notice}} />}

        <div className="card">
          {cur ? (
            <>
              <div className="verbline">
                {BY[cur.inf]?.inf} — {BY[cur.inf]?.en}
              </div>
              <div className="verb">{BY[cur.inf]?.inf}</div>
              <div className="ask">
                <div className="person">{PRON[cur.person]}</div>
                <div className="tense">
                  {TENSES.find((t) => t.key === cur.tense)?.pt}
                  <small>{TENSES.find((t) => t.key === cur.tense)?.en}</small>
                </div>
              </div>

              {state.settings.mode === 'type' && (
                <div className="typebox">
                  <input
                    autoCapitalize="off"
                    autoComplete="off"
                    disabled={revealed}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!revealed) {
                          doCheck();
                        } else {
                          nextItem();
                        }
                      }
                    }}
                    placeholder="conjugate…"
                    spellCheck={false}
                    type="text"
                    value={input}
                  />
                  {verdict && <div className={`verdict ${verdict.kind}`}>{verdict.text}</div>}
                </div>
              )}

              {showPara && cur && (
                <div className="para show">
                  {conj(BY[cur.inf], cur.tense).map((form, i) => (
                    <div className={`prow${i === cur.person ? ' hl' : ''}`} key={i} onClick={() => speech.speak(form)}>
                      <span className="pp">{PRON[i]}</span>
                      <span className="pf">{form}</span>
                    </div>
                  ))}
                  {HINTS[cur.tense] && <div className="hint" dangerouslySetInnerHTML={{__html: HINTS[cur.tense]}} />}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="verbline">&nbsp;</div>
              <div className="verb">—</div>
              <div className="ask">
                <div className="person">&nbsp;</div>
                <div className="tense">Pick at least one tense</div>
              </div>
            </>
          )}
        </div>

        <div className="controls">
          {state.settings.mode === 'type' && cur && !revealed && (
            <button className="btn primary" onClick={doCheck}>
              Check
            </button>
          )}
          {state.settings.mode === 'flip' && cur && !revealed && (
            <button className="btn primary" onClick={doShow}>
              Show answer
            </button>
          )}
          {revealed && state.settings.mode === 'type' && (
            <button className="btn primary" onClick={nextItem}>
              Next
            </button>
          )}
          {revealed && state.settings.mode === 'flip' && (
            <div className="grade">
              <button className="miss" onClick={() => gradeFlip(false)}>
                <span className="lbl">Missed it</span>
                <span className="k">key 2</span>
              </button>
              <button className="got" onClick={() => gradeFlip(true)}>
                <span className="lbl">Got it</span>
                <span className="k">key 1</span>
              </button>
            </div>
          )}
        </div>

        <div className="rule" />

        <p className="section-h">Tenses to drill</p>
        <p className="section-sub">Presente &amp; perífrases</p>
        <div className="chips">
          {TENSES.filter((t) => t.grp === 'now').map((t) => (
            <button
              aria-pressed={state.settings.tenses.includes(t.key) ? 'true' : 'false'}
              className="chip"
              key={t.key}
              onClick={() => toggleTense(t.key)}
            >
              {t.pt}
              <small>{t.en}</small>
            </button>
          ))}
        </div>
        <p className="section-sub">Passado &amp; futuro (indicativo)</p>
        <div className="chips">
          {TENSES.filter((t) => t.grp === 'past').map((t) => (
            <button
              aria-pressed={state.settings.tenses.includes(t.key) ? 'true' : 'false'}
              className="chip"
              key={t.key}
              onClick={() => toggleTense(t.key)}
            >
              {t.pt}
              <small>{t.en}</small>
            </button>
          ))}
        </div>
        <p className="section-sub">Conjuntivo</p>
        <div className="chips">
          {TENSES.filter((t) => t.grp === 'conj').map((t) => (
            <button
              aria-pressed={state.settings.tenses.includes(t.key) ? 'true' : 'false'}
              className="chip"
              key={t.key}
              onClick={() => toggleTense(t.key)}
            >
              {t.pt}
              <small>{t.en}</small>
            </button>
          ))}
        </div>

        <div className="settings">
          <div className="grp">
            <span className="glab">verbs</span>
            <div className="seg">
              {(['core', 'reg', 'irr', 'all'] as Scope[]).map((s) => (
                <button
                  aria-pressed={state.settings.scope === s ? 'true' : 'false'}
                  key={s}
                  onClick={() => setScope(s)}
                >
                  {s === 'core' ? 'Core 8' : s === 'reg' ? 'Regular' : s === 'irr' ? 'Irregular' : 'All'}
                </button>
              ))}
            </div>
          </div>
          <div className="grp">
            <span className="glab">mode</span>
            <div className="seg">
              <button aria-pressed={state.settings.mode === 'type' ? 'true' : 'false'} onClick={() => setMode('type')}>
                Type
              </button>
              <button aria-pressed={state.settings.mode === 'flip' ? 'true' : 'false'} onClick={() => setMode('flip')}>
                Flip
              </button>
            </div>
          </div>
          <div className="grp">
            <span className="glab">audio</span>
            <div className="seg">
              <button aria-pressed={state.settings.audio ? 'true' : 'false'} onClick={() => setSetting('audio', true)}>
                on
              </button>
              <button
                aria-pressed={!state.settings.audio ? 'true' : 'false'}
                onClick={() => setSetting('audio', false)}
              >
                off
              </button>
            </div>
          </div>
          <div className="grp">
            <span className="glab">speed</span>
            <div className="seg">
              <button aria-pressed={speech.rate === 0.7 ? 'true' : 'false'} onClick={() => speech.setRate(0.7)}>
                0.7×
              </button>
              <button aria-pressed={speech.rate === 1 ? 'true' : 'false'} onClick={() => speech.setRate(1)}>
                1×
              </button>
            </div>
          </div>
          <div className="grp">
            <span className="glab">voice</span>
            <select onChange={(e) => speech.setVoiceURI(e.target.value)} value={speech.voiceURI || ''}>
              {speech.voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} · {v.lang}
                </option>
              ))}
            </select>
          </div>
          <button className="link" onClick={() => setShowStats((s) => !s)}>
            {showStats ? 'hide progress' : 'show progress'}
          </button>
          <button className="link" onClick={handleReset}>
            reset
          </button>
        </div>

        <div className={`stats${showStats ? ' show' : ''}`}>
          {activeTenses(state.settings).map((k) => {
            const o = state.perTense[k] ?? {miss: 0, seen: 0};
            const pct = o.seen ? Math.round((100 * (o.seen - o.miss)) / o.seen) : 0;
            return (
              <div className="srow" key={k}>
                <span className="skey">{TENSES.find((t) => t.key === k)?.pt}</span>
                <span className="strack">
                  <span className="sfill" style={{width: pct + '%'}} />
                </span>
                <span className="spct">{o.seen ? pct + '% · ' + o.seen : '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConjugationTrainer;
