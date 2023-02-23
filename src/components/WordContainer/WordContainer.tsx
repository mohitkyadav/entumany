import {Button} from 'components/FormElements';
import {useAppContext} from 'contexts/App.context';
import {useSpeechRecognition} from 'hooks';
import {MicIcon} from 'lucide-react';
import React, {FC, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Language} from 'types/db';
import {LanguageNames} from 'utils/constants';
import style from './WordContainer.module.scss';

interface WordContainerProps {
  children?: React.ReactNode;
  word: {[key in Language]: string};
  destLang: Language;
  srcLang: Language;
  handleSubmit?: React.FormEventHandler<HTMLFormElement>;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export const WordContainer: FC<WordContainerProps> = ({word, destLang, srcLang, handleSubmit}) => {
  const [speechVal, setSpeechVal] = useState('');
  const {availableLanguages} = useAppContext();

  const {i18n, t} = useTranslation();

  const processResult = (event: SpeechRecognitionEvent) => {
    const results: SpeechRecognitionResult = Array.from(event.results)[0] as SpeechRecognitionResult;

    setSpeechVal(results[0].transcript);
  };

  const processError = (event: SpeechRecognitionErrorEvent) => {
    alert(`Exception while trying to access your microphone: "${event.error}"`);
  };

  const {isListenning, startListenning, stopListenning} = useSpeechRecognition(processResult, processError, destLang);

  useEffect(() => {
    setSpeechVal('');
  }, [word]);

  const placeholder = availableLanguages.includes(destLang)
    ? i18n.getFixedT(destLang)('translateToText')
    : `Translate to ${LanguageNames[destLang]}`;

  return (
    <div className={style['Word-Container']}>
      <div className={style[`Word-Container__word`]}>{word[srcLang]}</div>
      <form className={style['Word-Container__form']} onSubmit={handleSubmit}>
        <input
          className={style['Word-Container__form__input']}
          name="answer"
          required
          autoComplete="off"
          placeholder={placeholder}
          defaultValue={speechVal}
          lang={destLang}
        />
        <div className={style['Word-Container__form__actions']}>
          <Button type="submit">{t('submit')}</Button>
          <Button
            color={isListenning ? 'tertiary' : 'primary'}
            onClick={() => {
              startListenning();
              setTimeout(() => stopListenning(), 4000);
            }}
          >
            <MicIcon size={14} />
          </Button>
        </div>
      </form>
    </div>
  );
};
