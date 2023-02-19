import {useRef, useEffect, useState} from 'react';
import {Language} from 'types/db';

export const useSpeechRecognition = (
  onResult: (event: SpeechRecognitionEvent) => void,
  onError: (event: SpeechRecognitionErrorEvent) => void,
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
      recognition.current = new window.SpeechRecognition();
    }
  }, []);

  const startListenning = () => {
    if (recognition.current) {
      recognition.current.lang = lang;
      recognition.current.interimResults = interimResults;
      recognition.current.continuous = continuous;
      recognition.current.onresult = onResult;
      recognition.current.onerror = handleError;
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

  const handleError = (event: SpeechRecognitionErrorEvent) => {
    if (recognition.current && event.error === 'not-allowed') {
      recognition.current.onend = () => {};
      setIsListenning(false);
    }
    onError?.(event);
  };

  return {isListenning, startListenning, stopListenning};
};
