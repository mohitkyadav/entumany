import clsx from 'clsx';
import {Button, Modal} from 'components';
import React, {FC, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {GameAnswer, Word} from 'types/db';
import {LanguageNames, ROUTES} from 'utils/constants';
import style from './GameFeedbackModal.module.scss';

export interface GameFeedbackModalProps {
  onHide?: () => void;
  answerFeedback: GameAnswer;
  showSubmitFeedback?: boolean;
  currentWord?: Word;
  isComplete: boolean;
}

const GameFeedbackModal: FC<GameFeedbackModalProps> = ({
  showSubmitFeedback = false,
  isComplete = false,
  onHide,
  answerFeedback,
  currentWord,
}) => {
  const [isShown, setIsShown] = useState(false);
  const navigate = useNavigate();

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
    if (isComplete) {
      return 'Good job reaching till the end!';
    }

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

  const onContinueClickHandler = () => {
    if (isComplete) {
      navigate(ROUTES.DASHBOARD);
    } else {
      hide?.();
    }
  };

  const getHeaderText = () => {
    if (isComplete) {
      return 'Quiz completed!';
    }

    if (wasCorrect) {
      return 'Correct!';
    }

    return 'Incorrect!';
  };

  return (
    <Modal
      className={clsx(style.GameFeedbackModal, 'animation-slide-up')}
      isShown={isShown}
      hide={hide}
      headerText={getHeaderText()}
    >
      <div className={style.GameFeedbackModal__content}>
        {modalDescription()}

        <Button autoFocus onClick={onContinueClickHandler} color={wasCorrect ? 'tertiary' : 'secondary'}>
          Continue
        </Button>
      </div>
    </Modal>
  );
};

export default GameFeedbackModal;
