import {Button} from 'components/FormElements';
import {MicIcon} from 'lucide-react';
import React, {FC, useState} from 'react';
import {Language} from 'types/db';
import {LanguageNames} from 'utils/constants';
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

  const processResult = (event: any) => {
    const results: SpeechRecognitionResult = Array.from(event.results)[0] as SpeechRecognitionResult;

    setSpeechVal(results[0].transcript);
  };

  const renderWord = () => <div className={style['Word-Container__word']}>{word[language]}</div>;

  const renderInput = () => (
    <form className={style['Word-Container__form']} onSubmit={handleSubmit}>
      <input
        className={style['Word-Container__form__input']}
        name="answer"
        required
        autoComplete="off"
        placeholder={`Translate to ${LanguageNames[language]}`}
        value={speechVal}
        lang={language}
      />
      <div className={style['Word-Container__form__actions']}>
        <Button type="submit">Submit</Button>
        <Button
          onClick={() => {
            alert('there is no skip, right or wrong, fill the fucking input');
            const recognition = new window.webkitSpeechRecognition();
            recognition.lang = language;
            recognition.interimResults = true;
            recognition.continuous = true;
            recognition.onresult = processResult;
            recognition.start();

            setTimeout(() => recognition.stop(), 5000);
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
