import clsx from 'clsx';
import {Button, Modal} from 'components';
import {Trophy, CheckCircle, AlertCircle} from 'lucide-react';
import React, {FC, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {WordListItem} from 'types/db';
import {useTranslation} from 'react-i18next';
import style from './VictoryModal.module.scss';

export interface Mistake {
  firstWord: WordListItem;
  secondWord: WordListItem;
  timestamp: number;
}

export interface VictoryModalProps {
  onHide?: () => void;
  isShown: boolean;
  totalPairs: number;
  mistakes: Mistake[];
  onPlayAgain: () => void;
}

export const VictoryModal: FC<VictoryModalProps> = ({onHide, isShown, totalPairs, mistakes, onPlayAgain}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();
  const {t} = useTranslation();

  useEffect(() => {
    if (isShown) {
      setShowConfetti(true);
      // Hide confetti after 3 seconds
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isShown]);

  const hide = () => {
    onPlayAgain();
    onHide?.();
  };

  const correctPairs = totalPairs - mistakes.length;
  const accuracy = totalPairs > 0 ? Math.round((correctPairs / totalPairs) * 100) : 0;

  const getAccuracyColor = () => {
    if (accuracy >= 90) return 'excellent';
    if (accuracy >= 75) return 'good';
    if (accuracy >= 60) return 'average';
    return 'poor';
  };

  const getAccuracyMessage = () => {
    if (accuracy >= 90) return t('excellentMessage');
    if (accuracy >= 75) return t('goodMessage');
    if (accuracy >= 60) return t('averageMessage');
    return t('poorMessage');
  };

  return (
    <Modal
      className={clsx(style.VictoryModal)}
      isShown={isShown}
      hide={hide}
      headerText={t('victoryTitle') || '🎉 Victory! 🎉'}
    >
      <div className={style.VictoryModal__content}>
        {showConfetti && (
          <div className={style.VictoryModal__confetti}>
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className={style.VictoryModal__confetti__piece}
                style={{
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][
                    Math.floor(Math.random() * 5)
                  ],
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        )}

        <div className={style.VictoryModal__trophy}>
          <Trophy size={64} color="#FFD700" />
        </div>

        <div className={style.VictoryModal__stats}>
          <div className={style.VictoryModal__stats__row}>
            <div className={style.VictoryModal__stats__item}>
              <CheckCircle size={24} color="#4CAF50" />
              <span>
                {t('correctMatches')}: {correctPairs}
              </span>
            </div>
            <div className={style.VictoryModal__stats__item}>
              <AlertCircle size={24} color="#FF9800" />
              <span>
                {t('mistakes')}: {mistakes.length}
              </span>
            </div>
          </div>

          <div className={clsx(style.VictoryModal__accuracy, style[`accuracy--${getAccuracyColor()}`])}>
            <span className={style.VictoryModal__accuracy__percentage}>{accuracy}%</span>
            <span className={style.VictoryModal__accuracy__label}>{t('accuracy')}</span>
          </div>

          <div className={style.VictoryModal__message}>{getAccuracyMessage()}</div>
        </div>

        {mistakes.length > 0 && (
          <div className={style.VictoryModal__mistakes}>
            <h3>{t('mistakesTitle')}:</h3>
            <div className={style.VictoryModal__mistakes__list}>
              {mistakes.map((mistake, index) => (
                <div key={index} className={style.VictoryModal__mistakes__item}>
                  <div className={style.VictoryModal__mistakes__pair}>
                    <span className={style.VictoryModal__mistakes__word}>
                      {mistake.firstWord.word} ({mistake.firstWord.lang})
                    </span>
                    <span className={style.VictoryModal__mistakes__separator}>≠</span>
                    <span className={style.VictoryModal__mistakes__word}>
                      {mistake.secondWord.word} ({mistake.secondWord.lang})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={style.VictoryModal__actions}>
          <Button onClick={onPlayAgain} color="tertiary" className={style.VictoryModal__actions__button}>
            {t('playAgain')}
          </Button>
          <Button onClick={() => navigate('/')} color="secondary" className={style.VictoryModal__actions__button}>
            {t('backToHome')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
