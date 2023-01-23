import React from 'react';
import {FC} from 'react';

const DashboardHero: FC = () => (
  <div className="dashboard-hero">
    <div className="dashboard-hero__welcome-txt">Good morning brathi!</div>
    <div className="dashboard-hero__user">
      <img alt="user avatar" src="https://github.com/mohitkyadav.png" />
    </div>
  </div>
);

export default DashboardHero;
