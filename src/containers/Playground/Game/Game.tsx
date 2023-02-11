import clsx from 'clsx';
import React, {FC, FormEvent, useState} from 'react';
import {EntumanyDB} from 'services/db.service';
import {Language, LanguageNames} from 'types/db';
import style from './Game.module.scss';

export interface GameProps {
  getRandomWords(words: Record<string, any>): Record<string, any>[];
}

const Game: FC<GameProps> = ({getRandomWords}) => {
  const dbInstance = EntumanyDB.getInstance();
  const allWords = dbInstance.database;
  const [currentWordIdx, setCurrentWordIdx] = useState(0);

  const gameWords = getRandomWords(allWords);
  const {wordId, ...currentWord} = gameWords[currentWordIdx];
  const [srcLang, destLang] = Object.keys(currentWord) as Language[];

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ansValue = formData.get('answer')?.toString().toLowerCase();
    const isCorrect = ansValue === currentWord[destLang].toLowerCase();

    postSubmitAnimation(isCorrect);
    moveToNextWord();
  };

  const moveToNextWord = () => {
    if (currentWordIdx !== gameWords.length - 1) {
      setCurrentWordIdx((prevIdx) => prevIdx + 1);
    } else {
      console.log('Trigger quiz result UI');
    }
  };

  const postSubmitAnimation = (isCorrect: boolean) => {
    if (isCorrect) {
      console.log('correct ui');
    } else {
      console.log('incorrect ui');
    }
  };

  return (
    <div className={clsx(style.Game, 'animation-scale-up')}>
      <div>
        Progress: {currentWordIdx + 1} / {gameWords.length}
      </div>
      <div className="row">
        <div className="wordcontainer">
          <div className="top-left">{LanguageNames[srcLang]}</div>
          <div>{currentWord[srcLang]}</div>
        </div>
        <form className="wordcontainer" onSubmit={handleSubmit}>
          <div className="top-right">{LanguageNames[destLang]}</div>
          <input name="answer" placeholder={`Translate in ${LanguageNames[destLang]}`} />
          <button type="submit">submit</button>
          <button
            onClick={() => {
              alert('there is no skip, right or wrong, fill the fucking input');
            }}
          >
            skip
          </button>
        </form>
      </div>
    </div>
  );
};

export default Game;
