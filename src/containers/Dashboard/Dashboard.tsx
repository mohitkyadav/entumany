import React, {FC} from 'react';

import {PageTitle} from 'components';
import DashboardHero from './DashboardHero/DashboardHero';
import DashboardRecentActivity from './DashboardRecentActivity/DashboardRecentActivity';

const Dashboard: FC = () => (
  <div className="page animation-scale-up">
    <PageTitle title="Dashboard" />
    <DashboardHero />
    <DashboardRecentActivity />
  </div>
);

export default Dashboard;
