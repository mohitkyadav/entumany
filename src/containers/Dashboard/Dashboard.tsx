import React, {FC} from 'react';

import {PageTitle} from 'components';
import DashboardHero from './DashboardHero/DashboardHero';
import DashboardRecentActivity from './DashboardRecentActivity/DashboardRecentActivity';

const Dashboard: FC = () => (
  <div className="page">
    <PageTitle title="Dashboard" />
    <DashboardHero />
    <DashboardRecentActivity />
  </div>
);

export default Dashboard;
