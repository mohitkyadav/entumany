import clsx from 'clsx';
import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';

import {A} from 'components';
import {LanguageSwitcher} from 'components/LanguageSwitcher/LanguageSwitcher';
import {Github} from 'lucide-react';
import {getCurrentStreak} from 'services/activity.service';
import AnimatedHelloText from './AnimatedHelloText/AnimatedHelloText';
import style from './DashboardHero.module.scss';

const DashboardHero: FC = () => {
  const {t} = useTranslation();
  const streak = getCurrentStreak();

  return (
    <div className={style['dashboard-hero']}>
      <div className={style['dashboard-hero__welcome']}>
        <div className={clsx(style['dashboard-hero__welcome-txt'], 'ls-50 fs-18')}>
          <AnimatedHelloText />
        </div>
        {streak == 0 ? (
          <div className={style.streak} title={t('dayStreakLabel') || ''}>
            <span className={style.streak__flame}>🔥</span>
            <b className={style.streak__count}>{streak}</b>
            <span className={style.streak__label}>{t('dayStreakLabel')}</span>
          </div>
        ) : (
          <div className={clsx(style.streak, style['streak--idle'])}>{t('streakNudge')}</div>
        )}
      </div>
      <div className={style['right-nav-actions']}>
        <LanguageSwitcher />
        <A href="https://github.com/mohitkyadav/entumany">
          <Github size={28} />
        </A>
      </div>
    </div>
  );
};

export default DashboardHero;
