import clsx from 'clsx';
import {Button} from 'components';
import {Play, Plus} from 'lucide-react';
import React, {FC, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Tooltip} from 'react-tooltip';
import {getStatistics} from 'services/statistics.service';
import {MIN_WORDS_REQUIRED, ROUTES} from 'utils/constants';
import {getLangFlagsString} from 'utils/language';

import style from './DashboardRecentActivity.module.scss';

const PLAY_BUTTON_ID = 'play-button';

const DashboardRecentActivity: FC = () => {
  const navigate = useNavigate();

  const renderStatCard = (title: string, value: number, stat: string) => (
    <div className={style['dashboard-recent__stat-card']} key={title}>
      <div className={clsx('fw-400', style['dashboard-recent__stat-card__title'])}>{title}</div>
      <div className={style['dashboard-recent__stat-card__value']}>{value.toLocaleString()}</div>
      <div className={style['dashboard-recent__stat-card__subtitle']}>{stat.toLocaleString()}</div>
    </div>
  );

  const {multilanguageWords, numberOfWords, uniqueLanguages, numberOfWordSets} = getStatistics();
  const statistics = [
    {
      stat: `${multilanguageWords} Multilang words`,
      title: 'Total words',
      value: numberOfWords,
    },
    {
      stat: getLangFlagsString(Array.from(uniqueLanguages)),
      title: 'Languages',
      value: uniqueLanguages.size,
    },
  ];

  const isPlayAllowed = numberOfWordSets >= MIN_WORDS_REQUIRED;

  // Easter egg that starts game with 7 clicks, even if less than 5 word sets are saved
  useEffect(() => {
    const btn = document.getElementById(PLAY_BUTTON_ID);
    const easterEggHandler = (evt: MouseEvent) => {
      if (evt.detail === 7) {
        console.info('You have found the easter egg! 🥚');
        navigate(ROUTES.PLAYGROUND);
      }
    };

    btn?.addEventListener('click', easterEggHandler);

    return () => btn?.removeEventListener('click', easterEggHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={style['dashboard-recent']}>
        <div className={clsx(style['dashboard-recent__stat-container'], 'ls-50 fs-18')}>
          {statistics.map((s) => renderStatCard(s.title, s.value, s.stat))}
        </div>
        <div className={style['dashboard-recent__actions']}>
          <Button
            id={PLAY_BUTTON_ID}
            leftIcon={<Play size={16} />}
            disabled={!isPlayAllowed}
            onClick={() => navigate(ROUTES.PLAYGROUND)}
          >
            <p className="fs-16 fw-500">Test yourself</p>
          </Button>
          {!isPlayAllowed && (
            <Tooltip
              anchorId={PLAY_BUTTON_ID}
              content="To play a game save, atleast 5 different word sets"
              place="top"
            />
          )}

          <Button leftIcon={<Plus size={16} />} color="secondary" onClick={() => navigate(ROUTES.EDITOR)}>
            <p className="fs-16 fw-500">Add new words</p>
          </Button>
        </div>
      </div>
    </>
  );
};

export default DashboardRecentActivity;
