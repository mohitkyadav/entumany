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
  const [sequence] = useState(generateUniqueArray(gameWords.length));
  const [listOfListOfwords] = useState(
    gameWords.map(({wordId, ...word}) => {
      const langs = Object.keys(word);
      const langWords = Object.values(word);
      const saneWords: WordListItem[] = [];
      for (let i = 0; i < langs.length; i++) {
        saneWords.push({id: wordId, lang: langs[i] as Language, word: langWords[i] as string});
      }
      return saneWords;
    }),
  );
  const [answerFeedback, setAnswerFeedback] = useState<GameAnswer>();
  const [selectedFirstWord, setSelectedFirstWord] = useState<WordListItem>();
  const [selectedSecondWord, setSelectedSecondWord] = useState<WordListItem>();
  const {t} = useTranslation();

  console.log(listOfListOfwords, sequence);

  const moveToNextWord = () => {
    setShowSubmitFeedback(false);
    if (currentWordIdx !== gameWords.length - 1) {
      setCurrentWordIdx((prevIdx) => prevIdx + 1);
    } else {
      setIsComplete(true);
      setTimeout(() => setShowSubmitFeedback(true), 500);
    }
  };

  const selectFirstWord = (selectedWord: WordListItem) => {
    setSelectedFirstWord(selectedWord);
  };

  const selectSecondWord = (selectedWord: WordListItem) => {
    setSelectedSecondWord(selectedWord);
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
        {sequence.map((colOne, colTwo) => {
          const firstWord = listOfListOfwords[colOne][0];
          const secondWord = listOfListOfwords[colTwo][1];

          return (
            <div className={style.Game__container__row}>
              <Button
                className="fs-16"
                color={selectedFirstWord?.id === firstWord.id ? 'secondary' : 'primary'}
                onClick={() => selectFirstWord(firstWord)}
              >
                {firstWord.word}
              </Button>
              <Button
                className="fs-16"
                color={selectedSecondWord?.id === secondWord.id ? 'secondary' : 'primary'}
                onClick={() => selectSecondWord(secondWord)}
              >
                {secondWord.word}
              </Button>
            </div>
          );
        })}
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
