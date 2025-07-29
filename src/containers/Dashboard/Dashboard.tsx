import React, {FC} from 'react';

import {PageTitle} from 'components';
import {useTranslation} from 'react-i18next';
import DashboardHero from './DashboardHero/DashboardHero';
import DashboardContent from './DashboardContent/DashboardContent';

const Dashboard: FC = () => {
  const {t} = useTranslation();

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t('dashboardTitle')} />
      <DashboardHero />
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
