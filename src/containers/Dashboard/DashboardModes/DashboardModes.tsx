import clsx from 'clsx';
import {BookOpen, Play, Plus, Shuffle} from 'lucide-react';
import React, {FC, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {PORTUGUESE_PACKS} from 'data/packs/ptPacks';
import {getConjugationMastery} from 'data/pt/conjugation';
import {getVocabMastery} from 'data/pt/srs';
import {getMasteryForIds} from 'services/progress.service';
import {getStatistics} from 'services/statistics.service';
import {MIN_WORDS_REQUIRED, ROUTES} from 'utils/constants';

import style from './DashboardModes.module.scss';

const PLAY_BUTTON_ID = 'play-button';

const DashboardModes: FC = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  const {numberOfWordSets} = getStatistics();
  const isPlayAllowed = numberOfWordSets >= MIN_WORDS_REQUIRED;
  const remaining = Math.max(0, MIN_WORDS_REQUIRED - numberOfWordSets);

  const packIds = PORTUGUESE_PACKS.flatMap((pack) =>
    pack.games.flatMap((game) => game.buildQuestions().map((q) => q.id ?? '')),
  ).filter(Boolean);
  const packMastery = getMasteryForIds(packIds);
  const conjMastery = getConjugationMastery();
  const vocabMastery = getVocabMastery();
  const ptMastered = packMastery.mastered + conjMastery.mastered + vocabMastery.mastered;
  const ptTotal = packMastery.total + conjMastery.total + vocabMastery.total;
  const ptPct = ptTotal ? Math.round((100 * ptMastered) / ptTotal) : 0;

  // Easter egg: 7 clicks on Play starts the game even without enough word sets.
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

  const playLabel = isPlayAllowed
    ? `${numberOfWordSets} ${t('wordSetsTitle').toLowerCase()}`
    : t('addWordsToPlayShort', {count: remaining});

  return (
    <div className={style.modes}>
      <button
        id={PLAY_BUTTON_ID}
        className={clsx(style.tile, style['tile--primary'], !isPlayAllowed && style['tile--locked'])}
        onClick={() => isPlayAllowed && navigate(ROUTES.PLAYGROUND)}
      >
        <span className={style.tile__icon}>
          <Play size={22} />
        </span>
        <span className={style.tile__body}>
          <span className={style.tile__title}>{t('playButton')}</span>
          <span className={style.tile__status}>{playLabel}</span>
        </span>
      </button>

      <div className={style.modes__grid}>
        <button
          className={clsx(style.tile, !isPlayAllowed && style['tile--locked'])}
          disabled={!isPlayAllowed}
          onClick={() => navigate(ROUTES.MATCHING_GAME)}
        >
          <span className={clsx(style.tile__icon, style['tile__icon--soft'])}>
            <Shuffle size={20} />
          </span>
          <span className={style.tile__body}>
            <span className={style.tile__title}>{t('playMatchingButton')}</span>
            <span className={style.tile__status}>
              {isPlayAllowed ? t('matchingModeLabel') : t('addWordsToPlayShort', {count: remaining})}
            </span>
          </span>
        </button>

        <button className={style.tile} onClick={() => navigate(ROUTES.PORTUGUESE_HUB)}>
          <span
            className={clsx(style.tile__icon, style['tile__icon--ring'])}
            style={{
              background: `conic-gradient(var(--color-tertiary) ${ptPct * 3.6}deg, var(--color-sail-gray-100) 0)`,
            }}
          >
            <span className={style.tile__icon__flag}>🇵🇹</span>
          </span>
          <span className={style.tile__body}>
            <span className={style.tile__title}>{t('portugueseHubButton')}</span>
            <span className={style.tile__status}>
              {ptMastered}/{ptTotal} {t('masteredLabel')}
            </span>
          </span>
        </button>

        <button className={style.tile} onClick={() => navigate(ROUTES.GERMAN_HUB)}>
          <span className={clsx(style.tile__icon, style['tile__icon--soft'])}>
            <span className={style.tile__icon__flag}>🇩🇪</span>
          </span>
          <span className={style.tile__body}>
            <span className={style.tile__title}>{t('germanHubButton')}</span>
            <span className={style.tile__status}>{t('articleGameTitle')}</span>
          </span>
        </button>

        <button className={clsx(style.tile, style['tile--add'])} onClick={() => navigate(ROUTES.EDITOR)}>
          <span className={clsx(style.tile__icon, style['tile__icon--add'])}>
            <Plus size={20} />
          </span>
          <span className={style.tile__body}>
            <span className={style.tile__title}>{t('addNewWordButton')}</span>
            <span className={style.tile__status}>{t('addWordModeLabel')}</span>
          </span>
        </button>

        <button className={style.tile} onClick={() => navigate(ROUTES.WORD_LIST)}>
          <span className={clsx(style.tile__icon, style['tile__icon--soft'])}>
            <BookOpen size={20} />
          </span>
          <span className={style.tile__body}>
            <span className={style.tile__title}>{t('wordListModeTitle')}</span>
            <span className={style.tile__status}>{t('wordListModeLabel')}</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default DashboardModes;
