import clsx from 'clsx';
import {Button} from 'components';
import {XCircleIcon} from 'lucide-react';
import React, {FC, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {EntumanyDB} from 'services/db.service';
import {Language, Word, WordListItem} from 'types/db';
import {toast} from 'react-hot-toast';
import {useTranslation} from 'react-i18next';
import {generateRandomIntFromInterval} from 'utils/urls';

import style from './Game.module.scss';
import {generateUniqueArray} from 'utils/common';

export interface GameProps {
  getRandomWords(words: Record<string, any>): Word[];
}

const correctlyAnsweredIds: Map<string, boolean> = new Map();

const Game: FC<GameProps> = ({getRandomWords}) => {
  const dbInstance = EntumanyDB.getInstance();
  const allWords = dbInstance.database;
  const navigate = useNavigate();
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
  const [selectedFirstWord, setSelectedFirstWord] = useState<WordListItem>();
  const [selectedSecondWord, setSelectedSecondWord] = useState<WordListItem>();
  const {t} = useTranslation();

  const selectFirstWord = (selectedWord: WordListItem) => {
    setSelectedFirstWord(selectedWord);

    if (selectedSecondWord) checkMatch(selectedWord, selectedSecondWord);
  };

  const selectSecondWord = (selectedWord: WordListItem) => {
    setSelectedSecondWord(selectedWord);

    if (selectedFirstWord) checkMatch(selectedFirstWord, selectedWord);
  };

  const checkMatch = (firstWord: WordListItem, secondWord: WordListItem) => {
    if (firstWord?.id === secondWord?.id) {
      toast(t(`correctFeedback${generateRandomIntFromInterval(0, 2)}`), {
        icon: '✅',
        position: 'bottom-center',
      });
      correctlyAnsweredIds.set(firstWord.id, true);
    } else {
      toast(t(`inCorrectFeedback${generateRandomIntFromInterval(0, 2)}`), {
        icon: '🚫',
        position: 'bottom-center',
      });
    }
    setTimeout(() => resetSelectedWords(), 300);
  };

  const resetSelectedWords = () => {
    setSelectedFirstWord(undefined);
    setSelectedSecondWord(undefined);
  };

  const getButtonColour = (wordId: string, selectedId?: string) => {
    if (wordId === selectedId) {
      return 'secondary';
    }

    if (correctlyAnsweredIds.get(wordId)) {
      return 'tertiary';
    }

    return 'primary';
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
            <div key={firstWord.id + secondWord.id} className={style.Game__container__row}>
              <Button
                className="fs-16"
                color={getButtonColour(firstWord.id, selectedFirstWord?.id)}
                onClick={() => selectFirstWord(firstWord)}
                disabled={correctlyAnsweredIds.get(firstWord.id)}
              >
                {firstWord.word}
              </Button>
              <Button
                className="fs-16"
                color={getButtonColour(secondWord.id, selectedSecondWord?.id)}
                onClick={() => selectSecondWord(secondWord)}
                disabled={correctlyAnsweredIds.get(secondWord.id)}
              >
                {secondWord.word}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Game;
