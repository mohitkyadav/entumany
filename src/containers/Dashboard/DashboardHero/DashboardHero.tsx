import clsx from 'clsx';
import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';

import {A} from 'components';
import {Github, Settings} from 'lucide-react';
import {getCurrentStreak} from 'services/activity.service';
import {ROUTES} from 'utils/constants';
import style from './DashboardHero.module.scss';

const DashboardHero: FC = () => {
  const {t} = useTranslation();
  const streak = getCurrentStreak();

  return (
    <div className={style['dashboard-hero']}>
      {streak > 0 ? (
        <div className={style.streak} title={t('dayStreakLabel') || ''}>
          <span className={style.streak__flame}>🔥</span>
          <b className={style.streak__count}>{streak}</b>
          <span className={style.streak__label}>{t('dayStreakLabel')}</span>
        </div>
      ) : (
        <div className={clsx(style.streak, style['streak--idle'])}>{t('streakNudge')}</div>
      )}
      <div className={style['right-nav-actions']}>
        <Link to={ROUTES.SETTINGS} className="unset-a" aria-label={t('settingsTitle') || 'Settings'}>
          <Settings size={28} />
        </Link>
        <A href="https://github.com/mohitkyadav/entumany">
          <Github size={28} />
        </A>
      </div>
    </div>
  );
};

export default DashboardHero;
