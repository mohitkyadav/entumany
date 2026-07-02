import clsx from 'clsx';
import React, {FC} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

import {Button} from '../FormElements';
import style from './RoundResults.module.scss';

export interface RoundResultsProps {
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  bestStreak: number;
  onPlayAgain: () => void;
}

/** The shared end-of-round summary: stats + play again / back home. */
export const RoundResults: FC<RoundResultsProps> = ({
  correctCount,
  incorrectCount,
  accuracy,
  bestStreak,
  onPlayAgain,
}) => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <div className={clsx(style.RoundResults, 'animation-scale-up')}>
      <h2 className={style.RoundResults__title}>{t('victoryTitle')}</h2>
      <div className={style.RoundResults__stats}>
        <div className={style.RoundResults__stat}>
          <span className={style['RoundResults__stat--correct']}>{correctCount}</span>
          <span>{t('correctMatches')}</span>
        </div>
        <div className={style.RoundResults__stat}>
          <span className={style['RoundResults__stat--incorrect']}>{incorrectCount}</span>
          <span>{t('mistakes')}</span>
        </div>
        <div className={style.RoundResults__stat}>
          <span>{accuracy}%</span>
          <span>{t('accuracy')}</span>
        </div>
        <div className={style.RoundResults__stat}>
          <span>{bestStreak}</span>
          <span>{t('bestStreak')}</span>
        </div>
      </div>
      <div className={style.RoundResults__actions}>
        <Button color="tertiary" onClick={onPlayAgain}>
          {t('playAgain')}
        </Button>
        <Button color="secondary" onClick={() => navigate('/')}>
          {t('backToHome')}
        </Button>
      </div>
    </div>
  );
};

export default RoundResults;
