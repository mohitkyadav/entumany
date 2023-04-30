import React, {FC} from 'react';
import {WordListItem} from 'types/db';
import {LanguageFlags, LanguageNames} from 'utils/constants';

export interface WordListContentProps {
  words: WordListItem[][];
}

export const WordListContent: FC<WordListContentProps> = ({words}) => {
  return (
    <>
      {words.map((saneEntry) => (
        <div key={saneEntry[0].word}>
          {saneEntry.map((entry) => (
            <div key={`${entry.id}-${entry.lang}`}>
              <span title={LanguageNames[entry.lang]}>{LanguageFlags[entry.lang]}</span>
              <p>{entry.word}</p>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
