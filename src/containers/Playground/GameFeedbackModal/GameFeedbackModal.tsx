import clsx from 'clsx';
import {Button, Modal} from 'components';
import React, {FC, useEffect, useState} from 'react';
import {GameAnswer} from 'types/db';
import style from './GameFeedbackModal.module.scss';

export interface GameFeedbackModalProps {
  onHide?: () => void;
  answerFeedback?: GameAnswer;
  showSubmitFeedback?: boolean;
}

const GameFeedbackModal: FC<GameFeedbackModalProps> = ({showSubmitFeedback = false, onHide, answerFeedback}) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    setIsShown(showSubmitFeedback);
  }, [showSubmitFeedback]);

  const hide = () => {
    setIsShown(false);
    onHide?.();
  };

  const wasCorrect = answerFeedback?.wasCorrectlyAnswered;

  return (
    <Modal
      className={clsx(style.GameFeedbackModal, 'animation-slide-up')}
      isShown={isShown}
      hide={hide}
      headerText={wasCorrect ? 'Correct!' : 'Incorrect'}
    >
      <div className={style.GameFeedbackModal__content}>
        {wasCorrect ? <div>Correct</div> : <div>Incorrect</div>}
        <Button onClick={hide}>Continue</Button>
      </div>
    </Modal>
  );
};

export default GameFeedbackModal;
