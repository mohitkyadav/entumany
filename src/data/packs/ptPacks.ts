import type {QuizQuestion} from 'components/QuizGame/QuizGame';

import {buildContractionQuestions} from 'data/ptContractions';
import ptNouns from 'data/ptNouns.json';
import serEstar from 'data/ptSerEstar.json';
import type {LanguagePack, PackGame} from './types';

type PtNoun = {word: string; gender: 'o' | 'a'; en: string};
type SerEstarItem = {sentence: string; en: string; answer: string; options: string[]; explanation: string};

const GENDER_OPTIONS = ['o', 'a'];

const buildGenderQuestions = (): QuizQuestion[] =>
  (ptNouns as PtNoun[]).map((noun) => ({
    answer: noun.gender,
    answerLabel: `${noun.gender} ${noun.word}`,
    id: `pt.gender.${noun.word}`,
    options: GENDER_OPTIONS,
    prompt: noun.word,
    subtitle: noun.en,
  }));

const buildSerEstarQuestions = (): QuizQuestion[] =>
  (serEstar as SerEstarItem[]).map((item) => ({
    answer: item.answer,
    explanation: item.explanation,
    id: `pt.serEstar.${item.sentence}`,
    options: item.options,
    prompt: item.sentence,
    subtitle: item.en,
  }));

const basicsPack: LanguagePack = {
  descKey: 'pack1Desc',
  flag: '🇵🇹',
  games: [
    {
      buildQuestions: buildContractionQuestions,
      descKey: 'contractionsGameDesc',
      flag: '🔗',
      id: 'pt.basics.contractions',
      mode: 'contractions',
      titleKey: 'contractionsGameTitle',
    },
    {
      buildQuestions: buildGenderQuestions,
      descKey: 'genderGameDesc',
      flag: '🆎',
      id: 'pt.basics.gender',
      mode: 'gender',
      titleKey: 'genderGameTitle',
    },
    {
      buildQuestions: buildSerEstarQuestions,
      descKey: 'serEstarGameDesc',
      flag: '⚖️',
      id: 'pt.basics.serEstar',
      mode: 'serEstar',
      promptVariant: 'sentence',
      titleKey: 'serEstarGameTitle',
    },
  ],
  id: 'pt-basics',
  nameKey: 'pack1Name',
};

export const PORTUGUESE_PACKS: LanguagePack[] = [basicsPack];

export const findPack = (packId?: string): LanguagePack | undefined =>
  PORTUGUESE_PACKS.find((pack) => pack.id === packId);

export const findGame = (packId?: string, gameId?: string): {pack: LanguagePack; game: PackGame} | undefined => {
  const pack = findPack(packId);
  const game = pack?.games.find((g) => g.id === gameId);
  if (!pack || !game) return undefined;
  return {game, pack};
};

export const packPath = (packId: string): string => `/pt/${packId}`;
export const gamePath = (packId: string, gameId: string): string => `/pt/${packId}/${gameId}`;
