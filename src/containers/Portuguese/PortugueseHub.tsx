import React, {FC} from 'react';

import {GameHub, PageTitle} from 'components';
import {useTranslation} from 'react-i18next';
import {ROUTES} from 'utils/constants';

const PortugueseHub: FC = () => {
  const {t} = useTranslation();

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t('portugueseHubTitle')} />
      <GameHub
        title={t('portugueseHubTitle')}
        items={[
          {
            description: t('contractionsGameDesc'),
            flag: '🔗',
            route: ROUTES.PT_CONTRACTIONS,
            title: t('contractionsGameTitle'),
          },
          {
            description: t('genderGameDesc'),
            flag: '🆎',
            route: ROUTES.PT_GENDER,
            title: t('genderGameTitle'),
          },
          {
            description: t('serEstarGameDesc'),
            flag: '⚖️',
            route: ROUTES.PT_SER_ESTAR,
            title: t('serEstarGameTitle'),
          },
        ]}
      />
    </div>
  );
};

export default PortugueseHub;
