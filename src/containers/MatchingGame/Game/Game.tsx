import clsx from 'clsx';
import {Button} from 'components';
import {XCircleIcon} from 'lucide-react';
import React, {FC, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {EntumanyDB} from 'services/db.service';
import {GameAnswer, Language, Word, WordListItem} from 'types/db';
import {toast} from 'react-hot-toast';
import {useTranslation} from 'react-i18next';
import {generateRandomIntFromInterval} from 'utils/urls';
import {GameFeedbackModal} from 'components';
import {psudeoInteligentTranslationVerify} from 'utils/language';

import style from './Game.module.scss';
import {generateUniqueArray} from 'utils/common';

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
  const gameWords = getRandomWords(allWords);
  const sequence = generateUniqueArray(gameWords.length);
  const [answerFeedback, setAnswerFeedback] = useState<GameAnswer>();
  const {t} = useTranslation();

  const listOfListOfwords = gameWords.map(({wordId, ...word}) => {
    const langs = Object.keys(word);
    const langWords = Object.values(word);
    const saneWords: WordListItem[] = [];
    for (let i = 0; i < langs.length; i++) {
      saneWords.push({id: wordId, lang: langs[i] as Language, word: langWords[i] as string});
    }
    return saneWords;
  });

  console.log(listOfListOfwords, sequence);

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
      <div className={style.Game__container}>
        {/* <WordContainer word={currentWord} destLang={destLang} srcLang={srcLang} handleSubmit={handleSubmit} /> */}
        {sequence.map((colOne, colTwo) => (
          <div className={style.Game__container__row}>
            <Button>{listOfListOfwords[colOne][0].word}</Button>
            <Button>{listOfListOfwords[colTwo][1].word}</Button>
          </div>
        ))}
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
