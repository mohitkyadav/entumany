import clsx from 'clsx';
import {Button, StepProgressBar} from 'components';
import {XCircleIcon, CheckCircle, XCircle} from 'lucide-react';
import React, {FC, useCallback, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

import style from './Game.module.scss';
import germanNouns from 'data/germanNouns.json';
import {generateUniqueArray} from 'utils/common';

type GermanNoun = {
  word: string;
  article: string;
  translation: string;
};

const ARTICLE_OPTIONS = ['der', 'die', 'das', '?'];
const WORDS_PER_ROUND = 10;

const Game: FC = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const allNouns = germanNouns as GermanNoun[];

  const gameNouns = useMemo(() => {
    const shuffled = generateUniqueArray(allNouns.length);
    return shuffled.slice(0, WORDS_PER_ROUND).map((i) => allNouns[i]);
  }, [allNouns]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentNoun = gameNouns[currentIndex];
  const isAnswered = selectedArticle !== null;
  const isCorrect = selectedArticle === currentNoun?.article;

  const playFeedbackSound = useCallback((isSuccess: boolean) => {
    const audio = new Audio(isSuccess ? '/sounds/correct-1.mp3' : '/sounds/error-1.mp3');
    audio.play().catch((error) => {
      console.warn('Failed to play sound:', error);
    });
  }, []);

  const handleSelect = (article: string) => {
    if (isAnswered) return;
    setSelectedArticle(article);

    const correct = article === currentNoun.article;
    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setIncorrectCount((c) => c + 1);
    }
    playFeedbackSound(correct);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= gameNouns.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedArticle(null);
    }
  };

  const handlePlayAgain = () => {
    setCurrentIndex(0);
    setSelectedArticle(null);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsComplete(false);
    navigate(0);
  };

  const getButtonColor = (article: string) => {
    if (!isAnswered) return 'primary';
    if (article === currentNoun.article) return 'tertiary';
    if (article === selectedArticle) return 'secondary';
    return 'primary';
  };

  if (isComplete) {
    const accuracy = Math.round((correctCount / gameNouns.length) * 100);

    return (
      <div className={clsx(style.Game, 'animation-slide-down')}>
        <div className={clsx(style.Game__results, 'animation-scale-up')}>
          <h2 className={style.Game__results__title}>{t('victoryTitle')}</h2>
          <div className={style.Game__results__stats}>
            <div className={style.Game__results__stat}>
              <span className={style['Game__results__stat--correct']}>{correctCount}</span>
              <span>{t('correctMatches')}</span>
            </div>
            <div className={style.Game__results__stat}>
              <span className={style['Game__results__stat--incorrect']}>{incorrectCount}</span>
              <span>{t('mistakes')}</span>
            </div>
            <div className={style.Game__results__stat}>
              <span>{accuracy}%</span>
              <span>{t('accuracy')}</span>
            </div>
          </div>
          <div className={style.Game__results__actions}>
            <Button color="tertiary" onClick={handlePlayAgain}>
              {t('playAgain')}
            </Button>
            <Button color="secondary" onClick={() => navigate('/')}>
              {t('backToHome')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(style.Game, 'animation-slide-down')}>
      <Button
        color="secondary"
        className={style.Game__back}
        leftIcon={<XCircleIcon size={28} />}
        onClick={() => navigate('/')}
      />

      <StepProgressBar current={currentIndex + (isAnswered ? 1 : 0)} total={gameNouns.length} />

      <div className={style.Game__card}>
        <div className={style.Game__card__word}>{currentNoun.word}</div>
        <div className={style.Game__card__translation}>{currentNoun.translation}</div>
      </div>

      <div className={style.Game__options}>
        {ARTICLE_OPTIONS.map((article) => (
          <Button
            key={article}
            className={clsx(style.Game__options__btn, {
              [style['Game__options__btn--correct']]: isAnswered && article === currentNoun.article,
              [style['Game__options__btn--incorrect']]: isAnswered && article === selectedArticle && !isCorrect,
            })}
            color={getButtonColor(article)}
            onClick={() => handleSelect(article)}
            disabled={isAnswered && article !== selectedArticle && article !== currentNoun.article}
          >
            {article}
          </Button>
        ))}
      </div>

      {isAnswered && (
        <div className={clsx(style.Game__feedback, 'animation-slide-up')}>
          <div
            className={clsx(style.Game__feedback__message, {
              [style['Game__feedback__message--correct']]: isCorrect,
              [style['Game__feedback__message--incorrect']]: !isCorrect,
            })}
          >
            {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
            <span>{isCorrect ? t('correctFeedback2') : `${currentNoun.article} ${currentNoun.word}`}</span>
          </div>
          <Button color="primary" onClick={handleNext} autoFocus>
            {currentIndex + 1 >= gameNouns.length ? t('articleGameSeeResults') : t('articleGameNext')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Game;
