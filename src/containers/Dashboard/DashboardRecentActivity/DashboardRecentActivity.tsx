import clsx from 'clsx';
import {Button} from 'components';
import React, {FC} from 'react';
import {useNavigate} from 'react-router-dom';
import {getStatistics} from 'services/statistics.service';

import style from './DashboardRecentActivity.module.scss';

const DashboardRecentActivity: FC = () => {
  const navigate = useNavigate();

  const renderStatCard = (title: string, value: number) => (
    <div className={style['dashboard-recent__stat-card']} key={title}>
      <div className={style['dashboard-recent__stat-card__value']}>{value.toLocaleString()}</div>
      <div className="fw-400">{title}</div>
    </div>
  );

  const {multilanguageWords, numberOfWords, uniqueLanguages} = getStatistics();
  const statistics = [
    {
      title: 'Multi-language words',
      value: multilanguageWords,
    },
    {
      title: 'Total words',
      value: numberOfWords,
    },
    {
      title: 'Languages',
      value: uniqueLanguages,
    },
  ];

  return (
    <div className={style['dashboard-recent']}>
      <div className={clsx(style['dashboard-recent__stat-container'], 'ls-50 fs-18')}>
        {statistics.map((s) => renderStatCard(s.title, s.value))}
      </div>
      <div className={style['dashboard-recent__actions']}>
        <Button disabled={numberOfWords === 0} className="fs-16" onClick={() => navigate('/play')}>
          Play ▶️
        </Button>

        <Button className="fs-16" onClick={() => navigate('/story-time')}>
          Story Time ⏳
        </Button>

        <Button color="secondary" className="fs-16" onClick={() => navigate('/editor')}>
          Add new words +
        </Button>
      </div>
    </div>
  );
};

export default DashboardRecentActivity;
