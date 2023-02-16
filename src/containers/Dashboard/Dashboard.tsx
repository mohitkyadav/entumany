import React, {FC} from 'react';

import {PageTitle} from 'components';
import DashboardHero from './DashboardHero/DashboardHero';
import DashboardContent from './DashboardContent/DashboardContent';

const Dashboard: FC = () => (
  <div className="page animation-scale-up">
    <PageTitle title="Dashboard" />
    <DashboardHero />
    <DashboardContent />
  </div>
);

export default Dashboard;
