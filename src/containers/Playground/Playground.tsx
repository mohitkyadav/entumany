import React, {FC} from 'react';

import {PageTitle} from 'components';
import Game from './Game/Game';
import {generateRandomIdxFromInterval, generateRandomIntFromInterval} from 'utils/urls';
import {MIN_WORDS_REQUIRED} from 'utils/constants';

const getRandomWords = (words: Record<string, any>): Record<string, any>[] => {
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

const Playground: FC = () => {
  return (
    <div className="page animation-scale-up">
      <PageTitle title="Playground" />
      <Game getRandomWords={getRandomWords} />
    </div>
  );
};

export default Playground;
