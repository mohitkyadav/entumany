import clsx from 'clsx';
import {Button} from 'components';
import {Hourglass, Play, Plus} from 'lucide-react';
import React, {FC} from 'react';
import {useNavigate} from 'react-router-dom';
import {Tooltip} from 'react-tooltip';
import {getStatistics} from 'services/statistics.service';
import {MIN_WORDS_REQUIRED} from 'utils/constants';

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

  const isPlayAllowed = numberOfWords >= MIN_WORDS_REQUIRED;

  return (
    <>
      <div className={style['dashboard-recent']}>
        <div className={clsx(style['dashboard-recent__stat-container'], 'ls-50 fs-18')}>
          {statistics.map((s) => renderStatCard(s.title, s.value))}
        </div>
        <div className={style['dashboard-recent__actions']}>
          <Button
            id="play-button"
            leftIcon={<Play size={16} />}
            disabled={!isPlayAllowed}
            onClick={() => navigate('/play')}
          >
            <p className="fs-16 fw-500">Test yourself</p>
          </Button>
          {!isPlayAllowed && (
            <Tooltip anchorId="play-button" content="To play a game save, atleast 5 words" place="top" />
          )}

          <Button leftIcon={<Hourglass size={16} />} onClick={() => navigate('/story-time')}>
            <p className="fs-16 fw-500">Timed quiz</p>
          </Button>

          <Button leftIcon={<Plus size={16} />} color="secondary" onClick={() => navigate('/editor')}>
            <p className="fs-16 fw-500">Add new words</p>
          </Button>
        </div>
      </div>
    </>
  );
};

export default DashboardRecentActivity;
