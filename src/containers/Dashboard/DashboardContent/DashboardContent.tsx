import clsx from 'clsx';
import {Button} from 'components';
import {BookOpen, Languages, Play, Plus, Shuffle} from 'lucide-react';
import React, {FC, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useNavigate} from 'react-router-dom';
import {Tooltip} from 'react-tooltip';
import {PORTUGUESE_PACKS} from 'data/packs/ptPacks';
import {getConjugationMastery} from 'data/pt/conjugation';
import {getVocabMastery} from 'data/pt/srs';
import {getActiveDays, getTotalReviews} from 'services/activity.service';
import {getMasteryForIds} from 'services/progress.service';
import {getStatistics} from 'services/statistics.service';
import {Language} from 'types/db';
import {LanguageFlags, MIN_WORDS_REQUIRED, ROUTES} from 'utils/constants';
import {getLangFlagsString} from 'utils/language';

import ActivityHeatmap from '../ActivityHeatmap/ActivityHeatmap';
import style from './DashboardContent.module.scss';

const PLAY_BUTTON_ID = 'play-button';

interface StatCard {
  link?: string;
  subtitle: string;
  title: string;
  value: number;
}

const DashboardContent: FC = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  const {multilanguageWords, numberOfWords, uniqueLanguages, numberOfWordSets, wordsByLanguage} = getStatistics();

  const packIds = PORTUGUESE_PACKS.flatMap((pack) =>
    pack.games.flatMap((game) => game.buildQuestions().map((q) => q.id ?? '')),
  ).filter(Boolean);
  const packMastery = getMasteryForIds(packIds);
  const conjMastery = getConjugationMastery();
  const vocabMastery = getVocabMastery();
  const mastered = packMastery.mastered + conjMastery.mastered + vocabMastery.mastered;
  const masteryTotal = packMastery.total + conjMastery.total + vocabMastery.total;

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
      subtitle: getLangFlagsString(Array.from(uniqueLanguages)),
      title: t('Languages'),
      value: uniqueLanguages.size,
    },
    {
      link: ROUTES.WORD_LIST,
      subtitle: t('wordSetsLabel'),
      title: t('wordSetsTitle'),
      value: numberOfWordSets,
    },
    {
      link: ROUTES.PORTUGUESE_HUB,
      subtitle: `${t('ofLabel')} ${masteryTotal}`,
      title: t('masteredStatTitle'),
      value: mastered,
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
    <div className={style['dashboard-recent']}>
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
          <p className="fs-16 fw-500">{t('playMatchingButton')}</p>
        </Button>

        <Button leftIcon={<BookOpen size={16} />} onClick={() => navigate(ROUTES.GERMAN_HUB)}>
          <p className="fs-16 fw-500">{t('germanHubButton')}</p>
        </Button>

        <Button leftIcon={<Languages size={16} />} onClick={() => navigate(ROUTES.PORTUGUESE_HUB)}>
          <p className="fs-16 fw-500">{t('portugueseHubButton')}</p>
        </Button>

        <Button leftIcon={<Plus size={16} />} color="secondary" onClick={() => navigate(ROUTES.EDITOR)}>
          <p className="fs-16 fw-500">{t('addNewWordButton')}</p>
        </Button>
      </div>
    </div>
  );
};

export default DashboardContent;
