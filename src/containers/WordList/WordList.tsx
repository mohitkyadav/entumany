import React, {FC} from 'react';

import {PageTitle} from 'components';
import {EntumanyDB} from 'services/db.service';
import {LanguageFlags} from 'utils/constants';
import {Language} from 'types/db';
import {LanguageNames} from 'utils/constants';

const WordList: FC = () => {
  const dbInstance = EntumanyDB.getInstance();
  const db = dbInstance.database;

  const saneEntries = Object.values(db).map((word) => {
    const langs = Object.keys(word);
    const langWords = Object.values(word);

    const saneWords = [];

    for (let i = 0; i < langs.length; i++) {
      saneWords.push({lang: langs[i] as Language, word: langWords[i] as string});
    }

    return saneWords;
  });

  return (
    <div className="page animation-scale-up">
      <PageTitle title="Your words" />

      {saneEntries.map((saneEntry) => (
        <div key={saneEntry[0].word}>
          {saneEntry.map((entry) => (
            <div>
              <span title={LanguageNames[entry.lang]}>{LanguageFlags[entry.lang]}</span>
              <p>{entry.word}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default WordList;
