import clsx from 'clsx';
import {Button} from 'components';
import {Play, Plus, Shuffle} from 'lucide-react';
import React, {FC, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useNavigate} from 'react-router-dom';
import {Tooltip} from 'react-tooltip';
import {getStatistics} from 'services/statistics.service';
import {MIN_WORDS_REQUIRED, ROUTES} from 'utils/constants';
import {getLangFlagsString} from 'utils/language';

import style from './DashboardContent.module.scss';

const PLAY_BUTTON_ID = 'play-button';

const DashboardContent: FC = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  const renderStatCard = (title: string, value: number, stat: string, link?: string) => (
    <Link to={link ?? '#'} className="unset-a" key={title}>
      <div className={style['dashboard-recent__stat-card']}>
        <div className={clsx('fw-400', style['dashboard-recent__stat-card__title'])}>{title}</div>
        <div className={style['dashboard-recent__stat-card__value']}>{value.toLocaleString()}</div>
        <div className={style['dashboard-recent__stat-card__subtitle']}>{stat.toLocaleString()}</div>
      </div>
    </Link>
  );

  const {multilanguageWords, numberOfWords, uniqueLanguages, numberOfWordSets} = getStatistics();
  const statistics = [
    {
      link: ROUTES.WORD_LIST,
      stat: `${multilanguageWords} ${t('multilangWords')}`,
      title: t('Total words'),
      value: numberOfWords,
    },
    {
      stat: getLangFlagsString(Array.from(uniqueLanguages)),
      title: t('Languages'),
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
          {statistics.map((s) => renderStatCard(s.title, s.value, s.stat, s.link))}
        </div>
        <div className={style['dashboard-recent__actions']}>
          <Button
            id={PLAY_BUTTON_ID}
            leftIcon={<Play size={16} />}
            disabled={!isPlayAllowed}
            onClick={() => navigate(ROUTES.PLAYGROUND)}
          >
            <p className="fs-16 fw-500">{t('playButton')}</p>
          </Button>
          {!isPlayAllowed && <Tooltip anchorId={PLAY_BUTTON_ID} content={t('addWordsToPlay') || ''} place="top" />}
          <Button
            leftIcon={<Shuffle size={16} />}
            disabled={!isPlayAllowed}
            onClick={() => navigate(ROUTES.MATCHING_GAME)}
          >
            <p className="fs-16 fw-500">{t('playButton')}</p>
          </Button>

          <Button leftIcon={<Plus size={16} />} color="secondary" onClick={() => navigate(ROUTES.EDITOR)}>
            <p className="fs-16 fw-500">{t('addNewWordButton')}</p>
          </Button>
        </div>
      </div>
    </>
  );
};

export default DashboardContent;
