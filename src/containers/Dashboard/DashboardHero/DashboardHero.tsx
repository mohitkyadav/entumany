import clsx from 'clsx';
import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';

import {Settings} from 'lucide-react';
import {getCurrentStreak, getRecentDays} from 'services/activity.service';
import {ROUTES} from 'utils/constants';
import style from './DashboardHero.module.scss';

const DashboardHero: FC = () => {
  const {t} = useTranslation();
  const streak = getCurrentStreak();
  const recentDays = getRecentDays(7);

  return (
    <div className={style['dashboard-hero']}>
      {streak > 0 ? (
        <div className={style.streak} title={t('dayStreakLabel') || ''}>
          <span className={style.streak__count}>
            <span className={style.streak__flame}>🔥</span>
            <b className={style.streak__num}>{streak}</b>
          </span>
          <span className={style.streak__rule} aria-hidden="true" />
          <span className={style.streak__week} aria-label={t('dayStreakLabel') || ''}>
            <span className={style.streak__dots}>
              {recentDays.map((day) => (
                <span
                  key={day.date}
                  className={clsx(style.streak__dot, {
                    [style['streak__dot--on']]: day.active,
                    [style['streak__dot--today']]: day.isToday,
                  })}
                />
              ))}
            </span>
            <span className={style.streak__dlabels} aria-hidden="true">
              {recentDays.map((day) => (
                <span key={day.date} className={style.streak__dlabel}>
                  {day.weekday}
                </span>
              ))}
            </span>
          </span>
        </div>
      ) : (
        <div className={clsx(style.streak, style['streak--idle'])}>{t('streakNudge')}</div>
      )}
      <div className={style['right-nav-actions']}>
        <Link to={ROUTES.SETTINGS} className="unset-a" aria-label={t('settingsTitle') || 'Settings'}>
          <Settings size={28} />
        </Link>
      </div>
    </div>
  );
};

export default DashboardHero;
