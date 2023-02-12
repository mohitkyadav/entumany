import clsx from 'clsx';
import {Button} from 'components';
import {WordContainer} from 'components/WordContainer/WordContainer';
import {ArrowLeft} from 'lucide-react';
import React, {FC, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {EntumanyDB} from 'services/db.service';
import {Language} from 'types/db';
import {Word} from '../Playground';
import style from './Game.module.scss';

export interface GameProps {
  getRandomWords(words: Record<string, any>): Word[];
}

const ProgressBar: FC<{current: number; total: number}> = ({current, total}) => {
  return (
    <div className={style.Game__progressBar}>
      Progress: {current} / {total}
    </div>
  );
};

const Game: FC<GameProps> = ({getRandomWords}) => {
  const dbInstance = EntumanyDB.getInstance();
  const allWords = dbInstance.database;
  const navigate = useNavigate();
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
      <ProgressBar current={currentWordIdx + 1} total={gameWords.length} />
      <div className={style.Game__container}>
        <WordContainer word={currentWord} language={srcLang} cardType="display" />
        <WordContainer word={currentWord} language={destLang} cardType="input" handleSubmit={handleSubmit} />
      </div>
      <Button
        leftIcon={<ArrowLeft size={16} />}
        onClick={() => {
          navigate('/');
        }}
        color="secondary"
        className="fs-16"
      >
        <p>Go Back</p>
      </Button>
    </div>
  );
};

export default Game;
