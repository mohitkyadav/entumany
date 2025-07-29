import React, {FC} from 'react';

import {PageTitle} from 'components';
import {useTranslation} from 'react-i18next';
import {generateRandomIdxFromInterval, generateRandomIntFromInterval} from 'utils/urls';
import {MIN_WORDS_REQUIRED} from 'utils/constants';
import {Word} from 'types/db';
import Game from './Game/Game';

const getRandomWords = (words: Record<string, any>): Word[] => {
  const allWordsIds = Object.keys(words);
  const allWordsLen = allWordsIds.length;
  // PS: this case prevents infinite loop
  if (allWordsLen < MIN_WORDS_REQUIRED) {
    return allWordsIds.map((wordId) => ({...words[wordId], wordId}));
  }

  const numberOfQuestions = generateRandomIntFromInterval(MIN_WORDS_REQUIRED, Math.min(allWordsLen, 10));
  const randIdcs = generateRandomIdxFromInterval(numberOfQuestions, allWordsLen - 1);

  return randIdcs.map((idx: number) => {
    const wordId = allWordsIds[idx];
    return {...words[wordId], wordId};
  });
};

const MatchingGame: FC = () => {
  const {t} = useTranslation();
  return (
    <div className="page animation-scale-up">
      <PageTitle title={t('matchingGameTitle')} />
      <Game getRandomWords={getRandomWords} />
    </div>
  );
};

export default MatchingGame;
