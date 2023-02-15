import clsx from 'clsx';
import {Button, Modal} from 'components';
import React, {FC, useEffect, useState} from 'react';
import {GameAnswer, LanguageNames, Word} from 'types/db';
import style from './GameFeedbackModal.module.scss';

export interface GameFeedbackModalProps {
  onHide?: () => void;
  answerFeedback: GameAnswer;
  showSubmitFeedback?: boolean;
  currentWord?: Word;
}

const GameFeedbackModal: FC<GameFeedbackModalProps> = ({
  showSubmitFeedback = false,
  onHide,
  answerFeedback,
  currentWord,
}) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    setIsShown(showSubmitFeedback);
  }, [showSubmitFeedback]);

  const hide = () => {
    setIsShown(false);
    onHide?.();
  };

  const wasCorrect = answerFeedback.wasCorrectlyAnswered;

  const srcLang = LanguageNames[answerFeedback.srcLang];
  const destLang = LanguageNames[answerFeedback.destLang];
  const targetWord = currentWord?.[answerFeedback.srcLang];
  const destWord = currentWord?.[answerFeedback.destLang];
  const {inputValue} = answerFeedback;

  const bold = (text = '') => <strong>{text}</strong>;

  const modalDescription = () => {
    if (wasCorrect) {
      return 'Nice... that was correct';
    }

    return (
      <div>
        Na... The correct translation of {bold(srcLang)} word "{bold(targetWord)}" in {bold(destLang)} is "
        {bold(destWord)}" not "{bold(inputValue)}".
      </div>
    );
  };

  return (
    <Modal
      className={clsx(style.GameFeedbackModal, 'animation-slide-up')}
      isShown={isShown}
      hide={hide}
      headerText={wasCorrect ? 'Correct!' : 'Incorrect'}
    >
      <div className={style.GameFeedbackModal__content}>
        {modalDescription()}

        <Button onClick={hide} color={wasCorrect ? 'tertiary' : 'secondary'}>
          Continue
        </Button>
      </div>
    </Modal>
  );
};

export default GameFeedbackModal;
