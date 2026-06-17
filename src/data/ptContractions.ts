import type {QuizQuestion} from 'components/QuizGame/QuizGame';

/**
 * European Portuguese mandatory contractions of a preposition + a definite article.
 * Note the crasis on `a + a = à` and `a + as = às`.
 */
const PREPOSITIONS = ['de', 'em', 'a', 'por'] as const;
const ARTICLES = ['o', 'a', 'os', 'as'] as const;

type Preposition = (typeof PREPOSITIONS)[number];
type Article = (typeof ARTICLES)[number];

const CONTRACTIONS: Record<Preposition, Record<Article, string>> = {
  a: {a: 'à', as: 'às', o: 'ao', os: 'aos'},
  de: {a: 'da', as: 'das', o: 'do', os: 'dos'},
  em: {a: 'na', as: 'nas', o: 'no', os: 'nos'},
  por: {a: 'pela', as: 'pelas', o: 'pelo', os: 'pelos'},
};

export const buildContractionQuestions = (): QuizQuestion[] =>
  PREPOSITIONS.flatMap((prep) =>
    ARTICLES.map((art) => ({
      answer: CONTRACTIONS[prep][art],
      explanation: `${prep} + ${art} = ${CONTRACTIONS[prep][art]}`,
      id: `pt.contractions.${prep}_${art}`,
      // Distractors are the other contractions of the same preposition, so the
      // player has to get the article agreement right, not just the preposition.
      options: ARTICLES.map((a) => CONTRACTIONS[prep][a]),
      prompt: `${prep} + ${art}`,
    })),
  );
