import {useCallback, useEffect, useRef, useState} from 'react';

const SPEECH_PERSIST_KEY = 'ep-speech:v1';

interface SpeechPrefs {
  rate: number;
  voiceURI: string | null;
}

const defaultPrefs: SpeechPrefs = {rate: 1, voiceURI: null};

function loadPrefs(): SpeechPrefs {
  try {
    const raw = localStorage.getItem(SPEECH_PERSIST_KEY);
    if (!raw) return defaultPrefs;
    return {...defaultPrefs, ...(JSON.parse(raw) as Partial<SpeechPrefs>)};
  } catch {
    return defaultPrefs;
  }
}

function savePrefs(prefs: SpeechPrefs): void {
  try {
    localStorage.setItem(SPEECH_PERSIST_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function rankVoice(v: SpeechSynthesisVoice): number {
  const l = (v.lang || '').toLowerCase().replace('_', '-');
  if (l === 'pt-pt') return 0;
  if (l.startsWith('pt-pt')) return 1;
  if (l.startsWith('pt')) return 3;
  return 9;
}

function ptVoices(all: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return all.filter((v) => (v.lang || '').toLowerCase().startsWith('pt')).sort((a, b) => rankVoice(a) - rankVoice(b));
}

function buildNotice(all: SpeechSynthesisVoice[], chosen: SpeechSynthesisVoice | null): string {
  const pt = ptVoices(all);
  const l = chosen ? (chosen.lang || '').toLowerCase().replace('_', '-') : '';
  if (!all.length) return 'No speech voices yet — reload, or use Chrome/Edge/Safari.';
  if (!pt.length)
    return 'No Portuguese voice on this device. Audio will use the wrong accent — confirm forms on Forvo.';
  if (!l.startsWith('pt-pt'))
    return 'Using a non-European Portuguese voice. Vowels and the R will sound off; treat audio as a guide.';
  return '';
}

export interface UseSpeech {
  notice: string;
  rate: number;
  setRate: (r: number) => void;
  setVoiceURI: (uri: string) => void;
  speak: (text: string) => void;
  supported: boolean;
  voiceURI: string | null;
  voices: SpeechSynthesisVoice[];
}

export function useSpeech(): UseSpeech {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [prefs, setPrefs] = useState<SpeechPrefs>(loadPrefs);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [notice, setNotice] = useState<string>('');
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const refreshVoices = useCallback(() => {
    if (!supported) return;
    const all = window.speechSynthesis.getVoices() || [];
    const pt = ptVoices(all);
    const list = pt.length ? pt : all;
    setVoices(list);
    const currentURI = prefsRef.current.voiceURI;
    const chosen = list.find((v) => v.voiceURI === currentURI) || pt[0] || null;
    if (chosen && chosen.voiceURI !== currentURI) {
      const next = {...prefsRef.current, voiceURI: chosen.voiceURI};
      setPrefs(next);
      savePrefs(next);
    }
    setNotice(buildNotice(all, chosen));
  }, [supported]);

  useEffect(() => {
    if (!supported) return;
    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [supported, refreshVoices]);

  const setVoiceURI = useCallback((uri: string) => {
    const all = window.speechSynthesis.getVoices() || [];
    const chosen = all.find((v) => v.voiceURI === uri) || null;
    const next = {...prefsRef.current, voiceURI: uri};
    setPrefs(next);
    savePrefs(next);
    setNotice(buildNotice(all, chosen));
  }, []);

  const setRate = useCallback((r: number) => {
    const next = {...prefsRef.current, rate: r};
    setPrefs(next);
    savePrefs(next);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const all = window.speechSynthesis.getVoices() || [];
      const v = all.find((voice) => voice.voiceURI === prefsRef.current.voiceURI) || null;
      if (v) {
        u.voice = v;
        u.lang = v.lang;
      } else {
        u.lang = 'pt-PT';
      }
      u.rate = prefsRef.current.rate;
      window.speechSynthesis.speak(u);
    },
    [supported],
  );

  return {
    notice,
    rate: prefs.rate,
    setRate,
    setVoiceURI,
    speak,
    supported,
    voiceURI: prefs.voiceURI,
    voices,
  };
}
