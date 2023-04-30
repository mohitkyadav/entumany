import clsx from 'clsx';
import {Button, StepProgressBar} from 'components';
import {XCircleIcon} from 'lucide-react';
import React, {FC, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {EntumanyDB} from 'services/db.service';
import {GameAnswer, Language, Word} from 'types/db';
import {toast} from 'react-hot-toast';
import {useTranslation} from 'react-i18next';
import {generateRandomIntFromInterval} from 'utils/urls';
import {WordContainer, GameFeedbackModal} from 'components';
import {psudeoInteligentTranslationVerify} from 'utils/language';

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
  const [gameWords] = useState(getRandomWords(allWords));
  const [answerFeedback, setAnswerFeedback] = useState<GameAnswer>();
  const {t} = useTranslation();

  const {wordId, ...currentWord} = gameWords[currentWordIdx];
  const [srcLang, destLang] = Object.keys(currentWord) as Language[];

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inputValue = formData.get('answer')?.toString() ?? '';
    const actualValue = currentWord[destLang];
    const isCorrect = psudeoInteligentTranslationVerify(actualValue, inputValue);

    setAnswerFeedback({
      destLang,
      inputValue,
      srcLang,
      wasCorrectlyAnswered: isCorrect,
      wordId,
    });

    if (isCorrect) {
      toast(t(`correctFeedback${generateRandomIntFromInterval(0, 2)}`), {
        icon: '✅',
        position: 'bottom-center',
      });
      moveToNextWord();
    } else {
      setShowSubmitFeedback(true);
    }
    e.currentTarget.reset();
  };

  const moveToNextWord = () => {
    setShowSubmitFeedback(false);
    if (currentWordIdx !== gameWords.length - 1) {
      setCurrentWordIdx((prevIdx) => prevIdx + 1);
    } else {
      setIsComplete(true);
      setTimeout(() => setShowSubmitFeedback(true), 500);
    }
  };

  return (
    <div className={clsx(style.Game, 'animation-slide-down')}>
      <Button
        color="secondary"
        className={style.Game__back}
        leftIcon={<XCircleIcon size={28} />}
        onClick={() => navigate('/')}
      />
      <StepProgressBar current={currentWordIdx} isComplete={isComplete} total={gameWords.length} />
      <div className={style.Game__container}>
        <WordContainer word={currentWord} destLang={destLang} srcLang={srcLang} handleSubmit={handleSubmit} />
      </div>
      {answerFeedback && (
        <GameFeedbackModal
          showSubmitFeedback={showSubmitFeedback}
          onHide={moveToNextWord}
          answerFeedback={answerFeedback}
          currentWord={gameWords[currentWordIdx]}
          isComplete={isComplete}
        />
      )}
    </div>
  );
};

export default Game;
