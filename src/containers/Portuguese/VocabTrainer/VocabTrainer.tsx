import React, {FC, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PageTitle} from 'components';
import {usePersistentState, useSpeech} from 'hooks';
import {
  BUILTIN,
  BOX,
  CAT,
  DAY,
  Card,
  CardState,
  Quality,
  VocabSettings,
  buildSrs,
  checkType,
  dueKeys,
  fmtDays,
  fmtTime,
  learnedCount,
  newAvail,
  previewDays,
  seenForExtra,
  today,
  yesterday,
} from 'data/pt/srs';
import './VocabTrainer.scss';

interface NewLog {
  count: number;
  date: string;
}

interface VocabState {
  cards: Record<string, CardState>;
  custom: Card[];
  lastStudy: string;
  newLog: NewLog;
  settings: VocabSettings;
  streakDays: number;
  totalReviews: number;
}

const INITIAL_VOCAB_STATE: VocabState = {
  cards: {},
  custom: [],
  lastStudy: '',
  newLog: {count: 0, date: ''},
  settings: {dir: 'recognise', goalMin: 20, mode: 'flip', newPerDay: 12},
  streakDays: 0,
  totalReviews: 0,
};

interface Session {
  done: Set<string>;
  mode: 'extra' | 'srs';
  overflow: number;
  planned: number;
  queue: string[];
  reviewed: number;
  startedAt: number;
}

function promptKind(settings: VocabSettings): 'audio' | 'text-en' | 'text-pt' {
  if (settings.mode === 'type') return settings.dir === 'audio' ? 'audio' : 'text-en';
  if (settings.dir === 'audio') return 'audio';
  return settings.dir === 'recognise' ? 'text-pt' : 'text-en';
}

function sayText(card: Card): string {
  return card.pt
    .replace(/\s*\/\s*/g, ', ')
    .replace(/…/g, '')
    .replace(/\(([^)]*)\)/g, '$1')
    .trim();
}

const VocabTrainer: FC = () => {
  const navigate = useNavigate();
  const speech = useSpeech();
  const [state, setState] = usePersistentState<VocabState>('ep-a1-vocab:v2', INITIAL_VOCAB_STATE);

  // derived deck
  const deckAll = useMemo(() => BUILTIN.concat(state.custom), [state.custom]);
  const byKey = useMemo(() => {
    const m: Record<string, Card> = {};
    deckAll.forEach((c) => {
      m[c.pt] = c;
    });
    return m;
  }, [deckAll]);
  const keys = useMemo(() => deckAll.map((c) => c.pt), [deckAll]);

  // session stored in a ref (mutated imperatively), bump forces re-render
  const sessionRef = useRef<Session | null>(null);
  const [, bump] = useReducer((n: number) => n + 1, 0);

  // UI state
  const [view, setView] = useState<'card' | 'cont' | 'panel'>('panel');
  const [panelMsg, setPanelMsg] = useState('Ready when you are');
  const [contMsg, setContMsg] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [typeInput, setTypeInput] = useState('');
  const [typeVerdict, setTypeVerdict] = useState<{ok: boolean; shown: boolean}>({ok: false, shown: false});
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  // add-words form
  const [showAdd, setShowAdd] = useState(false);
  const [addPt, setAddPt] = useState('');
  const [addEn, setAddEn] = useState('');
  const [addIpa, setAddIpa] = useState('');
  const [addCat, setAddCat] = useState('X');
  const [addMsg, setAddMsg] = useState('');

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  };

  const startTimer = () => {
    stopTimer();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1000);
    }, 1000);
  };

  // cleanup on unmount
  useEffect(() => () => stopTimer(), []);

  const showCard = () => {
    setRevealed(false);
    setTypeInput('');
    setTypeVerdict({ok: false, shown: false});
    const sess = sessionRef.current;
    if (!sess || !sess.queue.length) return;
    const card = byKey[sess.queue[0]];
    if (!card) {
      advanceQueue();
      return;
    }
    const kind = promptKind(state.settings);
    if (kind === 'audio' || kind === 'text-pt') {
      speech.speak(sayText(card));
    }
  };

  const finishSrs = () => {
    stopTimer();
    setState((s) => {
      const t = today();
      const streakDays = s.lastStudy !== t ? (s.lastStudy === yesterday() ? s.streakDays + 1 : 1) : s.streakDays;
      return {...s, lastStudy: t, streakDays};
    });
    const sess = sessionRef.current!;
    const currentElapsed = elapsedRef.current;
    const msg =
      (currentElapsed >= state.settings.goalMin * 60000 ? 'Goal reached — ' : 'Reviews done — ') +
      sess.reviewed +
      ' cards · ' +
      fmtTime(currentElapsed);
    setContMsg(msg);
    setView('cont');
    bump();
  };

  const leaveSession = () => {
    stopTimer();
    const sess = sessionRef.current;
    const currentElapsed = elapsedRef.current;
    const msg = sess ? 'Session done — ' + sess.reviewed + ' reviewed · ' + fmtTime(currentElapsed) : '';
    sessionRef.current = null;
    setView('panel');
    setPanelMsg(msg || 'Ready when you are');
    bump();
  };

  const advanceQueue = () => {
    const sess = sessionRef.current;
    if (!sess) return;
    sess.queue.shift();
    if (!sess.queue.length) {
      if (sess.mode === 'srs') finishSrs();
      else leaveSession();
    } else {
      showCard();
    }
    bump();
  };

  const startExtra = (sess?: Session) => {
    const base = sess ?? sessionRef.current;
    if (!base) return;
    const seen = seenForExtra(state.cards, keys);
    const q2 = seen.length ? seen : keys.filter((k) => state.cards[k]);
    if (!q2.length) {
      leaveSession();
      return;
    }
    sessionRef.current = {...base, mode: 'extra', queue: q2};
    setView('card');
    setRevealed(false);
    setTypeInput('');
    setTypeVerdict({ok: false, shown: false});
    if (!timerRef.current) startTimer();
    bump();
  };

  const startSession = () => {
    const avail = newAvail(state.settings, state.newLog);
    const q = buildSrs(state.cards, keys, avail);
    if (q.planned === 0) {
      const seen = seenForExtra(state.cards, keys);
      if (seen.length) {
        startExtra({
          done: q.done,
          mode: 'extra',
          overflow: 0,
          planned: 0,
          queue: seen,
          reviewed: 0,
          startedAt: Date.now(),
        });
        return;
      }
      setView('panel');
      setPanelMsg("Nothing due, and today's new-card limit is used up.");
      return;
    }
    sessionRef.current = {
      done: q.done,
      mode: 'srs',
      overflow: q.overflow,
      planned: q.planned,
      queue: q.queue,
      reviewed: 0,
      startedAt: Date.now(),
    };
    setView('card');
    setRevealed(false);
    setTypeInput('');
    setTypeVerdict({ok: false, shown: false});
    startTimer();
    bump();
  };

  const reveal = (typedOk?: boolean) => {
    setRevealed(true);
    if (typedOk !== undefined) setTypeVerdict({ok: typedOk, shown: true});
    const sess = sessionRef.current;
    if (!sess || !sess.queue.length) return;
    const card = byKey[sess.queue[0]];
    if (card) speech.speak(sayText(card));
  };

  const doCheck = () => {
    const sess = sessionRef.current;
    if (!sess || !sess.queue.length) return;
    const card = byKey[sess.queue[0]];
    if (!card) return;
    const ok = checkType(typeInput, card);
    reveal(ok);
  };

  const grade = (q: Quality) => {
    const sess = sessionRef.current;
    if (!sess || !sess.queue.length) return;
    const k = sess.queue[0];
    const wasNew = !state.cards[k];
    const prev = state.cards[k] ?? {box: 1, due: 0, lapses: 0, reps: 0};
    const b = prev.box;
    let nb: number;
    let days: number;
    if (q === 'again') {
      nb = 1;
      days = 0;
    } else if (q === 'hard') {
      nb = Math.max(1, b);
      days = Math.max(1, Math.round(BOX[nb] / 2));
    } else if (q === 'good') {
      nb = Math.min(6, b + 1);
      days = BOX[nb];
    } else {
      nb = Math.min(6, b + 2);
      days = BOX[nb];
    }

    const newCard: CardState = {
      box: nb,
      due: Date.now() + days * DAY,
      lapses: q === 'again' ? prev.lapses + 1 : prev.lapses,
      reps: prev.reps + 1,
    };

    setState((s) => {
      const newLog = wasNew
        ? s.newLog.date === today()
          ? {count: s.newLog.count + 1, date: s.newLog.date}
          : {count: 1, date: today()}
        : s.newLog;
      return {
        ...s,
        cards: {...s.cards, [k]: newCard},
        newLog,
        totalReviews: s.totalReviews + 1,
      };
    });

    sess.reviewed++;
    sess.queue.shift();
    if (q === 'again') sess.queue.splice(Math.min(4, sess.queue.length), 0, k);
    else sess.done.add(k);

    if (sess.queue.length === 0) {
      finishSrs();
    } else {
      setRevealed(false);
      setTypeInput('');
      setTypeVerdict({ok: false, shown: false});
      showCard();
      bump();
    }
  };

  const nextExtra = () => {
    const sess = sessionRef.current;
    if (!sess) return;
    const k = sess.queue.shift()!;
    sess.queue.push(k);
    if (!sess.queue.length) {
      leaveSession();
      return;
    }
    setRevealed(false);
    setTypeInput('');
    setTypeVerdict({ok: false, shown: false});
    showCard();
    bump();
  };

  // derived display values
  const due = dueKeys(state.cards, keys).length;
  const avail = newAvail(state.settings, state.newLog);
  const learned = learnedCount(state.cards, keys);
  const sess = sessionRef.current;
  const progress = sess
    ? sess.mode === 'srs'
      ? sess.planned
        ? Math.round((100 * sess.done.size) / sess.planned)
        : 0
      : 0
    : 0;
  const progressCount = sess ? (sess.mode === 'srs' ? sess.done.size + '/' + sess.planned : 'extra') : '0/0';
  const goalMs = state.settings.goalMin * 60000;
  const timerReached = elapsed >= goalMs;
  const timerText = fmtTime(elapsed) + ' / ' + state.settings.goalMin + ':00';
  const currentCard = sess && sess.queue.length ? byKey[sess.queue[0]] : null;
  const kind = promptKind(state.settings);

  // interval previews for grade buttons
  const cardBox = currentCard && state.cards[currentCard.pt] ? state.cards[currentCard.pt].box : 1;
  const intervals: Record<Quality, string> = {
    again: fmtDays(previewDays(cardBox, 'again')),
    easy: fmtDays(previewDays(cardBox, 'easy')),
    good: fmtDays(previewDays(cardBox, 'good')),
    hard: fmtDays(previewDays(cardBox, 'hard')),
  };

  const setSetting = <K extends keyof VocabSettings>(key: K, value: VocabSettings[K]) => {
    setState((s) => ({...s, settings: {...s.settings, [key]: value}}));
  };

  const handleAddCard = () => {
    if (!addPt.trim() || !addEn.trim()) {
      setAddMsg('Need Portuguese + English');
      return;
    }
    if (byKey[addPt.trim()]) {
      setAddMsg('Already in the deck');
      return;
    }
    const newCard: Card = {cat: addCat, en: addEn.trim(), ipa: addIpa.trim(), pt: addPt.trim()};
    setState((s) => ({...s, custom: [...s.custom, newCard]}));
    setAddPt('');
    setAddEn('');
    setAddIpa('');
    setAddMsg('Added — it will appear as a new card');
  };

  const handleDeleteCustom = (pt: string) => {
    setState((s) => ({
      ...s,
      cards: Object.fromEntries(Object.entries(s.cards).filter(([k]) => k !== pt)),
      custom: s.custom.filter((c) => c.pt !== pt),
    }));
  };

  const handleReset = () => {
    if (typeof confirm === 'function' && !confirm('Reset all progress? (custom words are kept)')) return;
    setState((s) => ({
      ...s,
      cards: {},
      lastStudy: '',
      newLog: {count: 0, date: ''},
      streakDays: 0,
      totalReviews: 0,
    }));
    if (view === 'card') leaveSession();
    else {
      setPanelMsg('Progress cleared');
      setView('panel');
    }
  };

  // keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const inSess = view === 'card';
      if (!inSess) {
        if (e.key === ' ') {
          e.preventDefault();
          if (view === 'panel') startSession();
          else if (view === 'cont') startExtra();
        }
        return;
      }
      if (!revealed) {
        if (e.key === ' ' && state.settings.mode === 'flip') {
          e.preventDefault();
          reveal();
        }
        return;
      }
      if (sess?.mode === 'extra') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          nextExtra();
        }
        return;
      }
      if (e.key === '1') grade('again');
      else if (e.key === '2') grade('hard');
      else if (e.key === '3') grade('good');
      else if (e.key === '4') grade('easy');
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  return (
    <div className="ep-vocab">
      <PageTitle title="Baralho A1" />
      <div className="wrap">
        {/* back button */}
        <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '8px'}}>
          <button
            className="btn"
            onClick={() => navigate('/pt')}
            style={{fontFamily: 'var(--mono)', fontSize: '12px', padding: '6px 12px'}}
          >
            ← back
          </button>
        </div>

        <div className="top">
          <div>
            <div className="eyebrow">Vocabulary · A1–A2 · pt-PT</div>
            <h1>Baralho A1</h1>
          </div>
          <div className="readout">
            day streak <b>{state.streakDays}</b>
            <span>{learnedCount(state.cards, keys)} learned</span>
          </div>
        </div>

        {speech.notice && <div className="notice">{speech.notice}</div>}

        {/* session progress bar */}
        {view === 'card' && (
          <div>
            <div className="progress">
              <div className="ptrack">
                <div className="pfill" style={{width: progress + '%'}} />
              </div>
              <div className="pcount">{progressCount}</div>
            </div>
            <div className="barrow">
              <span className={`timer${timerReached ? ' reached' : ''}`}>{timerText}</span>
              <button className="endlink" onClick={leaveSession}>
                end session
              </button>
            </div>
          </div>
        )}

        {/* panel: start / summary */}
        {view === 'panel' && (
          <div className="panel">
            <h2>{panelMsg}</h2>
            <div className="tally">
              <div className="due">
                <span className="n">{due}</span>
                <span className="k">due</span>
              </div>
              <div className="new">
                <span className="n">{avail}</span>
                <span className="k">new today</span>
              </div>
              <div>
                <span className="n">{deckAll.length}</span>
                <span className="k">in deck</span>
              </div>
            </div>
            <button className="btn primary" onClick={startSession}>
              {due || avail || learned ? 'Begin session' : 'Add words to start'}
            </button>
          </div>
        )}

        {/* card area */}
        {view === 'card' && currentCard && (
          <div>
            <div className="card">
              <div className="cat">{revealed ? CAT[currentCard.cat] || currentCard.cat : ' '}</div>
              {kind === 'audio' ? (
                <>
                  <div className="listen-cue">listen</div>
                  <button className="play-btn" onClick={() => speech.speak(sayText(currentCard))}>
                    🔊
                  </button>
                </>
              ) : (
                <>
                  <div className="term">{kind === 'text-pt' ? currentCard.pt : currentCard.en}</div>
                  {kind === 'text-pt' && (
                    <button className="play-btn" onClick={() => speech.speak(sayText(currentCard))}>
                      🔊
                    </button>
                  )}
                </>
              )}
              {state.settings.mode === 'type' && !revealed && (
                <div className="typebox">
                  <input
                    autoCapitalize="off"
                    autoComplete="off"
                    onChange={(e) => setTypeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!revealed) doCheck();
                      }
                    }}
                    placeholder="type in Portuguese…"
                    spellCheck={false}
                    type="text"
                    value={typeInput}
                  />
                </div>
              )}
              {typeVerdict.shown && (
                <div className={`verdict ${typeVerdict.ok ? 'ok' : 'no'}`}>
                  {typeVerdict.ok ? '✓ certo' : '✗ — você escreveu: ' + (typeInput || '—')}
                </div>
              )}
              {revealed && (
                <div className="answer show">
                  <div className="term">{currentCard.pt}</div>
                  {currentCard.ipa && <div className="ipa">/{currentCard.ipa}/</div>}
                  <div className="gloss">= {currentCard.en}</div>
                  <button className="play-btn" onClick={() => speech.speak(sayText(currentCard))}>
                    🔊
                  </button>
                </div>
              )}
            </div>
            <div className="controls">
              {!revealed && state.settings.mode === 'flip' && (
                <button className="btn primary" onClick={() => reveal()}>
                  Show answer
                </button>
              )}
              {!revealed && state.settings.mode === 'type' && (
                <>
                  <button className="btn primary" onClick={doCheck}>
                    Check
                  </button>
                  <button className="miniskip" onClick={() => reveal()}>
                    skip — just show me
                  </button>
                </>
              )}
              {revealed && sess?.mode === 'extra' && (
                <button className="btn primary" onClick={nextExtra}>
                  Next
                </button>
              )}
              {revealed && sess?.mode === 'srs' && (
                <div className="grade">
                  <button className="again" onClick={() => grade('again')}>
                    <span className="lbl">Again</span>
                    <span className="iv">{intervals.again}</span>
                  </button>
                  <button className="hard" onClick={() => grade('hard')}>
                    <span className="lbl">Hard</span>
                    <span className="iv">{intervals.hard}</span>
                  </button>
                  <button className="good" onClick={() => grade('good')}>
                    <span className="lbl">Good</span>
                    <span className="iv">{intervals.good}</span>
                  </button>
                  <button className="easy" onClick={() => grade('easy')}>
                    <span className="lbl">Easy</span>
                    <span className="iv">{intervals.easy}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* continue panel */}
        {view === 'cont' && (
          <div className="panel">
            <h2>{contMsg}</h2>
            <button className="btn primary" onClick={() => startExtra()} style={{marginBottom: '10px'}}>
              Keep practising
            </button>
            <button className="btn" onClick={leaveSession} style={{width: '100%'}}>
              Finish
            </button>
          </div>
        )}

        <div className="rule" />

        {/* settings */}
        <div className="settings">
          <div className="grp">
            <span className="glab">mode</span>
            <div className="seg">
              <button
                aria-pressed={state.settings.mode === 'flip' ? 'true' : 'false'}
                onClick={() => setSetting('mode', 'flip')}
              >
                Flip
              </button>
              <button
                aria-pressed={state.settings.mode === 'type' ? 'true' : 'false'}
                onClick={() => setSetting('mode', 'type')}
              >
                Type
              </button>
            </div>
          </div>
          <div className="grp">
            <span className="glab">prompt</span>
            <div className="seg">
              <button
                aria-pressed={state.settings.dir === 'recognise' ? 'true' : 'false'}
                disabled={state.settings.mode === 'type' && state.settings.dir !== 'audio'}
                onClick={() => setSetting('dir', 'recognise')}
              >
                PT→EN
              </button>
              <button
                aria-pressed={state.settings.dir === 'produce' ? 'true' : 'false'}
                disabled={state.settings.mode === 'type' && state.settings.dir !== 'audio'}
                onClick={() => setSetting('dir', 'produce')}
              >
                EN→PT
              </button>
              <button
                aria-pressed={state.settings.dir === 'audio' ? 'true' : 'false'}
                onClick={() => setSetting('dir', 'audio')}
              >
                🔊 audio
              </button>
            </div>
          </div>
          <div className="grp">
            <span className="glab">new/day</span>
            <div className="seg">
              {([8, 12, 20] as const).map((n) => (
                <button
                  aria-pressed={state.settings.newPerDay === n ? 'true' : 'false'}
                  key={n}
                  onClick={() => setSetting('newPerDay', n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="grp">
            <span className="glab">goal</span>
            <div className="seg">
              {([15, 20, 30] as const).map((g) => (
                <button
                  aria-pressed={state.settings.goalMin === g ? 'true' : 'false'}
                  key={g}
                  onClick={() => setSetting('goalMin', g)}
                >
                  {g}m
                </button>
              ))}
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
          <button className="link" onClick={() => setShowAdd((s) => !s)}>
            + add words ({state.custom.length} custom)
          </button>
          <button className="link" onClick={handleReset}>
            reset progress
          </button>
        </div>

        {/* add words box */}
        <div className={`addbox${showAdd ? ' show' : ''}`}>
          <div className="addgrid">
            <div className="full">
              <label>Portuguese</label>
              <input onChange={(e) => setAddPt(e.target.value)} placeholder="o comboio" type="text" value={addPt} />
            </div>
            <div className="full">
              <label>English</label>
              <input onChange={(e) => setAddEn(e.target.value)} placeholder="train" type="text" value={addEn} />
            </div>
            <div>
              <label>IPA (optional)</label>
              <input onChange={(e) => setAddIpa(e.target.value)} placeholder="kõˈboju" type="text" value={addIpa} />
            </div>
            <div>
              <label>Category</label>
              <select onChange={(e) => setAddCat(e.target.value)} value={addCat}>
                {Object.entries(CAT).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="addrow">
            <button className="btn primary" onClick={handleAddCard} style={{width: 'auto'}}>
              Add card
            </button>
            {addMsg && <span className="verdict">{addMsg}</span>}
          </div>
          <div className="customlist">
            {[...state.custom].reverse().map((c) => (
              <div className="crow" key={c.pt}>
                <span>
                  {c.pt} — {c.en}
                </span>
                <button className="x" onClick={() => handleDeleteCustom(c.pt)} title="delete">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabTrainer;
