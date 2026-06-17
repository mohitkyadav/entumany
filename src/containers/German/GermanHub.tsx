import React, {FC} from 'react';

import {GameHub, PageTitle} from 'components';
import {useTranslation} from 'react-i18next';
import {ROUTES} from 'utils/constants';

const GermanHub: FC = () => {
  const {t} = useTranslation();

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t('germanHubTitle')} />
      <GameHub
        title={t('germanHubTitle')}
        items={[
          {
            description: t('articleGameDesc'),
            flag: '🇩🇪',
            route: ROUTES.ARTICLE_GAME,
            title: t('articleGameTitle'),
          },
        ]}
      />
    </div>
  );
};

export default GermanHub;
