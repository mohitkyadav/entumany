import clsx from 'clsx';
import {Button, StepProgressBar} from 'components';
import {WordContainer} from 'components/WordContainer/WordContainer';
import {ArrowLeft} from 'lucide-react';
import React, {FC, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {EntumanyDB} from 'services/db.service';
import {GameAnswer, Language} from 'types/db';
import GameFeedbackModal from '../GameFeedbackModal/GameFeedbackModal';
import {Word} from '../Playground';
import style from './Game.module.scss';

export interface GameProps {
  getRandomWords(words: Record<string, any>): Word[];
}

const Game: FC<GameProps> = ({getRandomWords}) => {
  const dbInstance = EntumanyDB.getInstance();
  const allWords = dbInstance.database;
  const navigate = useNavigate();
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showSubmitFeedback, setShowSubmitFeedback] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<GameAnswer>();

  const gameWords = getRandomWords(allWords);
  const {wordId, ...currentWord} = gameWords[currentWordIdx];
  const [srcLang, destLang] = Object.keys(currentWord) as Language[];

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ansValue = formData.get('answer')?.toString().toLowerCase();
    const isCorrect = ansValue === currentWord[destLang].toLowerCase();

    setAnswerFeedback({
      destLang,
      srcLang,
      wasCorrectlyAnswered: isCorrect,
      wordId,
    });
    setShowSubmitFeedback(true);
    e.currentTarget.reset();
  };

  const moveToNextWord = () => {
    setShowSubmitFeedback(false);
    if (currentWordIdx !== gameWords.length - 1) {
      setCurrentWordIdx((prevIdx) => prevIdx + 1);
    } else {
      console.log('Trigger quiz result UI');
      setIsComplete(true);
    }
  };

  return (
    <div className={clsx(style.Game, 'animation-slide-up')}>
      <Button className={style.Game__back} leftIcon={<ArrowLeft size={16} />} onClick={() => navigate('/')}>
        <p>Go Back</p>
      </Button>
      <StepProgressBar current={currentWordIdx} isComplete={isComplete} total={gameWords.length} />
      <div className={style.Game__container}>
        <WordContainer word={currentWord} language={srcLang} cardType="display" />
        <WordContainer word={currentWord} language={destLang} cardType="input" handleSubmit={handleSubmit} />
      </div>
      <GameFeedbackModal
        showSubmitFeedback={showSubmitFeedback}
        onHide={moveToNextWord}
        answerFeedback={answerFeedback}
      />
    </div>
  );
};

export default Game;
