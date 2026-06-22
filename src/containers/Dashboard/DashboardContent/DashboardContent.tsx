import clsx from 'clsx';
import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';

import {getActiveDays, getTotalReviews} from 'services/activity.service';
import {getStatistics} from 'services/statistics.service';
import {Language} from 'types/db';
import {LanguageFlags, ROUTES} from 'utils/constants';
import {getLangFlagsString} from 'utils/language';

import ActivityHeatmap from '../ActivityHeatmap/ActivityHeatmap';
import style from './DashboardContent.module.scss';

interface StatCard {
  link?: string;
  subtitle: string;
  title: string;
  value: number;
}

const DashboardContent: FC = () => {
  const {t} = useTranslation();

  const {multilanguageWords, numberOfWords, uniqueLanguages, numberOfWordSets, wordsByLanguage} = getStatistics();

  const totalReviews = getTotalReviews();
  const activeDays = getActiveDays();

  const langEntries = Object.entries(wordsByLanguage).sort((a, b) => b[1] - a[1]);
  const maxLangCount = langEntries.reduce((m, [, count]) => Math.max(m, count), 0);

  const statistics: StatCard[] = [
    {
      link: ROUTES.WORD_LIST,
      subtitle: `${multilanguageWords} ${t('multilangWords')}`,
      title: t('Total words'),
      value: numberOfWords,
    },
    {
      link: ROUTES.WORD_LIST,
      subtitle: t('wordSetsLabel'),
      title: t('wordSetsTitle'),
      value: numberOfWordSets,
    },
    {
      subtitle: getLangFlagsString(Array.from(uniqueLanguages)),
      title: t('Languages'),
      value: uniqueLanguages.size,
    },
    {
      subtitle: `${activeDays} ${t('activeDaysLabel')}`,
      title: t('reviewsLabel'),
      value: totalReviews,
    },
  ];

  const renderStatCard = ({title, value, subtitle, link}: StatCard) => {
    const inner = (
      <div className={style['dashboard-recent__stat-card']}>
        <div className={clsx('fw-400', style['dashboard-recent__stat-card__title'])}>{title}</div>
        <div className={style['dashboard-recent__stat-card__value']}>{value.toLocaleString()}</div>
        <div className={style['dashboard-recent__stat-card__subtitle']}>{subtitle}</div>
      </div>
    );
    return link ? (
      <Link to={link} className="unset-a" key={title}>
        {inner}
      </Link>
    ) : (
      <div key={title}>{inner}</div>
    );
  };

  return (
    <div className={style['dashboard-recent']}>
      <h2 className={style['dashboard-recent__heading']}>{t('progressTitle')}</h2>

      <div className={clsx(style['dashboard-recent__stat-container'], 'ls-50 fs-18')}>
        {statistics.map((s) => renderStatCard(s))}
      </div>

      <div className={style['dashboard-recent__panels']}>
        {langEntries.length > 0 && (
          <section className={style['dashboard-recent__panel']}>
            <h3 className={style['dashboard-recent__panel__title']}>{t('wordsByLanguageTitle')}</h3>
            <div className={style['dashboard-recent__langs']}>
              {langEntries.map(([lang, count]) => (
                <div className={style['dashboard-recent__langs__row']} key={lang}>
                  <span className={style['dashboard-recent__langs__flag']}>
                    {LanguageFlags[lang as Language] ?? '🏳️'}
                  </span>
                  <span className={style['dashboard-recent__langs__track']}>
                    <span
                      className={style['dashboard-recent__langs__fill']}
                      style={{width: `${maxLangCount ? Math.round((100 * count) / maxLangCount) : 0}%`}}
                    />
                  </span>
                  <span className={style['dashboard-recent__langs__count']}>{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={style['dashboard-recent__panel']}>
          <h3 className={style['dashboard-recent__panel__title']}>{t('activityTitle')}</h3>
          <ActivityHeatmap />
        </section>
      </div>
    </div>
  );
};

export default DashboardContent;
