import clsx from 'clsx';
import {BookOpen, Play, Plus, Shuffle} from 'lucide-react';
import React, {FC, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {buildArticleQuestions} from 'data/deArticles';
import {PORTUGUESE_PACKS} from 'data/packs/ptPacks';
import {getConjugationMastery} from 'data/pt/conjugation';
import {getVocabMastery} from 'data/pt/srs';
import {EntumanyDB} from 'services/db.service';
import {getMasteryForIds} from 'services/progress.service';
import {getStatistics} from 'services/statistics.service';
import {getAllGameWords, wordItemId} from 'services/wordGames.service';
import {MIN_WORDS_REQUIRED, ROUTES} from 'utils/constants';

import style from './DashboardModes.module.scss';

const PLAY_BUTTON_ID = 'play-button';

const ringStyle = (pct: number) => ({
  background: `conic-gradient(var(--color-tertiary) ${pct * 3.6}deg, var(--color-sail-gray-100) 0)`,
});

const DashboardModes: FC = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  const {numberOfWordSets} = getStatistics();
  const isPlayAllowed = numberOfWordSets >= MIN_WORDS_REQUIRED;
  const remaining = Math.max(0, MIN_WORDS_REQUIRED - numberOfWordSets);

  // All mastery figures come from the unified progress engine; computed once
  // per mount since progress only changes while playing (on other pages).
  const {ptMastered, ptTotal, ptPct, dePct, deLabel, wordsMastered} = useMemo(() => {
    const packIds = PORTUGUESE_PACKS.flatMap((pack) =>
      pack.games.flatMap((game) => game.buildQuestions().map((q) => q.id ?? '')),
    ).filter(Boolean);
    const packMastery = getMasteryForIds(packIds);
    const conjMastery = getConjugationMastery();
    const vocabMastery = getVocabMastery();
    const mastered = packMastery.mastered + conjMastery.mastered + vocabMastery.mastered;
    const total = packMastery.total + conjMastery.total + vocabMastery.total;

    const deIds = buildArticleQuestions().map((q) => q.id ?? '');
    const deMastery = getMasteryForIds(deIds);

    const wordIds = getAllGameWords(EntumanyDB.getInstance().database).map((word) => wordItemId(word.wordId));
    const wordMastery = getMasteryForIds(wordIds);

    return {
      deLabel: `${deMastery.mastered}/${deMastery.total}`,
      dePct: deMastery.total ? Math.round((100 * deMastery.mastered) / deMastery.total) : 0,
      ptMastered: mastered,
      ptPct: total ? Math.round((100 * mastered) / total) : 0,
      ptTotal: total,
      wordsMastered: wordMastery.mastered,
    };
  }, []);

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
    ? `${numberOfWordSets} ${t('wordSetsTitle').toLowerCase()} · ${wordsMastered} ${t('masteredLabel')}`
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
          <span className={clsx(style.tile__icon, style['tile__icon--ring'])} style={ringStyle(ptPct)}>
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
          <span className={clsx(style.tile__icon, style['tile__icon--ring'])} style={ringStyle(dePct)}>
            <span className={style.tile__icon__flag}>🇩🇪</span>
          </span>
          <span className={style.tile__body}>
            <span className={style.tile__title}>{t('germanHubButton')}</span>
            <span className={style.tile__status}>
              {deLabel} {t('masteredLabel')}
            </span>
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
