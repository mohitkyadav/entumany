import {EntumanyDB} from './db.service';

export const getStatistics = () => {
  const dbInstance = EntumanyDB.getInstance();
  const wordIndexKeys = Object.keys(dbInstance.wordIndex);
  const uniqueLanguages = new Set(wordIndexKeys.map((key) => key.split('|||')[1])).size;
  const numberOfWords = wordIndexKeys.length;

  const multilanguageWords = Object.keys(dbInstance.database).reduce((acc, id) => {
    const values = Object.keys(dbInstance.database[id]);
    acc += values.length >= 3 ? 1 : 0;
    return acc;
  }, 0);

  const numberOfWordSets = Object.keys(dbInstance.database).length;

  return {
    multilanguageWords,
    numberOfWordSets,
    numberOfWords,
    uniqueLanguages,
  };
};
