import React, {FC} from 'react';

import {PageTitle} from 'components';
import Game from './Game/Game';
import {generateRandomIdxFromInterval, generateRandomIntFromInterval} from 'utils/urls';

const getRandomWords = (words: Record<string, any>): Record<string, any>[] => {
  const allWordsIds = Object.keys(words);
  const allWordsLen = allWordsIds.length;
  const numberOfQuestions = generateRandomIntFromInterval(5, Math.min(allWordsLen, 10));
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
