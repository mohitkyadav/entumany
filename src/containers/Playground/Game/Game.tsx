import clsx from 'clsx';
import {Button, StepProgressBar} from 'components';
import {WordContainer, GameFeedbackModal} from 'components';
import {XCircleIcon} from 'lucide-react';
import React, {FC, useRef, useState} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {EntumanyDB} from 'services/db.service';
import {recordAnswer, recordGame} from 'services/progress.service';
import {WORD_GAME_IDS, getWordGameLanguages, pickGameWords, wordItemId} from 'services/wordGames.service';
import {GameAnswer} from 'types/db';
import {toast} from 'react-hot-toast';
import {useTranslation} from 'react-i18next';
import {ROUTES} from 'utils/constants';
import {generateRandomIntFromInterval} from 'utils/urls';
import {psudeoInteligentTranslationVerify} from 'utils/language';
import style from './Game.module.scss';

const Game: FC = () => {
  const dbInstance = EntumanyDB.getInstance();
  const navigate = useNavigate();
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showSubmitFeedback, setShowSubmitFeedback] = useState(false);
  const [gameWords] = useState(() => pickGameWords(dbInstance.database));
  const [answerFeedback, setAnswerFeedback] = useState<GameAnswer>();
  const correctCountRef = useRef(0);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const {t} = useTranslation();

  if (!gameWords.length) return <Navigate to={ROUTES.DASHBOARD} replace />;

  const {wordId, ...currentWord} = gameWords[currentWordIdx];
  const [srcLang, destLang] = getWordGameLanguages(gameWords[currentWordIdx]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inputValue = formData.get('answer')?.toString() ?? '';
    const actualValue = currentWord[destLang];
    const isCorrect = psudeoInteligentTranslationVerify(actualValue, inputValue);

    recordAnswer(wordItemId(wordId), isCorrect);
    if (isCorrect) {
      correctCountRef.current += 1;
      streakRef.current += 1;
      bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
    } else {
      streakRef.current = 0;
    }

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
      const accuracy = Math.round((100 * correctCountRef.current) / gameWords.length);
      recordGame(WORD_GAME_IDS.play, accuracy, bestStreakRef.current);
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
