import {useRef, useEffect, useState} from 'react';
import {Language} from 'types/db';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechRecognition = (
  onResult: (event: SpeechRecognitionEvent) => void,
  lang = Language.ENGLISH,
  interimResults = true,
  continuous = true,
) => {
  const recognition = useRef<SpeechRecognition | null>(null);
  const [isListenning, setIsListenning] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (window.SpeechRecognition) {
      recognition.current = new window.webkitSpeechRecognition();
    }
  }, []);

  const startListenning = () => {
    if (recognition.current) {
      recognition.current.lang = lang;
      recognition.current.interimResults = interimResults;
      recognition.current.continuous = continuous;
      recognition.current.onresult = onResult;
      recognition.current.start();
      setIsListenning(true);
    }
  };

  const stopListenning = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsListenning(false);
    }
  };

  return {isListenning, startListenning, stopListenning};
};
