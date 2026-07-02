import type {QuizQuestion} from 'components/QuizGame/QuizGame';
import germanNouns from './germanNouns.json';

type GermanNoun = {
  word: string;
  article: string;
  translation: string;
};

const ARTICLE_OPTIONS = ['der', 'die', 'das', '?'];

export const GERMAN_ARTICLES_GAME_ID = 'de.articles';

export const buildArticleQuestions = (): QuizQuestion[] =>
  (germanNouns as GermanNoun[]).map((noun) => ({
    answer: noun.article,
    answerLabel: `${noun.article} ${noun.word}`,
    id: `de.article.${noun.word}`,
    options: ARTICLE_OPTIONS,
    prompt: noun.word,
    subtitle: noun.translation,
  }));
