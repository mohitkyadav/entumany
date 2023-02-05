import clsx from 'clsx';
import {Button} from 'components';
import React, {FC} from 'react';
import {useNavigate} from 'react-router-dom';
import {getStatistics} from 'services/statistics.service';

import style from './DashboardRecentActivity.module.scss';

const DashboardRecentActivity: FC = () => {
  const navigate = useNavigate();

  const {multilanguageWords, numberOfWords, uniqueLanguages} = getStatistics();
  const statistics = [
    {
      title: 'Multi-language words',
      value: multilanguageWords,
    },
    {
      title: 'Number of words',
      value: numberOfWords,
    },
    {
      title: 'Unique languages',
      value: uniqueLanguages,
    },
  ];

  return (
    <div className={style['dashboard-hero']}>
      <div className={clsx(style['dashboard-hero__welcome-txt'], 'ls-50 fs-18')}>
        {statistics.map((s) => (
          <div key={s.title}>
            <span className="fw-600">{s.title}: </span>
            <span>{s.value}</span>
          </div>
        ))}
      </div>
      <div className={style['dashboard-hero__actions']}>
        <Button className="fs-16" onClick={() => navigate('/editor')}>
          Add new words
        </Button>
      </div>
    </div>
  );
};

export default DashboardRecentActivity;
