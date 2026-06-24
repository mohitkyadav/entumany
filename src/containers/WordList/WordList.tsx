import React, {FC, useMemo, useState} from 'react';

import {PageTitle} from 'components';
import {useTranslation} from 'react-i18next';
import {EntumanyDB} from 'services/db.service';
import {Language, WordListItem} from 'types/db';
import {LanguageNames} from 'utils/constants';
import {WordListContent} from './WordListContent/WordListContent';
import {WordListHeader} from './WordListHeader/WordListHeader';

const toEntries = (database: Record<string, any>): WordListItem[][] =>
  Object.entries(database).map(([wordId, word]) => {
    const langs = Object.keys(word);
    const langWords = Object.values(word);

    const saneWords: WordListItem[] = [];
    for (let i = 0; i < langs.length; i++) {
      saneWords.push({id: wordId, lang: langs[i] as Language, word: langWords[i] as string});
    }
    return saneWords;
  });

const WordList: FC = () => {
  const dbInstance = EntumanyDB.getInstance();
  const {t} = useTranslation();

  const [isEditMode, setIsEditMode] = useState(false);
  const [query, setQuery] = useState('');
  // The DB is a mutable singleton; bump this to re-derive the list after a
  // mutation (edit/delete) so the UI reflects the change.
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((key) => key + 1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const words = useMemo(() => toEntries(dbInstance.database), [refreshKey, dbInstance]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredWords = normalizedQuery
    ? words.filter((entry) =>
        entry.some(
          ({word, lang}) =>
            word.toLowerCase().includes(normalizedQuery) || LanguageNames[lang].toLowerCase().includes(normalizedQuery),
        ),
      )
    : words;

  return (
    <div className="page animation-slide-down">
      <PageTitle title={t('wordListTitle')} />
      <WordListHeader
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        query={query}
        setQuery={setQuery}
        hasWords={words.length > 0}
      />
      <WordListContent isEditMode={isEditMode} words={filteredWords} hasWords={words.length > 0} refresh={refresh} />
    </div>
  );
};

export default WordList;
