import clsx from 'clsx';
import {Button, Modal} from 'components';
import React, {FC, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {GameAnswer, Word} from 'types/db';
import style from './GameFeedbackModal.module.scss';

export interface GameFeedbackModalProps {
  onHide?: () => void;
  answerFeedback: GameAnswer;
  showSubmitFeedback?: boolean;
  currentWord?: Word;
}

export const GameFeedbackModal: FC<GameFeedbackModalProps> = ({
  showSubmitFeedback = false,
  onHide,
  answerFeedback,
  currentWord,
}) => {
  const [isShown, setIsShown] = useState(false);
  const {t} = useTranslation();

  useEffect(() => {
    setIsShown(showSubmitFeedback);
  }, [showSubmitFeedback]);

  const hide = () => {
    setIsShown(false);
    onHide?.();
  };

  const wasCorrect = answerFeedback.wasCorrectlyAnswered;
  const destWord = currentWord?.[answerFeedback.destLang];

  return (
    <Modal
      className={clsx(style.GameFeedbackModal, 'animation-slide-up')}
      isShown={isShown}
      hide={hide}
      headerText={(wasCorrect ? t('feedbackCorrectTitle') : t('feedbackIncorrectTitle')) || ''}
    >
      <div className={style.GameFeedbackModal__content}>
        {wasCorrect ? t('feedbackCorrectBody') : t('feedbackIncorrectBody', {word: destWord})}

        <Button autoFocus onClick={hide} color={wasCorrect ? 'tertiary' : 'secondary'}>
          {t('continueBtn')}
        </Button>
      </div>
    </Modal>
  );
};
