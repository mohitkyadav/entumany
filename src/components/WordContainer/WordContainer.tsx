import {Button} from 'components/FormElements';
import React, {FC} from 'react';
import {Language, LanguageNames} from 'types/db';
import style from './WordContainer.module.scss';

interface WordContainerProps {
  children?: React.ReactNode;
  word: {[key in Language]: string};
  cardType: 'display' | 'input';
  language: Language;
  handleSubmit?: React.FormEventHandler<HTMLFormElement>;
}

export const WordContainer: FC<WordContainerProps> = ({word, language, cardType, handleSubmit}) => {
  const isInput = cardType === 'input';

  const renderWord = () => <div className={style['Word-Container__word']}>{word[language]}</div>;
  const renderInput = () => (
    <form className={style['Word-Container__form']} onSubmit={handleSubmit}>
      <input
        className={style['Word-Container__form__input']}
        name="answer"
        required
        autoComplete="off"
        placeholder={`Translate to ${LanguageNames[language]}`}
      />
      <div className={style['Word-Container__form__actions']}>
        <Button type="submit">Submit</Button>
        <Button
          onClick={() => {
            alert('there is no skip, right or wrong, fill the fucking input');
          }}
        >
          Skip
        </Button>
      </div>
    </form>
  );

  return (
    <div className={style['Word-Container']}>
      <div className={style[`Word-Container__lang__${cardType}`]}>{LanguageNames[language]}</div>
      {isInput ? renderInput() : renderWord()}
    </div>
  );
};
