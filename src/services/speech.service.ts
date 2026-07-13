import {Language} from 'types/db';

import {EntumanyDB} from './db.service';

/**
 * BCP-47 locale per app language, used both as the utterance lang and to rank
 * voices. Portuguese deliberately targets European Portuguese, matching the
 * pt-PT focus of the Portuguese trainers.
 */
const SPEECH_LOCALES: Record<Language, string> = {
  [Language.HINDI]: 'hi-IN',
  [Language.ENGLISH]: 'en-US',
  [Language.GERMAN]: 'de-DE',
  [Language.FRENCH]: 'fr-FR',
  [Language.SPANISH]: 'es-ES',
  [Language.ITALIAN]: 'it-IT',
  [Language.JAPANESE]: 'ja-JP',
  [Language.RUSSIAN]: 'ru-RU',
  [Language.POLISH]: 'pl-PL',
  [Language.PORTUGUESE]: 'pt-PT',
};

const normalizeLang = (lang: string): string => (lang || '').toLowerCase().replace('_', '-');

/** Exact-locale voices beat other regional variants of the same language. */
const pickVoice = (locale: string): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices() || [];
  const target = locale.toLowerCase();
  const base = target.split('-')[0];
  return (
    voices.find((v) => normalizeLang(v.lang) === target) ||
    voices.find((v) => normalizeLang(v.lang).startsWith(base)) ||
    null
  );
};

/** Speaks a word aloud in its own language; silently no-ops if unsupported. */
export const speakWord = (text: string, lang: Language): void => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const locale = SPEECH_LOCALES[lang];
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  const voice = pickVoice(locale);
  if (voice) utterance.voice = voice;
  utterance.rate = EntumanyDB.getInstance().appOptions.speechRate;
  window.speechSynthesis.speak(utterance);
};
