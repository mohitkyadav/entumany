import React, {FC} from 'react';

import {PageTitle} from 'components';
import {useTranslation} from 'react-i18next';
import Game from './Game/Game';

const MatchingGame: FC = () => {
  const {t} = useTranslation();
  return (
    <div className="page animation-scale-up">
      <PageTitle title={t('matchingGameTitle')} />
      <Game />
    </div>
  );
};

export default MatchingGame;
