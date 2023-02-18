import {Button} from 'components/FormElements';
import {MicIcon} from 'lucide-react';
import React, {FC, useState, useEffect} from 'react';
import {Language} from 'types/db';
import {LanguageNames} from 'utils/constants';
import {useSpeechRecognition} from 'hooks';
import style from './WordContainer.module.scss';

interface WordContainerProps {
  children?: React.ReactNode;
  word: {[key in Language]: string};
  cardType: 'display' | 'input';
  language: Language;
  handleSubmit?: React.FormEventHandler<HTMLFormElement>;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export const WordContainer: FC<WordContainerProps> = ({word, language, cardType, handleSubmit}) => {
  const isInput = cardType === 'input';

  const [speechVal, setSpeechVal] = useState('');
  const processResult = (event: SpeechRecognitionEvent) => {
    const results: SpeechRecognitionResult = Array.from(event.results)[0] as SpeechRecognitionResult;

    setSpeechVal(results[0].transcript);
  };

  const {isListenning, startListenning, stopListenning} = useSpeechRecognition(processResult, language);

  useEffect(() => {
    setSpeechVal('');
  }, [word]);

  const renderWord = () => <div className={style['Word-Container__word']}>{word[language]}</div>;

  const renderInput = () => (
    <form className={style['Word-Container__form']} onSubmit={handleSubmit}>
      <input
        className={style['Word-Container__form__input']}
        name="answer"
        required
        autoComplete="off"
        placeholder={`Translate to ${LanguageNames[language]}`}
        defaultValue={speechVal}
        lang={language}
      />
      <div className={style['Word-Container__form__actions']}>
        <Button type="submit">Submit</Button>
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
  );

  return (
    <div className={style['Word-Container']}>
      <div className={style[`Word-Container__lang`]}>{LanguageNames[language]}</div>
      {isInput ? renderInput() : renderWord()}
    </div>
  );
};
