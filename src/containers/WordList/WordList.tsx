import React, {FC, useState} from 'react';

import {PageTitle} from 'components';
import {EntumanyDB} from 'services/db.service';
import {Language, WordListItem} from 'types/db';
import {WordListContent} from './WordListContent/WordListContent';
import {WordListHeader} from './WordListHeader/WordListHeader';

const WordList: FC = () => {
  const dbInstance = EntumanyDB.getInstance();
  const db = dbInstance.database;

  const [isEditMode, setIsEditMode] = useState(false);

  const words = Object.entries(db).map(([wordId, word]) => {
    const langs = Object.keys(word);
    const langWords = Object.values(word);

    const saneWords: WordListItem[] = [];

    for (let i = 0; i < langs.length; i++) {
      saneWords.push({id: wordId, lang: langs[i] as Language, word: langWords[i] as string});
    }

    return saneWords;
  });

  return (
    <div className="page animation-slide-down">
      <PageTitle title="Your words" />
      <WordListHeader isEditMode={isEditMode} setIsEditMode={setIsEditMode} />
      <WordListContent isEditMode={isEditMode} words={words} />
    </div>
  );
};

export default WordList;
