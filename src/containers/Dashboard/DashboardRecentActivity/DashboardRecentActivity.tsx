import React, {FC} from 'react';
import clsx from 'clsx';
import {useNavigate} from 'react-router-dom';
import {Button} from 'components';

import style from './DashboardRecentActivity.module.scss';

const DashboardRecentActivity: FC = () => {
  const navigate = useNavigate();

  return (
    <div className={style['dashboard-hero']}>
      <div className={clsx(style['dashboard-hero__welcome-txt'], 'ls-50 fs-18')}>Some stats here</div>
      <div className={style['dashboard-hero__actions']}>
        <Button className="fs-20" onClick={() => navigate('/editor')}>
          Add new words
        </Button>
      </div>
    </div>
  );
};

export default DashboardRecentActivity;
