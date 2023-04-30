import React, {FC} from 'react';
import {WordListItem} from 'types/db';
import {LanguageNames} from 'utils/constants';

import style from './WordListContent.module.scss';

export interface WordListContentProps {
  words: WordListItem[][];
}

export const WordListContent: FC<WordListContentProps> = ({words}) => {
  return (
    <div className={style['word-list-content']}>
      {words.map((saneEntry) => (
        <div key={saneEntry[0].word} className={style['word-list-content__entry']}>
          {saneEntry.map(({id, lang, word}) => (
            <div key={`${id}-${lang}`} className={style['word-list-content__entry__word']}>
              <span title={LanguageNames[lang]} className={style['word-list-content__entry__word__lang']}>
                {LanguageNames[lang]}
              </span>
              <p className={style['word-list-content__entry__word__text']}>{word}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
