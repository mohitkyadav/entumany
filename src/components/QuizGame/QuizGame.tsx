import clsx from 'clsx';
import {CheckCircle, XCircle, XCircleIcon} from 'lucide-react';
import React, {FC, useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

import {generateUniqueArray} from 'utils/common';

import {Button} from '../FormElements';
import {StepProgressBar} from '../StepProgressBar/StepProgressBar';
import style from './QuizGame.module.scss';

export interface QuizQuestion {
  /** The main text shown on the card (a word, a "prep + article" pair, or a sentence with a blank). */
  prompt: string;
  /** Optional helper line under the prompt (e.g. an English translation). */
  subtitle?: string;
  /** The multiple-choice options (2–4 entries). The answer must be one of these. */
  options: string[];
  /** The correct option. */
  answer: string;
  /** How the correct answer is rendered in feedback (defaults to `answer`), e.g. "das Wort". */
  answerLabel?: string;
  /** A short teaching note shown alongside the feedback, e.g. "Nationality → ser". */
  explanation?: string;
}

export interface QuizGameProps {
  questions: QuizQuestion[];
  wordsPerRound?: number;
  promptVariant?: 'word' | 'sentence';
}

const DEFAULT_WORDS_PER_ROUND = 10;

const pickQuestions = (questions: QuizQuestion[], count: number): QuizQuestion[] => {
  const shuffled = generateUniqueArray(questions.length);
  return shuffled.slice(0, Math.min(count, questions.length)).map((i) => questions[i]);
};

export const QuizGame: FC<QuizGameProps> = ({
  questions,
  wordsPerRound = DEFAULT_WORDS_PER_ROUND,
  promptVariant = 'word',
}) => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  const [roundQuestions, setRoundQuestions] = useState<QuizQuestion[]>(() => pickQuestions(questions, wordsPerRound));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = roundQuestions[currentIndex];
  const isAnswered = selected !== null;
  const isCorrect = selected === currentQuestion?.answer;

  const playFeedbackSound = useCallback((isSuccess: boolean) => {
    const audio = new Audio(isSuccess ? '/sounds/correct-1.mp3' : '/sounds/error-1.mp3');
    audio.play().catch((error) => {
      console.warn('Failed to play sound:', error);
    });
  }, []);

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelected(option);

    const correct = option === currentQuestion.answer;
    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setIncorrectCount((c) => c + 1);
    }
    playFeedbackSound(correct);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= roundQuestions.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handlePlayAgain = () => {
    setRoundQuestions(pickQuestions(questions, wordsPerRound));
    setCurrentIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsComplete(false);
  };

  const getButtonColor = (option: string) => {
    if (!isAnswered) return 'primary';
    if (option === currentQuestion.answer) return 'tertiary';
    if (option === selected) return 'secondary';
    return 'primary';
  };

  if (!currentQuestion) return null;

  if (isComplete) {
    const accuracy = Math.round((correctCount / roundQuestions.length) * 100);

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

  const correctLabel = currentQuestion.answerLabel ?? currentQuestion.answer;
  const feedbackMessage = isCorrect
    ? currentQuestion.explanation ?? t('correctFeedback2')
    : `${correctLabel}${currentQuestion.explanation ? ` — ${currentQuestion.explanation}` : ''}`;

  return (
    <div className={clsx(style.Game, 'animation-slide-down')}>
      <Button
        color="secondary"
        className={style.Game__back}
        leftIcon={<XCircleIcon size={28} />}
        onClick={() => navigate('/')}
      />

      <StepProgressBar current={currentIndex + (isAnswered ? 1 : 0)} total={roundQuestions.length} />

      <div className={style.Game__card}>
        <div
          className={clsx(style.Game__card__word, {
            [style['Game__card__word--sentence']]: promptVariant === 'sentence',
          })}
        >
          {currentQuestion.prompt}
        </div>
        {currentQuestion.subtitle && <div className={style.Game__card__translation}>{currentQuestion.subtitle}</div>}
      </div>

      <div className={style.Game__options}>
        {currentQuestion.options.map((option) => (
          <Button
            key={option}
            className={clsx(style.Game__options__btn, {
              [style['Game__options__btn--correct']]: isAnswered && option === currentQuestion.answer,
              [style['Game__options__btn--incorrect']]: isAnswered && option === selected && !isCorrect,
            })}
            color={getButtonColor(option)}
            onClick={() => handleSelect(option)}
            disabled={isAnswered && option !== selected && option !== currentQuestion.answer}
          >
            {option}
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
            <span>{feedbackMessage}</span>
          </div>
          <Button color="primary" onClick={handleNext} autoFocus>
            {currentIndex + 1 >= roundQuestions.length ? t('articleGameSeeResults') : t('articleGameNext')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizGame;
