import clsx from 'clsx';
import {Button} from 'components';
import {Hourglass, Play, Plus} from 'lucide-react';
import React, {FC} from 'react';
import {useNavigate} from 'react-router-dom';
import {getStatistics} from 'services/statistics.service';

import style from './DashboardRecentActivity.module.scss';

const DashboardRecentActivity: FC = () => {
  const navigate = useNavigate();

  const renderStatCard = (title: string, value: number) => (
    <div className={style['dashboard-recent__stat-card']} key={title}>
      <div className={style['dashboard-recent__stat-card__value']}>{value.toLocaleString()}</div>
      <div className="fw-400 fs-16">{title}</div>
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
        <Button disabled={numberOfWords === 0} onClick={() => navigate('/play')}>
          <Play size={16} />
          <p className="fs-16 fw-500">Test yourself</p>
        </Button>

        <Button onClick={() => navigate('/story-time')}>
          <Hourglass size={16} />
          <p className="fs-16 fw-500">Timed quiz</p>
        </Button>

        <Button color="secondary" onClick={() => navigate('/editor')}>
          <Plus size={16} />
          <p className="fs-16 fw-500">Add new words</p>
        </Button>
      </div>
    </div>
  );
};

export default DashboardRecentActivity;
